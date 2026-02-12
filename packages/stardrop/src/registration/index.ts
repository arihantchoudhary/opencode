import path from "path"
import { Global } from "../global"
import z from "zod"

export namespace Registration {
  export const Info = z.object({
    user_id: z.string().optional(),
    email: z.string(),
    name: z.string(),
    reference: z.string().optional(),
    registered_at: z.string(),
    skipped: z.boolean().optional(),
  })
  export type Info = z.infer<typeof Info>

  const filepath = path.join(Global.Path.data, "registration.json")

  export async function get(): Promise<Info | undefined> {
    const file = Bun.file(filepath)
    const data = await file.json().catch(() => undefined)
    if (!data) return undefined
    const parsed = Info.safeParse(data)
    return parsed.success ? parsed.data : undefined
  }

  export async function set(info: Info) {
    await Bun.write(Bun.file(filepath), JSON.stringify(info, null, 2), {
      mode: 0o600,
    })
  }

  export async function isRegistered(): Promise<boolean> {
    const info = await get()
    return info !== undefined
  }
}
