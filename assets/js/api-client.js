/**
 * api-client.js — Secure backend adapter for 닥터영어친구 Dr.0579
 *
 * Phase 1: Backend is NOT yet implemented.
 * All calls gracefully degrade and return a "backend not connected" indicator
 * so the UI remains functional and informative without exposing any secrets.
 *
 * Phase 2 will implement the real backend endpoint and this file will simply
 * have the BACKEND_URL constant updated — no other frontend changes needed.
 */

'use strict';

/* ─── Configuration ──────────────────────────────────────────────────── */
// Point this at your Phase 2 secure backend when it is deployed.
// NEVER put API keys here. The backend proxy holds the key server-side.
const BACKEND_URL = ''; // e.g. 'https://api.your-domain.com' — leave empty in Phase 1

const REQUEST_TIMEOUT_MS = 15000;
const MAX_RETRIES = 1;

/* ─── Graceful fallback sentinel ─────────────────────────────────────── */
const BACKEND_NOT_CONNECTED = Object.freeze({
  _backendNotConnected: true,
  message: 'Secure tutor backend not connected yet. Running in offline practice mode. 🔧\n\n' +
           '(백엔드 서버가 아직 연결되지 않았습니다. 오프라인 연습 모드로 실행됩니다.)'
});

/* ─── Internal helpers ───────────────────────────────────────────────── */
function isBackendConfigured() {
  return typeof BACKEND_URL === 'string' && BACKEND_URL.trim().length > 0;
}

/**
 * Fetch with timeout support.
 * @param {string} url
 * @param {RequestInit} options
 * @param {number} timeoutMs
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * POST JSON to a backend endpoint.
 * @param {string} path — e.g. '/api/chat'
 * @param {object} body
 * @returns {Promise<object>} — parsed JSON response
 */
async function postJSON(path, body) {
  const url = BACKEND_URL + path;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: JSON.stringify(body),
    credentials: 'same-origin'
  };

  let lastErr;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const resp = await fetchWithTimeout(url, options, REQUEST_TIMEOUT_MS);
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      }
      return await resp.json();
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}

/* ─── Public API ─────────────────────────────────────────────────────── */

/**
 * Start a new tutoring session with the backend.
 * @param {{ sessionId: string, studentName: string }} params
 * @returns {Promise<object>}
 */
async function startSession({ sessionId, studentName }) {
  if (!isBackendConfigured()) return BACKEND_NOT_CONNECTED;
  try {
    return await postJSON('/api/session/start', {
      sessionId,
      studentName,
      clientTimestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[api-client] startSession failed:', err.message);
    return BACKEND_NOT_CONNECTED;
  }
}

/**
 * Send a student message and receive the bilingual tutor reply.
 * @param {{ sessionId: string, studentName: string, message: string, turnIndex: number }} params
 * @returns {Promise<object>}
 */
async function sendMessage({ sessionId, studentName, message, turnIndex }) {
  if (!isBackendConfigured()) return BACKEND_NOT_CONNECTED;
  try {
    return await postJSON('/api/chat', {
      sessionId,
      studentName,
      message,
      turnIndex,
      clientTimestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[api-client] sendMessage failed:', err.message);
    return BACKEND_NOT_CONNECTED;
  }
}

/**
 * End the session and request a performance report.
 * @param {{ sessionId: string, studentName: string, turnCount: number }} params
 * @returns {Promise<object>}
 */
async function endSession({ sessionId, studentName, turnCount }) {
  if (!isBackendConfigured()) return BACKEND_NOT_CONNECTED;
  try {
    return await postJSON('/api/session/end', {
      sessionId,
      studentName,
      turnCount,
      clientTimestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[api-client] endSession failed:', err.message);
    return BACKEND_NOT_CONNECTED;
  }
}

/* ─── Export ─────────────────────────────────────────────────────────── */
window.Dr0579ApiClient = {
  startSession,
  sendMessage,
  endSession,
  BACKEND_NOT_CONNECTED
};
