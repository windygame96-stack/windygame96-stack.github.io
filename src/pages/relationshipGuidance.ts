export type RelationshipAnswer = { option: number; importance: "low" | "medium" | "high"; flexibility: "willing" | "conditional" | "unwilling"; basis: "experience" | "hypothesis"; note: string };
export type RelationshipProfile = { name: string; answers: Record<string, RelationshipAnswer>; followups: Record<string, string> };
export type RelationshipQuestion = { id: string; short: string; text: string; options: string[] };

type Guide = { check: string; agreement: string; review: string; meanings: string[] };
export const topicGuides: Record<string, Guide> = {
  contact: { check: "联系少时，最难受的是不知道对方何时回来，还是缺少被惦记的感觉？", agreement: "只试一周：忙碌时发一句状态说明，约定下一次联系的时间；临时做不到时提前说明，双方可以提出调整。", review: "一周后各说一次：联系是否足够、有没有打扰、哪些约定做不到？", meanings: ["你希望日常联系有一个可预期的节奏", "你更偏好留出完整时间交流", "你倾向按当下余力联系", "你希望联系安排随实际情况共同调整"] },
  support: { check: "烦心时需要倾听、建议还是空间？对方怎样确认你准备好听建议了？", agreement: "下次支持前先问：你现在想让我听、一起想办法，还是留一点空间？独处时由需要空间的人提出方便再次联系的时间。", review: "回顾一次真实事件：哪种回应有帮助？哪一步让你更有压力？", meanings: ["你希望感受先被听见，再考虑解决方案", "你偏好用共同解决问题获得支持", "你希望先有空间整理自己的状态", "你希望支持方式先经过询问"] },
  conflict: { check: "什么时候可以继续谈，什么时候需要暂停？暂停后谁在何时重新发起？", agreement: "为下一次分歧约定一句暂停话术，并明确当天或次日双方可接受的返回时间；文字讨论也可以，但不要求对方即时回复。", review: "下一次分歧后检查：双方能否表达完？暂停是否真的返回？", meanings: ["你倾向尽快把分歧说清楚", "你希望降温后在约定时间继续", "文字可能更方便你整理表达", "你希望处理方式能根据状态调整"] },
  repair: { check: "对方更需要解释、被理解还是补救？你提出的补救有得到对方确认吗？", agreement: "下一次失约时先说清影响，再说明情况，最后确认一个自己做得到的补救和时间；不要用一次道歉要求对方立刻原谅。", review: "约定时间后检查补救是否完成，以及是否需要调整原先承诺。", meanings: ["你通常先说明事情发生的背景", "你通常先了解对方受到的影响", "你通常先尝试修补实际后果", "你需要先整理，再作出回应"] },
  space: { check: "哪些时间希望保留给自己，哪些共同安排需要提前约？临时变动怎样确认？", agreement: "各自先保留一段个人时间，再商定一段共同时间；改动要重新询问，不能把对方没安排解释成默认有空。", review: "周末后各说：个人安排有没有被挤占？共同时间是否有质量？", meanings: ["你倾向先尊重已经安排好的个人时间", "你希望共同活动得到较高优先级", "你愿意重新分配个人与共同时间", "你希望先确认双方在这件事上的重要程度"] },
  money: { check: "每次预算上限、分担方式和临时超支由谁确认？相同比例与相同金额需要分开说清。", agreement: "只针对下一次活动，各报可负担的预算，再确认具体金额、付款方式与超支前的确认步骤；不要求展示账户或收入证明。", review: "活动后确认：有没有超出承受范围、欠款或不好意思开口的部分？", meanings: ["你偏好明确一致的分担规则，具体金额或比例还需确认", "你希望支出考虑双方负担能力", "你偏好轮流承担并保留核对机会", "你希望先让活动符合预算再讨论分担"] },
  chores: { check: "同一项任务怎样算完成？谁发现、安排和补位？这些也算分工。", agreement: "选三项重复事务，分别写明负责人、完成标准与做不到时的补位规则；安排一周后重新核对负担。", review: "一周后检查：是否有人仍承担全部提醒、检查和收尾？", meanings: ["你希望责任相对固定、容易预期", "你希望分工随实际时间调整", "你希望通过轮换分担重复任务", "你希望任务和标准先明确再分配"] },
  family: { check: "谁有决定权，谁只提供意见？哪些私人信息不希望转告亲友？", agreement: "选择一件具体安排，先由双方确认决定与可分享范围，再商定谁向各自亲友回应；未经同意不公开对方经历。", review: "沟通后确认：双方决定是否被保留？有没有未经同意的转述？", meanings: ["你希望两个人先形成共同回应", "你偏好各自处理与自己亲友的沟通", "你倾向在相关人参与下直接沟通", "你希望由事情的相关性决定参与范围"] },
  commitment: { check: "所谓确定关系具体包含什么？是否排他、如何公开，以及未确定期间的边界都需要单独确认。", agreement: "各自说出目前愿意承诺、尚未确定和不能接受的事；约定一次再讨论的日期，未达成共识的事项不算默认同意。", review: "到约定日期重新确认双方意愿，不以继续相处代替明确回应。", meanings: ["你希望进一步投入前获得清楚的关系约定", "你愿意随相处逐步确认承诺", "你倾向在具体需要出现时讨论承诺", "你对承诺节奏还没有明确答案"] },
  future: { check: "分别列出居住、工作、婚姻与生育的当前立场：希望、未定还是明确不愿意？讨论时间相同不等于方向相同。", agreement: "本周只选一个最重要的未来议题，各说当前立场、是否可能改变及愿意讨论的条件；重要底线相反时先确认分歧，不用试行替代决定。", review: "记录哪些已经明确、哪些仍未定；按双方同意的时间再谈，不把未定写成将来一定会同意。", meanings: ["你希望较早了解长期方向", "你希望表达偏好并保留变化空间", "你倾向临近决策时再讨论", "你的长期规划有明确部分，也有待确定部分"] },
  privacy: { check: "哪些信息愿意分享、用途是什么、何时停止？不共享设备或位置本身不能推导为不信任。", agreement: "逐项询问是否愿意、分享范围和期限；拒绝与撤回都有效，不以交换密码或持续定位作为证明感情的条件。", review: "确认分享是否仍出于自愿、是否能停止；有一方不愿意就停止对应分享。", meanings: ["你希望隐私分享有清楚的范围与期限", "你希望保留设备、位置或聊天的私人空间", "你只愿意按明确用途临时分享", "你需要先讨论再决定是否分享"] },
  intimacy: { check: "什么表达方式在当下让双方都舒服？不愿意、犹豫和改变主意时怎样回应？", agreement: "每次身体接触都以当下双方愿意为前提；不愿意或不确定就停下，可以询问是否想换成其他表达，也可以什么都不做。", review: "检查彼此能否自在说不、是否得到尊重；不把事先约定当作持续同意。", meanings: ["你希望当下直接表达愿意与否", "你希望找到双方都舒服的表达方式", "你希望先留时间，再确认彼此意愿", "你希望结合情境决定，并随时保留改变主意的空间"] },
};

