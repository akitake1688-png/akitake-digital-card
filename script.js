document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. UI 交互与修复部分 (Navigation & UI Fixes)
    // ==========================================
    
    // --- 聊天窗口元素 ---
    const chatBody = document.getElementById('chat-body'); // 聊天记录区域
    const userInput = document.getElementById('user-input'); // 输入框
    const sendBtn = document.getElementById('send-btn'); // 发送按钮

    // --- 卡片导航元素 ---
    const initialCard = document.querySelector('.initial-card');
    const menuCard = document.querySelector('.menu-card');
    const contentCards = document.querySelectorAll('.content-card');
    
    // --- 按钮元素 ---
    const expandButton = document.getElementById('expandButton');
    const backButton = document.getElementById('backButton');
    const menuButtons = document.querySelectorAll('.menu-button'); // 核心优势、辅导模式、成功案例
    const closeButtons = document.querySelectorAll('.close-content');

    // --- 外部链接按钮 (新增在详情卡片中) ---
    const linkFreeMechanism = document.getElementById('linkFreeMechanism');
    const linkBilibili = document.getElementById('linkBilibili');


    // ====== 导航逻辑修复 ======

    // 初始卡片 -> 菜单卡片
    if (expandButton && initialCard && menuCard) {
        expandButton.addEventListener('click', () => {
            initialCard.classList.add('hidden');
            menuCard.classList.remove('hidden');
        });
    }

    // 返回按钮 (从菜单卡片返回初始卡片)
    if (backButton && initialCard && menuCard) {
        backButton.addEventListener('click', () => {
            menuCard.classList.add('hidden');
            initialCard.classList.remove('hidden');
        });
    }

    // 【关键修复】菜单卡片 -> 内容详情卡片
    if (menuButtons.length > 0 && menuCard) {
        menuButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetId = e.currentTarget.dataset.target;
                const targetCard = document.getElementById(targetId);
                
                // 确保所有详情卡片隐藏
                contentCards.forEach(card => card.classList.add('hidden')); 

                // 隐藏菜单卡片并显示目标详情卡片
                menuCard.classList.add('hidden');
                if (targetCard) {
                    targetCard.classList.remove('hidden');
                }
            });
        });
    }

    // 关闭详情卡片 -> 返回菜单卡片
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


    // ====== 外部链接跳转 ======
    
    // 辅导模式详情页的跳转按钮 (知乎)
    if (linkFreeMechanism) {
        linkFreeMechanism.addEventListener('click', () => {
            window.open('https://www.zhihu.com/people/dong-da-ri-ben-qiu-wu-lao-shi', '_blank'); 
        });
    }

    // 成功案例详情页的跳转按钮 (B站)
    if (linkBilibili) {
        linkBilibili.addEventListener('click', () => {
            window.open('https://space.bilibili.com/323700487/lists', '_blank');
        });
    }


    // ====== 聊天功能核心逻辑 ======

    // 发送消息事件
    if (sendBtn && userInput && chatBody) {
        sendBtn.addEventListener('click', handleUserMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleUserMessage();
        });
    }
    
    // --- 聊天功能辅助函数 ---
    function handleUserMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        appendMessage('user', text);
        userInput.value = '';

        showTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator();
            const response = generateAIResponse(text);
            appendMessage('ai', response);
        }, 1200); // 增加思考时间，匹配深度回复
    }

    function appendMessage(sender, message) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
        
        // 支持简单的换行显示
        const formattedMessage = message.replace(/\n/g, '<br>');
        msgDiv.innerHTML = formattedMessage;
        
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.classList.add('message', 'ai-message');
        typingDiv.innerText = '秋武AI 正在深度思考中...';
        chatBody.appendChild(typingDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) typingDiv.remove();
    }


    // ==========================================
    // 2. AI 深度优化层 (Knowledge & Intent)
    // ==========================================

    /**
     * 输入预处理层：增强容错、术语归一化
     */
    function normalizeInput(text) {
        let normalized = text.toLowerCase();
        
        // 增强常见错别字与术语修正 (高容错率)
        const mapping = {
            'egu': 'eju', '流学': '留学', '留考': 'eju', 'jlpt': '日语能力考', 
            '托业': 'toeic', '托福': 'toefl', '东大': '东京大学', '京大': '京都大学',
            '私塾': '辅导机构', '修士': '研究生/硕士', '中介': '机构', '就职': '就活',
            '大学院': '硕士', '研究生': '预科生', '研究室': '导师', '早大': '早稻田大学'
        };

        for (const [key, value] of Object.entries(mapping)) {
            // 使用正则表达式进行全局替换
            normalized = normalized.replace(new RegExp(key, 'g'), value);
        }
        return normalized;
    }

    /**
     * 知识库：结构化、专业深度回复
     */
    const knowledgeBase = [
        {
            keywords: ['签证', '难吗', '拒签', '怕', '入管局'],
            priority: 10,
            response: "【签证与安心】🇯🇵 安心感是留学成功的第一步。\n\n我完全理解您对签证的担忧，它就像第一次吃纳豆——看起来黏黏的，但准备充分就顺滑多了！🌸\n\n1. **专业视角：** 日本签证注重申请材料的**真实性**和**资金的透明性**。只要您有明确的学习计划和稳定的经济支持，目前批签率是比较高的。\n2. **风险提醒：** 故意逃避缴纳国民年金或健康保险等行为，会严重影响您后续的签证更新审查，这是高风险行为。\n\n💡 **下一步建议：** 我们可以帮您先梳理最关键的材料，比如资金证明和学习计划书。请问您计划在哪个时间段递交申请呢？"
        },
        {
            keywords: ['费用', '钱', '预算', '花销', '贵', '打工'],
            priority: 10,
            response: "【费用与投资回报】💰 留学是一笔严肃的投资。\n\n我理解家长对投资回报的慎重。日本留学平均年费用（学费+生活费）大约在15-20万人民币，确实是高性价比的选择。\n\n1. **回报分析：** 日本教育体系强调独立思考和团队协作（跨文化优势），这对您未来进入日企或外企，乃至回国发展，都是宝贵的职场底蕴。\n2. **勤工俭学：** 日本允许留学生合法打工，很多同学能通过打工覆盖大部分生活费，减轻经济压力。\n\n💡 **秋武老师建议：** 我们不是简单地省钱，而是要让每一分钱都投在‘终局思维’的规划上。您最关注的是生活费还是学费呢？"
        },
        {
            keywords: ['eju', '留考', '分数', '校内考', '难'],
            priority: 11, // 最高权重
            response: "【EJU与考学底层逻辑】📚 不要陷入‘大家都在做的’思维。\n\nEJU 只是敲门砖，真正的落差在于**软实力**（校内考、面试、小论文）。秋武老师常说：合格的底层逻辑是**不要放弃任何试错机会**。\n\n1. **策略偏差：** 很多大学在申报时只需要 EJU **准考证**，而不是具体成绩。放弃 6 月留考，您将失去临场体验校内考的机会，尤其是面试沟通部分，那是软实力的核心。\n2. **破绽利用：** 如果 EJU 成绩有‘破绽’，我们必须通过研究计划书和面试，将其转化为独特的视角，引导教授提问。\n\n💡 **行动指南：** 请告诉我您的 EJU 目标分数段和最没信心的科目，我们从策略上进行重构！"
        },
        {
            keywords: ['孤独', '适应', '文化', '读空气', '朋友'],
            priority: 9,
            response: "【文化适应与高情商】孤独感是留学常见‘小Boss’，但打败它就像玩《塞尔达》一样，多探索就通关了！🎮\n\n1. **心理适应：** 文化适应期通常是 3-6 个月。日本职场中的‘读空气’（空気を読む）对习惯直接表达的中国学生确实是挑战。但它的核心是**和谐与体贴**。\n2. **日式治愈：** 建议将此视为‘自我提升’，而非压力。我们鼓励您多参加大学社团，学习用间接的方式表达体贴，最终您会爱上这种和谐。\n\n💡 **我们一起：** 您目前最担心的是哪方面的文化差异，是学习还是生活习惯？"
        },
        {
            keywords: ['修士', '大学院', '研究计划', '研究室', '法学', '经济'],
            priority: 10,
            response: "【修士直考与研究计划】这是决定您未来的核心战役。⚔️\n\n您提到法学背景、托业 800+、N1 长期学习，这都是很好的基础。但直考修士的几率，最终取决于：\n\n1. **逻辑重构：** 您的法学背景如何支撑您转到经济学？研究计划书需要展现出**跨学科的深度思考**，而不是简单的知识堆砌。\n2. **终局思维：** 秋武老师在面试中会问：毕业后的打算？只有明确目标，才能倒推阐述您在此专业中学习的重点和学以致用的计划。\n\n💡 **下一步：** 请将您目前的研究计划书发给我们，我将用‘东大基准’的逻辑为您指出可以被‘利用’的破绽和亮点！"
        },
        {
            keywords: ['私塾', '机构', '避雷', '推荐', '合作'],
            priority: 9,
            response: "【私塾/机构的选择】🔍 找私塾不是找最大，而是找‘最匹配’。\n\n1. **秋武老师的建议：** 很多大机构是流水线作业，缺乏对您个人经历的深度挖掘。真正的辅导，应该是像‘画龙点睛’一样，在您的基础上提升逻辑和表达，而不是给您套模板。\n2. **免费模式：** 我们的**免费辅导模式**就是基于利益深度绑定的原则——通过我推荐进入合作机构，他们会替您支付我的辅导费，确保您享受高端一对一服务。\n\n💡 **现在行动：** 请告诉我您主要想辅导哪个阶段（EJU、校内考、修士文书），我来帮您匹配最合适的策略。"
        },
        {
            keywords: ['免费', '收费', '价格', '盈利模式'],
            priority: 10,
            response: "【收费模式与免费机制】🤝 透明度是合作的基石。\n\n1. **免费辅导模式：** 这是我们强烈推荐的模式。通过秋武老师的推荐进入合作私塾/语言学校，机构会支付介绍费，这笔费用等同于替您支付了秋武老师的一对一辅导费。您省钱，机构获客，我们获益，三方共赢。\n2. **收费项目：** 单独针对高度定制化的文书打磨、一问一答式面试草稿编辑、深度逻辑重构等服务是收费的。\n\n💡 **详细沟通：** 由于需要评估您的具体情况，详细收费标准和流程，请加微信（qiuwu999）直接沟通。"
        }
    ];

    /**
     * 响应生成器 (Dialogue Strategy Layer)
     */
    function generateAIResponse(rawText) {
        // ... (省略 generateAIResponse 内部的匹配逻辑，与之前提供的代码一致)
        const text = normalizeInput(rawText);
        
        let bestMatch = null;
        let maxScore = 0;

        knowledgeBase.forEach(item => {
            let matchCount = 0;
            item.keywords.forEach(keyword => {
                if (text.includes(keyword)) {
                    matchCount++;
                }
            });

            if (matchCount > 0) {
                const score = matchCount * item.priority;
                if (score > maxScore) {
                    maxScore = score;
                    bestMatch = item;
                }
            }
        });

        if (bestMatch && maxScore > 0) {
            return bestMatch.response;
        }

        // 默认回复 (兜底逻辑 - 引导用户提供更多信息)
        return "这个问题很有深度！🤔\n\n每个人的留学情况都是独一无二的，为了给出最负责任的建议，我需要了解更多背景。\n\n比如：您的目前日语/英语水平如何？或者您心仪的大学/专业方向大概是什么？\n\n💡 **建议：** 您可以直接添加秋武老师微信（ID: qiuwu999），进行终局思维下的一对一深度诊断。";
    }
});
