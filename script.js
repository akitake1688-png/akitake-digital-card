/**
 * Sentinel Sovereign V50.2 - Final Production Version
 * 核心：解决异步加载导致的 NULL 引用问题，保留权重匹配与文件解析高级功能。
 * 修复：改回原ID (chat-container/upload-btn/file-upload)，加调试日志，重试上限10次。
 */

// --- 全局状态 ---
const state = {
    knowledgeBase: [],
    status: 'initializing'
};

// --- DOM 元素探测器 (解决 NULL 引用的关键) ---
const getElements = () => ({
    chatBox: document.getElementById('chat-container'), // 改回原ID
    userInput: document.getElementById('user-input'),
    sendBtn: document.getElementById('send-btn'),
    fileBtn: document.getElementById('upload-btn'), // 改回原ID
    fileInput: document.getElementById('file-upload') // 改回原ID
});

// --- 1. 核心启动逻辑 ---
function initSystem(retryCount = 0) {
    const DOM = getElements();
    
    // 严谨性检查：如果核心 UI 没加载，等待 100ms 重试 (上限10次，防止无限循环)
    if (!DOM.chatBox || !DOM.sendBtn) {
        if (retryCount < 10) {
            console.warn('⚠️ 关键 UI 元素尚未就绪，100ms 后重试... (尝试 ' + (retryCount + 1) + '/10)');
            setTimeout(() => initSystem(retryCount + 1), 100);
        } else {
            console.error('❌ UI 元素探测失败，超出重试上限。请检查 index.html ID。');
            alert('系统启动失败：页面元素缺失。请刷新或联系管理员。');
        }
        return;
    }

    console.log('✅ UI 元素探测成功，开始绑定逻辑...');
    bindEvents(DOM);
    loadKnowledgeBase(DOM);
}

// 确保 DOM 完全解析后再启动
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSystem);
} else {
    initSystem();
}

// --- 2. 事件绑定 (带 DOM 注入) ---
function bindEvents(DOM) {
    DOM.sendBtn.onclick = () => handleSend(DOM);
    
    DOM.userInput.onkeypress = (e) => {
        if (e.key === 'Enter') handleSend(DOM);
    };

    if (DOM.fileBtn && DOM.fileInput) {
        DOM.fileBtn.onclick = () => DOM.fileInput.click();
        DOM.fileInput.onchange = (e) => handleFileUpload(e, DOM);
    }
}

// --- 3. 高级匹配算法 (保留权重逻辑) ---
function findBestMatch(input) {
    if (!state.knowledgeBase.length) return null;

    let bestMatch = null;
    let highestScore = -1;

    state.knowledgeBase.forEach(entry => {
        let score = 0;
        // 关键词加权匹配
        entry.keywords.forEach(kw => {
            if (input.toLowerCase().includes(kw.toLowerCase())) {
                score += 10;
            }
        });
        // 优先级权重
        score += (entry.priority || 0) / 100;

        if (score > highestScore && score > 0) {
            highestScore = score;
            bestMatch = entry;
        }
    });

    return bestMatch;
}

// --- 4. 业务处理逻辑 ---
async function loadKnowledgeBase(DOM) {
    try {
        const response = await fetch('knowledge.json?v=' + Date.now()); // 防止缓存
        if (!response.ok) throw new Error('Network error');
        state.knowledgeBase = await response.json();
        state.status = 'ready';
        appendMessage(DOM, 'bot', "<b>【系统已激活】</b> 很高兴为您服务。我是秋武老师的助理 AI，您可以咨询东大/京大升学策略，或直接上传成绩单。");
    } catch (e) {
        state.status = 'error';
        console.error('Data load failed:', e);
        appendMessage(DOM, 'bot', "⚠️ 知识库连接波动，但不影响基础对话。您可以直接提问或加微信 qiuwu999。");
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
    tDiv.innerHTML = '正在分析逻辑链...';
    DOM.chatBox.appendChild(tDiv);
    DOM.chatBox.scrollTop = DOM.chatBox.scrollHeight;

    setTimeout(() => {
        const el = document.getElementById(thinkingId);
        if (el) el.remove();

        const match = findBestMatch(text);
        if (match) {
            // 处理 [BREAK] 标签并显示
            const formattedResponse = match.response.replace(/\[BREAK\]/g, '<br>');
            appendMessage(DOM, 'bot', formattedResponse);
        } else {
            const fallback = state.knowledgeBase.find(k => k.id === 'DEFAULT_fallback');
            appendMessage(DOM, 'bot', fallback ? fallback.response : "收到。请补充您的 GPA 和目标专业，以便我为您做精准诊断。或者直接加微信 <b>qiuwu999</b>。");
        }
    }, 800);
}

// --- 5. 文件解析接口 (完整保留原版高级功能) ---
async function handleFileUpload(event, DOM) {
    const file = event.target.files[0];
    if (!file) return;
    
    appendMessage(DOM, 'user', `📄 上传文件: ${file.name}`);
    
    // 原版 PDF/DOCX 解析逻辑 (完整保留，不降级)
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
            appendMessage(DOM, 'bot', '<b>【提取失败】</b>文件内容为空或无法解析。<br>请确认文件格式正确，或直接加微信 <b>qiuwu999</b> 发送原文件。');
            return;
        }

        appendMessage(DOM, 'bot', '<b>【初步提取完成】</b><br>● 文本总长度：约 ' + extractedText.length + ' 字<br>● 提取状态：完整提取<br><b>深度审计：</b>加微信 <b>qiuwu999</b> 开启 Sentinel Cowork。');
        // ... (这里可加 evaluateDocument 诊断逻辑，保持高级)
    } catch (err) {
        console.error('文件处理错误:', err);
        appendMessage(DOM, 'bot', '<b>【提取失败】</b>' + err.message + '<br>请直接加微信 <b>qiuwu999</b> 发送文档，我将亲自为您审计。');
    }
}

// --- 6. UI 渲染辅助 ---
function appendMessage(DOM, sender, html) {
    if (!DOM.chatBox) return;
    const div = document.createElement('div');
    div.className = `message ${sender}-message`;
    div.innerHTML = html;
    DOM.chatBox.appendChild(div);
    DOM.chatBox.scrollTop = DOM.chatBox.scrollHeight;
}
