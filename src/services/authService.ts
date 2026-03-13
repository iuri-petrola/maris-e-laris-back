import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

type LoginInput = {
  username: string;
  password: string;
};

type LoginResult = {
  token: string;
  username: string;
};

export function loginAdmin(input: LoginInput): LoginResult | null {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const jwtSecret = process.env.JWT_SECRET;
  const tokenExpiresIn = process.env.TOKEN_EXPIRES_IN || '8h';

  if (!adminUsername || !adminPassword || !jwtSecret) {
    throw new Error('Variaveis ADMIN_USERNAME, ADMIN_PASSWORD e JWT_SECRET sao obrigatorias.');
  }

  if (input.username !== adminUsername || input.password !== adminPassword) {
    return null;
  }

  const token = jwt.sign(
    { sub: adminUsername, role: 'admin' },
    jwtSecret as Secret,
    { expiresIn: tokenExpiresIn } as SignOptions
  );

  return {
    token,
    username: adminUsername
  };
}

export function verifyAdminToken(token: string) {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('Variavel JWT_SECRET nao configurada.');
  }

  return jwt.verify(token, jwtSecret as Secret);
}
