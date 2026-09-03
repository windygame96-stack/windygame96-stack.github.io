import { supabase, auth } from "./supabase-client.js";
import { Storage } from "./storage.js";
import { Samples } from "./samples.js";
import { Generator } from "./generator.js";
import { QuizRunner } from "./quiz.js";
import { Achievements } from "./achievements.js";

/* app.js — 视图路由、事件绑定与整体交互控制（async，接入 Supabase） */

let session = null; // { username, isGuest, userId? }
let currentCourseId = null;
let currentCourseTitle = "";
let currentLevel = "easy";
let editLevel = "easy";

const LEVEL_LABEL = { easy: "初级", medium: "中级", hard: "高级" };

// ---------- 工具 ----------
function $(sel) {
  return document.querySelector(sel);
}
function $all(sel) {
  return Array.from(document.querySelectorAll(sel));
}

function toast(msg, ms = 2200) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    el.classList.remove("show");
    el.classList.add("hidden");
  }, ms);
}

function showConfirm(message) {
  return new Promise((resolve) => {
    const overlay = $("#confirm-modal");
    const okBtn = $("#confirm-modal-ok");
    const cancelBtn = $("#confirm-modal-cancel");
    $("#confirm-modal-msg").textContent = message;
    overlay.classList.remove("hidden");
    const cleanup = (result) => {
      overlay.classList.add("hidden");
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      overlay.removeEventListener("click", onOverlay);
      resolve(result);
    };
    const onOk = () => cleanup(true);
    const onCancel = () => cleanup(false);
    const onOverlay = (e) => {
      if (e.target === overlay) cleanup(false);
    };
    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
    overlay.addEventListener("click", onOverlay);
  });
}

function showAlert(message) {
  return new Promise((resolve) => {
    const overlay = $("#alert-modal");
    const okBtn = $("#alert-modal-ok");
    $("#alert-modal-msg").textContent = message;
    overlay.classList.remove("hidden");
    const cleanup = () => {
      overlay.classList.add("hidden");
      okBtn.removeEventListener("click", onOk);
      overlay.removeEventListener("click", onOverlay);
      resolve();
    };
    const onOk = () => cleanup();
    const onOverlay = (e) => {
      if (e.target === overlay) cleanup();
    };
    okBtn.addEventListener("click", onOk);
    overlay.addEventListener("click", onOverlay);
  });
}

function escapeText(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.dataset.origText = btn.textContent;
    btn.textContent = "请稍候…";
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.origText || btn.textContent;
    btn.disabled = false;
  }
}

// ---------- 视图切换 ----------
function showView(id) {
  $all(".view").forEach((v) => v.classList.remove("active"));
  $(`#view-${id}`).classList.add("active");
  $all(".nav-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.view === id),
  );
  window.scrollTo(0, 0);
  if (id === "dashboard") renderDashboard();
  if (id === "profile") renderProfile();
  if (id === "mistakes") renderMistakes();
}

function setHeaderVisible(visible) {
  $("#app-header").classList.toggle("hidden", !visible);
}

// ---------- 认证 ----------
function initAuth() {
  const redirectTo = `${window.location.origin}${window.location.pathname}`;

  $("#signin-btn").addEventListener("click", () => {
    auth.openSignInModal({
      appName: "学习工坊",
      locale: "zh-CN",
      redirectTo,
    });
  });

  $("#google-btn").addEventListener("click", async () => {
    try {
      await auth.signInWithOAuth({ provider: "google", redirectTo });
    } catch (err) {
      toast("Google 登录失败：" + (err?.message || err));
    }
  });

  $("#guest-btn").addEventListener("click", () => {
    Storage.setGuestSession();
    session = { username: "guest", isGuest: true };
    setHeaderVisible(true);
    $("#user-badge").textContent = "👤 游客模式";
    refreshStreakBadge();
    showView("dashboard");
  });

  $("#logout-btn").addEventListener("click", async () => {
    await Storage.clearSession();
    session = null;
    setHeaderVisible(false);
    showView("auth");
  });

  supabase.auth.onAuthStateChange(async (event) => {
    if (event === "SIGNED_IN") {
      try {
        await ensureProfile();
      } catch (err) {
        console.error("ensureProfile failed:", err);
      }
      await enterApp();
    }
    if (event === "SIGNED_OUT" && session && !session.isGuest) {
      session = null;
      setHeaderVisible(false);
      showView("auth");
    }
  });
}

