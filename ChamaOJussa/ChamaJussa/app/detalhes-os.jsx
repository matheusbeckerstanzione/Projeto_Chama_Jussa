import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { AppColors } from '@/constants/theme';
import { useOS } from '@/contexts/os-context';
import { useAuth } from '@/contexts/auth-context';

function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
}

export default function DetalhesOSScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { getOS, editarOS, excluirOS, ordens } = useOS();
  const { isTI, isSolicitante, user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [maquina, setMaquina] = useState('');
  const [local, setLocal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [solicitante, setSolicitante] = useState('');
  const [imagem, setImagem] = useState(null);

  const os = getOS(id || '');

  useEffect(() => {
    if (os) {
      setTitulo(os.titulo);
      setMaquina(os.maquina);
      setLocal(os.local);
      setDescricao(os.descricao);
      setSolicitante(os.solicitante);
      setImagem(os.imagem);
    }
  }, [os?.id, os?.imagem]);

  if (!os) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ordem não encontrada</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Ordem de serviço não encontrada.</Text>
        </View>
      </View>
    );
  }

  const handleSelectImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setImagem(result.assets[0].uri);
      }
    } catch (e) {
      console.log('Erro ao escolher imagem na edição:', e);
    }
  };

  const handleSaveEdit = () => {
    if (!titulo.trim() || !maquina.trim() || !local.trim() || !descricao.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    editarOS(os.id, {
      titulo: titulo.trim(),
      maquina: maquina.trim(),
      local: local.trim(),
      descricao: descricao.trim(),
      solicitante: solicitante.trim(),
      imagem: imagem,
    });

    setIsEditing(false);
    Alert.alert('Sucesso', 'Ordem de serviço atualizada!');
  };

  const handleCancelEdit = () => {
    setTitulo(os.titulo);
    setMaquina(os.maquina);
    setLocal(os.local);
    setDescricao(os.descricao);
    setSolicitante(os.solicitante);
    setImagem(os.imagem);
    setIsEditing(false);
  };

  const statusConfig = {
    aberto: { label: 'Aberto', color: AppColors.statusAberto },
    andamento: { label: 'Em Andamento', color: AppColors.statusAndamento },
    concluido: { label: 'Concluído', color: AppColors.statusConcluido },
  };

  const statusInfo = statusConfig[os.status];

  if (isEditing) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancelEdit} style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Editar OS-{os.numero}</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Edit Form */}
          <View style={styles.formContainer}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Título do problema <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="file-document-outline" size={20} color={AppColors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={titulo}
                  onChangeText={setTitulo}
                  placeholderTextColor={AppColors.textMuted}
                />
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Máquina / Equipamento <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="cog" size={20} color={AppColors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={maquina}
                  onChangeText={setMaquina}
                  placeholderTextColor={AppColors.textMuted}
                />
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Local / Setor <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="map-marker" size={20} color={AppColors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={local}
                  onChangeText={setLocal}
                  placeholderTextColor={AppColors.textMuted}
                />
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Solicitante</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="account" size={20} color={AppColors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={solicitante}
                  onChangeText={setSolicitante}
                  placeholderTextColor={AppColors.textMuted}
                />
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Descrição do problema <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <MaterialCommunityIcons name="pencil" size={20} color={AppColors.primary} style={[styles.inputIcon, { marginTop: 14 }]} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={descricao}
                  onChangeText={setDescricao}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor={AppColors.textMuted}
                />
              </View>
            </View>

            {/* Foto / Imagem do Problema */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Foto do problema</Text>
              <TouchableOpacity style={styles.imageButton} onPress={handleSelectImage} activeOpacity={0.7}>
                <MaterialCommunityIcons name="camera" size={20} color={AppColors.primary} style={styles.inputIcon} />
                <Text style={styles.imageButtonText}>
                  {imagem ? 'Alterar foto selecionada' : 'Adicionar foto'}
                </Text>
              </TouchableOpacity>
              {imagem ? (
                <View style={{ height: 160, borderRadius: 12, overflow: 'hidden', marginTop: 8, borderWidth: 1, borderColor: AppColors.border }}>
                  <Image source={{ uri: imagem }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                </View>
              ) : null}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSaveEdit} activeOpacity={0.8}>
            <Text style={styles.submitButtonText}>Salvar Alterações</Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={[styles.submitButton, styles.cancelButton]}
            onPress={handleCancelEdit}
            activeOpacity={0.8}
          >
            <Text style={[styles.submitButtonText, { color: AppColors.textSecondary }]}>Cancelar</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes da OS-{os.numero}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Card Principal */}
        <View style={styles.detailCard}>
          {/* Título e Data */}
          <Text style={styles.osTitulo}>{os.titulo}</Text>
          <Text style={styles.osData}>Criada em {formatDate(os.dataCriacao)}</Text>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Máquina/Equipamento */}
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="cog" size={20} color={AppColors.primary} style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Máquina / Equipamento</Text>
              <Text style={styles.infoValue}>{os.maquina}</Text>
            </View>
          </View>

          {/* Local/Setor */}
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color={AppColors.primary} style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Local / Setor</Text>
              <Text style={styles.infoValue}>{os.local}</Text>
            </View>
          </View>

          {/* Solicitante */}
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account" size={20} color={AppColors.primary} style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Solicitante</Text>
              <Text style={styles.infoValue}>{os.solicitante}</Text>
            </View>
          </View>
        </View>

        {/* Descrição do Problema */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="file-document-outline" size={20} color={AppColors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Descrição do Problema</Text>
          </View>
          <Text style={styles.descriptionText}>{os.descricao}</Text>
        </View>

        {/* Foto do Problema */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="camera" size={20} color={AppColors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Foto do Problema</Text>
          </View>
          {os.imagem ? (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: os.imagem }} 
                style={{ width: '100%', height: '100%' }} 
                contentFit="cover" 
              />
            </View>
          ) : (
            <View style={styles.imageContainer}>
              <Text style={styles.noImageText}>Nenhuma imagem anexada</Text>
            </View>
          )}
        </View>

        {/* ================= AÇÕES PARA O PERFIL TI (@senai.com) ================= */}
        {isTI && (
          <View style={{ marginTop: 10 }}>
            {/* Se estiver Aberto -> TI pode PEGAR o chamado */}
            {os.status === 'aberto' && (
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: AppColors.statusAndamento }]}
                onPress={() => {
                  if (Platform.OS === 'web') {
                    const confirmed = window.confirm('Deseja assumir e iniciar o atendimento deste chamado?');
                    if (confirmed) {
                      editarOS(os.id, { status: 'andamento' });
                      window.alert('Chamado assumido! Movido para "Em Andamento".');
                    }
                  } else {
                    Alert.alert('Pegar Chamado', 'Deseja assumir e iniciar o atendimento deste chamado?', [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Pegar Chamado',
                        onPress: () => {
                          editarOS(os.id, { status: 'andamento' });
                          Alert.alert('Sucesso', 'Chamado assumido! Movido para "Em Andamento".');
                        },
                      },
                    ]);
                  }
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="wrench-outline" size={18} color={AppColors.white} style={{ marginRight: 8 }} />
                <Text style={styles.editButtonText}>Pegar Chamado (Iniciar Atendimento)</Text>
              </TouchableOpacity>
            )}

            {/* Se estiver Em Andamento -> TI pode FINALIZAR o chamado */}
            {os.status === 'andamento' && (
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: AppColors.statusConcluido }]}
                onPress={() => {
                  if (Platform.OS === 'web') {
                    const confirmed = window.confirm('Deseja marcar este chamado como CONCLUÍDO e finalizado?');
                    if (confirmed) {
                      editarOS(os.id, { status: 'concluido' });
                      window.alert('Chamado finalizado com sucesso!');
                    }
                  } else {
                    Alert.alert('Finalizar Chamado', 'Deseja marcar este chamado como CONCLUÍDO e finalizado?', [
                      { text: 'Cancelar', style: 'cancel' },
                      { 
                        text: 'Finalizar', 
                        onPress: () => {
                          editarOS(os.id, { status: 'concluido' });
                          Alert.alert('Sucesso', 'Chamado finalizado com sucesso!');
                        }
                      },
                    ]);
                  }
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="check-circle-outline" size={18} color={AppColors.white} style={{ marginRight: 8 }} />
                <Text style={styles.editButtonText}>Finalizar e Concluir Chamado</Text>
              </TouchableOpacity>
            )}

            {os.status === 'concluido' && (
              <View style={[styles.statusInfoBox, { borderColor: AppColors.statusConcluido + '40' }]}>
                <MaterialCommunityIcons name="check-decagram" size={22} color={AppColors.statusConcluido} style={{ marginRight: 10 }} />
                <Text style={styles.statusInfoBoxText}>
                  Chamado concluído e arquivado com sucesso.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ================= AÇÕES PARA O SOLICITANTE (@gmail.com) ================= */}
        {isSolicitante && (
          <View style={{ marginTop: 10 }}>
            {os.status === 'aberto' ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="pencil-outline" size={18} color={AppColors.white} style={{ marginRight: 8 }} />
                <Text style={styles.editButtonText}>Editar Minha Solicitação</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.statusInfoBox}>
                <MaterialCommunityIcons 
                  name={os.status === 'concluido' ? 'check-decagram' : 'clock-outline'} 
                  size={22} 
                  color={os.status === 'concluido' ? AppColors.statusConcluido : AppColors.statusAndamento} 
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.statusInfoBoxText}>
                  {os.status === 'concluido' 
                    ? 'Esta solicitação foi finalizada com sucesso pela equipe de TI.'
                    : 'Esta solicitação está em atendimento pela equipe técnica de TI.'}
                </Text>
              </View>
            )}
          </View>
        )}



        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  backIcon: {
    color: AppColors.white,
    fontSize: 20,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.white,
    flex: 1,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: AppColors.textSecondary,
    fontSize: 16,
  },
  detailCard: {
    backgroundColor: AppColors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 16,
  },
  osTitulo: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 4,
  },
  osData: {
    fontSize: 13,
    color: AppColors.primary,
    fontWeight: '500',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.border,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: AppColors.white,
    fontWeight: '500',
  },
  sectionContainer: {
    backgroundColor: AppColors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.white,
  },
  descriptionText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 22,
  },
  imageContainer: {
    backgroundColor: AppColors.background,
    borderRadius: 12,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    fontSize: 40,
  },
  noImageText: {
    color: AppColors.textMuted,
    fontSize: 14,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    height: 52,
    marginTop: 4,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  editButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  editButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  // Edit form styles
  formContainer: {
    gap: 18,
    marginBottom: 20,
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.white,
  },
  required: {
    color: AppColors.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 14,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: AppColors.white,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  submitButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelButton: {
    backgroundColor: AppColors.card,
    borderWidth: 1,
    borderColor: AppColors.border,
    shadowOpacity: 0,
    elevation: 0,
    marginTop: 10,
  },
  submitButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  statusInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 16,
    marginTop: 10,
  },
  statusInfoBoxText: {
    flex: 1,
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 14,
    height: 50,
  },
  imageButtonText: {
    fontSize: 15,
    color: AppColors.textMuted,
  },
});
