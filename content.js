let selectedText = "";
let selectedProfileUrl = "";
let floatingIcon = null;
let sidePanel = null;
let shadowRoot = null;

// Icons
const SEND_IT_ICON_SVG = `<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`;
const CLOSE_ICON_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`;

const CSS_STYLES = `
.send-it-icon {
    position: absolute; z-index: 2147483647; width: 40px; height: 40px;
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    border-radius: 12px; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s;
    animation: fadeIn 0.2s ease-out;
}
.send-it-icon:hover { transform: scale(1.1) translateY(-2px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6); }
.send-it-icon svg { width: 24px; height: 24px; fill: white; }
.send-it-panel {
    position: fixed; top: 20px; right: 20px; width: 350px; max-height: 80vh;
    background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15); z-index: 2147483647;
    display: flex; flex-direction: column; padding: 24px;
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;
    animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); overflow: hidden;
}
@keyframes fadeIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
@keyframes slideIn { from { transform: translateX(100%) scale(0.9); opacity: 0; } to { transform: translateX(0) scale(1); opacity: 1; } }
.send-it-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.send-it-title { font-size: 18px; font-weight: 700; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.send-it-close { cursor: pointer; padding: 5px; border-radius: 50%; transition: background 0.2s; }
.send-it-close:hover { background: rgba(0, 0, 0, 0.05); }
.send-it-content-box { background: rgba(0, 0, 0, 0.03); border-radius: 12px; padding: 12px; font-size: 14px; line-height: 1.5; margin-bottom: 20px; max-height: 200px; overflow-y: auto; border: 1px solid rgba(0, 0, 0, 0.05); }
.send-it-button { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; border: none; padding: 12px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.1s; display: flex; align-items: center; justify-content: center; gap: 8px; }
.send-it-button:hover { opacity: 0.9; }
.send-it-button:active { transform: scale(0.98); }
.send-it-button:disabled { background: #9ca3af; cursor: not-allowed; }
.send-it-results { margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(0, 0, 0, 0.1); display: none; }
.send-it-result-item { margin-bottom: 12px; }
.send-it-label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
.send-it-value { font-size: 15px; font-weight: 500; color: #111827; }
.send-it-input-res {
    width: 100%; padding: 8px; border-radius: 8px; border: 1px solid rgba(0, 0, 0, 0.1);
    background: white; font-size: 14px; margin-bottom: 5px; outline: none; box-sizing: border-box;
}
.send-it-input-res:focus { border-color: #6366f1; }
.send-it-save-btn {
    background: #10b981; color: white; border: none; padding: 10px; border-radius: 10px;
    font-weight: 600; cursor: pointer; width: 100%; margin-top: 15px; transition: opacity 0.2s;
    display: none;
}
.send-it-save-btn:hover { opacity: 0.9; }
.loading-spinner { width: 20px; height: 20px; border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 50%; border-top-color: white; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.send-it-select {
    width: 100%; padding: 10px; border-radius: 10px; border: 1px solid rgba(0, 0, 0, 0.1);
    background: white; font-size: 14px; color: #1f2937; cursor: pointer; margin-bottom: 10px;
    outline: none; transition: border-color 0.2s;
}
.send-it-textarea {
    width: 100%; height: 100px; padding: 12px; border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.1); background: rgba(0, 0, 0, 0.03);
    font-size: 14px; line-height: 1.5; color: #1f2937; margin-bottom: 20px;
    resize: none; outline: none; transition: border-color 0.2s;
    font-family: inherit; box-sizing: border-box;
}
.send-it-textarea:focus { border-color: #6366f1; background: white; }
`;

function init() {
    // Create a container for our shadow DOM
    const host = document.createElement('div');
    host.id = 'send-it-ai-root';
    document.body.appendChild(host);
    shadowRoot = host.attachShadow({ mode: 'closed' });

    // Inject CSS directly as a string
    const style = document.createElement('style');
    style.textContent = CSS_STYLES;
    shadowRoot.appendChild(style);

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
}

function handleMouseDown(e) {
    // We check if the click target is within our hidden host element
    const host = document.getElementById('send-it-ai-root');
    if (floatingIcon && !host.contains(e.target)) {
        removeFloatingIcon();
    }
}

function handleMouseUp(e) {
    // Check if the selection happened inside our extension UI
    const path = e.composedPath();
    const isInsideExtension = path.some(el => el.id === 'send-it-ai-root');
    if (isInsideExtension) return;

    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text.length > 0) {
        selectedText = text;
        selectedProfileUrl = ""; // Reset

        // Robust link detection
        let container = selection.anchorNode ? selection.anchorNode.parentElement : null;
        if (container) {
            // 1. Check if selection is inside a link
            let link = container.closest('a[href*="/in/"]');
            if (link) {
                selectedProfileUrl = link.href;
            } else {
                // 2. Look for author link in common LinkedIn containers
                let feedItem = container.closest('.feed-shared-update-v2, .comments-comment-item, .artdeco-card, article');
                if (feedItem) {
                    let authorLink = feedItem.querySelector('a[href*="/in/"]');
                    if (authorLink) selectedProfileUrl = authorLink.href;
                }
            }
        }

        showFloatingIcon(e.pageX, e.pageY);
    }
}

function showFloatingIcon(x, y) {
    removeFloatingIcon();

    floatingIcon = document.createElement("div");
    floatingIcon.className = "send-it-icon";
    floatingIcon.innerHTML = SEND_IT_ICON_SVG;
    floatingIcon.style.left = `${x + 5}px`;
    floatingIcon.style.top = `${y + 5}px`;

    floatingIcon.onclick = (e) => {
        e.stopPropagation();
        showSidePanel();
        removeFloatingIcon();
    };

    shadowRoot.appendChild(floatingIcon);
}

function removeFloatingIcon() {
    if (floatingIcon) {
        floatingIcon.remove();
        floatingIcon = null;
    }
}

function showSidePanel() {
    if (sidePanel) sidePanel.remove();

    sidePanel = document.createElement("div");
    sidePanel.className = "send-it-panel";

    sidePanel.innerHTML = `
        <div class="send-it-header">
            <span class="send-it-title">Send It AI</span>
            <div class="send-it-close" id="send-it-close-btn">${CLOSE_ICON_SVG}</div>
        </div>
        <div class="send-it-label">Text to Analyze</div>
        <textarea class="send-it-textarea" id="send-it-input">${selectedText}</textarea>
        
        <div class="send-it-label">Model</div>
        <select class="send-it-select" id="model-select">
            <option value="qwen2.5:3b">Qwen 2.5 3B (Precise)</option>
            <option value="gemma2:2b">Gemma 2 2B (Fast)</option>
            <option value="qwen2.5:7b-instruct-q4_0">Qwen 2.5 7B (Powerful)</option>
        </select>

        <button class="send-it-button" id="send-to-ai-btn" style="margin-top: 10px;">
            <span>Send to AI</span>
            <div class="loading-spinner" id="btn-spinner" style="display: none;"></div>
        </button>

        <div class="send-it-results" id="send-it-results">
            <div class="send-it-result-item">
                <div class="send-it-label">Name</div>
                <input type="text" class="send-it-input-res" id="res-name-input">
            </div>
            <div class="send-it-result-item">
                <div class="send-it-label">Email</div>
                <input type="text" class="send-it-input-res" id="res-email-input">
            </div>
            <div class="send-it-result-item">
                <div class="send-it-label">Location</div>
                <input type="text" class="send-it-input-res" id="res-location-input">
            </div>
            <div class="send-it-result-item">
                <div class="send-it-label">Phone</div>
                <input type="text" class="send-it-input-res" id="res-phone-input">
            </div>
            <div class="send-it-result-item">
                <div class="send-it-label">Profile URL</div>
                <input type="text" class="send-it-input-res" id="res-profile-input">
            </div>
            <button class="send-it-save-btn" id="add-to-list-btn">Add to List</button>
        </div>
    `;

    shadowRoot.appendChild(sidePanel);

    shadowRoot.getElementById("send-it-close-btn").onclick = () => sidePanel.remove();
    shadowRoot.getElementById("send-to-ai-btn").onclick = sendToAI;
    shadowRoot.getElementById("add-to-list-btn").onclick = addToList;
}

function normalizePhone(phone) {
    if (!phone) return "";
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return "+91 " + cleaned.slice(0, 5) + " " + cleaned.slice(5);
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
        return "+91 " + cleaned.slice(2, 7) + " " + cleaned.slice(7);
    }
    return phone;
}

async function sendToAI() {
    const btn = shadowRoot.getElementById("send-to-ai-btn");
    const spinner = shadowRoot.getElementById("btn-spinner");
    const resultsDiv = shadowRoot.getElementById("send-it-results");
    const saveBtn = shadowRoot.getElementById("add-to-list-btn");

    const resNameInput = shadowRoot.getElementById("res-name-input");
    const resEmailInput = shadowRoot.getElementById("res-email-input");
    const resLocationInput = shadowRoot.getElementById("res-location-input");
    const resPhoneInput = shadowRoot.getElementById("res-phone-input");
    const resProfileInput = shadowRoot.getElementById("res-profile-input");

    const modelSelect = shadowRoot.getElementById("model-select");
    const textInput = shadowRoot.getElementById("send-it-input");

    const selectedModel = modelSelect.value;
    const currentText = textInput.value;

    if (!currentText.trim()) {
        alert("Please select or enter some text!");
        return;
    }

    btn.disabled = true;
    spinner.style.display = "block";
    btn.querySelector("span").innerText = "Analyzing...";

    const prompt = `Task: Extract Name, Email, Location, and Phone from the text.
Rules:
1. "name": Person who posted or company name. Clean duplicates.
2. "email": Find any email address (look for @ and domain).
3. "location": ONLY capture if a specific City, "Remote", or "Hybrid" is EXPLICITLY mentioned. If NO location is mentioned, you MUST return an empty string "". Never guess.
4. "phone": Mobile/WhatsApp number.

Format: Return ONLY a JSON object { "name": "", "email": "", "location": "", "phone": "" }.
Text: "${currentText}"`;

    try {
        const response = await fetch("https://unsymptomatical-nonperverted-jacinta.ngrok-free.dev/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: selectedModel,
                prompt: prompt,
                stream: false,
                format: "json"
            }),
        });

        if (!response.ok) throw new Error(`Server Error: ${response.status}`);

        const data = await response.json();
        const result = JSON.parse(data.response);

        // Helper to ensure we get a string even if AI returns an object
        const getString = (val) => {
            if (!val) return "";
            if (typeof val === 'object') {
                // If it's an object with a single key 'city' or 'location', use that
                if (val.city) return String(val.city);
                if (val.location) return String(val.location);
                return JSON.stringify(val);
            }
            return String(val);
        };

        resNameInput.value = getString(result.name);
        resEmailInput.value = getString(result.email);
        resLocationInput.value = getString(result.location);
        resPhoneInput.value = normalizePhone(getString(result.phone));
        resProfileInput.value = selectedProfileUrl || "";

        resultsDiv.style.display = "block";
        saveBtn.style.display = "block";
    } catch (error) {
        alert("Error: " + error.message);
    } finally {
        btn.disabled = false;
        spinner.style.display = "none";
        btn.querySelector("span").innerText = "Send to AI";
    }
}

async function addToList() {
    const saveBtn = shadowRoot.getElementById("add-to-list-btn");
    const data = {
        id: Date.now(),
        name: shadowRoot.getElementById("res-name-input").value,
        email: shadowRoot.getElementById("res-email-input").value,
        location: shadowRoot.getElementById("res-location-input").value,
        phone: normalizePhone(shadowRoot.getElementById("res-phone-input").value),
        profile: shadowRoot.getElementById("res-profile-input").value,
        timestamp: new Date().toISOString()
    };

    const result = await chrome.storage.local.get({ savedleads: [] });
    const leads = result.savedleads;
    leads.unshift(data);
    await chrome.storage.local.set({ savedleads: leads });

    saveBtn.innerText = "Added! ✓";
    saveBtn.style.background = "#059669";
    setTimeout(() => {
        saveBtn.innerText = "Add to List";
        saveBtn.style.background = "#10b981";
    }, 2000);
}

init();