async function ensureProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (existing) return;

  let username =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "user";
  username = String(username).trim() || "user";

  // 用户名有唯一约束，Google 昵称/邮箱前缀可能与已有用户重名，
  // 失败时自动加随机后缀重试，避免整个登录流程被卡住。
  for (let attempt = 0; attempt < 3; attempt++) {
    const { error } = await supabase
      .from("profiles")
      .insert({ id: user.id, username });
    if (!error) return;
    if (error.code === "23505" || /unique|duplicate/i.test(error.message)) {
      username = `${username}_${Math.random().toString(36).slice(2, 6)}`;
      continue;
    }
    console.error("ensureProfile insert failed:", error);
    return;
  }
}

async function enterApp() {
  session = await Storage.getSession();
  if (!session) {
    showView("auth");
    return;
  }
  setHeaderVisible(true);
  $("#user-badge").textContent = session.isGuest
    ? "👤 游客模式"
    : `👋 ${session.username}`;
  await refreshStreakBadge();
  showView("dashboard");
}

async function refreshStreakBadge() {
  const checkin = await Storage.getCheckin(
    session.username,
    session.isGuest,
    session.userId,
  );
  $("#streak-badge").textContent = checkin.streak;
}

// ---------- 打卡 ----------
function initCheckin() {
  $("#checkin-btn").addEventListener("click", async () => {
    const res = await Achievements.checkIn(session);
    if (res.alreadyChecked) {
      toast("今天已经打过卡啦，明天再来吧～");
      return;
    }
    await refreshStreakBadge();
    toast(`打卡成功！连续打卡 ${res.streak} 天 🔥`);
    if (res.newlyUnlocked && res.newlyUnlocked.length) {
      setTimeout(
        () =>
          toast(
            `解锁新成就：${res.newlyUnlocked.map((a) => a.title).join("、")}`,
          ),
        1200,
      );
    }
    if ($("#view-profile").classList.contains("active")) await renderProfile();
  });
}

// ---------- 导航 ----------
function initNav() {
  $all("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });
}

// ---------- 仪表盘 ----------
async function renderDashboard() {
  const [courses, progressMap] = await Promise.all([
    Storage.getCourses(session.isGuest),
    Storage.getProgress(session.username, session.isGuest, session.userId),
  ]);
  const listEl = $("#course-list");
  listEl.innerHTML = "";
  $("#dashboard-empty").classList.toggle("hidden", courses.length > 0);

  const fragment = document.createDocumentFragment();
  for (const course of courses.slice().reverse()) {
    const total = ["easy", "medium", "hard"].reduce(
      (s, l) => s + (course.levels[l] || []).length,
      0,
    );
    const cp = progressMap[course.id] || _emptyLevelDone();
    const doneLevels = ["easy", "medium", "hard"].filter(
      (l) => cp.levelDone && cp.levelDone[l],
    ).length;
    const pct = Math.round((doneLevels / 3) * 100);

    const isOwner = session.isGuest
      ? course.ownerUsername === session.username
      : course.ownerId === session.userId;

    const sourceTag =
      course.generatedBy === "ai"
        ? `<span class="tag tag-ai">🤖 AI${course.aiProvider ? " · " + escapeText(course.aiProvider.split(" ")[0]) : ""}</span>`
        : course.generatedBy === "rule"
          ? '<span class="tag tag-rule">⚙️ 规则</span>'
          : "";

    const card = document.createElement("div");
    card.className = "course-card";
    card.innerHTML = `
        <div class="course-card-top">
          <h3>${escapeText(course.title)}</h3>
          <div class="course-card-tags">
            ${sourceTag}
            ${isOwner ? '<span class="tag tag-owner">我创建</span>' : ""}
          </div>
        </div>
        <p class="course-cat">${escapeText(course.category)} · 共 ${total} 题</p>
        <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
        <p class="course-progress-text">完成度 ${pct}%</p>
        <button class="btn-primary course-open-btn">进入学习</button>
      `;
    card
      .querySelector(".course-open-btn")
      .addEventListener("click", () => openCourse(course.id));
    fragment.appendChild(card);
  }
  listEl.appendChild(fragment);
}

function _emptyLevelDone() {
  return { levelDone: { easy: false, medium: false, hard: false } };
}

// ---------- 上传生成课程 ----------
function renderSampleGrid() {
  const grid = $("#sample-grid");
  if (!grid || !Samples || !Samples.list) return;
  grid.innerHTML = "";
  Samples.list.forEach((sample) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "sample-card";
    card.innerHTML = `
        <span class="sample-icon">${sample.icon}</span>
        <span class="sample-info">
          <span class="sample-name">${sample.title}</span>
          <span class="sample-cat">${sample.category}</span>
        </span>
      `;
    card.addEventListener("click", () => {
      $("#course-title").value = sample.title;
      $("#course-category").value = sample.category;
      $("#course-text").value = sample.text.trim();
      $("#file-name").textContent = "";
      $("#upload-error").textContent = "";
      updateTextCounter();
      toast(`已填充「${sample.title}」示例教材，可直接点击生成`);
    });
    grid.appendChild(card);
  });
}

