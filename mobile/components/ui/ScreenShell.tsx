import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
};

export default function ScreenShell({ children, contentContainerStyle }: Props) {
  return (
    <LinearGradient colors={['#eef2ff', '#f8fafc', '#e0e7ff']} style={styles.flex}>
      <ScrollView
        contentContainerStyle={[styles.container, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    padding: 14,
    paddingBottom: 34,
  },
});