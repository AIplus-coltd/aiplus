-- すべての認証データをクリア
truncate table password_reset_tokens cascade;
truncate table password_history cascade;
truncate table refresh_tokens cascade;
truncate table app_users cascade;
