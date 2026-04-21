import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

function shortAddr(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

export default function Navbar() {
  const { account, connect, disconnect, connecting, isCorrectChain, switchToSepolia } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: "/",      label: "Home",      emoji: "🏠", end: true },
    { to: "/visit", label: "Visit",     emoji: "🌿" },
    { to: "/mint",  label: "Buy NFT",   emoji: "🦏" },
    { to: "/feed",  label: "Live Feed", emoji: "📡" },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b-2 border-ochre/20 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 group" onClick={() => setMenuOpen(false)}>
          <span className="text-3xl">🦏</span>
          <span className="text-ochre text-xl font-black group-hover:text-ochre-light transition-colors">
            RhinoNFT
          </span>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, emoji, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-bold rounded-zoo transition-all duration-150 ${
                  isActive
                    ? "text-ochre bg-ochre/10"
                    : "text-stone-500 hover:text-ochre hover:bg-ochre/5"
                }`
              }
            >
              {emoji} {label}
            </NavLink>
          ))}
        </nav>

        {/* Right side: wallet + hamburger */}
        <div className="flex items-center gap-3">
          {account && !isCorrectChain && (
            <button
              onClick={switchToSepolia}
              className="hidden sm:block text-xs font-bold text-red-500 border border-red-300 px-3 py-1.5 rounded-zoo hover:bg-red-50 transition-colors"
            >
              ⚠ Switch to Sepolia
            </button>
          )}

          {account ? (
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-conservation/10 border border-conservation/30 px-3 py-1.5 rounded-zoo">
                <span className="w-2 h-2 rounded-full bg-conservation pulse-dot" />
                <span className="font-mono text-sm text-stone-600">{shortAddr(account)}</span>
              </div>
              <button onClick={disconnect} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={connect} disabled={connecting} className="hidden md:block btn-primary text-sm py-2 px-5">
              {connecting ? "Connecting…" : "Connect Wallet"}
            </button>
          )}

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-zoo hover:bg-stone-100 transition-colors"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-stone-600 transition-transform duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-stone-600 transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-stone-600 transition-transform duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 px-6 py-4 space-y-1 shadow-lg">
          {navLinks.map(({ to, label, emoji, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 w-full px-4 py-3 rounded-zoo text-sm font-bold transition-all ${
                  isActive
                    ? "text-ochre bg-ochre/10"
                    : "text-stone-600 hover:text-ochre hover:bg-ochre/5"
                }`
              }
            >
              <span className="text-lg">{emoji}</span>
              {label}
            </NavLink>
          ))}

          <div className="border-t border-stone-100 pt-3 mt-2">
            {account ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-conservation/10 rounded-zoo">
                  <span className="w-2 h-2 rounded-full bg-conservation pulse-dot" />
                  <span className="font-mono text-sm text-stone-600">{shortAddr(account)}</span>
                </div>
                {!isCorrectChain && (
                  <button onClick={switchToSepolia} className="w-full text-sm font-bold text-red-500 border border-red-300 px-4 py-2 rounded-zoo hover:bg-red-50">
                    ⚠ Switch to Sepolia
                  </button>
                )}
                <button onClick={() => { disconnect(); setMenuOpen(false); }} className="w-full text-sm text-stone-400 hover:text-stone-600 py-1">
                  Disconnect
                </button>
              </div>
            ) : (
              <button onClick={() => { connect(); setMenuOpen(false); }} disabled={connecting} className="btn-primary w-full">
                {connecting ? "Connecting…" : "Connect Wallet"}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}