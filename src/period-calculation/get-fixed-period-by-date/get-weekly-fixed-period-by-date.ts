import { SupportedCalendar } from '../../types'
import { generateFixedPeriodsWeekly } from '../generate-fixed-periods/index'
import { PeriodType, FixedPeriod } from '../types'

type GetWeeklyFixedPeriodByDate = (args: {
    periodType: PeriodType
    date: string
    calendar: SupportedCalendar
}) => FixedPeriod

const getWeeklyFixedPeriodByDate: GetWeeklyFixedPeriodByDate = ({
    periodType,
    date,
    calendar,
}) => {
    const year = parseInt(date.substring(0, 4), 10)
    const weeklyPeriods = generateFixedPeriodsWeekly({
        year,
        calendar,
        periodType,
        startingDay: 1,
    })

    // if start date of first period of year is after current date get last
    // period of last year
    if (date < weeklyPeriods[0].startDate) {
        return generateFixedPeriodsWeekly({
            year: year - 1,
            calendar,
            periodType,
            startingDay: 1,
        }).slice(-1)[0]
    }

    const fixedPeriod = weeklyPeriods.find((currentPeriod) => {
        return (
            // On or after start date of current period
            date >= currentPeriod.startDate &&
            // On or before end date of current period
            date <= currentPeriod.endDate
        )
    })

    if (fixedPeriod) {
        return fixedPeriod
    }

    throw new Error(
        `Something went wrong retrieving the fixed period of type "${periodType}" for date "${date}"`
    )
}

export default getWeeklyFixedPeriodByDate
