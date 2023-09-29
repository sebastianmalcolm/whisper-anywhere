## Voice-to-Text (almost) anywhere in Chrome using OpenAI Whisper API 🚀

Just click ctrl+alt+r to start/stop recording and the extension will use OpenAI Whisper API to transcribe your voice and paste the transcription at the current caret position. 🎉

This repository is a fork of https://github.com/Ordinath/Whisper_to_ChatGPT  
I don't know much about web development, and I've spent only a few hours on this extension, so it might still be a little buggy and slow, but mostly it works!

## ✨ Features

- 🎤 Record and transcribe your voice on-the-fly using OpenAI's Whisper API
- ⌨ Configurable keyboard shortcut to quickly start/stop the recording.
- 🔧 Customize the prompt for better API voice recognition results
- 💬 Support for multiple Whisper API prompts for versatile transcription contexts
- 🌍 Implicit translation support for transcribing and translating your input to English
- 💾 Download your transcriptions as sound files for further use
- 🌐 Use the extension with main inputs on chat.openai.com and edit-inputs (Not tested in this fork).
- 📌 Snippets feature (in beta) for quickly pasting frequently used text in the ChatGPT text area (Not tested in this fork).

## 🔧 How to Build and Run Locally

To run the extension locally in your Chrome browser, follow these steps:

1. Download or clone the repository from GitHub: `git clone https://github.com/redocrepus/Whisper-Paste.git`
2. Install the dependencies by running `npm install` in the project folder **(I've verify that it works with Node.JS v16.5.0, but it also might work with later versions. It did not work for me with the latest version.)**
3. Run `npm run build` to build the app for production to the build folder
4. Open Google Chrome and navigate to chrome://extensions
5. Enable "Developer mode" by toggling the switch in the top-right corner
6. Click on "Load unpacked" button and select the build folder created in step 3
7. The extension should now appear in your list of installed extensions
8. Click the extension's button (microphone) to configure.

## 🔑 API Key Disclaimer

This extension requires an OpenAI account with a valid API key to function properly. OpenAI provides a small amount of free credits for all accounts, which is more than enough to use the Whisper API in ChatGPT and enjoy the extension's features.

## 📣 Feedback and Contributions

Feel free to open issues, submit pull requests, or just reach out for any reason.

Enjoy dictating!

## 🛠️ Development
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# Available Scripts
1. `npm start` : Runs the app in development mode, open http://localhost:3000 to view it in your browser
2. `npm run build` : Builds the app for production to the build folder
For more information, refer to the [Create React App documentation](https://create-react-app.dev/docs/getting-started/) and [React documentation](https://facebook.github.io/create-react-app/docs/getting-started).
