(function() {
    let knowledgeBase = [];
    let isProcessing = false;
    let semanticCache = new Map();
    let cacheHitCount = 0;
    const CACHE_CLEAR_THRESHOLD = 500;
    const MAX_HISTORY = 5; // 長記憶5輪

    // 狀態機
    let state = 'initializing';
    let db;
    const DB_NAME = 'SentinelDB';
    const DB_VERSION = 1;
    const STORE_HISTORY = 'history';
    const STORE_CHUNKS = 'chunks';
    const STORE_FEEDBACK = 'feedback';

    async function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = (event) => {
                db = event.target.result;
                db.createObjectStore(STORE_HISTORY, { keyPath: 'sessionId' });
                db.createObjectStore(STORE_CHUNKS, { keyPath: 'id', autoIncrement: true });
                db.createObjectStore(STORE_FEEDBACK, { keyPath: 'query' });
            };
            request.onsuccess = (event) => { db = event.target.result; resolve(); };
            request.onerror = reject;
        });
    }

    // 行為追蹤
    let userBehavior = {
        sessionId: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        queries: [],
        conversationDepth: 0,
        wechatMentioned: false,
        wechatRejected: false,
        uploadAttempted: false,
        highValueTopics: new Set(),
        history: [] // 長記憶
    };

    // PDF.js 配置
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

    // 語言檢測 (不變)
    function detectLanguage(text) {
        // ... (Claude 原代碼)
    }

    // 相似度 (升級 Levenshtein)
    function calculateSimilarity(str1, str2) {
        const m = str1.length, n = str2.length;
        const dp = Array.from({length: m+1}, () => Array(n+1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                dp[i][j] = str1[i-1] === str2[j-1] ? dp[i-1][j-1] : Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1;
            }
        }
        return 1 - dp[m][n] / Math.max(m, n);
    }

    // 意图識別
    function detectIntent(text) {
        const strategy = ['怎么办', '怎么', '建议', '策略', '逆袭', '说服', '准备', '面试', '模拟', '答辩', '合作', '模式', '操作'];
        const knowledge = ['定义', '是什么', '解释', '微分', '动量', 'DNA', 'EJU', 'N1', '课', '辅导课'];
        text = text.toLowerCase();
        if (strategy.some(k => text.includes(k))) return 'strategy';
        if (knowledge.some(k => text.includes(k))) return 'knowledge';
        return 'general';
    }

    // 匹配 (升級 + 反饋進化)
    async function findBestMatch(userInput) {
        const text = userInput.toLowerCase().trim();
        const detectedLang = detectLanguage(userInput);
        const intent = detectIntent(userInput);

        userBehavior.queries.push({ text, timestamp: Date.now(), language: detectedLang, intent });
        userBehavior.conversationDepth++;
        userBehavior.history.push({ role: 'user', content: userInput });
        if (userBehavior.history.length > MAX_HISTORY) userBehavior.history.shift(); // 限5輪

        const cacheKey = `${text}_${detectedLang}_${intent}`;
        if (semanticCache.has(cacheKey)) return semanticCache.get(cacheKey);

        // 反饋進化：查 feedback store，高頻未匹配提升權重
        const transaction = db.transaction([STORE_FEEDBACK], 'readwrite');
        const feedbackStore = transaction.objectStore(STORE_FEEDBACK);
        const feedback = await new Promise(r => feedbackStore.get(text).onsuccess = e => r(e.target.result));
        let weightBoost = feedback ? feedback.count * 0.2 : 0; // 高頻 + 權重

        let matches = [];
        knowledgeBase.forEach(item => {
            let score = 0;

            item.keywords.forEach(kw => {
                const lowerKw = kw.toLowerCase();
                if (text.includes(lowerKw)) score += 30;
                const sim = calculateSimilarity(text, lowerKw);
                if (sim > 0.35) score += sim * 30;
            });

            if (intent === 'strategy' && item.id.includes('MODEL') || item.id.includes('WEAK')) score += 50;
            if (intent === 'knowledge' && item.id.includes('EJU') || item.id.includes('LANGUAGE')) score += 50;

            score += item.priority / 100 + weightBoost;

            if (score > 50) matches.push({ item, score });
        });

        if (matches.length === 0) {
            // 未匹配，反饋進化
            feedbackStore.put({ query: text, count: (feedback ? feedback.count + 1 : 1) });
            return null;
        }

        matches.sort((a, b) => b.score - a.score);
        const best = matches[0].item;
        semanticCache.set(cacheKey, best);
        return best;
    }

    // 三部曲注入
    function applyThreeStep(response, userInput) {
        const affirm = "<b>先肯定您：</b>您的問題很有深度，我完全理解。[BREAK]";
        const reconstruct = "<b>邏輯重構：</b>關鍵在於博弈思維...[BREAK]";
        const guide = "<b>💡 引導：</b>下一步加微信 <b>qiuwu999</b> 深度評估。[BREAK]";
        return affirm + response + reconstruct + guide;
    }

    // 行動腳本 (模擬面试追問)
    function actionScript(match, history) {
        if (match.id === "INTERVIEW_SIMULATION_CN") {
            const lastUser = history[history.length - 1].content;
            return "[追問] 基於您的回答，教授可能問：為什麼選這個實驗室？請回覆，我將評分。[BREAK]";
        }
        return "";
    }

    // RAG (文件 chunk + 注入)
    async function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        userBehavior.uploadAttempted = true;

        let text = '';
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext === 'pdf') {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(item => item.str).join(' ') + '\n';
            }
        } else if (ext === 'docx') {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            text = result.value;
        } else {
            text = await file.text();
        }

        // Chunk 存 IndexedDB
        const chunks = text.match(/.{1,500}/g); // 500字 chunk
        const transaction = db.transaction([STORE_CHUNKS], 'readwrite');
        const chunkStore = transaction.objectStore(STORE_CHUNKS);
        chunks.forEach(chunk => chunkStore.add({ content: chunk }));

        return chunks; // 用於注入
    }

    // 注入 RAG
    async function injectRAG(response, chunks) {
        if (chunks) response += "[RAG 注入] 從文件提取關鍵點： " + chunks[0].slice(0, 100) + "...[BREAK]";
        return response;
    }

    // 拒絕/隱私/緩存清
    function clearCache() {
        localStorage.clear();
        indexedDB.deleteDatabase(DB_NAME);
        semanticCache.clear();
        console.log('🧹 緩存清空');
    }

    document.addEventListener('DOMContentLoaded', async () => {
        await openDB();
        const res = await fetch('knowledge.json?v=' + Date.now());
        knowledgeBase = await res.json();
        console.log('✅ 知識庫加載完成: ' + knowledgeBase.length + ' 條目');

        const input = document.getElementById('user-input');
        const sendBtn = document.getElementById('send-btn');
        const chat = document.getElementById('chat-container');
        const uploadBtn = document.getElementById('upload-btn');
        const fileUpload = document.getElementById('file-upload');
        const clearBtn = document.getElementById('clear-btn');

        // 隱私提示
        if (!localStorage.getItem('privacyNotified')) {
            appendMessage('bot', '<b>隱私提示：</b>數據本地存，不上傳。');
            localStorage.setItem('privacyNotified', 'true');
        }

        // 行為追蹤
        window.viewUserBehavior = () => console.log(userBehavior);

        const handleSend = async () => {
            const text = input.value.trim();
            if (!text || isProcessing) return;

            isProcessing = true;

            appendMessage('user', text);
            input.value = '';

            const matched = await findBestMatch(text);
            let responseText = matched ? matched.response : 'fallback';
            responseText = applyThreeStep(responseText, text);

            // 依賴調用
            if (matched.dependencies.length > 0) {
                const depItem = knowledgeBase.find(i => i.id === matched.dependencies[0]);
                if (depItem) responseText += "[依賴] " + depItem.response.slice(0, 100) + "...";
            }

            // 行動腳本
            responseText += actionScript(matched, userBehavior.history);

            // RAG 注入
            responseText = await injectRAG(responseText, null); // 如果有上传 chunks

            const segments = responseText.split('[BREAK]');
            for (let seg of segments) {
                if (seg.trim()) appendMessage('bot', seg.trim());
            }

            // 微信引導
            if (shouldShowWechatPrompt()) {
                appendMessage('bot', '<b>微信引導：</b>加 <b>qiuwu999</b> 深度相談。');
                userBehavior.wechatMentioned = true;
            }

            isProcessing = false;
        };

        sendBtn.onclick = handleSend;
        input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };

        if (uploadBtn && fileUpload) {
            uploadBtn.onclick = () => fileUpload.click();
            fileUpload.onchange = (e) => {
                appendMessage('bot', '<b>上傳引導：</b>文件接收，初步診斷...');
                handleFileUpload(e).then(chunks => {
                    // 注入 RAG to 下一個響應
                });
            };
        }

        clearBtn.onclick = () => {
            if (confirm('確認清?')) {
                chat.innerHTML = '';
                clearCache();
                userBehavior = { ...userBehavior, queries: [], conversationDepth: 0, history: [] };
            }
        };

        // 左侧按钮
        document.querySelectorAll('.nav-btn[data-preset]').forEach(btn => {
            btn.onclick = () => {
                input.value = btn.getAttribute('data-preset');
                handleSend();
            };
        });
    });

    function appendMessage(role, html) {
        const chat = document.getElementById('chat-container');
        const div = document.createElement('div');
        div.className = `msg-row ${role}`;
        div.innerHTML = `<div class="bubble">${html}</div>`;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }

    function shouldShowWechatPrompt() {
        if (userBehavior.wechatRejected) return false;
        if (userBehavior.conversationDepth >= 4 && !userBehavior.wechatMentioned) return true;
        if (userBehavior.highValueTopics.size >= 3 && !userBehavior.wechatMentioned) return true;
        return false;
    }
})();
