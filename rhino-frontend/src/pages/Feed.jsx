import { useEffect, useState, useCallback, useRef } from "react";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";
import { PROXY_ADDRESS, RHINO_ABI } from "../constants/contract";

const SEPOLIA_RPC = "https://rpc.sepolia.org";
const MAX_FEED = 40;

function shortAddr(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export default function Feed() {
  const { provider } = useWallet();
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const [totalMints, setTotalMints] = useState(0);
  const [freeMints, setFreeMints] = useState(0);
  const contractRef = useRef(null);

  const addEvent = useCallback((minter, wasFree, txHash, blockNumber) => {
    setEvents((prev) => [{ id: txHash + blockNumber, minter, wasFree, txHash, blockNumber, timestamp: Date.now() }, ...prev].slice(0, MAX_FEED));
    setTotalMints((n) => n + 1);
    if (wasFree) setFreeMints((n) => n + 1);
  }, []);

  useEffect(() => {
    const rpcProvider = provider || new ethers.JsonRpcProvider(SEPOLIA_RPC);
    const contract = new ethers.Contract(PROXY_ADDRESS, RHINO_ABI, rpcProvider);
    contractRef.current = contract;

    const loadPast = async () => {
      try {
        const currentBlock = await rpcProvider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 500);
        const pastEvents = await contract.queryFilter(contract.filters.RhinoMinted(), fromBlock, currentBlock);
        const parsed = pastEvents.reverse().slice(0, MAX_FEED).map((e) => ({
          id: e.transactionHash + e.blockNumber,
          minter: e.args.minter,
          wasFree: e.args.wasFree,
          txHash: e.transactionHash,
          blockNumber: e.blockNumber,
          timestamp: Date.now() - (currentBlock - e.blockNumber) * 12000,
        }));
        setEvents(parsed);
        setTotalMints(pastEvents.length);
        setFreeMints(pastEvents.filter((e) => e.args.wasFree).length);
      } catch (err) {
        console.error("Past events error:", err);
      }
    };

    const handleMint = (minter, wasFree, event) => addEvent(minter, wasFree, event.log.transactionHash, event.log.blockNumber);

    loadPast().then(() => { contract.on("RhinoMinted", handleMint); setConnected(true); });
    return () => { contract.off("RhinoMinted", handleMint); setConnected(false); };
  }, [provider, addEvent]);

  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div className="fade-up">
        <span className="tag">Live</span>
        <h1 className="text-4xl font-black text-stone-800 mt-2">Global Mint Feed</h1>
        <p className="text-stone-500 mt-2">Every Rhino NFT minted — free and paid — in real time.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 fade-up-delay-1">
        {[
          { label: "Total Mints", value: totalMints },
          { label: "Free Mints", value: freeMints },
          { label: "Paid Mints", value: totalMints - freeMints },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-ochre">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 fade-up-delay-2">
        <span className={`w-2 h-2 rounded-full ${connected ? "bg-conservation pulse-dot" : "bg-stone-200"}`} />
        <span className="text-stone-400 text-xs font-semibold">
          {connected ? "Listening for new mints on Sepolia…" : "Connecting to network…"}
        </span>
      </div>

      <div className="space-y-3 fade-up-delay-3">
        {events.length === 0 ? (
          <div className="card p-10 text-center space-y-3">
            <p className="text-5xl">🦏</p>
            <p className="text-stone-500 font-bold">No mints found in recent blocks.</p>
            <p className="text-stone-400 text-sm">
              Be the first to mint — head to the{" "}
              <a href="/mint" className="text-ochre font-bold hover:underline">Mint page</a>.
            </p>
          </div>
        ) : (
          events.map((e) => (
            <div key={e.id} className="card-glow p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{e.wasFree ? "🎁" : "💰"}</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-stone-700 text-sm font-semibold">{shortAddr(e.minter)}</span>
                    <span className="text-stone-400 text-xs">minted a Rhino 🦏</span>
                    {e.wasFree
                      ? <span className="text-xs font-bold text-conservation border border-conservation/30 bg-conservation/5 px-2 py-0.5 rounded-full">FREE</span>
                      : <span className="text-xs font-bold text-ochre border border-ochre/30 bg-ochre/5 px-2 py-0.5 rounded-full">PAID</span>
                    }
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-stone-300 text-xs font-mono">Block #{e.blockNumber}</span>
                    <span className="text-stone-200 text-xs">·</span>
                    <a href={`https://sepolia.etherscan.io/tx/${e.txHash}`} target="_blank" rel="noreferrer" className="text-xs text-ochre/60 hover:text-ochre font-mono transition-colors">
                      {e.txHash.slice(0, 10)}… ↗
                    </a>
                  </div>
                </div>
              </div>
              <span className="text-stone-300 text-xs font-mono whitespace-nowrap">{timeAgo(e.timestamp)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}