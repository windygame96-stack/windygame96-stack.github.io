'use strict';
let routePickerAfter=null,prologueContext=null;
const routeScene=showStory;
showStory=function(day=state.day,review=false){
 if(day>=2&&!review&&!state.routeChosen&&Game.canChooseRoute(state)){showRoutePicker(()=>routeScene(day,review));return}
 routeScene(day,review);
};
function showRoutePicker(after=null){
 if(!Game.canChooseRoute(state)){toast('本周同行已确定，重开可以体验其他路线。');return}
 routePickerAfter=after;
 modal('第二夜起，你想与谁同行？',`<p class="small muted">第一天是共通序幕。第二夜起进入所选角色的独立剧情，读完第二夜后本周路线固定。商业协作不受影响，也不代表必须恋爱。</p><div class="route-picker">${GODS.map((g,i)=>`<button class="route-option" data-a="selectRoute" data-g="${i}"><img src="${IMG(i,true)}" alt="${g.name}" decoding="async"><b>${g.name}</b><small>${i===0?'守住钱袋，也听你说心里的难处。':Game.Routes[i].subtitle}</small><span>与他同行 →</span></button>`).join('')}</div>`);
}
function selectRoute(g,after=routePickerAfter){let r=perform('chooseRoute',{g});if(!r.ok)return;routePickerAfter=null;close();if(after)after()}
function finishPrologue(){let ctx=prologueContext;if(!ctx)return;prologueContext=null;ctx.onDone?.()}
const routeClose=close;close=function(){let ctx=prologueContext;prologueContext=null;routeClose();if(ctx)defer(()=>ctx.onDone?.())};
opening=function(onDone){
 clearTimeout(openingTimer);$('introDialog')?.close();
 prologueContext={preview:false,onDone};routeScene(1,false);
 $('vnLocation').textContent='序幕 · 第一天 · 财神庙今日招人';
 document.querySelector('.vn-toolbar [data-a="close"]').textContent='先去经营 →';
};
function replayPrologue(){
 let prior=state;if(!state)state=Game.fresh();
 prologueContext={preview:true,onDone:()=>{state=prior;render();drawGuide()}};
 routeScene(1,true);vn.preview=true;
 $('vnLocation').textContent='序幕回看 · 不改变当前进度';
}
const routeChooseStory=chooseStory;chooseStory=function(i){
 if(vn?.preview&&vn.atChoice&&!vn.record){let c=vn.chapter.choices[i];if(!c)return;vn.record={choice:i,response:c.response};vn.responded=true;vn.frames.push(line('你的决定',c.label),...replyFrames(vn,i));paintVN();return}
 routeChooseStory(i);
};
const routeTutorialNext=tutorialNext;tutorialNext=function(){
 let t=tutorialState();if(t?.step===9&&state.daily.story){t.status='done';persist();drawGuide();tab='temple';render();toast('序幕已完成。今天可继续经营，或直接结束今日，第二夜再选择同行者。');return}
 routeTutorialNext();
};
$('modal').addEventListener('close',()=>{if(!$('modal').open)finishPrologue()});
document.addEventListener('click',e=>{let b=e.target.closest('[data-a]');if(!b||b.disabled)return;let a=b.dataset.a;
 if(a==='routePicker'){e.preventDefault();e.stopImmediatePropagation();showRoutePicker();}
 if(a==='selectRoute'){e.preventDefault();e.stopImmediatePropagation();selectRoute(Number(b.dataset.g));}
 if(a==='pickRouteDirect'){e.preventDefault();e.stopImmediatePropagation();selectRoute(Number(b.dataset.g),null);}
},true);
render();
