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
        wechatRejected: false,  // 新增：拒绝标记
        uploadAttempted: false,
        highValueTopics: new Set()
    };

    // 配置 PDF.js workerSrc
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }

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
    
    // === 检测用户拒绝微信 ===
    function detectWechatRejection(text) {
        const rejectionKeywords = ['不加', '不想加', '不要微信', '别推', '不用', '算了'];
        return rejectionKeywords.some(kw => text.includes(kw));
    }

    // === 文书评估逻辑 ===
    function evaluateDocument(text) {
        const lines = text.split('\n').filter(l => l.trim());
        const sentences = text.split(/[。.!?！？]/);
        const length = text.length;
        
        let issues = [];
        let suggestions = [];
        
        if (length < 500) {
            issues.push('文本长度不足500字，论证支撑力度严重不足');
            suggestions.push('<b>建议：</b>扩充"问题意识"部分，增加先行研究引用，强化研究Gap的必然性论证<br><br><b>💡 深度重构：</b>加微信 <b>qiuwu999</b> 获得完整框架模板');
        }
        
        if (lines.length < 10) {
            issues.push('段落结构过于松散（少于10个有效段落）');
            suggestions.push('<b>建议：</b>采用"问题提出→先行研究→Gap定位→研究方法→预期成果"五段式结构<br><br><b>💡 框架指导：</b>微信发送 <b>qiuwu999</b>，我提供东大基准模板');
        }
        
        const hasLiterature = /先行研究|先行文献|previous studies|literature review|背景文献/i.test(text);
        if (!hasLiterature) {
            issues.push('未见明显先行研究引用，Gap来源不明确');
            suggestions.push('<b>范文示例：</b><br>❌ 原句："本研究旨在探讨X现象..."<br>✅ 改写："基于Y教授（2023）指出的Z理论局限，本研究拟通过W方法填补该领域的实证空白..."<br><br><b>💡 教授论文分析：</b>加微信 <b>qiuwu999</b>，我帮您找到最佳引用文献');
        }
        
        const hasMethod = /研究方法|调查方法|实验设计|分析手法|methodology|approach/i.test(text);
        if (!hasMethod && length > 300) {
            issues.push('缺少明确的研究方法论述');
            suggestions.push('<b>建议：</b>采用"方法→预期结果→学术贡献"三层论证<br><br><b>💡 方法论指导：</b>微信 <b>qiuwu999</b>，我为您设计严谨的研究路径');
        }
        
        const connectors = (text.match(/因此|所以|然而|但是|虽然|尽管|furthermore|however|therefore/gi) || []).length;
        const connectorDensity = connectors / sentences.length;
        if (connectorDensity < 0.15) {
            issues.push('逻辑连接词密度过低，段落间转换生硬');
            suggestions.push('<b>建议：</b>在段落衔接处增加"基于此逻辑"、"由此可见"等过渡句<br><br><b>💡 逻辑重构：</b>加微信 <b>qiuwu999</b>，我逐段修正逻辑链条');
        }
        
        const hasPersonal = /本人|笔者|我的|自身经历|实习|实践|my experience/i.test(text);
        if (!hasPersonal && length > 500) {
            suggestions.push('<b>故事线建议：</b>在"研究动机"部分，适度融入个人经历（如实习观察、课题启发）<br><br><b>💡 履历串联：</b>微信 <b>qiuwu999</b>，我帮您挖掘个人亮点并自然嵌入');
        }
        
        return { issues, suggestions };
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

            document.querySelectorAll('.nav-btn[data-preset]').forEach(btn => {
                btn.onclick = () => { input.value = btn.getAttribute('data-preset'); handleSend(); };
            });

            // === 文件上传 ===
            document.getElementById('upload-btn').onclick = () => {
                document.getElementById('file-upload').click();
                userBehavior.uploadAttempted = true;
            };

            document.getElementById('file-upload').onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const supported = /\.(txt|md|csv|json|html|xml|pdf|docx|doc)$/i;
                if (!supported.test(file.name)) {
                    appendMessage('bot', '<b>【哨兵警报】</b>仅支持 TXT/MD/CSV/JSON/HTML/XML/PDF/DOCX 格式文件。');
                    e.target.value = '';
                    return;
                }

                if (file.size > 10 * 1024 * 1024) {
                    appendMessage('bot', '<b>【哨兵警报】</b>文件大小超过 10MB 限制。<br>大文件请直接加微信 <b>qiuwu999</b> 发送，我将为您开启 Sentinel Cowork 专属审计通道。');
                    e.target.value = '';
                    return;
                }

                appendMessage('user', `📄 已上传文件：${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
                appendMessage('bot', '<b>【哨兵扫描中】</b>正在提取文本内容...');

                let extractedText = '';
                const ext = file.name.split('.').pop().toLowerCase();

                try {
                    if (['txt', 'md', 'csv', 'json', 'html', 'xml'].includes(ext)) {
                        extractedText = await file.text();
                    } else if (ext === 'pdf') {
                        const arrayBuffer = await file.arrayBuffer();
                        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                        const pdf = await loadingTask.promise;
                        const maxPages = Math.min(pdf.numPages, 10);
                        for (let i = 1; i <= maxPages; i++) {
                            const page = await pdf.getPage(i);
                            const content = await page.getTextContent();
                            extractedText += content.items.map(item => item.str).join(' ') + '\n\n';
                        }
                        if (pdf.numPages > 10) {
                            extractedText += `\n[注：文件共${pdf.numPages}页，已提取前10页]`;
                        }
                    } else if (ext === 'docx' || ext === 'doc') {
                        const arrayBuffer = await file.arrayBuffer();
                        const result = await mammoth.extractRawText({ arrayBuffer });
                        extractedText = result.value;
                    }

                    if (!extractedText || extractedText.trim().length < 50) {
                        appendMessage('bot', '<b>【提取失败】</b>文件内容为空或无法解析。<br>请确认文件格式正确，或直接加微信 <b>qiuwu999</b> 发送原文件。');
                        e.target.value = '';
                        return;
                    }

                    const previewLength = 3000;
                    const isTruncated = extractedText.length > previewLength;

                    appendMessage('bot', `<b>【初步提取完成】</b><br>● 文本总长度：约 ${extractedText.length} 字<br>● 提取状态：${isTruncated ? '部分预览（前3000字）' : '完整提取'}`);
                    await new Promise(r => setTimeout(r, 400));

                    const evaluation = evaluateDocument(extractedText);
                    
                    if (evaluation.issues.length > 0) {
                        appendMessage('bot', `<b>【逻辑断层诊断】</b><br>${evaluation.issues.map((issue, i) => `${i + 1}. ${issue}`).join('<br>')}`);
                        await new Promise(r => setTimeout(r, 600));
                    }
                    
                    if (evaluation.suggestions.length > 0) {
                        for (let suggestion of evaluation.suggestions.slice(0, 2)) {
                            appendMessage('bot', suggestion);
                            await new Promise(r => setTimeout(r, 600));
                        }
                    }
                    
                    if (evaluation.issues.length === 0 && evaluation.suggestions.length === 0) {
                        appendMessage('bot', '<b>【初步扫描】</b>结构基本完整，未发现明显逻辑断层。<br>但网页端仅作表层扫描，深度伏笔设计、教授心理诱导等高维技法需人工审计。<br><br><b>💡 建议：</b>加微信 <b>qiuwu999</b> 进行完整审计');
                        await new Promise(r => setTimeout(r, 600));
                    }

                    // 最终微信引导（强化）
                    appendMessage('bot', '<b>【🎯 Sentinel Cowork 深度审计】</b><br>网页端仅提供初步诊断（逻辑断层识别 + 基础建议）。<br><br>要获得完整的东大基准逻辑手术，请：<br><br>1️⃣ 加微信：<b>qiuwu999</b><br>2️⃣ 发送完整文档（支持所有格式）<br>3️⃣ 开启专属审计通道<br><br><b>深度服务包含：</b><br>● 逻辑断层精准定位<br>● 故事线重构方案<br>● 逻辑伏笔埋设指导（诱导教授进入您的擅长领域）<br>● 面试预判与对策<br>● 完整修改范例<br><br><b>数据安全：</b>审计后物理级删除，绝不留存。这是工业化辅导的体面底线。');
                    
                    // 记录上传行为
                    userBehavior.uploadAttempted = true;

                } catch (err) {
                    console.error('文件处理错误:', err);
                    appendMessage('bot', `<b>【提取失败】</b>${err.message || '文件解析出错，可能是格式损坏或加密文件。'}<br><br>请直接加微信 <b>qiuwu999</b> 发送文档，我将亲自为您审计。`);
                }

                e.target.value = '';
            };

            // 哨兵清除
            document.getElementById('clear-btn').onclick = () => {
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
                        uploadAttempted: false,
                        highValueTopics: new Set()
                    };
                    console.log('🧹 哨兵清除完成');
                    location.reload();
                }
            };

        } catch (e) {
            console.error("❌ Sentinel System Error:", e);
            appendMessage('bot', '<b>【系统错误】</b>知识库加载失败，请刷新页面重试。');
        }
    });

    function appendMessage(role, html, className = '') {
        const chat = document.getElementById('chat-container');
        const div = document.createElement('div');
        div.className = `msg-row ${role} ${className}`;
        div.innerHTML = `<div class="bubble">${html}</div>`;
        
        // 微信引导消息特殊样式
        if (className === 'wechat-prompt') {
            div.querySelector('.bubble').style.background = 'linear-gradient(135deg, #fff9e6 0%, #ffe6cc 100%)';
            div.querySelector('.bubble').style.border = '2px solid #ff9800';
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
