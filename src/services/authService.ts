import bcrypt from 'bcryptjs';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { ensureClientUser } from './clientUserService';

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
  contato: string;
};

type ClientLoginResult = {
  token: string;
  nome: string;
  contato?: string;
};

type ClientContactLoginInput = {
  nome: string;
  contato: string;
};

type IssueClientTokenOptions = {
  persistent?: boolean;
};

export function issueClientToken(nome: string, options?: IssueClientTokenOptions): ClientLoginResult {
  const jwtSecret = process.env.JWT_SECRET;
  const tokenExpiresIn = process.env.TOKEN_EXPIRES_IN || '8h';

  if (!jwtSecret) {
    throw new Error('Variavel JWT_SECRET e obrigatoria.');
  }

  const signOptions = options?.persistent ? undefined : ({ expiresIn: tokenExpiresIn } as SignOptions);

  const token = signOptions
    ? jwt.sign({ sub: nome, role: 'client' }, jwtSecret as Secret, signOptions)
    : jwt.sign({ sub: nome, role: 'client' }, jwtSecret as Secret);

  return {
    token,
    nome
  };
}

export async function loginClient(input: ClientLoginInput): Promise<ClientLoginResult | null> {
  const clientUser = await prisma.clientUser.findUnique({
    where: { nome: input.nome }
  });

  if (!clientUser || !clientUser.ativo || clientUser.contato !== input.contato) {
    return null;
  }

  return {
    ...issueClientToken(clientUser.nome, { persistent: true }),
    contato: clientUser.contato
  };
}

export async function loginClientByContact(input: ClientContactLoginInput): Promise<ClientLoginResult | null> {
  const clientUser = await ensureClientUser(input.nome, input.contato);

  return {
    ...issueClientToken(clientUser.nome, { persistent: true }),
    contato: clientUser.contato
  };
}

export function verifyClientToken(token: string) {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('Variavel JWT_SECRET nao configurada.');
  }

  return jwt.verify(token, jwtSecret as Secret) as { sub?: string; role?: string };
}
