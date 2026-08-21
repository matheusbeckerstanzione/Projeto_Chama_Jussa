import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppColors } from '@/constants/theme';
import { useOS } from '@/contexts/os-context';
import { useAuth } from '@/contexts/auth-context';

function formatDateShort(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const statusConfig = {
  aberto: { label: 'Aberta', color: AppColors.statusAberto },
  andamento: { label: 'Em Andamento', color: AppColors.statusAndamento },
  concluido: { label: 'Concluído', color: AppColors.statusConcluido },
};

const FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'aberto', label: 'Abertas' },
  { id: 'andamento', label: 'Em Andamento' },
  { id: 'concluido', label: 'Concluídas' },
];

function OSCard({ item, onPress, onDelete, onPegarChamado, isTI }) {
  const status = statusConfig[item.status] || { label: item.status, color: AppColors.primary };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.cardHeader, { alignItems: 'flex-start' }]}>
        <Text style={styles.cardNumero}>OS - {String(item.numero).padStart(3, '0')}</Text>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={[styles.cardStatusBadge, { backgroundColor: status.color + '20' }]}>
            <View style={[styles.cardStatusDot, { backgroundColor: status.color }]} />
            <Text style={[styles.cardStatusText, { color: status.color }]}>{status.label}</Text>
          </View>
          {item.status === 'concluido' && (
            <TouchableOpacity 
              style={{ marginTop: 8, padding: 4 }} 
              onPress={(e) => {
                e.stopPropagation();
                if (Platform.OS === 'web') {
                  if (window.confirm('Tem certeza que deseja excluir esta OS?')) {
                    onDelete();
                  }
                } else {
                  Alert.alert('Excluir OS', 'Tem certeza que deseja excluir esta ordem de serviço?', [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Excluir', style: 'destructive', onPress: onDelete },
                  ]);
                }
              }}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={20} color={AppColors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.cardTitulo} numberOfLines={1}>{item.titulo}</Text>
      {item.descricao ? (
        <Text style={styles.cardDescricao} numberOfLines={2}>{item.descricao}</Text>
      ) : null}

      <View style={styles.cardFooter}>
        <View style={styles.cardInfoItem}>
          <MaterialCommunityIcons name="account-outline" size={14} color={AppColors.primary} style={{ marginRight: 4 }} />
          <Text style={[styles.cardInfoText, { color: AppColors.text }]} numberOfLines={1}>
            {item.solicitante || 'Solicitante'}
          </Text>
        </View>
        <View style={styles.cardInfoItem}>
          <MaterialCommunityIcons name="map-marker-outline" size={14} color={AppColors.textSecondary} style={{ marginRight: 4 }} />
          <Text style={styles.cardInfoText} numberOfLines={1}>{item.local}</Text>
        </View>
        <Text style={styles.cardDate}>{formatDateShort(item.dataCriacao)}</Text>
      </View>

      {/* Botão rápido "Pegar Chamado" apenas para a equipe de TI */}
      {isTI && item.status === 'aberto' && (
        <TouchableOpacity
          style={styles.cardActionBtn}
          onPress={(e) => {
            e.stopPropagation();
            onPegarChamado();
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.cardActionText}>Pegar Chamado</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

export default function MinhasOSScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { ordens, excluirOS, editarOS, isSyncing, carregarDados } = useOS();
  const { user, isTI } = useAuth();

  const [activeFilter, setActiveFilter] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const handlePegarChamado = (os) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Deseja pegar a OS-${String(os.numero).padStart(3, '0')} e iniciar o atendimento?`);
      if (confirmed) {
        editarOS(os.id, { status: 'andamento' });
        window.alert('Chamado movido para Em Andamento!');
      }
    } else {
      Alert.alert('Pegar Chamado', `Deseja pegar a OS-${String(os.numero).padStart(3, '0')} e iniciar o atendimento?`, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Pegar Chamado',
          onPress: () => {
            editarOS(os.id, { status: 'andamento' });
            Alert.alert('Sucesso', 'Chamado movido para Em Andamento!');
          },
        },
      ]);
    }
  };

  const filteredOrdens = useMemo(() => {
    return ordens.filter((os) => {
      // Status filter
      if (activeFilter !== 'todos' && os.status !== activeFilter) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const tituloMatch = os.titulo?.toLowerCase().includes(query);
        const descMatch = os.descricao?.toLowerCase().includes(query);
        const numMatch = String(os.numero)?.toLowerCase().includes(query);
        const localMatch = os.local?.toLowerCase().includes(query);
        const maquinaMatch = os.maquina?.toLowerCase().includes(query);
        return tituloMatch || descMatch || numMatch || localMatch || maquinaMatch;
      }
      return true;
    });
  }, [ordens, activeFilter, searchQuery]);

  const renderItem = ({ item }) => (
    <OSCard
      item={item}
      onPress={() => router.push({ pathname: '/detalhes-os', params: { id: item.id } })}
      onDelete={() => excluirOS(item.id)}
      onPegarChamado={() => handlePegarChamado(item)}
      isTI={isTI}
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header Superior */}
      <View style={styles.topHeader}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerOla}>
            {user?.nome ? `Olá, ${user.nome.split(' ')[0]}` : 'Olá'}
          </Text>
          <Text style={styles.headerTitle}>Minhas OS’s</Text>
        </View>

        <TouchableOpacity
          style={styles.botaoNovaOS}
          onPress={() => router.push('/(tabs)/criar-os')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="file-document-edit-outline"
            size={18}
            color="#ffffff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.botaoTexto}>Nova OS</Text>
        </TouchableOpacity>
      </View>

      {/* Top Filter Tabs */}
      <View style={styles.filtersWrapper}>
        <FlatList
          horizontal
          data={FILTERS}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => {
            const isActive = activeFilter === item.id;
            return (
              <TouchableOpacity
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setActiveFilter(item.id)}
                activeOpacity={0.75}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <MaterialCommunityIcons name="magnify" size={20} color={AppColors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ordem de serviço..."
            placeholderTextColor={AppColors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List / Empty State */}
      {filteredOrdens.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={54} color={AppColors.textMuted} style={{ marginBottom: 14, opacity: 0.6 }} />
          <Text style={styles.emptyTitle}>
            {searchQuery || activeFilter !== 'todos'
              ? 'Nenhuma OS encontrada'
              : 'Nenhuma OS criada'}
          </Text>
          <Text style={styles.emptyText}>
            {searchQuery || activeFilter !== 'todos'
              ? 'Tente ajustar os filtros ou termos da sua busca'
              : 'Crie sua primeira ordem de serviço\nusando a aba "Criar OS"'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrdens}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isSyncing}
          onRefresh={carregarDados}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  headerInfo: {
    flex: 1,
  },
  headerOla: {
    fontSize: 14,
    fontWeight: '500',
    color: AppColors.textSecondary,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: AppColors.white,
  },
  botaoNovaOS: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16381e',
    borderWidth: 1,
    borderColor: AppColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  botaoTexto: {
    color: AppColors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  filtersWrapper: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  filtersList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: '#12381e',
    borderColor: AppColors.primary,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  filterPillTextActive: {
    color: AppColors.primary,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#262626',
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 10,
    opacity: 0.7,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: AppColors.white,
  },
  clearSearchBtn: {
    padding: 6,
  },
  clearSearchText: {
    color: AppColors.textMuted,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#121212',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e3822',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardNumero: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.primary,
  },
  cardStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  cardStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 6,
  },
  cardDescricao: {
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardInfoIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  cardInfoText: {
    fontSize: 13,
    color: AppColors.textSecondary,
    flex: 1,
  },
  cardDate: {
    fontSize: 12,
    color: AppColors.textMuted,
  },
  cardActionBtn: {
    backgroundColor: '#1c3d24',
    borderColor: AppColors.primary,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  cardActionText: {
    color: AppColors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
