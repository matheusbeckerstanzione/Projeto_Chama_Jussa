import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser, isTI } = useAuth();

  const [modalVisible, setModalVisible] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaFoto, setNovaFoto] = useState(null);

  const handleOpenEdit = () => {
    setNovoNome(user?.nome || '');
    setNovaFoto(user?.avatar || null);
    setModalVisible(true);
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== 'granted' && Platform.OS !== 'web') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para alterar a foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setNovaFoto(result.assets[0].uri);
      }
    } catch (e) {
      console.log('Erro ao selecionar imagem:', e);
      if (Platform.OS === 'web') {
        window.alert('Não foi possível carregar a imagem.');
      } else {
        Alert.alert('Erro', 'Não foi possível carregar a imagem.');
      }
    }
  };

  const handleSaveEdit = () => {
    if (!novoNome.trim()) {
      if (Platform.OS === 'web') {
        window.alert('O nome não pode ficar vazio!');
      } else {
        Alert.alert('Atenção', 'O nome não pode ficar vazio!');
      }
      return;
    }

    updateUser({
      nome: novoNome.trim(),
      avatar: novaFoto,
    });
    setModalVisible(false);

    if (Platform.OS === 'web') {
      window.alert('Perfil atualizado com sucesso!');
    } else {
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    }
  };

  const handleSairDaConta = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Deseja realmente sair da sua conta?');
      if (confirmed) {
        logout();
      }
    } else {
      Alert.alert(
        'Sair da Conta',
        'Deseja realmente sair da sua conta?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: () => logout(),
          },
        ]
      );
    }
  };

  const getInitials = (nome) => {
    if (!nome || !nome.trim()) return '';
    return nome
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              {Boolean(getInitials(user?.nome)) && (
                <Text style={styles.avatarInitials}>{getInitials(user?.nome)}</Text>
              )}
            </View>
          )}
          {/* Green ring border */}
          <View style={styles.avatarRing} />
        </View>

        {/* Name & Email */}
        {Boolean(user?.nome) && <Text style={styles.userName}>{user.nome}</Text>}
        <Text style={styles.userEmail}>{user?.email ?? ''}</Text>

        {/* Role Badge */}
        <View style={[
          styles.roleBadge, 
          isTI ? styles.roleBadgeTI : styles.roleBadgeSolicitante
        ]}>
          <MaterialCommunityIcons 
            name={isTI ? "shield-check-outline" : "account-outline"} 
            size={14} 
            color={isTI ? AppColors.primary : AppColors.textSecondary} 
            style={{ marginRight: 6 }} 
          />
          <Text style={[
            styles.roleBadgeText,
            isTI ? styles.roleBadgeTextTI : styles.roleBadgeTextSolicitante
          ]}>
            {isTI ? 'Equipe Técnica (TI)' : 'Solicitante'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonGroup}>
        {/* Edit Profile Button */}
        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={handleOpenEdit}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="pencil-outline" size={18} color={AppColors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.editProfileText}>Editar Perfil</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleSairDaConta}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="logout" size={18} color={AppColors.background} style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Editar Perfil */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            <Text style={styles.modalSubtitle}>Atualize sua foto e nome de exibição</Text>

            {/* Avatar Selector */}
            <View style={styles.modalAvatarWrapper}>
              <TouchableOpacity
                onPress={handlePickImage}
                style={styles.modalAvatarTouchable}
                activeOpacity={0.8}
              >
                {novaFoto ? (
                  <Image source={{ uri: novaFoto }} style={styles.modalAvatarImage} />
                ) : user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.modalAvatarImage} />
                ) : (
                  <View style={styles.modalAvatarPlaceholder}>
                    {Boolean(getInitials(novoNome || user?.nome)) && (
                      <Text style={styles.modalAvatarInitials}>{getInitials(novoNome || user?.nome)}</Text>
                    )}
                  </View>
                )}
                <View style={styles.cameraIconBadge}>
                  <MaterialCommunityIcons name="camera" size={14} color={AppColors.background} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePickImage} style={{ marginTop: 8 }}>
                <Text style={styles.changePhotoText}>Alterar Foto</Text>
              </TouchableOpacity>
            </View>

            {/* Field: Nome */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nome do usuário</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="account-outline" size={18} color={AppColors.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  value={novoNome}
                  onChangeText={setNovoNome}
                  placeholder="Seu nome"
                  placeholderTextColor={AppColors.textMuted}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelModalText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveModalButton}
                onPress={handleSaveEdit}
                activeOpacity={0.85}
              >
                <Text style={styles.saveModalText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: AppColors.white,
  },
  profileCard: {
    backgroundColor: AppColors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 24,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: AppColors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: '700',
    color: AppColors.primary,
  },
  avatarRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 54,
    borderWidth: 3,
    borderColor: AppColors.primary,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 6,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleBadgeTI: {
    backgroundColor: AppColors.primary + '18',
    borderColor: AppColors.primary + '60',
  },
  roleBadgeSolicitante: {
    backgroundColor: AppColors.inputBg,
    borderColor: AppColors.border,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  roleBadgeTextTI: {
    color: AppColors.primary,
  },
  roleBadgeTextSolicitante: {
    color: AppColors.textSecondary,
  },
  buttonGroup: {
    gap: 12,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.card,
    borderRadius: 12,
    height: 52,
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  editProfileText: {
    color: AppColors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    height: 52,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  logoutText: {
    color: AppColors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: AppColors.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: AppColors.border,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginBottom: 16,
  },
  modalAvatarWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalAvatarTouchable: {
    position: 'relative',
  },
  modalAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: AppColors.primary,
  },
  modalAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: AppColors.primary,
  },
  modalAvatarInitials: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.primary,
  },
  cameraIconBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    backgroundColor: AppColors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: AppColors.card,
  },
  cameraIconText: {
    fontSize: 13,
  },
  changePhotoText: {
    color: AppColors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  fieldGroup: {
    gap: 8,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.white,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: AppColors.white,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelModalButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    height: 48,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  cancelModalText: {
    color: AppColors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  saveModalButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    height: 48,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  saveModalText: {
    color: AppColors.background,
    fontSize: 15,
    fontWeight: '700',
  },
});
