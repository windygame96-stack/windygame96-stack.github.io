import { cardSections, type RelationshipCard } from "./relationshipCardModel";

const WIDTH = 1080;
const FONT = '"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
type TextOp = { kind: "text"; text: string; x: number; y: number; size: number; weight: number; color: string };
type RectOp = { kind: "rect"; x: number; y: number; w: number; h: number; color: string; radius: number };
type Op = TextOp | RectOp;

export async function renderRelationshipCard(card: RelationshipCard): Promise<{ blob: Blob; width: number; height: number }> {
  if (!card.enough) throw new Error("回答还不够，先补几道题再下载。");
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("当前浏览器无法生成图片，可以先使用页面打印。");
  const ops: Op[] = [];
  const ink = "#392830", muted = "#77676d", rose = "#a74763";
  const margin = 64, inner = WIDTH - margin * 2;
  let y = 62;
  function text(value: string, x: number, top: number, width: number, size = 40, weight = 500, color = ink, lineHeight = Math.ceil(size * 1.48)) {
    ctx!.font = `${weight} ${size}px ${FONT}`;
    const lines: string[] = [];
    for (const paragraph of value.split("\n")) {
      let line = "";
      for (const char of paragraph) {
        if (line && ctx!.measureText(line + char).width > width) {
          let carry = "";
          if (/^[，。！？；：、）】》」』”’…,.!?;:)]$/u.test(char) || /[（【《「『“‘]$/u.test(line)) {
            const chars = Array.from(line); carry = chars.pop() || ""; line = chars.join("");
          }
          if (line) lines.push(line);
          line = carry + char;
        }
        else line += char;
      }
      lines.push(line);
    }
    lines.forEach((line, i) => ops.push({ kind: "text", text: line, x, y: top + i * lineHeight, size, weight, color }));
    return top + lines.length * lineHeight;
  }
  y = text(`给想对我好的人${["A", "B"].includes(card.owner) ? ` · ${card.owner}` : ""}`, margin, y, inner, 30, 700, rose) + 26;
  y = text("我的相处说明书", margin, y, inner, 40, 500, muted) + 20;
  y = text(card.title, margin, y, inner, 82, 800, ink, 103) + 26;
  y = text(card.subtitle, margin, y, inner, 42, 500, muted) + 36;

  for (const section of cardSections(card)) {
    const top = y;
    const box: RectOp = { kind: "rect", x: margin, y, w: inner, h: 0, color: "#ffffff", radius: 28 };
    ops.push(box);
    y += 30;
    y = text(section.title, margin + 32, y, inner - 64, 36, 800, rose) + 24;
    for (const item of section.items) {
      y = text(item.label, margin + 32, y, inner - 64, 28, 700, muted) + 8;
      y = text(item.text, margin + 32, y, inner - 64, 42, 500, ink, 60) + 26;
    }
    box.h = y - top + 4;
    y += 30;
  }
  const quoteTop = y;
  const quoteBox: RectOp = { kind: "rect", x: margin, y, w: inner, h: 0, color: "#49333e", radius: 28 };
  ops.push(quoteBox);
  y = text("这句话，我会更接得住", margin + 32, y + 30, inner - 64, 30, 700, "#f4bfd0") + 22;
  y = text(`“${card.quote}”`, margin + 32, y, inner - 64, 46, 600, "#ffffff", 66) + 30;
  quoteBox.h = y - quoteTop;
  y += 32;
  if (card.missing.length) y = text(`没回答的 ${card.missing.length} 项，请直接问我，别靠猜。`, margin, y, inner, 30, 500, muted) + 14;
  y = text("这是我当前的偏好，也想听听你的需要。", margin, y, inner, 32, 600, ink) + 12;
  y = text(`根据本次 ${card.coverage}/12 题整理 · 相处昵称不代表固定人格`, margin, y, inner, 27, 400, muted) + 12;
  y = text(`Relationship Fit · ${card.version}`, margin, y, inner, 24, 400, muted) + 46;
  const height = Math.ceil(y);
  if (height > 9000 || WIDTH * height > 12000000) throw new Error("这份图片太长，当前浏览器可能无法保存；请先用页面打印保留。");
  canvas.width = WIDTH; canvas.height = height;
  ctx.fillStyle = "#faeaf0"; ctx.fillRect(0, 0, WIDTH, height);
  ctx.textBaseline = "top";
  for (const op of ops) {
    ctx.fillStyle = op.color;
    if (op.kind === "rect") { ctx.beginPath(); ctx.roundRect(op.x, op.y, op.w, op.h, op.radius); ctx.fill(); }
    else { ctx.font = `${op.weight} ${op.size}px ${FONT}`; ctx.fillText(op.text, op.x, op.y); }
  }
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("图片没有生成成功，请重试或先使用页面打印。")), "image/png"));
  return { blob, width: WIDTH, height };
}
