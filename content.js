let selectedText = "";
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
.loading-spinner { width: 20px; height: 20px; border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 50%; border-top-color: white; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.send-it-select {
    width: 100%; padding: 10px; border-radius: 10px; border: 1px solid rgba(0, 0, 0, 0.1);
    background: white; font-size: 14px; color: #1f2937; cursor: pointer; margin-bottom: 10px;
    outline: none; transition: border-color 0.2s;
}
.send-it-select:focus { border-color: #6366f1; }
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
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text.length > 0) {
        selectedText = text;
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
        <div class="send-it-label">Selected Text</div>
        <div class="send-it-content-box">${selectedText}</div>
        
        <div class="send-it-label">Model</div>
        <select class="send-it-select" id="model-select">
            <option value="qwen2.5:3b">Qwen 2.5 3B (Precise)</option>
            <option value="gemma:2b">Gemma 2B (Fast)</option>
        </select>

        <button class="send-it-button" id="send-to-ai-btn" style="margin-top: 10px;">
            <span>Send to AI</span>
            <div class="loading-spinner" id="btn-spinner" style="display: none;"></div>
        </button>

        <div class="send-it-results" id="send-it-results">
            <div class="send-it-result-item">
                <div class="send-it-label">Name</div>
                <div class="send-it-value" id="res-name">-</div>
            </div>
            <div class="send-it-result-item">
                <div class="send-it-label">Email</div>
                <div class="send-it-value" id="res-email">-</div>
            </div>
            <div class="send-it-result-item">
                <div class="send-it-label">Location</div>
                <div class="send-it-value" id="res-location">-</div>
            </div>
        </div>
    `;

    shadowRoot.appendChild(sidePanel);

    shadowRoot.getElementById("send-it-close-btn").onclick = () => sidePanel.remove();
    shadowRoot.getElementById("send-to-ai-btn").onclick = sendToAI;
}

async function sendToAI() {
    const btn = shadowRoot.getElementById("send-to-ai-btn");
    const spinner = shadowRoot.getElementById("btn-spinner");
    const resultsDiv = shadowRoot.getElementById("send-it-results");
    const resName = shadowRoot.getElementById("res-name");
    const resEmail = shadowRoot.getElementById("res-email");
    const resLocation = shadowRoot.getElementById("res-location");
    const modelSelect = shadowRoot.getElementById("model-select");

    const selectedModel = modelSelect.value;
    btn.disabled = true;
    spinner.style.display = "block";
    btn.querySelector("span").innerText = "Analyzing...";

    // Improved prompt for better name detection
    const prompt = `Task: Extract specific information from the provided text into a clean JSON format.

Information to find:
1. "name": Look at the VERY BEGINNING of the text. LinkedIn often repeats names (e.g., "Babli SinghBabli Singh"). Remove any duplication and return the clean name. 
2. "email": Find the professional email address (e.g., ends in .com, .co, .in).
3. "location": Look for city names (e.g. Mohali, London) or work arrangements. 
   - If "Remote" is mentioned -> "Remote"
   - If "Hybrid" or "office/home" -> "Hybrid"
   - Else if City mentioned -> City Name
   - Else -> ""

Text to analyze:
"${selectedText}"

IMPORTANT: Return ONLY valid JSON with keys "name", "email", "location". Do not include any other text.`;

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

        if (!response.ok) throw new Error("AI Request Failed");

        const data = await response.json();
        const result = JSON.parse(data.response);

        resName.innerText = result.name || "Not found";
        resEmail.innerText = result.email || "Not found";
        resLocation.innerText = result.location || "";
        resultsDiv.style.display = "block";
    } catch (error) {
        resName.innerText = "Error";
        resEmail.innerText = error.message;
        resultsDiv.style.display = "block";
    } finally {
        btn.disabled = false;
        spinner.style.display = "none";
        btn.querySelector("span").innerText = "Send to AI";
    }
}

init();
