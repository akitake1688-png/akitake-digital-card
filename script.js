/**
 * AKI_KNOWLEDGE 知识库模块
 * 基于秋武 PDF 数据核心逻辑
 */
const AKI_KNOWLEDGE = {
    "面试": "【面试评分标准】礼仪占 22%。<br>关键加分项：离场时，请务必回头微笑着将椅子轻轻推回原位，这个细节能直接增加约 10 分的印象分。",
    "1": "【面试评分标准】礼仪占 22%。<br>关键加分项：离场时，请务必回头微笑着将椅子轻轻推回原位，这个细节能直接增加约 10 分的印象分。",
    "化学": "【理科逻辑：酯化反应】<br>原则：酸脱羟基醇脱氢。<br>反应条件：浓硫酸催化、加热。这是一个平衡移动过程，移除生成物可提高产率。",
    "物理": "【理科逻辑：动量守恒】<br>公式：$$ \sum \vec{F} = 0 \implies \Delta \vec{p} = 0 $$ 当系统不受外力或外力矢量和为零时，总动量保持不变。",
    "EJU": "【EJU博弈策略】准考证即入场券。即使复习不充分也要参加 6 月考，目标是积累临场软实力，为 11 月终局战做演练。",
    "倒推": "【认知升级】拒绝“没学过就瞎编”。主张“由未来梦想倒推学习计划”的逻辑。先看终点站，再铺设轨道。",
    "核心优势": "【秋武特色】文理融合思维。不只是教你解题，而是教你用理科的严谨逻辑去解文科的面试题目。",
    "辅导模式": "【三方共赢】介绍费完全覆盖辅导费。我们通过透明的资源对接，确保学生获得最顶级的指导而不增加额外负担。",
    "成功案例": "【拒绝完美】在文书中展示带有“疙瘩”的真实成长弧线，而非AI生成的无瑕疵作文。真实的破绽才是最动人的力量。"
};

const AKI_ENGINE = {
    init() {
        this.display = document.getElementById('chat-display');
        this.input = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.setupListeners();
    },

    setupListeners() {
        this.sendBtn.addEventListener('click', () => this.handleSend());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSend();
        });
    },

    handleSend() {
        const text = this.input.value.trim();
        if (!text) return;

        this.addMessage(text, 'user-msg');
        this.input.value = '';
        
        // 模拟思考延迟
        setTimeout(() => this.processQuery(text), 500);
    },

    processQuery(query) {
        let reply = "这是一个深刻的问题。尝试输入“面试”、“物理”或“EJU”来解锁秋武流的终局思维。";
        
        // 简单的关键词匹配逻辑
        for (let key in AKI_KNOWLEDGE) {
            if (query.toLowerCase().includes(key.toLowerCase())) {
                reply = AKI_KNOWLEDGE[key];
                break;
            }
        }

        this.addMessage(reply, 'bot-msg');
        
        // 动态触发公式渲染
        if (window.MathJax) {
            MathJax.typesetPromise();
        }
    },

    addMessage(content, className) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg ${className}`;
        msgDiv.innerHTML = content;
        this.display.appendChild(msgDiv);
        
        // 自动滚动到底部
        this.display.scrollTop = this.display.scrollHeight;
    },

    quickAction(type) {
        this.input.value = type;
        this.handleSend();
    }
};

// 页面加载完成后启动
document.addEventListener('DOMContentLoaded', () => AKI_ENGINE.init());
