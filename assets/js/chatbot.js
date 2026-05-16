/* ============================================
   PORTFOLIO CHATBOT — Gemini API + EmailJS
   ============================================ */

const GEMINI_API_KEY = CONFIG.GEMINI_API_KEY;
const GEMINI_MODEL   = "gemini-2.5-flash";
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const EMAILJS_PUBLIC_KEY  = EMAIL_CONFIG.EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID  = EMAIL_CONFIG.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = EMAIL_CONFIG.EMAILJS_TEMPLATE_ID;

// Pages to fetch content from
const PORTFOLIO_PAGES = [
    { label: "HCLTech Experience",        url: "Professional-Experience/HCL.html" },
    { label: "Kaaylabs Experience",       url: "Professional-Experience/Kaaylabs1.html" },
    { label: "LTI Experience",            url: "Professional-Experience/LTI.html" },
    { label: "Kaaylabs Internship",       url: "Internship-Experience/Kaaylabs.html" },
    { label: "NEC Internship",            url: "Internship-Experience/NEC.html" },
    { label: "UTD Education",             url: "Education/UTD.html" },
    { label: "Anna University Education", url: "Education/SVCE.html" },
];

const BASE_PROMPT = `
You are a friendly assistant on Prriyamvradha Parthasarathi's (Prriyam) portfolio website.
Answer questions about Prriyam based only on the information provided below.
Keep answers concise, warm, and professional.
If someone wants to contact or email Prriyam, respond with exactly: [SHOW_EMAIL_FORM]
If asked something you don't know, say you're not sure but they can reach out directly via the contact form.

--- BASIC INFO ---
Name: Prriyamvradha Parthasarathi (goes by Prriyam)
Location: Dallas, Texas, United States
Email: prriyamvradha@gmail.com
LinkedIn: https://www.linkedin.com/in/prriyam/
GitHub: https://github.com/Prriyam

TECHNICAL SKILLS:
- AI/ML: LLMs, LangChain, LangGraph, OpenAI SDK, RAG, Graph RAG, CrewAI, MLflow, Evaluation Frameworks
- Programming: Python, SQL, NoSQL, FAST API, React
- Cloud: Azure, AWS, Databricks
- Databases: MySQL, Oracle, MongoDB, Neo4j, Weaviate, Postgres Vector, SSIS
- Tools: Azure DevOps, VS Code, Databricks, GitHub, Jupyter Notebook, JIRA, Confluence

CERTIFICATIONS:
- Salesforce Certified AI Associate
- OpenAI – AI Technical Practitioner
- Gen AI Essential Training

PROJECTS: 48 total across Gen AI, NLP, ML (Python/R), Cloud, SQL, Big Data, Alteryx, Tableau, Power BI, Excel.
All projects are on GitHub: https://github.com/Prriyam

--- PORTFOLIO PAGE CONTENT (auto-fetched from site pages) ---
`;

let chatHistory = [];
let systemPrompt = BASE_PROMPT;

// ── Fetch portfolio pages ─────────────────────────────
async function fetchPortfolioContent() {
    const results = await Promise.allSettled(
        PORTFOLIO_PAGES.map(async (page) => {
            const res = await fetch(page.url);
            if (!res.ok) throw new Error(`Failed: ${page.url}`);
            const html = await res.text();
            const parser  = new DOMParser();
            const doc     = parser.parseFromString(html, "text/html");
            const content = doc.querySelector("#content") || doc.querySelector("main") || doc.body;
            const text    = content ? content.innerText.replace(/\s+/g, " ").trim() : "";
            return { label: page.label, text };
        })
    );

    let combined = "";
    results.forEach((result, i) => {
        if (result.status === "fulfilled") {
            combined += `\n\n[${PORTFOLIO_PAGES[i].label}]\n${result.value.text}`;
        }
    });
    return combined;
}

