const state = {
  wallet: null,
  spinning: false,
  uploadedMarkName: "",
  uploadedMarkUrl: "",
  builtMarkEnabled: false,
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
  textColor: document.querySelector("#textColor"),
  textSize: document.querySelector("#textSize"),
  textFont: document.querySelector("#textFont"),
  ballColorMode: document.querySelector("#ballColorMode"),
  ballBaseColor: document.querySelector("#ballBaseColor"),
  ballSecondColor: document.querySelector("#ballSecondColor"),
  patternSelect: document.querySelector("#patternSelect"),
  patternColor: document.querySelector("#patternColor"),
  customMarkUpload: document.querySelector("#customMarkUpload"),
  enableBuiltMarkButton: document.querySelector("#enableBuiltMarkButton"),
  builtMarkOptions: document.querySelector("#builtMarkOptions"),
  clearUploadButton: document.querySelector("#clearUploadButton"),
  markText: document.querySelector("#markText"),
  markColor: document.querySelector("#markColor"),
  markStyle: document.querySelector("#markStyle"),
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

function ballFill(mode, primary, secondary) {
  if (mode === "split-vertical") {
    return `linear-gradient(90deg, ${primary} 0 50%, ${secondary} 50% 100%)`;
  }

  if (mode === "split-horizontal") {
    return `linear-gradient(180deg, ${primary} 0 50%, ${secondary} 50% 100%)`;
  }

  if (mode === "split-diagonal") {
    return `linear-gradient(135deg, ${primary} 0 50%, ${secondary} 50% 100%)`;
  }

  return `linear-gradient(90deg, ${primary}, ${primary})`;
}

function hexToRgb(hex) {
  const value = String(hex || "").replace("#", "");
  const bigint = parseInt(value.length === 3 ? value.split("").map((char) => char + char).join("") : value, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function patternColorValue(hex) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, 0.26)`;
}

function patternClassName(pattern) {
  return `pattern-${pattern}`;
}

function updatePreview() {
  const ballId = sanitize(els.ballId.value, "RAI-0001").toUpperCase();
  const player = sanitize(els.playerName.value, "Player 1");
  const accent = els.accentColor.value;
  const graphic = els.graphicColor.value;
  const mark = sanitize(els.markText.value, "").slice(0, 4);
  const pattern = els.patternSelect.value;
  const textScale = (Number(els.textSize.value) || 100) / 100;

  els.ballIdPreview.textContent = ballId;
  els.playerPreview.textContent = player;
  els.ballPreview.style.setProperty("--accent", accent);
  els.ballPreview.style.setProperty("--graphic", graphic);
  els.ballPreview.style.setProperty("--text-color", els.textColor.value);
  els.ballPreview.style.setProperty("--text-font", els.textFont.value);
  els.ballPreview.style.setProperty("--ball-id-size", `${(2.1 * textScale).toFixed(2)}rem`);
  els.ballPreview.style.setProperty("--player-size", `${(1.25 * textScale).toFixed(2)}rem`);
  els.ballPreview.style.setProperty("--ball-fill", ballFill(els.ballColorMode.value, els.ballBaseColor.value, els.ballSecondColor.value));
  els.ballPreview.style.setProperty("--pattern-color", patternColorValue(els.patternColor.value));
  els.ballPreview.classList.remove("pattern-none", "pattern-pinstripe", "pattern-chevron", "pattern-hex", "pattern-speckle");
  els.ballPreview.classList.add(patternClassName(pattern));

  els.builtMarkOptions.hidden = !state.builtMarkEnabled;

  if (state.uploadedMarkUrl) {
    els.ballPreview.style.setProperty("--mark-image", `url("${state.uploadedMarkUrl}")`);
    els.customMark.textContent = "";
    els.customMark.classList.add("has-image");
    els.customMark.classList.remove("no-mark");
  } else if (state.builtMarkEnabled && mark) {
    els.ballPreview.style.setProperty("--mark-image", "none");
    els.customMark.textContent = mark;
    els.customMark.style.color = els.markColor.value;
    els.customMark.style.fontWeight = els.markStyle.value;
    els.customMark.classList.remove("has-image");
    els.customMark.classList.remove("no-mark");
  } else {
    els.ballPreview.style.setProperty("--mark-image", "none");
    els.customMark.textContent = "";
    els.customMark.classList.remove("has-image");
    els.customMark.classList.add("no-mark");
  }

  document.documentElement.style.setProperty("--code-pattern", codePattern(els.codeDensity.value));
}

function handleMarkUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (file.type !== "image/png") {
    setStatus("Please upload a transparent PNG mark. Other image formats are not accepted for this print-ready preview.");
    event.target.value = "";
    return;
  }

  if (state.uploadedMarkUrl) {
    URL.revokeObjectURL(state.uploadedMarkUrl);
  }

  state.uploadedMarkName = file.name;
  state.uploadedMarkUrl = URL.createObjectURL(file);
  state.builtMarkEnabled = false;
  updatePreview();
  setStatus(`Custom transparent PNG mark loaded: ${file.name}`);
}

function enableBuiltMark() {
  if (state.uploadedMarkUrl) {
    URL.revokeObjectURL(state.uploadedMarkUrl);
  }

  state.uploadedMarkName = "";
  state.uploadedMarkUrl = "";
  els.customMarkUpload.value = "";
  state.builtMarkEnabled = true;
  if (!els.markText.value.trim()) {
    els.markText.value = "R";
  }
  updatePreview();
  setStatus("Built mark options enabled.");
}

function removeMark() {
  if (state.uploadedMarkUrl) {
    URL.revokeObjectURL(state.uploadedMarkUrl);
  }

  state.uploadedMarkName = "";
  state.uploadedMarkUrl = "";
  state.builtMarkEnabled = false;
  els.markText.value = "";
  els.customMarkUpload.value = "";
  updatePreview();
  setStatus("Custom mark removed.");
}

function buildMetadata() {
  const designName = sanitize(els.designName.value, "Rail Golf Founder Proof Ball");
  const ballId = sanitize(els.ballId.value, "RAI-0001").toUpperCase();
  const player = sanitize(els.playerName.value, "Player 1");

  return {
    name: `Rail Golf ${designName}`,
    symbol: "RGOLF",
    description:
      "A Rail Golf Proof of Shot fundraiser NFT reserving exclusive use of a UV-printed golf ball design for future Rail Golf ball purchases.",
    seller_fee_basis_points: 500,
    image: "ipfs://REPLACE_WITH_RENDERED_BALL_IMAGE",
    animation_url: "ipfs://REPLACE_WITH_OPTIONAL_3D_PREVIEW",
    external_url: "https://railgolf.example/proof-of-shot",
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
      { trait_type: "Text Color", value: els.textColor.value },
      { trait_type: "Text Size", value: `${els.textSize.value}%` },
      { trait_type: "Text Font", value: els.textFont.selectedOptions[0].textContent },
      { trait_type: "Ball Color Mode", value: els.ballColorMode.selectedOptions[0].textContent },
      { trait_type: "Primary Ball Color", value: els.ballBaseColor.value },
      { trait_type: "Secondary Ball Color", value: els.ballSecondColor.value },
      { trait_type: "Ball Pattern", value: els.patternSelect.selectedOptions[0].textContent },
      { trait_type: "Pattern Color", value: els.patternColor.value },
      {
        trait_type: "Custom Mark Source",
        value: state.uploadedMarkName ? "Uploaded transparent PNG" : state.builtMarkEnabled ? "Transparent mark builder" : "No custom mark",
      },
      { trait_type: "Custom Mark", value: state.uploadedMarkName || (state.builtMarkEnabled ? sanitize(els.markText.value, "").slice(0, 4) : "None") },
      { trait_type: "Print Method", value: "UV printed golf ball" },
      { trait_type: "Rights", value: "Exclusive use of this design for future Rail Golf golf ball purchases" },
      { trait_type: "Fundraiser Purpose", value: "Rail Golf MVP course deployment" },
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
          ballColorMode: els.ballColorMode.value,
          primaryBallColor: els.ballBaseColor.value,
          secondaryBallColor: els.ballSecondColor.value,
          textColor: els.textColor.value,
          textSize: Number(els.textSize.value) || 100,
          textFont: els.textFont.value,
          pattern: els.patternSelect.value,
          customMarkSource: state.uploadedMarkName ? "uploaded-png" : state.builtMarkEnabled ? "builder" : "none",
          customMark: state.uploadedMarkName || (state.builtMarkEnabled ? sanitize(els.markText.value, "").slice(0, 4) : ""),
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
  state.spinning = !state.spinning;
  els.ballPreview.classList.toggle("spinning", state.spinning);
  els.rotateButton.classList.toggle("active", state.spinning);
  els.rotateButton.setAttribute("aria-pressed", String(state.spinning));
}

[
  els.ballId,
  els.playerName,
  els.accentColor,
  els.graphicColor,
  els.textColor,
  els.textSize,
  els.textFont,
  els.ballColorMode,
  els.ballBaseColor,
  els.ballSecondColor,
  els.patternSelect,
  els.patternColor,
  els.markText,
  els.markColor,
  els.markStyle,
  els.codeDensity,
].forEach((input) => input.addEventListener("input", updatePreview));

els.customMarkUpload.addEventListener("change", handleMarkUpload);
els.enableBuiltMarkButton.addEventListener("click", enableBuiltMark);
els.clearUploadButton.addEventListener("click", removeMark);
els.walletButton.addEventListener("click", connectWallet);
els.metadataButton.addEventListener("click", previewMetadata);
els.mintButton.addEventListener("click", mintDesign);
els.rotateButton.addEventListener("click", rotateBall);

updatePreview();
