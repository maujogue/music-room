import { useMemo } from 'react';
import * as Localization from 'expo-localization';
import { DateTime, Duration } from 'luxon';

type UseEventDateOptions = {
  timezone?: string;
  locale?: string;
  showTime?: string;
};

export const useEventDate = (
  startISO: string,
  endISO: string,
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
    const end = (endISO ? DateTime.fromISO(endISO, { zone: timezone }) : start) // fallback if end missing
      .setLocale(locale);

    const now = DateTime.now().setZone(timezone);
    const isCurrentYear = start.year === now.year && end.year === now.year;
    const isSameDay = start.hasSame(end, 'day');

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
    const endDateLabel = isCurrentYear
      ? fmtDayMonthNoYear(end)
      : fmtDayMonthYear(end);

    const dur = end.diff(start);
    const durMinutes = Math.max(0, Math.round(dur.as('minutes')));
    const durHoursFloat = dur.as('hours');
    const durHuman = (() => {
      if (durMinutes < 1) return 'less than 1 min';
      const d = Duration.fromObject({ minutes: durMinutes }).shiftTo(
        'days',
        'hours',
        'minutes'
      );
      const parts: string[] = [];
      if (d.days) parts.push(`${d.days} d`);
      if (d.hours) parts.push(`${d.hours} h`);
      if (d.minutes && d.days === 0) parts.push(`${d.minutes} min`);
      return parts.join(' ') || `${Math.round(durHoursFloat)} h`;
    })();

    let rangeLabel: string;
    if (isSameDay) {
      if (showTime) {
        // "9 sept. 20:00–22:00"
        rangeLabel = `${startDateLabel} ${fmtTime(start)}–${fmtTime(end)}`;
      } else {
        // "9 sept."
        rangeLabel = startDateLabel;
      }
    } else {
      // "9–10 sept." || "30 dec. 2025 — 2 jan. 2026"
      const sameMonth = start.month === end.month && start.year === end.year;
      if (sameMonth && isCurrentYear) {
        rangeLabel = `${start.day}–${fmtDayMonthNoYear(end)}`;
      } else {
        rangeLabel = `${startDateLabel} — ${endDateLabel}`;
      }
    }

    const startFull = showTime
      ? `${startDateLabel} ${fmtTime(start)}`
      : startDateLabel;
    const endFull = showTime ? `${endDateLabel} ${fmtTime(end)}` : endDateLabel;

    return {
      start: {
        date: startDateLabel,
        time: showTime ? fmtTime(start) : undefined,
        full: startFull,
      },
      end: {
        date: endDateLabel,
        time: showTime ? fmtTime(end) : undefined,
        full: endFull,
      },
      rangeLabel,
      duration: {
        ms: dur.toMillis(),
        minutes: durMinutes,
        hours: Math.max(0, durHoursFloat),
        human: durHuman,
      },
      isSameDay,
      isCurrentYear,
      timezone,
      locale,
    };
  }, [startISO, endISO, timezone, locale, showTime]);
};
