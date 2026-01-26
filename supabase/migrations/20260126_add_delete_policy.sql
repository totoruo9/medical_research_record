
-- Enable deletion for ai_reports
create policy "Users can delete own reports" on ai_reports for delete using (auth.uid() = user_id);
