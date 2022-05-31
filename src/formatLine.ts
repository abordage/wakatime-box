export default function formatLine(name: string, total_seconds: number, percent: number) {
  return [
    cutStr(name, 10).padEnd(12),
    convertSeconds(total_seconds).padEnd(11),
    generateBarChart(percent, 21),
    String(percent.toFixed(1)).padStart(5) + '%',
  ].join(' ');
}

function convertSeconds(seconds: number) {
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds -= days * (24 * 60 * 60);
  const hours = Math.floor(seconds / (60 * 60));
  seconds -= hours * (60 * 60);
  const minutes = Math.floor(seconds / (60));
  seconds -= minutes * (60);

  seconds = Math.round(seconds);
  const result = '🕓 ';

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