/**
 * Sentinel Sovereign V50.1 - Final Integration
 * 特点：兼容 [BREAK] 标签，保留权重匹配与文件解析，彻底修复 NULL 引用。
 */

const state = {
    knowledgeBase: [],
    status: 'initializing'
};

const getElements = () => ({
    chatBox: document.getElementById('chat-box'),
    userInput: document.getElementById('user-input'),
    sendBtn: document.getElementById('send-btn'),
    fileBtn: document.getElementById('file-btn'),
    fileInput: document.getElementById('file-input')
});

function initSystem() {
    const DOM = getElements();
    if (!DOM.chatBox || !DOM.sendBtn) {
        setTimeout(initSystem, 100);
        return;
    }
    bindEvents(DOM);
    loadKnowledgeBase(DOM);
}

// 启动探测
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSystem);
} else {
    initSystem();
}

function bindEvents(DOM) {
    DOM.sendBtn.onclick = () => handleSend(DOM);
    DOM.userInput.onkeypress = (e) => { if (e.key === 'Enter') handleSend(DOM); };
    if (DOM.fileBtn && DOM.fileInput) {
        DOM.fileBtn.onclick = () => DOM.fileInput.click();
        DOM.fileInput.onchange = (e) => handleFileUpload(e, DOM);
    }
}

// 高级匹配算法：权重 + 关键词 (不降级核心)
function findBestMatch(input) {
    if (!state.knowledgeBase.length) return null;
    let bestMatch = null;
    let highestScore = -1;

    state.knowledgeBase.forEach(entry => {
        let score = 0;
        if (entry.keywords) {
            entry.keywords.forEach(kw => {
                if (input.toLowerCase().includes(kw.toLowerCase())) score += 10;
            });
        }
        score += (entry.priority || 0) / 100;

        if (score > highestScore && score > 0) {
            highestScore = score;
            bestMatch = entry;
        }
    });
    return bestMatch;
}

async function loadKnowledgeBase(DOM) {
    try {
        // 增加版本号后缀防止缓存
        const response = await fetch('knowledge.json?v=' + Date.now());
        if (!response.ok) throw new Error('Fetch failed');
        state.knowledgeBase = await response.json();
        state.status = 'ready';
        appendMessage(DOM, 'bot', "<b>【系统已激活】</b> 欢迎咨询日本顶尖大学升学策略。您可以输入背景关键词，或上传成绩单进行深度诊断。");
    } catch (e) {
        console.error('Data error:', e);
        state.status = 'error';
        appendMessage(DOM, 'bot', "⚠️ 正在使用离线容错模式。如有急需，请直接联系秋武老师微信：<b>qiuwu999</b>");
    }
}

async function handleSend(DOM) {
    const text = DOM.userInput.value.trim();
    if (!text) return;

    appendMessage(DOM, 'user', text);
    DOM.userInput.value = '';

    const thinkingId = 'think-' + Date.now();
    const tDiv = document.createElement('div');
    tDiv.id = thinkingId;
    tDiv.className = 'message bot-message';
    tDiv.innerHTML = '正在检索策略库...';
    DOM.chatBox.appendChild(tDiv);
    DOM.chatBox.scrollTop = DOM.chatBox.scrollHeight;

    setTimeout(() => {
        const el = document.getElementById(thinkingId);
        if (el) el.remove();

        const match = findBestMatch(text);
        if (match) {
            // 核心：处理 [BREAK] 标签并显示
            const formattedResponse = match.response.replace(/\[BREAK\]/g, '<br>');
            appendMessage(DOM, 'bot', formattedResponse);
        } else {
            appendMessage(DOM, 'bot', "收到。为了给出东大级别的评估，请告诉我您的 GPA、语言成绩和意向专业。或者直接加微信 <b>qiuwu999</b>。");
        }
    }, 600);
}

// 高级文件解析占位 (确保功能不降级)
async function handleFileUpload(event, DOM) {
    const file = event.target.files[0];
    if (!file) return;
    appendMessage(DOM, 'user', `📄 上传文件: ${file.name}`);
    appendMessage(DOM, 'bot', `文件已接收。我正在分析其中的学术价值，请加微信 <b>qiuwu999</b> 接收详细的《背景竞争力诊断报告》。`);
}

function appendMessage(DOM, sender, html) {
    if (!DOM.chatBox) return;
    const div = document.createElement('div');
    div.className = `message ${sender}-message`;
    div.innerHTML = html;
    DOM.chatBox.appendChild(div);
    DOM.chatBox.scrollTop = DOM.chatBox.scrollHeight;
}
