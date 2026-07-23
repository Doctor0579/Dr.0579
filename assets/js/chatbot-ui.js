/**
 * chatbot-ui.js — 닥터영어친구 Dr.0579 bilingual tutoring UI
 *
 * Phase 1 flow (offline practice mode):
 *   1. Warm welcome (EN + KO)
 *   2. Ask student name → store in session state
 *   3. Daily conversation practice (interesting daily-life questions)
 *   4. After each student reply: bilingual response + correction display
 *   5. End-of-session → encouraging performance report card
 *
 * All API calls go through api-client.js.
 * When backend is not connected, an offline curriculum runs instead.
 */

'use strict';

/* ─── Offline curriculum ──────────────────────────────────────────────── */
const OFFLINE_QUESTIONS = [
  {
    en: 'What do you usually do in the morning before work or school?',
    ko: '출근이나 등교 전에 아침에 보통 무엇을 하나요?',
    tip_en: 'Try to use: "I usually … in the morning." or "First, I … then I …"',
    tip_ko: '이런 표현을 써 보세요: "I usually … in the morning." 또는 "First, I … then I …"'
  },
  {
    en: 'What is your favorite food and why do you like it?',
    ko: '가장 좋아하는 음식은 무엇이고 왜 좋아하나요?',
    tip_en: 'Try: "My favorite food is … because …" Use adjectives like delicious, spicy, sweet.',
    tip_ko: '"My favorite food is … because …" 형식으로 말해 보세요. delicious, spicy, sweet 같은 형용사를 사용해 보세요.'
  },
  {
    en: 'Tell me about a hobby you enjoy. How often do you do it?',
    ko: '즐기는 취미를 말해 보세요. 얼마나 자주 하나요?',
    tip_en: 'Use frequency adverbs: always, usually, often, sometimes, rarely.',
    tip_ko: '빈도 부사를 사용해 보세요: always, usually, often, sometimes, rarely.'
  },
  {
    en: 'Describe your hometown or neighbourhood. What do you like most about it?',
    ko: '고향이나 동네를 설명해 보세요. 무엇이 가장 마음에 드나요?',
    tip_en: 'Try: "My neighbourhood is … It has … I love it because …"',
    tip_ko: '"My neighbourhood is … It has … I love it because …" 형식으로 말해 보세요.'
  },
  {
    en: 'What did you do last weekend? Tell me two or three things.',
    ko: '지난 주말에 무엇을 했나요? 두세 가지를 말해 보세요.',
    tip_en: 'Use the past tense: went, watched, cooked, visited, played.',
    tip_ko: '과거형을 사용해 보세요: went, watched, cooked, visited, played.'
  },
  {
    en: 'What are your plans for the next holiday or vacation?',
    ko: '다음 휴일이나 방학에 어떤 계획이 있나요?',
    tip_en: 'Use future expressions: "I\'m going to …", "I plan to …", "I hope to …"',
    tip_ko: '미래 표현을 사용해 보세요: "I\'m going to …", "I plan to …", "I hope to …"'
  },
  {
    en: 'What kind of movies or TV shows do you enjoy? Tell me about a recent one.',
    ko: '어떤 영화나 TV 프로그램을 좋아하나요? 최근에 본 것을 말해 주세요.',
    tip_en: 'Describe plots with: "It\'s about …", "The main character …", "I liked it because …"',
    tip_ko: '줄거리를 설명할 때: "It\'s about …", "The main character …", "I liked it because …"'
  },
  {
    en: 'If you could travel anywhere in the world, where would you go and why?',
    ko: '세계 어디든 여행할 수 있다면 어디로 가고 싶나요? 이유는요?',
    tip_en: 'Use conditionals: "If I could … I would … because …"',
    tip_ko: '가정법을 사용해 보세요: "If I could … I would … because …"'
  },
  {
    en: 'What is something new you have learned recently — it can be anything!',
    ko: '최근에 새로 배운 것이 있나요? 어떤 것이든 괜찮아요!',
    tip_en: 'Try: "Recently I learned that …" or "I have been learning how to …"',
    tip_ko: '"Recently I learned that …" 또는 "I have been learning how to …" 형식을 써 보세요.'
  },
  {
    en: 'Tell me about your dream job or a goal you are working towards.',
    ko: '꿈의 직업이나 이루고 싶은 목표를 말해 보세요.',
    tip_en: 'Use: "My dream is to …", "I am working towards …", "Someday I hope to …"',
    tip_ko: '"My dream is to …", "I am working towards …", "Someday I hope to …" 표현을 사용해 보세요.'
  }
];

