export type ReviewGrade = "again" | "hard" | "good" | "easy";

export type SrsCard = {
  ease: number;
  interval_days: number;
  repetitions: number;
  due_at: Date;
};

export function schedule(card: SrsCard, grade: ReviewGrade, now = new Date()) {
  const ease = nextEase(card.ease, grade);
  const repetitions = grade === "again" ? 0 : card.repetitions + 1;
  const interval_days = nextInterval(card, grade, ease, repetitions);
  const due_at = addDays(now, interval_days);

  return { ease, interval_days, repetitions, due_at };
}

function nextEase(current: number, grade: ReviewGrade) {
  const delta = { again: -0.2, hard: -0.15, good: 0, easy: 0.15 }[grade];
  return Math.max(1.3, Number((current + delta).toFixed(2)));
}

function nextInterval(card: SrsCard, grade: ReviewGrade, ease: number, repetitions: number) {
  if (grade === "again") {
    return 0;
  }
  if (repetitions === 1) {
    return grade === "easy" ? 2 : 1;
  }
  if (grade === "hard") {
    return Math.max(1, Math.round(card.interval_days * 1.2));
  }
  if (grade === "easy") {
    return Math.max(2, Math.round(card.interval_days * ease * 1.3));
  }
  return Math.max(1, Math.round(card.interval_days * ease));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}
