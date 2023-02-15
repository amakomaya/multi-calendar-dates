import { Intl } from '@js-temporal/polyfill'
import { useMemo } from 'react'
import getValidLocale from '../../utils/getValidLocale'
import { LocaleOptions } from '../useDatePicker'

type UseResolvedLocaleOptionsHook = (
    options: LocaleOptions
) => LocaleOptions & { locale: string }

/**
 * A hook that returns the locale and locale options to be used by the calendar.
 *
 * The order of precedence of how the options are resolved should be:
 *
 * - Prop-values passed to the hook/component
 * - Properties available from the system/user settings resource* (in the future)
 * - Values coming from Intl.DateTimeFormat().resolvedOptions()
 * - Some hardcoded defaults
 *
 * @param options
 * @returns
 */
export const useResolvedLocaleOptions: UseResolvedLocaleOptionsHook = (
    userOptions
) => {
    // validate that the passed locale is valid, use it if valid, otherwise, keep it undefined
    const locale = getValidLocale(userOptions.locale)

    const defaultDateTimeOptions = Intl?.DateTimeFormat?.().resolvedOptions?.()

    const defaultUserOptions = useMemo(
        () => ({
            timeZone: defaultDateTimeOptions.timeZone || 'UTC',
            numberingSystem: defaultDateTimeOptions.numberingSystem || 'latn',
            locale: defaultDateTimeOptions.locale || 'en',
            weekDayFormat: 'narrow' as const, // resolvedOptions seems to not return a value in all major browsers
        }),
        [defaultDateTimeOptions]
    )

    return useMemo(() => {
        /**
         * If no options are provided this will use the values of the user browser
         * If a locale identifier is provided it will use that to populate options
         * If any options are provided these will override the options for the
         * specified locale identifier or browser settings
         */
        const { locale: resolvedLocale, ...resolvedOptions } =
            new Intl.DateTimeFormat(locale, {
                calendar: userOptions.calendar,
                timeZone: userOptions.timeZone as string,
                numberingSystem: userOptions.numberingSystem,
                weekday: userOptions.weekDayFormat,
            }).resolvedOptions()

        return {
            calendar: userOptions.calendar,
            locale: resolvedLocale || defaultUserOptions.locale,
            timeZone: resolvedOptions.timeZone || defaultUserOptions.timeZone,
            numberingSystem:
                resolvedOptions.numberingSystem ||
                defaultUserOptions.numberingSystem,
            weekDayFormat:
                userOptions.weekDayFormat || defaultUserOptions.weekDayFormat,
        }
    }, [defaultUserOptions, locale, userOptions])
}
