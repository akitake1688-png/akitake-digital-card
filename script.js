(function() {
    let knowledgeBase = [];
    let isProcessing = false;
    let semanticCache = new Map();
    let cacheHitCount = 0;
    const CACHE_CLEAR_THRESHOLD = 500;

    // PDF.js worker配置
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }

    // 语言检测（保留原版）
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

    // 语义相似度（保留原版）
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

    // 匹配算法（完整保留V47.1）
    function findBestMatch(userInput) {
        const text = userInput.toLowerCase().trim();
        const detectedLang = detectLanguage(userInput);
        
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
        
        const bestMatch = matches[0].item;
        semanticCache.set(cacheKey, bestMatch);
        return bestMatch;
    }

    // ========== 新增：学部/大学院材料类型判断（轻量关键词） ==========
    function detectDocumentType(text) {
        const gradKeywords = /先行研究|先行文献|Gap|仮説|実証|研究方法|methodology|文献レビュー|仮定|検証|先行研究|研究計画/i;
        const undergradKeywords = /志望理由書|学部|総合政策|興味を持ったきっかけ|きっかけは|環境政策|文化政策|地域活性化|卒業後|将来/i;
        
        if (gradKeywords.test(text)) return 'graduate';      // 大学院优先
        if (undergradKeywords.test(text)) return 'undergraduate';
        return 'unknown';  // 默认学部
    }

    // ========== 文书评估逻辑（两种模式） ==========
    function evaluateDocument(text) {
        const type = detectDocumentType(text);
        const lines = text.split('\n').filter(l => l.trim());
        const sentences = text.split(/[。.!?！？]/).filter(s => s.trim());
        const length = text.length;
        
        let praises = [];
        let suggestions = [];

        if (type === 'graduate' || type === 'unknown') {
            // 大学院/默认模式（保留原有研究生风格，但温和）
            if (length < 800) suggestions.push('文本长度稍短，可进一步强化研究Gap与方法论的严谨性');
            if (lines.length < 12) suggestions.push('段落可再细分，增强逻辑推进感');
            
            const hasLiterature = /先行研究|先行文献|previous studies/i.test(text);
            if (!hasLiterature) suggestions.push('建议明确引用1–2篇先行研究，突出Gap的必然性');
            
            const hasMethod = /研究方法|methodology/i.test(text);
            if (!hasMethod) suggestions.push('建议补充方法论部分，增强学术说服力');
            
            praises.push('整体学术性强，方向清晰');
        } else {
            // 学部模式（积极、温和、针对志望理由书）
            if (length < 400) suggestions.push('长度稍短，可再丰富个人兴趣与政策结合的部分');
            else praises.push('长度适中，内容完整，表达真挚');
            
            const hasMotivation = /きっかけ|興味|好き|感動/i.test(text);
            if (hasMotivation) praises.push('个人动机鲜明，从兴趣到政策的连接自然生动');
            else suggestions.push('建议在开头强化“为什么选择该学部”的触发点');
            
            const hasPolicyLink = /政策|環境政策|文化政策|著作権/i.test(text);
            if (hasPolicyLink) praises.push('兴趣与学部方向匹配度高，环境+文化思路清晰');
            
            const hasFuture = /卒業後|将来|貢献/i.test(text);
            if (hasFuture) praises.push('未来展望具体，方向感强');
            else suggestions.push('可补充1–2个具体行动（如参与地域项目），增强可行性');
        }

        // 输出格式
        let output = `<b>【初步扫描 - ${type === 'graduate' ? '大学院' : '学部/本科'}模式】</b><br>`;
        if (praises.length > 0) {
            output += praises.map(p => `● ${p}`).join('<br>') + '<br>';
        }
        if (suggestions.length > 0) {
            output += '<br><b>可优化建议（温和版）</b><br>';
            suggestions.forEach((s, i) => output += `${i+1}. ${s}<br>`);
            
            // 范文式建议（1处正面示例）
            output += '<br><b>范文式优化示例</b><br>';
            if (type === 'graduate') {
                output += '原句示例："本研究探讨X现象..."<br>建议改写："基于Y教授（2023）指出的Z理论局限，本研究拟通过W方法填补实证空白..."';
            } else {
                output += '原句示例："私が総合政策に興味を持ったきっかけは..."<br>建议改写："私が総合政策に興味を持ったきっかけは、絵を描く中で感じた自然の美しさと、初音ミクの音楽を通じて生まれたコミュニティの力です。これらを支える政策を学び、環境と文化の両面から地域活性化に貢献したいと考えています。"';
            }
        } else {
            output += '<br>整体优秀，未发现明显可优化点。结构完整、动机真挚、展望清晰！';
        }

        return { issues: [], suggestions: [output] };
    }

    // ========== 主程序初始化（保留原有 + 上传部分增强） ==========
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const res = await fetch('knowledge.json?v=' + Date.now());
            knowledgeBase = await res.json();

            const input = document.getElementById('user-input');
            const sendBtn = document.getElementById('send-btn');
            const chat = document.getElementById('chat-container');

            const handleSend = async () => {
                const text = input.value.trim();
                if (!text || isProcessing) return;
                
                isProcessing = true;
                input.disabled = true;
                sendBtn.disabled = true;
                
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
                
                isProcessing = false;
                input.disabled = false;
                sendBtn.disabled = false;
                input.focus();
            };

            sendBtn.onclick = handleSend;
            input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };

            document.querySelectorAll('.nav-btn[data-preset]').forEach(btn => {
                btn.onclick = () => { input.value = btn.getAttribute('data-preset'); handleSend(); };
            });

            // ========== 文件上传 ==========
            document.getElementById('upload-btn').onclick = () => {
                document.getElementById('file-upload').click();
            };

            document.getElementById('file-upload').onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const supported = /\.(txt|md|csv|json|html|xml|pdf|docx|doc)$/i;
                if (!supported.test(file.name)) {
                    appendMessage('bot', '<b>【哨兵警报】</b>仅支持 TXT/MD/CSV/JSON/HTML/XML/PDF/DOCX/DOC');
                    e.target.value = '';
                    return;
                }

                if (file.size > 10 * 1024 * 1024) {
                    appendMessage('bot', '<b>【哨兵警报】</b>文件超过10MB，请加微信 qiuwu999 发送');
                    e.target.value = '';
                    return;
                }

                appendMessage('user', `📄 已上传：${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
                appendMessage('bot', '<b>【哨兵扫描中】</b>正在提取文本...');

                let extractedText = '';
                const ext = file.name.split('.').pop().toLowerCase();

                try {
                    if (['txt', 'md', 'csv', 'json', 'html', 'xml'].includes(ext)) {
                        extractedText = await file.text();
                    } else if (ext === 'pdf') {
                        const arrayBuffer = await file.arrayBuffer();
                        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                        const maxPages = Math.min(pdf.numPages, 10);
                        for (let i = 1; i <= maxPages; i++) {
                            const page = await pdf.getPage(i);
                            const content = await page.getTextContent();
                            extractedText += content.items.map(item => item.str).join(' ') + '\n\n';
                        }
                    } else if (ext === 'docx' || ext === 'doc') {
                        const arrayBuffer = await file.arrayBuffer();
                        const result = await mammoth.extractRawText({ arrayBuffer });
                        extractedText = result.value;
                    }

                    if (!extractedText || extractedText.trim().length < 50) {
                        appendMessage('bot', '<b>【提取失败】</b>内容为空或无法解析，请加微信 qiuwu999 发送原文件');
                        e.target.value = '';
                        return;
                    }

                    const previewLength = 3000;
                    const previewText = extractedText.substring(0, previewLength) + (extractedText.length > previewLength ? '...' : '');

                    appendMessage('bot', `<b>【初步提取完成】</b><br>● 总长度：约 ${extractedText.length} 字<br>● 状态：${extractedText.length > previewLength ? '前3000字预览' : '完整提取'}`);

                    // 类型判断 + 评估
                    const evaluation = evaluateDocument(extractedText);
                    appendMessage('bot', evaluation.suggestions[0]);

                    appendMessage('bot', '<b>【Sentinel Cowork 深度审计】</b><br>网页端仅初步诊断。要完整东大基准手术，请：<br>1️⃣ 加微信 qiuwu999<br>2️⃣ 发送完整文档<br>3️⃣ 开启专属通道<br><br><b>服务包含：</b>断层定位、故事重构、伏笔指导、修改范例<br><b>安全承诺：</b>审计后物理级删除，绝不留存');

                } catch (err) {
                    appendMessage('bot', `<b>【提取失败】</b>${err.message || '解析出错'}<br>请加微信 qiuwu999 发送原文件`);
                }

                e.target.value = '';
            };

            document.getElementById('clear-btn').onclick = () => {
                if (confirm('⚠️ 确认物理清除？所有记录永久删除')) {
                    document.getElementById('chat-container').innerHTML = "";
                    localStorage.clear();
                    semanticCache.clear();
                    cacheHitCount = 0;
                    location.reload();
                }
            };

        } catch (e) {
            console.error("Sentinel System Error:", e);
        }
    });

    function appendMessage(role, html) {
        const chat = document.getElementById('chat-container');
        const div = document.createElement('div');
        div.className = `msg-row ${role}`;
        div.innerHTML = `<div class="bubble">${html}</div>`;
        
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
