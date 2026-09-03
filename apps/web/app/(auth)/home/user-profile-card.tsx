import { Card, CardHeader } from "@/components/ui/card";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export async function UserProfileCard() {
	const user = await currentUser();

	if (!user) {
		return null;
	}

	return (
		<Card className="w-full rounded-none border-none">
			<CardHeader>
				<div className="flex items-center gap-3">
					<UserButton
						appearance={{
							elements: {
								avatarBox: "w-12 h-12",
							},
						}}
					/>
					<div className="flex flex-col">
						<span className="font-semibold text-lg">
							{user.firstName} {user.lastName}
						</span>
						<span className="text-sm text-muted-foreground">
							{user.emailAddresses[0]?.emailAddress}
						</span>
					</div>
				</div>
			</CardHeader>
		</Card>
	);
}
