import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";
import { PROXY_ADDRESS, RHINO_ABI, TIER_THRESHOLDS, SERVER_URL } from "../constants/contract";

export function useContract() {
  const { account, provider, signer, isCorrectChain } = useWallet();

  const [contractData, setContractData] = useState({
    visitCount: 0,
    hasClaimedFreeMint: false,
    totalBuys: 0,
    happinessTier: 0,
    nftBalance: 0,
    mintPrice: "0.01",
    ethRaised: "0",
  });
  const [loading, setLoading] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const [txError, setTxError] = useState(null);
  const [txSuccess, setTxSuccess] = useState(null);

  const getReadContract = useCallback(() => {
    if (!provider) return null;
    return new ethers.Contract(PROXY_ADDRESS, RHINO_ABI, provider);
  }, [provider]);

  const getWriteContract = useCallback(() => {
    if (!signer) return null;
    return new ethers.Contract(PROXY_ADDRESS, RHINO_ABI, signer);
  }, [signer]);

  const fetchData = useCallback(async () => {
    if (!provider || !isCorrectChain) return;
    setLoading(true);
    try {
      const contract = getReadContract();

      const [totalBuys, happinessTier, ethBalance, mintPrice] =
        await Promise.all([
          contract.totalBuys(),
          contract.getHappinessTier(),
          provider.getBalance(PROXY_ADDRESS),
          contract.mintPrice(),
        ]);

      let visitCount = 0n;
      let hasClaimedFreeMint = false;
      let nftBalance = 0n;

      if (account) {
        [visitCount, hasClaimedFreeMint, nftBalance] = await Promise.all([
          contract.visitCount(account),
          contract.hasClaimedFreeMint(account),
          contract.balanceOf(account, 0),
        ]);
      }

      setContractData({
        visitCount: Number(visitCount),
        hasClaimedFreeMint,
        totalBuys: Number(totalBuys),
        happinessTier: Number(happinessTier),
        nftBalance: Number(nftBalance),
        mintPrice: ethers.formatEther(mintPrice),
        ethRaised: ethers.formatEther(ethBalance),
      });
    } catch (err) {
      console.error("fetchData error:", err);
    } finally {
      setLoading(false);
    }
  }, [provider, account, isCorrectChain, getReadContract]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const recordVisit = useCallback(async () => {
    if (!signer || !account) return;
    setTxPending(true);
    setTxError(null);
    setTxSuccess(null);
    try {
      // Get current visitCount from chain to use as nonce
      const contract = getReadContract();
      const currentVisits = Number(await contract.visitCount(account));

      // Request signature from server
      const res = await fetch(`${SERVER_URL}/sign-visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: account, nonce: currentVisits }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Server signing failed");
      }

      const { signature } = await res.json();

      // Send tx
      const writeContract = getWriteContract();
      const tx = await writeContract.recordVisit(signature);
      await tx.wait();

      setTxSuccess("Visit recorded! 🦏");
      await fetchData();
    } catch (err) {
      setTxError(err.reason || err.message || "Transaction failed");
    } finally {
      setTxPending(false);
    }
  }, [signer, account, getReadContract, getWriteContract, fetchData]);

  const claimFreeMint = useCallback(async () => {
    if (!signer) return;
    setTxPending(true);
    setTxError(null);
    setTxSuccess(null);
    try {
      const writeContract = getWriteContract();
      const tx = await writeContract.claimFreeMint();
      await tx.wait();
      setTxSuccess("Free Rhino NFT claimed! 🎉");
      await fetchData();
    } catch (err) {
      setTxError(err.reason || err.message || "Transaction failed");
    } finally {
      setTxPending(false);
    }
  }, [signer, getWriteContract, fetchData]);

  const mintRhino = useCallback(async () => {
    if (!signer) return;
    setTxPending(true);
    setTxError(null);
    setTxSuccess(null);
    try {
      const writeContract = getWriteContract();
      const price = ethers.parseEther(contractData.mintPrice);
      const tx = await writeContract.mintRhino({ value: price });
      await tx.wait();
      setTxSuccess("Rhino NFT minted! 🦏 Thank you for your contribution.");
      await fetchData();
    } catch (err) {
      setTxError(err.reason || err.message || "Transaction failed");
    } finally {
      setTxPending(false);
    }
  }, [signer, getWriteContract, fetchData, contractData.mintPrice]);

  // Helper: progress to next tier
  const tierProgress = useCallback(() => {
    const { totalBuys, happinessTier } = contractData;
    if (happinessTier >= 4) return { current: totalBuys, target: totalBuys, pct: 100, nextTier: 4 };
    const target = TIER_THRESHOLDS[happinessTier];
    const prev = happinessTier > 0 ? TIER_THRESHOLDS[happinessTier - 1] : 0;
    const pct = Math.min(100, Math.round(((totalBuys - prev) / (target - prev)) * 100));
    return { current: totalBuys, target, pct, nextTier: happinessTier + 1 };
  }, [contractData]);

  return {
    ...contractData,
    loading,
    txPending,
    txError,
    txSuccess,
    setTxError,
    setTxSuccess,
    recordVisit,
    claimFreeMint,
    mintRhino,
    tierProgress,
    refetch: fetchData,
  };
}
