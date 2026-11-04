import type { ReportDocument } from './lifeDriveReport';
export type ReportImage={url:string;filename:string;width:number;height:number};
// Draw the same report text as the visible report. No DOM screenshot, remote fonts or image service.
export async function createReportImages(doc:ReportDocument):Promise<ReportImage[]>{
 await document.fonts.ready;
 const WIDTH=960,HEIGHT=5400,PAD=60,BOTTOM=110;
 const measure=document.createElement('canvas').getContext('2d');if(!measure)throw Error('当前浏览器无法生成图片，可使用打印保存。');
 type Line={text:string;y:number;size:number;color:string;weight:number};
 const pages:Line[][]=[[]];let page=0,y=90;
 const font=(size:number,weight:number)=>`${weight} ${size}px "PingFang SC","Microsoft YaHei",sans-serif`;
 const newPage=()=>{page++;pages.push([]);y=100;};
 function wrap(text:string,size:number,weight:number){measure!.font=font(size,weight);const lines:string[]=[];let line='';for(const char of Array.from(text)){if(char==='\n'){lines.push(line);line='';continue;}if(line&&measure!.measureText(line+char).width>WIDTH-2*PAD){lines.push(line);line=char;}else line+=char;}if(line)lines.push(line);return lines;}
 for(const block of doc.blocks){
  const size=block.kind==='h1'?48:block.kind==='h2'?35:block.kind==='h3'?29:block.kind==='small'?22:block.kind==='quote'?29:26;
  const weight=/^h/.test(block.kind)?600:400,color=block.kind==='small'?'#79716b':block.kind==='quote'?'#a66d7c':'#342e2b';
  const height=Math.ceil(size*1.75),before=block.kind==='h2'?45:block.kind==='h3'?24:8,after=block.kind==='h2'?12:16;
  const lines=wrap(block.text,size,weight);
  // Keep a heading with at least two following body lines, but split long paragraphs safely.
  if(y+before+height*Math.min(lines.length,3)+(/^h/.test(block.kind)?90:0)>HEIGHT-BOTTOM)newPage();
  y+=before;
  for(const text of lines){if(y+height>HEIGHT-BOTTOM)newPage();pages[page].push({text,y,size,color,weight});y+=height;}
  y+=after;
 }
 const result:ReportImage[]=[];
 try{for(let i=0;i<pages.length;i++){
  const canvas=document.createElement('canvas');canvas.width=WIDTH;canvas.height=i===pages.length-1?Math.max(700,Math.min(HEIGHT,y+BOTTOM)):HEIGHT;
  const ctx=canvas.getContext('2d');if(!ctx)throw Error('图片生成失败，请重试。');
  ctx.fillStyle='#faf7f2';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.textBaseline='top';
  ctx.fillStyle='#a66d7c';ctx.fillRect(PAD,45,WIDTH-2*PAD,2);
  for(const line of pages[i]){ctx.font=font(line.size,line.weight);ctx.fillStyle=line.color;ctx.fillText(line.text,PAD,line.y);}
  ctx.font=font(20,400);ctx.fillStyle='#79716b';ctx.fillText(`生活动力图鉴 · ${doc.title} · ${i+1} / ${pages.length}`,PAD,canvas.height-65);
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('浏览器未能生成图片，请重试。')),'image/png'));
  result.push({url:URL.createObjectURL(blob),filename:`生活动力图鉴-${doc.title.replace(/\s/g,'')}-${String(i+1).padStart(2,'0')}.png`,width:canvas.width,height:canvas.height});canvas.width=0;canvas.height=0;
 }}catch(error){result.forEach(i=>URL.revokeObjectURL(i.url));throw error;}
 return result;
}
