(function() {
  let knowledgeBase = [];
  let isProcessing = false;
  let semanticCache = new Map();
  let cacheHitCount = 0;
  const CACHE_CLEAR_THRESHOLD = 500;

  // === IndexedDB 长记忆 + RAG 存储 ===
  let db;
  const DB_NAME = 'SentinelDB';
  const DB_VERSION = 1;
  const STORE_HISTORY = 'history';
  const STORE_CHUNKS = 'chunks';
  const STORE_FEEDBACK = 'feedback';

  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_HISTORY)) {
          db.createObjectStore(STORE_HISTORY, { keyPath: 'sessionId' });
        }
        if (!db.objectStoreNames.contains(STORE_CHUNKS)) {
          db.createObjectStore(STORE_CHUNKS, { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(STORE_FEEDBACK)) {
          db.createObjectStore(STORE_FEEDBACK, { keyPath: 'query' });
        }
      };
      request.onsuccess = (event) => {
        db = event.target.result;
        resolve(db);
      };
      request.onerror = (event) => reject(event.target.error);
    });
  }

  // === 行为追踪系统（增强版） ===
  let userBehavior = {
    sessionId: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    queries: [],
    conversationDepth: 0,
    wechatMentioned: false,
    wechatRejected: false,
    uploadAttempted: false,
    highValueTopics: new Set(),
    history: [] // 会话历史
  };

  // 配置 PDF.js
  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
  }

  // === 意图识别层 ===
  function detectIntent(text) {
    const strategyKeywords = ['怎么办', '怎么', '建议', '策略', '逆袭', '说服', '准备', '面试', '模拟', '答辩'];
    const knowledgeKeywords = ['定义', '是什么', '解释', '微分', '动量', 'DNA', 'EJU', 'N1'];
    text = text.toLowerCase();
    if (strategyKeywords.some(k => text.includes(k))) return 'strategy';
    if (knowledgeKeywords.some(k => text.includes(k))) return 'knowledge';
    return 'general';
  }

  // === 匹配函数（升级版） ===
  function findBestMatch(userInput) {
    const text = userInput.toLowerCase().trim();
    const detectedLang = detectLanguage(userInput);
    const intent = detectIntent(userInput);

    userBehavior.queries.push({ text, timestamp: Date.now(), language: detectedLang, intent });
    userBehavior.conversationDepth++;
    userBehavior.history.push({ role: 'user', content: userInput });

    const cacheKey = `${text}_${detectedLang}_${intent}`;
    if (semanticCache.has(cacheKey)) return semanticCache.get(cacheKey);

    let matches = [];

    knowledgeBase.forEach(item => {
      let score = 0;

      item.keywords.forEach(kw => {
        const lowerKw = kw.toLowerCase();
        if (text.includes(lowerKw)) score += 40;
        if (lowerKw.includes(text)) score += 20;
        const sim = calculateSimilarity(text, lowerKw);
        if (sim > 0.35) score += Math.floor(sim * 30); // 阈值降0.35，容错
      });

      // 意图加权
      if (intent === 'strategy' && item.id.includes('MODEL') || item.id.includes('WEAK') || item.id.includes('PERSUASION')) score += 50;
      if (intent === 'knowledge' && item.id.includes('EJU') || item.id.includes('LANGUAGE')) score += 50;

      score += item.priority / 100;

      if (item.priority >= 2800) score *= 1.2;

      if (score > 50) matches.push({ item, score });
    });

    if (matches.length === 0) return null;

    matches.sort((a, b) => b.score - a.score);
    const best = matches[0].item;
    semanticCache.set(cacheKey, best);
    return best;
  }

  // === 三部曲模板注入 ===
  function applyAutumnStyle(response, userInput) {
    const cure = "<b>先肯定您：</b>您的提问很正常，很多学生都有类似困惑。[BREAK]";
    const reconstruct = "<b>逻辑重构：</b>关键不是表面问题，而是背后的博弈逻辑……[BREAK]";
    const action = "<b>💡 立即行动：</b>1. 加微信 qiuwu999 深度评估[BREAK]2. 上传文件初步诊断";
    return cure + response + reconstruct + action;
  }

  // === 行动脚本示例（模拟面试） ===
  function actionScript(interview) {
    if (interview) {
      // 模拟抽题 + 评分（简单规则）
      return "[模拟开始] 第一题：请说明您的研究动机。[BREAK]请回复您的回答，我将评分并追问。";
    }
    return "";
  }

  // === 主程序 ===
  document.addEventListener('DOMContentLoaded', async () => {
    await openDB();

    try {
      const res = await fetch('knowledge.json?v=' + Date.now());
      knowledgeBase = await res.json();

      // 加载历史记忆
      const tx = db.transaction(STORE_HISTORY, 'readonly');
      const store = tx.objectStore(STORE_HISTORY);
      const historyReq = store.get(userBehavior.sessionId);
      historyReq.onsuccess = (e) => {
        if (e.target.result) userBehavior.history = e.target.result.history;
      };

      // ... 其他初始化（input, sendBtn, upload等保持原样）

      const handleSend = async () => {
        const text = input.value.trim();
        if (!text || isProcessing) return;

        isProcessing = true;

        if (detectWechatRejection(text)) userBehavior.wechatRejected = true;

        appendMessage('user', text);

        const matched = findBestMatch(text);
        let responseText = matched ? matched.response : '请试试关键词如"费用"、"面试"，或加微信 qiuwu999 深度咨询';

        // 注入三部曲
        responseText = applyAutumnStyle(responseText, text);

        // 行动脚本
        if (text.includes('模拟面试')) responseText += actionScript(true);

        // ... 分段输出

        // 保存历史
        const tx = db.transaction(STORE_HISTORY, 'readwrite');
        tx.objectStore(STORE_HISTORY).put({ sessionId: userBehavior.sessionId, history: userBehavior.history });

        isProcessing = false;
      };

      // ... 其他事件绑定
    } catch (e) {
      console.error(e);
      appendMessage('bot', '系统错误，请刷新。');
    }
  });

  // ... 其他函数（detectLanguage, calculateSimilarity, appendMessage等保持）
})();