function updateTextCounter() {
  const el = $("#course-text-counter");
  if (!el) return;
  const len = $("#course-text").value.length;
  el.textContent = `已输入 ${len} 字（建议 150～4000 字；少于 60 字无法生成，AI 模式超过 4000 字只会截取前 4000 字）`;
  el.classList.remove("warn", "danger");
  if (len > 0 && len < 60) el.classList.add("danger");
  else if (len > 4000) el.classList.add("warn");
}

function initUpload() {
  renderSampleGrid();
  updateTextCounter();
  $("#course-text").addEventListener("input", updateTextCounter);
  $("#course-file").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    $("#file-name").textContent = file.name;
    const reader = new FileReader();
    reader.onload = (ev) => {
      $("#course-text").value = ev.target.result;
      updateTextCounter();
    };
    reader.readAsText(file, "UTF-8");
  });

  $("#generate-btn").addEventListener("click", async () => {
    const title = $("#course-title").value.trim();
    const category = $("#course-category").value.trim();
    const text = $("#course-text").value.trim();
    const errEl = $("#upload-error");
    if (!title) {
      errEl.textContent = "请填写课程标题";
      return;
    }
    if (text.length < 60) {
      errEl.textContent =
        "教材内容过短，建议提供至少 60 字、包含多个句子的文本";
      return;
    }

    errEl.textContent = "";
    const mode =
      document.querySelector('input[name="gen-mode"]:checked')?.value || "rule";
    const btn = $("#generate-btn");
    setLoading(btn, true);

    let result = null;
    let genStatusMsg = null;
    if (mode === "ai" && session.isGuest) {
      genStatusMsg = "⚠️ AI 生成功能需要登录账号，已使用本地规则算法生成。";
    } else if (mode === "ai") {
      try {
        const { data, error } = await supabase.functions.invoke(
          "generate-course-ai",
          {
            body: { title, category, text, ownerUsername: session.username },
          },
        );
        if (error) throw error;
        if (data && data.ok) {
          result = data;
          genStatusMsg = `✅ AI 生成成功！\n本次使用模型：${data.provider || "AI"}`;
        } else {
          genStatusMsg = `⚠️ AI 生成失败：${data && data.msg ? data.msg : "未知错误"}\n已自动切换为规则算法生成。`;
        }
      } catch (err) {
        genStatusMsg = `⚠️ AI 接口调用失败：${err?.message || err}\n已自动切换为规则算法生成。`;
      }
    }
    if (!result) {
      result = Generator.generateCourse({
        title,
        category,
        text,
        ownerUsername: session.username,
      });
    }
    if (!result.ok) {
      errEl.textContent = result.msg;
      setLoading(btn, false);
      if (genStatusMsg) await showAlert(genStatusMsg);
      return;
    }

    result.course.generatedBy = result.provider ? "ai" : "rule";
    if (result.provider) result.course.aiProvider = result.provider;

    if (genStatusMsg) {
      await showAlert(genStatusMsg);
    }

    try {
      await Storage.addCourse(result.course, session.isGuest);
      await Achievements.evaluate(session);
      toast("课程生成成功！");
      $("#course-title").value = "";
      $("#course-category").value = "";
      $("#course-text").value = "";
      updateTextCounter();
      $("#file-name").textContent = "";
      await openCourse(result.course.id);
    } catch (err) {
      errEl.textContent = "保存失败：" + err.message;
    } finally {
      setLoading(btn, false);
    }
  });
}

// ---------- 课程详情 ----------
async function openCourse(courseId) {
  currentCourseId = courseId;
  currentLevel = "easy";
  showView("course");
  await renderCourseDetail();
}

