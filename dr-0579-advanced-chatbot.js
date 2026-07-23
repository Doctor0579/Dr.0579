/**
 * 닥터영어친구 (Dr.0579 Advanced AI English Learning Chatbot)
 * Adaptive Learning System with Fluency Detection & Assessment
 * Works on GitHub Pages - No external API calls
 * 
 * Features:
 * - Multi-level adaptive curriculum
 * - Real-time fluency assessment
 * - Engaging jokes & interesting questions
 * - Korean translations for complex explanations
 * - Comprehensive performance report with actionable feedback
 */

// ==================== STUDENT DATA & SESSION TRACKING ====================
let sessionData = {
  student: {
    surname: '',
    givenName: '',
    detectedLevel: null, // Will be detected after first few responses
    sessionStartTime: new Date()
  },
  
  progress: {
    totalQuestions: 0,
    correctAnswers: 0,
    partialCorrect: 0,
    needsHelp: 0,
    responseQuality: [] // tracks quality of each response
  },

  interactions: [], // Full log of all Q&A
  
  fluencyIndicators: {
    vocabularyLevel: 0,     // 0-100
    grammarAccuracy: 0,     // 0-100
    responseLength: 0,      // 0-100
    confidence: 0,          // 0-100
    overallFluency: 0       // 0-100
  },

  completedQuestions: [],
  sessionActive: true
};

