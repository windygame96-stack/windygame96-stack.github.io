import { useEffect } from "react";
import Home from "@/pages/Home";

const PROJECT_PATHS = ["super-broccoli", "lure_for_fitness", "hub111", "ELEV-9", "zique-word-mahjong"];

export default function App() {
  useEffect(() => {
    const project = PROJECT_PATHS.find((name) => window.location.pathname.startsWith(`/${name}`));
    if (project) {
      const suffix = window.location.pathname.replace(`/${project}`, "");
      window.location.replace(`https://windygame96-stack.github.io/${project}${suffix}${window.location.search}${window.location.hash}`);
    }
  }, []);

  return <Home />;
}