function initCourseDetail() {
  $all("#level-tabs .level-tab").forEach((tab) => {
    tab.addEventListener("click", async () => {
      currentLevel = tab.dataset.level;
      await renderCourseDetail();
    });
  });
  $("#edit-questions-btn").addEventListener("click", () => {
    editLevel = currentLevel;
    showView("edit");
    renderEditPanel();
  });
  $("#delete-course-btn").addEventListener("click", async () => {
    const ok = await showConfirm(
      "确定要删除这门课程吗？该操作不可撤销，所有关联的学习进度也会失去入口。",
    );
    if (!ok) return;
    try {
      await Storage.deleteCourse(currentCourseId, session.isGuest, session.userId);
      toast("课程已删除");
      showView("dashboard");
    } catch (err) {
      toast("删除失败：" + (err?.message || err));
    }
  });
}

async function renderCourseDetail() {
  const course = await Storage.getCourseById(currentCourseId, session.isGuest);
  if (!course) {
    showView("dashboard");
    return;
  }
  $("#course-detail-title").textContent = course.title;

  const isOwner = session.isGuest
    ? course.ownerUsername === session.username
    : course.ownerId === session.userId;
  $("#course-owner-actions").classList.toggle("hidden", !isOwner);

  const sourceText =
    course.generatedBy === "ai"
      ? `🤖 AI 生成${course.aiProvider ? " · " + course.aiProvider : ""}`
      : course.generatedBy === "rule"
        ? "⚙️ 规则算法生成"
        : "";
  const sourceEl = $("#course-source");
  if (sourceEl) sourceEl.textContent = sourceText;

  $all("#level-tabs .level-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.level === currentLevel);
  });

  const questions = course.levels[currentLevel] || [];
  const cp = await Storage.getCourseProgress(
    session.username,
    currentCourseId,
    session.isGuest,
    session.userId,
  );
  const done = cp.levelDone && cp.levelDone[currentLevel];
  const score = cp.levelScore && cp.levelScore[currentLevel];

  const panel = $("#level-panel");
  if (!questions.length) {
    panel.innerHTML = `<p class="empty-hint">该难度暂无题目。</p>`;
    return;
  }
  panel.innerHTML = `
      <div class="level-summary">
        <p>本难度共 <strong>${questions.length}</strong> 题（选择/填空/匹配混合）</p>
        ${done ? `<p class="level-done-tag">✅ 已完成，得分 ${score.correct}/${score.total}</p>` : '<p class="level-todo-tag">尚未完成</p>'}
      </div>
      <button class="btn-primary" id="start-quiz-btn">${done ? "重新挑战" : "开始答题"}</button>
    `;
  $("#start-quiz-btn").addEventListener("click", () =>
    startQuiz(course.id, currentLevel),
  );
}

// ---------- 答题 ----------
async function startQuiz(courseId, level) {
  const course = await Storage.getCourseById(courseId, session.isGuest);
  const questions = course.levels[level];
  currentCourseId = courseId;
  currentCourseTitle = course.title;
  currentLevel = level;
  QuizRunner.start(questions);
  showView("quiz");
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const body = $("#quiz-body");
  QuizRunner.render(body);
  $("#quiz-submit-btn").classList.remove("hidden");
  $("#quiz-next-btn").classList.add("hidden");
  updateQuizProgress();
}

function updateQuizProgress() {
  const idx = QuizRunner.getIndex();
  const total = QuizRunner.getTotal();
  $("#quiz-progress-text").textContent = `${idx + 1} / ${total}`;
  $("#quiz-progress-bar").style.width = `${(idx / total) * 100}%`;
}

function initQuiz() {
  $("#quiz-back-btn").addEventListener("click", () => showView("course"));

  $("#quiz-submit-btn").addEventListener("click", async () => {
    const body = $("#quiz-body");
    if (!QuizRunner.hasAnswerSelected(body)) {
      toast("请先作答再提交");
      return;
    }
    const { correct } = QuizRunner.grade(body);
    if (!correct) {
      const q = QuizRunner.currentQuestion();
      const userAnswerText = QuizRunner.getUserAnswerText(body);
      await Storage.addMistake(session.username, session.isGuest, session.userId, {
        courseId: currentCourseId,
        courseTitle: currentCourseTitle,
        level: currentLevel,
        question: q,
        userAnswerText,
      });
    }
    const stats = await Storage.getStats(
      session.username,
      session.isGuest,
      session.userId,
    );
    stats.totalAnswered += 1;
    if (correct) stats.totalCorrect += 1;
    await Storage.saveStats(
      session.username,
      stats,
      session.isGuest,
      session.userId,
    );
    toast(correct ? "回答正确 ✅" : "回答错误 ❌");
    $("#quiz-submit-btn").classList.add("hidden");
    $("#quiz-next-btn").classList.remove("hidden");
    $("#quiz-next-btn").textContent =
      QuizRunner.getIndex() + 1 >= QuizRunner.getTotal()
        ? "完成本关"
        : "下一题";
  });

  $("#quiz-next-btn").addEventListener("click", async () => {
    QuizRunner.next();
    if (QuizRunner.isFinished()) {
      await finishLevel();
    } else {
      renderQuizQuestion();
    }
  });

  // 支持填空题输入内容后按回车直接提交，答对/答错后再按一次回车进入下一题
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const quizView = $("#view-quiz");
    if (!quizView || !quizView.classList.contains("active")) return;
    const submitBtn = $("#quiz-submit-btn");
    const nextBtn = $("#quiz-next-btn");
    if (submitBtn && !submitBtn.classList.contains("hidden")) {
      e.preventDefault();
      submitBtn.click();
    } else if (nextBtn && !nextBtn.classList.contains("hidden")) {
      e.preventDefault();
      nextBtn.click();
    }
  });
}

