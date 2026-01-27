(function() {
    let knowledgeBase = [];
    let isProcessing = false;
    let semanticCache = new Map();
    let cacheHitCount = 0;
    const CACHE_CLEAR_THRESHOLD = 500; // 每500次命中清空缓存
    
    // ========== V47.1 企业级语义路由引擎 ==========
    
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
            cacheHitCount++;
            
            // 缓存清理机制：防止内存泄漏
            if (cacheHitCount >= CACHE_CLEAR_THRESHOLD) {
                console.log('🧹 缓存清理：已达到', CACHE_CLEAR_THRESHOLD, '次命中');
                semanticCache.clear();
                cacheHitCount = 0;
            }
            
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
                    cacheHitCount = 0;
                    console.log('🧹 哨兵清除完成');
                    location.reload();
                }
            };
            
            // ========== 文件上传功能 ==========
            const uploadBtn = document.getElementById('upload-btn');
            const fileUpload = document.getElementById('file-upload');
            
            uploadBtn.onclick = () => {
                fileUpload.click();
            };
            
            fileUpload.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                // 文件类型检查
                const allowedTypes = /\.(pdf|doc|docx|txt|md)$/i;
                if (!allowedTypes.test(file.name)) {
                    appendMessage('bot', '<b>【哨兵警报】</b>仅支持 PDF、Word、TXT、Markdown 格式文件。');
                    fileUpload.value = '';
                    return;
                }
                
                // 文件大小检查（5MB限制）
                if (file.size > 5 * 1024 * 1024) {
                    appendMessage('bot', '<b>【哨兵警报】</b>文件大小超过 5MB 限制。<br>大文件请直接加微信 <b>qiuwu999</b> 发送，我将为您开启 Sentinel Cowork 专属审计通道。');
                    fileUpload.value = '';
                    return;
                }
                
                appendMessage('user', `📄 已上传文件：${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
                appendMessage('bot', '<b>【哨兵扫描中】</b>正在提取文本内容...');
                
                try {
                    let extractedText = '';
                    
                    // TXT 和 MD 文件直接读取
                    if (/\.(txt|md)$/i.test(file.name)) {
                        extractedText = await file.text();
                    } 
                    // PDF 和 Word 需要特殊处理
                    else {
                        appendMessage('bot', '<b>【技术限制】</b>网页端暂不支持直接解析 PDF/Word 文件。');
                        await new Promise(r => setTimeout(r, 800));
                    }
                    
                    // 如果成功提取文本（TXT/MD）
                    if (extractedText && extractedText.trim()) {
                        const charCount = extractedText.length;
                        const lineCount = extractedText.split('\n').length;
                        
                        appendMessage('bot', `<b>【初步扫描完成】</b>[BREAK]● 文本长度：${charCount} 字符[BREAK]● 段落数：${lineCount} 行[BREAK][BREAK]<b>⚠️ 重要提示：</b>网页端仅能做初步文本统计，无法进行深度逻辑审计。`);
                        await new Promise(r => setTimeout(r, 600));
                    }
                    
                    // 引导加微信进行真正的审计
                    appendMessage('bot', '<b>【秋武逻辑手术建议】</b>[BREAK]要获得真正的东大基准逻辑审计，请：[BREAK][BREAK]1️⃣ 加微信：<b>qiuwu999</b>[BREAK]2️⃣ 发送完整文档（支持 PDF/Word/文本）[BREAK]3️⃣ 我将为您开启 <b>Sentinel Cowork</b> 专属通道[BREAK][BREAK]<b>审计内容包括：</b>[BREAK]● 逻辑断层定位[BREAK]● 论证薄弱环节诊断[BREAK]● 故事线重构建议[BREAK]● 逻辑伏笔埋设指导[BREAK]● 东大基准修改范例[BREAK][BREAK]<b>数据安全承诺：</b>您的文书内容将在审计后物理级删除，绝不留存。');
                    
                } catch (error) {
                    console.error('文件处理错误:', error);
                    appendMessage('bot', '<b>【哨兵错误】</b>文件处理失败。请直接加微信 <b>qiuwu999</b> 发送文件，我将亲自为您审计。');
                }
                
                // 清空文件选择
                fileUpload.value = '';
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
