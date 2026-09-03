import { createUserProfile } from "@/lib/create-user-profile";
import type { UserCreateProfile } from "@/types/income";

export async function POST(request: Request) {
	const body = (await request.json()) as UserCreateProfile;
	try {
		await createUserProfile(body);
		return new Response(
			JSON.stringify({ message: "User created successfully" }),
			{ status: 201 },
		);
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ message: "Error creating user" }), {
			status: 500,
		});
	}
}
