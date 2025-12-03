document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("chatForm");
    const input = document.getElementById("userInput");
    const messages = document.getElementById("messages");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const userMessage = input.value.trim();
        if (!userMessage) return;

        // Display user message
        appendMessage("You", userMessage);

        // Send to backend API running on same port
        try {
            const response = await fetch("http://<EC2-IP>:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage })
            });

            const data = await response.json();
            appendMessage("Bot", data.reply);

        } catch (error) {
            appendMessage("Bot", "Error connecting to server.");
            console.error(error);
        }

        input.value = "";
    });

    function appendMessage(sender, text) {
        const msg = document.createElement("div");
        msg.classList.add("message");
        msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;
    }
});
