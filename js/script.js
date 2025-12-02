// Configuration
const OLLAMA_URL = 'http://localhost:11434';
const OLLAMA_MODEL = 'llama2';

// Bot responses database (fallback when Ollama is unavailable)
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

// Fallback response using predefined responses
function getFallbackResponse(userInput) {
    const input = userInput.toLowerCase().trim();
    
    // Greetings
    if (input.match(/^(hello|hi|hey|greetings|good morning|good afternoon|good evening)$/)) {
        return getRandomResponse(responses.greetings);
    }
    
    // Farewell
    if (input.match(/^(bye|goodbye|see you|farewell|exit|quit)$/)) {
        return getRandomResponse(responses.farewell);
    }
    
    // Thanks
    if (input.match(/thank you|thanks|thx|appreciate/)) {
        return getRandomResponse(responses.thanks);
    }
    
    // How are you
    if (input.match(/how are you|how're you|how do you do/)) {
        return getRandomResponse(responses.howareyou);
    }
    
    // Name
    if (input.match(/your name|who are you|what are you/)) {
        return getRandomResponse(responses.name);
    }
    
    // Help
    if (input.match(/^(help|what can you do|capabilities)$/)) {
        return getRandomResponse(responses.help);
    }
    
    // Custom: Lulu loves Kutu
    if (input.match(/lulu.*kutu|does lulu love kutu|lulu love/)) {
        return getRandomResponse(responses.lulukuktu);
    }
    
    // Default
    return getRandomResponse(responses.default);
}

// Main function to get bot response
async function getBotResponse(userInput) {
    // First, try to get response from Ollama
    if (ollamaAvailable) {
        const ollamaResponse = await callOllama(userInput);
        if (ollamaResponse) {
            return ollamaResponse;
        }
    }
    
    // If Ollama fails, use fallback responses
    return getFallbackResponse(userInput);
}

// Send message function (called when user sends a message)
async function sendMessage() {
    const userInput = document.getElementById('userInput').value.trim();
    
    if (!userInput) return;
    
    // Display user message
    addMessageToChat('user', userInput);
    
    // Clear input
    document.getElementById('userInput').value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Get bot response
    const botResponse = await getBotResponse(userInput);
    
    // Hide typing indicator
    hideTypingIndicator();
    
    // Display bot response
    addMessageToChat('bot', botResponse);
}

// Add message to chat (you need to implement this based on your HTML structure)
function addMessageToChat(sender, message) {
    const chatContainer = document.getElementById('chatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = message;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const chatContainer = document.getElementById('chatContainer');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'typing-indicator';
    typingDiv.textContent = 'Bot is typing...';
    chatContainer.appendChild(typingDiv);
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Event listener for Enter key
document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    
    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    // Display initial message
    addMessageToChat('bot', 'Hello! I\'m powered by Ollama. How can I help you today?');
    
    // Check Ollama availability on load
    checkOllamaStatus();
});

// Check if Ollama is running
async function checkOllamaStatus() {
    try {
        const response = await fetch(`${OLLAMA_URL}/api/tags`);
        if (response.ok) {
            ollamaAvailable = true;
            console.log('✅ Ollama is connected');
        }
    } catch (error) {
        ollamaAvailable = false;
        console.warn('⚠️ Ollama is not available. Using fallback responses.');
        addMessageToChat('bot', '(Note: Ollama is offline. Using basic responses.)');
    }
}
