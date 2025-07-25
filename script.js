const container = document.getElementById("product-container");
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function fetchProduct() {
  container.innerHTML = "Loading product details...";

  try {
    const res = await fetch(`https://backend-dpp.onrender.com/product/${id}`);
    const data = await res.json();

    if (res.status !== 200) {
      container.innerHTML = `<p>❌ ${data.error}</p>`;
      return;
    }

    container.innerHTML = `
      <div class="athlete-passport">
        <div class="header">DIGITAL ATHLETE PASSPORT</div>
        <div class="passport-body">
          <div class="athlete-photo">
            <img src="${data.image || 'https://via.placeholder.com/300x400?text=Athlete'}" alt="${data.name}" />
          </div>
          <div class="athlete-info">
            <h2>${data.name || "Unnamed Athlete"}</h2>
            <ul>
              <li><strong>Product ID:</strong> ${data.product_id || "N/A"}</li>
              <li><strong>Country:</strong> ${data.country || "N/A"}</li>
              <li><strong>Sport:</strong> ${(Array.isArray(data.sport) ? data.sport.join(", ") : data.sport) || "N/A"}</li>
              <li><strong>Description:</strong> ${data.description || "N/A"}</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <div class="footer-name">${data.name || "Unnamed Athlete"}</div>
          <div class="footer-details">ATHLETE / TEAM ${data.country || "N/A"}<br>${data.university || "University Not Provided"}</div>
          <button class="chat-button" onclick="toggleChat()">Ask AI</button>
        </div>

        <div id="chatbot-popup">
          <div class="chat-header">Ask AI <span onclick="toggleChat()" style="cursor:pointer;float:right;">❌</span></div>
          <div id="chat-messages" class="chat-messages"></div>
          <div class="chat-input">
            <input type="text" id="chat-input" placeholder="Ask something..." />
            <button id="mic-btn">🎤</button>
            <button id="send-btn">➤</button>
          </div>
        </div>
      </div>
    `;

    attachChatEvents();
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p>❌ Failed to load product. Try again later.</p>`;
  }
}

function toggleChat() {
  const popup = document.querySelector("#chatbot-popup");
  if (popup) popup.classList.toggle("visible");
}

function attachChatEvents() {
  const sendBtn = document.getElementById("send-btn");
  const micBtn = document.getElementById("mic-btn");

  if (sendBtn) sendBtn.onclick = async () => {
    const input = document.getElementById("chat-input");
    const message = input.value.trim();
    if (!message) return;

    const messages = document.getElementById("chat-messages");
    messages.innerHTML += `<div><em>AI is typing...</em></div>`;
    messages.scrollTop = messages.scrollHeight;
    input.value = "";

    try {
      const res = await fetch("https://dpp-chatbot-backend.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

if (res.ok && data.reply) {
  messages.innerHTML += `<div><strong>AI:</strong> ${data.reply}</div>`;
} else if (data.error) {
  messages.innerHTML += `<div><strong>AI:</strong> ❌ Error: ${data.error}</div>`;
  console.error("Backend error:", data.error);
} else {
  messages.innerHTML += `<div><strong>AI:</strong> 🤖 Unexpected server response.</div>`;
  console.error("Unexpected response:", data);
}
    } catch (err) {
      messages.innerHTML += `<div><strong>AI:</strong> ❌ Error reaching AI service.</div>`;
    }

    messages.scrollTop = messages.scrollHeight;
  };

  if (micBtn) micBtn.onclick = () => {
    alert("🎤 Voice input not yet implemented.");
  };
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('✅ Service Worker registered with scope:', registration.scope);
    })
    .catch((error) => {
      console.error('❌ Service Worker registration failed:', error);
    });
}

fetchProduct();