/* Offline correction categories shown in fallback mode */
const CORRECTION_PLACEHOLDER = Object.freeze({
  grammar:     null,
  vocabulary:  null,
  collocation: null,
  expression:  null
});

/* ─── Session state ───────────────────────────────────────────────────── */
const state = {
  sessionId:    null,
  studentName:  '',
  phase:        'welcome',   // welcome | name | conversation | ended
  turnIndex:    0,
  questionIndex: 0,
  metrics: {
    attempts:  0,
    responses: []            // { question, answer, corrections }
  }
};

/* ─── DOM references (resolved after DOMContentLoaded) ───────────────── */
let dom = {};

function resolveDom() {
  dom = {
    messages:    document.getElementById('dr0579-messages'),
    input:       document.getElementById('dr0579-input'),
    sendBtn:     document.getElementById('dr0579-send'),
    progress:    document.getElementById('dr0579-progress'),
    reportCard:  document.getElementById('dr0579-report-card')
  };
}

/* ─── Rendering helpers ───────────────────────────────────────────────── */
const { textToSafeHtml, escapeHtml } = window.Dr0579Security;

function appendMessage(htmlContent, role) {
  const wrap = document.createElement('div');
  wrap.className = `dr0579-message ${role}`;
  wrap.innerHTML = htmlContent;
  dom.messages.appendChild(wrap);
  dom.messages.scrollTop = dom.messages.scrollHeight;
}

function appendBotMessage(enText, koText, corrections) {
  let html = '';

  html += `<div class="msg-en"><span class="lang-badge en-badge">EN</span>${textToSafeHtml(enText)}</div>`;

  if (koText) {
    html += `<div class="msg-ko"><span class="lang-badge ko-badge">KO</span>${textToSafeHtml(koText)}</div>`;
  }

  if (corrections) {
    const cats = [
      { key: 'grammar',     label: '📝 Grammar' },
      { key: 'vocabulary',  label: '📖 Vocabulary' },
      { key: 'collocation', label: '🔗 Collocation' },
      { key: 'expression',  label: '💬 Expression/Context' }
    ];
    const hasFeedback = cats.some(c => corrections[c.key]);
    if (hasFeedback) {
      html += '<div class="corrections-block">';
      cats.forEach(c => {
        if (corrections[c.key]) {
          html += `<div class="correction-item correction-${c.key}">
            <span class="correction-label">${escapeHtml(c.label)}</span>
            <span class="correction-text">${textToSafeHtml(corrections[c.key])}</span>
          </div>`;
        }
      });
      html += '</div>';
    }
  }

  appendMessage(html, 'bot');
}

function appendUserMessage(text) {
  appendMessage(textToSafeHtml(text), 'user');
}

function setInputEnabled(enabled) {
  dom.input.disabled = !enabled;
  dom.sendBtn.disabled = !enabled;
  dom.sendBtn.textContent = enabled ? '✉️ 보내기 Send' : '⏳ …';
}

function updateProgress() {
  if (!dom.progress) return;
  if (state.phase === 'conversation' || state.phase === 'ended') {
    const total = OFFLINE_QUESTIONS.length;
    const done  = Math.min(state.questionIndex, total);
    dom.progress.innerHTML =
      `<strong>📊 Progress:</strong> Question ${done} / ${total} &nbsp;|&nbsp; ` +
      `<strong>Session:</strong> ${escapeHtml(state.studentName || '—')}`;
  } else {
    dom.progress.innerHTML = '<strong>닥터영어친구 Dr.0579</strong> — Bilingual English Tutor 🌟';
  }
}

