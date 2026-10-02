# She Makes My House A Home — encrypted GitHub Pages deployment

This public deployment repository contains only ciphertext for the personal video clips and letter text. The passkey is not stored here. The private source repository remains `kamranq0078-glitch/Home`.

The page derives an AES-256-GCM key from the passkey with PBKDF2/SHA-256 (600,000 rounds) in the browser. Without the passkey, visitors can download ciphertext but cannot read the letter or play the clips. Once unlocked, the page decrypts media in memory as each section enters the viewport. Reduced-motion preference leaves the posters static.

GitHub Pages needs to be enabled from Settings → Pages → Build and deployment → Source: GitHub Actions. The included workflow publishes the repository when pushed to `main`.
