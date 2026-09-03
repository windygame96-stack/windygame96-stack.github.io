import { Storage } from "./storage.js";

/* achievements.js — 每日打卡与成就解锁规则（async，兼容 Supabase 数据层） */

export const Achievements = (() => {
  const DEFS = [
    {
      id: "streak3",
      title: "坚持 3 天",
      desc: "连续打卡 3 天",
      icon: "🔥",
      check: (ctx) => ctx.checkin.streak >= 3,
    },
    {
      id: "streak7",
      title: "一周达人",
      desc: "连续打卡 7 天",
      icon: "🏆",
      check: (ctx) => ctx.checkin.streak >= 7,
    },
    {
      id: "streak30",
      title: "月度坚持者",
      desc: "连续打卡 30 天",
      icon: "👑",
      check: (ctx) => ctx.checkin.streak >= 30,
    },
    {
      id: "creator",
      title: "课程创作者",
      desc: "创建第一门课程",
      icon: "🛠️",
      check: (ctx) => ctx.ownedCourseCount >= 1,
    },
    {
      id: "firstLevel",
      title: "初露锋芒",
      desc: "完成一个难度的全部题目",
      icon: "⭐",
      check: (ctx) => ctx.anyLevelDone,
    },
    {
      id: "firstCourse",
      title: "课程通关",
      desc: "完成一门课程的全部三个难度",
      icon: "🎓",
      check: (ctx) => ctx.anyCourseFullyDone,
    },
    {
      id: "correct10",
      title: "小试牛刀",
      desc: "累计答对 10 题",
      icon: "✅",
      check: (ctx) => ctx.stats.totalCorrect >= 10,
    },
    {
      id: "correct50",
      title: "身经百战",
      desc: "累计答对 50 题",
      icon: "💯",
      check: (ctx) => ctx.stats.totalCorrect >= 50,
    },
  ];

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function isYesterday(dateStr) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10) === todayStr();
  }

  async function checkIn(session) {
    const { username, isGuest, userId } = session;
    const checkin = await Storage.getCheckin(username, isGuest, userId);
    const today = todayStr();
    if (checkin.lastDate === today) {
      return {
        success: false,
        alreadyChecked: true,
        streak: checkin.streak,
        totalDays: checkin.totalDays,
      };
    }
    if (checkin.lastDate && isYesterday(checkin.lastDate)) {
      checkin.streak += 1;
    } else {
      checkin.streak = 1;
    }
    checkin.totalDays += 1;
    checkin.lastDate = today;
    checkin.history.push(today);
    await Storage.saveCheckin(username, checkin, isGuest, userId);
    const newly = await evaluate(session);
    return {
      success: true,
      alreadyChecked: false,
      streak: checkin.streak,
      totalDays: checkin.totalDays,
      newlyUnlocked: newly,
    };
  }

  async function buildContext(session) {
    const { username, isGuest, userId } = session;
    const checkin = await Storage.getCheckin(username, isGuest, userId);
    const stats = await Storage.getStats(username, isGuest, userId);
    const owned = await Storage.getCoursesByOwner(username, isGuest, userId);
    const ownedCourseCount = owned.length;
    const progress = await Storage.getProgress(username, isGuest, userId);
    let anyLevelDone = false;
    let anyCourseFullyDone = false;
    Object.values(progress).forEach((cp) => {
      const ld = cp.levelDone || {};
      if (ld.easy || ld.medium || ld.hard) anyLevelDone = true;
      if (ld.easy && ld.medium && ld.hard) anyCourseFullyDone = true;
    });
    return {
      checkin,
      stats,
      ownedCourseCount,
      anyLevelDone,
      anyCourseFullyDone,
    };
  }

  async function evaluate(session) {
    const { username, isGuest, userId } = session;
    const ctx = await buildContext(session);
    const unlocked = await Storage.getAchievements(username, isGuest, userId);
    const unlockedIds = new Set(unlocked.map((a) => a.id));
    const newly = [];
    DEFS.forEach((def) => {
      if (!unlockedIds.has(def.id) && def.check(ctx)) {
        const entry = {
          id: def.id,
          title: def.title,
          desc: def.desc,
          icon: def.icon,
          unlockedAt: Date.now(),
        };
        unlocked.push(entry);
        newly.push(entry);
      }
    });
    if (newly.length)
      await Storage.saveAchievements(username, unlocked, isGuest, userId);
    return newly;
  }

  function getAllDefs() {
    return DEFS;
  }

  return { checkIn, evaluate, getAllDefs, todayStr };
})();
