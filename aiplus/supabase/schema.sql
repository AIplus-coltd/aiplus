-- Users table
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  user_id text unique not null,
  email text unique not null,
  phone_number text unique not null,
  birth_date date not null,
  password_hash text not null,
  is_email_verified boolean default false,
  is_phone_verified boolean default false,
  email_verification_hash text,
  email_verification_expires timestamptz,
  sms_verification_hash text,
  sms_verification_expires timestamptz,
  login_sms_hash text,
  login_sms_expires timestamptz,
  failed_login_count int default 0,
  locked_until timestamptz,
  last_login_ip text,
  last_login_at timestamptz,
  delete_requested_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id) on delete cascade,
  token_hash text not null,
  ip_address text,
  user_agent text,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists password_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id) on delete cascade,
  password_hash text not null,
  created_at timestamptz default now()
);

create table if not exists password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id) on delete cascade,
  reset_hash text not null,
  sms_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_refresh_tokens_user on refresh_tokens(user_id);
create index if not exists idx_password_history_user on password_history(user_id);
create index if not exists idx_reset_tokens_user on password_reset_tokens(user_id);

-- Products table (user出品商品)
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references app_users(id) on delete cascade,
  name text not null,
  description text,
  price int not null,
  image_url text,
  category text,
  stock int default 1,
  sold_count int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sales table (売上記録)
create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  seller_id uuid references app_users(id) on delete cascade,
  buyer_id uuid references app_users(id) on delete cascade,
  order_id text not null unique,
  amount int not null,
  buyer_name text,
  buyer_email text,
  buyer_address text,
  status text default 'completed',
  created_at timestamptz default now()
);

-- Indexes for products and sales
create index if not exists idx_products_seller on products(seller_id);
create index if not exists idx_products_category on products(category);
create index if not exists idx_sales_seller on sales(seller_id);
create index if not exists idx_sales_buyer on sales(buyer_id);
create index if not exists idx_sales_product on sales(product_id);
