(function() {
    let knowledgeBase = [];
    let isProcessing = false;
    let semanticCache = new Map();
    let cacheHitCount = 0;
    const CACHE_CLEAR_THRESHOLD = 500;

    // PDF.js worker配置（保留原配置）
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }

    // 语言检测（完整保留）
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

    // 语义相似度（完整保留）
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

    // 核心匹配算法（完整保留V47.1版）
    function findBestMatch(userInput) {
        const text = userInput.toLowerCase().trim();
        const detectedLang = detectLanguage(userInput);
        
        const cacheKey = `${text}_${detectedLang}`;
        if (semanticCache.has(cacheKey)) {
            console.log('🎯 缓存命中:', cacheKey);
            cacheHitCount++;
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

    // ========== 材料类型轻量判断（新增，轻量关键词，无风险） ==========
    function detectDocumentType(text) {
        const gradKeywords = /先行研究|先行文献|Gap|仮説|実証|研究方法|methodology|文献レビュー|仮定|検証/i;
        const undergradKeywords = /志望理由書|学部|総合政策|興味を持ったきっかけ|きっかけは|環境政策|文化政策|地域活性化|卒業後|将来/i;
        
        if (gradKeywords.test(text)) return 'graduate';
        if (undergradKeywords.test(text)) return 'undergraduate';
        return 'undergraduate'; // 默认学部（更常见）
    }

    // ========== 文书评估逻辑（优化版：学部友好、积极为主、差异化、委婉暧昧） ==========
    function evaluateDocument(text) {
        const type = detectDocumentType(text);
        const length = text.length;
        const paraCount = text.split('\n').filter(l => l.trim()).length;
        
        const hasMotivation = /きっかけ|興味|好き|感動|興味を持った|きっかけは/i.test(text);
        const hasPolicy = /政策|環境政策|文化政策|著作権|表現の自由|地域活性化/i.test(text);
        const hasFuture = /卒業後|将来|進みたい|貢献|活躍/i.test(text);
        
        let praises = [];
        let suggestions = [];
        
        // 字数模糊描述（避免千篇一律数字）
        let lengthDesc = length < 400 ? '篇幅较为精炼' :
                         length < 800 ? '长度适中，内容充实' :
                         length < 1500 ? '篇幅饱满，论述较为完整' :
                         '内容详实，信息密度较高';
        
        // 学部模式（默认）
        if (type !== 'graduate') {
            praises.push(`● ${lengthDesc}`);
            
            if (hasMotivation) praises.push('个人动机鲜明，兴趣触发点生动自然');
            else suggestions.push('兴趣来源可再补充1–2个具体细节，让动机更打动教授');
            
            if (hasPolicy) praises.push('兴趣与综合政策方向契合度高，思路清晰');
            else suggestions.push('兴趣与学部政策的连接可再强化一些');
            
            if (hasFuture) praises.push('未来展望具体，方向感强');
            else suggestions.push('未来部分可再补充1–2个可落地的行动计划');
            
            if (paraCount >= 8) praises.push('段落结构清晰，阅读节奏舒适');
            else suggestions.push('段落可适当细分，增强逻辑推进感');
            
            // 整体评价（分层、暧昧）
            const praiseCount = praises.length - 1; // 减去lengthDesc
            let overall = praiseCount >= 4 ? '整体水准较高，已具备很强的竞争力' :
                          praiseCount >= 3 ? '基础扎实，方向明确，还有上升空间' :
                          praiseCount >= 2 ? '动机真挚，潜力明显，可再打磨' :
                          '内容真诚，但结构与政策结合还有提升空间';
            
            let output = `<b>【初步扫描 - 学部/本科志望理由书】</b><br>`;
            praises.forEach(p => output += `${p}<br>`);
            
            output += `<br><b>整体评价：</b> ${overall}`;
            
            if (suggestions.length > 0) {
                output += '<br><br><b>可优化建议（温和版）</b><br>';
                suggestions.forEach((s, i) => output += `${i+1}. ${s}<br>`);
                
                // 范文示例（1处正面）
                output += '<br><b>范文式优化示例</b><br>';
                output += '原句示例："私が総合政策に興味を持ったきっかけは..."<br>';
                output += '建议强化："私が総合政策に興味を持ったきっかけは、絵を描く中で感じた自然の美しさと、初音ミクの音楽を通じて生まれたコミュニティの力です。これらを支える政策を学び、環境と文化の両面から地域活性化に貢献したいと考えています。"<br>（改写后动机更生动，学部契合更明确）';
            } else {
                output += '<br><br>整体优秀，未发现明显可优化点。结构完整、动机真挚、展望清晰，是一份很有潜力的志望理由书！';
            }
            
            output += `<br><br><b>【Sentinel Cowork 深度审计】</b><br>网页端仅作初步扫描。要获得 Claude Projects + 流形约束语义路由系统 + RAG 知识库扩展的东大基准深度审计，请加微信 <b>qiuwu999</b> 发送完整文档，我将为您开启专属通道。<br>数据安全承诺：审计后物理级删除，绝不留存。`;
            
            return { issues: [], suggestions: [output] };
        }
        
        // 大学院模式（备用，温和学术版）
        else {
            let output = `<b>【初步扫描 - 大学院研究计划书】</b><br>`;
            output += `● ${lengthDesc}<br>`;
            output += '整体学术性较强，方向清晰。网页端仅作初步扫描，建议加微信 qiuwu999 进行更深度分析。';
            return { issues: [], suggestions: [output] };
        }
    }

    // ========== 主程序初始化（其余部分完整保留，不做任何改动） ==========
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
                        if (window.MathJax) MathJax.typesetPromise().catch(e => console.log(e));
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

                    appendMessage('bot', `<b>【初步提取完成】</b><br>● 内容长度：${lengthDesc}<br>● 状态：${extractedText.length > previewLength ? '前3000字预览' : '完整提取'}`);

                    const evaluation = evaluateDocument(extractedText);
                    appendMessage('bot', evaluation.suggestions[0]);

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
