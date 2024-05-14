# Voice-to-Text Anywhere in Chrome with OpenAI Whisper API 🚀

Unlock the power of voice with our Chrome extension! Simply hold `Alt (or option)` key for a second to start and release to stop recording, and let OpenAI's Whisper API transcribe your voice, copying it your clipboard right after it. 🎉

### Features ✨

- **🎤 Instant Voice Transcription:** Use OpenAI's Whisper API to transcribe your voice instantly.
- **🌍 Implicit Translation:** Automatically transcribe and translate your input to English.

### Getting Started 🔧

Follow these steps to run the extension locally in Chrome:

1. **Clone the Repository:** 
    ```sh
    git clone https://github.com/Alireza29675/whisper-anywhere.git
    ```
2. **Install Dependencies:** 
    ```sh
    npm install
    ```
   *(Tested with Node.js v16.5.0. It might also work with later versions, but not the latest.)*
3. **Build the App:** 
    ```sh
    npm run build
    ```
4. **Load the Extension in Chrome:**
    - Open Chrome and navigate to `chrome://extensions`
    - Enable "Developer mode" in the top-right corner
    - Click "Load unpacked" and select the `build` folder

5. **Configure the Extension:** Click the extension's button (microphone icon) to set up.

### API Key Disclaimer 🔑

You'll need an OpenAI account with a valid API key. OpenAI provides free credits, which are sufficient to enjoy the extension's features.

#### Available Scripts

- `npm start`: Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
- `npm run build`: Builds the app for production to the `build` folder.

For more information, refer to the [Create React App documentation](https://create-react-app.dev/docs/getting-started/) and [React documentation](https://facebook.github.io/create-react-app/docs/getting-started).
