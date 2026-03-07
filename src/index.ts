import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { router } from './routes';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());

const filesDir = process.env.FILES_DIR || '/mnt/files-maris-laris';
const filesPublicPath = process.env.FILES_PUBLIC_PATH || '/files';
app.use(filesPublicPath, express.static(path.resolve(filesDir)));

app.use('/api', router);

const port = process.env.PORT ? Number(process.env.PORT) : 8085;
app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});
