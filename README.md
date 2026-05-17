# Prriyamvradha Parthasarathi — Portfolio

Personal portfolio website built with HTML, CSS, and JavaScript, showcasing my experience, education, and projects in AI, Data Engineering, and Machine Learning.

🌐 **Live Site:** [prriyamvradha.github.io](https://prriyamvradha.github.io)

---

## Features

- **AI Chatbot** — Gemini-powered assistant that answers questions about my portfolio and allows visitors to send emails directly from the chat
- **Experience Cards** — Clean card layout for Education, Professional Experience, and Internship sections
- **Project Gallery** — 48 projects filterable by category (Gen AI, NLP, ML, Cloud, SQL, Tableau, and more)
- **Contact Form** — Inline email form via EmailJS, no email client required
- **Smooth Navigation** — Scroll-based nav with active section highlighting
- **Google Analytics** — Integrated for visitor tracking

---

## Tech Stack

- HTML5, CSS3, JavaScript
- [Stellar by HTML5 UP](https://html5up.net) — Base theme
- [Gemini API](https://ai.google.dev) — Chatbot intelligence
- [EmailJS](https://emailjs.com) — Contact form email delivery
- GitHub Pages — Hosting

---

## Project Structure

```
prriyamvradha.github.io/
├── index.html
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   ├── chatbot.css
│   │   └── noscript.css
│   └── js/
│       ├── chatbot.js
│       ├── config.js          ← not committed (see setup)
│       ├── config.example.js
│       ├── main.js
│       └── ...
├── images/
├── Education/
│   ├── UTD.html
│   └── SVCE.html
├── Professional-Experience/
│   ├── HCL.html
│   ├── Kaaylabs1.html
│   └── LTI.html
└── Internship-Experience/
    ├── Kaaylabs.html
    └── NEC.html
```

---

## Local Setup

1. Clone the repository:
```bash
git clone https://github.com/prriyamvradha/prriyamvradha.github.io.git
cd prriyamvradha.github.io
```

2. Create `assets/js/config.js` from the example file:
```bash
cp assets/js/config.example.js assets/js/config.js
```

3. Add your API keys to `config.js`:
```js
const CONFIG = {
    GEMINI_API_KEY: "your-gemini-api-key"
};

const EMAIL_CONFIG = {
    EMAILJS_PUBLIC_KEY:  "your-emailjs-public-key",
    EMAILJS_SERVICE_ID:  "your-emailjs-service-id",
    EMAILJS_TEMPLATE_ID: "your-emailjs-template-id"
};
```

4. Run locally using a local server:
```bash
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000)

> **Note:** Opening `index.html` directly in the browser will not work — a local server is required for the chatbot to fetch portfolio page content.

---

## Environment Variables

`config.js` is excluded from version control via `.gitignore` to keep API keys private. Never commit this file.

| Key | Description |
|-----|-------------|
| `GEMINI_API_KEY` | Google Gemini API key from [aistudio.google.com](https://aistudio.google.com) |
| `EMAILJS_PUBLIC_KEY` | EmailJS public key from your account |
| `EMAILJS_SERVICE_ID` | EmailJS service ID |
| `EMAILJS_TEMPLATE_ID` | EmailJS email template ID |

---

## Contact

- **Email:** prriyamvradha@gmail.com
- **LinkedIn:** [linkedin.com/in/prriyam](https://www.linkedin.com/in/prriyam/)
- **GitHub:** [github.com/Prriyam](https://github.com/Prriyam)