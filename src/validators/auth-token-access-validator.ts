import { authTokens } from '../constants.ts';

export function authTokenAccessValidator(request: Request) {
  const authToken = request.headers.get('authorization')?.trim();
  if (!authToken) {
    return false;
  }
  return authToken.startsWith('Bearer') ? authTokens.includes(authToken.split(' ')[1]) : authTokens.includes(authToken);
}
