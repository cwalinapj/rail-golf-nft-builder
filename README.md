# Rail Golf NFT Builder

Static prototype for a Rail Golf Proof of Shot golf ball design site.

Open `index.html` in a browser to use the builder. The UI supports:

- Solana wallet login through Phantom when available.
- Required QR/Data Matrix style markings on the ball preview.
- UV print design controls for IDs, player text, color, graphics, and code density.
- Metaplex-ready NFT metadata preview.
- A mint button that posts to `/api/mint-metaplex-design` for a production backend.

The production mint service should render the final ball design image, upload the image and JSON metadata to IPFS or Arweave, and mint the NFT with Metaplex on Solana.
