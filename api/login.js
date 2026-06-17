// Проверка пароля администратора.
// Пароль задаётся ТОЛЬКО секретной переменной окружения ADMIN_PASSWORD
// в настройках Vercel. В коде пароля нет — поэтому его нельзя подсмотреть в репозитории.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!ADMIN_PASSWORD) {
    res.status(500).json({ error: "Не задан ADMIN_PASSWORD в настройках Vercel" });
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
    // задержка против перебора пароля
    await delay(800);
    res.status(401).json({ ok: false });
  }
}
