import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AdBannerProps {
  style?: any;
}

export default function AdBanner({ style }: AdBannerProps) {
  // In production, replace with actual AdMob banner
  return (
    <View style={[styles.adBanner, style]}>
      <Text style={styles.adText}>Advertisement</Text>
      <Text style={styles.adSubtext}>Google AdMob Banner</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  adBanner: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  adText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  adSubtext: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 4,
  },
});