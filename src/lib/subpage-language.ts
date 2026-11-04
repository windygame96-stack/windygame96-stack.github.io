import { translate, type Language } from './language';
import { subpageEnglish } from './subpage-English';
declare global { interface Window { WendiProductLocale?: { translate: (value: string) => string } } }

export function currentLanguage(): Language {
  const query = new URLSearchParams(window.location.search).get('lang');
  if (query === 'en' || query === 'zh') return query;
  try { const saved = localStorage.getItem('wendi-language'); if (saved === 'en' || saved === 'zh') return saved; } catch {}
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

export function tr<T>(value: T): T {
  if (typeof value !== 'string' || currentLanguage() !== 'en') return value;
  if (window.WendiProductLocale) return window.WendiProductLocale.translate(value) as T;
  if (subpageEnglish[value]) return subpageEnglish[value] as T;
  const progress = value.match(/^已完成 (\d+) \/ 10$/);
  if (progress) return `Completed ${progress[1]} / 10` as T;
  const ago = value.match(/^(\d+) (分钟|小时|天)前$/);
  if (ago) return `${ago[1]} ${ago[2] === '分钟' ? 'min' : ago[2] === '小时' ? 'hr' : 'day'} ago` as T;
  const home = translate(value, 'en');
  if (home !== value) return home as T;
  return value;
}
