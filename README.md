# MetaMouths: AI Persona Debates

**Two AIs. One Topic. Infinite Banter.**

MetaMouths is a dynamic web application that pits two AI-powered personas against each other in a debate, discussion, or a no-holds-barred roast battle. Choose from a diverse cast of iconic personalities, give them a topic, and watch the conversation unfold in real-time, complete with unique voices and personalities.

## ✨ Features

*   **Diverse Cast of Personas:** Select two combatants from a roster of historical figures, modern icons, and fictional characters like Elon Musk, Taylor Swift, Shakespeare, Batman, and more.
*   **Multiple Conversation Modes:**
    *   **Banter:** A classic debate on any topic you choose.
    *   **Instant Roast:** The personas engage in a witty and merciless roast battle.
    *   **18+ Vulgar Roast:** An uncensored, no-holds-barred roast for mature audiences.
*   **Dynamic Interruptions:** Spice up the conversation by triggering a random third persona to interrupt the debate, changing the dynamic completely.
*   **Text-to-Speech:** Each persona has a distinct, AI-generated voice that brings the conversation to life. You can toggle speech on or off at any time.
*   **Interactive Controls:** Pause the conversation mid-flow to interrupt or end the session, giving you full control over the experience.
*   **Sleek & Responsive UI:** A modern, dark-themed interface built with Tailwind CSS that looks great on any device.

## 🤖 Meet the Combatants

Choose from a wide range of personalities, each with a unique voice, system instruction, and visual style. A few examples:

| Persona | Description |
| :--- | :--- |
| **Elon Musk** | A visionary entrepreneur obsessed with Mars, EVs, and the future. Witty, blunt, and occasionally uses internet slang. |
| **Shakespeare**| Speaks in a grand, poetic fashion using Early Modern English. Thy arguments are rich with metaphor and drama. |
| **The Joker** | An agent of chaos. His logic is twisted, and his tone shifts wildly from playful to menacing. Ends with a manic laugh. |
| **Joe Rogan** | A deeply curious podcast host. Meandering and inquisitive, might casually mention chimpanzees or DMT. |

...and many more!

## 🛠️ Tech Stack

MetaMouths is built with a modern frontend stack, leveraging the power of generative AI.

*   **Frontend:** [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/) for a robust and scalable UI.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) for a utility-first, responsive design.
*   **Generative AI:** [Google Gemini API](https://ai.google.dev/)
    *   `gemini-2.5-flash` for generating witty and in-character dialogue.
    *   `gemini-2.5-flash-preview-tts` for real-time, persona-specific text-to-speech.
*   **Audio Playback:** The browser's native [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) is used to decode and play the raw audio stream from the Gemini TTS model.

## 🚀 Getting Started

To run this project, you'll need a Google Gemini API key.

1.  **Obtain an API Key:** Get your key from [Google AI Studio](https://aistudio.google.com/).
2.  **Set Environment Variable:** The application expects the API key to be available as an environment variable named `API_KEY`.
3.  **Run the App:** Serve the `index.html` file and the application will be ready to go.
