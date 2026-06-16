// Чтение и сохранение контента сайта (акция + услуги) в Vercel Blob.
//   GET  /api/content        — отдаёт сохранённый контент (или 204, если его ещё нет)
//   POST /api/content        — сохраняет контент (требует пароль администратора)
import { put, list } from "@vercel/blob";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "SVET1423";
const BLOB_PATH = "content/site-content.json";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { blobs } = await list({ prefix: BLOB_PATH });
      const blob = blobs.find((b) => b.pathname === BLOB_PATH) || blobs[0];
      if (!blob) {
        res.status(204).end();
        return;
      }
      const r = await fetch(blob.url, { cache: "no-store" });
      const data = await r.json();
      res.setHeader("Cache-Control", "no-store, max-age=0");
      res.status(200).json(data);
    } catch (e) {
      // нет хранилища/контента — пусть фронт использует значения по умолчанию
      res.status(204).end();
    }
    return;
  }

  if (req.method === "POST") {
    const pass = req.headers["x-admin-password"];
    if (!pass || pass !== ADMIN_PASSWORD) {
      res.status(401).json({ error: "Неверный пароль" });
      return;
    }
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch { body = null; }
    }
    if (!body || !Array.isArray(body.services)) {
      res.status(400).json({ error: "Некорректные данные" });
      return;
    }
    try {
      await put(BLOB_PATH, JSON.stringify(body), {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 0,
      });
      res.status(200).json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: String(e && e.message ? e.message : e) });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
