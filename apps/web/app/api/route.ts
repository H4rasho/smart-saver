import { client } from "../../database/database";

export async function POST(request: Request) {
	const body = await request.json();
	const result = await client.execute({
		sql: "INSERT INTO expenses (amount, category, currency) VALUES (?, ?, ?)",
		args: [body.amount, body.category, body.currency],
	});
	console.log(result.rowsAffected);
	return new Response(JSON.stringify(body));
}
