import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ROLE_ROUTES } from '../config/roleRoutes';

export function useUserRoutes() {

  const [userData, setUserData] = useState({ name: '', email: '', avatar: '' });
  const [allowedRoutes, setAllowedRoutes] = useState<string[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserData({
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
          email: user.email || '',
          avatar: user.user_metadata?.avatar_url || '/avatars/admin.jpg',
        });

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          const role = profile.role as keyof typeof ROLE_ROUTES;
          setAllowedRoutes(ROLE_ROUTES[role]);
          setUserData({
            name,
            email,
            avatar,
            role: profile.role,
            companyId: profile.company_id,
          });
        } else {
          setUserData({ name, email, avatar, role: '' });
        }
      }
    };

    getUserData();
  }, []);

  return { userData, allowedRoutes };
}
