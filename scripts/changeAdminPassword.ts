import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { stdin as input, stdout as output } from 'node:process';
import readline from 'node:readline/promises';
import { prisma } from '../src/lib/prisma';

async function promptValue(label: string): Promise<string> {
  const rl = readline.createInterface({ input, output });

  try {
    return (await rl.question(label)).trim();
  } finally {
    rl.close();
  }
}

async function promptHiddenValue(label: string): Promise<string> {
  return new Promise((resolve) => {
    let value = '';

    output.write(label);
    input.resume();
    input.setRawMode?.(true);
    input.setEncoding('utf8');

    const onData = (chunk: string) => {
      const char = String(chunk);

      if (char === '\r' || char === '\n') {
        input.setRawMode?.(false);
        input.pause();
        input.removeListener('data', onData);
        output.write('\n');
        resolve(value.trim());
        return;
      }

      if (char === '\u0003') {
        input.setRawMode?.(false);
        input.pause();
        input.removeListener('data', onData);
        process.exit(1);
      }

      if (char === '\u007f') {
        if (value.length > 0) {
          value = value.slice(0, -1);
          output.write('\b \b');
        }
        return;
      }

      value += char;
      output.write('*');
    };

    input.on('data', onData);
  });
}

async function main() {
  const username = process.argv[2] || (await promptValue('username: '));
  const password = process.argv[3] || (await promptHiddenValue('New password: '));

  if (!username || !password) {
    throw new Error('Informe username e nova senha.');
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { username }
  });

  if (!adminUser) {
    throw new Error(`Admin "${username}" nao encontrado.`);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.update({
    where: { username },
    data: {
      passwordHash
    }
  });

  console.log(`Senha do usuario "${username}" atualizada com sucesso.`);
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
