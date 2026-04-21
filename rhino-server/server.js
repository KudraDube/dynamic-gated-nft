require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const GATEWAY = "https://gateway.pinata.cloud/ipfs";

// ── Tier metadata ────────────────────────────────────────────────────────────
const TIERS = [
  {
    name: "Rhino #1 — Sad, Alone, Endangered",
    description:
      "This rhino stands alone on a barren plain. Poaching has decimated the herd. With only a handful left, hope is fading. Your support can change this.",
    image: `${GATEWAY}/bafybeifj42a3ubc7sy6g66x5fi3w5lb4ud6uzlo52dkjij7pbth6ysqlia`,
    attributes: [
      { trait_type: "Mood", value: "Sad" },
      { trait_type: "Herd Size", value: "Alone" },
      { trait_type: "Conservation Status", value: "Critically Endangered" },
      { trait_type: "Happiness Tier", value: 0 },
    ],
  },
  {
    name: "Rhino #2 — Cautious, Slightly Hopeful",
    description:
      "A flicker of hope. Anti-poaching patrols have increased and this rhino is cautiously raising its head. The tide may be turning.",
    image: `${GATEWAY}/bafybeicoznz6u3idgmxnbgtlmgxenmhnllvnomewtfblytq5bbixwv5zhi`,
    attributes: [
      { trait_type: "Mood", value: "Cautious" },
      { trait_type: "Herd Size", value: "Pair" },
      { trait_type: "Conservation Status", value: "Endangered" },
      { trait_type: "Happiness Tier", value: 1 },
    ],
  },
  {
    name: "Rhino #3 — Calm, Grazing",
    description:
      "Peace has returned to the savanna. This rhino grazes freely, no longer looking over its shoulder. Your contributions are making a real difference.",
    image: `${GATEWAY}/bafybeibmyrcpbsg4dthfjd7y6kzbcaai43uz2sszpwrmunkl6j7osqgvoq`,
    attributes: [
      { trait_type: "Mood", value: "Calm" },
      { trait_type: "Herd Size", value: "Small Group" },
      { trait_type: "Conservation Status", value: "Vulnerable" },
      { trait_type: "Happiness Tier", value: 2 },
    ],
  },
  {
    name: "Rhino #4 — Happy, With a Calf",
    description:
      "A new life! This rhino mother tends to her calf — a symbol of recovery. The population is growing and the future looks bright.",
    image: `${GATEWAY}/bafybeihnxxtcilyq6iuwdd436ce2kwonanr734v3oqya2i5p4w3y54pyxm`,
    attributes: [
      { trait_type: "Mood", value: "Happy" },
      { trait_type: "Herd Size", value: "Family" },
      { trait_type: "Conservation Status", value: "Recovering" },
      { trait_type: "Happiness Tier", value: 3 },
    ],
  },
  {
    name: "Rhino #5 — Thriving, In a Herd",
    description:
      "Against all odds, the rhino population has flourished. A full herd roams the plains — a testament to what conservation and community can achieve.",
    image: `${GATEWAY}/bafybeihdxusqwsp7nwzqbhdpjh2z3epnrcqwlhsjlrbrm7kzxx7lyenmeq`,
    attributes: [
      { trait_type: "Mood", value: "Thriving" },
      { trait_type: "Herd Size", value: "Full Herd" },
      { trait_type: "Conservation Status", value: "Stable" },
      { trait_type: "Happiness Tier", value: 4 },
    ],
  },
];

// ── Routes ───────────────────────────────────────────────────────────────────

// GET /metadata/:tier — returns NFT metadata JSON for a given tier (0–4)
app.get("/metadata/:tier", (req, res) => {
  const tier = parseInt(req.params.tier);

  if (isNaN(tier) || tier < 0 || tier > 4) {
    return res.status(400).json({ error: "Tier must be an integer between 0 and 4" });
  }

  return res.json(TIERS[tier]);
});

// POST /sign-visit — signs a visit message for a wallet address
// Body: { address: "0x...", nonce: <number> }
// Returns: { signature: "0x..." }
app.post("/sign-visit", async (req, res) => {
  const { address, nonce } = req.body;

  // Validate address
  if (!address || !ethers.isAddress(address)) {
    return res.status(400).json({ error: "Invalid or missing wallet address" });
  }

  // Validate nonce
  if (nonce === undefined || nonce === null || typeof nonce !== "number") {
    return res.status(400).json({ error: "Invalid or missing nonce (must be a number)" });
  }

  // Sign the message
  try {
    const signer = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY);

    // Pack and hash exactly as the contract expects:
    // keccak256(abi.encodePacked(visitor, nonce))
    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "uint256"],
      [address, nonce]
    );

    // Sign the hash (adds Ethereum prefix internally)
    const signature = await signer.signMessage(ethers.getBytes(messageHash));

    return res.json({ signature });
  } catch (err) {
    console.error("Signing error:", err);
    return res.status(500).json({ error: "Failed to sign visit message" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", signerLoaded: !!process.env.SIGNER_PRIVATE_KEY });
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Rhino metadata server running on http://localhost:${PORT}`);
  console.log(`Signer address: ${new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY).address}`);
});