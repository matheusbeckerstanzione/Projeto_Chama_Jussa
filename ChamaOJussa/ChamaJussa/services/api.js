import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Detecção automática de host: localhost para web, IP do Expo para mobile
function getBackendUrl() {
  if (Platform.OS === 'web') {
    return 'http://localhost:5263';
  }

  // Pega o IP do computador que está servindo o app para o Expo Go no celular
  const hostUri = Constants?.expoConfig?.hostUri || Constants?.manifest2?.extra?.expoGo?.debuggerHost || '';
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:5263`;
    }
  }

  // Fallback para o IP local atual da máquina
  return 'http://172.16.36.42:5263';
}

export const BASE_URL = getBackendUrl();
export const API_URL = `${BASE_URL}/api`;

export function getImageUrl(pathOrFilename) {
  if (!pathOrFilename) return null;
  if (pathOrFilename.startsWith('http://') || pathOrFilename.startsWith('https://') || pathOrFilename.startsWith('data:') || pathOrFilename.startsWith('file:') || pathOrFilename.startsWith('blob:')) {
    return pathOrFilename;
  }
  return `${BASE_URL}/imagens/${pathOrFilename}`;
}

// Helper para decodificar Payload JWT
export function decodeJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.log('Erro ao decodificar JWT:', e);
    return null;
  }
}

// Token Storage
export async function getStoredToken() {
  try {
    return await AsyncStorage.getItem('@chamajussa_token');
  } catch {
    return null;
  }
}

export async function setStoredToken(token) {
  try {
    if (token) {
      await AsyncStorage.setItem('@chamajussa_token', token);
    } else {
      await AsyncStorage.removeItem('@chamajussa_token');
    }
  } catch (e) {
    console.log('Erro ao salvar token:', e);
  }
}

// Cliente HTTP Central
async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const token = await getStoredToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Se o body não for FormData, envia como JSON
  let body = options.body;
  if (body && !(body instanceof FormData) && typeof body === 'object') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body,
  });

  // Permite que chamadas com returnNull404 não lancem erro no 404
  if (!response.ok) {
    if (options.returnNull404 && response.status === 404) {
      return null;
    }
    let errorText = '';
    try {
      errorText = await response.text();
    } catch {}
    throw new Error(errorText || `Erro na requisição: ${response.status}`);
  }

  // Se não houver conteúdo (ex: 204 No Content)
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }

  return await response.text();
}

// Helper para anexar imagem ao FormData (Web e Mobile)
async function appendImage(formData, fieldName, imagemUri) {
  if (!imagemUri || typeof imagemUri !== 'string') return;
  // Se já for uma URL do backend, não precisa reenviar
  if (imagemUri.includes('/imagens/')) return;

  const filename = `foto_${Date.now()}.jpg`;
  const type = 'image/jpeg';

  if (Platform.OS === 'web') {
    try {
      const res = await fetch(imagemUri);
      const blob = await res.blob();
      formData.append(fieldName, blob, filename);
    } catch (e) {
      console.log('Erro ao converter imagem na web:', e);
    }
  } else {
    formData.append(fieldName, {
      uri: imagemUri,
      name: filename,
      type: type,
    });
  }
}

// Serviços de Autenticação e Usuário
export const authApi = {
  async login(email, senha) {
    const cleanEmail = email.trim();
    const cleanSenha = senha.trim();

    // 1. Tenta fazer login (se der 404, retorna null sem estourar erro vermelho)
    let data = await request('/Login', {
      method: 'POST',
      body: { email: cleanEmail, senha: cleanSenha },
      returnNull404: true,
    });

    // 2. Se o usuário não existir no banco (retornou null / 404), cadastra-o automaticamente
    if (!data || !data.token) {
      try {
        const form = new FormData();
        form.append('Nome', cleanEmail.split('@')[0]);
        form.append('Email', cleanEmail);
        form.append('Senha', cleanSenha);

        await request('/Usuario', {
          method: 'POST',
          body: form,
        });

        // 3. Faz o login com o usuário recém-criado
        data = await request('/Login', {
          method: 'POST',
          body: { email: cleanEmail, senha: cleanSenha },
        });
      } catch (cadErr) {
        console.log('Erro no cadastro do usuário:', cadErr);
      }
    }

    if (data && data.token) {
      await setStoredToken(data.token);
      const payload = decodeJwt(data.token);
      return {
        token: data.token,
        idUsuario: payload?.jti || payload?.nameid || payload?.sub,
        email: payload?.email || cleanEmail,
      };
    }

    throw new Error('E-mail ou senha inválidos');
  },

  async getUser(id) {
    return await request(`/Usuario/${id}`);
  },

  async updateUser(id, { nome, email, senha, imagemUri }) {
    const formData = new FormData();
    if (nome) formData.append('Nome', nome);
    if (email) formData.append('Email', email);
    if (senha) formData.append('Senha', senha);

    await appendImage(formData, 'Imagem', imagemUri);

    return await request(`/Usuario/${id}`, {
      method: 'PUT',
      body: formData,
    });
  },
};

// Serviços de Ordens de Serviço (OS)
export const osApi = {
  async getAll() {
    const data = await request('/Servico');
    return Array.isArray(data) ? data : [];
  },

  async getById(id) {
    return await request(`/Servico/${id}`);
  },

  async create({ titulo, maquina, local, descricao, situacao = 'aberto', idUsuario, imagemUri }) {
    const formData = new FormData();
    formData.append('Titulo', titulo);
    formData.append('Maquina', maquina || 'Geral');
    formData.append('Localizacao', local);
    formData.append('Descricao', descricao || '');
    formData.append('Situacao', situacao);
    formData.append('IdUsuario', idUsuario);

    await appendImage(formData, 'Imagem', imagemUri);

    return await request('/Servico', {
      method: 'POST',
      body: formData,
    });
  },

  async update(id, { titulo, maquina, local, descricao, situacao, imagemUri }) {
    const formData = new FormData();
    if (titulo) formData.append('Titulo', titulo);
    if (maquina) formData.append('Maquina', maquina);
    if (local) formData.append('Localizacao', local);
    if (descricao) formData.append('Descricao', descricao);
    if (situacao) formData.append('Situacao', situacao);

    await appendImage(formData, 'Imagem', imagemUri);

    return await request(`/Servico/${id}`, {
      method: 'PUT',
      body: formData,
    });
  },

  async delete(id) {
    return await request(`/Servico/${id}`, {
      method: 'DELETE',
    });
  },
};

// Serviços de Notificações
export const notifApi = {
  async getAll() {
    const data = await request('/Notificacao');
    return Array.isArray(data) ? data : [];
  },

  async create({ idUsuario, idServico, mensagem }) {
    return await request('/Notificacao', {
      method: 'POST',
      body: {
        idUsuario,
        idServico,
        mensagem,
      },
    });
  },

  async delete(id) {
    return await request(`/Notificacao/${id}`, {
      method: 'DELETE',
    });
  },
};
