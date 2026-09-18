const PROVIDERS = {
  zhipu: {
    label: "智谱 GLM",
    placeholder: "智谱开放平台 API Key",
    signupUrl: "https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys",
    signupText: "前往智谱官网申请 · 新用户有免费体验额度",
    guideSteps: ["注册或登录智谱开放平台", "进入 API Keys 页面并创建一个新 Key", "复制完整 Key，粘贴到上方输入框"],
  },
  moonshot: {
    label: "月之暗面 Kimi",
    placeholder: "Moonshot API Key",
    signupUrl: "https://platform.moonshot.cn/console/api-keys",
    signupText: "前往 Kimi 开放平台申请",
    guideSteps: ["注册或登录 Moonshot 开放平台", "在控制台的 API Key 管理中创建 Key", "复制 Key，粘贴到上方输入框"],
  },
  deepseek: {
    label: "DeepSeek",
    placeholder: "DeepSeek API Key",
    signupUrl: "https://platform.deepseek.com/api_keys",
    signupText: "前往 DeepSeek 官网申请 · 按量计费",
    guideSteps: ["注册或登录 DeepSeek 开放平台", "完成充值或确认账号仍有可用额度", "在 API Keys 页面创建并复制 Key"],
  },
  groq: {
    label: "Groq",
    placeholder: "Groq API Key",
    signupUrl: "https://console.groq.com/keys",
    signupText: "前往 Groq Console 申请",
    guideSteps: ["注册或登录 Groq Console", "打开 API Keys 页面并创建 Key", "复制 Key，粘贴到上方输入框"],
  },
};

// 与 Boss Translator 一致：Key 仅驻留当前页面的 JS 内存，不写入浏览器存储。
let selectedProvider = "zhipu";
const keys = { zhipu: "", moonshot: "", deepseek: "", groq: "" };

function selectProvider(provider) {
  if (!PROVIDERS[provider]) throw new Error("不支持的模型服务");
  selectedProvider = provider;
}

function setKey(provider, apiKey) {
  if (!PROVIDERS[provider]) throw new Error("不支持的模型服务");
  keys[provider] = String(apiKey || "").trim().slice(0, 1000);
}

function getConfig() {
  return {
    provider: selectedProvider,
    apiKey: keys[selectedProvider],
    providerInfo: PROVIDERS[selectedProvider],
    hasCustomKey: Boolean(keys[selectedProvider]),
  };
}

function getRequestBodyFields() {
  const { provider, apiKey, hasCustomKey } = getConfig();
  return hasCustomKey
    ? { _byokProvider: provider, _byokApiKey: apiKey }
    : {};
}

function clear() {
  Object.keys(keys).forEach((provider) => {
    keys[provider] = "";
  });
  selectedProvider = "zhipu";
}

export const AiConfig = {
  providers: PROVIDERS,
  selectProvider,
  setKey,
  getConfig,
  getRequestBodyFields,
  clear,
};
