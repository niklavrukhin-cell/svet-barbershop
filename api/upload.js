// Загрузка фотографии услуги в Vercel Blob.
//   POST /api/upload?filename=foo.jpg   (тело запроса — бинарные данные файла)
// Требует пароль администратора в заголовке x-admin-password.
// Возвращает { url } — публичную ссылку на загруженное изображение.
import { put } from "@vercel/blob";
import { getBlobToken } from "./_blobToken.js";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// отключаем автоматический разбор тела — нужны сырые байты файла
export const config = {
  api: { bodyParser: false },
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const pass = req.headers["x-admin-password"];
  if (!ADMIN_PASSWORD || !pass || pass !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Неверный пароль" });
    return;
  }

  const filename = (req.query && req.query.filename) || "upload.jpg";
  const contentType = req.headers["content-type"] || "application/octet-stream";

  try {
    const buffer = await readRawBody(req);
    if (!buffer || !buffer.length) {
      res.status(400).json({ error: "Пустой файл" });
      return;
    }
    const safeName = String(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
    const blob = await put("services/" + safeName, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: true,
      token: getBlobToken(),
    });
    res.status(200).json({ url: blob.url });
  } catch (e) {
    res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
}
