import { hash, verify } from "@node-rs/argon2";

export function hashPassword(password: string) {
  return hash(password, { memoryCost: 19456, timeCost: 2, parallelism: 1 });
}

export async function cekPassword(hashed: string, password: string) {
  try {
    return await verify(hashed, password);
  } catch {
    return false;
  }
}

/** Password awal akun baru / hasil reset massal: username + "123", mis. naufal123. */
export function passwordAwal(username: string) {
  return `${username}123`;
}
