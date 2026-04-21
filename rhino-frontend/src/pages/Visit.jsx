import { useWallet } from "../context/WalletContext";
import { useContract } from "../hooks/useContract";

const VISIT_THRESHOLD = 100;

function shortAddr(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

export default function Visit() {
  const { account, connect, connecting, isCorrectChain } = useWallet();
  const { visitCount, hasClaimedFreeMint, nftBalance, loading, txPending, txError, txSuccess, setTxError, setTxSuccess, recordVisit, claimFreeMint } = useContract();

  const visitsRemaining = Math.max(0, VISIT_THRESHOLD - visitCount);
  const pct = Math.min(100, (visitCount / VISIT_THRESHOLD) * 100);
  const eligible = visitCount >= VISIT_THRESHOLD;

  if (!account) return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-4">
      <p className="text-3xl font-black text-stone-800">Connect your wallet</p>
      <p className="text-stone-400">You need a connected wallet to record visits.</p>
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
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <div className="fade-up">
        <span className="tag">Visit Tracker</span>
        <h1 className="text-4xl font-black text-stone-800 mt-2">Sanctuary Visits</h1>
        <p className="text-stone-500 mt-2">Earn your free Rhino NFT by recording 100 verified visits.</p>
      </div>

      <div className="card p-6 space-y-5 fade-up-delay-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest">Visitor</p>
            <p className="address mt-1">{shortAddr(account)}</p>
          </div>
          <div className="text-right">
            <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest">NFTs Held</p>
            <p className="text-2xl font-black text-ochre mt-1">{loading ? "—" : nftBalance} 🦏</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-stone-700">{visitCount} <span className="text-stone-400">/ {VISIT_THRESHOLD} visits</span></span>
            <span className="text-stone-400">{Math.round(pct)}%</span>
          </div>
          <div className="h-4 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: eligible ? "linear-gradient(90deg,#4a9e6b,#6abf88)" : "linear-gradient(90deg,#8a5a1a,#c8852a)" }}
            />
          </div>
          <p className="text-stone-400 text-xs font-semibold">
            {eligible ? "✅ Visit threshold reached!" : `${visitsRemaining} visit${visitsRemaining !== 1 ? "s" : ""} remaining`}
          </p>
        </div>

        <button onClick={recordVisit} disabled={txPending || loading} className="btn-primary w-full">
          {txPending ? "Recording visit…" : "🌿 Record a Visit"}
        </button>
        <p className="text-stone-400 text-xs text-center">Each visit is signed by the server and verified on-chain.</p>
      </div>

      <div className={`card p-6 space-y-4 fade-up-delay-2 border-2 transition-colors duration-500 ${eligible && !hasClaimedFreeMint ? "border-conservation/50 shadow-[0_4px_24px_rgba(74,158,107,0.12)]" : "border-stone-200"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${hasClaimedFreeMint ? "bg-stone-200" : eligible ? "bg-conservation pulse-dot" : "bg-ochre/30"}`} />
          <h2 className="text-xl font-black text-stone-800">Free Mint Eligibility</h2>
        </div>

        {hasClaimedFreeMint ? (
          <div className="text-center py-4 space-y-2">
            <p className="text-4xl">✅</p>
            <p className="font-black text-lg text-stone-800">Free mint already claimed</p>
            <p className="text-stone-400 text-sm">You can still mint additional NFTs for 0.01 ETH on the Mint page.</p>
          </div>
        ) : eligible ? (
          <div className="space-y-4">
            <div className="bg-conservation/10 border border-conservation/30 rounded-zoo p-4">
              <p className="text-conservation font-black">🎉 You've reached 100 visits!</p>
              <p className="text-stone-500 text-sm mt-1">Claim your free Rhino NFT now. This can only be done once.</p>
            </div>
            <button onClick={claimFreeMint} disabled={txPending} className="btn-conservation w-full">
              {txPending ? "Claiming…" : "Claim Free Rhino NFT 🦏"}
            </button>
          </div>
        ) : (
          <div className="text-center py-4 space-y-2">
            <p className="font-mono text-3xl font-bold text-stone-300">{visitsRemaining}</p>
            <p className="text-stone-400 text-sm font-semibold">visits remaining to unlock free mint</p>
          </div>
        )}
      </div>

      {txSuccess && (
        <div className="bg-conservation/10 border border-conservation/30 rounded-zoo p-4 text-conservation font-semibold text-sm fade-up">
          {txSuccess}
          <button onClick={() => setTxSuccess(null)} className="float-right text-stone-400 hover:text-stone-600">✕</button>
        </div>
      )}
      {txError && (
        <div className="bg-red-50 border border-red-200 rounded-zoo p-4 text-red-500 font-semibold text-sm fade-up">
          {txError}
          <button onClick={() => setTxError(null)} className="float-right text-stone-400 hover:text-stone-600">✕</button>
        </div>
      )}
    </div>
  );
}