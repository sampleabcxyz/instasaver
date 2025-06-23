import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform } from 'react-native';

export async function requestMediaLibraryPermissions(): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      return true; // Web doesn't need media library permissions
    }

    const { status } = await MediaLibrary.requestPermissionsAsync();
    
    if (status === 'granted') {
      return true;
    } else if (status === 'denied') {
      Alert.alert(
        'Permission Required',
        'InstaSaver needs access to your media library to save downloaded content. Please enable this permission in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => {
            // In production, you might want to open device settings
            console.log('Open device settings');
          }},
        ]
      );
      return false;
    }
    
    return false;
  } catch (error) {
    console.error('Permission request failed:', error);
    return false;
  }
}

export async function checkMediaLibraryPermissions(): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      return true;
    }

    const { status } = await MediaLibrary.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}