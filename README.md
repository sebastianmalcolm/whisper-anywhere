# Voice-to-Text Anywhere in Chrome with OpenAI Whisper API 🚀

Unlock the power of voice with our Chrome extension! Simply press `Ctrl + Alt + R` to start or stop recording, and let OpenAI's Whisper API transcribe your voice, pasting the text right where you need it. 🎉

### Features ✨

- **🎤 Instant Voice Transcription:** Use OpenAI's Whisper API to transcribe your voice instantly.
- **⌨ Customizable Shortcuts:** Quickly start/stop recording with a configurable keyboard shortcut.
- **🔧 Custom Prompts:** Tailor the API's voice recognition with personalized prompts.
- **💬 Multiple Contexts:** Support for multiple Whisper API prompts for versatile use cases.
- **🌍 Implicit Translation:** Automatically transcribe and translate your input to English.
- **💾 Save Transcriptions:** Download your transcriptions as sound files for future use.
- **🌐 ChatGPT Compatibility:** Works with main inputs on chat.openai.com (Not tested in this fork).
- **📌 Snippets Feature (Beta):** Quickly paste frequently used text in the ChatGPT text area (Not tested in this fork).

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
