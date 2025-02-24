import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ROLE_ROUTES } from '../config/roleRoutes';
import axios from 'axios';

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

        try {
          // Usar el endpoint de API en lugar de Supabase directamente
          const response = await axios.get(`/api/users?userId=${user.id}`);
          const profile = response.data.profile;

          if (profile) {
            const role = profile.role as keyof typeof ROLE_ROUTES;
            setAllowedRoutes(ROLE_ROUTES[role]);
            setUserData({
              name,
              email,
              avatar,
              role: profile.role,
              companyId: profile.companyId,
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserData({ name, email, avatar, role: '', companyId: '' });
        }
      }
    };

    getUserData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { userData, allowedRoutes };
}
