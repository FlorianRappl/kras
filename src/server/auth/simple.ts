import { UserCredentials } from '../types';
import { v4 } from 'uuid';

const activeTokens: Array<string> = [];
const maxTokens = 1024;
let tokenIndex = 0;

export interface SimpleAuthProviderOptions {
  accounts: Array<{
    username: string;
    password: string;
  }>;
}

function newToken() {
  const token = v4().replace(/\-/g, '');
  activeTokens[tokenIndex++] = token;

  if (tokenIndex === maxTokens) {
    tokenIndex = 0;
  }

  return token;
}

export function generateToken(options: SimpleAuthProviderOptions, { password, username }: UserCredentials) {
  const accounts = options.accounts || [];
  const user = username.toUpperCase();

  for (const account of accounts) {
    if (account.username.toUpperCase() === user && account.password === password) {
      return newToken();
    }
  }

  return undefined;
}

export function validateToken(_options: SimpleAuthProviderOptions, token: string) {
  return activeTokens.indexOf(token) !== -1;
}
