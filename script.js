document.addEventListener('DOMContentLoaded', () => {
    const expandButton = document.getElementById('expandButton');
    const backButton = document.getElementById('backButton');
    const cardContainer = document.querySelector('.card-container');
    const menuButtons = document.querySelectorAll('.menu-button');
    const closeButtons = document.querySelectorAll('.close-content');
    const contentCards = document.querySelectorAll('.content-card');

    // Flip to Menu
    expandButton.addEventListener('click', () => {
        cardContainer.classList.add('flipped');
    });

    // Flip back to Home
    backButton.addEventListener('click', () => {
        cardContainer.classList.remove('flipped');
    });

    // Open Content Overlay
    menuButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            const targetCard = document.getElementById(targetId);
            if (targetCard) {
                targetCard.classList.add('visible');
            }
        });
    });

    // Close Content Overlay
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.content-card').classList.remove('visible');
        });
    });

    // Close overlay when clicking outside
    contentCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target === card) {
                card.classList.remove('visible');
            }
        });
    });

    // Chatbot Logic (纯本地逻辑，不调用API，符合GitHub规范)
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');

    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function getAIResponse(text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('面试')) {
            return "面试的核心不是回答问题，而是‘非语言沟通’。你的眼神、坐姿、甚至递交材料的方式，都比你的日语语法更重要。我们需要训练的是你的‘气场’。";
        } else if (lowerText.includes('计划书') || lowerText.includes('研究计划')) {
            return "研究计划书不能只是学术罗列。它必须是一个扣人心弦的‘故事’。我们要把你过去的经历，逻辑严密地串联到未来的研究中，埋下伏笔，引导教授问你准备好的问题。";
        } else if (lowerText.includes('套磁')) {
            return "套磁信的回复率低？因为你没有抓住教授的‘痛点’。不要只说自己多优秀，要说你能为教授的研究室带来什么独特的视角（哪怕是‘破绽’）。";
        } else if (lowerText.includes('背景') || lowerText.includes('出身')) {
            return "出身校不好？没关系。东大有很多‘潜规则’和‘冷门’路径。我的强项就是利用跨学科思维（文理交叉）帮你找到那个竞争最小的切入点。";
        } else if (lowerText.includes('电气') || lowerText.includes('电工') || lowerText.includes('自动化')) {
             return "电气工程或自动化专业的同学，听好了，2025年的风口不是 ‘电’，而是‘智’。日本在智能控制和功率半导体研究非常超前，你来东大读这个，回国就是降维打击。别去卷纯CS了，懂强电的没你懂算法，懂算法的没你懂硬件。这就是我常说的‘错位竞争’。";
        } else {
            return "这个角度很有趣。我们可以深入聊聊你的具体情况（比如面试、计划书或背景），找到专属于你的突破口。";
        }
    }

    function handleSend() {
        const text = chatInput.value.trim();
        if (text) {
            addMessage(text, true);
            chatInput.value = '';
            
            // 模拟打字延迟
            const loadingDiv = document.createElement('div');
            loadingDiv.classList.add('message', 'ai-message');
            loadingDiv.textContent = '...';
            chatMessages.appendChild(loadingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            setTimeout(() => {
                chatMessages.removeChild(loadingDiv);
                const response = getAIResponse(text);
                addMessage(response);
            }, 800);
        }
    }

    sendButton.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    });
});
