// Проверка пароля администратора.
// Пароль задаётся переменной окружения ADMIN_PASSWORD в настройках Vercel.
// Если переменная не задана — используется значение по умолчанию.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "SVET1423";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const password = body && body.password;
  if (password && password === ADMIN_PASSWORD) {
    res.status(200).json({ ok: true });
  } else {
    res.status(401).json({ ok: false });
  }
}