// ── DOM ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {

    // Load EmailJS
    const ejsScript = document.createElement("script");
    ejsScript.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    ejsScript.onload = () => emailjs.init(EMAILJS_PUBLIC_KEY);
    document.head.appendChild(ejsScript);

    // Inject widget HTML
    document.body.insertAdjacentHTML("beforeend", `
        <button id="chat-toggle" aria-label="Open chat">
            <svg class="icon-chat" viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg>
            <svg class="icon-close" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>

        <div id="chat-window" role="dialog" aria-label="Chat with Prriyam's assistant">
            <div id="chat-header">
                <div class="avatar">✨</div>
                <div class="info">
                    <h4>Prriyam's Assistant</h4>
                    <p>Ask me anything about Prriyam</p>
                </div>
            </div>
            <div id="chat-messages"></div>
            <div id="chat-input-area">
                <input id="chat-input" type="text" placeholder="Ask me anything..." autocomplete="off" />
                <button id="chat-send" aria-label="Send">
                    <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
                </button>
            </div>
        </div>
    `);

    const toggle   = document.getElementById("chat-toggle");
    const window_  = document.getElementById("chat-window");
    const messages = document.getElementById("chat-messages");
    const input    = document.getElementById("chat-input");
    const sendBtn  = document.getElementById("chat-send");

    addMessage("bot", "Hi there! 👋 I'm Prriyam's assistant. Ask me about her experience, skills, or projects — or if you'd like to get in touch, just say so!");

    // Fetch portfolio content in background
    fetchPortfolioContent().then((content) => {
        systemPrompt = BASE_PROMPT + content;
        console.log("✅ Portfolio content loaded.");
    }).catch(err => console.warn("⚠️ Could not load some pages:", err));

    // Toggle
    toggle.addEventListener("click", () => {
        toggle.classList.toggle("open");
        window_.classList.toggle("open");
        if (window_.classList.contains("open")) input.focus();
    });

    sendBtn.addEventListener("click", handleSend);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });

    async function handleSend() {
        const text = input.value.trim();
        if (!text) return;
        input.value = "";
        addMessage("user", text);
        showTyping();
        try {
            const reply = await callGemini(text);
            hideTyping();
            processReply(reply);
        } catch (err) {
            hideTyping();
            addMessage("bot", "Sorry, something went wrong. Please try again!");
            console.error("Gemini error:", err);
        }
    }

    function processReply(text) {
        if (text.includes("[SHOW_EMAIL_FORM]")) {
            const cleanText = text.replace("[SHOW_EMAIL_FORM]", "").trim();
            if (cleanText) addMessage("bot", cleanText);
            showEmailForm();
        } else {
            addMessage("bot", text);
        }
    }

    function showEmailForm() {
        const formEl = document.createElement("div");
        formEl.className = "chat-msg bot";
        formEl.innerHTML = `
            <div class="bubble email-form-bubble">
                <div class="email-form-title">📬 Send Prriyam a message</div>
                <input class="email-form-input" id="ef-name"    type="text"  placeholder="Your Name"    />
                <input class="email-form-input" id="ef-email"   type="email" placeholder="Your Email"   />
                <input class="email-form-input" id="ef-subject" type="text"  placeholder="Subject"      />
                <textarea class="email-form-input" id="ef-message" placeholder="Your message..." rows="3"></textarea>
                <button class="email-form-send" id="ef-send">Send Message 🚀</button>
                <div class="email-form-status" id="ef-status"></div>
            </div>
        `;
        messages.appendChild(formEl);
        messages.scrollTop = messages.scrollHeight;

        document.getElementById("ef-send").addEventListener("click", async () => {
            const name    = document.getElementById("ef-name").value.trim();
            const email   = document.getElementById("ef-email").value.trim();
            const subject = document.getElementById("ef-subject").value.trim();
            const message = document.getElementById("ef-message").value.trim();
            const status  = document.getElementById("ef-status");

            if (!name || !email || !subject || !message) {
                status.textContent = "Please fill in all fields.";
                status.style.color = "#e07070";
                return;
            }

            status.textContent = "Sending...";
            status.style.color = "#a89cc8";

            try {
                await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                    from_name:  name,
                    from_email: email,
                    subject:    subject,
                    message:    message,
                    time:       new Date().toLocaleString()
                });
                formEl.innerHTML = `<div class="bubble" style="background: linear-gradient(135deg,#efa8b0,#a89cc8); color:#fff;">
                    ✅ Message sent! Prriyam will get back to you soon.
                </div>`;
                addMessage("bot", "Your message has been sent! Is there anything else I can help you with?");
            } catch (err) {
                status.textContent = "Failed to send. Please try again.";
                status.style.color = "#e07070";
                console.error("EmailJS error:", err);
            }
        });
    }

    function addMessage(role, text) {
        const msgEl  = document.createElement("div");
        msgEl.className = `chat-msg ${role}`;
        const bubble = document.createElement("div");
        bubble.className = "bubble";
        bubble.textContent = text;
        msgEl.appendChild(bubble);
        messages.appendChild(msgEl);
        messages.scrollTop = messages.scrollHeight;
        return msgEl;
    }

    let typingEl = null;
    function showTyping() {
        typingEl = document.createElement("div");
        typingEl.className = "chat-msg bot";
        typingEl.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
        messages.appendChild(typingEl);
        messages.scrollTop = messages.scrollHeight;
    }
    function hideTyping() {
        if (typingEl) { typingEl.remove(); typingEl = null; }
    }

    async function callGemini(userMessage) {
        chatHistory.push({ role: "user", parts: [{ text: userMessage }] });
        const body = {
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: chatHistory,
            generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
        };
        const res = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data  = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure about that.";
        chatHistory.push({ role: "model", parts: [{ text: reply }] });
        if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
        return reply;
    }
});