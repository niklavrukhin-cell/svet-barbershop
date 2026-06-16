// Находит токен доступа к Vercel Blob независимо от имени переменной окружения.
// Vercel при подключении хранилища может создать переменную с произвольным
// префиксом (например MYPREFIX_READ_WRITE_TOKEN), а не строго
// BLOB_READ_WRITE_TOKEN — поэтому ищем по содержимому/имени.
export function getBlobToken() {
  const env = process.env;
  // 1) стандартное имя
  if (env.BLOB_READ_WRITE_TOKEN) return env.BLOB_READ_WRITE_TOKEN;
  // 2) любое значение, похожее на токен Blob (vercel_blob_rw_...)
  for (const [key, val] of Object.entries(env)) {
    if (typeof val === "string" && val.startsWith("vercel_blob_rw_")) return val;
  }
  // 3) любая переменная, чьё имя заканчивается на READ_WRITE_TOKEN
  for (const [key, val] of Object.entries(env)) {
    if (key.endsWith("READ_WRITE_TOKEN") && val) return val;
  }
  return undefined;
}
