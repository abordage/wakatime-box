export default function convertSeconds(seconds: number) {
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