/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message - create a message bubble for the AI greeting
chatWindow.innerHTML = `<div class="msg-bubble ai">👋 Hello, I'm L'Oré. What can I help you with today?</div>`;

////////////////////////////////////

// Initialize an array to keep track of the conversation history
let messages = [
  {
    role: "system",
    content: `Your name is L'Oré. Formulate responses that correspond and correlate to L'Oréal and their products only. You will be L'Oréal's chatbot and only be used for that purpose. Be peppy and energetic in personality. If someone asks a question not related to your tasks, make it clear that you can only help with L'Oréal-specific questions. Keep the responses relatively short to prevent from losing the customer's interest. You can also remember the full conversation shared between you and the user.`,
  },
];

// Function to add a message to the chat window
function addMessageToChat(message, isUser = false) {
  // Create a new message bubble element
  const messageDiv = document.createElement("div");
  messageDiv.className = `msg-bubble ${isUser ? "user" : "ai"}`;
  messageDiv.textContent = message;

  // Add the message to the chat window
  chatWindow.appendChild(messageDiv);

  // Scroll to the bottom to show the latest message
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// REPLACE with your actual Cloudflare Worker URL
const workerUrl = "https://loreal-chatbot.collinsb1793.workers.dev/";

// Add event listener to the form
chatForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent the form from submitting the traditional way

  // Get the user's message before clearing the input
  const userMessage = userInput.value;

  // Display the user's message in the chat window
  addMessageToChat(userMessage, true);

  // Clear the input field immediately
  userInput.value = "";

  // Show loading message
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "msg-bubble ai";
  loadingDiv.textContent = "L'Oré is thinking...";
  chatWindow.appendChild(loadingDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Add the user's message to the conversation history
  messages.push({ role: "user", content: userMessage });

  try {
    // Send a POST request to your Cloudflare Worker
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
      }),
    });

    // Check if the response is not ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse JSON response from the Cloudflare Worker
    const result = await response.json();

    // Get the reply from OpenAI's response structure
    const replyText = result.choices[0].message.content;

    // Add the Worker's response to the conversation history
    messages.push({ role: "assistant", content: replyText });

    // Remove the loading message
    chatWindow.removeChild(loadingDiv);

    // Display the AI response in the chat window
    addMessageToChat(replyText, false);
  } catch (error) {
    console.error("Error:", error); // Log the error

    // Remove the loading message
    chatWindow.removeChild(loadingDiv);

    // Show error message to the user
    addMessageToChat(
      "Sorry, something went wrong. Please try again later.",
      false
    );
  }
});
