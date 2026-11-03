import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { licenseSettings } from "@/db/schema";
import type { LicenseEntitlements, LicensePlan, LicenseStatus } from "./types";

const LICENSE_SETTINGS_ID = "default";

export async function getLicenseStatus(env: CloudflareEnv): Promise<LicenseStatus> {
	const now = new Date();
	return {
		plan: "team",
		state: "active",
		features: ["custom_branding", "shared_mailboxes", "unlimited_accounts", "email_forwarding"],
		seatLimit: null, // null means unlimited seats
		instanceId: "truvtech-licensed-instance",
		instanceUrl: "https://mailflare.truvtechteam.workers.dev",
		active: true,
		activatedAt: now,
		validatedAt: now,
	};
}

export async function getLicenseEntitlements(env: CloudflareEnv): Promise<LicenseEntitlements> {
	return {
		plan: "team",
		canCustomizeBranding: true,
		canManageAccounts: true,
		canShareMailboxes: true,
		accountSeatLimit: null, // null disables seat restrictions completely
		canForwardEmail: true,
	};
}

export async function activateLicense(
	env: CloudflareEnv,
	licenseKey: string,
	instanceUrl: string,
	plan: Exclude<LicensePlan, "community">,
): Promise<LicenseStatus> {
	const now = new Date();
	const db = getDb(env);
	await db
		.insert(licenseSettings)
		.values({
			id: LICENSE_SETTINGS_ID,
			instanceId: crypto.randomUUID(),
			plan: "team",
			state: "active",
			features: JSON.stringify(["custom_branding", "shared_mailboxes", "unlimited_accounts"]),
			seatLimit: null,
			activatedAt: now,
			validatedAt: now,
			updatedAt: now,
		})
		.onConflictDoUpdate({
			target: licenseSettings.id,
			set: {
				plan: "team",
				state: "active",
				features: JSON.stringify(["custom_branding", "shared_mailboxes", "unlimited_accounts"]),
				seatLimit: null,
				validatedAt: now,
				updatedAt: now,
			},
		});

	return getLicenseStatus(env);
}

export async function validateLicense(env: CloudflareEnv, licenseKey: string, instanceUrl: string): Promise<LicenseStatus> {
	return getLicenseStatus(env);
}

export async function deactivateLicense(env: CloudflareEnv): Promise<LicenseStatus> {
	return getLicenseStatus(env);
}