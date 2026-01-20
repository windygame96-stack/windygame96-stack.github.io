import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Home from "@/pages/Home";

// 项目配置
const GITHUB_USERNAME = "windygame96-stack";
const PROJECT_1_NAME = "super-broccoli";
const PROJECT_2_NAME = "lure_for_fitness";
const PROJECT_3_NAME = "hub111";
const PROJECT_1_URL = `https://${GITHUB_USERNAME}.github.io/${PROJECT_1_NAME}`;
const PROJECT_2_URL = `https://${GITHUB_USERNAME}.github.io/${PROJECT_2_NAME}`;
const PROJECT_3_URL = `https://${GITHUB_USERNAME}.github.io/${PROJECT_3_NAME}`;

export default function App() {
  useEffect(() => {
    // 路径转发逻辑
    const path = window.location.pathname;
    
    if (path.startsWith(`/${PROJECT_1_NAME}`)) {
      window.location.href = PROJECT_1_URL + path.replace(`/${PROJECT_1_NAME}`, "");
    } else if (path.startsWith(`/${PROJECT_2_NAME}`)) {
      window.location.href = PROJECT_2_URL + path.replace(`/${PROJECT_2_NAME}`, "");
    } else if (path.startsWith(`/${PROJECT_3_NAME}`)) {
      window.location.href = PROJECT_3_URL + path.replace(`/${PROJECT_3_NAME}`, "");
    }
    // 访问域名根路径时显示主页，不需要特别处理
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
