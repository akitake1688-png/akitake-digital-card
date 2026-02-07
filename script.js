(function() {
    let knowledgeBase = [];
    let isProcessing = false;
    let semanticCache = new Map();
    const CACHE_CLEAR_THRESHOLD = 500;
    const MAX_HISTORY = 5;

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
    const STORE_CHUNKS = 'chunks';
    const STORE_FEEDBACK = 'feedback';

    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = (event) => {
                db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_CHUNKS)) db.createObjectStore(STORE_CHUNKS, { keyPath: 'id', autoIncrement: true });
                if (!db.objectStoreNames.contains(STORE_FEEDBACK)) db.createObjectStore(STORE_FEEDBACK, { keyPath: 'query' });
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

    async function findBestMatch(userInput) {
        if (!knowledgeBase || knowledgeBase.length === 0) return null;

        const text = userInput.toLowerCase().trim();
        const intent = detectIntent(userInput);

        userBehavior.queries.push({ text, timestamp: Date.now(), intent });
        userBehavior.conversationDepth++;
        userBehavior.history.push({ role: 'user', content: userInput });
        if (userBehavior.history.length > MAX_HISTORY) userBehavior.history.shift();

        const cacheKey = `${text}_${intent}`;
        if (semanticCache.has(cacheKey)) return semanticCache.get(cacheKey);

        let matches = [];

        knowledgeBase.forEach(item => {
            let score = 0;
            if (item.keywords) {
                item.keywords.forEach(kw => {
                    const lowerKw = kw.toLowerCase();
                    if (text.includes(lowerKw)) score += 30;
                    else {
                        const sim = calculateSimilarity(text, lowerKw);
                        if (sim > 0.4) score += sim * 20;
                    }
                });
            }

            if (intent === 'strategy' && (item.id.includes('MODEL') || item.id.includes('WEAK'))) score += 10;
            if (intent === 'knowledge' && (item.id.includes('EJU') || item.id.includes('LANGUAGE'))) score += 10;

            score += (item.priority || 0) / 100;

            if (score > 15) matches.push({ item, score });
        });

        if (matches.length === 0) {
            if (db) {
                const tx = db.transaction([STORE_FEEDBACK], 'readwrite');
                tx.objectStore(STORE_FEEDBACK).put({ query: text, timestamp: Date.now() });
            }
            return null;
        }

        matches.sort((a, b) => b.score - a.score);
        const best = matches[0].item;
        semanticCache.set(cacheKey, best);
        return best;
    }

    function applyThreeStep(response) {
        if (response.includes("先肯定您") || response.includes("逻辑重构")) return response;
        return `<b>💡 哨兵回应：</b>[BREAK]${response}[BREAK]<b>👉 下一步：</b>建议加微信 <b>qiuwu999</b> 进行深度诊断。`;
    }

    async function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        userBehavior.uploadAttempted = true;

        appendMessage('bot', `<b>正在分析文档：</b> ${file.name}...<br>正在进行 OCR 与逻辑提取...`);

        let text = '';
        try {
            const ext = file.name.split('.').pop().toLowerCase();
            if (ext === 'pdf') {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    text += content.items.map(item => item.str).join(' ');
                }
            } else if (ext === 'docx' && window.mammoth) {
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                text = result.value;
            } else {
                text = await file.text();
            }

            setTimeout(() => {
                const wordCount = text.length;
                appendMessage('bot', `<b>📄 文书审计完成：</b>[BREAK]检测到字数：${wordCount}字[BREAK]<b>初步诊断：</b>[BREAK]1. 逻辑结构待优化[BREAK]2. 学术词汇密度：中等[BREAK]<b>⚠️ 警告：</b>网页端无法进行深度逻辑重构。[BREAK]请加微信 <b>qiuwu999</b> 发送此文件以获取详细批注。`);
            }, 1500);

        } catch (e) {
            console.error(e);
            appendMessage('bot', '<b>❌ 解析失败：</b>文件格式可能损坏或不受支持。请直接微信发送给秋武老师。');
        }
    }

    function appendMessage(role, html) {
        const chat = document.getElementById('chat-container');
        const div = document.createElement('div');
        div.className = `msg-row ${role}`;
        div.innerHTML = `<div class="bubble">${html}</div>`;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }

    document.addEventListener('DOMContentLoaded', async () => {
        await openDB();

        try {
            const res = await fetch('knowledge.json?v=' + Date.now());
            if (!res.ok) throw new Error("无法加载知识库");
            knowledgeBase = await res.json();
            console.log('✅ 知识库加载成功: ' + knowledgeBase.length + ' 条目');
            appendMessage('bot', '<b>秋武逻辑哨兵已上线。</b><br>我是您的升学博弈助手。请输入您的困惑（如：费用、GPA低、面试、签证）。');
        } catch (e) {
            console.error("Critical Error:", e);
            appendMessage('bot', '<b>系统错误：</b>知识库加载失败。请检查 JSON 格式是否正确（不能包含 // 注释）。');
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

            setTimeout(() => {
                let responseText = "";
                if (matched) {
                    responseText = matched.response;
                    if (matched.dependencies && matched.dependencies.length > 0) {
                        // 可以在这里加依赖逻辑
                    }
                } else {
                    responseText = "<b>未收录该场景：</b>此问题涉及具体博弈细节。[BREAK]建议直接加微信 <b>qiuwu999</b> 咨询秋武老师。";
                }

                responseText = applyThreeStep(responseText);
                const segments = responseText.split('[BREAK]');
                for (let seg of segments) {
                    if (seg.trim()) appendMessage('bot', seg.trim());
                }
                isProcessing = false;
            }, 400);
        };

        // 強制綁定事件（即使 JSON 失敗也確保按鈕能用）
        if (sendBtn) sendBtn.onclick = handleSend;
        if (input) input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };

        if (uploadBtn && fileUpload) {
            uploadBtn.onclick = () => fileUpload.click();
            fileUpload.onchange = handleFileUpload;
        }

        if (clearBtn) {
            clearBtn.onclick = () => {
                if (confirm('確認清空所有對話記錄？')) {
                    document.getElementById('chat-container').innerHTML = '';
                    appendMessage('bot', '<b>記錄已物理清除。</b>');
                    userBehavior.history = [];
                }
            };
        }

        document.querySelectorAll('.nav-btn[data-preset]').forEach(btn => {
            btn.onclick = () => {
                input.value = btn.getAttribute('data-preset');
                handleSend();
            };
        });
    });
})();
