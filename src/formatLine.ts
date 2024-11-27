const CONSTANTS = {
  ICONS: {
    TIME: '🕓',
  },
  NAME_LENGTHS: {
    OLD: 12,
    NEW: 15,
  },
  PADDING_LENGTHS: {
    NEW_1: 8,
    NEW_2: 28,
  },
  SYMBOLS: {
    PERCENT: '%',
    DOT: '.',
    ELLIPSIS: '...',
    BAR: '░▏▎▍▌▋▊▉█',
  },
  BAR_CHART_SIZE: 23,
  FRACTION_UNIT: 8,
  SECONDS_IN: {
    DAY: 24 * 60 * 60,
    HOUR: 60 * 60,
    MINUTE: 60,
  },
};

export default function formatLine(name: string, totalSeconds: number, percent: number, useOldFormat: boolean) {
  const displayName = truncateString(name, 10);
  const formattedSeconds = formatTime(totalSeconds);
  const formattedPercent = percent.toFixed(1).toString();
  return useOldFormat
    ? formatOldLine(displayName, formattedSeconds, formattedPercent, percent)
    : formatNewLine(displayName, formattedSeconds, formattedPercent);
}

function buildTimeString(majorUnit: number, majorLabel: string, seconds: number, majorUnitSeconds: number, minorLabel: string, minorUnitSeconds?: number): string {
  return minorUnitSeconds !== undefined
    ? `${majorUnit}${majorLabel} ${Math.floor((seconds % majorUnitSeconds) / minorUnitSeconds)}${minorLabel}`
    : `${majorUnit}${majorLabel}`;
}

function formatTime(seconds: number): string {
  const {DAY, HOUR, MINUTE} = CONSTANTS.SECONDS_IN;
  const days = Math.floor(seconds / DAY);
  if (days > 0) return buildTimeString(days, 'd', seconds, DAY, 'h', HOUR);
  const hours = Math.floor(seconds / HOUR);
  if (hours > 0) return buildTimeString(hours, 'h', seconds, HOUR, 'm', MINUTE);
  const minutes = Math.floor(seconds / MINUTE);
  if (minutes > 0) return buildTimeString(minutes, 'm', seconds, MINUTE, 's');
  return `${Math.round(seconds)}s`;
}

function truncateString(str: string, len: number): string {
  const {ELLIPSIS} = CONSTANTS.SYMBOLS;
  return str.length > len ? str.substring(0, len - ELLIPSIS.length) + ELLIPSIS : str;
}

function generateBarChart(percent: number): string {
  const {BAR_CHART_SIZE, FRACTION_UNIT, SYMBOLS: {BAR}} = CONSTANTS;
  const frac = Math.floor((BAR_CHART_SIZE * FRACTION_UNIT * percent) / 100);
  const barsFull = Math.floor(frac / FRACTION_UNIT);
  const semiBarIndex = frac % FRACTION_UNIT;
  return barsFull >= BAR_CHART_SIZE
    ? BAR[8].repeat(BAR_CHART_SIZE)
    : BAR[8].repeat(barsFull) + BAR[semiBarIndex].padEnd(BAR_CHART_SIZE, BAR[0]);
}

function formatPercent(percent: string): string {
  return percent.padStart(5) + CONSTANTS.SYMBOLS.PERCENT;
}

function formatTimeWithIcon(seconds: string): string {
  return `${CONSTANTS.ICONS.TIME} ${seconds.padEnd(9)}`;
}

function formatNewTimeDisplay(seconds: string): string {
  return (seconds + ' ').padEnd(CONSTANTS.PADDING_LENGTHS.NEW_1, CONSTANTS.SYMBOLS.DOT);
}

function formatOldLine(name: string, seconds: string, percent: string, percentValue: number) {
  return [
    name.padEnd(CONSTANTS.NAME_LENGTHS.OLD),
    formatTimeWithIcon(seconds),
    generateBarChart(percentValue),
    formatPercent(percent),
  ].join(' ');
}

function formatNewLine(name: string, seconds: string, percent: string) {
  return (
    [
      name.padEnd(CONSTANTS.NAME_LENGTHS.NEW, CONSTANTS.SYMBOLS.DOT),
      formatNewTimeDisplay(seconds),
    ].join(' ') + percent.padStart(CONSTANTS.PADDING_LENGTHS.NEW_2, CONSTANTS.SYMBOLS.DOT) + CONSTANTS.SYMBOLS.PERCENT
  );
}
