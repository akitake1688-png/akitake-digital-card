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

    function detectLanguage(text) {
        const chinese = /[\u4e00-\u9fa5]/g;
        const japanese = /[\u3040-\u309f\u30a0-\u30ff]/g;
        const korean = /[\uac00-\ud7af]/g;
        const english = /[a-zA-Z]/g;
        
        const counts = {
            cn: (text.match(chinese) || []).length,
            jp: (text.match(japanese) || []).length,
            kr: (text.match(korean) || []).length,
            en: (text.match(english) || []).length
        };
        
        const total = counts.cn + counts.jp + counts.kr + counts.en;
        if (total === 0) return 'unknown';
        
        const dominant = Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b);
        return dominant[0];
    }

    function calculateSimilarity(str1, str2) {
        const s1 = str1.toLowerCase();
        const s2 = str2.toLowerCase();
        
        let overlap = 0;
        const minLen = Math.min(s1.length, s2.length);
        
        for (let i = 0; i < minLen; i++) {
            if (s1[i] === s2[i]) overlap++;
        }
        
        if (s1.includes(s2) || s2.includes(s1)) {
            overlap += minLen * 0.3;
        }
        
        return overlap / Math.max(s1.length, s2.length);
    }

    function findBestMatch(userInput) {
        const text = userInput.toLowerCase().trim();
        const detectedLang = detectLanguage(userInput);
        
        userBehavior.queries.push({
            text: text,
            timestamp: Date.now(),
            language: detectedLang
        });
        userBehavior.conversationDepth++;
        
        const cacheKey = `${text}_${detectedLang}`;
        if (semanticCache.has(cacheKey)) {
            cacheHitCount++;
            if (cacheHitCount >= CACHE_CLEAR_THRESHOLD) {
                semanticCache.clear();
                cacheHitCount = 0;
            }
            return semanticCache.get(cacheKey);
        }
        
        let matches = [];
        
        knowledgeBase.forEach(item => {
            let score = 0;
            let matchDetails = [];
            
            item.keywords.forEach(keyword => {
                const lowerKey = keyword.toLowerCase();
                
                if (text === lowerKey) {
                    score += 50;
                    matchDetails.push(`精确:${keyword}(+50)`);
                } else if (text.includes(lowerKey)) {
                    score += 30;
                    matchDetails.push(`包含:${keyword}(+30)`);
                } else if (lowerKey.includes(text) && text.length >= 2) {
                    score += 15;
                    matchDetails.push(`部分:${keyword}(+15)`);
                }
                
                const similarity = calculateSimilarity(text, lowerKey);
                if (similarity > 0.5) {
                    const simScore = Math.floor(similarity * 20);
                    score += simScore;
                    matchDetails.push(`相似度:${(similarity * 100).toFixed(0)}%(+${simScore})`);
                }
            });
            
            if (score > 0) {
                const priorityWeight = item.priority / 100;
                score += priorityWeight;
                
                // 慢权重保护
                if (item.priority >= 2800) {
                    score *= 1.2;
                    matchDetails.push('🛡️慢权重保护(x1.2)');
                }
                
                const itemLangSuffix = item.id.split('_').pop();
                if (itemLangSuffix === detectedLang.toUpperCase()) {
                    score *= 1.15;
                    matchDetails.push(`语言匹配:${detectedLang}(x1.15)`);
                }
                
                matches.push({ item, score, details: matchDetails, id: item.id });
            }
        });
        
        if (matches.length === 0) return null;
        
        matches.sort((a, b) => b.score - a.score);
        
        console.log('🎯 匹配结果 Top 3:');
        matches.slice(0, 3).forEach((m, i) => {
            console.log(`   ${i + 1}. [${m.id}] 得分:${m.score.toFixed(2)}`, m.details);
        });
        
        // 记录高价值主题
        const topMatch = matches[0].item;
        if (topMatch.priority >= 2800) {
            userBehavior.highValueTopics.add(topMatch.id);
        }
        
        const bestMatch = matches[0].item;
        semanticCache.set(cacheKey, bestMatch);
        return bestMatch;
    }

    // === 微信转化检测 ===
    function detectWechatIntent(text) {
        const wechatKeywords = ['qiuwu999', '微信', 'wechat', '联系', '咨询', '加你'];
        return wechatKeywords.some(kw => text.includes(kw));
    }
    
    // === 检测用户拒绝微信 ===
    function detectWechatRejection(text) {
        const rejectionKeywords = ['不加', '不想加', '不要微信', '别推', '不用', '算了'];
        return rejectionKeywords.some(kw => text.includes(kw));
    }

    // === 转化率优化：智能微信引导（V48.2 降低强度版）===
    function shouldShowWechatPrompt() {
        if (userBehavior.wechatRejected) {
            return false;
        }
        
        if (userBehavior.conversationDepth >= 4 && !userBehavior.wechatMentioned) {
            return true;
        }
        
        if (userBehavior.highValueTopics.size >= 3 && !userBehavior.wechatMentioned) {
            return true;
        }
        
        return false;
    }

    // === 主程序初始化 ===
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const res = await fetch('knowledge.json?v=' + Date.now());
            knowledgeBase = await res.json();
            console.log('✅ 知识库加载完成:', knowledgeBase.length, '条目');

            const input = document.getElementById('user-input');
