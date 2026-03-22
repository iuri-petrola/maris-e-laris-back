import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import {
  createProduto,
  deactivateProduto,
  getProdutoById,
  getProdutos,
  reactivateProduto,
  updateProduto
} from '../services/produtoService';

type UploadedFile = {
  filename: string;
};

type ProdutoFilesRequest = Request & {
  files?: {
    image?: UploadedFile[];
  };
};

function normalizeImagemUrl(req: Request, imageUrl: string): string {
  const host = `${req.protocol}://${req.get('host')}`;
  return imageUrl.startsWith('/') ? `${host}${imageUrl}` : imageUrl;
}

function getFilePathFromUrl(imageUrl: string): string | null {
  const filesPublicPath = process.env.FILES_PUBLIC_PATH || '/files';
  const filesDir = process.env.FILES_DIR || '/mnt/files-maris-laris';

  if (!imageUrl.startsWith(filesPublicPath)) {
    return null;
  }

  const relativePath = imageUrl.slice(filesPublicPath.length).replace(/^\/+/, '');
  return path.join(filesDir, relativePath);
}

function deleteFileIfExists(imageUrl: string) {
  const filePath = getFilePathFromUrl(imageUrl);

  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function buildDeactivatedImageUrl(imageUrl: string): string {
  const parsedPath = path.parse(imageUrl);
  return path.posix.join(parsedPath.dir, `${parsedPath.name}-desativado${parsedPath.ext}`);
}

function renameFileToDeactivated(imageUrl: string): string {
  const currentFilePath = getFilePathFromUrl(imageUrl);
  const newImageUrl = buildDeactivatedImageUrl(imageUrl);
  const newFilePath = getFilePathFromUrl(newImageUrl);

  if (!currentFilePath || !newFilePath || !fs.existsSync(currentFilePath)) {
    return imageUrl;
  }

  let targetFilePath = newFilePath;
  let targetImageUrl = newImageUrl;
  let suffix = 1;

  while (fs.existsSync(targetFilePath)) {
    const parsedPath = path.parse(newImageUrl);
    targetImageUrl = path.posix.join(parsedPath.dir, `${parsedPath.name}-${suffix}${parsedPath.ext}`);
    targetFilePath = getFilePathFromUrl(targetImageUrl) as string;
    suffix += 1;
  }

  fs.renameSync(currentFilePath, targetFilePath);
  return targetImageUrl;
}

function buildReactivatedImageUrl(imageUrl: string): string {
  const parsedPath = path.parse(imageUrl);
  const reactivatedName = parsedPath.name.replace(/-desativado(?:-\d+)?$/, '');
  return path.posix.join(parsedPath.dir, `${reactivatedName}${parsedPath.ext}`);
}

function renameFileToReactivated(imageUrl: string): string {
  const currentFilePath = getFilePathFromUrl(imageUrl);
  const newImageUrl = buildReactivatedImageUrl(imageUrl);
  const newFilePath = getFilePathFromUrl(newImageUrl);

  if (!currentFilePath || !newFilePath || !fs.existsSync(currentFilePath)) {
    return imageUrl;
  }

  let targetFilePath = newFilePath;
  let targetImageUrl = newImageUrl;
  let suffix = 1;

  while (fs.existsSync(targetFilePath) && targetFilePath !== currentFilePath) {
    const parsedPath = path.parse(newImageUrl);
    targetImageUrl = path.posix.join(parsedPath.dir, `${parsedPath.name}-reativado-${suffix}${parsedPath.ext}`);
    targetFilePath = getFilePathFromUrl(targetImageUrl) as string;
    suffix += 1;
  }

  fs.renameSync(currentFilePath, targetFilePath);
  return targetImageUrl;
}

export async function listProdutos(req: Request, res: Response) {
  try {
    const produtos = await getProdutos();
    const normalized = produtos.map((item) => ({
      ...item,
      imagemUrl: normalizeImagemUrl(req, item.imagemUrl)
    }));
    res.json(normalized);
  } catch (_error) {
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
}

export async function listAdminProdutos(req: Request, res: Response) {
  try {
    const produtos = await getProdutos(true);
    const normalized = produtos.map((item) => ({
      ...item,
      imagemUrl: normalizeImagemUrl(req, item.imagemUrl)
    }));
    res.json(normalized);
  } catch (_error) {
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
}

export async function createProdutoItem(req: Request, res: Response) {
  const { nome, videoUrl } = req.body as {
    nome?: string;
    videoUrl?: string;
  };
  const files = (req as ProdutoFilesRequest).files;
  const imageFile = files?.image?.[0];

  if (!nome || !imageFile) {
    return res.status(400).json({ error: 'Campos obrigatorios: nome, image(file)' });
  }

  try {
    const filesPublicPath = process.env.FILES_PUBLIC_PATH || '/files';
    const imagePublicUrl = `${filesPublicPath}/produtos/${imageFile.filename}`;
    const created = await createProduto({
      nome: nome.trim(),
      imagemUrl: imagePublicUrl,
      videoUrl: videoUrl?.trim() || null
    });
    return res.status(201).json({
      ...created,
      imagemUrl: normalizeImagemUrl(req, created.imagemUrl)
    });
  } catch (_error) {
    return res.status(500).json({ error: 'Erro ao criar produto' });
  }
}

export async function updateProdutoItem(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { nome, videoUrl } = req.body as {
    nome?: string;
    videoUrl?: string;
  };
  const files = (req as ProdutoFilesRequest).files;
  const imageFile = files?.image?.[0];

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'ID invalido' });
  }

  if (!nome?.trim() && !imageFile && videoUrl === undefined) {
    return res.status(400).json({ error: 'Informe nome e/ou novo arquivo de imagem/link' });
  }

  try {
    const existing = await getProdutoById(id);

    if (!existing) {
      return res.status(404).json({ error: 'Produto nao encontrado' });
    }

    const filesPublicPath = process.env.FILES_PUBLIC_PATH || '/files';
    const imagePublicUrl = imageFile
      ? `${filesPublicPath}/produtos/${imageFile.filename}`
      : undefined;

    const normalizedVideoUrl = videoUrl !== undefined ? videoUrl.trim() || null : undefined;

    const updated = await updateProduto(id, {
      nome: nome?.trim() || undefined,
      imagemUrl: imagePublicUrl,
      videoUrl: normalizedVideoUrl
    });

    if (!updated) {
      return res.status(404).json({ error: 'Produto nao encontrado' });
    }

    if (imageFile) {
      if (existing.imagemUrl && existing.imagemUrl !== updated.imagemUrl) {
        deleteFileIfExists(existing.imagemUrl);
      }
    }

    return res.json({
      ...updated,
      imagemUrl: normalizeImagemUrl(req, updated.imagemUrl)
    });
  } catch (_error) {
    return res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
}

export async function deleteProdutoItem(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'ID invalido' });
  }

  try {
    const existing = await getProdutoById(id);

    if (!existing) {
      return res.status(404).json({ error: 'Produto nao encontrado' });
    }

    const imagemUrl = renameFileToDeactivated(existing.imagemUrl);
    const deleted = await deactivateProduto(id, imagemUrl);

    if (!deleted) {
      return res.status(404).json({ error: 'Produto nao encontrado' });
    }

    return res.json({ message: 'Produto desativado com sucesso' });
  } catch (_error) {
    return res.status(500).json({ error: 'Erro ao desativar produto' });
  }
}

export async function reactivateProdutoItem(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'ID invalido' });
  }

  try {
    const existing = await getProdutoById(id);

    if (!existing) {
      return res.status(404).json({ error: 'Produto nao encontrado' });
    }

    const imagemUrl = renameFileToReactivated(existing.imagemUrl);
    const updated = await reactivateProduto(id, imagemUrl);

    if (!updated) {
      return res.status(404).json({ error: 'Produto nao encontrado' });
    }

    return res.json({
      ...updated,
      imagemUrl: normalizeImagemUrl(req, updated.imagemUrl)
    });
  } catch (_error) {
    return res.status(500).json({ error: 'Erro ao reativar produto' });
  }
}
