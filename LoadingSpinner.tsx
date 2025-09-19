import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function LoadingSpinner() {
  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#ff69b4" />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});
