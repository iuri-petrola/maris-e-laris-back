import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { router } from './routes';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());
app.use('/api', router);

const port = process.env.PORT ? Number(process.env.PORT) : 8085;
app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});
