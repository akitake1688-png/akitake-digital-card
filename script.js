/**
 * 秋武逻辑数字分身引擎 V16.2 / V32.0 融合版
 * 核心：逻辑解耦 | 物理隔离 | 异常熔断保护
 */

let knowledgeBase = [];
let isProcessing = false;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('knowledge.json');
        if (!res.ok) throw new Error("Database Logic Error");
        knowledgeBase = await res.json();
        console.log("秋武逻辑：V32.0 语义模型已挂载。");
        
        setTimeout(() => {
            renderLogicalChain("<b>System Online.</b> [BREAK] 很多升学问题，不是你不努力，而是逻辑被错用。 [BREAK] 点击左侧或直接咨询，我们开始<b>手术刀级</b>逻辑重构。");
        }, 600);
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
            if (q === k) score += (item.priority || 50);
            else if (q.includes(k)) score += 20;
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

async function renderLogicalChain(fullText) {
    const segments = fullText.split('[BREAK]').map(s => s.trim());
    for (let i = 0; i < segments.length; i++) {
        await typeWriter(segments[i], i === 0);
        const delay = Math.min(segments[i].length * 20 + 500, 1200); 
        await new Promise(r => setTimeout(r, delay)); 
    }
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
                if (window.MathJax && window.MathJax.typesetPromise) {
                    MathJax.typesetPromise([bubble]).catch(err => console.log(err));
                }
                resolve();
            }
        }, 12);
    });
}

function postMessage(text, role) {
    const chat = document.getElementById('chat-container');
    const div = document.createElement('div');
    div.className = `msg-row ${role}`;
    div.innerHTML = `<div class="bubble">${text}</div>`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}
