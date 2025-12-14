document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 0. AI 核心数据与状态管理
    // ==========================================
    let knowledgeBase = null; // 知识库在加载完成前为 null
    const KNOWLEDGE_FILE = './knowledge.json'; // 知识库文件路径
    
    // --- 元素获取 ---
    const chatBody = document.getElementById('chat-body');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    const initialCard = document.querySelector('.initial-card');
    const menuCard = document.querySelector('.menu-card');
    const contentCards = document.querySelectorAll('.content-card');
    
    const expandButton = document.getElementById('expandButton');
    const backButton = document.getElementById('backButton');
    const menuButtons = document.querySelectorAll('.menu-button'); 
    const closeButtons = document.querySelectorAll('.close-content');

    const linkFreeMechanism = document.getElementById('linkFreeMechanism');
    const linkBilibili = document.getElementById('linkBilibili');

    // ==========================================
    // 1. UI 交互与修复部分 (Navigation & UI Fixes)
    // ==========================================
    
    // ====== 导航逻辑彻底修复 (保持不变) ======
    if (expandButton && initialCard && menuCard) {
        expandButton.addEventListener('click', () => {
            initialCard.classList.add('hidden');
            menuCard.classList.remove('hidden');
        });
    }

    if (backButton && initialCard && menuCard) {
        backButton.addEventListener('click', () => {
            contentCards.forEach(card => card.classList.add('hidden'));
            menuCard.classList.add('hidden');
            initialCard.classList.remove('hidden');
        });
    }

    if (menuButtons.length > 0 && menuCard) {
        menuButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetId = e.currentTarget.dataset.target;
                const targetCard = document.getElementById(targetId);
                
                menuCard.classList.add('hidden');
                contentCards.forEach(card => card.classList.add('hidden')); 

                if (targetCard) {
                    targetCard.classList.remove('hidden');
                }
            });
        });
    }

    if (closeButtons.length > 0 && menuCard) {
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const parentCard = button.closest('.content-card');
                if (parentCard) {
                    parentCard.classList.add('hidden');
                }
                menuCard.classList.remove('hidden');
            });
        });
    }

    if (linkFreeMechanism) {
        linkFreeMechanism.addEventListener('click', () => {
            window.open('https://www.zhihu.com/people/dong-da-ri-ben-qiu-wu-lao-shi', '_blank'); 
        });
    }

    if (linkBilibili) {
        linkBilibili.addEventListener('click', () => {
            window.open('https://space.bilibili.com/323700487/lists', '_blank');
        });
    }


    // ==========================================
    // 2. AI 核心逻辑层 (Knowledge Loading & Matching)
    // ==========================================

    /**
     * 【新功能】异步加载知识库，解决脚本过长导致的不稳定问题
     */
    async function loadKnowledgeBase() {
        if (sendBtn) sendBtn.disabled = true;
        if (userInput) userInput.placeholder = '加载知识库中...请稍候';
        
        try {
            const response = await fetch(KNOWLEDGE_FILE);
            if (!response.ok) {
                throw new Error(`无法加载知识库: ${response.statusText}`);
            }
            knowledgeBase = await response.json();
            
            if (sendBtn) sendBtn.disabled = false;
            if (userInput) userInput.placeholder = '输入提问...';
            console.log('知识库加载成功！');
            appendMessage('ai', '📚 **秋武知识库加载完成。** 您可以开始提问！');
        } catch (error) {
            console.error('加载知识库失败:', error);
            appendMessage('ai', `⚠️ **警告：知识库加载失败。** 请检查 ${KNOWLEDGE_FILE} 文件是否存在或格式是否正确。回复可能受限。`);
        }
    }
    
    /**
     * 【优化】核心匹配逻辑：精确短语加权 > 关键词数量
     */
    function getBestMatch(rawText) {
        if (!knowledgeBase) return null; // 知识库未加载，无法匹配

        const text = normalizeInput(rawText);
        let bestMatch = null;
        let maxScore = 0;

        // 权重设置：精确短语匹配分数极高，确保优先于普通关键词
        const EXACT_PHRASE_WEIGHT = 500;
        const KEYWORD_WEIGHT = 1;

        knowledgeBase.forEach(item => {
            let matchScore = 0;

            // 1. 精确短语匹配 (高优先级)
            if (item.exactPhrases && Array.isArray(item.exactPhrases)) {
                item.exactPhrases.forEach(phrase => {
                    if (text.includes(phrase.toLowerCase())) {
                        matchScore += EXACT_PHRASE_WEIGHT;
                    }
                });
            }
            
            // 2. 普通关键词匹配 (低优先级，作为补充)
            if (item.keywords && Array.isArray(item.keywords)) {
                item.keywords.forEach(keyword => {
                    if (text.includes(keyword)) {
                        // 确保匹配的关键词是小写的，因为 normalizeInput 已经转为小写
                        matchScore += KEYWORD_WEIGHT;
                    }
                });
            }

            // 3. 结合权重和优先级
            const finalScore = matchScore + (matchScore > 0 ? item.priority : 0);
            
            if (finalScore > maxScore) {
                maxScore = finalScore;
                bestMatch = item;
            }
        });

        // 匹配阈值：至少匹配到一个精确短语（500分），或者多个普通关键词
        if (maxScore >= EXACT_PHRASE_WEIGHT || maxScore > 10) { 
            return bestMatch;
        }
        
        return null; // 未找到足够精准的匹配
    }

    /**
     * 【优化】SNS_COMMENT_GENERATOR 模式：动态抽取核心逻辑
     */
    function enterSNSCommentGeneratorMode(prompt) {
        appendMessage('user', '生成评论或回复：' + prompt);
        showTypingIndicator();
        
        // 尝试匹配最相关的知识点
        const bestMatch = getBestMatch(prompt);
        let dynamicInsight = "对不起，知识库中未能找到与您提问高度匹配的核心逻辑，请尝试更精准的关键词。";
        let matchTitle = "【终局思维】";

        if (bestMatch) {
            // 提取匹配条目的标题和核心观点，作为动态内容
            matchTitle = bestMatch.response.split('\n')[0].replace(/【|】/g, ''); 
            // 尝试提取核心要点（假设是第4行或第5行，即1. 或 2. 的内容）
            const lines = bestMatch.response.split('\n');
            dynamicInsight = lines.find(line => line.trim().startsWith('1.') || line.trim().startsWith('2.')) || lines[1] || lines[lines.length - 1];
            // 清理并注入到模板中
            dynamicInsight = dynamicInsight.replace(/<\/?(strong|em)>/g, '').trim(); 
        }

        setTimeout(() => {
            removeTypingIndicator();
            
            let comment = `
【秋武老师・終局思考のプロコメント】
针对当前热议话题：「${prompt}」

**1. 跨学科洞察 (文理融合)：**
该问题绝非单维度可解。结合秋武老师的 *理工科逻辑与东大社会学视角*，我们需从**系统论**或**行为经济学**角度进行深度剖析。

**2. 核心逻辑重构 (动态注入)：**
真正的难点在于：${matchTitle}。您的核心症结在于：**${dynamicInsight}**。建议在[资源配置/策略制定]时，必须遵循**“终局思维”**反推。避免陷入[盲目随大流/短期利益]的陷阱。

**3. 中肯行动建议：**
留学是一笔严肃的投资。请务必优先进行**一问一答式的面试答辩草稿编辑**，确保您的软实力武装到位。这是将‘破绽’转化为优势的关键。

👉 *[专业且中肯]* 细节规划请直接添加秋武老师微信（ID: qiuwu999）进行一对一深度诊断。
            `.trim();

            const commentDiv = document.createElement('div');
            commentDiv.classList.add('message', 'ai-message', 'sns-comment'); 
            
            commentDiv.innerHTML = comment
                .replace(/\n/g, '<br>')
                .replace(/【(.*?)】/g, '<strong>【$1】</strong>') 
                .replace(/\*(.*?)\*/g, '<em>$1</em>'); 
            
            chatBody.appendChild(commentDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
            
            appendMessage('ai', '✅ **评论已生成。** 此为秋武特色、专业中肯的文案，欢迎直接复制到社交媒体使用。');

        }, 1500);
    }

    /**
     * 输入预处理层：增强容错、术语归一化 (保持不变)
     */
    function normalizeInput(text) {
        let normalized = text.toLowerCase();
        
        const mapping = {
            'egu': 'eju', '流学': '留学', '留考': 'eju', 'jlpt': '日语能力考', 
            '托业': 'toeic', '托福': 'toefl', '东大': '东京大学', '京大': '京都大学',
            '私塾': '辅导机构', '修士': '研究生/硕士', '中介': '机构', '就职': '就活',
            '大学院': '硕士', '研究室': '导师', '研究生': '预科生', '早大': '早稻田大学',
            '志望': '志望理由书', '研究': '研究计划书', '草稿': '面试草稿', '面试': '面试训练',
            '林业': '文理融合', '生态': '文理融合', '社会学': '文理融合', '健康保险费': '保险', '年金': '保险',
            '好吃吗': '好吃', 
        };

        for (const [key, value] of Object.entries(mapping)) {
            normalized = normalized.replace(new RegExp(key, 'g'), value);
        }
        return normalized;
    }


    /**
     * 【新增】非严肃/幽默提问识别器 (保持不变)
     */
    function checkNonSeriousIntent(rawText) {
        const humorKeywords = ['偶像周边', '搞笑', '有趣', '幽默', '笑话', '好吃', '遣返', '味道'];
        const nonSeriousPhrases = ['跨文化心理研究的需要', '全部用来买', '秋武老师好吃吗'];
        
        const text = rawText.toLowerCase();

        const isHumorous = humorKeywords.some(kw => text.includes(kw));
        const isNonSerious = nonSeriousPhrases.some(p => text.includes(p));

        return isHumorous || isNonSerious;
    }

    /**
     * 响应生成器 (Dialogue Strategy Layer)
     */
    function generateAIResponse(rawText) {
        
        if (!knowledgeBase) {
            return "知识库正在加载中，请稍候...或联系管理员检查 knowledge.json 文件。";
        }

        // 【第一步：幽默/非严肃识别 - 恢复人性化】
        if (checkNonSeriousIntent(rawText)) {
            // 匹配到幽默/非严肃，直接返回预设的幽默回复
            return `
👉 哈哈，您这个问题太有趣了，秋武老师也被您的 *幽默感逗笑了！😊 \n 
不过，从专业的角度看，请务必保持对日本法律和生活规范的尊重和遵守。 \n 
*健康保险和国民年金是您在日本合法生活和学习的**基础保障**，它们与偶像周边是两个完全不同的范畴。 \n 
任何故意逃避缴纳或滥用资金的行为都可能影响您的 *签证更新审查，这是风险极高的行为。 \n 
我们建议您将精力重新聚焦于您的 *留学目标和学术规划上来，确保所有生活和学习活动都在 *合规透明的框架下进行。\n 
💡 本系统提供快速、结构化的咨询服务。如果您的提问较为复杂、涉及个人详细情况或需要 *终局思维下的逻辑重构，建议添加秋武老师微信进行 *一对一深度沟通。\n 
～～🌸東大ノ秋書堂
            `.trim();
        }

        // 【第二步：核心知识库匹配 (使用优化的匹配逻辑)】
        const bestMatch = getBestMatch(rawText);

        if (bestMatch) {
            // 专业回复，移除情绪化表情
            return bestMatch.response.replace(/🌸|😊|🤔/g, ''); 
        }

        // 【第三步：默认响应 - 终局思维下的引导（针对长文/复杂问题）】
        // 这种回复只有在精确匹配失败时才会出现，次数将大大减少。
        return `
そのご質問は、秋武先生的**「终局思维」**需要分析的主题。
\n
您的提问较为复杂，涉及**多维度逻辑拆解**，系统未能找到精确匹配的知识点。\n
\n
💡 **最中肯的解决方案：** 您可以直接添加秋武老师微信（ID: qiuwu999），进行文理融合视角下的**一对一深度诊断**，我们将专注于对您个人情况的**逻辑重构**。
        `;
    }
    
    // ====== 聊天功能核心逻辑 (handleUserMessage 中新增 SNS 模式检查) ======
    if (sendBtn && userInput && chatBody) {
        sendBtn.addEventListener('click', handleUserMessage);
        userInput.addEventListener('keypress', (e) => {
            // 只有知识库加载完成后，才响应 Enter 键
            if (e.key === 'Enter' && !sendBtn.disabled) handleUserMessage();
        });
    }

    // --- 聊天功能辅助函数 ---
    function handleUserMessage() {
        if (sendBtn.disabled) return; // 防止在加载时发送消息

        const text = userInput.value.trim();
        if (!text) return;

        if (text.startsWith("生成评论或回复：")) {
            const prompt = text.replace("生成评论或回复：", "").trim();
            enterSNSCommentGeneratorMode(prompt);
            userInput.value = '';
            return;
        }

        appendMessage('user', text);
        userInput.value = '';

        showTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator();
            const response = generateAIResponse(text); 
            appendMessage('ai', response);
        }, 1500); 
    }

    function appendMessage(sender, message) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
        
        const formattedMessage = message.replace(/\n/g, '<br>');
        msgDiv.innerHTML = formattedMessage;
        
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight; 
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.classList.add('message', 'ai-message');
        typingDiv.innerText = '秋武AI 正在深度分析中 (终局思维)...';
        chatBody.appendChild(typingDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) typingDiv.remove();
    }
    
    // 启动：加载知识库
    loadKnowledgeBase();
});
