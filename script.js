/**
 * 秋武逻辑数字分身驱动引擎 V15.0
 * 协同逻辑：加权搜索 + 分段渲染 + 头像联动
 */

let knowledgeData = [];
let isTyping = false;

// 1. 系统协同初始化
async function initSystem() {
    try {
        const response = await fetch('knowledge.json');
        knowledgeData = await response.json();
        console.log("协同库加载成功，权重初始化完毕。");
        welcomeMessage();
    } catch (error) {
        console.error("协同错误：无法读取逻辑库", error);
    }
}

// 2. 加权搜索排位算法 (权重决策中心)
function weightedSearch(query) {
    const q = query.toLowerCase();
    let bestMatch = null;
    let maxScore = -1;

    knowledgeData.forEach(item => {
        let score = 0;
        // 意图匹配 (权重最高)
        if (item.intent.toLowerCase().includes(q)) score += 100;
        // 关键词权重分级匹配
        item.keywords.forEach(key => {
            const k = key.toLowerCase();
            if (q === k) score += (item.priority || 50);
            else if (q.includes(k)) score += 20;
        });

        if (score > maxScore) {
            maxScore = score;
            bestMatch = item;
        }
    });

    return maxScore > 10 ? bestMatch : null;
}

// 3. 协同消息发送 (包含用户与机器人逻辑)
async function handleUserInput() {
    const input = document.getElementById('user-input');
    const query = input.value.trim();
    if (!query || isTyping) return;

    displayMessage(query, 'user');
    input.value = "";

    const match = weightedSearch(query);
    if (match) {
        await renderResponse(match.response);
    } else {
        await renderResponse("该维度尚未对齐。建议输入：<b>RP、修士、本阵</b> 或咨询：<b>qiuwu999</b>");
    }
}

// 4. 分段节奏渲染 (实现“有温度”的打字机)
async function renderResponse(text) {
    const segments = text.split('[BREAK]').map(s => s.trim());
    for (let i = 0; i < segments.length; i++) {
        await typeEffect(segments[i], i === 0);
        await new Promise(r => setTimeout(r, 600)); // 呼吸停顿感
    }
}

function typeEffect(text, showAvatar) {
    return new Promise(resolve => {
        isTyping = true;
        const chat = document.getElementById('chat-container');
        const row = document.createElement('div');
        row.className = 'msg-row bot';
        // 协同渲染：仅首段显示头像
        row.innerHTML = `${showAvatar ? '<img src="profile.jpg" class="avatar-chat" onerror="this.src=\'https://via.placeholder.com/40\'">' : '<div style="width:52px"></div>'}<div class="bubble"></div>`;
        chat.appendChild(row);
        
        const bubble = row.querySelector('.bubble');
        let charIndex = 0;
        const interval = setInterval(() => {
            if (charIndex < text.length) {
                if (text[charIndex] === '<') {
                    let tagEnd = text.indexOf('>', charIndex);
                    bubble.innerHTML += text.substring(charIndex, tagEnd + 1);
                    charIndex = tagEnd + 1;
                } else {
                    bubble.innerHTML += text[charIndex];
                    charIndex++;
                }
                chat.scrollTop = chat.scrollHeight;
            } else {
                clearInterval(interval);
                isTyping = false;
                if (window.MathJax) MathJax.typesetPromise([bubble]);
                resolve();
            }
        }, 12);
    });
}

function displayMessage(text, role) {
    const chat = document.getElementById('chat-container');
    const row = document.createElement('div');
    row.className = `msg-row ${role}`;
    row.innerHTML = `<div class="bubble">${text}</div>`;
    chat.appendChild(row);
    chat.scrollTop = chat.scrollHeight;
}

async function welcomeMessage() {
    await renderResponse("你好，我是秋武老师的数字助理。🌸 [BREAK] 升学防御体系 V15.0 已就绪，我会为你提供一针见血的逻辑补缝。 [BREAK] 请点击左侧或直接提问。");
}

document.addEventListener('DOMContentLoaded', initSystem);
