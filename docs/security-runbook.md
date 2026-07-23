# Security Runbook — 닥터영어친구 Dr.0579

> **Audience:** Site administrator / Dr.0579 Academy team  
> **Scope:** Phase 1 (GitHub Pages frontend) and Phase 2 (planned backend proxy)  
> **Last updated:** 2026-07-23

---

## 1. Routine Log Review Checklist

Perform the following checks **weekly** (Phase 2 — when backend logging is active):

### 1.1 Request volume review
- [ ] Total requests for the past 7 days — compare against prior week baseline.
- [ ] Requests per hour broken down by day — flag spikes > 3× the daily average.
- [ ] Top 10 source IPs by request count — investigate any single IP > 100 req/day.
- [ ] Top 10 session IDs by request count — flag any session > 50 requests.

### 1.2 Error rate review
- [ ] Count of HTTP 4xx responses — large counts may indicate probing/scanning.
- [ ] Count of HTTP 5xx responses — may indicate backend errors or overload.
- [ ] Count of CORS rejection events — spikes indicate off-origin abuse attempts.
- [ ] Count of rate-limit hits — rising trend may indicate targeted abuse.

### 1.3 Origin / Referer review
- [ ] Requests with Referer outside `https://doctor0579.github.io` — all should be blocked; confirm count is ~0.
- [ ] Requests with missing or spoofed Origin header — confirm backend rejects these.

### 1.4 Token / session review
- [ ] Expired token replay attempts — flag any > 0.
- [ ] Session IDs seen across multiple IPs — may indicate session sharing/theft.

### 1.5 AI usage review
- [ ] Total AI API tokens consumed — compare against expected and billing alerts.
- [ ] Average tokens per session — flag sessions far above average (possible prompt injection).
- [ ] Rejected outputs from safety filter — review patterns for policy abuse.

---

## 2. Suspicious Activity Indicators

| Indicator | Threshold | Action |
|-----------|-----------|--------|
| Single IP > 100 req/day | Any occurrence | Investigate → block if confirmed abuse |
| 4xx rate > 10% of total | Sustained > 1 hour | Investigate origin / user-agent |
| CORS rejections > 5/hour | Any occurrence | Log, review, consider WAF rule |
| Rate-limit hits > 50/hour | Any occurrence | Review session IDs, consider tightening limits |
| Token replay attempt | Any occurrence | Invalidate all active tokens, review logs |
| AI token spend > 2× baseline | Any day | Review top sessions, check for prompt injection |
| Requests with unusual user-agents | Pattern burst | Block user-agent pattern at WAF |
| `.env` file accessed in repo | Any PR/push | Revoke and rotate all keys immediately |

---

## 3. Incident Response Steps

### 3.1 Suspected API key compromise
1. **Immediately rotate** the AI API key (see Section 4).
2. **Revoke** the old key from the AI provider dashboard.
3. **Audit** token usage for the past 30 days — check for unexpected charges.
4. **Review** git history for accidental commits of the old key.
5. **Review** CI logs for any workflow that may have printed the key.
6. **Document** the incident: date, suspected vector, actions taken.

### 3.2 Suspected session token abuse
1. Invalidate all currently issued session tokens (rolling secret rotation).
2. Review session logs for the abusing session ID and associated IP.
3. Block the IP at the edge/WAF level.
4. Notify users if their session data may have been affected.

### 3.3 DDoS / burst traffic
1. Enable rate limiting at stricter thresholds (e.g., 5 req/min per IP).
2. Enable Cloudflare "Under Attack" mode if using Cloudflare.
3. Monitor backend health and scale if needed.
4. After attack subsides, review access logs to determine origin and adjust rules.

### 3.4 Content / prompt injection attempt detected
1. Review the flagged conversation in logs (hashed identifiers only — no PII).
2. Strengthen system prompt boundary rules in the backend prompt template.
3. Add the detected injection pattern to the input filter blocklist.
4. If the model produced unsafe output, report to the AI provider's safety team.

### 3.5 Secret accidentally committed to git
1. **Do not panic — act quickly.**
2. Revoke/rotate the exposed secret immediately (see Section 4).
3. Use `git filter-repo` or BFG Repo Cleaner to remove the secret from history.
4. Force-push the cleaned history (coordinate with all collaborators).
5. Enable GitHub secret scanning + push protection to prevent recurrence.
6. Notify affected service providers.

---

## 4. Key Rotation Playbook

### 4.1 AI API key rotation (Phase 2 backend)
1. Log in to the AI provider dashboard (e.g., Google AI Studio, OpenAI).
2. Generate a **new** API key.
3. Update the key in the backend environment variable (`AI_API_KEY`) without downtime:
   - For serverless: update the env var in the platform dashboard and redeploy.
   - For containers: update the secret in the secret manager and restart the service.
4. Verify the new key works by making a test request from the backend.
5. **Revoke the old key** in the provider dashboard.
6. Monitor error rates for 15 minutes post-rotation.
7. Record the rotation date in your key rotation log.

### 4.2 Session signing secret rotation
1. Generate a new HMAC signing secret (`openssl rand -hex 32`).
2. Update `SESSION_SECRET` in the backend environment.
3. Restart the backend — all existing tokens are invalidated.
4. Users will need to start a new session; this is acceptable.

### 4.3 Cloudflare Turnstile secret rotation
1. Log in to the Cloudflare dashboard → Turnstile.
2. Rotate the secret key for the site.
3. Update `TURNSTILE_SECRET` in the backend environment.
4. Test a challenge flow to confirm the new secret works.

### 4.4 Rotation schedule (recommended)
| Secret | Recommended rotation |
|--------|---------------------|
| AI API key | Every 90 days or immediately on suspicion |
| Session signing secret | Every 90 days or immediately on suspicion |
| Turnstile secret | Every 180 days or immediately on suspicion |

---

## 5. Contact & Escalation

- **Primary admin:** Dr.0579 Academy administrator
- **GitHub repository:** https://github.com/Doctor0579/Dr.0579
- **AI provider support:** Contact via your provider's security/abuse team
- **Cloudflare support:** https://support.cloudflare.com (if using Cloudflare)

---

*This runbook should be reviewed and updated after every significant architecture change or security incident.*