/* ─── Offline response generator ─────────────────────────────────────── */
function buildOfflineReply(userMessage) {
  const q = OFFLINE_QUESTIONS[state.questionIndex] || null;

  // Detect basic issues to provide illustrative offline corrections
  const corrections = detectOfflineCorrections(userMessage);

  const name = state.studentName ? `${escapeHtml(state.studentName)}` : 'Student';

  let enText = `Great job, ${name}! 👏 Thank you for sharing that with me.\n\n` +
               `You expressed yourself well! Keep practicing — every sentence makes you stronger. 💪`;

  let koText = `잘했어요, ${name}! 👏 공유해 주셔서 감사합니다.\n\n` +
               `표현을 잘 하셨어요! 계속 연습하세요 — 모든 문장이 여러분을 더 강하게 만들어 줍니다. 💪`;

  // Add next question if available
  const nextIndex = state.questionIndex + 1;
  const nextQ = OFFLINE_QUESTIONS[nextIndex] || null;
  if (nextQ) {
    enText += `\n\n📌 **Next question:**\n${nextQ.en}\n\n💡 ${nextQ.tip_en}`;
    koText += `\n\n📌 **다음 질문:**\n${nextQ.ko}\n\n💡 ${nextQ.tip_ko}`;
  } else {
    enText += '\n\n🎉 You have answered all 10 questions! Type "report" to see your performance report, or keep chatting!';
    koText += '\n\n🎉 10개의 질문을 모두 완료했습니다! "report"를 입력하면 성과 보고서를 볼 수 있어요!';
  }

  return { enText, koText, corrections };
}

/**
 * Very lightweight offline correction hints to illustrate the feature.
 * Real corrections come from the AI backend in Phase 2.
 */
function detectOfflineCorrections(text) {
  const corrections = {};
  const lower = text.toLowerCase();

  // Simple subject-verb agreement hint
  if (/\bi goes\b|\bhe go\b|\bshe go\b|\bthey goes\b/.test(lower)) {
    corrections.grammar = 'Check subject-verb agreement: "he/she/it goes", "they go".';
  }
  // a/an hint
  if (/\ba [aeiou]/i.test(text)) {
    corrections.grammar = (corrections.grammar ? corrections.grammar + ' ' : '') +
      'Remember: use "an" before words that start with a vowel sound (a, e, i, o, u).';
  }
  // Spelling common mistakes
  if (/\bgood at\s+\w+ing\b/i.test(text)) {
    // correct pattern — give positive vocab note
    corrections.vocabulary = '✅ "good at + gerund" — perfect collocation!';
  }

  return Object.keys(corrections).length > 0 ? corrections : null;
}

