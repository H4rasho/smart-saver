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
```

Send the dedicated key in the custom header:

```http
X-SmartSaver-Shortcut-Key: <smart-saver-shortcut-api-key>
Content-Type: application/json
```

The request body uses the same movement fields as `POST /movements`:

```json
{
  "name": "Groceries",
  "amount": 120.5,
  "category_id": 1,
  "movement_type_id": 3,
  "transaction_date": "2026-09-20"
}
```

The server maps the valid key to exactly the configured Clerk owner ID. Any
owner or user ID included in the request body is ignored. Missing or invalid
keys return `401`; invalid movement data and invalid owner-scoped references
return `422`.

Never put `CLERK_SECRET_KEY` in an iOS Shortcut. Rotate or revoke the dedicated
SmartSaver key by changing `SMARTSAVER_SHORTCUT_API_KEY` on the API server.