// ==================== ADAPTIVE CURRICULUM BY LEVEL ====================
const CURRICULUM = {
  // LEVEL 1: Complete Beginners (Single words/very simple sentences)
  level1: {
    name: '🌱 Beginner Level',
    description: 'Learning basic vocabulary and simple present tense',
    questions: [
      {
        id: 'l1q1',
        question: "What is your name?",
        category: 'personal',
        expectedKeywords: ['name', 'i', 'am', 'my'],
        minKeywords: 2,
        correctExamples: [
          "My name is Kim Jiwon.",
          "I am Jiwon.",
          "I'm Kim Jiwon."
        ],
        koreanTranslation: "제 이름은 김지원입니다.",
        grammarFocus: "Subject + verb + complement",
        difficulty: 1,
        joke: null
      },
      {
        id: 'l1q2',
        question: "Where do you live?",
        category: 'location',
        expectedKeywords: ['live', 'in', 'korea', 'seoul', 'city'],
        minKeywords: 2,
        correctExamples: [
          "I live in Seoul, Korea.",
          "I live in Korea.",
          "Seoul."
        ],
        koreanTranslation: "나는 서울, 한국에 살고 있습니다.",
        grammarFocus: "Present continuous tense for location",
        difficulty: 1,
        joke: "Why do programmers prefer Seoul? Because it has a lot of JAVAscript! 😄"
      },
      {
        id: 'l1q3',
        question: "What is your favorite food?",
        category: 'preference',
        expectedKeywords: ['favorite', 'like', 'food', 'is'],
        minKeywords: 2,
        correctExamples: [
          "My favorite food is kimchi.",
          "I like rice.",
          "Bibimbap is my favorite."
        ],
        koreanTranslation: "제가 가장 좋아하는 음식은 비빔밥입니다.",
        grammarFocus: "Using 'My favorite' structure",
        difficulty: 1,
        joke: "What do English teachers eat? GRAMMAR-meal! 🍽️"
      },
      {
        id: 'l1q4',
        question: "What time do you wake up?",
        category: 'routine',
        expectedKeywords: ['wake', 'up', 'am', 'clock', 'morning'],
        minKeywords: 2,
        correctExamples: [
          "I wake up at 7 o'clock in the morning.",
          "I wake up at 7 AM.",
          "Seven in the morning."
        ],
        koreanTranslation: "나는 아침 7시에 일어납니다.",
        grammarFocus: "Telling time in English",
        difficulty: 1,
        joke: null
      },
      {
        id: 'l1q5',
        question: "What is your hobby?",
        category: 'hobby',
        expectedKeywords: ['hobby', 'like', 'play', 'enjoy'],
        minKeywords: 2,
        correctExamples: [
          "My hobby is reading.",
          "I like playing soccer.",
          "I enjoy drawing."
        ],
        koreanTranslation: "제 취미는 책을 읽는 것입니다.",
        grammarFocus: "Gerund form (playing, reading, etc.)",
        difficulty: 1,
        joke: "What's a computer's hobby? BYTE-ing code! 💻"
      }
    ]
  },

  // LEVEL 2: Elementary (Simple sentences with some detail)
  level2: {
    name: '🌿 Elementary Level',
    description: 'Building sentence structure and past tense awareness',
    questions: [
      {
        id: 'l2q1',
        question: "Tell me about your family. Who do you live with?",
        category: 'family',
        expectedKeywords: ['family', 'live', 'mother', 'father', 'people', 'with'],
        minKeywords: 3,
        correctExamples: [
          "I live with my mother, father, and brother. We are four people in my family.",
          "My family has five members. I live with my parents and my two sisters.",
          "There are four people. My mom, dad, younger brother, and me."
        ],
        koreanTranslation: "나는 엄마, 아빠, 그리고 형과 함께 살고 있습니다. 우리 가족은 4명입니다.",
        grammarFocus: "Compound sentences with 'and'",
        difficulty: 2,
        joke: "What did the family of numbers say? We're a REAL problem! 👨‍👩‍👧‍👦"
      },
      {
        id: 'l2q2',
        question: "What did you do yesterday? Tell me about your day.",
        category: 'past',
        expectedKeywords: ['yesterday', 'did', 'went', 'came', 'morning', 'afternoon'],
        minKeywords: 3,
        correctExamples: [
          "Yesterday, I woke up at 7 AM and had breakfast. Then I went to school and had classes. After school, I played with my friends.",
          "I studied in the morning and played soccer in the afternoon.",
          "Yesterday I went to school, studied English, and came home to do homework."
        ],
        koreanTranslation: "어제 아침 7시에 일어나서 아침을 먹었습니다. 그 다음 학교에 갔고 수업을 들었습니다. 방과 후에 친구들과 놀았습니다.",
        grammarFocus: "Past tense narration with sequence words",
        difficulty: 2,
        joke: "Why did the history book go to school? Because it needed to improve its PAST performance! 📚"
      },
      {
        id: 'l2q3',
        question: "What are your strengths? What do you do well?",
        category: 'strength',
        expectedKeywords: ['good', 'well', 'best', 'skill', 'strong', 'am'],
        minKeywords: 3,
        correctExamples: [
          "I am very good at sports and I am also good at drawing. I think my best skill is playing soccer.",
          "I'm good at math and English. I can also draw well.",
          "My strength is helping people. I'm also good at sports."
        ],
        koreanTranslation: "나는 스포츠를 잘합니다. 그림을 그리는 것도 잘합니다. 내 최고의 기술은 축구를 하는 것입니다.",
        grammarFocus: "Positive statements with 'am/is/are + adjective'",
        difficulty: 2,
        joke: "What's a teacher's favorite strength? Making SENTENCES! 💪"
      }
    ]
  },

  // LEVEL 3: Intermediate (Complex thoughts, subordinate clauses)
  level3: {
    name: '🌳 Intermediate Level',
    description: 'Complex sentences, cause-effect, and detailed explanations',
    questions: [
      {
        id: 'l3q1',
        question: "Describe your ideal weekend. Why do you like spending time that way?",
        category: 'preference',
        expectedKeywords: ['weekend', 'because', 'why', 'would', 'enjoy', 'reason'],
        minKeywords: 3,
        correctExamples: [
          "My ideal weekend would be spending time with my family and friends. I would like to go hiking because it is healthy and fun. We could have a picnic and enjoy nature together because it helps me relax from school stress.",
          "I would spend time doing things I enjoy. I like reading books because they teach me new things. I also enjoy sports because it keeps me active and healthy.",
          "My perfect weekend involves relaxing and having fun. I would play with friends and family since we don't see each other much during the week. This is important because family time strengthens our relationships."
        ],
        koreanTranslation: "제 이상적인 주말은 가족과 친구들과 시간을 보내는 것입니다. 하이킹을 가고 싶습니다. 왜냐하면 건강하고 재미있기 때문입니다. 자연을 즐기면서 피크닉을 할 수 있습니다. 왜냐하면 학교 스트레스에서 벗어나는 데 도움이 되기 때문입니다.",
        grammarFocus: "Complex sentences with 'because', 'since', 'would'",
        difficulty: 3,
        joke: "Why did the comma go on a date? Because it needed more of a PERIOD to think things through! 😄"
      },
      {
        id: 'l3q2',
        question: "What is your biggest challenge in learning English? How do you plan to overcome it?",
        category: 'growth',
        expectedKeywords: ['challenge', 'difficult', 'how', 'plan', 'improve', 'help'],
        minKeywords: 4,
        correctExamples: [
          "My biggest challenge is speaking fluently because I'm afraid of making mistakes. To overcome this, I plan to practice speaking with my friends every day. I will also watch English movies to improve my listening skills and learn new vocabulary.",
          "I find grammar confusing, especially the past tense. I want to improve by doing more grammar exercises and reading English books. I think practicing regularly will help me understand the rules better.",
          "The most difficult part is understanding native speakers quickly. My plan is to listen to English podcasts and watch videos. I believe consistent practice will make me more confident."
        ],
        koreanTranslation: "제 가장 큰 도전은 유창하게 영어를 말하는 것입니다. 왜냐하면 실수하는 것이 무서우니까요. 이를 극복하기 위해 매일 친구들과 영어로 말하는 연습을 할 계획입니다. 영어 영화를 봐서 제 듣기 능력을 향상시키고 새로운 어휘를 배울 것입니다.",
        grammarFocus: "Complex problem-solution structure with planning language",
        difficulty: 3,
        joke: "Why do students struggle with English? Because the rules are quite SENTENCE-itive! 😅"
      }
    ]
  },

  // LEVEL 4: Advanced (Nuanced expression, idioms, abstract thinking)
  level4: {
    name: '🚀 Advanced Level',
    description: 'Nuanced expression, abstract concepts, and cultural discussion',
    questions: [
      {
        id: 'l4q1',
        question: "How do you think technology is changing the way people learn? What are the advantages and disadvantages?",
        category: 'analysis',
        expectedKeywords: ['technology', 'change', 'advantage', 'disadvantage', 'however', 'moreover', 'although'],
        minKeywords: 4,
        correctExamples: [
          "Technology is revolutionizing education in many ways. On one hand, students can access vast amounts of information instantly, which provides unprecedented learning opportunities. On the other hand, excessive screen time may hinder face-to-face interaction and reduce focus. Moreover, not all students have equal access to technology, creating a digital divide. Nevertheless, I believe technology will continue to reshape education in positive ways.",
          "The impact of technology on learning is multifaceted. While online platforms offer flexibility and personalized learning experiences, they also present challenges such as cybersecurity and digital dependency. Although there are drawbacks, the overall trajectory suggests technology will become increasingly central to education.",
          "Technology offers both opportunities and challenges. Students can now learn from anywhere, which is incredibly convenient. However, the quality of online education varies greatly, and some students struggle with self-discipline. Additionally, traditional skills like face-to-face communication are at risk."
        ],
        koreanTranslation: "기술은 많은 방식으로 교육을 변화시키고 있습니다. 한편으로, 학생들은 엄청난 양의 정보에 즉시 접근할 수 있어 전례 없는 학습 기회를 제공합니다. 반면에 과도한 화면 시간은 대면 상호작용을 방해하고 집중력을 감소시킬 수 있습니다. 더욱이, 모든 학생들이 기술에 동등하게 접근할 수 없어서 디지털 격차를 만들고 있습니다.",
        grammarFocus: "Advanced connectors: 'Furthermore', 'However', 'Although', 'Nevertheless'",
        difficulty: 4,
        joke: "Why do computers never get tired of learning? Because they have infinite RAM-bition! 🎓"
      }
    ]
  }
};

