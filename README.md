# Voice-to-Text Anywhere in Chrome with AI Speech Recognition 🚀

Unlock the power of voice with our Chrome extension! Simply hold `Alt (or option)` key for a second to start and release to stop recording, and let advanced AI models transcribe your voice, copying it to your clipboard right after. 🎉

## Supported AI Providers 🤖

The extension now supports multiple AI providers for speech recognition:

### OpenAI Whisper
- Industry-standard speech recognition
- Multilingual support
- Translation capabilities
- Cost: $0.006 per minute

### Groq
- Ultra-fast processing
- High accuracy with Whisper Large v3
- Multiple model options
- Cost: From $0.02 per minute

## Provider Comparison 📊

| Feature | OpenAI | Groq |
|---------|--------|------|
| Speed | 1x (baseline) | Up to 250x faster |
| Languages | 100+ | 100+ |
| Translation | ✅ | ✅ (selected models) |
| Text Enhancement | ✅ | ✅ |
| JSON Output | ✅ | ✅ |
| Min. Billing | None | 10 seconds |
| File Size Limit | 25MB | 25MB |

### Screenshots 📸

<div style="display: flex;">
    <img src="./screenshots/1.png" width="640" height="400" alt="Whisper Anywhere" style="flex: 1;">
    <img src="./screenshots/2.png" width="640" height="400" alt="Whisper Anywhere" style="flex: 1;">
    <img src="./screenshots/3.png" width="640" height="400" alt="Whisper Anywhere" style="flex: 1;">
    <img src="./screenshots/4.png" width="640" height="400" alt="Whisper Anywhere" style="flex: 1;">
</div>

## Getting Started 🔧

Follow these steps to run the extension locally in Chrome:

1. **Clone the Repository:**  
   ```sh
   git clone https://github.com/sebastianmalcolm/whisper-anywhere.git
   ```
2. **Install Node Version Manager (nvm):**
   - Run the following command to install nvm:
     ```bash
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
     ```
   - Load nvm into your shell:
     ```bash
     export NVM_DIR="$HOME/.nvm"
     [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
     ```

3. **Install the Node.js version specified in the .nvmrc file:**
   ```bash
   nvm install
   ```

4. **Install Dependencies:**  
   ```sh
   npm install  
   ```
5. **Build the App:**  
   ```sh
   npm run build
   ```
6. **Load the Extension in Chrome:**  
   - Open Chrome and navigate to `chrome://extensions`  
   - Enable "Developer mode" in the top-right corner  
   - Click "Load unpacked" and select the `build` folder
7. **Configure the Extension:** Click the extension's button (microphone icon) to set up.

## Configuration Guide 🔧

### Provider Selection
1. Click the extension icon to open settings
2. Choose your preferred provider
3. Enter your API key
4. Optional: Configure provider-specific settings

### Provider-Specific Settings

#### OpenAI
- API Key: Get from [OpenAI Platform](https://platform.openai.com)
- Model: Whisper-1 (default)
- Optional: Custom prompt template

#### Groq
- API Key: Get from [Groq Console](https://console.groq.com)
- Models:
  - Whisper Large V3 (best quality)
  - Whisper Large V3 Turbo (balanced)
  - Distil-Whisper English (fastest)
- Optional: JSON mode for structured output

## Troubleshooting Guide 🔍

### Common Issues

1. **Recording Not Starting**
   - Check microphone permissions in Chrome
   - Ensure Alt key is held for at least 1 second

2. **API Errors**
   - Verify API key is correct
   - Check provider status page
   - Ensure file size is under 25MB

3. **Translation Issues**
   - Verify selected model supports translation
   - Check source language is supported

4. **Performance Issues**
   - Try a faster model (e.g., Groq's Distil-Whisper)
   - Check network connection
   - Reduce recording length

### Provider-Specific Issues

#### OpenAI
- Rate limiting: Wait a few minutes and try again
- Token expiration: Regenerate API key
- Billing issues: Check OpenAI dashboard

#### Groq
- JSON validation errors: Check prompt format
- Streaming issues: Disable streaming in settings
- Model availability: Try alternative model

## Available Scripts

- `npm start`: Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
- `npm run build`: Builds the app for production to the `build` folder.

For more information, refer to the [Create React App documentation](https://create-react-app.dev/docs/getting-started/) and [React documentation](https://facebook.github.io/create-react-app/docs/getting-started).

### Additional Information
For build instructions specific to the current branch of this codebase, see [README-Build_NodeJS-LTS.md](README-Build_NodeJS-LTS.md).
