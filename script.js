/**
 * 秋武逻辑数字分身引擎 V16.2 GM版
 * 状态：Production Ready
 * 核心：逻辑解耦 | 物理隔离 | 异常熔断保护
 */

let knowledgeBase = [];
let isProcessing = false;

// 初始化系统
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('knowledge.json');
        if (!res.ok) throw new Error("Database Logic Error");
        knowledgeBase = await res.json();
        console.log("秋武逻辑：V16.2 语义模型已挂载 (Production Mode)。");
        
        // [UX升级] 延迟触发开场白，文案人格化增强
        setTimeout(() => {
            // 这里不再是普通的欢迎，而是直接抛出价值观
            renderLogicalChain("<b>System Online.</b> [BREAK] 很多升学问题，不是你不努力，而是逻辑被错用。 [BREAK] 点击左侧或输入关键词（如：<b>RP、面试、读空气</b>），我们开始逻辑补缝。");
        }, 600);
    } catch (e) {
        console.error("System Crash:", e);
        postMessage("系统逻辑库加载异常，请检查 knowledge.json 路径。", "bot");
    }
});

// 暴露给HTML按钮的触发器
function triggerPreset(text) {
    const input = document.getElementById('user-input');
    input.value = text;
    handleAction();
}

// 核心加权算法 (Intent-First Strategy)
function getSynergyMatch(query) {
    const q = query.toLowerCase();
    let winner = null;
    let topScore = -1;

    knowledgeBase.forEach(item => {
        // 机器意图过滤：跳过 fallback
        if (item.intent === "fallback") return; 
        
        let score = 0;
        // 意图命中 (兼容 V17 预留)
        if (q.includes(item.intent.toLowerCase())) score += 80;
        
        // 关键词加权
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

    // 阈值判定
    if (topScore < 10) {
        // 安全查找 fallback
        return knowledgeBase.find(item => item.intent === "fallback");
    }
    return winner;
}

// [核心] 交互主控 (引入 try-finally 防死锁)
async function handleAction() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    
    // 输入锁检查
    if (!text || isProcessing) return;

    // 1. 渲染用户消息
    postMessage(text, 'user');
    input.value = "";
    isProcessing = true; // 🔒 上锁

    try {
        // 2. 计算匹配
        const match = getSynergyMatch(text);
        
        // 3. 渲染回复
        if (match) {
            await renderLogicalChain(match.response);
        } else {
            // 理论上不可达，但作为兜底的兜底
            postMessage("逻辑维度暂未对齐，请联系秋武老师。", "bot");
        }
    } catch (e) {
        console.error("Runtime Error:", e);
        postMessage("逻辑链路发生波动，正在自动重置...", "bot");
    } finally {
        // [重要] 无论成功还是报错，必须解锁，防止输入框卡死
        isProcessing = false; // 🔓 解锁
        input.focus();
    }
}

// 逻辑链渲染引擎
async function renderLogicalChain(fullText) {
    // 简单的断句符分割
    const segments = fullText.split('[BREAK]').map(s => s.trim());
    
    for (let i = 0; i < segments.length; i++) {
        await typeWriter(segments[i], i === 0);
        
        // 动态节奏控制：字数越多，停顿越久，模拟思考感
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
                // HTML 标签完整性保护
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
                
                // [FIX] MathJax 竞态条件保护
                // 只有当 MathJax 彻底加载完毕且 typesetPromise 可用时才执行
                if (window.MathJax && window.MathJax.typesetPromise) {
                    MathJax.typesetPromise([bubble]).catch(err => console.log('MathJax Render Warning:', err));
                }
                
                resolve();
            }
        }, 12); // 打字速度微调
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
