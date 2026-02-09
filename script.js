/**
 * 秋武数字哨兵核心逻辑单元 v4.1
 * 严格闭合，防语法报错
 */
const CONFIG = {
    jsonPath: 'knowledge.json',
    typingSpeed: 300 // 模拟逻辑检索延迟
};

let knowledgeData = null;

// 系统初始化
async function initSystem() {
    try {
        const response = await fetch(CONFIG.jsonPath);
        if (!response.ok) throw new Error("File not found");
        knowledgeData = await response.json();
        console.log("秋武逻辑库加载成功");
        
        // 自动触发系统启动语
        processQuery('__SYSTEM_START__');
    } catch (err) {
        console.error("系统故障:", err);
        renderMessage('bot', "⚠️ <b>[致命错误]</b> 逻辑内核加载失败。请确保 knowledge.json 位于根目录并格式正确。");
    }
}

// 消息处理中枢
function processQuery(rawInput) {
    if (!knowledgeData) return;
    const input = rawInput.trim().toLowerCase();
    
    // 优先完全匹配，其次关键词包含
    const matchedIntent = knowledgeData.intents.find(intent => 
        intent.keywords.includes(input)
    ) || knowledgeData.intents.find(intent => 
        intent.keywords.some(kw => input.includes(kw.toLowerCase()))
    );

    const result = matchedIntent || knowledgeData.fallback;
    
    // 模拟思考延迟
    setTimeout(() => {
        const responseText = result.responses[Math.floor(Math.random() * result.responses.length)];
        renderMessage('bot', responseText);
        updateSuggestions(result.suggestions || []);
        console.log(`匹配意图: ${result.id || 'fallback'}`); // 调试日志
    }, CONFIG.typingSpeed);
}

// UI 渲染引擎 (核心修复 320 行语法点)
function renderMessage(role, content) {
    const viewport = document.getElementById('chat-viewport');
    if (!viewport) return;

    const msgWrapper = document.createElement('div');
    msgWrapper.className = `message ${role}-msg`;
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    
    if (role === 'user') {
        bubble.textContent = content;
    } else {
        // 注入内容：支持HTML与公式
        bubble.innerHTML = content;
        
        // 核心逻辑：检测 MathJax 渲染
        if (window.MathJax && window.MathJax.typesetPromise) {
            setTimeout(() => {
                window.MathJax.typesetPromise([bubble]).catch(err => console.warn("公式渲染微调:", err));
            }, 50);
        }
    }
    
    msgWrapper.appendChild(bubble);
    viewport.appendChild(msgWrapper);
    
    // 确保滚动条置底
    requestAnimationFrame(() => {
        viewport.scrollTop = viewport.scrollHeight;
    });
}

// 交互建议更新
function updateSuggestions(list) {
    const chipBox = document.getElementById('chips-container');
    chipBox.innerHTML = '';
    
    list.forEach(text => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.textContent = text;
        chip.onclick = () => {
            renderMessage('user', text);
            processQuery(text);
        };
        chipBox.appendChild(chip);
    });
}

// 全局事件监听
document.getElementById('send-btn').addEventListener('click', () => {
    const inputEl = document.getElementById('user-input');
    const val = inputEl.value.trim();
    if (val) {
        renderMessage('user', val);
        processQuery(val);
        inputEl.value = '';
    }
});

document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('send-btn').click();
});

document.getElementById('reset-btn').addEventListener('click', () => {
    document.getElementById('chat-viewport').innerHTML = '';
    processQuery('__SYSTEM_START__');
});

// 启动
window.onload = initSystem;
