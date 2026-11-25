-- Review and run separately in Supabase only after the profile rollout is approved.
-- This bucket is private. All access is mediated by owner/privacy-checked server APIs.
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES ('developer-profile-private','developer-profile-private',false,4194304,
 ARRAY['image/webp','application/pdf'])
ON CONFLICT (id) DO NOTHING;
-- Do not add anon/authenticated storage.objects policies for this bucket.
-- The server-only service-role key uploads files and creates five-minute signed URLs.
