// Static entry gate: a casual-access barrier, not server authentication.
export const PASSCODE_DIGEST='625df624f8d7ccd747b0fb7a42105b74b05c7fa0b4db35a39acba0769e86b5e1';
export async function verifyPasscode(value,subtle=globalThis.crypto?.subtle){
 if(typeof value!=='string'||!/^\d{4}$/.test(value))return false;
 if(!subtle)throw Error('当前浏览器无法验证口令，请使用HTTPS或本机预览。');
 const digest=await subtle.digest('SHA-256',new TextEncoder().encode(value));
 const hex=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
 return hex===PASSCODE_DIGEST;
}
