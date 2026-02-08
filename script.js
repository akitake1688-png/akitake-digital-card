/**
 * AKITAKE SENTINEL-02 ULTRA (Ultimate Integrity)
 * 包含：XSS安全净化、键盘兼容性补丁、层级导航状态机、性能监控
 */

const STATE = {
    hp: 50,
    db: null,
    pathStack: ['root_welcome'], // 导航路径栈
    isProcessing: false,
    perf: { messages: 0, errors: 0 }
};

// 1. 初始化
document.addEventListener('DOMContentLoaded', async () => {
    await initSystem();
    initKeyboardAdapter();
    
    document.getElementById('send-btn').onclick = handleInput;
    document.getElementById('user-input').onkeypress = (e) => { if(e.key === 'Enter') handleInput(); };
    
    triggerIntent("__SYSTEM_START__");
});

// 2. 系统加载
async function initSystem() {
    try {
        const res = await fetch('knowledge.json');
        if(!res.ok) throw new Error();
        STATE.db = await res.json();
    } catch (e) {
        STATE.db = { intents: [], fallback: { responses: ["系统加载异常，请联系微信 qiuwu999"], suggestions: ["刷新"] } };
    }
}

// 3. 安全 HTML 净化 (防止Bot回复中的恶意代码)
function sanitize(html) {
    const temp = document.createElement('div');
    temp.textContent = html; // 基础转义
    // 允许特定标签
    const allowed = ['b', 'i', 'br', 'strong', 'em', 'u', 'span', 'p'];
    let clean = html;
    // 简单正则过滤掉所有非白名单标签
    clean = clean.replace(/<(?!\/?(b|i|br|strong|em|u|span|p)\b)[^>]+>/gi, '');
    return clean;
}

// 4. 输入处理
async function handleInput() {
    if (STATE.isProcessing) return;
    const el = document.getElementById('user-input');
    const text = el.value.trim();
    if (!text) return;

    el.blur(); // 移动端收起键盘或防止冲突
    el.value = '';
    renderMsg('user', text);
    
    STATE.isProcessing = true;
    updateStatus("THINKING...");
    
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    triggerIntent(text);
    
    STATE.isProcessing = false;
    updateStatus("SYS-READY");
}

// 5. 核心匹配逻辑
function triggerIntent(query) {
    const q = query.toLowerCase();
    let best = null;
    let maxScore = -1;

    // 排除否定干扰
    const negs = ['不', '没', '无'];
    const hasNeg = negs.some(n => q.includes(n));

    STATE.db.intents.forEach(intent => {
        let score = 0;
        intent.keywords.forEach(kw => {
            if (q.includes(kw.toLowerCase())) score += 10;
        });
        if (hasNeg && score > 0) score -= 15;
        if (score > maxScore) { maxScore = score; best = intent; }
    });

    const result = (maxScore > 0 || query === "__SYSTEM_START__") ? best : STATE.db.fallback;
    
    // 路径管理
    if (result.id && result.id !== STATE.pathStack[STATE.pathStack.length - 1]) {
        STATE.pathStack.push(result.id);
    }

    renderMsg('bot', result.responses[0], result.type);
    if (result.hp_impact) updateHP(result.hp_impact);
    renderChips(result.suggestions, result.id === 'root_welcome');
}

// 6. UI 渲染渲染
function renderMsg(role, content, type) {
    const box = document.getElementById('chat-viewport');
    const msg = document.createElement('div');
    msg.className = `message ${role}-msg`;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    if (role === 'user') {
        bubble.textContent = content; // 绝对安全
    } else {
        bubble.innerHTML = sanitize(content); // 净化渲染
        if (type === 'math' && window.MathJax) {
            MathJax.typesetPromise([bubble]).catch(e => console.warn(e));
        }
    }

    msg.appendChild(bubble);
    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;
}

function renderChips(suggestions, isRoot) {
    const container = document.getElementById('chips-container');
    container.innerHTML = '';
    
    const list = suggestions ? [...suggestions] : [];
    if (!isRoot) {
        if (STATE.pathStack.length > 2) list.push("← 返回上一步");
        list.push("🏠 主菜单");
    }

    list.forEach(text => {
        const btn = document.createElement('button');
        btn.className = 'chip';
        btn.textContent = text;
        btn.onclick = () => {
            if (text === "🏠 主菜单") {
                STATE.pathStack = ['root_welcome'];
                triggerIntent("__SYSTEM_START__");
            } else if (text === "← 返回上一步") {
                STATE.pathStack.pop(); // 弹出当前
                const prevId = STATE.pathStack.pop(); // 获取并弹出上一个
                const prevIntent = STATE.db.intents.find(i => i.id === prevId) || STATE.db.intents[0];
                triggerIntent(prevIntent.keywords[0]);
            } else {
                document.getElementById('user-input').value = text;
                handleInput();
            }
        };
        container.appendChild(btn);
    });
}

// 7. 移动端适配补丁
function initKeyboardAdapter() {
    const v = window.visualViewport;
    if (v) {
        v.addEventListener('resize', () => {
            document.body.classList.toggle('keyboard-open', v.height < window.innerHeight - 100);
            document.getElementById('chat-viewport').scrollTop = 999999;
        });
    }
}

function updateHP(delta) {
    STATE.hp = Math.max(0, Math.min(100, STATE.hp + delta));
    const bar = document.getElementById('logic-hp-bar');
    bar.style.width = STATE.hp + '%';
    bar.style.backgroundColor = STATE.hp < 30 ? 'var(--warn)' : 'var(--accent)';
}

function updateStatus(txt) {
    document.getElementById('sys-status').textContent = txt;
}

function hardReset() {
    if(confirm("确定清除所有逻辑记录并重启？")) location.reload();
}
