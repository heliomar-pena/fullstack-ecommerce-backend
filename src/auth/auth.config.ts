import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET?.length <= 2)
    throw new Error('JWT_SECRET must be provided.');

  return {
    jwtSecret: process.env.JWT_SECRET,
    issuer: process.env.JWT_ISSUER,
    salt: process.env.HASH_SALT ?? 10,
  };
});
