import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { useContract } from "../hooks/useContract";
import HappinessBar from "../components/HappinessBar";
import { TIER_IMAGES, TIER_INFO, PROXY_ADDRESS } from "../constants/contract";

export default function Home() {
  const { account, connect, connecting, isCorrectChain } = useWallet();
  const { happinessTier, nftBalance, totalBuys, visitCount, mintPrice, loading } = useContract();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-16">

      {/* ── SECTION 1: NFT Journey (main attraction) ── */}
      <div className="fade-up">
        <div className="text-center mb-10">
          <span className="tag">The Journey</span>
          <h1 className="text-4xl md:text-5xl font-black text-stone-800 mt-3">
            5 NFTs. One Story.
          </h1>
          <p className="text-stone-500 mt-3 max-w-2xl mx-auto text-lg leading-relaxed">
            Your rhino starts sad and alone. As the community buys NFTs together, the whole herd gets happier.
            Every NFT you hold evolves — from a lone endangered rhino to a thriving family of five.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {TIER_INFO.map((tier, i) => {
            const isUnlocked = i <= happinessTier;
            const isCurrent = i === happinessTier;
            return (
              <Link
                to="/mint"
                key={i}
                className={`card p-4 text-center space-y-3 transition-all duration-300 cursor-pointer block ${
                  isCurrent
                    ? "border-2 border-ochre shadow-[0_4px_24px_rgba(200,133,42,0.2)] scale-105"
                    : isUnlocked
                    ? "border-conservation/40 hover:border-conservation"
                    : "hover:border-ochre/30"
                }`}
              >
                <div className="relative">
                  <img
                    src={TIER_IMAGES[i]}
                    alt={tier.name}
                    className="w-full aspect-square object-cover rounded-zoo"
                  />
                  {isCurrent && (
                    <div className="absolute -top-2 -right-2 bg-ochre text-white text-xs font-black px-2 py-0.5 rounded-full shadow">
                      NOW
                    </div>
                  )}
                  {i < happinessTier && (
                    <div className="absolute -top-2 -right-2 bg-conservation text-white text-xs font-black px-2 py-0.5 rounded-full shadow">
                      ✓
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-mono text-stone-400 uppercase tracking-widest">Tier {i}</p>
                  <p className="text-sm font-black text-stone-700 leading-snug mt-0.5">{tier.name}</p>
                </div>
                <div
                  className="h-1.5 rounded-full w-full"
                  style={{ background: isUnlocked ? tier.color : "rgba(0,0,0,0.08)" }}
                />
                <p className="text-xs text-ochre font-bold">Mint this NFT →</p>
              </Link>
            );
          })}
        </div>

        <p className="text-center text-stone-400 text-sm mt-4">
          Tiers evolve as the community mints together — your NFT upgrades automatically when thresholds are crossed
        </p>
      </div>

      {/* ── SECTION 2: Happiness bar ── */}
      <div className="fade-up fade-up-delay-1">
        <HappinessBar />
      </div>

      {/* ── SECTION 3: Call to action ── */}
      <div className="fade-up fade-up-delay-2 card p-8 text-center space-y-6">
        <div>
          <h2 className="text-3xl font-black text-stone-800">Ready to help the herd?</h2>
          <p className="text-stone-500 mt-2 max-w-lg mx-auto">
            Record visits to earn a free NFT, or mint immediately for <strong>{mintPrice} ETH</strong>.
            Every mint funds real rhino conservation and evolves the entire herd.
          </p>
        </div>

        {!account ? (
          <button onClick={connect} disabled={connecting} className="btn-primary text-base px-10 py-4">
            {connecting ? "Connecting…" : "Connect Wallet to Begin 🦏"}
          </button>
        ) : !isCorrectChain ? (
          <p className="text-red-500 font-bold">⚠ Switch to Sepolia testnet to interact</p>
        ) : (
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/visit" className="btn-secondary text-base px-8 py-3.5">
              🌿 Record a Visit
              <span className="block text-xs font-normal opacity-70 mt-0.5">100 visits = free NFT</span>
            </Link>
            <Link to="/mint" className="btn-primary text-base px-8 py-3.5">
              🦏 Buy a Rhino NFT
              <span className="block text-xs font-normal opacity-70 mt-0.5">{mintPrice} ETH · instant</span>
            </Link>
          </div>
        )}
      </div>

      {/* ── SECTION 4: On-chain stats ── */}
      <div className="fade-up fade-up-delay-3">
        <h2 className="text-xl font-black text-stone-700 mb-4">On-Chain Data</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Mints",      value: loading ? "—" : totalBuys,      note: "all time" },
            { label: "Mint Price",        value: loading ? "—" : `${mintPrice} ETH`, note: "per NFT" },
            { label: "Happiness Tier",   value: loading ? "—" : `${happinessTier}/4`, note: TIER_INFO[happinessTier]?.mood },
            { label: "Your NFTs",        value: loading ? "—" : `${nftBalance} 🦏`,  note: account ? "in your wallet" : "connect wallet" },
          ].map(({ label, value, note }) => (
            <div key={label} className="card p-5 text-center">
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-1">{label}</p>
              <p className="text-2xl font-black text-stone-700">{value}</p>
              <p className="text-stone-300 text-xs mt-1">{note}</p>
            </div>
          ))}
        </div>

        {account && isCorrectChain && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {[
              { label: "Your Visits",       value: loading ? "—" : visitCount,           note: "/ 100 for free mint" },
              { label: "Contract",          value: `${PROXY_ADDRESS.slice(0,6)}…${PROXY_ADDRESS.slice(-4)}`, note: "UUPS proxy · Sepolia" },
              { label: "Free Mint",         value: visitCount >= 100 ? "Eligible ✅" : `${100 - visitCount} visits away`, note: "one per wallet" },
            ].map(({ label, value, note }) => (
              <div key={label} className="card p-5 text-center">
                <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-1">{label}</p>
                <p className="text-lg font-black text-stone-700">{value}</p>
                <p className="text-stone-300 text-xs mt-1">{note}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTION 5: How it works ── */}
      <div className="border-t border-stone-200 pt-10 fade-up">
        <h2 className="text-2xl font-black text-stone-800 mb-6">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: "01", emoji: "🌿", title: "Visit the Sanctuary",    body: "Record 100 verified visits to unlock your free Rhino NFT. Each visit is signed by the server and verified on-chain." },
            { step: "02", emoji: "🦏", title: "Buy a Rhino NFT",         body: "Claim your free NFT at 100 visits, or buy immediately for 0.01 ETH on the Mint page. Every purchase raises the herd's happiness." },
            { step: "03", emoji: "🌍", title: "Watch the Herd Thrive",   body: "As total mints cross thresholds, the NFT art evolves for all holders — from a lone sad rhino to a thriving herd of five." },
          ].map(({ step, emoji, title, body }) => (
            <div key={step} className="card-glow p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{emoji}</span>
                <span className="font-mono text-2xl font-black text-ochre/30">{step}</span>
              </div>
              <h3 className="font-black text-lg text-stone-700">{title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}