/* ─── Performance report ─────────────────────────────────────────────── */
function showPerformanceReport() {
  state.phase = 'ended';
  setInputEnabled(false);

  const name = state.studentName || 'Student';
  const attempts = state.metrics.attempts;
  const questionsAnswered = Math.min(state.questionIndex, OFFLINE_QUESTIONS.length);

  // Build encouraging report HTML
  const reportHtml = `
    <div class="report-card" aria-label="Performance Report">
      <div class="report-header">
        🏆 Performance Report — 성과 보고서
      </div>
      <div class="report-student">
        🌟 Well done, <strong>${escapeHtml(name)}</strong>! 수고했어요!
      </div>

      <div class="report-scores">
        <div class="score-item">
          <span class="score-label">📊 Questions Answered</span>
          <span class="score-value">${questionsAnswered} / ${OFFLINE_QUESTIONS.length}</span>
        </div>
        <div class="score-item">
          <span class="score-label">💬 Total Turns</span>
          <span class="score-value">${attempts}</span>
        </div>
        <div class="score-item">
          <span class="score-label">🎯 Participation</span>
          <span class="score-value score-star">⭐⭐⭐⭐⭐ Excellent!</span>
        </div>
        <div class="score-item">
          <span class="score-label">📈 Effort</span>
          <span class="score-value score-star">⭐⭐⭐⭐⭐ Outstanding!</span>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-title">💪 Strengths — 잘한 점</div>
        <ul class="report-list">
          <li>You showed great courage in expressing yourself in English! 영어로 자신을 표현하는 데 큰 용기를 보여줬습니다!</li>
          <li>Your willingness to engage and keep trying is truly inspiring. 참여하고 계속 도전하려는 의지가 정말 감동적입니다.</li>
          <li>Every answer you gave helped you grow — that is what real learning looks like! 여러분이 한 모든 대답이 성장을 도와줬습니다 — 이것이 진정한 배움입니다!</li>
        </ul>
      </div>

      <div class="report-section">
        <div class="report-section-title">🚀 Growth Areas — 발전 방향</div>
        <ul class="report-list">
          <li>Keep building vocabulary by reading a little English every day. 매일 조금씩 영어를 읽으면서 어휘를 계속 쌓으세요.</li>
          <li>Practice speaking aloud — even just repeating the questions and your answers. 소리 내어 연습하세요 — 질문과 대답을 반복하는 것만으로도 충분합니다.</li>
          <li>Notice how native speakers connect ideas: "because, so, however, although". 원어민이 아이디어를 연결하는 방식에 주목하세요: "because, so, however, although".</li>
        </ul>
      </div>

      <div class="report-encouragement">
        🎉 <strong>Teacher's Message:</strong><br>
        You did a fantastic job today, <strong>${escapeHtml(name)}</strong>!
        Learning English is a journey, and every step counts.
        닥터영어친구 is proud of you and excited to see you grow even more!<br><br>
        오늘 정말 멋졌어요, <strong>${escapeHtml(name)}</strong>!
        영어 배우기는 여행과 같아요 — 모든 한 걸음이 중요합니다.
        닥터영어친구는 여러분을 자랑스럽게 생각하고 더욱 성장하는 모습을 기대합니다! 💙
      </div>

      <div class="report-footer">
        닥터영어친구 Dr.0579 &nbsp;|&nbsp; Phase 1 — Offline Practice Mode
      </div>
    </div>
  `;

  if (dom.reportCard) {
    dom.reportCard.innerHTML = reportHtml;
    dom.reportCard.style.display = 'block';
    dom.reportCard.scrollIntoView({ behavior: 'smooth' });
  }

  updateProgress();
  window.Dr0579Security.logEvent('session_ended', {
    studentName: name,
    attempts,
    questionsAnswered
  });
}

/* ─── Main message handler ───────────────────────────────────────────── */
async function handleSend() {
  const raw = dom.input.value;
  const { validateMessage, canSendNow, logEvent } = window.Dr0579Security;

  if (!canSendNow()) return;

  const validation = validateMessage(raw);
  if (!validation.valid) return;

  const text = raw.trim();
  dom.input.value = '';
  setInputEnabled(false);
  appendUserMessage(text);

  const lower = text.toLowerCase();

  /* ── Phase: name collection ── */
  if (state.phase === 'name') {
    const { validateName } = window.Dr0579Security;
    const nameValidation = validateName(text);
    if (!nameValidation.valid) {
      appendBotMessage(
        'Please tell me your name so I can call you properly! 😊',
        '이름을 알려주세요! 😊',
        null
      );
      setInputEnabled(true);
      return;
    }
    state.studentName = text.trim();
    sessionStorage.setItem('dr0579_student_name', state.studentName);
    state.phase = 'conversation';
    state.questionIndex = 0;
    updateProgress();

    const q = OFFLINE_QUESTIONS[0];
    const enText =
      `Wonderful! Nice to meet you, **${state.studentName}**! 🎉\n\n` +
      `I'm 닥터영어친구 (Dr.0579), your bilingual English tutor. I'm here to help you express yourself confidently in English — and I'll always explain in Korean too, so don't worry!\n\n` +
      `Let's start our first conversation question:\n\n📌 **${q.en}**\n\n💡 ${q.tip_en}`;
    const koText =
      `만나서 반가워요, **${state.studentName}**! 🎉\n\n` +
      `저는 닥터영어친구입니다. 영어 실력을 자신 있게 키울 수 있도록 도와드릴게요. 항상 한국어로도 설명해 드리니 걱정하지 마세요!\n\n` +
      `첫 번째 대화 질문을 시작해 볼게요:\n\n📌 **${q.ko}**\n\n💡 ${q.tip_ko}`;

    appendBotMessage(enText, koText, null);
    logEvent('name_collected', { studentName: state.studentName });
    setInputEnabled(true);
    return;
  }

  /* ── Phase: conversation ── */
  if (state.phase === 'conversation') {
    state.metrics.attempts += 1;

    // Check for report request or goodbye
    if (lower === 'report' || lower === 'end' || lower === 'goodbye' || lower === '끝' || lower === '종료') {
      appendBotMessage(
        'Great! Let me prepare your performance report… 📊',
        '성과 보고서를 준비하고 있습니다… 📊',
        null
      );
      setTimeout(showPerformanceReport, 400);
      return;
    }

    state.metrics.responses.push({ question: state.questionIndex, answer: text });

    // Try backend first; fall back to offline
    let enText, koText, corrections;
    const apiResult = await window.Dr0579ApiClient.sendMessage({
      sessionId:   state.sessionId,
      studentName: state.studentName,
      message:     text,
      turnIndex:   state.turnIndex
    });

    if (apiResult._backendNotConnected) {
      // Show backend-not-connected notice once
      if (state.turnIndex === 0) {
        appendBotMessage(
          '🔧 ' + apiResult.message,
          null,
          null
        );
      }
      const offline = buildOfflineReply(text);
      enText      = offline.enText;
      koText      = offline.koText;
      corrections = offline.corrections;
    } else {
      // Backend connected — use its response
      enText      = apiResult.english   || '';
      koText      = apiResult.korean    || '';
      corrections = apiResult.corrections || null;
    }

    state.turnIndex += 1;
    // questionIndex tracks how many question-answer pairs have been completed.
    // Incrementing without capping lets us reliably detect end-of-curriculum.
    state.questionIndex += 1;
    updateProgress();
    appendBotMessage(enText, koText, corrections);
    logEvent('turn_complete', { turnIndex: state.turnIndex });

    // Auto-show report once the student has answered all curriculum questions
    if (state.questionIndex >= OFFLINE_QUESTIONS.length) {
      setTimeout(() => {
        appendBotMessage(
          '🎉 You have completed all the questions! Let me show your performance report…',
          '🎉 모든 질문을 완료하셨습니다! 성과 보고서를 보여드릴게요…',
          null
        );
        setTimeout(showPerformanceReport, 600);
      }, 800);
      return;
    }

    setInputEnabled(true);
    dom.input.focus();
    return;
  }

  // Fallback for unexpected phase
  setInputEnabled(true);
}

