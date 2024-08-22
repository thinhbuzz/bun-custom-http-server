export const isDebug = process.env.DEBUG === 'true';
export const authTokens = process.env.AUTHORIZATION_HEADER?.split(',').map(token => token.trim()) ?? [];
