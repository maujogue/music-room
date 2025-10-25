import { useMemo } from 'react';
import * as Localization from 'expo-localization';
import { DateTime } from 'luxon';

type UseEventDateOptions = {
  timezone?: string;
  locale?: string;
  showTime?: string;
};

export const useEventDate = (
  startISO: string,
  options: UseEventDateOptions = {}
): EventDateLabels => {
  const {
    timezone = Localization.getCalendars?.()[0]?.timeZone || 'UTC',
    locale = Localization.getLocales?.()[0]?.languageTag || 'fr-FR',
    showTime = true,
  } = options;

  return useMemo(() => {
    const start = DateTime.fromISO(startISO, { zone: timezone }).setLocale(
      locale
    );

    const now = DateTime.now().setZone(timezone);
    const isCurrentYear = start.year === now.year;

    const fmtDayMonth = (dt: DateTime) =>
      dt.toLocaleString({
        day: 'numeric',
        month: 'short',
      });

    const fmtDayMonthNoYear = fmtDayMonth;

    const fmtDayMonthYear = (dt: DateTime) =>
      dt.toLocaleString({
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

    const fmtTime = (dt: DateTime) =>
      dt.toLocaleString({
        hour: '2-digit',
        minute: '2-digit',
      });

    const startDateLabel = isCurrentYear
      ? fmtDayMonthNoYear(start)
      : fmtDayMonthYear(start);


    const startFull = showTime
      ? `${startDateLabel} ${fmtTime(start)}`
      : startDateLabel;

    return {
      start: {
        date: startDateLabel,
        time: showTime ? fmtTime(start) : undefined,
        full: startFull,
      },
      isCurrentYear,
      timezone,
      locale,
    };
  }, [startISO, timezone, locale, showTime]);
};
