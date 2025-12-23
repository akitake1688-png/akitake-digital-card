/**
 * 秋武逻辑数字分身引擎 V15.2
 * 协同机制：加权语义召回 + 分段节奏控制 + 容错渲染
 */

let knowledgeBase = [];
let isProcessing = false;

// 初始化系统协同
async function startSystem() {
    try {
        const res = await fetch('knowledge.json');
        if (!res.ok) throw new Error("JSON数据未找到");
        knowledgeBase = await res.json();
        console.log("秋武逻辑：V15.2 数据层协同完毕。");
        sendBotSignal("你好！我是秋武老师的数字助理。🌸 [BREAK] 升学防御体系已就绪。我会为你提供一针见血的逻辑补缝。 [BREAK] 请点击左侧或输入关键词，如：<b>RP、理科本阵、读空气</b>。");
    } catch (e) {
        console.error("系统故障：", e);
        // 安全兜底逻辑
        knowledgeBase = [{ "intent": "error", "keywords": [], "response": "系统逻辑库加载异常，请检查 JSON 路径。" }];
    }
}

// 核心加权搜索算法 (实现权重排位)
function getSynergyMatch(query) {
    const q = query.toLowerCase();
    let winner = null;
    let topScore = -1;

    knowledgeBase.forEach(item => {
        let score = 0;
        // 意图深度匹配
        if (q.includes(item.intent.toLowerCase())) score += 80;
        // 关键词权重加权
        item.keywords.forEach(key => {
            const k = key.toLowerCase();
            if (q === k) score += (item.priority || 50);
            else if (q.includes(k)) score += 25;
        });

        if (score > topScore) {
            topScore = score;
            winner = item;
        }
    });

    return (topScore > 15) ? winner : null;
}

async function handleAction() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (!text || isProcessing) return;

    postMessage(text, 'user');
    input.value = "";

    const match = getSynergyMatch(text);
    if (match) {
        await renderLogicalChain(match.response);
    } else {
        await renderLogicalChain("该维度尚未对齐。建议输入核心词 (RP, 修士, 微信) 或直接咨询：<b>qiuwu999</b>");
    }
}

async function renderLogicalChain(fullText) {
    const segments = fullText.split('[BREAK]').map(s => s.trim());
    for (let i = 0; i < segments.length; i++) {
        await typeWriter(segments[i], i === 0);
        await new Promise(r => setTimeout(r, 650)); // 模拟思考停顿
    }
}

function typeWriter(content, isFirst) {
    return new Promise(resolve => {
        isProcessing = true;
        const container = document.getElementById('chat-container');
        const row = document.createElement('div');
        row.className = 'msg-row bot';
        
        row.innerHTML = `
            ${isFirst ? '<img src="profile.jpg" class="avatar-chat" onerror="this.src=\'https://via.placeholder.com/40?text=Q\'">' : '<div style="width:52px"></div>'}
            <div class="bubble"></div>
        `;
        container.appendChild(row);
        
        const bubble = row.querySelector('.bubble');
        let index = 0;
        
        const timer = setInterval(() => {
            if (index < content.length) {
                if (content[index] === '<') {
                    let end = content.indexOf('>', index);
                    bubble.innerHTML += content.substring(index, end + 1);
                    index = end + 1;
                } else {
                    bubble.innerHTML += content[index];
                    index++;
                }
                container.scrollTop = container.scrollHeight;
            } else {
                clearInterval(timer);
                isProcessing = false;
                if (window.MathJax) MathJax.typesetPromise([bubble]);
                resolve();
            }
        }, 15);
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

function sendBotSignal(msg) { renderLogicalChain(msg); }

document.addEventListener('DOMContentLoaded', startSystem);