async function finishLevel() {
  const { correct, total } = QuizRunner.getScore();
  const cp = await Storage.getCourseProgress(
    session.username,
    currentCourseId,
    session.isGuest,
    session.userId,
  );
  cp.levelScore[currentLevel] = { correct, total };
  cp.levelDone[currentLevel] = true;
  cp.lastAccessed = Date.now();
  await Storage.saveCourseProgress(
    session.username,
    currentCourseId,
    cp,
    session.isGuest,
    session.userId,
  );
  const newly = await Achievements.evaluate(session);
  toast(`本关完成！得分 ${correct}/${total}`);
  if (newly.length)
    setTimeout(
      () => toast(`解锁新成就：${newly.map((a) => a.title).join("、")}`),
      1300,
    );
  showView("course");
  await renderCourseDetail();
}

// ---------- 创作者编辑题目 ----------
function initEdit() {
  $("#edit-back-btn").addEventListener("click", () => showView("course"));
  $all("#edit-level-tabs .level-tab").forEach((tab) => {
    tab.addEventListener("click", async () => {
      editLevel = tab.dataset.level;
      await renderEditPanel();
    });
  });
  $("#add-question-btn").addEventListener("click", () => openAddQuestionForm());
}

async function renderEditPanel() {
  const course = await Storage.getCourseById(currentCourseId, session.isGuest);
  $all("#edit-level-tabs .level-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.level === editLevel);
  });
  const panel = $("#edit-panel");
  panel.innerHTML = "";
  const questions = course.levels[editLevel];
  if (!questions.length) {
    panel.innerHTML =
      '<p class="empty-hint">该难度暂无题目，可点击下方按钮新增。</p>';
    return;
  }
  questions.forEach((q, idx) =>
    panel.appendChild(buildEditCard(course, q, idx)),
  );
}

