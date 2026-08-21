import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { AppColors } from '@/constants/theme';
import { useOS } from '@/contexts/os-context';
import { useAuth } from '@/contexts/auth-context';

export default function CriarOSScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { criarOS } = useOS();
  const { user } = useAuth();

  const [titulo, setTitulo] = useState('');
  const [maquina, setMaquina] = useState('');
  const [local, setLocal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagemUri, setImagemUri] = useState(null);

  const handleCriar = async () => {
    if (!titulo.trim()) {
      if (Platform.OS === 'web') window.alert('Preencha o título da solicitação.');
      else Alert.alert('Erro', 'Preencha o título da solicitação.');
      return;
    }
    if (!local.trim()) {
      if (Platform.OS === 'web') window.alert('Preencha o local / setor.');
      else Alert.alert('Erro', 'Preencha o local / setor.');
      return;
    }
    if (!descricao.trim()) {
      if (Platform.OS === 'web') window.alert('Preencha a descrição do problema.');
      else Alert.alert('Erro', 'Preencha a descrição do problema.');
      return;
    }

    try {
      const nomeSolicitante = user?.nome || user?.email || 'Solicitante';
      await criarOS({
        titulo: titulo.trim(),
        maquina: maquina.trim(),
        local: local.trim(),
        descricao: descricao.trim(),
        imagem: imagemUri,
        solicitante: nomeSolicitante,
      });

      setTitulo('');
      setMaquina('');
      setLocal('');
      setDescricao('');
      setImagemUri(null);

      if (Platform.OS === 'web') {
        window.alert('Ordem de serviço criada com sucesso!');
      } else {
        Alert.alert('Sucesso', 'Ordem de serviço criada com sucesso!');
      }
      router.push('/');
    } catch (err) {
      console.log('Erro ao criar OS:', err);
      if (Platform.OS === 'web') window.alert('Erro ao salvar OS.');
      else Alert.alert('Erro', 'Erro ao salvar OS.');
    }
  };

  const handleSelectImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setImagemUri(result.assets[0].uri);
      }
    } catch (e) {
      console.log('Erro ao escolher imagem:', e);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 10 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text style={styles.headerSubtitle}>Criar OS</Text>
        <Text style={styles.headerTitle}>Criar ordem de serviço</Text>

        {/* Formulário */}
        <View style={styles.formContainer}>
          {/* Título do problema */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Título do problema <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color={AppColors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Vazamento da pia"
                placeholderTextColor={AppColors.textMuted}
                value={titulo}
                onChangeText={setTitulo}
              />
            </View>
          </View>

          {/* Máquina / Equipamento */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Máquina / Equipamento <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="cog" size={20} color={AppColors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Torno CNC #3"
                placeholderTextColor={AppColors.textMuted}
                value={maquina}
                onChangeText={setMaquina}
              />
            </View>
          </View>

          {/* Local / Setor */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Local / Setor <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="map-marker" size={20} color={AppColors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Galpão B, Setor 2"
                placeholderTextColor={AppColors.textMuted}
                value={local}
                onChangeText={setLocal}
              />
            </View>
          </View>

          {/* Descrição do problema */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Descrição do problema <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <MaterialCommunityIcons name="pencil" size={20} color={AppColors.primary} style={[styles.inputIcon, { marginTop: 14 }]} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descreva o problema em detalhes..."
                placeholderTextColor={AppColors.textMuted}
                value={descricao}
                onChangeText={setDescricao}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Imagem / Foto do problema */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Imagem / Foto do problema
            </Text>
            <TouchableOpacity style={styles.imageButton} onPress={handleSelectImage} activeOpacity={0.7}>
              <MaterialCommunityIcons name="camera" size={20} color={AppColors.primary} style={styles.inputIcon} />
              <Text style={styles.imagePlaceholder}>
                {imagemUri ? 'Alterar foto selecionada' : 'Selecionar foto'}
              </Text>
            </TouchableOpacity>
            {imagemUri ? (
              <View style={{ height: 180, borderRadius: 12, overflow: 'hidden', marginTop: 10, borderWidth: 1, borderColor: AppColors.border }}>
                <Image source={{ uri: imagemUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              </View>
            ) : null}
          </View>
        </View>

        {/* Botão Submit */}
        <TouchableOpacity style={styles.submitButton} onPress={handleCriar} activeOpacity={0.8}>
          <Text style={styles.submitButtonText}>Abrir Ordem de Serviço</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  headerSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: AppColors.white,
    textAlign: 'center',
    marginBottom: 28,
  },
  formContainer: {
    gap: 18,
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
  imagePlaceholder: {
    fontSize: 15,
    color: AppColors.textMuted,
  },
  submitButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
