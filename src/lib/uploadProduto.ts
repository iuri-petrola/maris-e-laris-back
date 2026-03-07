import fs from 'fs';
import multer from 'multer';
import path from 'path';

const filesDir = process.env.FILES_DIR || '/mnt/files-maris-laris';
const productsDir = path.join(filesDir, 'produtos');

if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, productsDir);
  },
  filename: (_req, file, cb) => {
    const originalExt = path.extname(file.originalname) || '.jpg';
    const originalBase = path.basename(file.originalname, originalExt);
    const safeBase =
      originalBase
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9-_]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase() || 'imagem';

    let fileName = `${safeBase}${originalExt.toLowerCase()}`;
    let suffix = 1;

    // Evita sobrescrever arquivo existente quando o nome original se repete.
    while (fs.existsSync(path.join(productsDir, fileName))) {
      fileName = `${safeBase}-${suffix}${originalExt.toLowerCase()}`;
      suffix += 1;
    }

    cb(null, fileName);
  }
});

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

export const uploadProduto = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Formato de imagem invalido. Use JPG, PNG ou WEBP.'));
    }
    return cb(null, true);
  }
});