function buildEditCard(course, q, idx) {
  const card = document.createElement("div");
  card.className = "edit-card";
  const typeLabel = { choice: "选择题", blank: "填空题", match: "匹配题" }[
    q.type
  ];
  card.innerHTML = `<div class="edit-card-head"><span class="tag">${typeLabel}</span><button class="btn-ghost del-btn">删除</button></div>`;

  if (q.type === "blank") {
    card.appendChild(labeledInput("题干（用 ____ 表示空白）", q.stem, "stem"));
    card.appendChild(labeledInput("正确答案", q.answer, "answer"));
  } else if (q.type === "choice") {
    card.appendChild(labeledInput("题干", q.stem, "stem"));
    q.options.forEach((opt, oi) => {
      card.appendChild(
        labeledInput(
          `选项 ${oi + 1}${opt === q.answer ? "（正确答案）" : ""}`,
          opt,
          `opt-${oi}`,
        ),
      );
    });
    const answerSelectWrap = document.createElement("div");
    answerSelectWrap.className = "field";
    answerSelectWrap.innerHTML = `<label>正确答案（选择第几个选项）</label>`;
    const select = document.createElement("select");
    select.className = "answer-select";
    q.options.forEach((opt, oi) => {
      const o = document.createElement("option");
      o.value = oi;
      o.textContent = `选项 ${oi + 1}`;
      if (opt === q.answer) o.selected = true;
      select.appendChild(o);
    });
    answerSelectWrap.appendChild(select);
    card.appendChild(answerSelectWrap);
  } else if (q.type === "match") {
    card.appendChild(labeledInput("说明", q.stem, "stem"));
    q.pairs.forEach((p, pi) => {
      const row = document.createElement("div");
      row.className = "pair-row";
      row.innerHTML = `
          <input class="pair-term" data-pi="${pi}" value="${escapeText(p.term)}" placeholder="术语">
          <input class="pair-def" data-pi="${pi}" value="${escapeText(p.definition)}" placeholder="释义">
        `;
      card.appendChild(row);
    });
  }

  const saveBtn = document.createElement("button");
  saveBtn.className = "btn-primary save-btn";
  saveBtn.textContent = "保存本题";

  const aiBox = document.createElement("div");
  aiBox.className = "ai-rewrite-box";
  aiBox.innerHTML = `
      <label>🤖 让 AI 按你的要求改写这道题</label>
      <div class="ai-rewrite-row">
        <input class="ai-rewrite-input" placeholder="例如：改得更难一些 / 换成关于XX场景的题目 / 把选项改得更有迷惑性">
        <button class="btn-ghost ai-rewrite-btn" type="button">🤖 AI 改写</button>
      </div>
      <p class="ai-rewrite-error"></p>
    `;
  if (!session.isGuest) card.appendChild(aiBox);
  card.appendChild(saveBtn);

  aiBox.querySelector(".ai-rewrite-btn").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    const input = aiBox.querySelector(".ai-rewrite-input");
    const errEl = aiBox.querySelector(".ai-rewrite-error");
    const promptText = input.value.trim();
    if (!promptText) {
      errEl.textContent = "请先输入修改要求";
      return;
    }
    errEl.textContent = "";
    btn.disabled = true;
    const originalLabel = btn.textContent;
    btn.textContent = "AI 改写中...";
    try {
      const { data, error } = await supabase.functions.invoke(
        "rewrite-question-ai",
        {
          body: {
            question: q,
            userPrompt: promptText,
            courseTitle: course.title,
            courseCategory: course.category,
          },
        },
      );
      if (error) throw error;
      if (!data || !data.ok) {
        errEl.textContent = (data && data.msg) || "AI 改写失败";
        return;
      }
      course.levels[editLevel][idx] = { ...data.question, id: q.id };
      await Storage.updateCourse(course, session.isGuest);
      toast(`AI 改写成功！（${data.provider}）`);
      await renderEditPanel();
    } catch (err) {
      errEl.textContent = "AI 改写出错：" + (err.message || err);
    } finally {
      btn.disabled = false;
      btn.textContent = originalLabel;
    }
  });

  saveBtn.addEventListener("click", async () =>
    saveEditedQuestion(course, idx, card),
  );
  card.querySelector(".del-btn").addEventListener("click", async () => {
    course.levels[editLevel].splice(idx, 1);
    await Storage.updateCourse(course, session.isGuest);
    await renderEditPanel();
    toast("已删除题目");
  });

  return card;
}

function labeledInput(label, value, field) {
  const wrap = document.createElement("div");
  wrap.className = "field";
  wrap.innerHTML = `<label>${label}</label><input data-field="${field}" value="${escapeText(value)}">`;
  return wrap;
}

async function saveEditedQuestion(course, idx, card) {
  const q = course.levels[editLevel][idx];
  if (q.type === "blank") {
    q.stem = card.querySelector('[data-field="stem"]').value.trim();
    q.answer = card.querySelector('[data-field="answer"]').value.trim();
  } else if (q.type === "choice") {
    q.stem = card.querySelector('[data-field="stem"]').value.trim();
    const newOptions = q.options.map((_, oi) =>
      card.querySelector(`[data-field="opt-${oi}"]`).value.trim(),
    );
    const answerIdx = Number(card.querySelector(".answer-select").value);
    q.answer = newOptions[answerIdx];
    q.options = newOptions;
  } else if (q.type === "match") {
    q.stem = card.querySelector('[data-field="stem"]').value.trim();
    const terms = card.querySelectorAll(".pair-term");
    const defs = card.querySelectorAll(".pair-def");
    q.pairs = q.pairs.map((p, pi) => ({
      term: terms[pi].value.trim(),
      definition: defs[pi].value.trim(),
    }));
  }
  await Storage.updateCourse(course, session.isGuest);
  toast("已保存修改");
  await renderEditPanel();
}

