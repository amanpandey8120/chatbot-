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

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

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
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9
                }
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

// Check Ollama availability on startup
async function checkOllamaAvailability() {
    try {
        const response = await fetch(`${OLLAMA_URL}/api/tags`, {
            method: 'GET'
        });
        
        if (response.ok) {
            ollamaAvailable = true;
            console.log('Ollama is available');
        } else {
            ollamaAvailable = false;
            console.log('Ollama is not available');
        }
    } catch (error) {
        ollamaAvailable = false;
        console.log('Ollama is not available');
    }
}

function getBotResponse(message) {
    const lowerMessage = message.toLowerCase().trim();

    // Greetings
    if (lowerMessage.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/)) {
        return getRandomResponse(responses.greetings);
    }

    // Farewell
    if (lowerMessage.match(/^(bye|goodbye|see you|farewell|see ya)/)) {
        return getRandomResponse(responses.farewell);
    }

    // Thanks
    if (lowerMessage.match(/(thank|thanks|thx|appreciate)/)) {
        return getRandomResponse(responses.thanks);
    }

    // How are you
    if (lowerMessage.match(/(how are you|how r u|how're you|hows it going|whats up)/)) {
        return getRandomResponse(responses.howareyou);
    }

    // Name
    if (lowerMessage.match(/(your name|who are you|what are you)/)) {
        return getRandomResponse(responses.name);
    }

    // Help
    if (lowerMessage.match(/(help|what can you do|your purpose|capabilities)/)) {
        return getRandomResponse(responses.help);
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

    // If Ollama is available, return null to trigger Ollama call
    if (ollamaAvailable) {
        return null;
    }

    // Default response
    return getRandomResponse(responses.default);
}

function addMessage(message, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar';
    avatarDiv.textContent = isUser ? '👤' : '🤖';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Format message with line breaks
    const formattedMessage = message.replace(/\n/g, '<br>');
    contentDiv.innerHTML = formattedMessage;
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'message bot-message typing-indicator';
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar';
    avatarDiv.textContent = '🤖';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    
    typingDiv.appendChild(avatarDiv);
    typingDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;

    // Add user message
    addMessage(message, true);
    userInput.value = '';
    userInput.focus();

    // Show typing indicator
    showTypingIndicator();

    try {
        // Get initial bot response from local database
        let botResponse = getBotResponse(message);
        
        // If getBotResponse returns null, call Ollama
        if (botResponse === null && ollamaAvailable) {
            botResponse = await callOllama(message);
            
            // If Ollama fails, fall back to default response
            if (!botResponse) {
                botResponse = getRandomResponse(responses.default);
            }
        }
        
        // Remove typing indicator and show response
        setTimeout(() => {
            removeTypingIndicator();
            addMessage(botResponse, false);
        }, 500);
        
    } catch (error) {
        console.error('Error sending message:', error);
        removeTypingIndicator();
        addMessage("Sorry, I encountered an error. Please try again.", false);
    }
}

// Initialize the chat
function initializeChat() {
    // Check Ollama availability
    checkOllamaAvailability();
    
    // Add welcome message
    setTimeout(() => {
        addMessage(getRandomResponse(responses.greetings), false);
    }, 1000);
}

// Event listeners
if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
}

if (userInput) {
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Focus input on load
    userInput.focus();
}

// Initialize chat when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChat);
} else {
    initializeChat();
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getBotResponse,
        callOllama,
        checkOllamaAvailability
    };
}
