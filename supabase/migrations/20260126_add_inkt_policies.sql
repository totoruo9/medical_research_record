-- Enable RLS just in case
alter table inkt_records enable row level security;

-- Add Update Policy
create policy "Users can update own inkt records" 
on inkt_records for update 
using (auth.uid() = user_id);

-- Add Delete Policy (just in case it's missing too, though delete logic existed in code)
create policy "Users can delete own inkt records" 
on inkt_records for delete 
using (auth.uid() = user_id);
