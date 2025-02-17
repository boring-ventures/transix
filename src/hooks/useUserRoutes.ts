import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ROLE_ROUTES } from '../config/roleRoutes';

export function useUserRoutes() {

  const [userData, setUserData] = useState({ name: '', email: '', avatar: '', role: '', companyId: '' });
  const [allowedRoutes, setAllowedRoutes] = useState<string[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
        const email = user.email || '';
        const avatar = user.user_metadata?.avatar_url || '/avatars/admin.jpg';

        setUserData({
          name,
          email,
          avatar,
          role: '',
          companyId: '',
        });

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, company_id')
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
          setUserData({ name, email, avatar, role: '', companyId: '' });
        }
      }
    };

    getUserData();
  }, []);

  return { userData, allowedRoutes };
}
