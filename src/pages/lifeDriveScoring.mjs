export const keys = Object.freeze(['A','B','C','D','E','F','G','H']);
// Same raw counts and exact ties as the original 10-question test.
export function rankAnswers(answers) {
  if (!Array.isArray(answers) || answers.length !== 10 || Array.from(answers).some(k => !keys.includes(k))) throw new Error('请先完整回答10道题。');
  const counts = Object.fromEntries(keys.map(k=>[k,0]));
  for (const key of answers) counts[key]++;
  const levels=[...new Set(Object.values(counts))].sort((a,b)=>b-a);
  const primary=keys.filter(k=>counts[k]===levels[0]);
  const secondary=levels[1]>0 ? keys.filter(k=>counts[k]===levels[1]) : [];
  const pairs=[];
  if(primary.length>1){for(let i=0;i<primary.length;i++)for(let j=i+1;j<primary.length;j++)pairs.push([primary[i],primary[j]].sort().join(''));}
  else for(const key of secondary)pairs.push([primary[0],key].sort().join(''));
  return {counts,primary,secondary,pairs,mode:pairs.length===0?'single':pairs.length===1?'pair':'multiple'};
}
