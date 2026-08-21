import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppColors } from '@/constants/theme';

function TabIcon({ name, color, size }) {
  const iconMap = {
    'clipboard-list': 'clipboard-text-outline',
    'plus-circle': 'plus-circle',
    'bell': 'bell-outline',
    'user': 'account-outline',
  };

  const isActive = color === AppColors.tabActive || color === AppColors.primary;
  const iconName = iconMap[name] || 'circle';

  if (name === 'plus-circle') {
    return (
      <View style={styles.plusIconContainer}>
        <View style={[styles.plusIconCircle, { backgroundColor: color }, isActive && styles.glowEffect]}>
          <MaterialCommunityIcons name="plus" size={20} color={AppColors.background} />
        </View>
      </View>
    );
  }

  return (
    <View style={isActive ? styles.glowEffect : null}>
      <MaterialCommunityIcons
        name={iconName}
        size={size - 2}
        color={color}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: AppColors.tabActive,
        tabBarInactiveTintColor: AppColors.tabInactive,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: AppColors.tabBarBg,
          borderTopColor: AppColors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 85 : 75,
          paddingBottom: Platform.OS === 'ios' ? 25 : 18,
          paddingTop: 8,
          marginBottom: Platform.OS === 'web' ? 10 : 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarItemStyle: {
          outline: 'none',
          outlineWidth: 0,
          outlineStyle: 'none',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Minhas OS',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="clipboard-list" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="criar-os"
        options={{
          title: 'Criar OS',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="plus-circle" color={color} size={size} />
          ),
          tabBarActiveTintColor: AppColors.primary,
          tabBarInactiveTintColor: AppColors.primary,
        }}
      />
      <Tabs.Screen
        name="notificacoes"
        options={{
          title: 'Notificações',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="bell" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="user" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  plusIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIconText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 22,
    marginTop: -1,
  },
  glowEffect: {
    shadowColor: AppColors.tabActive,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 10,
  },
  glowTextEffect: {
    textShadowColor: AppColors.tabActive,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
});
