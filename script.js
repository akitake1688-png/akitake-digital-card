document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. UI 交互与修复部分 (UI Fixes & Navigation)
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
    const menuButtons = document.querySelectorAll('.menu-button');
    const closeButtons = document.querySelectorAll('.close-content');

    // --- 新增的外部链接按钮 ---
    const linkFreeMechanism = document.getElementById('linkFreeMechanism'); // 辅导模式详情页按钮
    const linkBilibili = document.getElementById('linkBilibili'); // 成功案例详情页按钮


    // ====== 导航逻辑 ======

    // 初始卡片 -> 菜单卡片
    expandButton.addEventListener('click', () => {
        initialCard.classList.add('hidden');
        menuCard.classList.remove('hidden');
    });

    // 返回按钮 (从菜单卡片返回初始卡片)
    backButton.addEventListener('click', () => {
        menuCard.classList.add('hidden');
        initialCard.classList.remove('hidden');
    });

    // 菜单卡片 -> 内容详情卡片
    menuButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const targetId = e.currentTarget.dataset.target;
            const targetCard = document.getElementById(targetId);
            
            // 隐藏菜单卡片并显示目标详情卡片
            menuCard.classList.add('hidden');
            contentCards.forEach(card => card.classList.add('hidden')); // 确保其他详情卡片都隐藏
            if (targetCard) {
                targetCard.classList.remove('hidden');
            }
        });
    });

    // 关闭详情卡片 -> 返回菜单卡片
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 隐藏当前详情卡片
            const parentCard = button.closest('.content-card');
            if (parentCard) {
                parentCard.classList.add('hidden');
            }
            // 显示菜单卡片
            menuCard.classList.remove('hidden');
        });
    });

    // ====== 外部链接跳转修复 ======
    
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


    // ====== 聊天功能逻辑 ======

    // 发送消息事件
    sendBtn.addEventListener('click', handleUserMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserMessage();
    });

    // ==========================================
    // 2. 核心逻辑部分 (Core Logic & AI Brain)
    // ==========================================

    function handleUserMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        // 显示用户消息
        appendMessage('user', text);
        userInput.value = '';

        // 模拟AI思考时间 (增加真实感)
        showTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator();
            const response = generateAIResponse(text);
            appendMessage('ai', response);
        }, 800); // 0.8秒延迟
    }

    /**
     * 消息追加与滚动修复
     */
    function appendMessage(sender, message) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
        
        // 支持简单的换行显示
        const formattedMessage = message.replace(/\n/g, '<br>');
        msgDiv.innerHTML = formattedMessage;
        
        chatBody.appendChild(msgDiv);
        
        // 【滚动修复】强制滚动到底部
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.classList.add('message', 'ai-message');
        typingDiv.innerText = '秋武AI 思考中...';
        chatBody.appendChild(typingDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) typingDiv.remove();
    }

    // ==========================================
    // 3. AI 智能处理层 (Knowledge & Intent)
    // ==========================================

    /**
     * 输入预处理层：拼写容错、术语归一化
     */
    function normalizeInput(text) {
        let normalized = text.toLowerCase();
        
        // 常见错别字与术语修正 (高容错率)
        const mapping = {
            'egu': 'eju',
            '流学': '留学',
            '留考': 'eju',
            'jlpt': '日语能力考',
            '托业': 'toeic',
            '托福': 'toefl',
            '东大': '东京大学',
            '京大': '京都大学',
            '私塾': '辅导机构',
            '修士': '研究生/硕士',
            '中介': '机构'
        };

        for (const [key, value] of Object.entries(mapping)) {
            normalized = normalized.replace(new RegExp(key, 'g'), value);
        }
        return normalized;
    }

    /**
     * 知识库：融合秋武老师语录与高情商回复指南
     * 结构：keywords(触发词), response(回复), priority(权重)
     */
    const knowledgeBase = [
        {
            keywords: ['签证', '难吗', '拒签', '怕'],
            priority: 10,
            response: "哎呀，签证这事儿确实像第一次吃纳豆——看起来黏黏的，但准备好了就顺滑多了！🌸\n\n首先，理解您的担心。日本签证现在非常注重真实性和完整性。基于2024年的数据，只要材料合规（如资金证明、明确的学习计划），拒签率其实很低。\n\n我们建议您先不要焦虑，我们可以帮您一起梳理材料。要不您先分享一下您的基本情况？我们一步步来。"
        },
        {
            keywords: ['费用', '钱', '预算', '花销', '贵'],
            priority: 10,
            response: "家长/同学您好，我完全理解这份对投资的慎重。💰\n\n日本留学的平均年费用（学费+生活费）大约在15-20万人民币左右，相比欧美确实性价比很高。而且日本允许合法打工，很多同学都能通过勤工俭学覆盖生活费。\n\n更重要的是回报：日本教育强调独立思考和细节，这对未来的职业底蕴是巨大的提升。我们可以帮您具体算算您的预算，看看怎么规划最经济实惠。"
        },
        {
            keywords: ['孤独', '适应', '生活', '朋友'],
            priority: 9,
            response: "孤独感是留学常见的‘小Boss’，但打败它就像玩游戏——多探索地图就通关了！🎮\n\n心理学上这叫‘文化适应期’，通常3-6个月就会好转。日本社会虽然讲究‘读空气’，但这也意味着一旦融入，关系会很稳固。建议您多参加社团或利用我们的前辈群。放心，您不是一个人在战斗！"
        },
        {
            keywords: ['eju', '分数', '考不上', '难'],
            priority: 10,
            response: "关于EJU，秋武老师常说：不要陷入‘大家的思维’，只顾着刷题。📚\n\nEJU只是敲门砖。很多同学总分不高，但因为策略得当（比如利用好了校内考、面试、小论文），依然逆袭了名校。真正的竞争往往在‘软实力’。\n\n如果您觉得EJU没底，我们可以聊聊您的强项科目，帮您制定一个‘扬长避短’的策略。您现在的日语水平大约在什么程度呢？"
        },
        {
            keywords: ['托福', '英语', '托业'],
            priority: 8,
            response: "在日本考学，英语确实是那把‘隐形的钥匙’。🔑\n\n如果您的目标是国立大学或顶尖私立，托福/托业成绩能极大弥补其他方面的不足。但如果您英语暂时不好，也不要焦虑，我们策略上可以先避开强英语要求的专业，或者寻找可以用日语弥补的路径。\n\n您现在有考过英语相关的证书吗？"
        },
        {
            keywords: ['私塾', '机构', '避雷', '推荐'],
            priority: 9,
            response: "找私塾确实要擦亮眼睛，这关系到您的未来。👀\n\n秋武老师的建议是：不要只看规模，要看‘匹配度’。很多大机构流水线作业，可能会忽略您的个性化需求。真正的辅导，应该是像‘画龙点睛’一样，在您的基础上提升逻辑和表达，而不是给您套模板。\n\n我们可以提供免费的咨询评估，帮您判断您目前最需要补强的是哪部分能力。"
        },
        {
            keywords: ['秋武', '老师', '是谁'],
            priority: 10,
            response: "哈哈，您对秋武老师感兴趣呀！🎓\n\n秋武老师是东大修士毕业，拥有10年一线辅导经验。他的特点是不灌输鸡汤，而是提供‘东大基准’的逻辑重构。他最擅长帮学生挖掘自己都没想到亮点。\n\n如果您的问题比较复杂，或者需要‘终局思维’下的深度规划，建议直接添加秋武老师微信（ID: qiuwu999）进行一对一深度沟通。"
        },
        {
            keywords: ['文科', '理科', '专业', '选什么'],
            priority: 8,
            response: "选专业确实是头等大事。在AI时代，单纯的技术或死记硬背的专业确实面临挑战。\n\n我们建议您关注‘复合型’领域或者国家资本主导的行业（如电力、基建与AI的结合）。如果您是文科生，‘人味知性’——即深度沟通和跨文化理解能力，将是您不可替代的竞争优势。\n\n您目前对哪个方向比较感兴趣呢？我们可以一起分析下前景。"
        },
        {
            keywords: ['免费', '收费', '价格'],
            priority: 9,
            response: "您好，谢谢您咨询。我们有收费项目，也有免费辅导渠道模式。💰\n\n**免费辅导模式**：通过秋武老师的推荐进入合作私塾或语言学校学习，机构会替您支付秋武老师的一对一辅导费用。\n\n**收费项目**：提供高度定制化的文书（研究计划书、志望理由书）辅导、一问一答式面试答辩草稿编辑、模拟训练等。\n\n详细收费标准和流程，请加微信（qiuwu999）直接沟通。"
        }
    ];

    /**
     * 响应生成器 (The Dialogue Strategy Layer)
     */
    function generateAIResponse(rawText) {
        const text = normalizeInput(rawText);
        
        let bestMatch = null;
        let maxScore = 0;

        // 简单的加权匹配算法
        knowledgeBase.forEach(item => {
            let matchCount = 0;
            item.keywords.forEach(keyword => {
                if (text.includes(keyword)) {
                    matchCount++;
                }
            });

            if (matchCount > 0) {
                // 计算得分：匹配关键词数量 * 权重
                const score = matchCount * item.priority;
                if (score > maxScore) {
                    maxScore = score;
                    bestMatch = item;
                }
            }
        });

        // 找到匹配项
        if (bestMatch && maxScore > 0) {
            return bestMatch.response;
        }

        // 默认回复 (兜底逻辑 - 引导用户提供更多信息)
        return "这个问题很有深度！🤔\n\n每个人的留学情况都是独一无二的，为了给出最负责任的建议，我需要了解更多背景。\n\n比如：您的目前日语/英语水平如何？或者您心仪的大学/专业方向大概是什么？\n\n💡 建议：您可以直接添加秋武老师微信（ID: qiuwu999），进行终局思维下的一对一深度诊断。";
    }
});
