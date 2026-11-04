export function authorizationHeader(secret: string): string {
  const value = secret.trim().replace(/^Bearer\s+/i, '');

  if (value.startsWith('waka_tok_')) {
    return `Bearer ${value}`;
  }

  return `Basic ${Buffer.from(value).toString('base64')}`;
}
