import { pocketCardSections, POCKET_VERSION, type RelationshipCard } from "./relationshipCardModel";

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
  let y = 50;
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
  y = text(`我的相处速记卡${["A", "B"].includes(card.owner) ? ` · ${card.owner}` : ""}`, margin, y, inner, 30, 700, rose) + 20;
  y = text(card.title, margin, y, inner, 78, 800, ink, 96) + 28;

  for (const section of pocketCardSections(card)) {
    const top = y;
    const box: RectOp = { kind: "rect", x: margin, y, w: inner, h: 0, color: "#ffffff", radius: 28 };
    ops.push(box);
    y += 24;
    y = text(section.title, margin + 32, y, inner - 64, 36, 800, rose) + 14;
    for (const item of section.items) {
      y = text(`· ${item.text}`, margin + 32, y, inner - 64, 44, 500, ink, 62) + 14;
    }
    box.h = y - top + 4;
    y += 24;
  }
  y = text(`本次 ${card.coverage}/12 题的偏好，可随时再商量。`, margin, y + 2, inner, 27, 400, muted) + 6;
  y = text(`Relationship Fit · ${POCKET_VERSION}`, margin, y, inner, 23, 400, muted) + 30;
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
