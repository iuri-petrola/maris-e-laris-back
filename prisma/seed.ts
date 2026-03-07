import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const filesDir = process.env.FILES_DIR || '/mnt/files-maris-laris';
  const filesPublicPath = process.env.FILES_PUBLIC_PATH || '/files';
  const sourceImagePath = '/home/iuri/Vídeos/1.jpg';
  const productsDir = path.join(filesDir, 'produtos');
  const targetFileName = 'produto-1.jpg';
  const targetImagePath = path.join(productsDir, targetFileName);

  await fs.mkdir(productsDir, { recursive: true });
  await fs.copyFile(sourceImagePath, targetImagePath);

  //await prisma.produto.deleteMany();

  await prisma.produto.createMany({
    data: [
      {
        nome: 'produto 1',
        imagemUrl: `${filesPublicPath}/produtos/${targetFileName}`,
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
