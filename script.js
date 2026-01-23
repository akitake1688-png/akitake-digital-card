/**
 * 秋武逻辑数字分身引擎 V37.0 (Sentinel Nexus Evolution Core)
 * 核心：UI仪式分析 | 普适模板路由 | 加密存储 | 零风险
 */

let knowledgeBase = [];
let isProcessing = false;
let chatHistory = JSON.parse(decodeData(localStorage.getItem('chatHistory'))) || [];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('knowledge.json');
        if (!res.ok) throw new Error("Database Logic Error");
        knowledgeBase = await res.json();
        console.log("秋武逻辑：V37.0 语义模型已挂载。");

        // 恢复历史并强制渲染
        if (chatHistory.length > 0) {
            chatHistory.forEach(msg => restoreMessage(msg.text, msg.role));
            forceMathJax(0); // 启动计数防护
        } else {
            setTimeout(() => {
                renderLogicalChain("<b>System Online. V37.0</b> [BREAK] 融合哨兵逻辑。 [BREAK] 点击左侧或输入关键词开始重构。");
            }, 600);
        }

        // 清除按钮事件
        document.getElementById('clear-history').addEventListener('click', () => {
            if (confirm("确认抹除所有逻辑痕迹？此操作不可逆。")) {
                clearSentinelHistory();
                postMessage("哨兵已彻底粉碎逻辑痕迹。", "bot");
            }
        });

        // 绑定nav-btn事件（避免inline onclick初始化问题）
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset; // 用data-preset存储
                if (preset) triggerPreset(preset);
                if (btn.id === 'upload-btn') document.getElementById('file-upload').click();
            });
        });

        // 绑定上传事件
        document.getElementById('file-upload').addEventListener('change', (e) => handleFileUpload(e.target.files[0]));

        // 绑定发送按钮
        document.getElementById('send-btn').addEventListener('click', handleAction);
    } catch (e) {
        console.error("System Crash:", e);
        postMessage("系统逻辑库加载异常，请检查 knowledge.json。", "bot");
    }
});

function triggerPreset(text) {
    const input = document.getElementById('user-input');
    input.value = text;
    handleAction();
}

function getSynergyMatch(query) {
    const q = query.toLowerCase();
    let winner = null;
    let topScore = -1;

    knowledgeBase.forEach(item => {
        if (item.intent === "fallback") return;
        let score = 0;
        if (q.includes(item.intent.toLowerCase())) score += 80;
        
        item.keywords.forEach(key => {
            const k = key.toLowerCase();
            if (q.includes(k)) score += (item.priority || 50);
        });

        if (score > topScore) {
            topScore = score;
            winner = item;
        }
    });

    return (topScore < 10) ? knowledgeBase.find(item => item.intent === "fallback") : winner;
}

async function handleAction() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (!text || isProcessing) return;

    postMessage(text, 'user');
    saveHistory(text, 'user');
    
    input.value = "";
    isProcessing = true;

    try {
        const match = getSynergyMatch(text);
        if (match) await renderLogicalChain(match.response);
    } catch (e) {
        postMessage("逻辑链路发生波动，正在重置...", "bot");
    } finally {
        isProcessing = false;
        input.focus();
    }
}

// UI仪式感模拟分析（进度条动画）
async function handleFileUpload(file) {
    if (!file) return;
    postMessage(`📁 上传文件: ${file.name}`, 'user');
    saveHistory(`📁 上传文件: ${file.name}`, 'user');
    
    // 创建进度条
    const container = document.getElementById('chat-container');
    const row = document.createElement('div');
    row.className = 'msg-row bot';
    row.innerHTML = '<div class="bubble"><div class="progress-bar"><div class="progress-fill" style="width:0%"></div><span>哨兵扫描: 0%</span></div></div>';
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;

    const progress = row.querySelector('.progress-bar');
    const fill = progress.querySelector('.progress-fill');
    const span = progress.querySelector('span');

    for (let i = 0; i <= 100; i += 10) {
        fill.style.width = i + '%';
        span.textContent = `哨兵扫描: ${i}%`;
        await new Promise(r => setTimeout(r, 200)); // 平滑动画
    }

    await renderLogicalChain("<b>扫描完成。</b> 该文件已进入“逻辑待命”状态。您可以输入<b>“指令”</b>来获取 AI 协作脚本。");
    
    // 触发普适意图
    handleAction("FILE_UPLOAD_EVENT");
}

// 强制MathJax渲染（计数防护防死循环）
function forceMathJax(attempt = 0) {
    if (attempt > 10) return; // 终止计数
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise().catch(err => console.log(err));
    } else {
        setTimeout(() => forceMathJax(attempt + 1), 100);
    }
}

// 加密/解密存储（处理中文）
function encodeData(data) { return btoa(unescape(encodeURIComponent(data))); }
function decodeData(data) { return decodeURIComponent(escape(atob(data))); }

function saveHistory(text, role) {
    try {
        chatHistory.push({ text, role });
        if (chatHistory.length > 30) chatHistory.shift(); // 性能限
        localStorage.setItem('chatHistory', encodeData(JSON.stringify(chatHistory)));
    } catch (e) {
        console.error("Save history error:", e);
    }
}

function clearSentinelHistory() {
    localStorage.removeItem('chatHistory');
    location.reload(); // 重置
}

async function renderLogicalChain(fullText) {
    const segments = fullText.split('[BREAK]').map(s => s.trim());
    
    for (let i = 0; i < segments.length; i++) {
        await typeWriter(segments[i], i === 0);
        const delay = Math.min(segments[i].length * 20 + 500, 1500);
        await new Promise(r => setTimeout(r, delay));
    }
    forceMathJax(); // 渲染后同步
}

function typeWriter(content, isFirst) {
    return new Promise(resolve => {
        const container = document.getElementById('chat-container');
        const row = document.createElement('div');
        row.className = 'msg-row bot';
        row.innerHTML = `
            ${isFirst ? '<img src="profile.jpg" class="avatar-chat" onerror="this.src=\'https://ui-avatars.com/api/?name=A&background=154391&color=fff\'">' : '<div style="width:52px"></div>'}
            <div class="bubble"></div>
        `;
        container.appendChild(row);
        
        const bubble = row.querySelector('.bubble');
        let index = 0;
        const timer = setInterval(() => {
            if (index < content.length) {
                if (content[index] === '<') {
                    const end = content.indexOf('>', index);
                    if (end !== -1) {
                        bubble.innerHTML += content.substring(index, end + 1);
                        index = end + 1;
                        return;
                    }
                }
                bubble.innerHTML += content[index];
                index++;
                container.scrollTop = container.scrollHeight;
            } else {
                clearInterval(timer);
                resolve();
            }
        }, 12);
    });
}

function restoreMessage(htmlContent, role) {
    const container = document.getElementById('chat-container');
    const row = document.createElement('div');
    row.className = `msg-row ${role}`;
    
    if (role === 'bot') {
         row.innerHTML = `
            <img src="profile.jpg" class="avatar-chat" onerror="this.src=\'https://ui-avatars.com/api/?name=A&background=154391&color=fff\'">
            <div class="bubble">${htmlContent}</div>
        `;
    } else {
        row.innerHTML = `<div class="bubble">${htmlContent}</div>`;
    }
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
}

function postMessage(text, role) {
    const chat = document.getElementById('chat-container');
    const div = document.createElement('div');
    div.className = `msg-row ${role}`;
    div.innerHTML = `<div class="bubble">${text}</div>`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}
