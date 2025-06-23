import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Platform, Alert } from 'react-native';
import { requestMediaLibraryPermissions } from './permissions';

export interface DownloadOptions {
  url: string;
  filename: string;
  mediaType: 'image' | 'video';
}

export async function downloadMedia({ url, filename, mediaType }: DownloadOptions): Promise<boolean> {
  try {
    // Check permissions first
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) {
      return false;
    }

    // Create download directory if it doesn't exist
    const downloadDir = `${FileSystem.documentDirectory}InstaSaver/`;
    const dirInfo = await FileSystem.getInfoAsync(downloadDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
    }

    // Download the file
    const localUri = `${downloadDir}${filename}`;
    const downloadResult = await FileSystem.downloadAsync(url, localUri);

    if (downloadResult.status === 200) {
      // Save to media library (gallery)
      if (Platform.OS !== 'web') {
        await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
      }
      
      return true;
    } else {
      throw new Error(`Download failed with status: ${downloadResult.status}`);
    }
  } catch (error) {
    console.error('Download failed:', error);
    Alert.alert('Download Failed', 'Unable to download the media file. Please try again.');
    return false;
  }
}

export function generateFilename(mediaType: 'image' | 'video' | 'reel', index: number = 0): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const extension = mediaType === 'image' ? 'jpg' : 'mp4';
  const suffix = index > 0 ? `_${index}` : '';
  
  return `InstaSaver_${mediaType}_${timestamp}${suffix}.${extension}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}