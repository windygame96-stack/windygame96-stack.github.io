/* quiz.js — 三种题型（选择/填空/匹配）的渲染、作答交互与判分 */

export const QuizRunner = (() => {
  let state = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function start(questions) {
    state = {
      questions,
      index: 0,
      correctCount: 0,
      answered: false,
      matchState: null,
    };
  }

  function getIndex() {
    return state.index;
  }
  function getTotal() {
    return state.questions.length;
  }
  function isFinished() {
    return state.index >= state.questions.length;
  }
  function getScore() {
    return { correct: state.correctCount, total: state.questions.length };
  }

  function currentQuestion() {
    return state.questions[state.index];
  }

  function render(container) {
    state.answered = false;
    const q = currentQuestion();
    container.innerHTML = "";

    const stemEl = document.createElement("div");
    stemEl.className = "quiz-stem";
    stemEl.textContent = `${state.index + 1}. ${q.stem}`;
    container.appendChild(stemEl);

    if (q.type === "choice") {
      renderChoice(q, container);
    } else if (q.type === "blank") {
      renderBlank(q, container);
    } else if (q.type === "match") {
      renderMatch(q, container);
    }
  }

  function renderChoice(q, container) {
    const wrap = document.createElement("div");
    wrap.className = "quiz-options";
    q.options.forEach((opt, i) => {
      const label = document.createElement("label");
      label.className = "quiz-option";
      label.innerHTML = `<input type="radio" name="choice-opt" value="${i}"> <span>${escapeHtml(opt)}</span>`;
      wrap.appendChild(label);
    });
    container.appendChild(wrap);
  }

  function renderBlank(q, container) {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "quiz-blank-input";
    input.id = "blank-answer-input";
    input.placeholder = "请输入答案";
    container.appendChild(input);
  }

  function renderMatch(q, container) {
    const pairs = q.pairs;
    const shuffledDefs = shuffle(
      pairs.map((p, i) => ({ text: p.definition, origIndex: i })),
    );
    state.matchState = {
      pairing: {},
      selectedTerm: null,
      selectedRight: null,
      shuffledDefs,
    };

    const wrap = document.createElement("div");
    wrap.className = "match-wrap";

    const leftCol = document.createElement("div");
    leftCol.className = "match-col";
    pairs.forEach((p, i) => {
      const item = document.createElement("div");
      item.className = "match-item match-term";
      item.dataset.idx = i;
      item.textContent = p.term;
      item.addEventListener("click", () => onTermClick(i, wrap));
      leftCol.appendChild(item);
    });

    const rightCol = document.createElement("div");
    rightCol.className = "match-col";
    shuffledDefs.forEach((d, pos) => {
      const item = document.createElement("div");
      item.className = "match-item match-def";
      item.dataset.pos = pos;
      item.textContent = d.text;
      item.addEventListener("click", () => onDefClick(pos, wrap));
      rightCol.appendChild(item);
    });

    wrap.appendChild(leftCol);
    wrap.appendChild(rightCol);
    container.appendChild(wrap);

    const hint = document.createElement("p");
    hint.className = "match-hint";
    hint.textContent =
      "点击左侧术语，再点击右侧对应释义完成配对，可重复点击重新配对";
    container.appendChild(hint);
  }

  function onTermClick(idx, wrap) {
    const ms = state.matchState;
    ms.selectedTerm = idx;
    wrap
      .querySelectorAll(".match-term")
      .forEach((el) => el.classList.remove("selected"));
    wrap
      .querySelector(`.match-term[data-idx="${idx}"]`)
      .classList.add("selected");
  }

  function onDefClick(pos, wrap) {
    const ms = state.matchState;
    if (ms.selectedTerm === null) return;
    // 移除该 term 之前的配对
    Object.keys(ms.pairing).forEach((k) => {
      if (ms.pairing[k] === pos) delete ms.pairing[k];
    });
    ms.pairing[ms.selectedTerm] = pos;

    wrap
      .querySelectorAll(".match-term")
      .forEach((el) => el.classList.remove("selected"));
    wrap
      .querySelectorAll(".match-item")
      .forEach((el) => el.classList.remove("paired"));
    Object.keys(ms.pairing).forEach((termIdx) => {
      wrap
        .querySelector(`.match-term[data-idx="${termIdx}"]`)
        .classList.add("paired");
      wrap
        .querySelector(`.match-def[data-pos="${ms.pairing[termIdx]}"]`)
        .classList.add("paired");
    });
    ms.selectedTerm = null;
  }

  // 判分：返回 {correct: bool}
  function grade(container) {
    const q = currentQuestion();
    let correct = false;

    if (q.type === "choice") {
      const checked = container.querySelector(
        'input[name="choice-opt"]:checked',
      );
      if (checked) {
        const chosen = q.options[Number(checked.value)];
        correct = chosen === q.answer;
        markChoiceResult(container, q, Number(checked.value));
      }
    } else if (q.type === "blank") {
      const input = document.getElementById("blank-answer-input");
      const val = (input.value || "").trim().toLowerCase();
      correct = val === q.answer.trim().toLowerCase();
      input.classList.add(correct ? "correct" : "incorrect");
      input.disabled = true;
      if (!correct) {
        const hint = document.createElement("div");
        hint.className = "answer-hint";
        hint.textContent = `正确答案：${q.answer}`;
        container.appendChild(hint);
      }
    } else if (q.type === "match") {
      const ms = state.matchState;
      const total = q.pairs.length;
      let rightCount = 0;
      q.pairs.forEach((p, termIdx) => {
        const pos = ms.pairing[termIdx];
        const isRight =
          pos !== undefined && ms.shuffledDefs[pos].origIndex === termIdx;
        if (isRight) rightCount++;
        const termEl = container.querySelector(
          `.match-term[data-idx="${termIdx}"]`,
        );
        if (termEl) termEl.classList.add(isRight ? "correct" : "incorrect");
      });
      correct = rightCount === total;
      container
        .querySelectorAll(".match-item")
        .forEach((el) => (el.style.pointerEvents = "none"));
    }

    state.answered = true;
    if (correct) state.correctCount += 1;
    return { correct };
  }

  function markChoiceResult(container, q, chosenIdx) {
    const labels = container.querySelectorAll(".quiz-option");
    labels.forEach((label, i) => {
      label.querySelector("input").disabled = true;
      if (q.options[i] === q.answer) label.classList.add("correct");
      else if (i === chosenIdx) label.classList.add("incorrect");
    });
  }

  function hasAnswerSelected(container) {
    const q = currentQuestion();
    if (q.type === "choice")
      return !!container.querySelector('input[name="choice-opt"]:checked');
    if (q.type === "blank")
      return !!(document.getElementById("blank-answer-input") || {}).value;
    if (q.type === "match")
      return Object.keys(state.matchState.pairing).length === q.pairs.length;
    return false;
  }

  // 返回用户当次作答的可读文本，用于错题本展示
  function getUserAnswerText(container) {
    const q = currentQuestion();
    if (q.type === "choice") {
      const checked = container.querySelector(
        'input[name="choice-opt"]:checked',
      );
      return checked ? q.options[Number(checked.value)] : "（未作答）";
    }
    if (q.type === "blank") {
      const input = document.getElementById("blank-answer-input");
      return input && input.value ? input.value : "（未作答）";
    }
    if (q.type === "match") {
      const ms = state.matchState;
      return q.pairs
        .map((p, i) => {
          const pos = ms.pairing[i];
          const def =
            pos !== undefined ? ms.shuffledDefs[pos].text : "（未配对）";
          return `${p.term} → ${def}`;
        })
        .join("；");
    }
    return "";
  }

  function next() {
    state.index += 1;
  }

  return {
    start,
    render,
    grade,
    next,
    getIndex,
    getTotal,
    isFinished,
    getScore,
    hasAnswerSelected,
    currentQuestion,
    getUserAnswerText,
  };
})();
