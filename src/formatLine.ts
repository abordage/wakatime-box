const TIME = {
  SECONDS_IN_DAY: 24 * 60 * 60,
  SECONDS_IN_HOUR: 60 * 60,
  SECONDS_IN_MINUTE: 60,
} as const;

const BAR_CHART = {
  SIZE: 23,
  FRACTION_UNIT: 8,
  EMPTY: '\u2591',
  FULL: '\u2588',
  CHARS: '\u2591\u258F\u258E\u258D\u258C\u258B\u258A\u2589\u2588',
} as const;

const FORMAT = {
  NAME_LENGTH_OLD: 12,
  NAME_LENGTH_NEW: 15,
  NAME_TRUNCATE_LENGTH: 10,
  TIME_PADDING: 9,
  TIME_PADDING_NEW: 8,
  PERCENT_PADDING: 5,
  PERCENT_PADDING_NEW: 28,
  TIME_ICON: '\uD83D\uDD53',
  ELLIPSIS: '...',
  DOT: '.',
} as const;

export function formatLine(
  name: string,
  totalSeconds: number,
  percent: number,
  useOldFormat: boolean
): string {
  const displayName = truncateString(name, FORMAT.NAME_TRUNCATE_LENGTH);
  const formattedTime = formatTime(totalSeconds);
  const formattedPercent = percent.toFixed(1);

  return useOldFormat
    ? formatOldLine(displayName, formattedTime, formattedPercent, percent)
    : formatNewLine(displayName, formattedTime, formattedPercent);
}

function formatTime(seconds: number): string {
  const days = Math.floor(seconds / TIME.SECONDS_IN_DAY);
  if (days > 0) {
    const hours = Math.floor((seconds % TIME.SECONDS_IN_DAY) / TIME.SECONDS_IN_HOUR);
    return `${days}d ${hours}h`;
  }

  const hours = Math.floor(seconds / TIME.SECONDS_IN_HOUR);
  if (hours > 0) {
    const minutes = Math.floor((seconds % TIME.SECONDS_IN_HOUR) / TIME.SECONDS_IN_MINUTE);
    return `${hours}h ${minutes}m`;
  }

  const minutes = Math.floor(seconds / TIME.SECONDS_IN_MINUTE);
  if (minutes > 0) {
    const secs = Math.floor(seconds % TIME.SECONDS_IN_MINUTE);
    return `${minutes}m ${secs}s`;
  }

  return `${Math.round(seconds)}s`;
}

function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - FORMAT.ELLIPSIS.length) + FORMAT.ELLIPSIS;
}

function generateBarChart(percent: number): string {
  const fraction = Math.floor((BAR_CHART.SIZE * BAR_CHART.FRACTION_UNIT * percent) / 100);
  const fullBars = Math.floor(fraction / BAR_CHART.FRACTION_UNIT);
  const semiBarIndex = fraction % BAR_CHART.FRACTION_UNIT;

  if (fullBars >= BAR_CHART.SIZE) {
    return BAR_CHART.FULL.repeat(BAR_CHART.SIZE);
  }

  const partialBar = BAR_CHART.CHARS[semiBarIndex];
  const emptyBars = BAR_CHART.EMPTY.repeat(BAR_CHART.SIZE - fullBars - 1);

  return BAR_CHART.FULL.repeat(fullBars) + partialBar + emptyBars;
}

function formatOldLine(
  name: string,
  time: string,
  percent: string,
  percentValue: number
): string {
  const paddedName = name.padEnd(FORMAT.NAME_LENGTH_OLD);
  const timeWithIcon = `${FORMAT.TIME_ICON} ${time.padEnd(FORMAT.TIME_PADDING)}`;
  const bar = generateBarChart(percentValue);
  const paddedPercent = percent.padStart(FORMAT.PERCENT_PADDING) + '%';

  return [paddedName, timeWithIcon, bar, paddedPercent].join(' ');
}

function formatNewLine(name: string, time: string, percent: string): string {
  const paddedName = name.padEnd(FORMAT.NAME_LENGTH_NEW, FORMAT.DOT);
  const paddedTime = (time + ' ').padEnd(FORMAT.TIME_PADDING_NEW, FORMAT.DOT);
  const paddedPercent = percent.padStart(FORMAT.PERCENT_PADDING_NEW, FORMAT.DOT) + '%';

  return paddedName + ' ' + paddedTime + paddedPercent;
}