function openAddQuestionForm() {
  const panel = $("#edit-panel");
  const form = document.createElement("div");
  form.className = "edit-card add-card";
  form.innerHTML = `
      <div class="field">
        <label>题目类型</label>
        <select id="add-type-select">
          <option value="choice">选择题</option>
          <option value="blank">填空题</option>
          <option value="match">匹配题</option>
        </select>
      </div>
      <div id="add-type-fields"></div>
      <button class="btn-primary" id="confirm-add-btn">添加题目</button>
      <button class="btn-ghost" id="cancel-add-btn">取消</button>
    `;
  panel.prepend(form);

  const typeSelect = form.querySelector("#add-type-select");
  const fieldsWrap = form.querySelector("#add-type-fields");

  function renderAddFields(type) {
    if (type === "blank") {
      fieldsWrap.innerHTML = `
          <div class="field"><label>题干（用 ____ 表示空白）</label><input id="add-stem"></div>
          <div class="field"><label>正确答案</label><input id="add-answer"></div>
        `;
    } else if (type === "choice") {
      fieldsWrap.innerHTML = `
          <div class="field"><label>题干</label><input id="add-stem"></div>
          <div class="field"><label>选项1</label><input id="add-opt-0"></div>
          <div class="field"><label>选项2</label><input id="add-opt-1"></div>
          <div class="field"><label>选项3</label><input id="add-opt-2"></div>
          <div class="field"><label>选项4</label><input id="add-opt-3"></div>
          <div class="field"><label>正确答案（第几个选项，1-4）</label><input id="add-answer-idx" type="number" min="1" max="4" value="1"></div>
        `;
    } else {
      fieldsWrap.innerHTML = `
          <p class="gen-tip">请输入至少 2 组 术语=释义，每行一组，格式：术语=释义</p>
          <textarea id="add-pairs" rows="4" placeholder="单宁=红酒中带来涩感的物质\n酸度=葡萄酒尝起来的清爽感"></textarea>
        `;
    }
  }
  renderAddFields(typeSelect.value);
  typeSelect.addEventListener("change", () =>
    renderAddFields(typeSelect.value),
  );

  form
    .querySelector("#cancel-add-btn")
    .addEventListener("click", () => form.remove());
  form.querySelector("#confirm-add-btn").addEventListener("click", async () => {
    const course = await Storage.getCourseById(
      currentCourseId,
      session.isGuest,
    );
    const type = typeSelect.value;
    let newQ = null;
    if (type === "blank") {
      const stem = $("#add-stem").value.trim();
      const answer = $("#add-answer").value.trim();
      if (!stem || !answer) {
        toast("请完整填写题干和答案");
        return;
      }
      newQ = { id: Generator.uid("q"), type: "blank", stem, answer };
    } else if (type === "choice") {
      const stem = $("#add-stem").value.trim();
      const options = [0, 1, 2, 3]
        .map((i) => $(`#add-opt-${i}`).value.trim())
        .filter(Boolean);
      const answerIdx = Number($("#add-answer-idx").value) - 1;
      if (!stem || options.length < 2 || !options[answerIdx]) {
        toast("请完整填写题干、至少2个选项和正确答案序号");
        return;
      }
      newQ = {
        id: Generator.uid("q"),
        type: "choice",
        stem,
        options,
        answer: options[answerIdx],
      };
    } else {
      const raw = $("#add-pairs").value.trim();
      const pairs = raw
        .split("\n")
        .map((l) => l.split("="))
        .filter((p) => p.length === 2 && p[0].trim() && p[1].trim())
        .map((p) => ({ term: p[0].trim(), definition: p[1].trim() }));
      if (pairs.length < 2) {
        toast("请至少输入 2 组有效的 术语=释义");
        return;
      }
      newQ = {
        id: Generator.uid("q"),
        type: "match",
        stem: "请将左侧术语与右侧释义正确匹配",
        pairs,
      };
    }
    course.levels[editLevel].push(newQ);
    await Storage.updateCourse(course, session.isGuest);
    form.remove();
    toast("题目已添加");
    await renderEditPanel();
  });
}

