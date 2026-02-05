(function() {
  let knowledgeBase = [];
  let isProcessing = false;
  let semanticCache = new Map();
  let cacheHitCount = 0;
  const CACHE_CLEAR_THRESHOLD = 500;

  // === 行为追踪系统 ===
  let userBehavior = {
    sessionId: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    queries: [],
    conversationDepth: 0,
    wechatMentioned: false,
    wechatRejected: false,
    uploadAttempted: false,
    highValueTopics: new Set()
  };

  // 配置 PDF.js
  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
  }

  // === 语义路由引擎 ===
  function detectLanguage(text) {
    // ... (保持原样)
  }

  function calculateSimilarity(str1, str2) {
    // ... (保持原样)
  }

  function findBestMatch(userInput) {
    try {
      // ... (保持原匹配逻辑)
    } catch (e) {
      console.error('匹配函数错误:', e);
      return null;
    }
  }

  // ... (detectWechatIntent, shouldShowWechatPrompt, detectWechatRejection 保持)

  function evaluateDocument(text) {
    // ... (保持原样)
  }

  document.addEventListener('DOMContentLoaded', async () => {
    // 隐私提示
    if (!localStorage.getItem('privacyNotified')) {
      setTimeout(() => {
        appendMessage('bot', '<b>📋 隐私说明</b><br>本站使用浏览器本地存储记录会话数据，用于优化体验。数据仅本地，不会上传。您可点击"🧹 哨兵物理清除"删除所有数据。');
        localStorage.setItem('privacyNotified', 'true');
      }, 2000);
    }

    try {
      const res = await fetch('knowledge.json?v=' + Date.now());
      if (!res.ok) throw new Error('fetch failed: ' + res.status);
      knowledgeBase = await res.json();
      console.log('✅ 知识库加载完成:', knowledgeBase.length, '条目');

      const input = document.getElementById('user-input');
      const sendBtn = document.getElementById('send-btn');
      const chat = document.getElementById('chat-container');

      if (!input || !sendBtn || !chat) {
        console.error('元素未找到，请检查index.html ID');
        appendMessage('bot', '【系统警报】页面元素加载失败，请刷新或检查代码。');
        return;
      }

      const handleSend = async () => {
        // ... (保持原样，但加try-catch)
        try {
          // 原代码
        } catch (e) {
          console.error('发送处理错误:', e);
          appendMessage('bot', '【处理错误】请刷新页面重试。');
        }
      };

      sendBtn.onclick = handleSend;
      input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };

      // 上传等保持原样，加try-catch
      document.getElementById('file-upload').onchange = async (e) => {
        try {
          // 原上传代码
        } catch (err) {
          console.error('文件上传错误:', err);
          appendMessage('bot', '【上传失败】' + err.message + ' 请直接加微信 qiuwu999 发送文件。');
        }
      };

      // 清除按钮保持
    } catch (e) {
      console.error("❌ 系统错误:", e);
      appendMessage('bot', '<b>【系统错误】</b>知识库加载失败: ' + e.message + '。请检查knowledge.json语法，或刷新页面。');
    }
  });

  function appendMessage(role, html, className = '') {
    // ... (保持原样)
  }
})();
