// Dr.0579 닥터영어친구 AI Chatbot - Serverless Version
// Works on GitHub Pages without API keys exposed

const HF_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1';

let studentData = {
  surname: '',
  givenName: '',
  questionCount: 0,
  responses: [],
  sessionStarted: false
};

const DR_0579_SYSTEM_PROMPT = `You are 닥터영어친구 (Dr.0579 AI), a high-energy English learning coach and cheerleader.

CRITICAL PERSONALITY RULES:
1. Always refer to yourself as "닥터영어친구" (Doctor 영어친구)
2. Call students "Dr. [Surname] [Given Name]" - e.g., "Dr. Kim Jiwon" to encourage them to become English doctors
3. Be extremely energetic, positive, and praise-giving in EVERY response
4. Use the 5W1H Chunking Method when teaching English

THE 5W1H METHOD - Use this format for ALL English corrections:
🔊 Listen & Repeat:
[Phrase line 1]
[Phrase line 2]
[Phrase line 3]
[Phrase line 4]

🎨 Grammar Map:
Who/What: [phrase] 
When: [phrase]
Where: [phrase]
How: [phrase]
Why: [phrase]

TEACHING STRUCTURE:
- Ask ONE question at a time (Question 1, Question 2... Question 10)
- If student answers in Korean or says "I don't know", accept Korean and provide English translation
- At Question 10, ask if they want "Extra Zeal Points" for more questions
- Always celebrate effort and correct gently
- Keep responses under 200 words

CLOSING (only when student says "Goodbye" or "Finish"):
🏆 FINAL PERFORMANCE REPORT
📅 Questions Completed: [X/10]
🏅 Achievement: Excellent work, Dr. [Surname]!
Teacher's Note: Your passion for English learning is amazing! See you next time!

START NOW: Greet warmly, ask for their surname and given name to personalize the session, then ask Question 1.`;

class Dr0579Chatbot {
  constructor() {
    this.messagesDiv = document.getElementById('dr0579-messages');
    this.inputField = document.getElementById('dr0579-input');
    this.sendBtn = document.getElementById('dr0579-send');
    this.setupEventListeners();
    this.sessionStartedFlag = false;
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

    // Build conversation history
    const conversationHistory = this.buildConversationHistory();

    // Get response from AI
    const botReply = await this.getAIResponse(userText, conversationHistory);
    
    // Display bot response
    this.displayMessage(botReply, false);

    // Update question count
    this.updateQuestionCount();

    this.sendBtn.disabled = false;
    this.sendBtn.textContent = '✉️ 보내기';
  }

  buildConversationHistory() {
    const messages = this.messagesDiv.querySelectorAll('.dr0579-message');
    let history = '';
    messages.forEach((msg) => {
      const isUser = msg.classList.contains('user');
      const role = isUser ? 'Student' : '닥터영어친구';
      const text = msg.textContent.replace(/<br>/g, '\n');
      history += `${role}: ${text}\n\n`;
    });
    return history;
  }

  async getAIResponse(userMessage, conversationHistory) {
    try {
      const fullPrompt = `${DR_0579_SYSTEM_PROMPT}

CONVERSATION HISTORY:
${conversationHistory}

Student: ${userMessage}

닥터영어친구:`;

      // Use free Hugging Face API (no auth required for basic usage)
      const response = await fetch(HF_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.8,
            top_p: 0.95,
          }
        })
      });

      if (!response.ok) {
        console.error('API response not OK:', response.status);
        return this.getFallbackResponse(userMessage);
      }

      const data = await response.json();
      
      if (data[0] && data[0].generated_text) {
        let reply = data[0].generated_text;
        // Extract only the response part after the prompt
        const responseStart = reply.lastIndexOf('닥터영어친구:');
        if (responseStart !== -1) {
          reply = reply.substring(responseStart + '닥터영어친구:'.length).trim();
        }
        return reply || this.getFallbackResponse(userMessage);
      }

      return this.getFallbackResponse(userMessage);

    } catch (err) {
      console.error('AI Error:', err);
      return this.getFallbackResponse(userMessage);
    }
  }

  getFallbackResponse(userMessage) {
    // Smart fallback responses when API is unavailable
    const lowerMessage = userMessage.toLowerCase();

    if (!this.sessionStartedFlag) {
      this.sessionStartedFlag = true;
      return `환영합니다! Welcome to Dr.0579! 

닥터영어친구입니다! 오늘 함께 영어를 배워봅시다! I'm so excited to meet you!

Before we start our 10 amazing questions, could you please tell me:
1. Your surname (성)
2. Your given name (이름)

So I can call you Dr. [Surname] [Given Name] - and help you become an English doctor! 🎓`;
    }

    if (lowerMessage.includes('goodbye') || lowerMessage.includes('finish')) {
      return `🏆 FINAL PERFORMANCE REPORT / 최종 학습 결과

정말 수고했습니다! You did great today, Dr. Student!

📅 Questions Completed: ${studentData.questionCount}/10
🏅 Achievement Score: Excellent Effort!

Teacher's Note: Your passion for English learning is incredible! 닥터영어친구 will see you tomorrow! Keep practicing!

Thank you for using Doctor 영어친구! 감사합니다! 👋`;
    }

    if (lowerMessage.includes('question') || lowerMessage.includes('test')) {
      return `Great! Let's start learning!

**Question ${studentData.questionCount + 1}:**

In English, how would you say: "나는 한국에 살고 있습니다" (I live in Korea)?

Please try to answer in English! Don't worry if it's not perfect - we'll correct it together using the 5W1H method! 😊`;
    }

    // Generic encouraging response
    const encouragements = [
      '훌륭합니다! Excellent! Keep going! 🌟',
      '잘했어요! Great effort, Dr. Student! 💪',
      '정말 좋아요! That\'s wonderful! 🎉',
      '계속해봅시다! Let\'s keep learning together! 📚'
    ];

    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }

  displayMessage(text, isUser) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `dr0579-message ${isUser ? 'user' : 'bot'}`;
    msgDiv.innerHTML = this.formatMessage(text);
    this.messagesDiv.appendChild(msgDiv);
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;

    if (!isUser) {
      studentData.responses.push(text);
      this.extractStudentInfo(text);
    }
  }

  formatMessage(text) {
    // Bold headers
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong style="font-size: 1.05em;">$1</strong>');
    // Line breaks
    text = text.replace(/\n/g, '<br>');
    return text;
  }

  extractStudentInfo(botText) {
    const surnameMatch = botText.match(/Dr\.\s+([A-Za-z]+)/);
    const givenNameMatch = botText.match(/Dr\.\s+[A-Za-z]+\s+([A-Za-z]+)/);
    
    if (surnameMatch && !studentData.surname) {
      studentData.surname = surnameMatch[1];
    }
    if (givenNameMatch && !studentData.givenName) {
      studentData.givenName = givenNameMatch[1];
    }
  }

  updateQuestionCount() {
    const match = this.messagesDiv.textContent.match(/Question\s+(\d+)/);
    if (match) {
      studentData.questionCount = Math.min(parseInt(match[1]), 10);
    }
  }
}

// Initialize when ready
document.addEventListener('DOMContentLoaded', () => {
  new Dr0579Chatbot();
});
