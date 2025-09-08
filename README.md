# Tarot Companion

A calm, sacred, journal-like app for daily Tarot. It logs your card draws, offers AI-powered layered meanings (Outer, Inner, Whispers), and adapts to the current lunar phase, season, and Wiccan/occult holidays. It also encourages routine with a daily reminder.

This project is a single-page application built with React, using modern browser features and requiring no build step.

## Features

- **Multiple Drawing Methods:** Draw cards digitally, input them manually, or use your device's camera or microphone to identify a physical card.
- **AI-Powered Interpretations:** Get deep, layered interpretations for your spreads from the Gemini API, synthesized with contextual information like the current date and lunar phase.
- **Personal Journaling:** Log every reading, add your personal impressions, and build a searchable history of your journey.
- **Calendar View:** Visualize your reading history and see upcoming Sabbats and daily lunar phases.
- **Context-Aware:** Readings are influenced by the season, moon phase, and special holidays for a more connected experience.
- **Data Privacy:** All your journal data is stored locally in your browser, ensuring complete privacy. You can export and import your journal at any time.

## Tech Stack

- **Framework:** React
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **AI Integration:** Google Gemini API
- **Deployment:** Static file hosting (e.g., Netlify, GitHub Pages)

## Getting Started

This project is configured to run without a build step.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/tarot-companion.git
    cd tarot-companion
    ```

2.  **Install development server:**
    The `package.json` includes a simple static file server for local development.
    ```bash
    npm install
    ```

3.  **Start the server:**
    ```bash
    npm start
    ```
    This will open the application at `http://localhost:3000`.

## Configuration & Deployment

### Gemini API Key

The application requires a Google Gemini API key to function. This key is loaded from the environment variable `process.env.API_KEY`.

**The application will run without an API key for UI development, but all features related to AI interpretation and image generation will fail.**

### Deploying to Netlify (Recommended)

1.  Fork this repository to your GitHub account.
2.  Log in to Netlify and select "Add new site" -> "Import an existing project".
3.  Connect to your Git provider and select your forked repository.
4.  In the deploy settings:
    - **Build command:** Leave this field **blank**.
    - **Publish directory:** Leave this field **blank** (or set to your project's root).
5.  Before deploying, go to "Site settings" -> "Build & deploy" -> "Environment".
6.  Add a new **Environment variable**:
    - **Key:** `API_KEY`
    - **Value:** Paste your Google Gemini API key here.
7.  Deploy your site. Netlify will now serve your static files and make the API key available to the application.
