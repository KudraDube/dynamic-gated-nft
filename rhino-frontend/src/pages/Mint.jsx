import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { useContract } from "../hooks/useContract";
import HappinessBar from "../components/HappinessBar";
import { TIER_IMAGES, TIER_INFO } from "../constants/contract";

export default function Mint() {
  const { account, connect, connecting, isCorrectChain } = useWallet();
  const { happinessTier, nftBalance, mintPrice, visitCount, hasClaimedFreeMint, loading, txPending, txError, txSuccess, setTxError, setTxSuccess, mintRhino, claimFreeMint } = useContract();

  const tierInfo = TIER_INFO[happinessTier];
  const eligibleFree = visitCount >= 100 && !hasClaimedFreeMint;

  if (!account) return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-4">
      <p className="text-3xl font-black text-stone-800">Connect your wallet</p>
      <p className="text-stone-400">You need a connected wallet to mint.</p>
      <button onClick={connect} disabled={connecting} className="btn-primary mt-4">{connecting ? "Connecting…" : "Connect Wallet"}</button>
    </div>
  );

  if (!isCorrectChain) return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-4">
      <p className="text-3xl font-black text-stone-800">Wrong Network</p>
      <p className="text-stone-400">Please switch to Sepolia testnet.</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      <div className="fade-up">
        <span className="tag">NFT Mint</span>
        <h1 className="text-4xl font-black text-stone-800 mt-2">Mint a Rhino</h1>
        <p className="text-stone-500 mt-2">Every mint increases the herd's happiness and funds conservation.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4 fade-up-delay-1">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl opacity-20 rounded-zoo" style={{ background: tierInfo.accentColor }} />
            <img src={TIER_IMAGES[happinessTier]} alt={tierInfo.name} className="relative w-full aspect-square object-cover rounded-zoo border border-stone-200 shadow-xl" />
            <div className="absolute top-3 left-3">
              <span className="tag bg-white/90">Tier {happinessTier}</span>
            </div>
          </div>
          <div className="card p-4 space-y-1">
            <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest">You are minting</p>
            <p className="text-xl font-black text-stone-800">{tierInfo.name}</p>
            <p className="text-stone-500 text-sm">Mood changes as total mints cross thresholds. The artwork evolves for all holders.</p>
          </div>
        </div>

        <div className="space-y-4 fade-up-delay-2">
          <div className="card p-5">
            <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-1">Your NFT Balance</p>
            <div className="flex items-end gap-2">
              <p className="text-5xl font-black text-ochre">{loading ? "—" : nftBalance}</p>
              <p className="text-stone-400 text-lg mb-1">Rhino NFT{nftBalance !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {eligibleFree && (
            <div className="card p-5 border-2 border-conservation/40 shadow-[0_4px_24px_rgba(74,158,107,0.10)] space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-conservation pulse-dot" />
                <p className="font-black text-conservation">Free Mint Available!</p>
              </div>
              <p className="text-stone-500 text-sm">You've reached 100 visits. No ETH required.</p>
              <button onClick={claimFreeMint} disabled={txPending} className="btn-conservation w-full">
                {txPending ? "Claiming…" : "Claim Free Rhino NFT 🦏"}
              </button>
            </div>
          )}

          <div className="card p-5 space-y-4">
            <div>
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-1">Paid Mint</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-stone-800">{mintPrice} ETH</p>
                <p className="text-stone-400 text-sm">per NFT</p>
              </div>
            </div>
            <p className="text-stone-500 text-sm">Open to everyone. All proceeds go toward rhino conservation.</p>
            <button onClick={mintRhino} disabled={txPending} className="btn-primary w-full">
              {txPending ? "Minting…" : `🦏 Mint for ${mintPrice} ETH`}
            </button>
          </div>

          {!eligibleFree && !hasClaimedFreeMint && (
            <div className="border-2 border-dashed border-stone-200 rounded-zoo p-4 text-center space-y-2">
              <p className="text-stone-400 text-sm font-semibold">
                {visitCount < 100 ? `${100 - visitCount} more visits to unlock your free mint` : "Free mint already claimed"}
              </p>
              {visitCount < 100 && <Link to="/visit" className="text-ochre text-sm font-bold hover:underline">Go record visits →</Link>}
            </div>
          )}
        </div>
      </div>

      <div className="fade-up-delay-3"><HappinessBar /></div>

      {txSuccess && (
        <div className="bg-conservation/10 border border-conservation/30 rounded-zoo p-4 text-conservation font-semibold text-sm">
          {txSuccess}
          <button onClick={() => setTxSuccess(null)} className="float-right text-stone-400 hover:text-stone-600">✕</button>
        </div>
      )}
      {txError && (
        <div className="bg-red-50 border border-red-200 rounded-zoo p-4 text-red-500 font-semibold text-sm">
          {txError}
          <button onClick={() => setTxError(null)} className="float-right text-stone-400 hover:text-stone-600">✕</button>
        </div>
      )}
    </div>
  );
}