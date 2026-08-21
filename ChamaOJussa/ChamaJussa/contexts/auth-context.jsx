import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, setStoredToken, getStoredToken, getImageUrl } from '@/services/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaura sessão se houver token salvo
  useEffect(() => {
    async function restoreSession() {
      try {
        const savedUserStr = await AsyncStorage.getItem('@chamajussa_user');
        const token = await getStoredToken();
        if (token && savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          setUser(savedUser);
          setIsLoggedIn(true);

          // Atualiza dados mais recentes do backend
          if (savedUser.id) {
            authApi.getUser(savedUser.id).then((u) => {
              if (u) {
                const updated = {
                  id: u.idUsuario,
                  nome: u.nome || '',
                  email: u.email,
                  avatar: u.imagem && u.imagem !== 'default.png' ? getImageUrl(u.imagem) : null,
                };
                setUser(updated);
                AsyncStorage.setItem('@chamajussa_user', JSON.stringify(updated));
              }
            }).catch(() => {});
          }
        }
      } catch (e) {
        console.log('Erro ao restaurar sessão:', e);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = async (email, senha) => {
    try {
      const authResult = await authApi.login(email, senha);
      let userData = {
        id: authResult.idUsuario,
        email: authResult.email,
        nome: '',
        avatar: null,
      };

      // Tenta buscar dados completos do usuário
      if (authResult.idUsuario) {
        try {
          const dbUser = await authApi.getUser(authResult.idUsuario);
          if (dbUser) {
            userData.nome = dbUser.nome || '';
            userData.avatar = dbUser.imagem && dbUser.imagem !== 'default.png' ? getImageUrl(dbUser.imagem) : null;
          }
        } catch {}
      }

      setUser(userData);
      setIsLoggedIn(true);
      await AsyncStorage.setItem('@chamajussa_user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      console.log('Erro no login:', err);
      throw err;
    }
  };

  const logout = async () => {
    setUser(null);
    setIsLoggedIn(false);
    await setStoredToken(null);
    await AsyncStorage.removeItem('@chamajussa_user');
  };

  const updateUser = async (updatedData) => {
    setUser((prev) => {
      const next = prev ? { ...prev, ...updatedData } : updatedData;
      AsyncStorage.setItem('@chamajussa_user', JSON.stringify(next));
      return next;
    });

    if (user?.id) {
      try {
        await authApi.updateUser(user.id, {
          nome: updatedData.nome,
          imagemUri: updatedData.avatar,
        });
      } catch (e) {
        console.log('Erro ao sincronizar atualização de usuário com API:', e);
      }
    }
  };

  const isTI = Boolean(user?.email && user.email.toLowerCase().includes('@senai.com'));
  const isSolicitante = !isTI;
  const userRole = isTI ? 'TI / Manutenção' : 'Solicitante';

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      user, 
      isLoading, 
      login, 
      logout, 
      updateUser,
      isTI,
      isSolicitante,
      userRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
