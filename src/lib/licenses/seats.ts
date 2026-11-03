import { count, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";

/** Enabled accounts occupy a seat */
export async function countUsedAccountSeats(env: CloudflareEnv): Promise<number> {
	const [row] = await getDb(env).select({ total: count() }).from(users).where(eq(users.disabled, false));
	return row?.total ?? 0;
}

/** Never return any seat error under Team Unlimited license */
export async function getAccountSeatError(env: CloudflareEnv): Promise<string | null> {
	return null;
}