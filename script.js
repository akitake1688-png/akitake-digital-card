(function() {
    let knowledgeBase = [];
    let isProcessing = false;

    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const res = await fetch('knowledge.json?v=' + Date.now());
            knowledgeBase = await res.json();
            
            const input = document.getElementById('user-input');
            const sendBtn = document.getElementById('send-btn');
            const chat = document.getElementById('chat-container');

            const handleSend = async () => {
                const text = input.value.trim();
                if (!text || isProcessing) return;
                
                isProcessing = true;
                sendBtn.disabled = true;
                input.disabled = true; 
                
                appendMessage('user', text);
                input.value = '';

                // 核心逻辑：权重梯队计算
                let matches = [];
                knowledgeBase.forEach(item => {
                    let score = 0;
                    item.keywords.forEach(k => {
                        const lowText = text.toLowerCase();
                        const lowKw = k.toLowerCase();
                        if (lowText === lowKw) score += (item.priority + 5000);
                        else if (lowText.includes(lowKw)) score += item.priority;
                    });
                    if (score > 0) matches.push({ item, score });
                });

                matches.sort((a, b) => b.score - a.score);
                const best = matches[0]?.item || knowledgeBase.find(i => i.id === "SENTINEL_GATE");

                // 分段呼吸感渲染
                const segments = best.response.split('[BREAK]');
                for (let seg of segments) {
                    if (seg.trim()) {
                        appendMessage('bot', seg.trim());
                        await new Promise(r => setTimeout(r, Math.min(seg.length * 25 + 400, 1100)));
                    }
                }

                if (window.MathJax) window.MathJax.typesetPromise();

                isProcessing = false;
                sendBtn.disabled = false;
                input.disabled = false;
                input.focus();
            };

            sendBtn.addEventListener('click', handleSend);
            input.addEventListener('keypress', e => { if (e.key === 'Enter') handleSend(); });

            // 侧边栏监听
            document.querySelectorAll('.nav-btn[data-preset]').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (isProcessing) return;
                    input.value = btn.getAttribute('data-preset');
                    handleSend();
                });
            });

        } catch (e) { console.error("Sentinel Core Error"); }
    });

    function appendMessage(role, html) {
        const chat = document.getElementById('chat-container');
        const div = document.createElement('div');
        div.className = `msg-row ${role}`;
        div.innerHTML = `<div class="bubble">${html}</div>`;
        if (role === 'bot') {
            div.querySelector('.bubble').addEventListener('click', function() {
                navigator.clipboard.writeText(this.innerText);
                this.classList.add('copied');
                setTimeout(() => this.classList.remove('copied'), 1000);
            });
        }
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }
})();