/* ─── Initialisation ─────────────────────────────────────────────────── */
async function init() {
  resolveDom();
  if (!dom.messages || !dom.input || !dom.sendBtn) {
    console.warn('[chatbot-ui] Required DOM elements not found. Chatbot will not initialize.');
    return;
  }

  // Generate session ID
  state.sessionId = window.Dr0579Security.getOrCreateSessionId();

  // Wire send button and Enter key
  dom.sendBtn.addEventListener('click', handleSend);
  dom.input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Enforce max input length via HTML attribute
  dom.input.setAttribute('maxlength', String(window.Dr0579Security.MAX_INPUT_LENGTH));

  state.phase = 'name';
  updateProgress();

  // Try to notify backend (no-op in Phase 1)
  await window.Dr0579ApiClient.startSession({
    sessionId:   state.sessionId,
    studentName: ''
  });

  // Show welcome
  appendBotMessage(
    `👋 **Welcome to 닥터영어친구 Dr.0579!** 🌟\n\n` +
    `I am your bilingual English tutor — here to help you speak and write English with confidence, one conversation at a time! Every answer you give is a step forward, so there are no wrong answers here. 😊\n\n` +
    `Let's start with something simple: **What is your name?**\n(You can use your English name, Korean name, or a nickname — whatever you prefer!)`,
    `👋 **닥터영어친구 Dr.0579에 오신 것을 환영합니다!** 🌟\n\n` +
    `저는 여러분의 이중 언어 영어 선생님입니다 — 한 번에 하나씩 대화를 나누며 영어를 자신 있게 말하고 쓸 수 있도록 도와드릴게요! 모든 대답은 앞으로 나아가는 한 걸음이므로, 틀린 대답은 없습니다. 😊\n\n` +
    `간단한 것부터 시작해 봅시다: **이름이 무엇인가요?**\n(영어 이름, 한국어 이름, 또는 닉네임 — 편한 것을 사용하세요!)`,
    null
  );

  window.Dr0579Security.logEvent('session_started', { sessionId: state.sessionId });
}

document.addEventListener('DOMContentLoaded', init);
