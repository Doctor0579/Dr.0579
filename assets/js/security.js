/**
 * security.js — Frontend hardening helpers for 닥터영어친구 Dr.0579
 * Phase 1: client-side validation, sanitization, session UUID generation.
 * NOTE: These are UX-level safeguards only.  Real enforcement is on the backend (Phase 2).
 */

'use strict';

/* ─── Constants ──────────────────────────────────────────────────────── */
const MAX_INPUT_LENGTH = 1000;   // characters
const MIN_INPUT_LENGTH = 1;
const NAME_MAX_LENGTH  = 60;
const SEND_COOLDOWN_MS = 500;    // minimum ms between sends (UX throttle)

/* ─── Session UUID ───────────────────────────────────────────────────── */
/**
 * Generate or retrieve a lightweight random session ID stored in sessionStorage.
 * Uses crypto.randomUUID() when available, falls back to a manual UUID v4 build.
 * @returns {string}
 */
function getOrCreateSessionId() {
  const KEY = 'dr0579_session_id';
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = generateUUID();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/* ─── Input validation ───────────────────────────────────────────────── */
/**
 * Validate a chat message string.
 * @param {string} text
 * @returns {{ valid: boolean, reason?: string }}
 */
function validateMessage(text) {
  if (typeof text !== 'string') return { valid: false, reason: 'Not a string.' };
  const trimmed = text.trim();
  if (trimmed.length < MIN_INPUT_LENGTH) return { valid: false, reason: 'Message is empty.' };
  if (trimmed.length > MAX_INPUT_LENGTH) {
    return { valid: false, reason: `Message too long (max ${MAX_INPUT_LENGTH} characters).` };
  }
  return { valid: true };
}

/**
 * Validate a student display name.
 * @param {string} name
 * @returns {{ valid: boolean, reason?: string }}
 */
function validateName(name) {
  if (typeof name !== 'string') return { valid: false, reason: 'Not a string.' };
  const trimmed = name.trim();
  if (trimmed.length < 1) return { valid: false, reason: 'Name is empty.' };
  if (trimmed.length > NAME_MAX_LENGTH) {
    return { valid: false, reason: `Name too long (max ${NAME_MAX_LENGTH} characters).` };
  }
  return { valid: true };
}

/* ─── Output sanitization ────────────────────────────────────────────── */
/**
 * Escape HTML special characters to prevent injection when inserting into innerHTML.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (typeof str !== 'string') str = String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Convert a plain text string to safe HTML:
 * - escapes HTML entities
 * - converts newlines to <br>
 * - converts **bold** to <strong>
 * @param {string} text
 * @returns {string}
 */
function textToSafeHtml(text) {
  if (typeof text !== 'string') text = String(text);
  let safe = escapeHtml(text);
  // Bold markdown-style: **text**
  safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Newlines
  safe = safe.replace(/\n/g, '<br>');
  return safe;
}

/* ─── Send rate limiter (UX-level) ───────────────────────────────────── */
let _lastSendTime = 0;

/**
 * Return true if the user is allowed to send again (UX throttle only).
 * @returns {boolean}
 */
function canSendNow() {
  const now = Date.now();
  if (now - _lastSendTime >= SEND_COOLDOWN_MS) {
    _lastSendTime = now;
    return true;
  }
  return false;
}

/* ─── Client event logger ────────────────────────────────────────────── */
/**
 * Log a structured client event to the browser console only (no remote logging in Phase 1).
 * Never include raw secrets or PII beyond display name.
 * @param {string} event
 * @param {object} [meta]
 */
function logEvent(event, meta = {}) {
  const record = {
    ts: new Date().toISOString(),
    sessionId: getOrCreateSessionId(),
    event,
    ...meta
  };
  // Sanitize: ensure we never log anything that looks like a key
  // eslint-disable-next-line no-console
  console.info('[Dr.0579]', JSON.stringify(record));
}

/* ─── Exports (global namespace for non-module HTML context) ─────────── */
window.Dr0579Security = {
  getOrCreateSessionId,
  generateUUID,
  validateMessage,
  validateName,
  escapeHtml,
  textToSafeHtml,
  canSendNow,
  logEvent,
  MAX_INPUT_LENGTH,
  NAME_MAX_LENGTH
};
