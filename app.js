const state = {
  wallet: null,
  rotation: 0,
};

const els = {
  walletButton: document.querySelector("#walletButton"),
  mintButton: document.querySelector("#mintButton"),
  metadataButton: document.querySelector("#metadataButton"),
  rotateButton: document.querySelector("#rotateButton"),
  ballPreview: document.querySelector("#ballPreview"),
  ballId: document.querySelector("#ballId"),
  ballIdPreview: document.querySelector("#ballIdPreview"),
  playerName: document.querySelector("#playerName"),
  playerPreview: document.querySelector("#playerPreview"),
  designName: document.querySelector("#designName"),
  accentColor: document.querySelector("#accentColor"),
  graphicColor: document.querySelector("#graphicColor"),
  customMarkSelect: document.querySelector("#customMarkSelect"),
  customMark: document.querySelector("#customMark"),
  codeDensity: document.querySelector("#codeDensity"),
  rightsAcknowledged: document.querySelector("#rightsAcknowledged"),
  statusBox: document.querySelector("#statusBox"),
  metadataOutput: document.querySelector("#metadataOutput"),
};

function truncateAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function getProvider() {
  const provider = window.solana;
  return provider && provider.isPhantom ? provider : null;
}

async function connectWallet() {
  const provider = getProvider();
  if (!provider) {
    setStatus("Phantom wallet was not found. Install Phantom or wire this button to your preferred Solana wallet adapter.");
    return;
  }

  try {
    const response = await provider.connect();
    state.wallet = response.publicKey.toString();
    els.walletButton.textContent = truncateAddress(state.wallet);
    els.walletButton.classList.add("connected");
    setStatus(`Wallet connected: ${state.wallet}`);
  } catch (error) {
    setStatus(`Wallet connection cancelled: ${error.message}`);
  }
}

function sanitize(value, fallback) {
  const clean = String(value || "").trim();
  return clean || fallback;
}

function codePattern(density) {
  const size = Math.max(24, Math.min(62, Number(density) || 42));
  const stop = Math.round(size / 7);
  return `
    linear-gradient(90deg, #111 ${stop}%, transparent ${stop}% 100%),
    linear-gradient(0deg, #111 ${stop + 4}%, transparent ${stop + 4}% 100%),
    linear-gradient(45deg, transparent 0 34%, #111 34% 43%, transparent 43% 100%),
    linear-gradient(135deg, transparent 0 48%, #111 48% 57%, transparent 57% 100%)
  `;
}

function updatePreview() {
  const ballId = sanitize(els.ballId.value, "RAI-0001").toUpperCase();
  const player = sanitize(els.playerName.value, "Player 1");
  const accent = els.accentColor.value;
  const graphic = els.graphicColor.value;
  const mark = els.customMarkSelect.value;

  els.ballIdPreview.textContent = ballId;
  els.playerPreview.textContent = player;
  els.customMark.textContent = mark;
  els.ballPreview.style.setProperty("--accent", accent);
  els.ballPreview.style.setProperty("--graphic", graphic);
  document.documentElement.style.setProperty("--code-pattern", codePattern(els.codeDensity.value));
}

function buildMetadata() {
  const designName = sanitize(els.designName.value, "Golf Rai Founder Proof Ball");
  const ballId = sanitize(els.ballId.value, "RAI-0001").toUpperCase();
  const player = sanitize(els.playerName.value, "Player 1");

  return {
    name: `Golf Rai ${designName}`,
    symbol: "GRAI",
    description:
      "A Golf Rai Proof of Shot fundraiser NFT reserving exclusive use of a UV-printed golf ball design for future Golf Rai ball purchases.",
    seller_fee_basis_points: 500,
    image: "ipfs://REPLACE_WITH_RENDERED_BALL_IMAGE",
    animation_url: "ipfs://REPLACE_WITH_OPTIONAL_3D_PREVIEW",
    external_url: "https://golfrai.example/proof-of-shot",
    properties: {
      category: "image",
      files: [
        {
          uri: "ipfs://REPLACE_WITH_RENDERED_BALL_IMAGE",
          type: "image/png",
        },
      ],
      creators: [
        {
          address: state.wallet || "WALLET_NOT_CONNECTED",
          share: 100,
        },
      ],
    },
    attributes: [
      { trait_type: "Protocol", value: "Proof of Shot" },
      { trait_type: "Required Marking", value: "QR/Data Matrix code design" },
      { trait_type: "Human Readable ID", value: ballId },
      { trait_type: "Player or Collection", value: player },
      { trait_type: "Accent Color", value: els.accentColor.value },
      { trait_type: "Graphic Color", value: els.graphicColor.value },
      { trait_type: "Custom Mark", value: els.customMarkSelect.selectedOptions[0].textContent },
      { trait_type: "Print Method", value: "UV printed golf ball" },
      { trait_type: "Rights", value: "Exclusive use of this design for future Golf Rai golf ball purchases" },
      { trait_type: "Fundraiser Purpose", value: "Golf Rai MVP course deployment" },
    ],
  };
}

function setStatus(message) {
  els.statusBox.textContent = message;
}

function previewMetadata() {
  updatePreview();
  const metadata = buildMetadata();
  els.metadataOutput.textContent = JSON.stringify(metadata, null, 2);
  setStatus("Metaplex-ready metadata preview generated. Replace the IPFS placeholders during production minting.");
}

async function mintDesign() {
  updatePreview();

  if (!state.wallet) {
    setStatus("Connect a Solana wallet before minting the design NFT.");
    return;
  }

  if (!els.rightsAcknowledged.checked) {
    setStatus("Please acknowledge the exclusive design-use terms before minting.");
    return;
  }

  const metadata = buildMetadata();
  els.metadataOutput.textContent = JSON.stringify(metadata, null, 2);
  setStatus("Preparing mint request...");

  try {
    const response = await fetch("/api/mint-metaplex-design", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet: state.wallet,
        metadata,
        design: {
          ballId: sanitize(els.ballId.value, "RAI-0001").toUpperCase(),
          qrDataMatrixRequired: true,
          exclusiveUseAcknowledged: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Mint endpoint is not configured yet.");
    }

    const result = await response.json();
    setStatus(`Mint submitted: ${result.signature || "signature pending"}`);
  } catch (error) {
    setStatus(
      "Frontend is ready. Add a backend at /api/mint-metaplex-design to upload the rendered design to IPFS/Arweave and mint the Solana Metaplex NFT."
    );
  }
}

function rotateBall() {
  state.rotation += 60;
  els.ballPreview.style.setProperty("--rotation", `${state.rotation}deg`);
}

[
  els.ballId,
  els.playerName,
  els.accentColor,
  els.graphicColor,
  els.customMarkSelect,
  els.codeDensity,
].forEach((input) => input.addEventListener("input", updatePreview));

els.walletButton.addEventListener("click", connectWallet);
els.metadataButton.addEventListener("click", previewMetadata);
els.mintButton.addEventListener("click", mintDesign);
els.rotateButton.addEventListener("click", rotateBall);

updatePreview();
