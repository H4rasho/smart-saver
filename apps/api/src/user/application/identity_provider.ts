export type AuthenticatedUser = {
	id: string;
	name: string;
	email: string;
};

export interface IdentityProvider {
	getUser(accessToken: string): Promise<AuthenticatedUser | null>;
}
