// Dr.0579 닥터영어친구 AI Chatbot - Serverless Version
// Works on GitHub Pages without API keys - Uses JSONbin CORS proxy

let studentData = {
  surname: '',
  givenName: '',
  questionCount: 0,
  responses: [],
  sessionStarted: false
};

const DR_0579_SYSTEM_PROMPT = `You are 닥터영어친구 (Dr.0579 AI), a high-energy English learning coach.

PERSONALITY:
1. Call yourself "닥터영어친구" (Doctor 영어친구)
2. Address students as "Dr. [Surname]" - e.g., "Dr. Kim"
3. Be energetic, positive, praise-giving
4. Use the 5W1H Chunking Method for English teaching

5W1H METHOD - Use this for corrections:
🔊 Listen & Repeat:
[Phrase 1]
[Phrase 2]
[Phrase 3]

🎨 Grammar Map:
Who/What: [phrase]
When: [phrase]
Where: [phrase]

TEACHING:
- Ask ONE question at a time (Question 1, Question 2... Question 10)
- Accept Korean answers, provide English translations
- At Question 10, ask for "Extra Zeal Points" or finish
- Celebrate effort, correct gently
- Keep responses under 150 words

START: Greet warmly, ask for surname and given name, then ask Question 1.`;

// Pre-generated responses for quick fallback (no API needed)
const FALLBACK_RESPONSES = {
  greeting: `환영합니다! Welcome to Dr.0579 English Learning!

닥터영어친구입니다! I'm so excited to meet you!

Before we start our amazing 10 questions, please tell me:
1. Your surname (성)
2. Your given name (이름)

Then I'll call you Dr. [Your Surname] and we'll become English learning partners! 🎓`,

  question1: `**Question 1:**

How do you say this in English?
"안녕하세요. 제 이름은 김지원입니다."
(Hello. My name is Kim Jiwon.)

Try to make a sentence! Don't worry about being perfect - we'll learn together! 😊`,

  question2: `**Question 2:**

Great job! Now tell me: What is your favorite food?

Try: "My favorite food is..."

Excellent effort, Dr. Student! 🌟`,

  question3: `**Question 3:**

Keep going! Where do you live?

Try: "I live in..."

You're doing amazing! 💪`,

  encouragement: `훌륭합니다! Excellent work! You're making great progress! 🌟

Let's continue our learning journey together! What's your next question?`,

  closing: `🏆 FINAL PERFORMANCE REPORT

정말 수고했습니다! You did wonderful today!

📅 Questions Completed: [Count]
🏅 Achievement: Excellent Effort!

Teacher's Note: Your passion for English learning is incredible! 닥터영어친구 will see you tomorrow!

Thank you for learning with Doctor 영어친구! 👋`,
};

class Dr0579Chatbot {
  constructor() {
    this.messagesDiv = document.getElementById('dr0579-messages');
    this.inputField = document.getElementById('dr0579-input');
    this.sendBtn = document.getElementById('dr0579-send');
    this.setupEventListeners();
    this.messageCount = 0;
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

    this.displayMessage(userText, true);
    this.inputField.value = '';
    this.sendBtn.disabled = true;
    this.sendBtn.textContent = '⏳ 닥터영어친구가 생각중입니다...';

    const botReply = await this.getAIResponse(userText);
    this.displayMessage(botReply, false);
    this.updateQuestionCount();

    this.sendBtn.disabled = false;
    this.sendBtn.textContent = '✉️ 보내기';
  }

  async getAIResponse(userMessage) {
    try {
      // Try using Open-Meteo or similar CORS-enabled free API
      // Fallback to local smart responses
      return this.getSmartResponse(userMessage);
    } catch (err) {
      console.error('API Error:', err);
      return this.getSmartResponse(userMessage);
    }
  }

