import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ROLE_ROUTES } from '../config/roleRoutes';

export function useUserRoutes() {
  type UserData = {
    name: string;
    email: string;
    avatar: string;
    role: string;
    companyId?: string; // Campo opcional para la compañía
  };
  const [userData, setUserData] = useState<UserData>({ name: '', email: '', avatar: '', role: '' });
  const [allowedRoutes, setAllowedRoutes] = useState<string[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const email = user.email || '';
        const name = user.user_metadata?.full_name || email.split('@')[0] || 'Usuario';
        const avatar = user.user_metadata?.avatar_url || '/avatars/admin.jpg';

        // Seleccionamos role y companyId del perfil
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
          setUserData({ name, email, avatar, role: '' });
        }
      }
    };

    getUserData();
  }, []);

  return { userData, allowedRoutes };
}
