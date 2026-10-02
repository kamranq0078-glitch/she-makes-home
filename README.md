# She Makes My House A Home — encrypted GitHub Pages deployment

This public deployment repository contains only ciphertext for the personal video clips and letter text. The source files and original videos remain in the private `kamranq0078-glitch/Home` repository. The passkey is not stored here.

The page derives an AES-256-GCM key from the passkey with PBKDF2/SHA-256 (600,000 rounds) in the browser. Without the passkey, visitors can download ciphertext but cannot read the letter or play the clips. Once unlocked, the page decrypts media in memory as each section enters the viewport. Reduced-motion preference leaves posters static.

GitHub Pages publishes this branch from the repository root. The page has no trackers or third-party embeds.
