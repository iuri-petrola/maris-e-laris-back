import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.produto.deleteMany();

  await prisma.produto.createMany({
    data: [
      {
        nome: 'Colecao destaque',
        imagemUrl: '/files/DevOps-Pro.png'
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
