# ChatAnswerAI QA Checklist

Use this after major deploys.

## 1. Public pages

- [ ] `/`
- [ ] `/widget-demo`
- [ ] `/widget.js`
- [ ] `/api/widget/settings?siteId=demo`

## 2. Admin login and core admin routes

- [ ] `/admin/login`
- [ ] `/admin`
- [ ] `/admin/system`
- [ ] `/admin/businesses`
- [ ] `/admin/onboarding`
- [ ] `/admin/sites`
- [ ] `/admin/clients`
- [ ] `/admin/settings`
- [ ] `/admin/analytics`

## 3. Admin dynamic pages

Open these from links, not by typing IDs manually:

- [ ] `/admin/businesses/[id]`
- [ ] `/admin/sites/[id]`
- [ ] `/admin/clients/[id]`
- [ ] `/admin/leads/[id]`

## 4. Client routes

- [ ] `/client/login`
- [ ] `/client`
- [ ] `/client/leads/[id]`
- [ ] `/client/sites`
- [ ] `/client/sites/[id]`
- [ ] `/client/analytics`
- [ ] `/client/integrations`
- [ ] `/client/settings`
- [ ] `/client/account`

## 5. Lead flow

- [ ] Open widget
- [ ] Ask an FAQ question
- [ ] Open quote/intake form
- [ ] Submit lead with name, phone, city/address
- [ ] Confirm lead appears in Supabase
- [ ] Confirm lead appears in admin dashboard
- [ ] Confirm lead appears in client dashboard
- [ ] Open lead detail
- [ ] Change lead status
- [ ] Add internal note
- [ ] Export lead CSV

## 6. Widget site flow

- [ ] Create/edit widget site in `/admin/sites`
- [ ] Open site detail
- [ ] Copy embed code
- [ ] Confirm allowed domains display
- [ ] Client can view site from `/client/sites`
- [ ] Client can update allowed domains

## 7. Business/client flow

- [ ] Onboard new business from `/admin/onboarding`
- [ ] Confirm business appears in `/admin/businesses`
- [ ] Confirm widget site appears in `/admin/sites`
- [ ] Create or confirm client user
- [ ] Client can log in
- [ ] Client only sees leads/sites for assigned business

## 8. Optional integrations

- [ ] Resend lead email works, if configured
- [ ] Webhook test works, if configured
- [ ] OpenAI chat works, if configured
- [ ] Safe fallback answers work when OpenAI is not configured