// ---------- 我的进度 ----------
async function renderProfile() {
  const { username, isGuest, userId } = session;
  const checkin = await Storage.getCheckin(username, isGuest, userId);
  const stats = await Storage.getStats(username, isGuest, userId);
  $("#stat-streak").textContent = checkin.streak;
  $("#stat-total-days").textContent = checkin.totalDays;
  $("#stat-correct").textContent = stats.totalCorrect;

  const unlocked = await Storage.getAchievements(username, isGuest, userId);
  const unlockedIds = new Set(unlocked.map((a) => a.id));
  const list = $("#achievement-list");
  list.innerHTML = "";
  Achievements.getAllDefs().forEach((def) => {
    const on = unlockedIds.has(def.id);
    const el = document.createElement("div");
    el.className = `achievement-badge ${on ? "unlocked" : "locked"}`;
    el.innerHTML = `<span class="badge-icon">${def.icon}</span><span class="badge-title">${def.title}</span><span class="badge-desc">${def.desc}</span>`;
    list.appendChild(el);
  });

  const courses = await Storage.getCourses(isGuest);
  const progAll = await Storage.getProgress(username, isGuest, userId);
  const progList = $("#progress-course-list");
  progList.innerHTML = "";
  const relevant = courses.filter(
    (c) =>
      progAll[c.id] ||
      (isGuest ? c.ownerUsername === username : c.ownerId === userId),
  );
  if (!relevant.length) {
    progList.innerHTML =
      '<p class="empty-hint">还没有学习记录，快去仪表盘开始学习吧。</p>';
    return;
  }
  relevant.forEach((course) => {
    const cp = progAll[course.id] || { levelDone: {}, levelScore: {} };
    const row = document.createElement("div");
    row.className = "progress-row";
    row.innerHTML = `
        <div class="progress-row-title">${escapeText(course.title)}</div>
        <div class="progress-row-levels">
          ${["easy", "medium", "hard"]
            .map((l) => {
              const done = cp.levelDone && cp.levelDone[l];
              const score = cp.levelScore && cp.levelScore[l];
              return `<span class="mini-tag ${done ? "done" : ""}">${LEVEL_LABEL[l]} ${done ? `${score.correct}/${score.total}` : "未完成"}</span>`;
            })
            .join("")}
        </div>
      `;
    progList.appendChild(row);
  });
}

// ---------- 错题本 ----------
function _formatCorrectAnswer(q) {
  if (q.type === "match")
    return q.pairs.map((p) => `${p.term} → ${p.definition}`).join("；");
  return q.answer;
}

async function renderMistakes() {
  const { username, isGuest, userId } = session;
  const list = await Storage.getMistakes(username, isGuest, userId);
  const container = $("#mistakes-list");
  container.innerHTML = "";
  $("#mistakes-empty").classList.toggle("hidden", list.length > 0);
  $("#clear-mistakes-btn").classList.toggle("hidden", list.length === 0);

  list.forEach((m) => {
    const q = m.question;
    const card = document.createElement("div");
    card.className = "mistake-card";
    card.innerHTML = `
        <div class="mistake-card-head">
          <div class="mistake-card-tags">
            <span class="mini-tag">${escapeText(m.courseTitle || "已删除课程")}</span>
            <span class="mini-tag">${LEVEL_LABEL[m.level] || m.level}</span>
            <span class="mini-tag">错了 ${m.wrongCount} 次</span>
          </div>
          <button class="btn-ghost mistake-remove-btn" data-id="${m.id}">移除</button>
        </div>
        <p class="mistake-stem">${escapeText(q.stem)}</p>
        <p class="mistake-answer-row wrong"><span class="label">你的答案：</span><span class="value">${escapeText(m.userAnswerText || "")}</span></p>
        <p class="mistake-answer-row right"><span class="label">正确答案：</span><span class="value">${escapeText(_formatCorrectAnswer(q))}</span></p>
      `;
    card.querySelector(".mistake-remove-btn").addEventListener("click", async () => {
      await Storage.removeMistake(username, isGuest, userId, m.id);
      await renderMistakes();
    });
    container.appendChild(card);
  });
}

function initMistakes() {
  $("#clear-mistakes-btn").addEventListener("click", async () => {
    const ok = await showConfirm("确定要清空整个错题本吗？该操作不可撤销。");
    if (!ok) return;
    await Storage.clearMistakes(session.username, session.isGuest, session.userId);
    toast("错题本已清空");
    await renderMistakes();
  });
}

// ---------- 初始化 ----------
async function init() {
  initAuth();
  initNav();
  initCheckin();
  initUpload();
  initCourseDetail();
  initQuiz();
  initEdit();
  initMistakes();

  const existing = await Storage.getSession();
  if (existing && existing.username) {
    session = existing;
    setHeaderVisible(true);
    $("#user-badge").textContent = existing.isGuest
      ? "👤 游客模式"
      : `👋 ${existing.username}`;
    await refreshStreakBadge();
    showView("dashboard");
  } else {
    showView("auth");
  }
}

document.addEventListener("DOMContentLoaded", init);
