import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Preencha todos os campos!');
      } else {
        Alert.alert('Atenção', 'Preencha todos os campos!');
      }
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), senha.trim());
    } catch (err) {
      const msg = err?.message || 'E-mail ou senha inválidos';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Erro ao entrar', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Mascote */}
        <View style={styles.mascoteContainer}>
          <Image
            source={require('@/assets/image/image.png')}
            style={styles.mascoteImage}
            resizeMode="contain"
          />
        </View>

        {/* Título */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Chama Jussa</Text>
          <Text style={styles.subtitleText}>Gerenciamento de Ordens de Serviço</Text>
        </View>

        {/* Formulário */}
        <View style={styles.formCard}>
          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="email-outline" size={20} color={AppColors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="email@email.com"
                placeholderTextColor={AppColors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Senha */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={AppColors.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={senha}
                onChangeText={setSenha}
                placeholder="Digite sua senha"
                placeholderTextColor={AppColors.textMuted}
                secureTextEntry={!senhaVisivel}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setSenhaVisivel(!senhaVisivel)}
                style={styles.eyeButton}
              >
                <MaterialCommunityIcons name={senhaVisivel ? "eye-off-outline" : "eye-outline"} size={20} color={AppColors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Botão Entrar */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            <MaterialCommunityIcons name="login" size={20} color={AppColors.white} style={{ marginRight: 10 }} />
            <Text style={styles.loginButtonText}>
              {loading ? 'Entrando...' : 'Acessar o sistema'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  mascoteContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  mascoteImage: {
    width: 180,
    height: 180,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.white,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    gap: 18,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.white,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 14,
    height: 52,
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
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 16,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    height: 54,
    marginTop: 8,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonIcon: {
    fontSize: 18,
    marginRight: 10,
    color: AppColors.background,
  },
  loginButtonText: {
    color: AppColors.background,
    fontSize: 16,
    fontWeight: '700',
  },
});