// ==================== FLUENCY ANALYZER ====================
class FluencyAnalyzer {
  static analyzeResponse(answer, expectedKeywords, minKeywords) {
    const lowerAnswer = answer.toLowerCase();
    
    // 1. Keyword match score
    const matchedKeywords = expectedKeywords.filter(keyword => 
      lowerAnswer.includes(keyword.toLowerCase())
    );
    const keywordScore = Math.min(100, (matchedKeywords.length / minKeywords) * 100);

    // 2. Sentence structure analysis
    const sentences = answer.match(/[.!?]+/g) || [];
    const avgWordCount = answer.split(/\s+/).length / Math.max(sentences.length, 1);
    const structureScore = Math.min(100, (avgWordCount / 10) * 80 + 20);

    // 3. Vocabulary diversity (unique words)
    const words = answer.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words).size;
    const vocabScore = Math.min(100, (uniqueWords / words.length) * 100);

    // 4. Confidence indicators (word count, detail level)
    const confidenceScore = Math.min(100, (words.length / 30) * 100);

    // 5. Grammar check (simplified)
    const grammarScore = this.checkGrammar(answer);

    // Calculate overall fluency
    const overallFluency = Math.round(
      (keywordScore * 0.3 + structureScore * 0.2 + vocabScore * 0.15 + 
       confidenceScore * 0.15 + grammarScore * 0.2) / 100 * 100
    );

