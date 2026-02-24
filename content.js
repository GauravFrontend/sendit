let selectedText = "";
let selectedProfileUrl = "";
let floatingIcon = null;
let sidePanel = null;
let shadowRoot = null;

// Icons
const SEND_IT_ICON_SVG = `<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`;
const CLOSE_ICON_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`;

const _K = "Z3NrX245cTVPbTZmcmdKTEZkSnRmOTVLV0dyeWIzRllmdElaM2RwQlFJTFFrbGhFMzhnSGNIdEI=";
const DIRECT_GROQ_KEY = atob(_K);

const CSS_STYLES = `
.send-it-icon {
    position: fixed; z-index: 2147483647; width: 40px; height: 40px;
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    border-radius: 12px; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s;
    animation: fadeIn 0.2s ease-out;
    pointer-events: auto;
}
.send-it-icon:hover { transform: scale(1.1) translateY(-2px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6); }
.send-it-icon svg { width: 24px; height: 24px; fill: white; pointer-events: none; }
.send-it-panel {
    position: fixed; top: 20px; right: 20px; width: 400px; max-height: 90vh;
    background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15); z-index: 2147483647;
    display: flex; flex-direction: column; padding: 20px;
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;
    animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); overflow-y: auto;
}
@keyframes fadeIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
@keyframes slideIn { from { transform: translateX(100%) scale(0.9); opacity: 0; } to { transform: translateX(0) scale(1); opacity: 1; } }
.send-it-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.send-it-title { font-size: 16px; font-weight: 700; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.send-it-close { cursor: pointer; padding: 5px; border-radius: 50%; transition: background 0.2s; }
.send-it-close:hover { background: rgba(0, 0, 0, 0.05); }

.button-group { display: flex; gap: 10px; margin-top: 15px; }
.send-it-button { flex: 1; height: 44px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; }
.send-it-save-btn { flex: 1; height: 44px; background: #10b981; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: background 0.2s; display: none; align-items: center; justify-content: center; font-size: 13px; }

.extract-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 15px; }
.send-it-result-item { display: flex; flex-direction: column; }
.send-it-result-item.full-width { grid-column: span 2; }

.send-it-results { display: none; border-top: 1px solid rgba(0, 0, 0, 0.05); padding-top: 5px; }
.scan-status { font-size: 10px; color: #6b7280; font-weight: normal; margin-top: 2px; }

.send-it-toast {
    position: absolute; top: 50px; left: 15px; right: 15px;
    background: #4f46e5; color: white; padding: 8px 12px;
    border-radius: 8px; font-size: 11px; font-weight: 500;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    display: none; z-index: 100; animation: slideDown 0.3s ease;
}
@keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.send-it-label { font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
.send-it-input-res {
    width: 100%; padding: 10px; border-radius: 10px; border: 1px solid rgba(0, 0, 0, 0.08);
    background: #f9fafb; font-size: 13px; outline: none; box-sizing: border-box; color: #374151;
}
.send-it-input-res:focus { border-color: #6366f1; background: white; }
.send-it-select-mini {
    font-size: 10px; padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(0, 0, 0, 0.1);
    background: white; color: #6b7280; cursor: pointer; outline: none; margin-right: 10px;
}
.send-it-textarea {
    width: 100%; height: 140px; padding: 12px; border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08); background: #f9fafb;
    font-size: 13px; line-height: 1.5; color: #374151; margin-bottom: 0px;
    resize: none; outline: none; transition: border-color 0.2s;
    font-family: inherit; box-sizing: border-box;
}
.send-it-textarea:focus { border-color: #6366f1; background: white; }
.loading-spinner { width: 14px; height: 14px; border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 50%; border-top-color: white; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
`;

let backendOfflineUntil = 0; // Timestamp for cool-down

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

        showFloatingIcon(e.clientX, e.clientY);
    }
}

function showFloatingIcon(x, y) {
    removeFloatingIcon();

    floatingIcon = document.createElement("div");
    floatingIcon.className = "send-it-icon";
    floatingIcon.innerHTML = SEND_IT_ICON_SVG;
    floatingIcon.style.left = `${x + 10}px`;
    floatingIcon.style.top = `${y + 10}px`;

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

    const isOfflineMode = Date.now() < backendOfflineUntil;

    sidePanel.innerHTML = `
        <div class="send-it-header">
            <span class="send-it-title">Send It AI</span>
            <div style="display: flex; align-items: center;">
                <select class="send-it-select-mini" id="model-select">
                    <optgroup label="Local (Ollama)">
                        <option value="qwen2.5:3b" ${isOfflineMode ? 'disabled' : ''}>Qwen 3B</option>
                        <option value="gemma2:2b" ${isOfflineMode ? 'disabled' : ''}>Gemma 2B</option>
                    </optgroup>
                    <optgroup label="Cloud (Groq)">
                        <option value="groq:llama-3.3-70b-versatile" ${isOfflineMode ? 'selected' : ''}>Llama 70B (Best)</option>
                        <option value="groq:llama-3.1-8b-instant">Llama 8B (Fast)</option>
                        <option value="groq:mixtral-8x7b-32768">Mixtral</option>
                    </optgroup>
                </select>
                <div class="send-it-close" id="send-it-close-btn">${CLOSE_ICON_SVG}</div>
            </div>
        </div >

        <div class="send-it-toast" id="send-it-toast">
            ☁️ Backend offline. Switched to Cloud.
        </div>
        
        <div class="send-it-label">Raw Text</div>
        <textarea class="send-it-textarea" id="send-it-input">${selectedText}</textarea>
        
        <div class="button-group">
            <button class="send-it-button" id="send-to-ai-btn">
                <span>Send to AI</span>
                <div class="loading-spinner" id="btn-spinner" style="display: none;"></div>
            </button>
            <button class="send-it-save-btn" id="add-to-list-btn">Add to List</button>
        </div>

        <div class="send-it-results" id="send-it-results">
            <div class="extract-grid">
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
                <div class="send-it-result-item full-width">
                    <div class="send-it-label">Profile URL</div>
                    <input type="text" class="send-it-input-res" id="res-profile-input">
                </div>
            </div>
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

    btn.disabled = true;
    spinner.style.display = "block";
    btn.querySelector("span").innerText = "Booting...";

    setTimeout(() => {
        if (btn.disabled) btn.querySelector("span").innerText = "Extracting...";
    }, 2500);

    const prompt = `You are a Lead Extraction Assistant. 
Analyze the provided text(usually a LinkedIn post) and extract contact details.

CRITICAL INSTRUCTIONS:
1. NAME: The name of the person who posted is almost always at the VERY START of the text. 
   - If the name is repeated(e.g. "Vinod SVinod S"), clean it to just "Vinod S".
   - Ignore suffixes like "3rd+", "1st", "Following", etc.
2. EMAIL: Find any professional or personal email address.
3. LOCATION: Only extract if a specific City, "Remote", or "Hybrid" is mentioned.
4. PHONE: Extract any phone / WhatsApp numbers.

Return ONLY a valid JSON object.Do not include any other text.
JSON Structure:
{
    "name": "Full Name",
        "email": "email@example.com",
            "location": "City/Remote",
                "phone": "number"
}

Text to analyze:
"${currentText}"`;

    try {
        console.log(`🧠[Send It] Sending prompt to model: ${selectedModel} `);

        let result;

        if (selectedModel.startsWith('groq:')) {
            // DIRECT CLOUD CALL (Works even if backend is offline)
            const groqModel = selectedModel.replace('groq:', '');
            console.log(`☁️[Send It] Calling Groq Direct: ${groqModel} `);

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${DIRECT_GROQ_KEY} `
                },
                body: JSON.stringify({
                    model: groqModel,
                    messages: [{ role: 'user', content: prompt }],
                    response_format: { type: "json_object" }
                }),
            });

            if (!response.ok) throw new Error(`Groq Direct Error: ${response.status} `);
            const data = await response.json();
            result = JSON.parse(data.choices[0].message.content);
        } else {
            // LOCAL CALL (Requires backend/ngrok)
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

                if (!response.ok) throw new Error("Backend Error");
                const data = await response.json();
                result = JSON.parse(data.response);
            } catch (err) {
                const wasAlreadyOffline = Date.now() < backendOfflineUntil;

                // Set/Refresh offline state for 60 minutes (1 hour)
                backendOfflineUntil = Date.now() + (60 * 60 * 1000);

                if (!wasAlreadyOffline) {
                    console.warn("⚠️ [Send It] Local Backend Offline. Switching to Cloud Mode.");
                    const toast = shadowRoot.getElementById("send-it-toast");
                    if (toast) {
                        toast.style.display = "block";
                        setTimeout(() => { if (toast) toast.style.display = "none"; }, 4000);
                    }
                }

                // Switch dropdown to cloud
                if (modelSelect) {
                    modelSelect.value = "groq:llama-3.3-70b-versatile";
                    modelSelect.querySelectorAll('optgroup[label="Local (Ollama)"] option')
                        .forEach(opt => opt.disabled = true);
                }

                return sendToAI(); // Retry with cloud
            }
        }

        // Helper to ensure we get a string even if AI returns an object
        const getString = (val) => {
            if (!val) return "";
            if (typeof val === 'object') {
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
        saveBtn.style.display = "flex"; // Changed from block to flex for centered text
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
    const email = shadowRoot.getElementById("res-email-input").value.trim().toLowerCase();

    const data = {
        id: Date.now(),
        name: shadowRoot.getElementById("res-name-input").value.trim(),
        email: email,
        location: shadowRoot.getElementById("res-location-input").value.trim(),
        phone: normalizePhone(shadowRoot.getElementById("res-phone-input").value.trim()),
        profile: shadowRoot.getElementById("res-profile-input").value.trim(),
        timestamp: new Date().toISOString()
    };

    const result = await chrome.storage.local.get({ savedleads: [] });
    let leads = result.savedleads;

    // Check for duplicate EMAIL
    const isDuplicate = email && leads.some(l => l.email && l.email.toLowerCase() === email);

    if (isDuplicate) {
        saveBtn.innerText = "Already in List!";
        saveBtn.style.background = "#f59e0b"; // Orange/Amber
        setTimeout(() => {
            saveBtn.innerText = "Add to List";
            saveBtn.style.background = "#10b981";
        }, 3000);
        return;
    }

    leads.unshift(data);
    await chrome.storage.local.set({ savedleads: leads });

    saveBtn.innerText = "Added! ✓";
    saveBtn.style.background = "#059669";
    setTimeout(() => {
        saveBtn.innerText = "Add to List";
        saveBtn.style.background = "#10b981";
    }, 2000);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
