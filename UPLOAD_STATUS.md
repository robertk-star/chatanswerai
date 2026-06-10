# Upload Status

The ChatAnswerAI repository was initialized on GitHub.

The full Phase 1 source package was prepared locally from:

- CashOfferChat-main (9).zip
- Generic Business Chat Phase 1 Foundation replacement files

The prepared full source package should be uploaded at the repository root with no nested folder.

## Required after upload

Run this SQL migration in Supabase:

```text
sql/020_generic_business_chat_foundation.sql
```

## Vercel environment variables

No new Vercel environment variables are required for Phase 1.

## Expected result

After upload and SQL migration, the app should show generic business chat settings, generic lead form labels, and the updated AI prompt that supports multiple business types while keeping Home Buyer as one template.
