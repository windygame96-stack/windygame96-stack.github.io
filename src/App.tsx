import { useEffect } from "react";
import { useLanguage } from "@/lib/language";
import Home from "@/pages/Home";
import SharedBlackCat from "@/pages/SharedBlackCat";
import RelationshipGate from "@/pages/RelationshipGate";
import LifeDrive from "@/pages/LifeDrive";
import TestsHub from "@/pages/TestsHub";

const PROJECT_PATHS = ["super-broccoli", "lure_for_fitness", "hub111", "ELEV-9", "zique-word-mahjong"];

export default function App() {
  const { language, setLanguage } = useLanguage(false);
  const languageControl = <button className="subpage-language" type="button" onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')} aria-label={language === 'zh' ? 'Switch to English' : '切换到中文'}>{language === 'zh' ? 'EN' : '中文'}</button>;
  const isBlackCat = window.location.pathname.startsWith("/shared-black-cat");
  const isRelationshipFit = window.location.pathname.startsWith("/relationship-fit");
  const isLifeDrive = window.location.pathname.startsWith("/life-drive");
  const isTestsHub = window.location.pathname.startsWith("/tests");
  useEffect(() => {
    const project = PROJECT_PATHS.find((name) => window.location.pathname.startsWith(`/${name}`));
    if (project) {
      const suffix = window.location.pathname.replace(`/${project}`, "");
      window.location.replace(`https://windygame96-stack.github.io/${project}${suffix}${window.location.search}${window.location.hash}`);
    }
  }, []);

  if (isBlackCat) return <>{languageControl}<SharedBlackCat /></>;
  if (isTestsHub) return <>{languageControl}<TestsHub /></>;
  if (isRelationshipFit) return <RelationshipGate />;
  if (isLifeDrive) return <LifeDrive />;
  return <Home />;
}
