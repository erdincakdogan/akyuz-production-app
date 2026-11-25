import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppStateProvider } from '../context/AppState';
import { colors } from '../lib/theme';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: focused ? '700' : '500',
        color: focused ? colors.primary : colors.muted,
      }}
    >
      {label}
    </Text>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <StatusBar style="dark" />
        <Tabs
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTitleStyle: { fontWeight: '700', color: colors.text },
            headerShadowVisible: false,
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              height: 64,
              paddingBottom: 8,
              paddingTop: 8,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.muted,
            tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Özet',
              tabBarIcon: ({ focused }) => (
                <TabIcon label="◈" focused={focused} />
              ),
            }}
          />
          <Tabs.Screen
            name="parametreler"
            options={{
              title: 'Parametreler',
              tabBarIcon: ({ focused }) => (
                <TabIcon label="☰" focused={focused} />
              ),
            }}
          />
          <Tabs.Screen
            name="hiz-karti"
            options={{
              title: 'Hız Kartı',
              tabBarIcon: ({ focused }) => (
                <TabIcon label="⚡" focused={focused} />
              ),
            }}
          />
          <Tabs.Screen
            name="notlar"
            options={{
              title: 'Notlar',
              tabBarIcon: ({ focused }) => (
                <TabIcon label="✎" focused={focused} />
              ),
            }}
          />
        </Tabs>
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
