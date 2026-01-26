(function() {
    let knowledgeBase = [];
    let isProcessing = false;

    document.addEventListener('DOMContentLoaded', async () => {
        try {
            // 1. 加载数据库
            const res = await fetch('knowledge.json?v=' + Date.now());
            knowledgeBase = await res.json();
            
            const input = document.getElementById('user-input');
            const sendBtn = document.getElementById('send-btn');
            const clearBtn = document.getElementById('clear-btn');
            const chat = document.getElementById('chat-container');

            // 2. 核心发送逻辑
            const handleSend = async () => {
                const text = input.value.trim();
                if (!text || isProcessing) return;
                
                isProcessing = true;
                sendBtn.disabled = true;
                appendMessage('user', text);
                input.value = '';

                // 3. 匹配算法：基于Priority的加权检索
                let bestMatch = null;
                let highestPriority = -1;

                knowledgeBase.forEach(item => {
                    const match = item.keywords.some(k => text.toLowerCase().includes(k.toLowerCase()));
                    if (match && item.priority > highestPriority) {
                        highestPriority = item.priority;
                        bestMatch = item;
                    }
                });

                const responseObj = bestMatch || knowledgeBase.find(i => i.id === "SENTINEL_GATE");
                const segments = responseObj.response.split('[BREAK]');

                // 4. 分段呼吸渲染
                for (let seg of segments) {
                    if (seg.trim()) {
                        appendMessage('bot', seg.trim());
                        await new Promise(r => setTimeout(r, Math.min(seg.length * 20 + 450, 1200)));
                    }
                }

                if (window.MathJax) window.MathJax.typesetPromise();
                isProcessing = false;
                sendBtn.disabled = false;
                input.focus();
            };

            // 5. 事件监听绑定
            sendBtn.addEventListener('click', handleSend);
            input.addEventListener('keypress', e => { if (e.key === 'Enter') handleSend(); });

            // 物理清除功能
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    chat.innerHTML = `<div class="msg-row bot"><div class="bubble"><b>【数据已物理抹除】</b><br>知性对话记录已清空，哨兵随时待命。</div></div>`;
                    input.focus();
                });
            }

            // 侧边栏预设词
            document.querySelectorAll('.nav-btn[data-preset]').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (!isProcessing) {
                        input.value = btn.getAttribute('data-preset');
                        handleSend();
                    }
                });
            });

        } catch (e) { console.error("Sentinel Loader Error:", e); }
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
