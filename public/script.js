const container = document.getElementById("product-container");
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  container.innerHTML = `<p>❌ No product ID provided in URL.</p>`;
  throw new Error("No product ID provided");
}

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
            <img src="${data.image || 'https://via.placeholder.com/300x400?text=Athlete'}" alt="${escapeHTML(data.name) || "Athlete"}" />
          </div>
          <div class="athlete-info">
            <h2>${escapeHTML(data.name) || "Unnamed Athlete"}</h2>
            <ul>
              <li><strong>Product ID:</strong> ${escapeHTML(data.product_id) || "N/A"}</li>
              <li><strong>Country:</strong> ${escapeHTML(data.country) || "N/A"}</li>
              <li><strong>Sport:</strong> ${escapeHTML(Array.isArray(data.sport) ? data.sport.join(", ") : data.sport) || "N/A"}</li>
              <li><strong>Description:</strong> ${escapeHTML(data.description) || "N/A"}</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <div class="footer-name">${escapeHTML(data.name) || "Unnamed Athlete"}</div>
          <div class="footer-details">ATHLETE / TEAM ${escapeHTML(data.country) || "N/A"}<br>${escapeHTML(data.university) || "University Not Provided"}</div>
          <button class="chat-button" onclick="toggleChat()">Ask AI</button>
        </div>

        <div id="chatbot-popup" class="chatbot-popup">
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

function escapeHTML(text) {
  if (!text) return "";
  return text.replace(/[&<>"']/g, (match) => {
    const escapeMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return escapeMap[match];
  });
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

    // Remove previous "AI is typing..." if any
    const typingEl = messages.querySelector('em');
    if (typingEl) typingEl.parentElement.remove();

    messages.innerHTML += `<div><em>AI is typing...</em></div>`;
    messages.scrollTop = messages.scrollHeight;
    input.value = "";

    sendBtn.disabled = true;

    try {
      const res = await fetch("https://dpp-chatbot-backend.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      // Remove "AI is typing..." after response
      const typingElAfter = messages.querySelector('em');
      if (typingElAfter) typingElAfter.parentElement.remove();

      if (res.ok && data.reply) {
        messages.innerHTML += `<div><strong>AI:</strong> ${escapeHTML(data.reply)}</div>`;
      } else if (data.error) {
        messages.innerHTML += `<div><strong>AI:</strong> ❌ Error: ${escapeHTML(data.error)}</div>`;
        console.error("Backend error:", data.error);
      } else {
        messages.innerHTML += `<div><strong>AI:</strong> 🤖 Unexpected server response.</div>`;
        console.error("Unexpected response:", data);
      }
    } catch (err) {
      // Remove typing indicator on error
      const typingElError = messages.querySelector('em');
      if (typingElError) typingElError.parentElement.remove();

      messages.innerHTML += `<div><strong>AI:</strong> ❌ Error reaching AI service.</div>`;
      console.error(err);
    }

    messages.scrollTop = messages.scrollHeight;
    sendBtn.disabled = false;
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
