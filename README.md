# ChatAnswerAI

Generic AI lead-capture chat widget for service businesses.

This project is built from the CashOfferChat codebase as a separate product. It supports generic service businesses, background screening, home buyers, roofing, HVAC, plumbing, med spas, law firms, auto services, and other local service businesses.

## Phase 1

Generic Business Chat Foundation:

- Business Type
- Business Description
- Services Offered
- Services Not Offered
- Service Area
- Target Customer
- Custom AI Instructions
- Important Disclaimers or Limits
- Generic widget lead form labels
- Generic AI prompt with Home Buyer kept as one template

## Fresh Database Setup

For a new ChatAnswerAI Supabase project, run:

```text
sql/001_chatanswerai_initial_database_setup.sql
```

Do not treat this as a CashOfferChat migration.

## Vercel

The repository root must contain `package.json`.

Default build command:

```text
npm run build
```

No new Vercel environment variables are required for Phase 1 beyond the variables already used by the CashOfferChat base.
