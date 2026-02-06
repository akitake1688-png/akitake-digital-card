(function() {
    let knowledgeBase = [];
    let isProcessing = false;
    let semanticCache = new Map();
    let cacheHitCount = 0;
    const CACHE_CLEAR_THRESHOLD = 500;
    
    // === 行为追踪系统 ===
    let userBehavior = {
        sessionId: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        queries: [],
        conversationDepth: 0,
        wechatMentioned: false,
        wechatRejected: false,
        uploadAttempted: false,
        highValueTopics: new Set()
    };

    // === 语义路由引擎 ===
    
    function detectLanguage(text) {
        const chinese = /[\u4e00-\u9fa5]/g;
        const japanese = /[\u3040-\u309f\u30a0-\u30ff]/g;
        const korean = /[\uac00-\ud7af]/g;
        const english = /[a-zA-Z]/g;
        
        const counts = {
            cn: (text.match(chinese) || []).length,
            jp: (text.match(japanese) || []).length,
            kr: (text.match(korean) || []).length,
            en: (text.match(english) || []).length
        };
        
        const total = counts.cn + counts.jp + counts.kr + counts.en;
        if (total === 0) return 'unknown';
        
        const dominant = Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b);
        return dominant[0];
    }

    function calculateSimilarity(str1, str2) {
        const s1 = str1.toLowerCase();
        const s2 = str2.toLowerCase();
        
        let overlap = 0;
        const minLen = Math.min(s1.length, s2.length);
        
        for (let i = 0; i < minLen; i++) {
            if (s1[i] === s2[i]) overlap++;
        }
        
        if (s1.includes(s2) || s2.includes(s1)) {
            overlap += minLen * 0.3;
        }
        
        return overlap / Math.max(s1.length, s2.length);
    }

    function findBestMatch(userInput) {
        const text = userInput.toLowerCase().trim();
        const detectedLang = detectLanguage(userInput);
        
        // 记录查询
        userBehavior.queries.push({
            text: text,
            timestamp: Date.now(),
            language: detectedLang
        });
        userBehavior.conversationDepth++;
        
        const cacheKey = `${text}_${detectedLang}`;
        if (semanticCache.has(cacheKey)) {
            cacheHitCount++;
            
            if (cacheHitCount >= CACHE_CLEAR_THRESHOLD) {
                semanticCache.clear();
                cacheHitCount = 0;
            }
            
            return semanticCache.get(cacheKey);
        }
        
        let matches = [];
        
        knowledgeBase.forEach(item => {
            let score = 0;
            let matchDetails = [];
            
            item.keywords.forEach(keyword => {
                const lowerKey = keyword.toLowerCase();
                
                if (text === lowerKey) {
                    score += 50;
                    matchDetails.push(`精确:${keyword}(+50)`);
                } else if (text.includes(lowerKey)) {
                    score += 30;
                    matchDetails.push(`包含:${keyword}(+30)`);
                } else if (lowerKey.includes(text) && text.length >= 2) {
                    score += 15;
                    matchDetails.push(`部分:${keyword}(+15)`);
                }
                
                const similarity = calculateSimilarity(text, lowerKey);
                if (similarity > 0.5) {
                    const simScore = Math.floor(similarity * 20);
                    score += simScore;
                    matchDetails.push(`相似度:${(similarity * 100).toFixed(0)}%(+${simScore})`);
                }
            });
            
            if (score > 0) {
                const priorityWeight = item.priority / 100;
                score += priorityWeight;
                
                // 慢权重保护
                if (item.priority >= 2800) {
                    score *= 1.2;
                    matchDetails.push('🛡️慢权重保护(x1.2)');
                }
                
                const itemLangSuffix = item.id.split('_').pop();
                if (itemLangSuffix === detectedLang.toUpperCase() || 
                    (detectedLang === 'cn' && itemLangSuffix === 'CN') ||
                    (detectedLang === 'jp' && itemLangSuffix === 'JP') ||
                    (detectedLang === 'en' && itemLangSuffix === 'EN') ||
                    (detectedLang === 'kr' && itemLangSuffix === 'KR')) {
                    score *= 1.15;
                    matchDetails.push(`语言匹配:${detectedLang}(x1.15)`);
                }
                
                matches.push({ item, score, details: matchDetails, id: item.id });
            }
        });
        
        if (matches.length === 0) return null;
        
        matches.sort((a, b) => b.score - a.score);
        
        console.log('🎯 匹配结果 Top 3:');
        matches.slice(0, 3).forEach((m, i) => {
            console.log(`   ${i + 1}. [${m.id}] 得分:${m.score.toFixed(2)}`, m.details);
        });
        
        // 记录高价值主题
        const topMatch = matches[0].item;
        if (topMatch.priority >= 2800) {
            userBehavior.highValueTopics.add(topMatch.id);
        }
        
        const bestMatch = matches[0].item;
        semanticCache.set(cacheKey, bestMatch);
        return bestMatch;
    }

    // === 微信转化检测 ===
    function detectWechatIntent(text) {
        const wechatKeywords = ['qiuwu999', '微信', 'wechat', '联系', '咨询', '加你'];
        return wechatKeywords.some(kw => text.includes(kw));
    }
    
    // === 检测用户拒绝微信 ===
    function detectWechatRejection(text) {
        const rejectionKeywords = ['不加', '不想加', '不要微信', '别推', '不用', '算了'];
        return rejectionKeywords.some(kw => text.includes(kw));
    }

    // === 转化率优化：智能微信引导（V48.1 降低强度版）===
    function shouldShowWechatPrompt() {
        // 安全阀：用户明确拒绝后不再提示
        if (userBehavior.wechatRejected) {
            return false;
        }
        
        // 条件1：对话深度达到4-5轮以上（降低强度）
        if (userBehavior.conversationDepth >= 4 && !userBehavior.wechatMentioned) {
            return true;
        }
        
        // 条件2：访问了3个以上高价值主题（提高门槛）
        if (userBehavior.highValueTopics.size >= 3 && !userBehavior.wechatMentioned) {
            return true;
        }
        
        return false;
    }

    // === 主程序初始化 ===
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const res = await fetch('knowledge.json?v=' + Date.now());
            knowledgeBase = await res.json();
            console.log('✅ 知识库加载完成:', knowledgeBase.length, '条目');

            const input = document.getElementById('user-input');
            const sendBtn = document.getElementById('send-btn');
            const chat = document.getElementById('chat-container');
            
            // === 隐私提示（首次访问）===
            if (!localStorage.getItem('privacyNotified')) {
                setTimeout(() => {
                    appendMessage('bot', '<b>📋 隐私说明</b><br>本站使用浏览器本地存储（localStorage）记录会话数据，用于优化您的咨询体验。所有数据仅存储在您的设备上，不会上传到服务器。您可随时点击"🧹 哨兵物理清除"按钮删除所有数据。', 'privacy-notice');
                    localStorage.setItem('privacyNotified', 'true');
                }, 2000);
            }
            
            // === 开发者工具：查看行为数据 ===
            window.viewUserBehavior = function() {
                console.log('📊 用户行为数据：', {
                    sessionId: userBehavior.sessionId,
                    queryCount: userBehavior.queries.length,
                    depth: userBehavior.conversationDepth,
                    highValueTopics: Array.from(userBehavior.highValueTopics),
                    wechatMentioned: userBehavior.wechatMentioned,
                    wechatRejected: userBehavior.wechatRejected,
                    uploadAttempted: userBehavior.uploadAttempted,
                    queries: userBehavior.queries
                });
                return userBehavior;
            };
            console.log('💡 提示：在 Console 输入 viewUserBehavior() 查看用户行为数据');

            const handleSend = async () => {
                const text = input.value.trim();
                if (!text || isProcessing) return;
                
                isProcessing = true;
                input.disabled = true;
                sendBtn.disabled = true;
                
                // 检测微信意图
                if (detectWechatIntent(text)) {
                    userBehavior.wechatMentioned = true;
                }
                
                // 检测拒绝微信
                if (detectWechatRejection(text)) {
                    userBehavior.wechatRejected = true;
                    console.log('🚫 用户拒绝微信引导，停止后续提示');
                }
                
                appendMessage('user', text);
                input.value = '';
                
                const matched = findBestMatch(text);
                const responseText = matched ? matched.response : knowledgeBase.find(i => i.id === 'SENTINEL_GATE')?.response || '系统错误，请刷新页面';
                
                const segments = responseText.split('[BREAK]');
                for (let seg of segments) {
                    if (seg.trim()) {
                        appendMessage('bot', seg.trim());
                        await new Promise(r => setTimeout(r, 600));
                        if (window.MathJax) MathJax.typesetPromise();
                    }
                }
                
                // === 智能微信引导提示 ===
                if (shouldShowWechatPrompt()) {
                    await new Promise(r => setTimeout(r, 800));
                    appendMessage('bot', '<b>💡 深度咨询建议</b><br>看到您对升学很重视，已咨询多个问题。建议加微信 <b>qiuwu999</b> 进行一对一深度评估，我将为您：<br>● 制定完整升学路径<br>● 评估具体背景优劣势<br>● 提供针对性策略方案<br><br>网页端适合快速了解，微信端才能真正解决您的个性化问题。', 'wechat-prompt');
                    userBehavior.wechatMentioned = true;
                }
                
                isProcessing = false;
                input.disabled = false;
                sendBtn.disabled = false;
                input.focus();
                
                // 保存行为数据到 localStorage
                localStorage.setItem('userBehavior', JSON.stringify({
                    sessionId: userBehavior.sessionId,
                    queryCount: userBehavior.queries.length,
                    depth: userBehavior.conversationDepth,
                    highValueTopics: Array.from(userBehavior.highValueTopics),
                    wechatMentioned: userBehavior.wechatMentioned
                }));
            };

            sendBtn.onclick = handleSend;
            input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };

            // === 左侧按钮事件绑定（修复版）===
            document.querySelectorAll('.nav-btn[data-preset]').forEach(btn => {
                btn.onclick = () => { 
                    input.value = btn.getAttribute('data-preset'); 
                    handleSend(); 
                };
            });

            // === 哨兵清除按钮 ===
            const clearBtn = document.getElementById('clear-btn');
            if (clearBtn) {
                clearBtn.onclick = () => {
                    if (confirm('⚠️ 确认执行哨兵物理清除？所有对话记录将被永久删除。')) {
                        chat.innerHTML = "";
                        localStorage.clear();
                        semanticCache.clear();
                        cacheHitCount = 0;
                        userBehavior = {
                            sessionId: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                            queries: [],
                            conversationDepth: 0,
                            wechatMentioned: false,
                            wechatRejected: false,
                            uploadAttempted: false,
                            highValueTopics: new Set()
                        };
                        console.log('🧹 哨兵清除完成');
                        location.reload();
                    }
                };
            }

        } catch (e) {
            console.error("❌ Sentinel System Error:", e);
            const chat = document.getElementById('chat-container');
            if (chat) {
                appendMessage('bot', '<b>【系统错误】</b>知识库加载失败，请刷新页面重试。');
            }
        }
    });

    function appendMessage(role, html, className = '') {
        const chat = document.getElementById('chat-container');
        if (!chat) return;
        
        const div = document.createElement('div');
        div.className = `msg-row ${role} ${className}`;
        div.innerHTML = `<div class="bubble">${html}</div>`;
        
        // 微信引导消息特殊样式
        if (className === 'wechat-prompt') {
            const bubble = div.querySelector('.bubble');
            if (bubble) {
                bubble.style.background = 'linear-gradient(135deg, #fff9e6 0%, #ffe6cc 100%)';
                bubble.style.border = '2px solid #ff9800';
            }
        }
        
        div.onclick = () => {
            navigator.clipboard.writeText(div.innerText).then(() => {
                div.classList.add('copied');
                setTimeout(() => div.classList.remove('copied'), 2000);
            }).catch(err => console.error('复制失败:', err));
        };
        
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }
})();
