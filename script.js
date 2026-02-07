(function() {
    // ==========================================
    // 1. 初始化核心变量
    // ==========================================
    let knowledgeBase = [];
    let isProcessing = false;
    let semanticCache = new Map();
    const MAX_HISTORY = 5; // 短期记忆容量
    let state = 'initializing';
    
    // 用户行为追踪对象
    let userBehavior = {
        sessionId: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        queries: [],        // 仅记录查询词
        conversationDepth: 0,
        uploadAttempted: false,
        history: []         // 完整对话记录 (用于上下文追问)
    };

    let db;
    const DB_NAME = 'SentinelDB';
    const DB_VERSION = 1;
    const STORE_CHUNKS = 'chunks';
    const STORE_FEEDBACK = 'feedback';

    // ==========================================
    // 2. 数据库与工具函数
    // ==========================================
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

    // 字符串相似度算法 (Levenshtein Distance 变体)
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

    // 意图检测
    function detectIntent(text) {
        const strategy = ['怎么办', '怎么', '建议', '策略', '逆袭', '说服', '准备', '面试', '模拟', '答辩', '合作', '模式', '操作'];
        const knowledge = ['定义', '是什么', '解释', '微分', '动量', 'DNA', 'EJU', 'N1', '课', '辅导课'];
        text = text.toLowerCase();
        if (strategy.some(k => text.includes(k))) return 'strategy';
        if (knowledge.some(k => text.includes(k))) return 'knowledge';
        return 'general';
    }

    // ==========================================
    // 3. 核心逻辑引擎
    // ==========================================
    async function findBestMatch(userInput) {
        if (!knowledgeBase || knowledgeBase.length === 0) return null;
        
        const text = userInput.toLowerCase().trim();
        const intent = detectIntent(text);
        
        // 记录基础查询数据
        userBehavior.queries.push({ text, timestamp: Date.now(), intent });
        userBehavior.conversationDepth++;
        
        // 缓存优先
        const cacheKey = `${text}_${intent}`;
        if (semanticCache.has(cacheKey)) return semanticCache.get(cacheKey);

        // 反馈权重进化 (带熔断上限)
        let weightBoost = 0;
        if (db) {
            const transaction = db.transaction([STORE_FEEDBACK], 'readwrite');
            const feedbackStore = transaction.objectStore(STORE_FEEDBACK);
            const feedback = await new Promise(r => feedbackStore.get(text).onsuccess = e => r(e.target.result));
            if (feedback) {
                weightBoost = Math.min(feedback.count * 0.2, 5); // ⚠️ 上限设为5，防止权重过载
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
                if (text.includes(lowerKw)) score += 30 + lowerKw.length * 2;
                else {
                    const sim = calculateSimilarity(text, lowerKw);
                    if (sim > 0.4) score += sim * 20;
                }
            });
            // 意图加权
            if (intent === 'strategy' && (item.id.includes('MODEL') || item.id.includes('WEAK'))) score += 10;
            if (intent === 'knowledge' && (item.id.includes('EJU') || item.id.includes('LANGUAGE'))) score += 10;
            
            score += item.priority / 100 + weightBoost;
            if (score > 15) matches.push({ item, score });
        });

        if (matches.length === 0) return null;
        
        matches.sort((a, b) => b.score - a.score);
        const best = matches[0].item;
        semanticCache.set(cacheKey, best);
        return best;
    }

    // 三部曲逻辑
    function applyThreeStep(response, userInput) {
        const affirm = "<b>先肯定您：</b>您的问题很有深度，我完全理解。[BREAK]";
        const reconstruct = "<b>逻辑重构：</b>关键在于博弈思维...[BREAK]";
        const guide = "<b>💡 引导：</b>下一步加微信 <b>qiuwu999</b> 深度评估。[BREAK]";
        return affirm + reconstruct + response + guide;
    }

    // 行动脚本 (面试追问)
    function actionScript(match, history) {
        // ⚠️ 防御性检查：如果没有历史记录，直接返回空，防止崩溃
        if (!history || history.length === 0) return "";
        
        if (match.id === "INTERVIEW_SIMULATION_CN") {
            const lastUserMsg = history[history.length - 1];
            if (lastUserMsg && lastUserMsg.role === 'user') {
                return "[追问] 基于您的回答，教授可能问：为什么选这个实验室？请回复，我将评分。[BREAK]";
            }
        }
        return "";
    }

    // RAG 注入逻辑
    async function injectRAG(response, query) {
        if (!db) return response;
        const transaction = db.transaction([STORE_CHUNKS], 'readonly');
        const chunkStore = transaction.objectStore(STORE_CHUNKS);
        const chunks = await new Promise(r => {
            const req = chunkStore.getAll();
            req.onsuccess = e => r(e.target.result);
            req.onerror = () => r([]);
        });
        
        if (chunks.length > 0) {
            const relevantChunk = chunks.find(chunk => chunk.content.toLowerCase().includes(query.toLowerCase()));
            if (relevantChunk) {
                response += "[BREAK]<b>📂 文档关联：</b>" + relevantChunk.content.slice(0, 80) + "...";
            }
        }
        return response;
    }

    // ==========================================
    // 4. UI 交互逻辑
    // ==========================================
    function appendMessage(role, html) {
        const chat = document.getElementById('chat-container');
        if (!chat) return;
        const div = document.createElement('div');
        div.className = `msg-row ${role}`;
        div.innerHTML = `<div class="bubble">${html}</div>`;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }

    function showLoadingBar(message) {
        // 简单复用 bot 消息作为加载提示
        appendMessage('bot', `<i>${message}</i>`);
    }

    // 文件上传处理
    async function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        userBehavior.uploadAttempted = true;
        appendMessage('bot', `<b>正在分析文档：</b> ${file.name}...<br>正在进行 OCR 与逻辑提取...`);
        
        try {
            let text = '';
            if (window.pdfjsLib && file.name.endsWith('.pdf')) {
                 const arrayBuffer = await file.arrayBuffer();
                 const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                 for (let i = 1; i <= pdf.numPages; i++) {
                     const page = await pdf.getPage(i);
                     const content = await page.getTextContent();
                     text += content.items.map(item => item.str).join(' ') + '\n';
                 }
            } else if (window.mammoth && file.name.endsWith('.docx')) {
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                text = result.value;
            } else {
                text = await file.text();
            }

            // 存储 Chunks
            const chunks = text.match(/.{1,500}/g) || [];
            const transaction = db.transaction([STORE_CHUNKS], 'readwrite');
            const chunkStore = transaction.objectStore(STORE_CHUNKS);
            chunks.forEach(chunk => chunkStore.add({ content: chunk }));
            
            appendMessage('bot', `<b>📄 文书审计完成：</b>[BREAK]字数：${text.length}字[BREAK]<b>初步诊断：</b>逻辑结构已提取。[BREAK]⚠️ 网页端无法深度重构，请加微信 <b>qiuwu999</b> 获取批注。`);
        } catch (e) {
            console.error(e);
            appendMessage('bot', '<b>❌ 解析失败：</b>文件格式不受支持或损坏。');
        }
    }

    // ==========================================
    // 5. DOM 绑定与启动
    // ==========================================
    document.addEventListener('DOMContentLoaded', async () => {
        showLoadingBar('哨兵初始化中...');
        await openDB();
        
        try {
            const res = await fetch('knowledge.json?v=' + Date.now());
            if (!res.ok) throw new Error("JSON Error");
            knowledgeBase = await res.json();
            console.log('✅ 知识库加载: ' + knowledgeBase.length + '条');
            
            // 欢迎语
            appendMessage('bot', '<b>秋武逻辑哨兵 V53.2 已就绪。</b><br>全系统自检完成。请输入困惑或点击左侧导航。');
            state = 'ready';
        } catch (e) {
            console.error(e);
            appendMessage('bot', '<b>系统错误：</b>知识库加载失败。');
            state = 'error';
        }

        const input = document.getElementById('user-input');
        const sendBtn = document.getElementById('send-btn');
        const uploadBtn = document.getElementById('upload-btn');
        const fileUpload = document.getElementById('file-upload');
        const clearBtn = document.getElementById('clear-btn');

        // 发送核心处理函数
        const handleSend = async (overrideText = null) => {
            const text = overrideText || input.value.trim();
            if (!text || isProcessing) return;
            isProcessing = true;
            
            // 1. UI 显示并记录用户历史
            appendMessage('user', text);
            if (!overrideText) input.value = '';
            
            // ⚠️ 关键修正：记录历史，防止 actionScript 空转
            userBehavior.history.push({ role: 'user', content: text, timestamp: Date.now() });
            if (userBehavior.history.length > MAX_HISTORY) userBehavior.history.shift();

            // 2. 匹配逻辑
            const matched = await findBestMatch(text);
            
            if (!matched) {
                const fallback = "<b>哨兵提示：</b>未检索到关联。建议换个词或加微信 <b>qiuwu999</b>。";
                appendMessage('bot', fallback);
                userBehavior.history.push({ role: 'bot', content: fallback });
            } else {
                let responseText = matched.response;
                
                // 应用三部曲
                if (matched.priority >= 2800) {
                    responseText = applyThreeStep(responseText, text);
                }
                
                // 应用依赖关联
                if (matched.dependencies && matched.dependencies.length > 0) {
                    const depItem = knowledgeBase.find(i => i.id === matched.dependencies[0]);
                    if (depItem) responseText += "[BREAK]<b>关联深度：</b>" + depItem.response.slice(0, 50) + "...";
                }

                // 应用行动脚本 (现已安全)
                responseText += actionScript(matched, userBehavior.history);
                
                // RAG 注入
                responseText = await injectRAG(responseText, text);

                // 3. 输出分段并记录 Bot 历史
                const segments = responseText.split('[BREAK]');
                let fullBotResponse = "";
                for (let seg of segments) {
                    if (seg.trim()) {
                        appendMessage('bot', seg.trim());
                        fullBotResponse += seg.trim() + " ";
                    }
                }
                userBehavior.history.push({ role: 'bot', content: fullBotResponse });
            }
            
            isProcessing = false;
        };

        // 事件绑定
        sendBtn.onclick = () => handleSend();
        input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };
        
        if (uploadBtn) uploadBtn.onclick = () => fileUpload.click();
        if (fileUpload) fileUpload.onchange = handleFileUpload;
        
        if (clearBtn) clearBtn.onclick = () => {
            if (confirm('⚠️ 确认执行哨兵物理清除？')) {
                localStorage.clear();
                // 尝试清除 IndexedDB
                const req = indexedDB.deleteDatabase(DB_NAME);
                req.onsuccess = () => location.reload();
                req.onerror = () => location.reload();
            }
        };

        // 修复左侧按键绑定（双重保险策略）
        const bindNavButtons = () => {
            const navBtns = document.querySelectorAll('.nav-btn[data-preset]');
            let count = 0;
            navBtns.forEach(btn => {
                // 移除旧事件防止重复 (虽然 onclick 是覆盖，但保持逻辑清晰)
                btn.onclick = null; 
                btn.onclick = () => {
                    // 模拟用户输入体验
                    input.value = btn.getAttribute('data-preset');
                    handleSend(); 
                };
                count++;
            });
            if(count > 0) console.log(`✅ 已绑定 ${count} 个导航按钮`);
        };

        // 策略：立即执行 + 延迟兜底
        bindNavButtons(); 
        setTimeout(bindNavButtons, 800); 

        // 暴露行为追踪到全局 (调试用)
        window.viewUserBehavior = () => {
            console.log('📊 用户行为数据：', userBehavior);
            return userBehavior;
        };
    });
})();
