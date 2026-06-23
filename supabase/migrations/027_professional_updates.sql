-- Add video_url and stock_status columns to catalog_items table
alter table public.catalog_items
  add column if not exists video_url text,
  add column if not exists stock_status text default 'in_stock' check (stock_status in ('in_stock', 'out_of_stock', 'limited'));
