// ==================== 系统核心状态 ====================
class SentinelSystem {
    constructor() {
        // 系统状态
        this.state = {
            hp: 50,
            isOnline: true,
            isProcessing: false,
            consecutiveMisses: 0,
            lastMatchScore: 0,
            conversationHistory: [],
            currentTopic: null
        };
        
        // 知识库
        this.knowledgeBase = null;
        
        // DOM元素引用
        this.elements = {
            input: null,
            sendBtn: null,
            messagesContainer: null,
            tagsContainer: null,
            hpBar: null,
            statusDot: null,
            resetBtn: null,
            helpOverlay: null,
            closeHelp: null
        };
        
        // 同义词映射（核心模糊匹配支持）
        this.synonymMap = {
            // 费用相关
            '费用': ['价格', '收费', '多少钱', '贵吗', '费用多少', '付费', '免费', '价格表', '收费标准', 'cost'],
            '免费': ['不花钱', '0元', '不要钱', '免费模式', '白嫖', '免费辅导'],
            
            // 辅导特色
            '特色': ['优势', '特点', '强项', '不同之处', '独特之处', '核心竞争力', '亮点', '特色是什么'],
            '优势': ['长处', '优点', '好处', '强项', '特色', '优势是什么'],
            
            // 日语口语
            '口语': ['日语口语', '口语能力', '说话能力', '表达能力', '口语表达', '口语训练', '口语辅导', '口语课'],
            '日语': ['日本语', '日文', '日语能力', '日语学习', '日语培训', '日语教学'],
            
            // 理科
            '理科': ['科学', '理工科', '理科生', '理科面试', '理科逻辑', '理工'],
            '面试': ['面接', '面试辅导', '面试训练', '模拟面试', '面试准备', '面试对策'],
            
            // 文书相关
            '文书': ['志望理由书', '研究计划书', '申请书', '申请材料', '个人陈述', 'PS', 'ES'],
            '志望理由书': ['志愿理由书', '申请理由书', '动机信', '申请文书'],
            
            // 通用
            '辅导': ['教学', '指导', '培训', '帮助', '辅导课', '辅导班', '一对一'],
            '老师': ['教师', '导师', '先生', '教练', '秋武'],
            '怎么': ['如何', '怎样', '怎么办', '如何做', '怎么做']
        };
        
        // 关键词权重
        this.keywordWeights = {
            '费用': 10, '免费': 9,
            '特色': 9, '优势': 8,
            '口语': 8, '日语': 7,
            '理科': 7, '面试': 8,
            '文书': 7, '志望理由书': 8,
            '辅导': 6, '老师': 5
        };
        
        // 初始化
        this.init();
    }
    
    // ==================== 初始化方法 ====================
    async init() {
        console.log('🚀 秋武数字哨兵系统初始化...');
        
        // 获取DOM元素
        this.elements.input = document.getElementById('user-input');
        this.elements.sendBtn = document.getElementById('send-btn');
        this.elements.messagesContainer = document.getElementById('messages-container');
        this.elements.tagsContainer = document.getElementById('quick-tags');
        this.elements.hpBar = document.getElementById('logic-hp-bar');
        this.elements.statusDot = document.getElementById('status-dot');
        this.elements.resetBtn = document.getElementById('reset-btn');
        this.elements.helpOverlay = document.getElementById('help-overlay');
        this.elements.closeHelp = document.getElementById('close-help');
        
        // 加载知识库
        await this.loadKnowledgeBase();
        
        // 绑定事件
        this.bindEvents();
        
        // 显示欢迎消息
        this.showWelcome();
        
        // 更新状态
        this.updateStatus();
        
        console.log('✅ 系统初始化完成');
    }
    
    // ==================== 知识库加载 ====================
    async loadKnowledgeBase() {
        try {
            const response = await fetch('knowledge.json');
            if (!response.ok) throw new Error('知识库加载失败');
            
            this.knowledgeBase = await response.json();
            console.log('📚 知识库加载成功:', this.knowledgeBase.intents.length, '个意图');
        } catch (error) {
            console.error('❌ 知识库加载失败:', error);
            
            // 使用内置的应急知识库
            this.knowledgeBase = this.getEmergencyKnowledgeBase();
            console.log('⚠️ 使用应急知识库');
        }
    }
    
