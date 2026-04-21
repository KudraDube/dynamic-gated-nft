// Proxy contract address (deployed to Sepolia)
export const PROXY_ADDRESS = "0xa8c732848b9860ecc6b6953c842f6e60b01fb483";

export const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 in hex

// Happiness tier config - mirrors contract
export const TIER_THRESHOLDS = [5, 15, 30, 50];

export const TIER_INFO = [
  {
    tier: 0,
    name: "Sad, Alone & Endangered",
    mood: "Sad",
    color: "#8a5a1a",
    accentColor: "rgba(138,90,26,0.3)",
  },
  {
    tier: 1,
    name: "Cautious & Slightly Hopeful",
    mood: "Cautious",
    color: "#c8852a",
    accentColor: "rgba(200,133,42,0.3)",
  },
  {
    tier: 2,
    name: "Calm & Grazing",
    mood: "Calm",
    color: "#6abf88",
    accentColor: "rgba(106,191,136,0.3)",
  },
  {
    tier: 3,
    name: "Happy, With a Calf",
    mood: "Happy",
    color: "#4a9e6b",
    accentColor: "rgba(74,158,107,0.3)",
  },
  {
    tier: 4,
    name: "Thriving in a Herd",
    mood: "Thriving",
    color: "#2d6b47",
    accentColor: "rgba(45,107,71,0.3)",
  },
];

export const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs";

export const TIER_IMAGES = [
  `${PINATA_GATEWAY}/bafybeifj42a3ubc7sy6g66x5fi3w5lb4ud6uzlo52dkjij7pbth6ysqlia`,
  `${PINATA_GATEWAY}/bafybeicoznz6u3idgmxnbgtlmgxenmhnllvnomewtfblytq5bbixwv5zhi`,
  `${PINATA_GATEWAY}/bafybeibmyrcpbsg4dthfjd7y6kzbcaai43uz2sszpwrmunkl6j7osqgvoq`,
  `${PINATA_GATEWAY}/bafybeihnxxtcilyq6iuwdd436ce2kwonanr734v3oqya2i5p4w3y54pyxm`,
  `${PINATA_GATEWAY}/bafybeihdxusqwsp7nwzqbhdpjh2z3epnrcqwlhsjlrbrm7kzxx7lyenmeq`,
];

// Minimal ABI — only what the frontend uses
export const RHINO_ABI = [
  // Read
  "function visitCount(address) view returns (uint256)",
  "function hasClaimedFreeMint(address) view returns (bool)",
  "function totalBuys() view returns (uint256)",
  "function getHappinessTier() view returns (uint256)",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function mintPrice() view returns (uint256)",
  "function uri(uint256) view returns (string)",
  // Write
  "function recordVisit(bytes signature) external",
  "function claimFreeMint() external",
  "function mintRhino() external payable",
  // Events
  "event RhinoMinted(address indexed minter, bool wasFree)",
  "event VisitRecorded(address indexed visitor, uint256 newCount)",
  "event HappinessLevelChanged(uint256 newLevel)",
];
