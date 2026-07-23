# Dr.0579

> "The world's best English self-learning website for all Koreans and ESL students who are interested in learning English and Korean at the same time."

---

## 🌟 About

**Dr.0579** is a free, bilingual English-learning platform hosted on GitHub Pages.  
The flagship feature is **닥터영어친구 (Dr.0579 AI)** — a bilingual English tutor that teaches through natural conversation, provides bilingual (EN + KO) responses, corrects mistakes across grammar/vocabulary/collocation/expression, and delivers an encouraging performance report at the end of each session.

---

## 🔐 Security Architecture

### Current deployment (Phase 1)

```
Student browser (GitHub Pages)
        │
        │  HTTPS only
        │
        ▼
  index.html + assets/js/ + assets/css/
        │
        │  Frontend only — no AI API keys here
        │
        ▼
  api-client.js (adapter)
   ├─ Backend not yet deployed → offline practice mode
   └─ (Phase 2) → Secure backend proxy (planned)
```

- The GitHub Pages site is **pure frontend** — HTML, CSS, and JavaScript only.
- **No AI/Gemini/OpenAI API keys exist anywhere in the frontend code.**
- All AI calls are routed through `assets/js/api-client.js`, which targets a future secure backend endpoint.
- When the backend is unavailable (Phase 1), the chatbot degrades gracefully to an offline curriculum with a clear notice to the user.

### Why frontend API keys are prohibited

Anything placed in frontend JavaScript on a public GitHub repository is:
- Visible to anyone who views source or opens DevTools.
- Trivially extractable by automated scrapers.
- Impossible to revoke without a full key rotation and redeployment.

Embedding an API key in frontend code **is equivalent to publishing it publicly**. It will be found and abused, leading to unexpected charges and potential service suspension.

### Phase 2 — Planned secure backend proxy

The backend will handle:
| Control | Implementation |
|---------|---------------|
| API key storage | Server environment variable only |
| Origin/Referer allowlist | `https://doctor0579.github.io` only |
| Per-IP and per-session rate limiting | ~10 req/min per IP |
| Bot protection | Cloudflare Turnstile (optional toggle) |
| Short-lived signed session tokens | HMAC-signed, 1-hour TTL |
| Prompt injection filtering | System-prompt boundary enforcement |
| Output moderation | Safety layer before returning to client |
| Request logging | Structured logs (no raw secrets, IP hashed) |
| CORS headers | Strict allowlist, no wildcard |
| Security headers | CSP, HSTS, X-Frame-Options, Referrer-Policy |

---

## 📊 Phase 1 Status

| Area | Status |
|------|--------|
| Frontend chatbot UI (닥터영어친구 Dr.0579) | ✅ Implemented |
| Bilingual EN/KO responses | ✅ Offline curriculum |
| Name onboarding + session state | ✅ Implemented |
| Correction display (grammar/vocab/collocation/expression) | ✅ UI scaffold |
| Encouraging performance report card | ✅ Implemented |
| Input validation + sanitization | ✅ Implemented (`security.js`) |
| Backend API adapter (graceful fallback) | ✅ Implemented (`api-client.js`) |
| Security CI workflow (gitleaks + npm audit) | ✅ Implemented |
| Security meta tags (CSP, Referrer-Policy) | ✅ Added to `index.html` |
| Secure backend proxy | ⏳ Phase 2 |
| Rate limiting / bot protection | ⏳ Phase 2 |
| Logging / anomaly alerts | ⏳ Phase 2 |

---

## 🛠️ Local Development

```bash
# Clone
git clone https://github.com/Doctor0579/Dr.0579.git
cd Dr.0579

# Serve locally (any static server works)
npx serve .
# or
python3 -m http.server 8080
```

Open `http://localhost:8080` in your browser.

---

## ⚙️ Environment Variables (Phase 2 backend)

See `.env.example` for required variables.  
**Never commit real values to the repository.**

---

## 🚨 Abuse Mitigation Plan

- **Rate limiting** — enforced server-side in Phase 2 (IP + session).
- **Origin check** — backend rejects requests not from `doctor0579.github.io`.
- **Session tokens** — short-lived signed tokens prevent token reuse.
- **Bot protection** — Cloudflare Turnstile challenge before first AI call.
- **Log monitoring** — structured request logs reviewed weekly for anomalies.
- **Key rotation** — rotate AI API key immediately upon any suspected compromise; see `docs/security-runbook.md`.
- **IP blocking** — known abusive IPs blocked at edge/WAF level.

---

## 📁 File Structure

```
Dr.0579/
├── index.html                    # Main page
├── peacemaker.html               # Peacemaker teaching theory
├── assets/
│   ├── js/
│   │   ├── security.js           # Input validation, sanitization, session UUID
│   │   ├── api-client.js         # Backend adapter (graceful fallback in Phase 1)
│   │   └── chatbot-ui.js         # Dr.0579 bilingual tutoring UI
│   └── css/
│       └── chatbot.css           # Chatbot styles (bubbles, corrections, report)
├── .github/
│   └── workflows/
│       └── security.yml          # CI: secret scanning + dependency audit
├── docs/
│   └── security-runbook.md       # Operational security playbook
├── .env.example                  # Placeholder env vars for Phase 2 backend
└── README.md
```

---

## 📖 Security Runbook

See [`docs/security-runbook.md`](docs/security-runbook.md) for:
- Routine log review checklist
- Suspicious activity indicators
- Incident response steps
- Key rotation playbook

---

© Dr.0579 Academy | All Rights Reserved