export function priorityQuestions(questions: RelationshipQuestion[], profiles: RelationshipProfile[]) {
  // Sort only for reading order. This is not a compatibility or risk score.
  return [...questions].sort((a, b) => {
    const tier = (q: RelationshipQuestion) => {
      const answers = profiles.map((p) => p.answers[q.id]);
      const important = answers.some((v) => v.importance === "high");
      const firm = answers.some((v) => v.flexibility === "unwilling");
      const different = answers.length === 2 && answers[0].option !== answers[1].option;
      return [important && firm, important, different, firm].map(Number);
    };
    const left = tier(a), right = tier(b);
    for (let i = 0; i < left.length; i++) if (left[i] !== right[i]) return right[i] - left[i];
    return 0;
  });
}

export function topicDecision(q: RelationshipQuestion, profiles: RelationshipProfile[]) {
  const answers = profiles.map((p) => p.answers[q.id]);
  if (q.id === "privacy" || q.id === "intimacy") return { label: "先确认同意与边界", text: "只讨论双方自愿接受的方式；调整意愿不代表同意任何具体要求。" };
  if (answers.length === 1) return answers[0].flexibility === "unwilling"
    ? { label: "先说明边界", text: "你选择了不愿调整。先确认这条边界具体指什么，再向对方说明，不需要为了完成行动建议而让步。" }
    : { label: "把偏好说具体", text: "先从一次真实情境验证这项需要；有条件调整时，把条件说清楚，不预设对方同意。" };
  const same = answers[0].option === answers[1].option;
  if (!same && answers.every((a) => a.flexibility === "unwilling")) return { label: "先确认能否接受分歧", text: "双方表达不同且都不愿调整。先各自确认底线及继续相处的条件；这里不能直接给出折中承诺。" };
  if (!same && answers.some((a) => a.flexibility === "unwilling")) return { label: "先核对边界", text: "至少一方不愿调整。先核对边界是否被准确理解，另一方可以接受或拒绝，不默认由愿意调整的人承担全部改变。" };
  return same
    ? { label: "相同答案，仍需核对细节", text: "共同点只来自选项相同。先用同一个真实场景确认做法、频率和范围，再决定是否试行。" }
    : { label: "可以讨论试行条件", text: "双方尚未表明完全拒绝调整。先询问各自愿意接受的条件，只有都同意后才试行。" };
}
