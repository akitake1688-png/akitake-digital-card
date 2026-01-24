/**
 * 秋武逻辑数字分身引擎 V37.1 Final (Sentinel Nexus Evolution Core)
 * 修复：幽灵复制按钮、双重废话、URI malformed、CORS提示、MathJax防护
 */

let chatHistory = [];
try {
    const saved = localStorage.getItem('chatHistory');
    if (saved && saved !== "null" && saved !== "undefined") {
        const decoded = decodeData(saved);
        if (decoded) chatHistory = JSON.parse(decoded) || [];
    }
} catch (e) {
    console.error("Chat history load error:", e);
    chatHistory = [];
}

let knowledgeBase = [];
let isProcessing = false;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('knowledge.json');
        if (!res.ok) throw new Error("Database Logic Error");
        knowledgeBase = await res.json();
        console.log("秋武逻辑：V37.1 Final 已挂载。");

        if (chatHistory.length > 0) {
            chatHistory.forEach(msg => restoreMessage(msg.text, msg.role));
            forceMathJax(0);
        } else {
            setTimeout(() => {
                renderLogicalChain("<b>System Online. V37.1 Final</b> [BREAK] 融合哨兵逻辑。 [BREAK] 点击左侧或输入关键词开始重构。");
            }, 600);
        }

        document.getElementById('clear-history')?.addEventListener('click', () => {
            if (confirm("确认抹除所有逻辑痕迹？此操作不可逆。")) {
                localStorage.removeItem('chatHistory');
                location.reload();
            }
        });

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                if (preset) triggerPreset(preset);
                if (btn.id === 'upload-btn') document.getElementById('file-upload')?.click();
            });
        });

        document.getElementById('file-upload')?.addEventListener('change', e => {
            try {
                handleFileUpload(e.target.files[0]);
            } catch (err) {
                console.error("Upload error:", err);
            }
        });

        document.getElementById('send-btn')?.addEventListener('click', handleAction);
        document.getElementById('user-input')?.addEventListener('keypress', e => {
            if (e.key === 'Enter') handleAction();
        });

        // 全局复制按钮事件委托
        document.getElementById('chat-container')?.addEventListener('click', async e => {
            const target = e.target.closest('.copy-box');
            if (target) {
                try {
                    let textToCopy = target.innerText.trim();
                    textToCopy = textToCopy.replace(/(复制|已复制 !)$/, '').trim();

                    await navigator.clipboard.writeText(textToCopy);

                    target.classList.add('copied');
                    setTimeout(() => target.classList.remove('copied'), 2000);

                    console.log("指令已复制到剪贴板");
                } catch (err) {
                    console.error("复制失败:", err);
                    alert("浏览器限制复制，请手动选中文字复制。");
                }
            }
        });
    } catch (e) {
        console.error("System Crash:", e);
        postMessage("系统加载异常，请使用服务器环境运行（不可直接双击打开）。", "bot");
    }
});

function triggerPreset(text) {
    const input = document.getElementById('user-input');
    if (input) {
        input.value = text;
        handleAction();
    }
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
            if (q.includes(key.toLowerCase())) score += (item.priority || 50);
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
    if (!input) return;
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
        postMessage("逻辑链路波动，正在重置...", "bot");
    } finally {
        isProcessing = false;
        input.focus();
    }
}

async function handleFileUpload(file) {
    if (!file) return;
    postMessage(`📁 上传文件: ${file.name}`, 'user');
    saveHistory(`📁 上传文件: ${file.name}`, 'user');

    const container = document.getElementById('chat-container');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'msg-row bot';
    row.innerHTML = '<div class="bubble"><div class="progress-bar"><div class="progress-fill" style="width:0%"></div><span>哨兵扫描: 0%</span></div></div>';
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;

    const fill = row.querySelector('.progress-fill');
    const span = row.querySelector('span');

    for (let i = 0; i <= 100; i += 10) {
        fill.style.width = i + '%';
        span.textContent = `哨兵扫描: ${i}%`;
        await new Promise(r => setTimeout(r, 150));
    }

    // 不输出重复文字，直接触发 JSON 事件
    handleAction("FILE_UPLOAD_EVENT");
}

function forceMathJax(attempt = 0) {
    if (attempt > 10) return;
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise().catch(() => {});
    } else {
        setTimeout(() => forceMathJax(attempt + 1), 100);
    }
}

function encodeData(data) {
    try {
        return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    } catch {
        return "";
    }
}

function decodeData(data) {
    if (!data || data === "null" || data === "undefined") return "[]";
    try {
        return decodeURIComponent(escape(atob(data)));
    } catch {
        return "[]";
    }
}

function saveHistory(text, role) {
    try {
        chatHistory.push({ text, role });
        if (chatHistory.length > 30) chatHistory.shift();
        localStorage.setItem('chatHistory', encodeData(chatHistory));
    } catch {}
}

async function renderLogicalChain(fullText) {
    const segments = fullText.split('[BREAK]').map(s => s.trim());
    for (let i = 0; i < segments.length; i++) {
        await typeWriter(segments[i], i === 0);
        await new Promise(r => setTimeout(r, Math.min(segments[i].length * 20 + 500, 1500)));
    }
    forceMathJax();
}

function typeWriter(content, isFirst) {
    return new Promise(resolve => {
        const container = document.getElementById('chat-container');
        if (!container) return resolve();

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
    if (!container) return;

    const row = document.createElement('div');
    row.className = `msg-row ${role}`;
    row.innerHTML = role === 'bot' 
        ? `<img src="profile.jpg" class="avatar-chat" onerror="this.src='https://ui-avatars.com/api/?name=A&background=154391&color=fff'"><div class="bubble">${htmlContent}</div>`
        : `<div class="bubble">${htmlContent}</div>`;
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
}

function postMessage(text, role) {
    const chat = document.getElementById('chat-container');
    if (!chat) return;

    const div = document.createElement('div');
    div.className = `msg-row ${role}`;
    div.innerHTML = `<div class="bubble">${text}</div>`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}
