import { supabase } from "./supabase-client.js";

/* storage.js — 混合数据层：游客走 localStorage，登录用户走 Supabase */

export const Storage = (() => {
  // ---- localStorage 工具（游客专用） ----
  const LS = {
    read(key, fallback) {
      try {
        const r = localStorage.getItem(key);
        return r ? JSON.parse(r) : fallback;
      } catch {
        return fallback;
      }
    },
    write(key, val) {
      localStorage.setItem(key, JSON.stringify(val));
    },
    remove(key) {
      localStorage.removeItem(key);
    },
  };

  const GUEST_SESSION_KEY = "edu_guest_session";

  // ---- 会话 ----
  // 返回 { username, isGuest, userId? } 或 null
  async function getSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session && session.user) {
      const userId = session.user.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single();
      const username = profile ? profile.username : session.user.email;
      return { username, isGuest: false, userId };
    }
    const guest = LS.read(GUEST_SESSION_KEY, null);
    if (guest && guest.isGuest) return guest;
    return null;
  }

  function setGuestSession() {
    LS.write(GUEST_SESSION_KEY, { username: "guest", isGuest: true });
  }

  async function clearSession() {
    LS.remove(GUEST_SESSION_KEY);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) await supabase.auth.signOut();
  }

  // ---- 认证 ----
  async function registerUser(email, password, username) {
    email = (email || "").trim();
    username = (username || "").trim();
    if (!email || !password || !username)
      return { ok: false, msg: "邮箱、用户名和密码不能为空" };

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { ok: false, msg: error.message };

    if (!data.session) {
      return { ok: true, username, needsEmailVerification: true };
    }

    const userId = data.user.id;
    const { error: profileErr } = await supabase
      .from("profiles")
      .insert({ id: userId, username });
    if (profileErr)
      return {
        ok: false,
        msg: "账号创建成功但保存用户名失败：" + profileErr.message,
      };

    return { ok: true, username };
  }

  async function loginUser(email, password) {
    email = (email || "").trim();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { ok: false, msg: "邮箱或密码错误" };
    const userId = data.user.id;
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .single();
    const username = profile ? profile.username : email;
    return { ok: true, username };
  }

  // ---- 课程 ----
  function _lsCourses() {
    return LS.read("edu_courses", []);
  }
  function _lsSaveCourses(c) {
    LS.write("edu_courses", c);
  }

  async function getCourses(isGuest) {
    if (isGuest) return _lsCourses();
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data || []).map(_dbCourseToLocal);
  }

  async function addCourse(course, isGuest) {
    if (isGuest) {
      const courses = _lsCourses();
      courses.push(course);
      _lsSaveCourses(courses);
      return course;
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const row = {
      id: course.id,
      owner_id: session.user.id,
      owner_username: course.ownerUsername,
      title: course.title,
      category: course.category || "",
      levels: course.levels,
    };
    const { error } = await supabase.from("courses").insert(row);
    if (error) throw new Error(error.message);
    return course;
  }

  async function deleteCourse(courseId, isGuest, userId) {
    if (isGuest) {
      const courses = _lsCourses().filter((c) => c.id !== courseId);
      _lsSaveCourses(courses);
      return;
    }
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId)
      .eq("owner_id", userId);
    if (error) throw new Error(error.message);
  }

  async function getCourseById(id, isGuest) {
    if (isGuest) return _lsCourses().find((c) => c.id === id) || null;
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return _dbCourseToLocal(data);
  }

  async function updateCourse(course, isGuest) {
    if (isGuest) {
      const courses = _lsCourses();
      const idx = courses.findIndex((c) => c.id === course.id);
      if (idx >= 0) {
        courses[idx] = course;
        _lsSaveCourses(courses);
      }
      return;
    }
    const { error } = await supabase
      .from("courses")
      .update({
        title: course.title,
        category: course.category || "",
        levels: course.levels,
      })
      .eq("id", course.id);
    if (error) throw new Error(error.message);
  }

  function _dbCourseToLocal(row) {
    return {
      id: row.id,
      title: row.title,
      category: row.category || "",
      ownerUsername: row.owner_username,
      ownerId: row.owner_id,
      createdAt: new Date(row.created_at).getTime(),
      levels: row.levels || { easy: [], medium: [], hard: [] },
    };
  }

  // ---- 学习进度 ----
  function _lsProgressKey(u) {
    return `edu_progress_${u}`;
  }
  function _lsGetProgress(u) {
    return LS.read(_lsProgressKey(u), {});
  }
  function _lsSaveProgress(u, p) {
    LS.write(_lsProgressKey(u), p);
  }

  const _emptyCP = () => ({
    doneQuestionIds: [],
    levelScore: { easy: null, medium: null, hard: null },
    levelDone: { easy: false, medium: false, hard: false },
    lastAccessed: null,
  });

  async function getCourseProgress(username, courseId, isGuest, userId) {
    if (isGuest) {
      const all = _lsGetProgress(username);
      return all[courseId] || _emptyCP();
    }
    const { data } = await supabase
      .from("progress")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();
    if (!data) return _emptyCP();
    return {
      doneQuestionIds: data.done_question_ids || [],
      levelScore: data.level_score || { easy: null, medium: null, hard: null },
      levelDone: data.level_done || { easy: false, medium: false, hard: false },
      lastAccessed: data.last_accessed,
    };
  }

  async function saveCourseProgress(username, courseId, cp, isGuest, userId) {
    if (isGuest) {
      const all = _lsGetProgress(username);
      all[courseId] = cp;
      _lsSaveProgress(username, all);
      return;
    }
    await supabase.from("progress").upsert(
      {
        user_id: userId,
        course_id: courseId,
        done_question_ids: cp.doneQuestionIds,
        level_score: cp.levelScore,
        level_done: cp.levelDone,
        last_accessed: cp.lastAccessed,
      },
      { onConflict: "user_id,course_id" },
    );
  }

  async function getProgress(username, isGuest, userId) {
    if (isGuest) return _lsGetProgress(username);
    const { data } = await supabase
      .from("progress")
      .select("*")
      .eq("user_id", userId);
    const result = {};
    (data || []).forEach((row) => {
      result[row.course_id] = {
        doneQuestionIds: row.done_question_ids || [],
        levelScore: row.level_score || {},
        levelDone: row.level_done || {},
        lastAccessed: row.last_accessed,
      };
    });
    return result;
  }

  // ---- 统计 ----
  function _lsStatsKey(u) {
    return `edu_stats_${u}`;
  }

  async function getStats(username, isGuest, userId) {
    if (isGuest)
      return LS.read(_lsStatsKey(username), {
        totalCorrect: 0,
        totalAnswered: 0,
      });
    const { data } = await supabase
      .from("stats")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (!data) return { totalCorrect: 0, totalAnswered: 0 };
    return {
      totalCorrect: data.total_correct,
      totalAnswered: data.total_answered,
    };
  }

  async function saveStats(username, stats, isGuest, userId) {
    if (isGuest) {
      LS.write(_lsStatsKey(username), stats);
      return;
    }
    await supabase.from("stats").upsert(
      {
        user_id: userId,
        total_correct: stats.totalCorrect,
        total_answered: stats.totalAnswered,
      },
      { onConflict: "user_id" },
    );
  }

  // ---- 打卡 ----
  function _lsCheckinKey(u) {
    return `edu_checkin_${u}`;
  }
  const _emptyCheckin = () => ({
    lastDate: null,
    streak: 0,
    totalDays: 0,
    history: [],
  });

  async function getCheckin(username, isGuest, userId) {
    if (isGuest) return LS.read(_lsCheckinKey(username), _emptyCheckin());
    const { data } = await supabase
      .from("checkins")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (!data) return _emptyCheckin();
    return {
      lastDate: data.last_date,
      streak: data.streak,
      totalDays: data.total_days,
      history: data.history || [],
    };
  }

  async function saveCheckin(username, checkin, isGuest, userId) {
    if (isGuest) {
      LS.write(_lsCheckinKey(username), checkin);
      return;
    }
    await supabase.from("checkins").upsert(
      {
        user_id: userId,
        last_date: checkin.lastDate,
        streak: checkin.streak,
        total_days: checkin.totalDays,
        history: checkin.history,
      },
      { onConflict: "user_id" },
    );
  }

  // ---- 成就 ----
  function _lsAchievementsKey(u) {
    return `edu_achievements_${u}`;
  }

  async function getAchievements(username, isGuest, userId) {
    if (isGuest) return LS.read(_lsAchievementsKey(username), []);
    const { data } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", userId);
    return (data || []).map((r) => ({
      id: r.achievement_id,
      title: r.title,
      desc: r.description,
      icon: r.icon,
      unlockedAt: r.unlocked_at,
    }));
  }

  async function saveAchievements(username, list, isGuest, userId) {
    if (isGuest) {
      LS.write(_lsAchievementsKey(username), list);
      return;
    }
    if (!list.length) return;
    const rows = list.map((a) => ({
      user_id: userId,
      achievement_id: a.id,
      title: a.title,
      description: a.desc,
      icon: a.icon,
      unlocked_at: a.unlockedAt,
    }));
    await supabase
      .from("achievements")
      .upsert(rows, { onConflict: "user_id,achievement_id" });
  }

  // ---- 错题本 ----
  function _lsMistakesKey(u) {
    return `edu_mistakes_${u}`;
  }

  async function getMistakes(username, isGuest, userId) {
    if (isGuest) {
      const list = LS.read(_lsMistakesKey(username), []);
      return list.slice().sort((a, b) => b.updatedAt - a.updatedAt);
    }
    const { data } = await supabase
      .from("mistakes")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    return (data || []).map((r) => ({
      id: r.id,
      courseId: r.course_id,
      courseTitle: r.course_title,
      level: r.level,
      question: r.question,
      userAnswerText: r.user_answer_text,
      wrongCount: r.wrong_count,
      mastered: r.mastered,
      updatedAt: new Date(r.updated_at).getTime(),
    }));
  }

  async function addMistake(username, isGuest, userId, entry) {
    const { courseId, courseTitle, level, question, userAnswerText } = entry;
    if (isGuest) {
      const list = LS.read(_lsMistakesKey(username), []);
      const idx = list.findIndex(
        (m) => m.courseId === courseId && m.question.id === question.id,
      );
      if (idx >= 0) {
        list[idx].wrongCount += 1;
        list[idx].userAnswerText = userAnswerText;
        list[idx].mastered = false;
        list[idx].updatedAt = Date.now();
      } else {
        list.push({
          id: `${courseId}_${question.id}`,
          courseId,
          courseTitle,
          level,
          question,
          userAnswerText,
          wrongCount: 1,
          mastered: false,
          updatedAt: Date.now(),
        });
      }
      LS.write(_lsMistakesKey(username), list);
      return;
    }
    const { data: existing } = await supabase
      .from("mistakes")
      .select("id, wrong_count")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .eq("question_id", question.id)
      .maybeSingle();
    await supabase.from("mistakes").upsert(
      {
        user_id: userId,
        course_id: courseId,
        course_title: courseTitle,
        level,
        question_id: question.id,
        question,
        user_answer_text: userAnswerText,
        wrong_count: existing ? existing.wrong_count + 1 : 1,
        mastered: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,course_id,question_id" },
    );
  }

  async function removeMistake(username, isGuest, userId, mistakeId) {
    if (isGuest) {
      const list = LS.read(_lsMistakesKey(username), []).filter(
        (m) => m.id !== mistakeId,
      );
      LS.write(_lsMistakesKey(username), list);
      return;
    }
    await supabase
      .from("mistakes")
      .delete()
      .eq("id", mistakeId)
      .eq("user_id", userId);
  }

  async function clearMistakes(username, isGuest, userId) {
    if (isGuest) {
      LS.write(_lsMistakesKey(username), []);
      return;
    }
    await supabase.from("mistakes").delete().eq("user_id", userId);
  }

  async function getCoursesByOwner(username, isGuest, userId) {
    if (isGuest)
      return LS.read("edu_courses", []).filter(
        (c) => c.ownerUsername === username,
      );
    const { data } = await supabase
      .from("courses")
      .select("id")
      .eq("owner_id", userId);
    return data || [];
  }

  return {
    getSession,
    setGuestSession,
    clearSession,
    registerUser,
    loginUser,
    getCourses,
    addCourse,
    getCourseById,
    updateCourse,
    deleteCourse,
    getCoursesByOwner,
    getCourseProgress,
    saveCourseProgress,
    getProgress,
    getStats,
    saveStats,
    getCheckin,
    saveCheckin,
    getAchievements,
    saveAchievements,
    getMistakes,
    addMistake,
    removeMistake,
    clearMistakes,
  };
})();
