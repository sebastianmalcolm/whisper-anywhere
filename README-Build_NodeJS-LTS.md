# README-Build_NodeJS-LTS.md

## Building Whisper-Paste with Latest Stable Node.js Version

Steps to reproduce:
1. Install `nvm` (Node Version Manager) by running the following command:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
   ```
   Then, load `nvm` into your shell:
   ```bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
   ```
2. Ensure `nvm` is set to use the Node.js version specified in the `.nvmrc` file:
   ```bash
   nvm install
   ```
3. Run `npm install` to install dependencies.
4. Run `npm run build` to compile the extension.
