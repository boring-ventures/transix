// Componente del formulario que maneja la lógica del cliente
'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { z } from "zod";
import { useState } from 'react';

// Esquema para validar el registro del admin
const setupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(3),
});

export default function SetupPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const fullName = formData.get("fullName") as string;

      console.log('Attempting to create user with:', { email, fullName }); // Debug log

      // Validamos la entrada
      setupSchema.parse({ email, password, fullName });

      // Crear el usuario en Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'superadmin'
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      console.log('Auth response:', { authData, authError }); // Debug log

      if (authError) {
        console.error('Auth Error Details:', authError);
        setError(`Error de autenticación: ${authError.message}`);
        return;
      }

      if (!authData.user) {
        setError('No se pudo crear el usuario. Por favor, verifica los logs.');
        return;
      }

      // Iniciar sesión inmediatamente después del registro
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.error('Sign In Error:', signInError);
        setError('Usuario creado pero no se pudo iniciar sesión para crear el perfil.');
        return;
      }

      // Crear el perfil manualmente después de iniciar sesión
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: authData.user.id,
            email: email,
            full_name: fullName,
            role: 'superadmin'
          }
        ])
        .select()
        .single();

      console.log('Profile creation:', { profileData, profileError }); // Debug log

      if (profileError) {
        console.error('Profile Error:', profileError);
        setError('Usuario creado pero hubo un problema al crear el perfil.');
        return;
      }

      // Mostrar mensaje de éxito antes de redirigir
      setError('Usuario y perfil creados exitosamente! Redirigiendo...');
      
      // Esperar un momento antes de redirigir
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);

    } catch (error) {
      console.error('Error completo:', error);
      setError(error instanceof Error ? 
        `Error: ${error.message}` : 
        'Ocurrió un error inesperado. Por favor, verifica los logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center">Setup Superadmin</h1>
        
        {error && (
          <div className={`p-4 rounded-md ${
            error.includes('exitosamente') 
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Email"
            className="input w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Password (min. 8 characters)"
            className="input w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={loading}
            minLength={8}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            name="fullName"
            placeholder="Full Name"
            className="input w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={loading}
            minLength={3}
          />
        </div>

        <button 
          type="submit" 
          className={`w-full p-3 rounded transition-colors ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          disabled={loading}
        >
          {loading ? 'Creando usuario...' : 'Create Superadmin Account'}
        </button>
      </form>
    </div>
  );
}