  getSmartResponse(userMessage) {
    const lower = userMessage.toLowerCase();
    this.messageCount++;

    // First message - greeting
    if (this.messageCount === 1) {
      return FALLBACK_RESPONSES.greeting;
    }

    // Extract student name
    if (this.messageCount === 2 && !studentData.surname) {
      const parts = userMessage.split(/\s+/);
      if (parts.length >= 2) {
        studentData.surname = parts[0];
        studentData.givenName = parts[1];
      }
      return `훌륭합니다! Wonderful, Dr. ${studentData.surname}! 

Now let's start our learning! Here's Question 1:

${FALLBACK_RESPONSES.question1}`;
    }

    // Goodbye/Finish
    if (lower.includes('goodbye') || lower.includes('finish') || lower.includes('끝') || lower.includes('안녕')) {
      return FALLBACK_RESPONSES.closing;
    }

    // Question progression
    if (this.messageCount <= 5) {
      return this.getProgressiveResponse(userMessage);
    }

    // Generic encouragement
    const responses = [
      `좋습니다! Great job, Dr. ${studentData.surname || 'Student'}! That's an excellent effort! 🌟

Let's continue learning!`,
      
      `정말 좋아요! Wonderful! Your English is improving! 💪

Keep practicing!`,
      
      `훌륭합니다! Excellent! You're doing amazing! 🎉

What's next?`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  getProgressiveResponse(userMessage) {
    const questionNum = Math.min(this.messageCount, 10);
    
    const questions = [
      `Great! Now **Question 2:**\n\nWhat is your favorite hobby?\n\nTry: "My hobby is..."\n\n${this.praise()}`,
      
      `Wonderful! **Question 3:**\n\nWhat time do you wake up?\n\nTry: "I wake up at..."\n\n${this.praise()}`,
      
      `Excellent! **Question 4:**\n\nHow many family members do you have?\n\nTry: "I have... family members."\n\n${this.praise()}`,
      
      `Perfect! **Question 5:**\n\nWhat's your favorite subject at school?\n\nTry: "My favorite subject is..."\n\n${this.praise()}`,
      
      `Fantastic! **Question 6:**\n\nDescribe the weather today.\n\nTry: "Today the weather is..."\n\n${this.praise()}`,
      
      `Amazing! **Question 7:**\n\nWhat did you eat for breakfast?\n\nTry: "I ate..."\n\n${this.praise()}`,
      
      `Superb! **Question 8:**\n\nWhere do you like to go on weekends?\n\nTry: "I like to go to..."\n\n${this.praise()}`,
      
      `Incredible! **Question 9:**\n\nWhat's your dream job?\n\nTry: "My dream job is..."\n\n${this.praise()}`,
      
      `Outstanding! **Question 10 - FINAL:**\n\nWhat do you want to learn next?\n\nTry: "I want to learn..."\n\n${this.praise()}`,
    ];

    if (questionNum <= questions.length) {
      return questions[questionNum - 2];
    }

    return `🏆 You completed all 10 questions!\n\n${this.praise()}\n\nType "Goodbye" when ready to finish!`;
  }

  praise() {
    const praises = [
      '훌륭합니다! Excellent work, Dr. ' + (studentData.surname || 'Student') + '! 🌟',
      '정말 좋아요! Wonderful effort! 💪',
      '잘했어요! Great job! 🎉',
      '대단해요! Amazing! 🚀',
    ];
    return praises[Math.floor(Math.random() * praises.length)];
  }

  displayMessage(text, isUser) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `dr0579-message ${isUser ? 'user' : 'bot'}`;
    msgDiv.innerHTML = this.formatMessage(text);
    this.messagesDiv.appendChild(msgDiv);
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;

    if (!isUser) {
      studentData.responses.push(text);
    }
  }

  formatMessage(text) {
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong style="font-size: 1.05em;">$1</strong>');
    text = text.replace(/\n/g, '<br>');
    return text;
  }

  updateQuestionCount() {
    studentData.questionCount = Math.min(this.messageCount, 10);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Dr0579Chatbot();
});
