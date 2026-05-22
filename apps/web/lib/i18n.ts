export const locales = ["en-US", "zh-CN"] as const;
export const languages = ["ko", "en", "zh"] as const;

export type Locale = (typeof locales)[number];
export type AppLanguage = (typeof languages)[number];

export const defaultLocale: Locale = "en-US";

export function parseLocale(value: string | undefined | null): Locale {
  return value === "zh-CN" ? "zh-CN" : defaultLocale;
}

export const languageLabels: Record<Locale, Record<AppLanguage, string>> = {
  "en-US": {
    ko: "Korean",
    en: "English",
    zh: "Chinese"
  },
  "zh-CN": {
    ko: "韩语",
    en: "英语",
    zh: "中文"
  }
};

export const levelLabels = {
  "en-US": {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced"
  },
  "zh-CN": {
    beginner: "初级",
    intermediate: "中级",
    advanced: "高级"
  }
} as const;

export const copy = {
  "en-US": {
    localeName: "English",
    navLabel: "App navigation",
    nav: {
      dashboard: "Dashboard",
      practice: "Practice",
      vocab: "Vocab",
      review: "Review",
      settings: "Settings"
    },
    landing: {
      eyebrow: "AI speaking practice",
      body: "Talk, get gentle corrections, save the words that slowed you down, and review them on a spaced schedule.",
      cta: "Start speaking",
      cards: ["Low-pressure conversation", "Personal vocabulary", "Spaced review"],
      cardBody: "Free-talk mode keeps Phase 1 focused on the speaking loop."
    },
    register: {
      title: "Create your account",
      displayName: "Display name",
      email: "Email",
      password: "Password",
      nativeLanguage: "Native language",
      passwordHelp: "Use at least 8 characters.",
      duplicateEmail: "This email is already registered. Sign in or use another email.",
      submit: "Create account"
    },
    onboarding: {
      title: "Set your speaking loop",
      targetLanguage: "Target language",
      level: "Level",
      goal: "Goal",
      defaultGoal: "Everyday conversation",
      submit: "Continue"
    },
    practice: {
      title: "Practice",
      body: "Free-talk is enabled for the Phase-1 MVP.",
      targetLanguage: "Target language",
      mode: "Mode",
      freeTalk: "Free talk",
      scenarioLocked: "Scenario Locked",
      pronunciationLocked: "Pronunciation Locked",
      speed: "Speed",
      submit: "Start session"
    }
  },
  "zh-CN": {
    localeName: "中文",
    navLabel: "应用导航",
    nav: {
      dashboard: "首页",
      practice: "练习",
      vocab: "生词",
      review: "复习",
      settings: "设置"
    },
    landing: {
      eyebrow: "AI 口语练习",
      body: "开口练习，获得温和纠错，保存卡住你的词，并按间隔复习。",
      cta: "开始练习",
      cards: ["低压力对话", "个人生词本", "间隔复习"],
      cardBody: "自由对话模式让第一阶段专注于完整的口语循环。"
    },
    register: {
      title: "创建账号",
      displayName: "显示名称",
      email: "邮箱",
      password: "密码",
      nativeLanguage: "母语",
      passwordHelp: "至少使用 8 个字符。",
      duplicateEmail: "这个邮箱已经注册过，请直接登录或换一个邮箱。",
      submit: "创建账号"
    },
    onboarding: {
      title: "设置你的口语循环",
      targetLanguage: "目标语言",
      level: "水平",
      goal: "目标",
      defaultGoal: "日常会话",
      submit: "继续"
    },
    practice: {
      title: "练习",
      body: "第一阶段已启用自由对话模式。",
      targetLanguage: "目标语言",
      mode: "模式",
      freeTalk: "自由对话",
      scenarioLocked: "情景模式 锁定",
      pronunciationLocked: "发音训练 锁定",
      speed: "语速",
      submit: "开始会话"
    }
  }
} as const;
