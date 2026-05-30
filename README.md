# Ephemeral Global Chat

A real-time, completely anonymous global chat application built to mimic the rapid-fire experience of a Twitch chat window. 

## Live Demo
Check out the live app here: https://globalchat-m9xl.onrender.com

## Features
- **Real-Time Communication:** Driven by persistent, two-way WebSockets—zero databases, zero logs, pure memory-based broadcasting.
- **Dynamic Identity:** Users are instantly assigned a random username upon connection.

## Tech Stack
- **Frontend:** Vanilla HTML5, CSS3, and Native Browser WebSockets API.
- **Backend:** Node.js, Express, and the `ws` library for raw WebSocket management.

## How to Run This Locally

1. Clone the repository:
    ```bash
    git clone https://github.com/petrdavidlanca/globalChat.git

2. Navigate into the project folder and install dependencies:

    ```bash
    cd your-repo-name
    npm install

3. Start the local server:

    ```bash
    npm start

Open your browser and go to http://localhost:3000.

---