import { useEffect } from "react";
import Home from "@/pages/Home";
import SharedBlackCat from "@/pages/SharedBlackCat";
import RelationshipFit from "@/pages/RelationshipFit";
import LifeDrive from "@/pages/LifeDrive";

const PROJECT_PATHS = ["super-broccoli", "lure_for_fitness", "hub111", "ELEV-9", "zique-word-mahjong"];

export default function App() {
  const isBlackCat = window.location.pathname.startsWith("/shared-black-cat");
  const isRelationshipFit = window.location.pathname.startsWith("/relationship-fit");
  const isLifeDrive = window.location.pathname.startsWith("/life-drive");
  useEffect(() => {
    const project = PROJECT_PATHS.find((name) => window.location.pathname.startsWith(`/${name}`));
    if (project) {
      const suffix = window.location.pathname.replace(`/${project}`, "");
      window.location.replace(`https://windygame96-stack.github.io/${project}${suffix}${window.location.search}${window.location.hash}`);
    }
  }, []);

  if (isBlackCat) return <SharedBlackCat />;
  if (isRelationshipFit) return <RelationshipFit />;
  if (isLifeDrive) return <LifeDrive />;
  return <Home />;
}
