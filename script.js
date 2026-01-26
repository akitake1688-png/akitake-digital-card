(function() {
    let knowledgeBase = [];
    let isProcessing = false;
    function findBestMatch(userInput) {
        const text = userInput.toLowerCase();
        let matches = knowledgeBase.filter(item => item.keywords.some(k => text.includes(k.toLowerCase())));
        return matches.sort((a, b) => b.priority - a.priority)[0];
    }
    document.addEventListener('DOMContentLoaded', async () => {
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
            const matched = findBestMatch(text);
            const responseText = matched ? matched.response : "【哨兵审计】未发现逻辑锚点。建议输入：逻辑手术、费用、면접。";
            const segments = responseText.split('[BREAK]');
            for (let seg of segments) {
                if (seg.trim()) {
                    appendMessage('bot', seg.trim());
                    await new Promise(r => setTimeout(r, 600));
                }
            }
            isProcessing = false;
        };
        clearBtn.onclick = () => {
            chat.innerHTML = "";
            localStorage.clear();
            appendMessage('bot', "<b>🧹 哨兵清除成功</b>");
            isProcessing = false;
        };
        sendBtn.onclick = handleSend;
        input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };
        document.querySelectorAll('.nav-btn[data-preset]').forEach(btn => {
            btn.onclick = () => { input.value = btn.getAttribute('data-preset'); handleSend(); };
        });
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
