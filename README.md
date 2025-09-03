# NISDF Website — PRO PLUS

**New in this build**
- ✅ **Auto-Approve Membership** on Razorpay webhook (`payment.captured`) using `notes.membership_id` → generates **QR + ID/Certificate PDFs** automatically.
- ✅ **Donation Receipt PDF** auto-generated and (optionally) **emailed** via SMTP.
- ✅ **More Hindi/English** content (About + Home).

## Setup quick notes
- Buckets: `idcards` (private), `certificates` (private), `documents` (public/private ok).
- SQL: use your previous `schema.sql` then run `supabase/extra.sql` (adds `payments` table).
- Razorpay Dashboard → Webhook URL: `/api/webhooks/razorpay` (event: `payment.captured`), secret = `RAZORPAY_WEBHOOK_SECRET`.
- Email: set SMTP_* envs to enable emailing donation receipts.

## Membership Auto-Approval Flow
1. `/membership` → creates **pending** row via `/api/membership/start`.
2. Creates Razorpay **order** with `notes.membership_id=<uuid>`.
3. On capture, webhook updates membership → `approved` + creates PDFs + stores in buckets.

UPI fallback अभी भी manual verification रहेगा (txn_id के आधार पर).

Happy deploying!
