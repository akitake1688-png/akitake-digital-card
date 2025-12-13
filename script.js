document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. UI 交互与修复部分 (Navigation & UI Fixes)
    // ==========================================
    
    // --- 元素获取 (严格检查 ID/Class) ---
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


    // ====== 导航逻辑彻底修复 ======

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
            // 确保菜单卡片显示
            menuCard.classList.remove('hidden'); 
            // 隐藏所有内容详情卡片
            contentCards.forEach(card => card.classList.add('hidden'));

            // 切换回初始卡片 (如果用户是从菜单卡片直接按返回)
            menuCard.classList.add('hidden');
            initialCard.classList.remove('hidden');
        });
    }

    // 【关键修复】菜单卡片 -> 内容详情卡片 (核心故障点)
    if (menuButtons.length > 0 && menuCard) {
        menuButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetId = e.currentTarget.dataset.target;
                const targetCard = document.getElementById(targetId);
                
                // 1. 隐藏菜单卡片
                menuCard.classList.add('hidden');

                // 2. 隐藏其他所有内容详情卡片，确保唯一显示
                contentCards.forEach(card => card.classList.add('hidden')); 

                // 3. 显示目标详情卡片
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
                // 返回主菜单卡片
                menuCard.classList.remove('hidden');
            });
        });
    }


    // ====== 外部链接跳转 ======
    
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


    // ====== 聊天功能核心逻辑 (保留修复的滚动) ======

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

        // 【新功能植入】检查是否进入评论模式
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
        }, 1200);
    }

    // 消息追加与滚动修复 (已验证成功)
    function appendMessage(sender, message) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
        
        const formattedMessage = message.replace(/\n/g, '<br>');
        msgDiv.innerHTML = formattedMessage;
        
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function showTypingIndicator() {
        // ... (保持不变)
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.classList.add('message', 'ai-message');
        typingDiv.innerText = '秋武AI 正在深度思考中...';
        chatBody.appendChild(typingDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function removeTypingIndicator() {
        // ... (保持不变)
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) typingDiv.remove();
    }


    // ==========================================
    // 2. AI 深度优化层 (Knowledge & Intent)
    // ==========================================

    /**
     * 【新功能】SNS_COMMENT_GENERATOR 模式 (强制输出高亮专业评论)
     */
    function enterSNSCommentGeneratorMode(prompt) {
        showTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator();
            
            let comment = `
【秋武老师の高阶评论】
针对话题：「${prompt}」

秋武老师的专业视角分析如下：

🎯 **底层逻辑重构：** 这个问题不仅是表面现象，更是涉及到[日本教育制度/留学心态]的深层问题。我们必须从终局思维反推，避免短期盲从。
💡 **文理交叉优势：** 结合秋武老师的文理融合背景，建议从[社会适应性/数据分析]角度进行双重考量。
🚨 **中肯提醒：** 成功的关键在于[策略制定/细节把控]。请务必避免[常见的留学误区/中介套路]，确保每一步都安全、透明。

👉 欢迎加微信（qiuwu999）进行一对一深度交流，我们将提供更具针对性的[草稿编辑/面试训练]服务。
            `.trim();

            // 为了模拟高亮效果，给评论添加特定 class
            const commentDiv = document.createElement('div');
            commentDiv.classList.add('message', 'ai-message', 'sns-comment'); 
            commentDiv.innerHTML = comment.replace(/\n/g, '<br>');
            chatBody.appendChild(commentDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
            
            // 模拟复制到剪贴板的提示 (实际功能需要用户权限，这里仅为视觉提示)
            appendMessage('ai', '✅ **评论已生成，内容专业且中肯。** 欢迎直接复制到社交媒体使用。');

        }, 1500);
    }


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
            '大学院': '硕士', '研究室': '导师', '研究生': '预科生', '早大': '早稻田大学',
            '志望': '志望理由书', '研究': '研究计划书', '草稿': '面试草稿', '面试': '面试训练'
        };

        for (const [key, value] of Object.entries(mapping)) {
            normalized = normalized.replace(new RegExp(key, 'g'), value);
        }
        return normalized;
    }

    /**
     * 知识库：结构化、专业深度回复 (植入文理交叉背景和概念区分)
     */
    const knowledgeBase = [
        // 考学文书 - 研究计划书 vs 志望理由书 (重点区分和植入背景)
        {
            keywords: ['研究计划书', '研究室', '导师', '修士', '大学院'],
            priority: 12,
            response: "【研究计划书：终局思维的起点】🖋️\n\n研究计划书是您进入日本大学院（硕士）的**入场券和核心武器**，它绝不等于志望理由书。\n\n1. **秋武特色：** 结合我**理工科本科 x 东大文理交叉硕士**的背景，我擅长帮您在研究中融入**跨学科视角**（例如，在经济学中加入数据分析方法，或在法学中加入社会学考察）。这能让教授眼前一亮。\n2. **专业要求：** 它必须体现严密的逻辑、可行性，以及您对导师现有研究的理解。我们提供**一问一答式的草稿编辑**，确保您的每一步都扎实、专业。\n\n💡 **下一步：** 您的研究方向是文科还是理科？请提供您目前的初步想法，我帮您进行主题的**逻辑重构**。"
        },
        {
            keywords: ['志望理由书', '本科', '学部', '志愿', '志望理由'],
            priority: 12,
            response: "【志望理由书：个性与潜力的体现】✍️\n\n志望理由书是您在**学部（本科）或大学院**申请中，展现您**为何选择日本、为何选择该专业**的关键文书，它侧重于您的**学习动机和未来目标**。\n\n1. **核心要点：** 它必须清晰地回答：您是谁？您为什么来？您来了能做什么？不能含糊抽象。**我们强调清晰、肯定、专业的表达**。\n2. **我们的服务：** 辅导工作包含**志望理由书的深度打磨**，特别是对于背景复杂的同学，我们将您的零散经历串联成扣人心弦的‘学术成长史’。\n\n💡 **请问：** 您是申请本科还是硕士？您目前有哪些经历或特长想要强调？"
        },
        // 核心服务 - 面试训练与答辩
        {
            keywords: ['面试训练', '答辩草稿', '口语', '非语言', '紧张'],
            priority: 11,
            response: "【面试训练：非语言的战场】🗣️\n\n面试是考察软实力的最高阶段。秋武老师的辅导核心不仅在于回答的内容，更在于您**非语言的沟通技巧**。\n\n1. **一问一答式：** 我们提供高度定制化的**教授答辩草稿编辑**，为您设计巧妙的回答，甚至提前埋设‘破绽’来引导教授提问。\n2. **全真模拟：** 独创的**‘坐姿/眼神/递交材料’**全真模拟，矫正每一个细节。这就像理工科实验一样，排除一切变量，追求最优结果。\n3. **日语口语：** 对个别需求，我们还可以提供**日语口语训练辅导**，让您的表达既流利又具备专业深度。\n\n💡 **请问：** 您最近一次面试或口语训练是什么时候？您最担心自己哪个环节表现不好？"
        },
        // 其他核心知识点 (保持结构化)
        {
            keywords: ['eju', '分数', '考不上', '难'],
            priority: 10,
            response: "【EJU与考学底层逻辑】📚 不要陷入‘大家都在做的’思维。\n\nEJU 只是敲门砖。真正的竞争往往在‘软实力’。秋武老师常说：合格的底层逻辑是**不要放弃任何试错机会**。\n\n1. **策略偏差：** 很多大学在申报时只需要 EJU **准考证**，而不是具体成绩。放弃 6 月留考，您将失去临场体验校内考的机会，尤其是面试沟通部分。\n2. **文理视角：** 无论是文科还是理科，EJU 的高分都是基础。但对于理科生，生物学等知识点往往是突破口；文科生则要注重记述题的逻辑性。\n\n💡 **行动指南：** 请告诉我您的 EJU 目标分数段和最没信心的科目，我们从策略上进行重构！"
        },
        {
            keywords: ['费用', '钱', '预算', '免费', '收费'],
            priority: 9,
            response: "【收费模式与免费机制】🤝 透明度是合作的基石。\n\n1. **强推免费模式：** 通过秋武老师的推荐进入合作机构，机构支付的介绍费等同于替您支付了秋武老师的一对一辅导费。您省钱，享受高端一对一。\n2. **定制收费：** 针对高度定制化的文书打磨、面试答辩草稿编辑等服务，我们提供不同的费用单价与套餐辅导。\n\n💡 **详细沟通：** 请加微信（qiuwu999）进行一对一咨询，我们将根据您的需求提供最中肯的费用评估。"
        },
        {
            keywords: ['秋武', '老师', '背景', '优势'],
            priority: 8,
            response: "【秋武老师：文理融合的跨学科专家】🎓\n\n秋武老师的背景独具优势：**理工科本科出身**（林业工程），随后考入**东京大学文理交叉专业硕士**（林业生态下的社会学研究）。\n\n1. **核心优势：** 这段经历让老师具备**跨学科思维**，能从**数据/逻辑**（理科）和**社会/文化**（文科）双重角度分析问题。这正是日本顶尖大学最看重的能力。\n2. **辅导特点：** 不仅是改文书，而是提供‘东大基准’的逻辑重构。每周参与理工科/文科的课题报告会，让老师深谙不同领域的研究报告要求。\n\n💡 **下一步：** 您的背景是文科还是理科？我可以帮您分析如何利用您的‘破绽’转化为独特优势。"
        }
        // ... (可以根据需要继续增加或修改其他知识点)
    ];

    /**
     * 响应生成器 (Dialogue Strategy Layer)
     */
    function generateAIResponse(rawText) {
        // ... (保持不变)
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
        return "这个问题很有深度！🤔\n\n每个人的留学情况都是独一无二的，为了给出最负责任的建议，我需要了解更多背景。\n\n💡 **建议：** 您可以直接添加秋武老师微信（ID: qiuwu999），进行终局思维下的一对一深度诊断，这是最中肯的解决方案。";
    }
});
