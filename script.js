(function() {
    let knowledgeBase = [];
    let isProcessing = false;

    // 核心匹配算法：语种隔离 + 优先级判定
    function getBestResponse(userInput) {
        const text = userInput.toLowerCase();
        let matches = [];

        knowledgeBase.forEach(item => {
            const hasMatch = item.keywords.some(k => text.includes(k.toLowerCase()));
            if (hasMatch) matches.push(item);
        });

        if (matches.length === 0) return null;
        // 关键：按优先级降序排列，取最高权重的条目
        return matches.sort((a, b) => b.priority - a.priority)[0];
    }

    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const res = await fetch('knowledge.json?v=' + Date.now());
            knowledgeBase = await res.json();
            
            const input = document.getElementById('user-input');
            const sendBtn = document.getElementById('send-btn');
            const clearBtn = document.getElementById('clear-btn');
            const chat = document.getElementById('chat-container');

            const handleSend = async () => {
                const text = input.value.trim();
                if (!text || isProcessing) return;
                
                isProcessing = true;
                appendMessage('user', text);
                input.value = '';

                const matchedItem = getBestResponse(text);
                const responseText = matchedItem ? matchedItem.response : "【秋武哨兵】未检测到逻辑锚点，请输入：费用、面接、interview、면접。";
                
                const segments = responseText.split('[BREAK]');
                for (let seg of segments) {
                    if (seg.trim()) {
                        appendMessage('bot', seg.trim());
                        await new Promise(r => setTimeout(r, 600)); // 职人呼吸感
                    }
                }
                
                isProcessing = false;
                chat.scrollTop = chat.scrollHeight;
            };

            // 物理清除：真正挂载成功
            clearBtn.onclick = () => {
                chat.innerHTML = "";
                localStorage.clear();
                appendMessage('bot', "<b>🧹 哨兵清除：数据主权已回归</b><br>LocalStorage 已粉碎，记录归于虚无。");
                isProcessing = false;
                input.focus();
            };

            sendBtn.onclick = handleSend;
            input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };

            // 侧边栏按钮逻辑
            document.querySelectorAll('.nav-btn[data-preset]').forEach(btn => {
                btn.onclick = () => {
                    input.value = btn.getAttribute('data-preset');
                    handleSend();
                };
            });

        } catch (e) { console.error("Critical System Error:", e); }
    });

    function appendMessage(role, html) {
        const chat = document.getElementById('chat-container');
        const div = document.createElement('div');
        div.className = `msg-row ${role}`;
        div.innerHTML = `<div class="bubble">${html}</div>`;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }
})();
