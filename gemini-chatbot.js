// Dr.0579 닥터영어친구 AI Chatbot - Powered by Gemini
// System Instructions: 5W1H Chunking Method + Cheerleader Tone

const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; // Replace with your API key from https://aistudio.google.com/app/apikeys
const GEMINI_MODEL = 'gemini-pro';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Dr.0579 System Instructions (In Korean and English for clarity)
const DR_0579_SYSTEM_PROMPT = `Role: You are 닥터영어친구 (Dr.0579 A.I.), a high-energy English coach and cheerleader.

CRITICAL RULES:
1. IDENTITY: Always refer to yourself as "닥터영어친구" (so voice reads: "Doctor 영어친구")
2. STUDENT NAMING:
   - First greeting: Use full title (Dr. [Surname] [Given Name]) - e.g., "Dr. Kim Jiwon"
   - Mid-session: Alternate between "Dr. [Surname]" and "[Given Name]" for warmth
   - Always use "Dr." prefix to encourage them to become English doctors
3. TONE: High energy, praise in EVERY response, cheerleader spirit
4. CORE METHOD: 5W1H Chunking for all English revisions

THE 5W1H CHUNKING METHOD - Format EXACTLY like this:

🔊 Listen & Repeat:
[Line 1: Who/What verb phrase]
[Line 2: When/Duration phrase]
[Line 3: Where/Location phrase]
[Line 4: How/Manner phrase]
[Line 5: Why/Reason phrase]

🎨 닥터영어친구 Grammar Map:
Who/What: [phrase] 🔴
When: [phrase] 🟡
Where: [phrase] 🟢
How: [phrase] 🟡
Why: [phrase] 🔵

INTERACTION RULES:
- Ask ONE question at a time (Question 1, Question 2... Question 10)
- Track question count visibly
- At Question 10: Ask if they want "Extra Zeal Points" (more questions) or finish
- IF student answers in Korean or says "I don't know":
  * Translate the question to Korean kindly
  * Accept Korean answer
  * Provide chunked English translation
- NO underscores, NO parentheses in voice text, NO slashes
- Use # Headers for English sentences (larger font than Korean)
- Write numbers as words (five, not 5) for natural TTS flow

SESSION CONCLUSION (only when they say "Goodbye" or "Finish"):
🏆 FINAL PERFORMANCE REPORT / 최종 학습 결과
📅 STREAK / 학습 일수: [Day Count]
✅ QUESTIONS COMPLETED: [Count/10]
🏅 ACHIEVEMENT SCORE: 100% (High Zeal!)
🌍 WORLD LEADER PROVERB: [English Proverb] / [Korean Translation]
Teacher's Note: [Personalized message with Dr. [Surname], Given Name]
Thank you for using Doctor 영어친구.

PERSONALITY MARKERS:
- Use emojis strategically (🔊 🎨 🏆 🔴 🟡 🟢 🔵 ✅)
- Celebrate every attempt
- Provide scaffolding for struggling students
- Remember context from earlier messages
- Always redirect back to the 10-question structure

START: Greet warmly and ask for their surname and given name to personalize the session.`;

let studentData = {
  surname: '',
  givenName: '',
  questionCount: 0,
  responses: [],
  sessionStarted: false
};

class Dr0579Chatbot {
  constructor() {
    this.messagesDiv = document.getElementById('dr0579-messages');
    this.inputField = document.getElementById('dr0579-input');
    this.sendBtn = document.getElementById('dr0579-send');
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.sendBtn.addEventListener('click', () => this.handleUserMessage());
    this.inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleUserMessage();
    });
  }

  async handleUserMessage() {
    const userText = this.inputField.value.trim();
    if (!userText) return;

    // Display user message
    this.displayMessage(userText, true);
    this.inputField.value = '';
    this.sendBtn.disabled = true;
    this.sendBtn.textContent = '⏳ 닥터영어친구가 생각중입니다...';

    // Build conversation history for context
    const conversationHistory = this.buildConversationHistory();

    // Call Gemini API with Dr.0579 system instructions
    const botReply = await this.sendToGemini(userText, conversationHistory);
    
    // Display bot response with proper formatting
    this.displayMessage(botReply, false);

    // Update question count if applicable
    this.updateQuestionCount();

    this.sendBtn.disabled = false;
    this.sendBtn.textContent = '✉️ 보내기';
  }

  buildConversationHistory() {
    // Extract conversation from DOM for context
    const messages = this.messagesDiv.querySelectorAll('.dr0579-message');
    let history = '';
    messages.forEach((msg, idx) => {
      const isUser = msg.classList.contains('user');
      const role = isUser ? 'Student' : '닥터영어친구';
      history += `${role}: ${msg.textContent}\n\n`;
    });
    return history;
  }

  async sendToGemini(userMessage, conversationHistory) {
    try {
      const fullPrompt = `${DR_0579_SYSTEM_PROMPT}

CURRENT STUDENT INFO:
- Surname: ${studentData.surname || 'Not yet provided'}
- Given Name: ${studentData.givenName || 'Not yet provided'}
- Question Count: ${studentData.questionCount}/10
- Session Started: ${studentData.sessionStarted}

CONVERSATION HISTORY:
${conversationHistory}

NEW STUDENT MESSAGE: ${userMessage}

Respond as 닥터영어친구 following ALL the rules above. Be encouraging, use the 5W1H method when revising English, and keep track of the question count.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: fullPrompt }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 500,
            topP: 0.95
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API Error:', errorData);
        return '⚠️ 죄송합니다. 지금은 서버가 바쁩니다. 잠시 후 다시 시도해주세요.\n\nSorry, the server is busy right now. Please try again in a moment.';
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                    '앗, 답장을 만들 수 없었어요. 다시 시도해 주세요! (I could not generate a response. Please try again!)';
      
      return reply;

    } catch (err) {
      console.error('Chatbot Error:', err);
      return `⚠️ 오류가 발생했습니다: ${err.message}\n\nError: ${err.message}`;
    }
  }

  displayMessage(text, isUser) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `dr0579-message ${isUser ? 'user' : 'bot'}`;
    msgDiv.innerHTML = this.formatMessage(text);
    this.messagesDiv.appendChild(msgDiv);
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;

    // Store response
    if (!isUser) {
      studentData.responses.push(text);
      this.extractStudentInfo(text);
    }
  }

  formatMessage(text) {
    // Convert markdown headers to HTML for better formatting
    text = text.replace(/^# (.+)$/gm, '<strong style="font-size: 1.2em;">$1</strong>');
    text = text.replace(/^## (.+)$/gm, '<strong style="font-size: 1.1em;">$1</strong>');
    
    // Preserve line breaks and formatting
    text = text.replace(/\n/g, '<br>');
    
    return text;
  }

  extractStudentInfo(botText) {
    // Extract surname and given name from bot's greeting if present
    const surnameMatch = botText.match(/Dr\.\s+([A-Za-z]+)/);
    const givenNameMatch = botText.match(/Dr\.\s+[A-Za-z]+\s+([A-Za-z]+)/);
    
    if (surnameMatch && !studentData.surname) {
      studentData.surname = surnameMatch[1];
    }
    if (givenNameMatch && !studentData.givenName) {
      studentData.givenName = givenNameMatch[1];
    }
    if (!studentData.sessionStarted && botText.includes('Question')) {
      studentData.sessionStarted = true;
    }
  }

  updateQuestionCount() {
    const match = this.messagesDiv.textContent.match(/Question\s+(\d+)/);
    if (match) {
      studentData.questionCount = parseInt(match[1]);
    }
  }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Dr0579Chatbot();
});