    return {
      keywordScore: Math.round(keywordScore),
      structureScore: Math.round(structureScore),
      vocabScore: Math.round(vocabScore),
      confidenceScore: Math.round(confidenceScore),
      grammarScore: Math.round(grammarScore),
      overallFluency,
      matchedKeywords: matchedKeywords.length,
      totalExpected: minKeywords,
      wordCount: words.length,
      sentenceCount: Math.max(sentences.length, 1)
    };
  }

  static checkGrammar(answer) {
    let score = 70; // base score
    const issues = [];

    // Check for basic patterns
    if (!answer.match(/[.!?]$/)) issues.push(-5); // No ending punctuation
    if (answer.match(/\b(i)\s+/i)) issues.push(-3); // Lowercase 'i'
    if (answer.match(/th(e|a|is|at|em)\s+(verb)/i)) score += 5; // Good article use
    
    return Math.max(0, Math.min(100, score + issues.reduce((a, b) => a + b, 0)));
  }

  static detectLevel(responses) {
    if (responses.length < 3) return 'level1';
    
    const avgFluency = responses.reduce((sum, r) => sum + r.analysis.overallFluency, 0) / responses.length;
    const avgLength = responses.reduce((sum, r) => sum + r.analysis.wordCount, 0) / responses.length;

    if (avgFluency >= 70 && avgLength >= 25) return 'level3';
    if (avgFluency >= 80 && avgLength >= 40) return 'level4';
    if (avgFluency >= 50 && avgLength >= 15) return 'level2';
    return 'level1';
  }
}

// ==================== MAIN CHATBOT CLASS ====================
class Dr0579AdaptiveChatbot {
  constructor() {
    this.messagesDiv = document.getElementById('dr0579-messages');
    this.inputField = document.getElementById('dr0579-input');
    this.sendBtn = document.getElementById('dr0579-send');
    this.progressDiv = document.getElementById('dr0579-progress');
    
    if (!this.messagesDiv || !this.inputField || !this.sendBtn) {
      console.error('Required chat elements not found in DOM');
      return;
    }

    this.setupEventListeners();
    this.startSession();
  }

