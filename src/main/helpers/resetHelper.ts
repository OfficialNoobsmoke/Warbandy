export function getNextWeeklyReset(realmWeeklyReset: Date, startingDate: Date): Date {
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000

  const diff = startingDate.getTime() - realmWeeklyReset.getTime()
  const weeks = Math.max(0, Math.floor(diff / WEEK_MS) + 1)

  return new Date(realmWeeklyReset.getTime() + weeks * WEEK_MS)
}
