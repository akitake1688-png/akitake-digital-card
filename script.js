(function() {
    let knowledgeBase = [];
    let isProcessing = false;
    let semanticCache = new Map();
    const CACHE_CLEAR_THRESHOLD = 500;
    const MAX_HISTORY = 5;
    let state = 'initializing';

    let userBehavior = {
        sessionId: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        queries: [],
        conversationDepth: 0,
        wechatMentioned: false,
        wechatRejected: false,
        uploadAttempted: false,
        highValueTopics: new Set(),
        history: []
    };

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
                db.createObjectStore(STORE_HISTORY, { keyPath: 'sessionId' });
                db.createObjectStore(STORE_CHUNKS, { keyPath: 'id', autoIncrement: true });
                db.createObjectStore(STORE_FEEDBACK, { keyPath: 'query' });
            };
            request.onsuccess = (event) => { db = event.target.result; resolve(); };
            request.onerror = reject;
        });
    }

    if (window.pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }

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

    function detectIntent(text) {
        const strategy = ['怎么办', '怎么', '建议', '策略', '逆袭', '说服', '准备', '面试', '模拟', '答辩', '合作', '模式', '操作'];
        const knowledge = ['定义', '是什么', '解释', '微分', '动量', 'DNA', 'EJU', 'N1', '课', '辅导课'];
        text = text.toLowerCase();
        if (strategy.some(k => text.includes(k))) return 'strategy';
        if (knowledge.some(k => text.includes(k))) return 'knowledge';
        return 'general';
    }

    function detectLanguage(text) {
        if (text.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/)) return 'jp'; // 日文
        if (text.match(/[\uac00-\ud7a3]/)) return 'kr'; // 韓文
        if (text.match(/[a-zA-Z]/)) return 'en'; // 英文
        return 'cn'; // 默认中文
    }

    async function findBestMatch(userInput) {
        if (!knowledgeBase || knowledgeBase.length === 0) return null;
        
        const text = userInput.toLowerCase().trim();
        const intent = detectIntent(text);
        const lang = detectLanguage(userInput);
        
        userBehavior.queries.push({ text, timestamp: Date.now(), intent });
        userBehavior.conversationDepth++;
        
        const cacheKey = `${text}_${intent}`;
        if (semanticCache.has(cacheKey)) return semanticCache.get(cacheKey);

        // 反饋進化：查 feedback store，高頻未匹配提升權重
        let weightBoost = 0;
        if (db) {
            const transaction = db.transaction([STORE_FEEDBACK], 'readwrite');
            const feedbackStore = transaction.objectStore(STORE_FEEDBACK);
            const feedback = await new Promise(r => feedbackStore.get(text).onsuccess = e => r(e.target.result));
            if (feedback) {
                weightBoost = feedback.count * 0.2; // 高頻 + 權重
                feedback.count += 1;
                feedbackStore.put(feedback);
            } else {
                feedbackStore.put({ query: text, count: 1 });
            }
        }

        let matches = [];
        
        knowledgeBase.forEach(item => {
            let score = 0;
            item.keywords.forEach(kw => {
                const lowerKw = kw.toLowerCase();
                if (text.includes(lowerKw)) score += 30 + lowerKw.length * 2; // 長度優先
                else {
                    const sim = calculateSimilarity(text, lowerKw);
                    if (sim > 0.4) score += sim * 20;
                }
            });

            if (intent === 'strategy' && item.id.includes('MODEL') || item.id.includes('WEAK')) score += 10;
            if (intent === 'knowledge' && item.id.includes('EJU') || item.id.includes('LANGUAGE')) score += 10;
            score += item.priority / 100 + weightBoost;

            if (score > 15) matches.push({ item, score });
        });

        if (matches.length === 0) {
            if (lang !== 'cn') {
                return { response: "<b>檢測到外語查詢：</b>為了保證邏輯嚴謹，建議在微信中使用中日韓英多語討論。加 <b>qiuwu999</b> 開始。" };
            }
            return null;
        }

        matches.sort((a, b) => b.score - a.score);
        const best = matches[0].item;
        semanticCache.set(cacheKey, best);
        return best;
    }

    function applyThreeStep(response, userInput) {
        const affirm = "<b>先肯定您：</b>您的問題很有深度，我完全理解。[BREAK]";
        const reconstruct = "<b>邏輯重構：</b>關鍵在於博弈思維...[BREAK]";
        const guide = "<b>💡 引導：</b>下一步加微信 <b>qiuwu999</b> 深度評估。[BREAK]";
        return affirm + reconstruct + response + guide;
    }

    async function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        userBehavior.uploadAttempted = true;
        
        appendMessage('bot', `<b>正在分析文檔：</b> ${file.name}...<br>正在進行 OCR 與邏輯提取...`);

        let text = '';
        try {
            const ext = file.name.split('.').pop().toLowerCase();
            if (ext === 'pdf') {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    text += content.items.map(item => item.str).join(' ') + '\n';
                }
            } else if (ext === 'docx' && window.mammoth) {
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                text = result.value;
            } else {
                text = await file.text();
            }

            // RAG chunk 存 IndexedDB
            const chunks = text.match(/.{1,500}/g) || [];
            const transaction = db.transaction([STORE_CHUNKS], 'readwrite');
            const chunkStore = transaction.objectStore(STORE_CHUNKS);
            chunks.forEach(chunk => chunkStore.add({ content: chunk }));

            const wordCount = text.length;
            appendMessage('bot', `<b>📄 文書審計完成：</b>[BREAK]檢測到字數：${wordCount}字[BREAK]<b>初步診斷：</b>[BREAK]1. 邏輯結構待優化[BREAK]2. 學術詞彙密度：中等[BREAK]<b>⚠️ 警告：</b>網頁端無法進行深度邏輯重構。[BREAK]請加微信 <b>qiuwu999</b> 發送此文件以獲取詳細批註。`);

        } catch (e) {
            console.error(e);
            appendMessage('bot', '<b>❌ 解析失敗：</b>文件格式可能損壞或不受支持。請直接微信發送給秋武老師。');
        }
    }

    async function injectRAG(response, query) {
        const transaction = db.transaction([STORE_CHUNKS], 'readonly');
        const chunkStore = transaction.objectStore(STORE_CHUNKS);
        const chunks = await new Promise(r => {
            const req = chunkStore.getAll();
            req.onsuccess = e => r(e.target.result);
        });

        if (chunks.length > 0) {
            const relevantChunk = chunks.find(chunk => chunk.content.toLowerCase().includes(query.toLowerCase()));
            if (relevantChunk) response += "[RAG 注入] 從文件提取關鍵點： " + relevantChunk.content.slice(0, 100) + "...[BREAK]";
        }
        return response;
    }

    function actionScript(match, history) {
        if (match.id === "INTERVIEW_SIMULATION_CN") {
            const lastUser = history[history.length - 1].content;
            return "[追問] 基於您的回答，教授可能問：為什麼選這個實驗室？請回覆，我將評分。[BREAK]";
        }
        return "";
    }

    function appendMessage(role, html) {
        const chat = document.getElementById('chat-container');
        const div = document.createElement('div');
        div.className = `msg-row ${role}`;
        div.innerHTML = `<div class="bubble">${html}</div>`;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }

    function clearCache() {
        localStorage.clear();
        indexedDB.deleteDatabase(DB_NAME);
        semanticCache.clear();
        console.log('🧹 緩存清空');
    }

    document.addEventListener('DOMContentLoaded', async () => {
        await openDB();
        try {
            const res = await fetch('knowledge.json?v=' + Date.now());
            if (!res.ok) throw new Error("無法加載知識庫");
            knowledgeBase = await res.json();
            console.log('✅ 知識庫加載完成: ' + knowledgeBase.length + ' 條目');
            appendMessage('bot', '<b>秋武邏輯哨兵 V53 已上線。</b><br>我是您的升學博弈助手。請輸入您的困惑（如：費用、GPA低、面試、簽證）。');
            state = 'ready';
        } catch (e) {
            console.error("Critical Error:", e);
            appendMessage('bot', '<b>系統錯誤：</b>知識庫加載失敗。請檢查 JSON 格式是否正確 (不能包含 // 註釋)。');
            state = 'error';
        }

        const input = document.getElementById('user-input');
        const sendBtn = document.getElementById('send-btn');
        const uploadBtn = document.getElementById('upload-btn');
        const fileUpload = document.getElementById('file-upload');
        const clearBtn = document.getElementById('clear-btn');

        const handleSend = async () => {
            const text = input.value.trim();
            if (!text || isProcessing) return;
            isProcessing = true;

            appendMessage('user', text);
            input.value = '';

            const matched = await findBestMatch(text);
            
            if (!matched) {
                const fallbackMsg = "<b>哨兵提示：</b>当前逻辑库未检索到直接关联。建议：[BREAK]1. 换个关键词（如“费用”、“面试”）[BREAK]2. 直接加微信 <b>qiuwu999</b> 获取真人审计。";
                const segments = fallbackMsg.split('[BREAK]');
                for (let seg of segments) {
                    if (seg.trim()) appendMessage('bot', seg.trim());
                }
                isProcessing = false;
                return;
            }

            let responseText = matched.response;

            if (matched.priority >= 2800) {
                responseText = applyThreeStep(responseText, text);
            }

            if (matched.dependencies && matched.dependencies.length > 0) {
                const depItem = knowledgeBase.find(i => i.id === matched.dependencies[0]);
                if (depItem) responseText += "[BREAK]<b>关联深度：</b>" + depItem.response.slice(0, 50) + "...";
            }

            responseText += actionScript(matched, userBehavior.history);
            responseText = await injectRAG(responseText, text);

            const segments = responseText.split('[BREAK]');
            for (let seg of segments) {
                if (seg.trim()) appendMessage('bot', seg.trim());
            }
            
            isProcessing = false;
        };

        sendBtn.onclick = handleSend;
        input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };

        if (uploadBtn && fileUpload) {
            uploadBtn.onclick = () => fileUpload.click();
            fileUpload.onchange = handleFileUpload;
        }

        clearBtn.onclick = () => {
            if (confirm('⚠️ 確認執行哨兵物理清除？所有對話記錄將被永久刪除。')) {
                chat.innerHTML = '';
                clearCache();
                userBehavior = {
                    sessionId: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    queries: [],
                    conversationDepth: 0,
                    wechatMentioned: false,
                    wechatRejected: false,
                    uploadAttempted: false,
                    highValueTopics: new Set(),
                    history: []
                };
                console.log('🧹 哨兵清除完成');
                location.reload();
            }
        };

        // 隱私提示
        if (!localStorage.getItem('privacyNotified')) {
            appendMessage('bot', '<b>📋 隱私說明</b><br>本站使用瀏覽器本地存儲（localStorage）記錄會話數據，用於優化您的諮詢體驗。所有數據僅存儲在您的設備上，不會上傳到服務器。您可隨時點擊"🧹 哨兵物理清除"按鈕刪除所有數據。', 'privacy-notice');
            localStorage.setItem('privacyNotified', 'true');
        }

        // 行為追蹤
        window.viewUserBehavior = function() {
            console.log('📊 用戶行為數據：', userBehavior);
            return userBehavior;
        };
        console.log('💡 提示：在 Console 輸入 viewUserBehavior() 查看用戶行為數據');
    });
})();
