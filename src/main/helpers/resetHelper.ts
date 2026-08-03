export function getNextWeeklyReset(realmWeeklyReset: Date, startingDate: Date): Date {
  const result = new Date(startingDate)

  result.setHours(
    realmWeeklyReset.getHours(),
    realmWeeklyReset.getMinutes(),
    realmWeeklyReset.getSeconds(),
    realmWeeklyReset.getMilliseconds()
  )

  const daysUntilReset = (realmWeeklyReset.getDay() - startingDate.getDay() + 7) % 7

  result.setDate(result.getDate() + daysUntilReset)

  if (result <= startingDate) {
    result.setDate(result.getDate() + 7)
  }

  return result
}

export function getNextDailyReset(realmDailyReset: Date, startingDate: Date): Date {
  const result = new Date(startingDate)

  result.setHours(
    realmDailyReset.getHours(),
    realmDailyReset.getMinutes(),
    realmDailyReset.getSeconds(),
    realmDailyReset.getMilliseconds()
  )

  if (result <= startingDate) {
    result.setDate(result.getDate() + 1)
  }

  return result
}