  setupEventListeners() {
    this.sendBtn.addEventListener('click', () => this.handleSendMessage());
    this.inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });
  }

  startSession() {
    const greeting = `🌟 **안녕하세요! Hello!** 👋\n\n저는 **닥터영어친구** (Dr.0579 AI English Coach)입니다!\nI am **Dr.0579**, your personal AI English Learning Coach!\n\n**What I do:**\n✅ Ask you interesting questions at YOUR level\n✅ Understand your English fluency and adjust difficulty\n✅ Give you funny jokes you can understand\n✅ Correct your mistakes with clear examples\n✅ Show you Korean translations for complex ideas\n✅ Create a complete learning report at the end\n\n**자, 시작해봅시다! Let's begin!**\n\nFirst, please tell me:\n• Your **surname** (성)\n• Your **given name** (이름)\n\nExample: Kim Jiwon\n\n(성과 이름을 알려주세요!)`;
    
    this.displayMessage(greeting, false);
  }

  async handleSendMessage() {
    const userText = this.inputField.value.trim();
    if (!userText) return;

    this.displayMessage(userText, true);
    this.inputField.value = '';
    this.sendBtn.disabled = true;
    this.sendBtn.textContent = '⏳ 닥터영어친구가 생각 중...';

    // Simulate natural processing time
    await new Promise(resolve => setTimeout(resolve, 900));

    const botReply = this.generateResponse(userText);
    this.displayMessage(botReply, false);

    this.updateProgress();
    this.sendBtn.disabled = false;
    this.sendBtn.textContent = '✉️ 보내기';
  }

  generateResponse(userMessage) {
    // Step 1: Collect student name
    if (!sessionData.student.surname) {
      return this.handleNameInput(userMessage);
    }

    // Step 2: Detect level from initial responses
    if (!sessionData.student.detectedLevel && sessionData.interactions.length < 2) {
      sessionData.student.detectedLevel = 'level1';
      return this.getQuestion();
    }

    // Detect actual level after 2-3 responses
    if (sessionData.interactions.length >= 2 && sessionData.interactions.length <= 3) {
      sessionData.student.detectedLevel = FluencyAnalyzer.detectLevel(sessionData.interactions);
    }

    // Step 3: Handle finish requests
    if (this.isFinishRequest(userMessage)) {
      return this.generateComprehensiveReport();
    }

    // Step 4: Handle questions
    if (sessionData.progress.totalQuestions < 15) {
      return this.handleQuestion(userMessage);
    }

    return this.generateComprehensiveReport();
  }

  handleNameInput(userMessage) {
    const parts = userMessage.trim().split(/\s+/);
    
    if (parts.length < 2) {
      return `**Oops! 잠깐만요!** ☝️\n\nI need both your surname AND given name.\n\nExample format: Kim Jiwon\n\n(성과 이름 모두를 말씀해주세요!)`;
    }

    sessionData.student.surname = parts[0];
    sessionData.student.givenName = parts.slice(1).join(' ');

    const welcomeMsg = `🎉 **환영합니다, Dr. ${sessionData.student.surname}!** 🎓\n\n좋은 만남입니다! It's wonderful to meet you!\n\n**이제 시작해봅시다!** Let's begin our English learning journey! I will ask you questions that match YOUR level. Don't worry - I'll adjust as we go!\n\n**자신감 있게 대답해주세요!** Answer confidently - mistakes are the best teachers!\n\n---`;

    return welcomeMsg + '\n' + this.getQuestion();
  }

  getQuestion() {
    const level = sessionData.student.detectedLevel || 'level1';
    const curriculum = CURRICULUM[level];
    
    if (!curriculum) return "Session complete!";

    // Get next unanswered question
    const availableQuestions = curriculum.questions.filter(q => 
      !sessionData.completedQuestions.includes(q.id)
    );

    if (availableQuestions.length === 0) {
      return this.generateComprehensiveReport();
    }

    const question = availableQuestions[0];
    let questionText = `\n\n**Question ${sessionData.progress.totalQuestions + 1}** ❓\n\n**${question.question}**`;

    // Add joke occasionally
    if (question.joke && Math.random() > 0.5) {
      questionText += `\n\n😄 *Fun fact:* ${question.joke}`;
    }

    questionText += `\n\n💡 **Tip:** Try to use words related to: ${question.expectedKeywords.slice(0, 4).join(', ')}`;

    return questionText;
  }

  handleQuestion(userMessage) {
    const level = sessionData.student.detectedLevel || 'level1';
    const curriculum = CURRICULUM[level];
    const availableQuestions = curriculum.questions.filter(q => 
      !sessionData.completedQuestions.includes(q.id)
    );

    if (availableQuestions.length === 0) {
      return this.generateComprehensiveReport();
    }

    const currentQuestion = availableQuestions[0];
    const analysis = FluencyAnalyzer.analyzeResponse(
      userMessage, 
      currentQuestion.expectedKeywords, 
      currentQuestion.minKeywords
    );

    // Store interaction
    const interaction = {
      question: currentQuestion.question,
      studentAnswer: userMessage,
      analysis,
      feedback: this.generateDetailedFeedback(userMessage, analysis, currentQuestion),
      timestamp: new Date()
    };

    sessionData.interactions.push(interaction);
    sessionData.completedQuestions.push(currentQuestion.id);
    sessionData.progress.totalQuestions++;

    // Update fluency indicators
    this.updateFluencyMetrics(analysis);

    // Categorize performance
    if (analysis.overallFluency >= 70) {
      sessionData.progress.correctAnswers++;
    } else if (analysis.overallFluency >= 50) {
      sessionData.progress.partialCorrect++;
    } else {
      sessionData.progress.needsHelp++;
    }

    // Re-detect level
    if (sessionData.interactions.length % 2 === 0) {
      sessionData.student.detectedLevel = FluencyAnalyzer.detectLevel(sessionData.interactions);
    }

    let response = interaction.feedback;
    response += this.getQuestion();

    return response;
  }

  generateDetailedFeedback(answer, analysis, question) {
    const feedback = [];
    feedback.push(`\n✅ **Your Response Analyzed:**\n`);
    feedback.push(`📊 **Fluency Score:** ${analysis.overallFluency}/100`);
    feedback.push(`- Vocabulary: ${analysis.vocabScore}/100`);
    feedback.push(`- Grammar: ${analysis.grammarScore}/100`);
    feedback.push(`- Sentence Structure: ${analysis.structureScore}/100`);
    feedback.push(`- Confidence: ${analysis.confidenceScore}/100\n`);

    // Performance assessment
    if (analysis.overallFluency >= 75) {
      feedback.push(`🌟 **Excellent Work, Dr. ${sessionData.student.surname}!**`);
      feedback.push(`Your answer demonstrates great English skills! You used the right grammar and vocabulary perfectly.`);
    } else if (analysis.overallFluency >= 50) {
      feedback.push(`👍 **Good Effort, Dr. ${sessionData.student.surname}!**`);
      feedback.push(`Your answer shows understanding, but let me show you a better way to express this:`);
    } else {
      feedback.push(`💪 **Let's Learn Together, Dr. ${sessionData.student.surname}!**`);
      feedback.push(`I'll help you improve. Here's a better way to answer:`);
    }

    // Provide model answer with Korean translation
    feedback.push(`\n**📝 Model Answer:**\n${question.correctExamples[0]}`);
    
    // Add Korean translation if answer is long
    if (question.correctExamples[0].split(' ').length > 10) {
      feedback.push(`\n**🇰🇷 Korean Translation:**\n${question.koreanTranslation}`);
    }

    // Grammar focus
    feedback.push(`\n**📚 Grammar Focus:**\n${question.grammarFocus}`);

    // Encouragement
    const encouragements = [
      `\n💪 Keep practicing! Every answer helps you improve!`,
      `\n🚀 You're doing great! Let's continue!`,
      `\n🎯 Fantastic effort! Ready for the next question?`,
      `\n⭐ Amazing! You're getting better!`
    ];
    feedback.push(encouragements[Math.floor(Math.random() * encouragements.length)]);

    return feedback.join('\n');
  }

  updateFluencyMetrics(analysis) {
    sessionData.fluencyIndicators.vocabularyLevel = 
      (sessionData.fluencyIndicators.vocabularyLevel * (sessionData.progress.totalQuestions - 1) + analysis.vocabScore) / sessionData.progress.totalQuestions;
    
    sessionData.fluencyIndicators.grammarAccuracy = 
      (sessionData.fluencyIndicators.grammarAccuracy * (sessionData.progress.totalQuestions - 1) + analysis.grammarScore) / sessionData.progress.totalQuestions;
    
    sessionData.fluencyIndicators.responseLength = 
      (sessionData.fluencyIndicators.responseLength * (sessionData.progress.totalQuestions - 1) + analysis.confidenceScore) / sessionData.progress.totalQuestions;
    
    sessionData.fluencyIndicators.overallFluency = 
      (sessionData.fluencyIndicators.vocabularyLevel + 
       sessionData.fluencyIndicators.grammarAccuracy + 
       sessionData.fluencyIndicators.responseLength) / 3;
  }

  isFinishRequest(message) {
    const finishKeywords = ['finish', 'goodbye', 'bye', 'exit', 'quit', 'done', '끝', '안녕'];
    return finishKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  generateComprehensiveReport() {
    const sessionDuration = Math.round((new Date() - sessionData.student.sessionStartTime) / 60000); // minutes
    
    // Determine level assessment
    let levelName = sessionData.student.detectedLevel;
    let levelEmoji = '🌱';
    if (levelName.includes('level2')) { levelEmoji = '🌿'; levelName = 'Elementary'; }
    else if (levelName.includes('level3')) { levelEmoji = '🌳'; levelName = 'Intermediate'; }
    else if (levelName.includes('level4')) { levelEmoji = '🚀'; levelName = 'Advanced'; }
    else { levelName = 'Beginner'; }

    // Calculate scores
    const totalQuestions = sessionData.progress.totalQuestions;
    const correctRate = Math.round((sessionData.progress.correctAnswers / totalQuestions) * 100) || 0;
    const overallScore = Math.round(sessionData.fluencyIndicators.overallFluency);

    let strengths = [];
    let areasForImprovement = [];

    // Analyze strengths
    if (sessionData.fluencyIndicators.vocabularyLevel >= 70) strengths.push('📚 Rich Vocabulary');
    if (sessionData.fluencyIndicators.grammarAccuracy >= 70) strengths.push('✅ Good Grammar');
    if (sessionData.fluencyIndicators.responseLength >= 70) strengths.push('💬 Confident Responses');

    // Identify areas to improve
    if (sessionData.fluencyIndicators.vocabularyLevel < 60) areasForImprovement.push('확대: 어휘 범위 / Expand your vocabulary range');
    if (sessionData.fluencyIndicators.grammarAccuracy < 60) areasForImprovement.push('개선: 복잡한 문법 / Practice complex grammar structures');
    if (sessionData.fluencyIndicators.responseLength < 60) areasForImprovement.push('연습: 더 자세한 답변 / Try giving more detailed responses');

    if (strengths.length === 0) strengths.push('💪 Great effort and participation!');
    if (areasForImprovement.length === 0) areasForImprovement.push('🌟 You are excelling in all areas!');

    // Generate detailed report
    const report = `
🏆 **========================================**
🏆 **FINAL COMPREHENSIVE LEARNING REPORT**
🏆 **========================================**

👤 **Student:** Dr. ${sessionData.student.surname} ${sessionData.student.givenName}
📅 **Session Duration:** ${sessionDuration} minutes
⏰ **Date:** ${new Date().toLocaleDateString('ko-KR')}

---

📊 **OVERALL PERFORMANCE SUMMARY**

**Your English Level:** ${levelEmoji} **${levelName}**
**Total Questions Answered:** ${totalQuestions}
**Success Rate:** ${correctRate}%
**Overall Fluency Score:** ${overallScore}/100

---

💯 **DETAILED SCORE BREAKDOWN**

📚 **Vocabulary Level:** ${Math.round(sessionData.fluencyIndicators.vocabularyLevel)}/100
✅ **Grammar Accuracy:** ${Math.round(sessionData.fluencyIndicators.grammarAccuracy)}/100
💬 **Response Confidence:** ${Math.round(sessionData.fluencyIndicators.responseLength)}/100

**Performance Breakdown:**
✅ Excellent Answers: ${sessionData.progress.correctAnswers}
⚠️ Good Answers: ${sessionData.progress.partialCorrect}
📝 Answers to Practice: ${sessionData.progress.needsHelp}

---

🌟 **YOUR STRENGTHS**

${strengths.map(s => `✨ ${s}`).join('\n')}

${sessionData.interactions.slice(0, 2).map(interaction => {
  if (interaction.analysis.overallFluency >= 75) {
    return `✅ Question: "${interaction.question.substring(0, 50)}..." - **Perfect answer!**`;
  }
  return '';
}).filter(s => s).join('\n')}

---

🎯 **AREAS FOR IMPROVEMENT**

${areasForImprovement.map((area, index) => `${index + 1}. ${area}`).join('\n')}

---

📋 **DETAILED QUESTION-BY-QUESTION ANALYSIS**

${sessionData.interactions.map((interaction, index) => `
**Question ${index + 1}: ${interaction.question}**
Your Answer: "${interaction.studentAnswer.substring(0, 60)}${interaction.studentAnswer.length > 60 ? '...' : ''}"
Score: ${interaction.analysis.overallFluency}/100
${interaction.analysis.overallFluency >= 70 ? '✅ Excellent' : interaction.analysis.overallFluency >= 50 ? '👍 Good' : '📝 Keep practicing'}
`).join('\n')}

---

🎓 **RECOMMENDATIONS FOR NEXT SESSION**

${this.generateRecommendations(overallScore, sessionData.fluencyIndicators)}

---

💪 **FINAL WORDS FROM 닥터영어친구**

정말 수고했습니다! You did fantastic today, Dr. ${sessionData.student.surname}!

Your effort and participation are commendable! English learning is a journey, not a destination. Every question you answer, every mistake you make - these are stepping stones to fluency.

**Remember:** 
📌 Practice daily, even just 10 minutes
📌 Don't fear making mistakes - they're your best teachers
📌 Celebrate small wins
📌 Stay confident!

---

🌍 **당신의 영어 여정에 모두의 응원이 함께합니다!**
All the support from Dr.0579 is with you on your English journey!

**👋 See you next time! 다음에 봐요!**

(Type anything to continue or close this window)
`;

    return report;
  }

  generateRecommendations(overallScore, fluency) {
    const recommendations = [];

    if (overallScore >= 80) {
      recommendations.push('🚀 You are excelling! Try advanced topics and have conversations with native speakers.');
    } else if (overallScore >= 60) {
      recommendations.push('📈 You are on the right track! Increase your daily practice to 20-30 minutes.');
      recommendations.push('📚 Focus on reading English materials and watching English videos.');
    } else {
      recommendations.push('💪 Keep practicing! Consistency is key to improvement.');
      recommendations.push('🎯 Focus on building basic vocabulary and simple sentence structures first.');
    }

    if (fluency.vocabularyLevel < 60) {
      recommendations.push('📖 Learn 5-10 new words every day.');
    }

    if (fluency.grammarAccuracy < 60) {
      recommendations.push('📝 Practice writing simple sentences every day.');
    }

    return recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n');
  }

  displayMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `dr0579-message ${isUser ? 'user' : 'bot'}`;
    messageDiv.innerHTML = this.formatMessage(text);
    
    this.messagesDiv.appendChild(messageDiv);
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
  }

  formatMessage(text) {
    // Bold headers
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong style="color: #2c3e50; font-weight: 700;">$1</strong>');
    // Line breaks
    text = text.replace(/\n/g, '<br>');
    // Preserve emoji spacing
    text = text.replace(/([🌟⭐✨🎓📚🎉🏆💪🚀👍✅💯🌱🌿🌳🎯💡📝🔤📊💬👤📅⏰🇰🇷📖📈🎯💪])/g, '<span style="margin: 0 3px;">$1</span>');
    return text;
  }

  updateProgress() {
    if (this.progressDiv) {
      const progress = Math.min(100, (sessionData.progress.totalQuestions / 15) * 100);
      this.progressDiv.innerHTML = `
        <div style="font-size: 13px; color: #34495e; font-weight: 600; margin-bottom: 10px;">
          📊 Progress: ${sessionData.progress.totalQuestions}/15 Questions | 
          🎯 Current Level: ${sessionData.student.detectedLevel || 'Beginner'}
        </div>
        <div style="width: 100%; height: 8px; background: #ecf0f1; border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
          <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #3498db, #2ecc71, #f39c12); transition: width 0.4s ease;"></div>
        </div>
        <div style="font-size: 12px; color: #7f8c8d;">
          ✅ Correct: ${sessionData.progress.correctAnswers} | 
          ⚠️ Partial: ${sessionData.progress.partialCorrect} | 
          📝 Learning: ${sessionData.progress.needsHelp}
        </div>
      `;
    }
  }
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
  new Dr0579AdaptiveChatbot();
});
