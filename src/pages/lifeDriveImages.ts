import type { DriveReport } from './lifeDriveTypes';
export type ReportImage={url:string;filename:string;width:number;height:number};
// A deliberately concise keepsake, separate from the full on-screen evidence report.
// Every line is measured before drawing; one adaptive-height image, no text clipping.
export async function createReportImages(report:DriveReport,hasTies=false):Promise<ReportImage[]>{
 await document.fonts.ready;
 const W=1080,P=64,INNER=W-P*2,GAP=24,COL=(INNER-GAP)/2;
 const canvas=document.createElement('canvas'),measure=canvas.getContext('2d');
 if(!measure)throw Error('当前浏览器无法生成图片，请换一个浏览器重试。');
 const ink='#352f31',muted='#786f70',rose='#986476',green='#486c61';
 const font=(size:number,weight=400)=>`${weight} ${size}px "PingFang SC","Microsoft YaHei",sans-serif`;
 type Draw=(ctx:CanvasRenderingContext2D)=>void;const draws:Draw[]=[];
 function text(value:string,x:number,y:number,width:number,size=26,color=ink,weight=400,leading=1.65){
  measure!.font=font(size,weight);const lines:string[]=[];let line='';
  for(const ch of (value.match(/[^，。！？；：、）》」』】…,.!?;:]?[，。！？；：、）》」』】…,.!?;:]*|./gu)||[]).filter(Boolean)){if(ch==='\n'){lines.push(line);line='';}else if(line&&measure!.measureText(line+ch).width>width){lines.push(line);line=ch;}else line+=ch;}if(line)lines.push(line);
  draws.push(ctx=>{ctx.fillStyle=color;ctx.font=font(size,weight);lines.forEach((s,i)=>ctx.fillText(s,x,y+i*size*leading));});
  return lines.length*size*leading;
 }
 function rect(x:number,y:number,w:number,h:number,color:string,r=22){draws.push(ctx=>{ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();});}
 function rule(y:number){rect(P,y,INNER,1,'#ded5ce',0);}
 let y=60;
 text('WENDI’S LAB  /  生活动力图鉴',P,y,INNER,22,muted,500);y+=72;
 text('你的动力使用说明',P,y,INNER,26,rose,500);y+=52;
 y+=text(report.combination,P,y,INNER,64,ink,600,1.3)+22;
 y+=text(report.subtitle,P,y,INNER,30,rose,400,1.6)+30;
 y+=text(report.tension,P,y,INNER,25,muted)+32;
 if(hasTies)y+=text('本次存在并列动力 · 这是你选择查看的一组',P,y,INNER,22,muted)+16;
 rule(y);y+=42;
 const top=y;
 text('01  为你充电',P,top,COL,32,green,600);
 text('02  持续耗电',P+COL+GAP,top,COL,32,rose,600);
 y=top+64;
 for(let i=0;i<Math.min(3,Math.max(report.charge.length,report.drain.length));i++){
  let maxHeight=0;
  // Card backgrounds must precede their text in the draw queue.
  const placeholder=draws.length;draws.push(()=>{});
  [report.charge[i],report.drain[i]].forEach((item,col)=>{if(!item)return;const x=P+col*(COL+GAP)+26;let cy=y+28;
   cy+=text(item.title,x,cy,COL-52,27,col?rose:green,600,1.5)+14;
   cy+=text(item.scene,x,cy,COL-52,25,ink,400,1.65);
   maxHeight=Math.max(maxHeight,cy-y+28);
  });
  const cardY=y,cardH=maxHeight;
  draws[placeholder]=ctx=>{['#edf2ec','#f5eae9'].forEach((fill,col)=>{ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(P+col*(COL+GAP),cardY,COL,cardH,20);ctx.fill();});};
  y+=maxHeight+18;
 }
 y+=28;
 text('03  值得探索的工作',P,y,INNER,32,ink,600);y+=62;
 for(const [i,job] of report.jobs.slice(0,3).entries()){
  const start=y;rect(P,y+4,46,40,'#ece5df',12);text(String(i+1).padStart(2,'0'),P+9,y+9,40,21,rose,600);
  y+=text(job.title,P+66,y,INNER-66,29,ink,600,1.5)+12;
  y+=text(job.task,P+66,y,INNER-66,25,ink)+8;
  y+=text(job.fit,P+66,y,INNER-66,24,muted)+24;
  if(y<=start)throw Error('无法排版报告');
  rule(y);y+=26;
 }
 y+=22;text('04  困境里，换个思路',P,y,INNER,32,ink,600);y+=64;
 for(const d of report.dilemmas.slice(0,3)){
  const barY=y;rect(P,barY,4,34,'#bc8d9c',2);
  y+=text(d.title,P+22,y,INNER-22,28,rose,600,1.5)+12;
  y+=text(d.thought,P+22,y,INNER-22,25,ink)+12;
  y+=text('试着做 · '+d.move,P+22,y,INNER-22,25,green)+32;
 }
 y+=8;rule(y);y+=32;
 y+=text(report.closing,P,y,INNER,28,rose,500)+26;
 y+=text('基于本次回答的探索建议，不代表能力或职业适配结论。\n完整解读与作答依据请回到网页查看。',P,y,INNER,21,muted)+30;
 text('escapefromhongye.xyz/life-drive',P,y,INNER,20,muted);y+=70;
 canvas.width=W;canvas.height=Math.ceil(y);
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('图片生成失败，请重试。');
 ctx.fillStyle='#fbf8f3';ctx.fillRect(0,0,W,canvas.height);ctx.textBaseline='top';
 draws.forEach(draw=>draw(ctx));
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('图片生成失败，请重试。')),'image/png'));
 const result={url:URL.createObjectURL(blob),filename:`生活动力图鉴-${report.combination.replace(/\s/g,'')}.png`,width:W,height:canvas.height};
 canvas.width=0;canvas.height=0;return[result];
}
