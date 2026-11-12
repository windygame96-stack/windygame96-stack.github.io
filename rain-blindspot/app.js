const game = document.querySelector('#game');
const detective = PEOPLE.xu;
const castList = document.querySelector('#cast-list');
castList.innerHTML = Object.values(PEOPLE).map(person => `
  <li><img src="portraits/${person.portrait}" alt="" loading="lazy"><div><strong>${person.name}${person === detective ? '（你）' : ''}</strong><span>${person.role}</span></div></li>`).join('');
const saveKey = 'rain-blindspot-story-v3';
const newGame = () => ({ scene: 0, beat: 0, choice: null, ended: false });
let progress = loadProgress();
let playing = false;

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(saveKey));
    const scene = STORY[saved?.scene];
    if (!scene?.beats[saved.beat]) return null;
    const options = scene.beats[saved.beat].choices;
    if (saved.choice !== null && !options?.[saved.choice]) return null;
    return saved;
  } catch { return null; }
}

function save() {
  try { localStorage.setItem(saveKey, JSON.stringify(progress)); } catch {}
}

function start(restart = false) {
  if (!progress || restart) progress = newGame();
  playing = true;
  save();
  render(true);
}

function advance() {
  const beats = STORY[progress.scene].beats;
  if (progress.beat < beats.length - 1) progress.beat++;
  else if (progress.scene < STORY.length - 1) {
    progress.scene++;
    progress.beat = 0;
  } else progress.ended = true;
  progress.choice = null;
  save();
  render(true);
}

function choose(index) {
  progress.choice = index;
  save();
  render(true);
}

function portrait(person) {
  return `<figure class="portrait"><img src="portraits/${person.portrait}" alt="${person.name}的立绘"><figcaption><strong>${person.name}${person === detective ? "（你）" : ""}</strong><span class="identity">${person.role}</span></figcaption></figure>`;
}

function render(focus = false) {
  if (!playing) {
    game.innerHTML = `<section class="cover">
      <div><h1>雨夜盲区</h1><div class="player-intro"><img src="portraits/xu-police.webp" alt=""><div><strong>你是韩岚</strong><span>刑警队长</span></div></div><p>一场雨，三个人在等同一个人。</p><p class="muted">你接到报案，赶到便利店。先问问老板，她在巷子里看见了什么。</p>
      <button type="button" data-action="start">${progress ? '继续故事' : '开始故事'} <span aria-hidden="true">→</span></button>
      ${progress ? '<button class="quiet" type="button" data-action="restart">从头开始</button>' : ''}</div>
    </section>`;
    return;
  }
  if (progress.ended) {
    game.innerHTML = `<section class="cover"><div><p class="chapter">故事结束</p><h1 tabindex="-1">雨停之后</h1><p>白川町案卷已结。</p><button type="button" data-action="restart">重读故事</button><a class="back" href="/#games">返回游戏区</a></div></section>`;
    if (focus) game.querySelector('h1').focus();
    return;
  }
  const scene = STORY[progress.scene];
  const beat = scene.beats[progress.beat];
  const isChoice = Boolean(beat.choices);
  const speaker = !isChoice && beat[0] ? PEOPLE[beat[0]] : null;
  const chosen = isChoice && progress.choice !== null ? beat.choices[progress.choice] : null;
  const text = isChoice ? chosen?.[1] || beat.prompt : beat[1];
  const actions = isChoice && !chosen
    ? beat.choices.map(([label], i) => `<button type="button" data-action="choice" data-index="${i}">${label}</button>`).join('')
    : chosen?.[2] === false
      ? '<button type="button" data-action="retry">再想一想</button>'
      : '<button type="button" data-action="next">继续 <span aria-hidden="true">→</span></button>';
  game.innerHTML = `<section class="scene">
    <div class="chapter">第 ${progress.scene + 1} / ${STORY.length} 幕 <span>${scene.title}</span><small>${scene.location}</small></div>
    <div class="stage">${portrait(speaker || PEOPLE[scene.portrait])}</div>
    <div class="dialogue"><div class="speaker">${speaker === detective ? '你 · 韩岚' : speaker?.name || (isChoice ? (chosen ? '回应' : '你要怎么选') : '旁白')}</div>
    <p tabindex="-1" class="line">${text}</p>
    <div class="actions">${actions}</div></div>
  </section>`;
  if (focus) game.querySelector('.line').focus({ preventScroll: true });
}

game.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  switch (button.dataset.action) {
    case 'start': start(); break;
    case 'restart': start(true); break;
    case 'next': advance(); break;
    case 'choice': choose(Number(button.dataset.index)); break;
    case 'retry': progress.choice = null; save(); render(true); break;
  }
});
render();
