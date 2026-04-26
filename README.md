# Rail Golf NFT Builder

Static prototype for a Rail Golf Proof of Shot golf ball design site.

Open `index.html` in a browser to use the builder. The UI supports:

- Solana wallet login through Phantom when available.
- Required QR/Data Matrix style markings on the ball preview.
- UV print design controls for IDs, player text, ball color, 50/50 color splits, patterns, graphics, and code density.
- Transparent custom mark previews from PNG upload or the built-in mark builder.
- Metaplex-ready NFT metadata preview.
- A mint button that posts to `/api/mint-metaplex-design` for a production backend.

The production mint service should render the final ball design image, upload the image and JSON metadata to IPFS or Arweave, and mint the NFT with Metaplex on Solana.
