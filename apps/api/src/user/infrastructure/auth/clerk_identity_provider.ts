import { createClerkClient, verifyToken } from "@clerk/backend";

import type {
	AuthenticatedUser,
	IdentityProvider,
} from "../../application/identity_provider.js";

export class ClerkIdentityProvider implements IdentityProvider {
	private readonly clerkClient;

	constructor(private readonly secretKey: string) {
		this.clerkClient = createClerkClient({ secretKey });
	}

	async getUser(accessToken: string): Promise<AuthenticatedUser | null> {
		let token: Awaited<ReturnType<typeof verifyToken>>;

		try {
			token = await verifyToken(accessToken, { secretKey: this.secretKey });
		} catch {
			return null;
		}

		const userId = token.sub;

		if (!userId) {
			return null;
		}

		const user = await this.clerkClient.users.getUser(userId);
		const email = user.primaryEmailAddress?.emailAddress;

		if (!email) {
			return null;
		}

		const name =
			[user.firstName, user.lastName].filter(Boolean).join(" ") || email;

		return { id: user.id, name, email };
	}
}
