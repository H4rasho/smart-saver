# Movement API

## Authenticated web API

- `GET /movements` lists movements for the Clerk user represented by the
  `Authorization: Bearer <session-token>` header.
- `POST /movements` creates a movement for that same authenticated Clerk user.

Client-supplied owner IDs are ignored. These routes continue to use the
existing Clerk bearer-token flow.

## iOS Shortcuts API

`POST /movements/shortcut` creates one movement without requiring a short-lived
Clerk session token.

Set these variables on the API server:

```env
SMARTSAVER_SHORTCUT_API_KEY=replace-with-a-generated-revocable-key
SMARTSAVER_SHORTCUT_OWNER_CLERK_USER_ID=user_your_clerk_id
SMARTSAVER_SHORTCUT_TIME_ZONE=America/Santiago
OPENAI_API_KEY=replace-with-a-server-side-openai-key
# Optional; defaults to gpt-5.4
SMARTSAVER_SHORTCUT_OPENAI_MODEL=gpt-5.4
```

Send the dedicated key in the custom header:

```http
X-SmartSaver-Shortcut-Key: <smart-saver-shortcut-api-key>
Content-Type: application/json
```

The request body contains the natural-language text captured by the Shortcut:

```json
{
	"text": "I spent 120.5 on groceries yesterday"
}
```

The server maps the valid key to exactly the configured Clerk owner ID. Any
owner or user ID included in the request body is ignored. It sends the text to
OpenAI with a strict structured-output schema and an explicit local date in the
configured time zone. The model returns semantic category and movement type
names, never trusted numeric IDs. The API resolves those names only against the
configured owner's categories and the server's movement types, then reuses the
same validation and persistence path as `POST /movements`.

Missing or invalid keys return `401`. Empty, ambiguous, unknown, malformed, or
unresolvable interpretations return `422` without persistence. OpenAI provider
failures return `503` without persistence. The endpoint currently has no
persistent idempotency key, so clients should not automatically retry a request
after an uncertain network outcome.

Never put `CLERK_SECRET_KEY` in an iOS Shortcut. Rotate or revoke the dedicated
SmartSaver key by changing `SMARTSAVER_SHORTCUT_API_KEY` on the API server.
Keep `OPENAI_API_KEY` exclusively on the API server.
