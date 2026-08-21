import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { osApi, notifApi, getImageUrl } from '@/services/api';
import { useAuth } from '@/contexts/auth-context';

const OSContext = createContext(undefined);
const STORAGE_KEY = '@chamajussa_os';
const NOTIF_STORAGE_KEY = '@chamajussa_notificacoes';

export function OSProvider({ children }) {
  const { user } = useAuth();
  const [ordens, setOrdens] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Mapeia entidade do backend para o formato usado nas telas
  const mapBackendOS = useCallback((item) => {
    const nomeSolicitante = 
      item.idUsuarioNavigation?.nome || 
      item.idUsuarioNavigation?.email || 
      item.solicitante || 
      (user?.id === item.idUsuario ? (user?.nome || user?.email) : null) || 
      'Solicitante';

    return {
      id: item.idServico || item.id,
      idUsuario: item.idUsuario,
      solicitante: nomeSolicitante,
      solicitanteEmail: item.idUsuarioNavigation?.email || (user?.id === item.idUsuario ? user?.email : null),
      numero: item.numeroServico || 1000,
      titulo: item.titulo || '',
      maquina: item.maquina || '',
      local: item.localização || item.localizacao || item.local || '',
      descricao: item.descricao || '',
      imagem: item.imagem ? getImageUrl(item.imagem) : null,
      status: (item.situacao || item.status || 'aberto').toLowerCase(),
      dataCriacao: item.dataCriacao ? new Date(item.dataCriacao) : new Date(),
    };
  }, [user]);

  const mapBackendNotif = (item) => ({
    id: item.idNotificacao || item.id,
    idUsuario: item.idUsuario,
    idServico: item.idServico,
    titulo: item.mensagem?.includes('criada') 
      ? 'Ordem de Serviço criada' 
      : item.mensagem?.includes('andamento') 
      ? 'Ordem de Serviço em andamento' 
      : item.mensagem?.includes('finalizada') || item.mensagem?.includes('concluída')
      ? 'Ordem de Serviço finalizada' 
      : 'Notificação do Sistema',
    mensagem: item.mensagem || '',
    data: item.dataHora ? new Date(item.dataHora) : new Date(),
  });

  // Carrega dados da API e do Cache Local
  const carregarDados = useCallback(async () => {
    setIsSyncing(true);
    try {
      // 1. Tenta carregar do backend
      const [apiOS, apiNotifs] = await Promise.allSettled([
        osApi.getAll(),
        notifApi.getAll(),
      ]);

      if (apiOS.status === 'fulfilled' && Array.isArray(apiOS.value)) {
        const mapped = apiOS.value.map(mapBackendOS);
        setOrdens(mapped);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      }

      if (apiNotifs.status === 'fulfilled' && Array.isArray(apiNotifs.value)) {
        const mapped = apiNotifs.value.map(mapBackendNotif);
        setNotificacoes(mapped);
        await AsyncStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(mapped));
      }
    } catch (e) {
      console.log('Erro ao sincronizar com backend:', e);
    } finally {
      setIsSyncing(false);
      setIsLoaded(true);
    }
  }, []);

  // Inicialização
  useEffect(() => {
    async function init() {
      // Carrega cache local primeiro para resposta instantânea
      try {
        const [storedOS, storedNotifs] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(NOTIF_STORAGE_KEY),
        ]);

        if (storedOS) {
          const parsed = JSON.parse(storedOS);
          if (Array.isArray(parsed)) {
            setOrdens(parsed.map(os => ({ ...os, dataCriacao: new Date(os.dataCriacao) })));
          }
        }

        if (storedNotifs) {
          const parsedNotifs = JSON.parse(storedNotifs);
          if (Array.isArray(parsedNotifs)) {
            setNotificacoes(parsedNotifs.map(n => ({ ...n, data: new Date(n.data) })));
          }
        }
      } catch (e) {
        console.log('Erro ao ler cache local:', e);
      } finally {
        setIsLoaded(true);
        // Sincroniza com o backend em seguida
        carregarDados();
      }
    }

    init();
  }, [carregarDados]);

  const adicionarNotificacao = useCallback(async (titulo, mensagem, tipo = 'info', idServico = null) => {
    const novaNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      idUsuario: user?.id,
      idServico,
      titulo,
      mensagem,
      tipo,
      data: new Date(),
    };

    setNotificacoes((prev) => [novaNotif, ...prev]);

    // Grava no backend se tiver dados vinculados
    if (user?.id && idServico && idServico.length > 10) {
      try {
        await notifApi.create({
          idUsuario: user.id,
          idServico: idServico,
          mensagem,
        });
      } catch (err) {
        console.log('Erro ao salvar notificação na API:', err);
      }
    }
  }, [user]);

  const criarOS = useCallback(async (dados) => {
    const userId = user?.id || '00000000-0000-0000-0000-000000000000';

    try {
      // 1. Tenta gravar no backend
      await osApi.create({
        titulo: dados.titulo,
        maquina: dados.maquina,
        local: dados.local,
        descricao: dados.descricao,
        situacao: 'aberto',
        idUsuario: userId,
        imagemUri: dados.imagem,
      });

      // 2. Recarrega a lista oficial do banco
      await carregarDados();
    } catch (err) {
      console.log('Erro ao criar OS no backend, gravando localmente:', err);

      // Fallback local caso backend esteja inacessível
      const highestNumero = ordens.reduce((max, os) => Math.max(max, os.numero), 1000);
      const novaOS = {
        ...dados,
        id: `os-${Date.now()}`,
        numero: highestNumero + 1,
        dataCriacao: new Date(),
        status: 'aberto',
      };
      setOrdens((prev) => [novaOS, ...prev]);
    }

    // Notificação de criação
    adicionarNotificacao(
      'Ordem de Serviço criada',
      `Sua OS foi criada, ela já está aguardando atendimento.`,
      'criada'
    );
  }, [user, ordens, carregarDados, adicionarNotificacao]);

  const editarOS = useCallback(async (id, dados) => {
    const osExistente = ordens.find((os) => os.id === id);

    // Atualização otimista local
    setOrdens((prev) =>
      prev.map((os) => (os.id === id ? { ...os, ...dados } : os))
    );

    if (osExistente && dados.status && dados.status !== osExistente.status) {
      const numFormatado = String(osExistente.numero).padStart(3, '0');
      if (dados.status === 'andamento') {
        adicionarNotificacao(
          'Ordem de Serviço em andamento',
          `Sua OS #${numFormatado} está em andamento com a equipe técnica.`,
          'andamento',
          id
        );
      } else if (dados.status === 'concluido') {
        adicionarNotificacao(
          'Ordem de Serviço finalizada',
          `Sua OS #${numFormatado} foi finalizada, logo ela voltará para sua sala.`,
          'finalizada',
          id
        );
      }
    }

    // Grava no backend se o ID for do backend (Guid)
    if (id && id.length > 10 && !id.startsWith('os-')) {
      try {
        await osApi.update(id, {
          titulo: dados.titulo ?? osExistente?.titulo,
          maquina: dados.maquina ?? osExistente?.maquina,
          local: dados.local ?? osExistente?.local,
          descricao: dados.descricao ?? osExistente?.descricao,
          situacao: dados.status ?? osExistente?.status,
          imagemUri: dados.imagem ?? osExistente?.imagem,
        });
      } catch (err) {
        console.log('Erro ao atualizar OS no backend:', err);
      }
    }
  }, [ordens, adicionarNotificacao]);

  const excluirOS = useCallback(async (id) => {
    setOrdens((prev) => prev.filter((os) => os.id !== id));

    if (id && id.length > 10 && !id.startsWith('os-')) {
      try {
        await osApi.delete(id);
      } catch (err) {
        console.log('Erro ao deletar OS na API:', err);
      }
    }
  }, []);

  const limparNotificacoes = useCallback(async () => {
    const list = [...notificacoes];
    setNotificacoes([]);
    await AsyncStorage.removeItem(NOTIF_STORAGE_KEY);

    for (const n of list) {
      if (n.id && n.id.length > 10 && !n.id.startsWith('notif-')) {
        notifApi.delete(n.id).catch(() => {});
      }
    }
  }, [notificacoes]);

  const getOS = useCallback(
    (id) => {
      return ordens.find((os) => os.id === id);
    },
    [ordens]
  );

  if (!isLoaded) {
    return null;
  }

  return (
    <OSContext.Provider value={{
      ordens,
      notificacoes,
      isSyncing,
      carregarDados,
      criarOS,
      editarOS,
      excluirOS,
      getOS,
      adicionarNotificacao,
      limparNotificacoes,
    }}>
      {children}
    </OSContext.Provider>
  );
}

export function useOS() {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error('useOS deve ser usado dentro de um OSProvider');
  }
  return context;
}

