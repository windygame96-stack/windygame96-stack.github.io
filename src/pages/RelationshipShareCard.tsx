import { useEffect, useRef, useState } from "react";
import { cardSections, pocketCardSections, type RelationshipCard } from "./relationshipCardModel";
import { renderRelationshipCard } from "./relationshipCardImage";

export default function RelationshipShareCard({ card, label }: { card: RelationshipCard; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState("");
  const alive = useRef(true);
  const urls = useRef<string[]>([]);
  const filename = `${label ? label + '-' : ''}相处速记卡-${card.title}.png`;
  useEffect(() => { alive.current = true; return () => { alive.current = false; urls.current.forEach((url) => URL.revokeObjectURL(url)); }; }, []);
  async function download() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const { blob } = await renderRelationshipCard(card);
      if (!alive.current) return;
      const url = URL.createObjectURL(blob); urls.current.push(url); setImage(url);
      const link = document.createElement("a"); link.href = url; link.download = filename;
      document.body.appendChild(link); link.click(); link.remove();
    } catch (e) { if (alive.current) setError(e instanceof Error ? e.message : "图片生成失败，请稍后重试。"); }
    finally { if (alive.current) setBusy(false); }
  }
  return <>
    <div className="rc-download-bar"><button className="rf-primary" onClick={download} disabled={busy}>{busy ? "正在生成图片…" : `下载${label ? label + ' 的' : ''}速记卡，发给另一半 ↓`}</button><p>图片只留称号、日常关心、闹别扭和避雷。详细解读留在网页。</p><details className="rc-pocket-preview"><summary>预览精简图片内容</summary><h3>{card.title}</h3>{pocketCardSections(card).map((section) => <section key={section.title}><strong>{section.title}</strong><ul>{section.items.map((item) => <li key={item.id}>{item.text}</li>)}</ul></section>)}</details></div>
    {error && <p role="alert" className="rc-error">{error}</p>}
    {image && <div className="rc-download-fallback" role="status"><p>图片已生成。若没有自动下载，可展开图片长按保存。</p><details><summary>展开保存图片</summary><a href={image} download={filename}>点这里保存 PNG</a><img src={image} alt={`${card.title}的相处说明卡，来自当前选择`} /></details></div>}
    <article className="rc-card" data-report-signature={card.signature}>
      <header className="rc-card-head"><p>给想对我好的人{label ? ` · ${label}` : ""}</p><span className="rc-stamp" aria-hidden="true">♡</span><small>我的相处说明书</small><h2>{card.title}</h2><p className="rc-subtitle">{card.subtitle}</p></header>
      {cardSections(card).map((section) => <section className="rc-card-section" key={section.title}><h3>{section.title}</h3>{section.items.map((item) => <div className="rc-card-tip" key={item.id}><small>{item.label}</small><p>{item.text}</p></div>)}</section>)}
      <section className="rc-card-quote"><h3>这句话，我会更接得住</h3><p>“{card.quote}”</p></section>
      <footer className="rc-card-footer">{card.missing.length > 0 && <p>没回答的 {card.missing.length} 项，请直接问我，别靠猜。</p>}<p>这是我当前的偏好，也想听听你的需要。</p><small>根据本次 {card.coverage}/12 题整理 · 相处昵称不代表固定人格</small></footer>
    </article>
    <button className="rc-bottom-download" onClick={download} disabled={busy}>{busy ? "正在生成…" : "下载精简速记卡 ↓"}</button>
  </>;
}
