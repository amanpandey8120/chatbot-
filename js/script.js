// Configuration
const OLLAMA_URL = 'http://localhost:11434';
const OLLAMA_MODEL = 'llama2';

// Bot responses database
const responses = {
    greetings: [
        "Hello! How can I assist you today?",
        "Hi there! What can I do for you?",
        "Hey! Nice to meet you!",
        "Greetings! How may I help you?"
    ],
    farewell: [
        "Goodbye! Have a great day!",
        "See you later! Take care!",
        "Bye! Feel free to come back anytime!",
        "Farewell! It was nice chatting with you!"
    ],
    thanks: [
        "You're welcome! Happy to help!",
        "No problem at all!",
        "Anytime! That's what I'm here for!",
        "Glad I could help!"
    ],
    howareyou: [
        "I'm doing great, thank you for asking! How about you?",
        "I'm just a bot, but I'm functioning perfectly! How are you?",
        "I'm excellent! Ready to chat with you!"
    ],
    name: [
        "I'm ChatBot, your friendly AI assistant!",
        "You can call me ChatBot!",
        "I'm ChatBot, nice to meet you!"
    ],
    help: [
        "I can chat with you, answer questions, and have friendly conversations! Just type anything you'd like to talk about.",
        "I'm here to chat and help! You can ask me about myself, have a conversation, or just say hello!",
        "Feel free to ask me anything or just chat! I can discuss various topics with you."
    ],
    lulukuktu: [
        "Yes, Lulu loves Kutu very much!",
        "Lulu and Kutu are best friends!",
        "Absolutely! Lulu loves Kutu!"
    ],
    default: [
        "That's interesting! Tell me more.",
        "I see! Can you elaborate on that?",
        "Interesting point! What else would you like to know?",
        "I appreciate you sharing that! Anything else on your mind?",
        "That's a good question! While I'm a simple chatbot, I'm here to chat with you.",
        "I'm still learning, but I'd love to continue our conversation!",
        "Thanks for chatting with me! What else would you like to talk about?"
    ]
};

// Conversation history for Ollama
let conversationHistory = [];

// Check if Ollama is available
let ollamaAvailable = true;

// Get random response from array
function getRandomResponse(responseArray) {
    return responseArray[Math.floor(Math.random() * responseArray.length)];
}

// Call Ollama API
async function callOllama(userMessage) {
    try {
        // Add user message to history
        conversationHistory.push({
            role: 'user',
            content: userMessage
        });

        const response = await fetch(`${OLLAMA_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                messages: conversationHistory,
                stream: false
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Add assistant response to history
        if (data.message && data.message.content) {
            conversationHistory.push({
                role: 'assistant',
                content: data.message.content
            });
            
            ollamaAvailable = true;
            return data.message.content;
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Ollama error:', error);
        ollamaAvailable = false;
        return null;
    }
}

function getBotResponse(message) {
    const lowerMessage = message.toLowerCase().trim();

    // Greetings
    if (lowerMessage.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/)) {
        return responses.greetings[Math.floor(Math.random() * responses.greetings.length)];
    }

    // Farewell
    if (lowerMessage.match(/^(bye|goodbye|see you|farewell|see ya)/)) {
        return responses.farewell[Math.floor(Math.random() * responses.farewell.length)];
    }

    // Thanks
    if (lowerMessage.match(/(thank|thanks|thx|appreciate)/)) {
        return responses.thanks[Math.floor(Math.random() * responses.thanks.length)];
    }

    // How are you
    if (lowerMessage.match(/(how are you|how r u|how're you|hows it going|whats up)/)) {
        return responses.howareyou[Math.floor(Math.random() * responses.howareyou.length)];
    }

    // Name
    if (lowerMessage.match(/(your name|who are you|what are you)/)) {
        return responses.name[Math.floor(Math.random() * responses.name.length)];
    }

    // Help
    if (lowerMessage.match(/(help|what can you do|your purpose|capabilities)/)) {
        return responses.help[Math.floor(Math.random() * responses.help.length)];
    }

    // Weather
    if (lowerMessage.match(/weather/)) {
        return "I don't have access to real-time weather data, but I hope it's nice where you are!";
    }

    // Time
    if (lowerMessage.match(/(what time|current time|time is it)/)) {
        const now = new Date();
        return `The current time is ${now.toLocaleTimeString()}.`;
    }

    // Date
    if (lowerMessage.match(/(what date|today's date|current date)/)) {
        const now = new Date();
        return `Today's date is ${now.toLocaleDateString()}.`;
    }

    // Default response
    return responses.default[Math.floor(Math.random() * responses.default.length)];
}

function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;

    // Add user message
    addMessage(message, true);
    userInput.value = '';

    // Show typing indicator
    showTypingIndicator();

    // Simulate bot thinking time
    setTimeout(() => {
        removeTypingIndicator();
        const botResponse = getBotResponse(message);
        addMessage(botResponse, false);
    }, 800 + Math.random() * 400);
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Focus input on load
userInput.focus();