    getEmergencyKnowledgeBase() {
        return {
            config: {
                version: "3.0-Emergency",
                welcome_id: "welcome"
            },
            intents: [
                {
                    id: "welcome",
                    keywords: ["__START__"],
                    responses: [
                        "系统初始化完成。我是秋武老师的数字哨兵。<br><br>🔍 <strong>核心服务：</strong><br>• 理科思维转化与逻辑重构<br>• 日语面试口语专项训练<br>• 志望理由书深度修改<br>• 教授心理博弈策略<br><br>💡 <strong>使用提示：</strong><br>直接输入问题，或点击下方标签快速提问。"
                    ],
                    suggestions: ["辅导特色", "日语口语", "费用模式", "理科面试", "文书指导", "联系老师"]
                },
                {
                    id: "core_advantage",
                    keywords: ["特色", "优势", "不同", "强项", "秋武", "区别", "核心竞争力"],
                    responses: [
                        "🎯 <strong>【秋武辅导核心特色】</strong><br><br>" +
                        "1. <strong>理科思维转化</strong><br>" +
                        "   将文科模糊论述转化为可验证的逻辑链，用数据思维解决人文问题。<br><br>" +
                        
                        "2. <strong>东大基准逻辑重构</strong><br>" +
                        "   所有文书和面试回答必须通过『东大教授会不会质疑』的检验。<br><br>" +
                        
                        "3. <strong>教授心理博弈策略</strong><br>" +
                        "   不教背稿，教预判教授的追问（空気を読む）。<br><br>" +
                        
                        "4. <strong>个人精细化辅导</strong><br>" +
                        "   拒绝流水线，只接能负责到底的学生，像研究室教授一样深度参与。"
                    ],
                    suggestions: ["具体案例", "费用说明", "预约咨询", "成功故事"]
                },
                {
                    id: "oral_training",
                    keywords: ["口语", "日语", "说话", "表达", "沟通", "听力", "口语训练", "日语口语"],
                    responses: [
                        "🗣️ <strong>【日语口语专项训练】</strong><br><br>" +
                        "📊 <strong>训练重点：</strong><br>" +
                        "• <strong>学术答辩逻辑</strong>，而非日常会话<br>" +
                        "• 高压面试下的<strong>余裕（Composure）</strong>保持<br>" +
                        "• 预判教授提问的<strong>思考路径训练</strong><br><br>" +
                        
                        "🎭 <strong>训练方法：</strong><br>" +
                        "1. <strong>压力测试模拟</strong>（连续追问）<br>" +
                        "2. <strong>分段式输出训练</strong>（避免一次说太多）<br>" +
                        "3. <strong>日语思维转换</strong>（避免中式直译）<br><br>" +
                        
                        "🎯 <strong>目标：</strong><br>" +
                        "让教授觉得『这个学生虽然日语不完美，但逻辑清晰、值得培养』。"
                    ],
                    suggestions: ["模拟面试", "口语测试", "训练计划", "费用咨询"]
                },
                {
                    id: "pricing",
                    keywords: ["费用", "价格", "收费", "多少钱", "贵吗", "付费", "免费", "价格表"],
                    responses: [
                        "💰 <strong>【双轨制收费模式】</strong><br><br>" +
                        "🎯 <strong>模式一：推荐免费模式</strong><br>" +
                        "• 通过我推荐进入合作的优质私塾/语言学校<br>" +
                        "• 合作机构支付我的介绍费（渠道费用）<br>" +
                        "• <strong>您无需额外支付我的辅导费</strong><br>" +
                        "• 适合执行力强、愿意接受机构课程的学生<br><br>" +
                        
                        "⚡ <strong>模式二：直接付费模式</strong><br>" +
                        "• 针对性逻辑手术与文书重构<br>" +
                        "• 完全个性化的一对一深度辅导<br>" +
                        "• 按项目或套餐收费<br><br>" +
                        
                        "🔍 <strong>商业逻辑透明：</strong><br>" +
                        "我是渠道方，不是中介。无任何隐形消费或套路。<br><br>" +
                        
                        "📞 具体选择哪种模式，建议加微信(qiuwu999)根据您的背景详聊。"
                    ],
                    suggestions: ["免费模式细节", "付费模式价格", "机构推荐", "加微信咨询"]
                },
                {
                    id: "science_interview",
                    keywords: ["理科", "科学", "理工科", "理科面试", "理科逻辑", "实验", "公式", "理科生"],
                    responses: [
                        "🔬 <strong>【理科面试逻辑】</strong><br><br>" +
                        "📚 <strong>教授真正想看的：</strong><br>" +
                        "• 不是知识量，而是<strong>思考过程</strong><br>" +
                        "• 不是计算结果，而是<strong>问题分析能力</strong><br>" +
                        "• 不是背诵概念，而是<strong>应用创新能力</strong><br><br>" +
                        
                        "🎯 <strong>备考策略：</strong><br>" +
                        "1. <strong>问题拆解训练</strong><br>" +
                        "   将一个复杂问题拆解为多个可解决的小问题。<br><br>" +
                        
                        "2. <strong>假设验证思维</strong><br>" +
                        "   『如果...那么...』的逻辑链条构建。<br><br>" +
                        
                        "3. <strong>跨领域联想</strong><br>" +
                        "   用物理思维解决化学问题，用数学工具分析生物数据。<br><br>" +
                        
                        "💡 <strong>例如酯化反应：</strong><br>" +
                        "教授问『为什么要用浓硫酸？』真正想听的是：<br>" +
                        "1. 催化作用（降低活化能）<br>" +
                        "2. 脱水作用（移除生成物，打破平衡）<br>" +
                        "3. 对整个反应体系的影响思考"
                    ],
                    suggestions: ["具体学科", "例题讲解", "面试模拟", "联系辅导"]
                },
                {
                    id: "document_help",
                    keywords: ["文书", "志望理由书", "研究计划书", "申请书", "个人陈述", "ES", "PS"],
                    responses: [
                        "📝 <strong>【文书深度修改服务】</strong><br><br>" +
                        "🎯 <strong>三层结构分析法：</strong><br>" +
                        "1. <strong>表层审查</strong><br>" +
                        "   语法、格式、用词准确性。<br><br>" +
                        
                        "2. <strong>中层逻辑检查</strong><br>" +
                        "   论点 → 论据 → 结论的连贯性。<br><br>" +
                        
                        "3. <strong>深层文化适配</strong><br>" +
                        "   是否符合日本教授的思维方式和价值观。<br><br>" +
                        
                        "💡 <strong>独家优势：</strong><br>" +
                        "• 100+成功案例模板库<br>" +
                        "• 日本Top20大学偏好分析数据库<br>" +
                        "• 学部vs大学院差异化策略<br><br>" +
                        
                        "🔄 <strong>修改流程：</strong><br>" +
                        "通常需要3-4轮深度修改，确保既有个人特色，又符合日本审阅标准。"
                    ],
                    suggestions: ["查看案例", "修改流程", "价格咨询", "立即预约"]
                },
                {
                    id: "contact",
                    keywords: ["联系", "微信", "联系方式", "怎么联系", "加微信", "咨询", "预约"],
                    responses: [
                        "📞 <strong>【联系秋武老师】</strong><br><br>" +
                        "💬 <strong>微信ID：</strong> qiuwu999<br><br>" +
                        
                        "📋 <strong>咨询时请说明：</strong><br>" +
                        "1. 出身校和专业背景<br>" +
                        "2. 日语/英语成绩<br>" +
                        "3. 目标学校和专业<br>" +
                        "4. 目前最困扰的具体问题<br><br>" +
                        
                        "🎯 <strong>沟通原则：</strong><br>" +
                        "• 不闲聊，只解决具体升学问题<br>" +
                        "• 不画饼，只提供可行方案<br>" +
                        "• 不套路，所有建议透明直接<br><br>" +
                        
                        "⏰ <strong>响应时间：</strong><br>" +
                        "工作时间内通常在2小时内回复。"
                    ],
                    suggestions: ["辅导特色", "成功案例", "费用说明", "返回主菜单"]
                }
            ],
            fallback: {
                responses: [
                    "🤖 <strong>【逻辑未命中】</strong><br><br>" +
                    "抱歉，我的数据库没有完全匹配的答案。<br><br>" +
                    
                    "💡 <strong>您可以尝试：</strong><br>" +
                    "• 使用更具体的关键词提问<br>" +
                    "• 点击下方标签快速跳转<br>" +
                    "• 查看『帮助』了解我能回答的问题类型<br><br>" +
                    
                    "🔍 <strong>热门问题方向：</strong><br>" +
                    "1. 辅导特色与优势<br>" +
                    "2. 日语口语训练<br>" +
                    "3. 费用与商业模式<br>" +
                    "4. 理科面试逻辑<br>" +
                    "5. 文书修改服务"
                ],
                suggestions: ["辅导特色", "日语口语", "费用模式", "理科面试", "文书指导", "帮助"]
            }
        };
    }
    
    // ==================== 事件绑定 ====================
    bindEvents() {
        // 发送消息
        this.elements.sendBtn.addEventListener('click', () => this.handleUserInput());
        
        // 回车发送
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserInput();
            }
        });
        
        // 清除对话
        this.elements.resetBtn.addEventListener('click', () => this.resetConversation());
        
        // 帮助系统
        this.elements.input.addEventListener('focus', () => {
            if (this.state.consecutiveMisses >= 2) {
                this.showHelp();
            }
        });
        
        // 关闭帮助
