import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

const PORT = process.env.PORT || 3000;
const MAX_HISTORY = 50;

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map();
const messageHistory = [];

const generateUsername = () => uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    style: 'capital',
    separator: ''
});

const broadcast = (data, excludeWs = null) => {
    const payload = JSON.stringify(data);
    wss.clients.forEach((client) => {
        if (client !== excludeWs && client.readyState === 1) {
            client.send(payload);
        }
    });
};

const broadcastUserCount = () => {
    broadcast({ type: 'userCount', count: clients.size });
};

const handleNewConnection = (ws) => {
    const username = generateUsername();
    clients.set(ws, username);

    ws.send(JSON.stringify({ type: 'welcome', username }));

    if (messageHistory.length > 0) {
        ws.send(JSON.stringify({ type: 'history', messages: messageHistory }));
    }

    broadcast({ type: 'system', text: `${username} joined.` }, ws);
    broadcastUserCount();

    return username;
};

const handleIncomingMessage = (ws, rawData) => {
    try {
        const messageData = JSON.parse(rawData);
        const author = clients.get(ws);

        if (messageData.type === 'chat') {
            const msgObj = {
                type: 'chat',
                username: author,
                text: String(messageData.text).substring(0, 250),
                timestamp: Date.now()
            };

            messageHistory.push(msgObj);
            if (messageHistory.length > MAX_HISTORY) {
                messageHistory.shift();
            }

            broadcast(msgObj);
        }
    } catch (error) {
        console.error('Failed to parse message:', error);
    }
};

const handleDisconnection = (ws, username) => {
    clients.delete(ws);
    broadcastUserCount();
    broadcast({ type: 'system', text: `${username} disconnected.` });
    console.log(`${username} disconnected. Users online: ${clients.size}`);
};

wss.on('connection', (ws) => {
    const username = handleNewConnection(ws);
    console.log(`${username} connected. Users online: ${clients.size}`);

    ws.on('message', (rawData) => handleIncomingMessage(ws, rawData));
    ws.on('close', () => handleDisconnection(ws, username));
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));


