// Static entry gate only; it is not server-side authorization.
const PASSWORD_DIGEST = "4dca6e902ba3d8cae51d1bb7746494ac21eee2580bba42e082cf16cb15da3951";

export async function verifyRelationshipPasscode(value: unknown, subtle: SubtleCrypto | undefined = globalThis.crypto?.subtle): Promise<boolean> {
  if (typeof value !== "string" || !/^\d{4}$/.test(value)) return false;
  if (!subtle) throw new Error("当前浏览器无法验证密码，请使用 HTTPS 链接或更换浏览器。");
  const bytes = await subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("") === PASSWORD_DIGEST;
}
