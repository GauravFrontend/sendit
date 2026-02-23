# Send It AI Extension

A Chrome extension that extracts names and emails from selected text using a local Ollama instance.

## Installation

1. Open Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select the folder where you saved these files (`c:\Users\Gaurav Sharma\Desktop\sendit`).

## Features

- **Text Selection**: Select any text on any website to see the "Send It" icon.
- **Smart Extraction**: Uses local AI (Qwen 2.5 3B) via Ollama to extract contact details.
- **Premium UI**: Modern glassmorphism design with smooth animations.
- **Local Privacy**: Your data stays local (if Ollama is local) or within your ngrok tunnel.

## Configuration

The extension is pre-configured to connect to:
- **URL**: `https://unsymptomatical-nonperverted-jacinta.ngrok-free.dev`
- **Model**: `qwen2.5:3b`

Ensure Ollama is running and accessible via the ngrok URL before use.
