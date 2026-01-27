(function() {
    let knowledgeBase = [];
    let isProcessing = false;
    let semanticCache = new Map();
    
    // ========== V47.0 企业级语义路由引擎 ==========
    
    // 语言检测系统
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
        
        // 返回主导语言
        const dominant = Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b);
        return dominant[0];
    }
    
    // 语义相似度计算（字符级重叠）
    function calculateSimilarity(str1, str2) {
        const s1 = str1.toLowerCase();
        const s2 = str2.toLowerCase();
        
        let overlap = 0;
        const minLen = Math.min(s1.length, s2.length);
        
        for (let i = 0; i < minLen; i++) {
            if (s1[i] === s2[i]) overlap++;
        }
        
        // 额外检查包含关系
        if (s1.includes(s2) || s2.includes(s1)) {
            overlap += minLen * 0.3;
        }
        
        return overlap / Math.max(s1.length, s2.length);
    }
    
    // 核心匹配算法：多维度评分系统
    function findBestMatch(userInput) {
        const text = userInput.toLowerCase().trim();
        const detectedLang = detectLanguage(userInput);
        
        // 检查缓存
        const cacheKey = `${text}_${detectedLang}`;
        if (semanticCache.has(cacheKey)) {
            console.log('🎯 缓存命中:', cacheKey);
            return semanticCache.get(cacheKey);
        }
        
        let matches = [];
        
        knowledgeBase.forEach(item => {
            let score = 0;
            let matchDetails = [];
            
            // 1. 关键词精确匹配系统
            item.keywords.forEach(keyword => {
                const lowerKey = keyword.toLowerCase();
                
                // 精确匹配 (最高权重)
                if (text === lowerKey) {
                    score += 50;
                    matchDetails.push(`精确:${keyword}(+50)`);
                }
                // 完整包含
                else if (text.includes(lowerKey)) {
                    score += 30;
                    matchDetails.push(`包含:${keyword}(+30)`);
                }
                // 部分重叠
                else if (lowerKey.includes(text) && text.length >= 2) {
                    score += 15;
                    matchDetails.push(`部分:${keyword}(+15)`);
                }
                
                // 语义相似度加分
                const similarity = calculateSimilarity(text, lowerKey);
                if (similarity > 0.5) {
                    const simScore = Math.floor(similarity * 20);
                    score += simScore;
                    matchDetails.push(`相似度:${(similarity * 100).toFixed(0)}%(+${simScore})`);
                }
            });
            
            // 2. 优先级权重系统
            if (score > 0) {
                const priorityWeight = item.priority / 100;
                score += priorityWeight;
                
                // 3. 慢权重保护（核心身份不衰减）
                if (item.priority >= 2800) {
                    score *= 1.2; // 核心条目额外加权
                    matchDetails.push('🛡️慢权重保护(x1.2)');
                }
                
                // 4. 语言匹配加成
                const itemLangSuffix = item.id.split('_').pop();
                if (itemLangSuffix === detectedLang.toUpperCase() || 
                    (detectedLang === 'cn' && itemLangSuffix === 'CN') ||
                    (detectedLang === 'jp' && itemLangSuffix === 'JP') ||
                    (detectedLang === 'en' && itemLangSuffix === 'EN') ||
                    (detectedLang === 'kr' && itemLangSuffix === 'KR')) {
                    score *= 1.15;
                    matchDetails.push(`语言匹配:${detectedLang}(x1.15)`);
                }
                
                matches.push({ 
                    item, 
                    score, 
                    details: matchDetails,
                    id: item.id 
                });
            }
        });
        
        if (matches.length === 0) {
            console.log('⚠️ 无匹配，返回默认 SENTINEL_GATE');
            return null;
        }
        
        // 按分数降序排列
        matches.sort((a, b) => b.score - a.score);
        
        // 调试输出（生产环境可关闭）
        if (matches.length > 0) {
            console.log('🎯 匹配结果 Top 3:');
            matches.slice(0, 3).forEach((m, i) => {
                console.log(`  ${i + 1}. [${m.id}] 得分:${m.score.toFixed(2)}`);
                console.log(`     ${m.details.join(' | ')}`);
            });
        }
        
        const bestMatch = matches[0].item;
        semanticCache.set(cacheKey, bestMatch);
        return bestMatch;
    }
    
    // ========== 主程序初始化 ==========
    
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            // 加载知识库
            const res = await fetch('knowledge.json?v=' + Date.now());
            knowledgeBase = await res.json();
            console.log('✅ 知识库加载完成:', knowledgeBase.length, '条目');
            
            const input = document.getElementById('user-input');
            const sendBtn = document.getElementById('send-btn');
            const chat = document.getElementById('chat-container');
            
            // 消息发送处理器
            const handleSend = async () => {
                const text = input.value.trim();
                if (!text || isProcessing) return;
                
                isProcessing = true;
                input.disabled = true;
                sendBtn.disabled = true;
                
                appendMessage('user', text);
                input.value = '';
                
                // 语义路由匹配
                const matched = findBestMatch(text);
                const responseText = matched 
                    ? matched.response 
                    : knowledgeBase.find(i => i.id === 'SENTINEL_GATE').response;
                
                // 分段渐进式渲染
                const segments = responseText.split('[BREAK]');
                for (let seg of segments) {
                    if (seg.trim()) {
                        appendMessage('bot', seg.trim());
                        await new Promise(r => setTimeout(r, 600));
                    }
                }
                
                isProcessing = false;
                input.disabled = false;
                sendBtn.disabled = false;
                input.focus();
            };
            
            // 事件绑定
            sendBtn.onclick = handleSend;
            input.onkeypress = (e) => { 
                if (e.key === 'Enter') handleSend(); 
            };
            
            // 预设按钮
            document.querySelectorAll('.nav-btn[data-preset]').forEach(btn => {
                btn.onclick = () => { 
                    input.value = btn.getAttribute('data-preset'); 
                    handleSend(); 
                };
            });
            
            // 哨兵清除（物理级重置）
            document.getElementById('clear-btn').onclick = () => {
                if (confirm('⚠️ 确认执行哨兵物理清除？所有对话记录将被永久删除。')) {
                    chat.innerHTML = "";
                    localStorage.clear();
                    semanticCache.clear();
                    console.log('🧹 哨兵清除完成');
                    location.reload();
                }
            };
            
        } catch (e) { 
            console.error("❌ Sentinel System Error:", e); 
        }
    });
    
    // 消息追加函数
    function appendMessage(role, html) {
        const chat = document.getElementById('chat-container');
        const div = document.createElement('div');
        div.className = `msg-row ${role}`;
        div.innerHTML = `<div class="bubble">${html}</div>`;
        
        // 点击复制功能
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
