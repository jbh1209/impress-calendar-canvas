
-- Remove the problematic recursive RLS policy first
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Add a new admin management policy using the has_role() SECURITY DEFINER helper
CREATE POLICY "Admins can manage all roles (SECURITY DEFINER)"
    ON public.user_roles
    FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- Re-add (or keep) policy for users to see their own roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Only allow normal users to add the 'user' role for themselves
DROP POLICY IF EXISTS "Normal users can insert own user role" ON public.user_roles;
CREATE POLICY "Normal users can insert own user role"
    ON public.user_roles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id AND role = 'user');
