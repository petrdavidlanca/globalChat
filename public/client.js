const UI = {
    chatBox: document.getElementById('chat-box'),
    chatForm: document.getElementById('chat-form'),
    messageInput: document.getElementById('message-input'),
    connectionStatus: document.getElementById('connection-status'),
    userCount: document.getElementById('user-count'),
    toggleSystem: document.getElementById('toggle-system'),
    toggleTimestamps: document.getElementById('toggle-timestamps'),
    sendButton: document.getElementById('send-button')
};

const socket = new WebSocket('ws://localhost:3000');

const getColorFromName = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 100%, 75%)`; 
};

const createTimestampElement = (timestamp) => {
    const timeSpan = document.createElement('span');
    timeSpan.className = 'timestamp';
    const msgDate = timestamp ? new Date(timestamp) : new Date();
    timeSpan.textContent = `[${msgDate.toLocaleTimeString(undefined, {
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false
    })}] `;
    return timeSpan;
};

const appendToChat = (element) => {
    const isAtBottom = Math.abs(UI.chatBox.scrollHeight - UI.chatBox.scrollTop - UI.chatBox.clientHeight) <= 5;
    UI.chatBox.appendChild(element);
    if (isAtBottom) {
        UI.chatBox.scrollTop = UI.chatBox.scrollHeight;
    }
};

const renderChatMessage = (msgData) => {
    const messageDiv = document.createElement('div');
    
    const usernameSpan = document.createElement('span');
    usernameSpan.className = 'username';
    usernameSpan.textContent = `${msgData.username}: `;
    usernameSpan.style.color = getColorFromName(msgData.username);
    
    const textSpan = document.createElement('span');
    textSpan.className = 'text';
    textSpan.textContent = msgData.text;
    
    messageDiv.appendChild(createTimestampElement(msgData.timestamp));
    messageDiv.appendChild(usernameSpan);
    messageDiv.appendChild(textSpan);
    
    appendToChat(messageDiv);
};

const renderSystemMessage = (text) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'system';
    
    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    
    messageDiv.appendChild(createTimestampElement());
    messageDiv.appendChild(textSpan);
    
    appendToChat(messageDiv);
};

const handleServerMessage = {
    welcome: (data) => {
        UI.connectionStatus.innerText = `Connected as ${data.username}!`;
    },
    history: (data) => {
        data.messages.forEach(renderChatMessage);
    },
    chat: (data) => {
        renderChatMessage(data);
    },
    system: (data) => {
        renderSystemMessage(data.text);
    },
    userCount: (data) => {
        UI.userCount.innerText = ` ${data.count} Online`;
    }
};

socket.addEventListener('message', (event) => {
    try {
        const data = JSON.parse(event.data);
        if (handleServerMessage[data.type]) {
            handleServerMessage[data.type](data);
        }
    } catch (error) {
        console.error('Error processing message:', error);
    }
});

socket.addEventListener('close', () => {
    UI.connectionStatus.innerText = 'Disconnected. Please refresh.';
    UI.connectionStatus.style.color = 'red';
    UI.messageInput.disabled = true;
    UI.sendButton.disabled = true;
});

UI.chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = UI.messageInput.value.trim();
    
    if (text === '') return;

    socket.send(JSON.stringify({ type: 'chat', text }));
    UI.messageInput.value = '';
});

UI.toggleSystem.addEventListener('change', (event) => {
    if (event.target.checked) {
        UI.chatBox.classList.remove('hide-system-msgs');
    } else {
        UI.chatBox.classList.add('hide-system-msgs');
    }
});

UI.toggleTimestamps.addEventListener('change', (event) => {
    if (event.target.checked) {
        UI.chatBox.classList.remove('hide-timestamps');
    } else {
        UI.chatBox.classList.add('hide-timestamps');
    }
});

UI.messageInput.focus();