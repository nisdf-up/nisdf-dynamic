-- PRO-PLUS schema (same as PRO + payments table)
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  provider text, order_id text, payment_id text, amount numeric, currency text default 'INR',
  status text, email text, contact text, meta jsonb, created_at timestamptz default now()
);
