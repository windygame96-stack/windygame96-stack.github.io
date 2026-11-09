import {PASSCODE_DIGEST,verifyPasscode} from './access.js';
const ACCESS_KEY='ai-career-entry-v1',ACCESS_TTL=12*60*60*1000;
const gate=document.querySelector('#access-gate'),protectedApp=document.querySelector('#protected-app'),form=document.querySelector('#access-form'),code=document.querySelector('#access-code'),error=document.querySelector('#access-error'),submit=document.querySelector('#access-submit');
let mounted=false;
async function unlock(){if(mounted)return;mounted=true;try{await import('./app.js?v=2.1.0-orange1');gate.hidden=true;protectedApp.hidden=false;window.scrollTo(0,0);document.querySelector('#app h1')?.focus();}catch{mounted=false;protectedApp.hidden=true;gate.hidden=false;error.textContent='页面加载失败，请刷新后重试。';}}
form.onsubmit=async event=>{event.preventDefault();submit.disabled=true;error.textContent='';try{if(await verifyPasscode(code.value)){code.value='';try{sessionStorage.setItem(ACCESS_KEY,JSON.stringify({digest:PASSCODE_DIGEST,expiresAt:Date.now()+ACCESS_TTL}));}catch{}await unlock();}else{error.textContent='口令不正确，请重新输入。';code.select();}}catch(err){error.textContent=err.message;}finally{submit.disabled=false;}};
document.querySelector('#lock-test').onclick=()=>{try{sessionStorage.removeItem(ACCESS_KEY);}catch{}location.reload();};
try{const access=JSON.parse(sessionStorage.getItem(ACCESS_KEY)||'null');if(access?.digest===PASSCODE_DIGEST&&access.expiresAt>Date.now())await unlock();else if(access)sessionStorage.removeItem(ACCESS_KEY);}catch{}

