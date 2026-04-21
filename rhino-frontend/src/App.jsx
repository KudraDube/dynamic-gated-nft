import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import Navbar from "./components/Navbar";
import ConservationBanner from "./components/ConservationBanner";
import Home from "./pages/Home";
import Visit from "./pages/Visit";
import Mint from "./pages/Mint";
import Feed from "./pages/Feed";

export default function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <ConservationBanner />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/visit" element={<Visit />} />
              <Route path="/mint" element={<Mint />} />
              <Route path="/feed" element={<Feed />} />
            </Routes>
          </main>
          <footer className="border-t border-dust/10 py-6 text-center">
            <p className="text-dust/20 text-xs font-mono">
              Save the Rhino NFT · Sepolia Testnet · Built for conservation
            </p>
          </footer>
        </div>
      </BrowserRouter>
    </WalletProvider>
  );
}
