import { useContract } from "../hooks/useContract";
import { useWallet } from "../context/WalletContext";

export default function ConservationBanner() {
  const { isCorrectChain } = useWallet();
  const { ethRaised, totalBuys } = useContract();
  if (!isCorrectChain) return null;
  return (
    <div className="bg-conservation/10 border-b border-conservation/20">
      <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-conservation text-xs font-semibold tracking-widest uppercase">Conservation Impact</span>
          <span className="text-stone-300">|</span>
          <span className="text-conservation font-black text-lg">{parseFloat(ethRaised).toFixed(4)} ETH</span>
          <span className="text-stone-400 text-sm">raised for rhino conservation</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-stone-400">
          <span className="font-mono">{totalBuys}</span>
          <span>total supporters</span>
        </div>
      </div>
    </div>
  );
}