export default function formatLine(name: string, total_seconds: number, percent: number, use_old_format: boolean) {

  if (use_old_format) {
    return [
      cutStr(formatName(name), 10).padEnd(12),
      convertSeconds(total_seconds, true).padEnd(11),
      generateBarChart(percent, 24),
      String(percent.toFixed(1)).padStart(5) + '%',
    ].join(' ');
  }

  return [
    cutStr(formatName(name), 10).padEnd(15, '.'),
    (convertSeconds(total_seconds, false) + ' ').padEnd(8, '.'),

  ].join(' ') + String(percent.toFixed(1)).padStart(33, '.') + '%';
}

function convertSeconds(seconds: number, with_icon: boolean) {
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds -= days * (24 * 60 * 60);
  const hours = Math.floor(seconds / (60 * 60));
  seconds -= hours * (60 * 60);
  const minutes = Math.floor(seconds / (60));
  seconds -= minutes * (60);

  seconds = Math.round(seconds);
  const result = with_icon ? '🕓 ' : '';

  if (days > 0) {
    return result + days + 'd ' + hours + 'h';
  }
  if (hours > 0) {
    return result + hours + 'h ' + minutes + 'm';
  }
  if (minutes > 0) {
    return result + minutes + 'm ' + seconds + 's';
  }
  return result + seconds + 's';
}

function cutStr(str: string, len: number) {
  return str.length > len ? str.substring(0, len - 3) + '...' : str;
}

function formatName(name: string) {
  if (name === 'Blade Template') {
    return 'Blade';
  }
  return name;
}

function generateBarChart(percent: number, size: number) {
  const syms = '░▏▎▍▌▋▊▉█';

  const frac = Math.floor((size * 8 * percent) / 100);
  const barsFull = Math.floor(frac / 8);
  if (barsFull >= size) {
    return syms.substring(8, 9).repeat(size);
  }
  const semi = frac % 8;

  return [syms.substring(8, 9).repeat(barsFull), syms.substring(semi, semi + 1)]
    .join('').padEnd(size, syms.substring(0, 1));
}