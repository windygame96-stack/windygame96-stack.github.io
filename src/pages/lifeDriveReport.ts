import type { Content, DriveKey, DriveReport } from './lifeDriveTypes';
import { rankAnswers } from './lifeDriveScoring.mjs';
export type ReportBlock={kind:'h1'|'h2'|'h3'|'p'|'quote'|'small';text:string;href?:string};
export type ReportDocument={title:string;blocks:ReportBlock[]};
export function createReportDocument(answers:DriveKey[],content:Content,report:DriveReport):ReportDocument{
 const rank=rankAnswers(answers),names=(ks:DriveKey[])=>ks.map(k=>content.drives[k].name).join('＋');
 const blocks:ReportBlock[]=[];const add=(kind:ReportBlock['kind'],text:string,href?:string)=>blocks.push({kind,text,href});
 add('small','生活动力图鉴 · 真实作答 10 / 10');add('h1',report.combination);add('quote',report.subtitle);
 add('p',`本次${rank.primary.length>1?'并列主动力':'主动力'}：${names(rank.primary)}。${rank.secondary.length?`次高计数：${names(rank.secondary)}。`:'没有其他非零项，不补造第二种动力。'}`);
 add('p',Object.entries(rank.counts).map(([k,n])=>`${content.drives[k as DriveKey].name} ${n}次`).join(' · '));
 if(rank.mode==='multiple')add('small',`本次有${rank.pairs.length}个相关组合，当前查看的是${report.combination}，其他并列结果仍然保留。`);
 add('small','次数是这10道情境题中的相对选择，不代表能力、满足程度或人群排名。以下建议供你结合真实经历核对，未经心理或职业效果验证。');
 add('p',report.intro);add('quote',report.tension);
 add('h2','01 / 什么会充电');add('small','充电指做完更有满足感、愿意再做，不意味着身体不累，也不要求用产出来代替休息。');
 for(const c of report.charge){add('h3',c.title);add('p',c.scene);add('p','为什么与这组需要有关 · '+c.why);add('small','做完留意 · '+c.check);}
 add('h2','02 / 什么会耗电');
 for(const c of report.drain){add('h3',c.title);add('p',c.scene);add('p','可能消耗在哪里 · '+c.why);add('small','可以先调整 · '+c.check);}
 add('h2','03 / 值得探索的工作');add('small','匹配的是任务和工作条件；技能、经验、生活责任与当地要求仍需另行核对，不据此排除其他工作。');
 for(const j of report.jobs){add('h3',j.title);add('p','主要做什么 · '+j.task);add('p','相合的条件 · '+j.fit);add('p','耗电的版本 · '+j.trap);add('p','先体验一小段 · '+j.try);add('small','现实条件 · '+j.requirement);const source=content.sources[j.source];if(source)add('small','职业任务参考 · '+source[0],source[1]);}
 add('h2','04 / 困境里怎么想');
 for(const c of report.dilemmas){add('h3',c.title);add('p','先这样想 · '+c.thought);add('p','接下来可以做 · '+c.move);add('quote',c.question);}
 add('p',report.closing);add('h2','05 / 你的作答依据');
 answers.forEach((key,i)=>{add('h3',`第${i+1}题 · ${content.drives[key].name}`);add('p',content.questions[i].title);add('small','你的选择 · '+content.questions[i].options[key]);});
 const recovery=answers[8];add('h3','疲惫时，你选了什么');add('p',`第9题你选择“${content.questions[8].options[recovery]}”，对应${content.drives[recovery].name}。它反映该情境里的选择，不能单凭总计数推断你最近缺什么；生活中的满足与身体休息也需要分别照顾。`);
 if(answers[6]!==answers[9]){add('h3','一个值得对照的不同选择');add('p',`第7题愿意承担的代价对应${content.drives[answers[6]].name}；第10题无人评价时的选择对应${content.drives[answers[9]].name}。可以回想它们各自的情境，不必把差异解释为矛盾。`);}
 add('small',`题库版本 ${content.assessmentVersion} · 报告版本 ${content.reportVersion}。本报告仅用于自我探索，不用于诊断、能力评定或重大决定。职业来源仅参考工作任务，不推断本地市场机会。`);
 return{title:report.combination,blocks};
}
