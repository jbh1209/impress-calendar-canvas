
-- Replace 'james@impressweb.co.za' with the email you wish to make admin if necessary.
-- First, find the user uuid:
WITH target_user AS (
  SELECT id FROM auth.users WHERE email = 'james@impressweb.co.za'
)
-- Then insert admin role if not already set:
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM target_user
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = (SELECT id FROM target_user) AND role = 'admin'
);
