import bcrypt from 'bcryptjs';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

type LoginInput = {
  username: string;
  password: string;
};

type LoginResult = {
  token: string;
  username: string;
};

export async function loginAdmin(input: LoginInput): Promise<LoginResult | null> {
  const jwtSecret = process.env.JWT_SECRET;
  const tokenExpiresIn = process.env.TOKEN_EXPIRES_IN || '8h';

  if (!jwtSecret) {
    throw new Error('Variavel JWT_SECRET e obrigatoria.');
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { username: input.username }
  });

  if (!adminUser || !adminUser.ativo) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(input.password, adminUser.passwordHash);

  if (!passwordMatches) {
    return null;
  }

  const token = jwt.sign(
    { sub: adminUser.username, role: 'admin' },
    jwtSecret as Secret,
    { expiresIn: tokenExpiresIn } as SignOptions
  );

  return {
    token,
    username: adminUser.username
  };
}

export function verifyAdminToken(token: string) {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('Variavel JWT_SECRET nao configurada.');
  }

  return jwt.verify(token, jwtSecret as Secret);
}


type ClientLoginInput = {
  nome: string;
  password: string;
};

type ClientLoginResult = {
  token: string;
  nome: string;
};

export async function loginClient(input: ClientLoginInput): Promise<ClientLoginResult | null> {
  const jwtSecret = process.env.JWT_SECRET;
  const tokenExpiresIn = process.env.TOKEN_EXPIRES_IN || '8h';

  if (!jwtSecret) {
    throw new Error('Variavel JWT_SECRET e obrigatoria.');
  }

  const clientUser = await prisma.clientUser.findUnique({
    where: { nome: input.nome }
  });

  if (!clientUser || !clientUser.ativo) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(input.password, clientUser.passwordHash);

  if (!passwordMatches) {
    return null;
  }

  const token = jwt.sign(
    { sub: clientUser.nome, role: 'client' },
    jwtSecret as Secret,
    { expiresIn: tokenExpiresIn } as SignOptions
  );

  return {
    token,
    nome: clientUser.nome
  };
}
