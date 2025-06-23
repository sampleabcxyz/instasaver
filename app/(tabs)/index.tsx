import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAction, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

const MOCK_USER_ID = 'user_123'; // In production, get from auth

export default function HomeScreen() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [clipboardUrl, setClipboardUrl] = useState('');

  const downloadPost = useAction(api.instagram.downloadInstagramPost);
  const userPrefs = useQuery(api.downloads.getUserPreferences, { userId: MOCK_USER_ID });

  useEffect(() => {
    checkClipboard();
  }, []);

  const checkClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();
      if (clipboardContent && isInstagramUrl(clipboardContent)) {
        setClipboardUrl(clipboardContent);
      }
    } catch (error) {
      console.log('Clipboard access failed:', error);
    }
  };

  const isInstagramUrl = (text: string) => {
    return text.includes('instagram.com/p/') || text.includes('instagram.com/reel/');
  };

  const handleDownload = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a valid Instagram URL');
      return;
    }

    if (!isInstagramUrl(url)) {
      Alert.alert('Error', 'Please enter a valid Instagram post or reel URL');
      return;
    }

    setIsLoading(true);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const result = await downloadPost({ url, userId: MOCK_USER_ID });
      
      if (result.success) {
        Alert.alert(
          'Success! 🎉',
          `Downloaded ${result.data.mediaType} successfully!`,
          [{ text: 'OK', onPress: () => setUrl('') }]
        );
        
        // Check if we should show an ad
        if (userPrefs && result.downloadCount % userPrefs.adFrequency === 0) {
          // Show interstitial ad here
          console.log('Show interstitial ad');
        }
      } else {
        Alert.alert('Download Failed', result.error || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const useClipboardUrl = () => {
    setUrl(clipboardUrl);
    setClipboardUrl('');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#8B5CF6', '#EC4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>InstaSaver</Text>
        <Text style={styles.headerSubtitle}>Download Instagram content easily</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {clipboardUrl && (
          <TouchableOpacity style={styles.clipboardCard} onPress={useClipboardUrl}>
            <View style={styles.clipboardHeader}>
              <Ionicons name="clipboard-outline" size={20} color="#8B5CF6" />
              <Text style={styles.clipboardTitle}>Instagram URL detected</Text>
            </View>
            <Text style={styles.clipboardUrl} numberOfLines={1}>
              {clipboardUrl}
            </Text>
            <Text style={styles.clipboardAction}>Tap to use</Text>
          </TouchableOpacity>
        )}

        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Single Post Downloader</Text>
          <Text style={styles.sectionDescription}>
            Paste Instagram post or reel URL to download
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons name="link-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="https://instagram.com/p/..."
              value={url}
              onChangeText={setUrl}
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {url.length > 0 && (
              <TouchableOpacity onPress={() => setUrl('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.downloadButton, isLoading && styles.downloadButtonDisabled]}
            onPress={handleDownload}
            disabled={isLoading}
          >
            <LinearGradient
              colors={isLoading ? ['#9CA3AF', '#6B7280'] : ['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.downloadButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Ionicons name="download-outline" size={20} color="white" />
              )}
              <Text style={styles.downloadButtonText}>
                {isLoading ? 'Downloading...' : 'Download'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Supported Content</Text>
          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <Ionicons name="image-outline" size={24} color="#8B5CF6" />
              <Text style={styles.featureTitle}>Photos</Text>
              <Text style={styles.featureDescription}>Single images</Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="videocam-outline" size={24} color="#EC4899" />
              <Text style={styles.featureTitle}>Videos</Text>
              <Text style={styles.featureDescription}>HD quality</Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="albums-outline" size={24} color="#F59E0B" />
              <Text style={styles.featureTitle}>Carousel</Text>
              <Text style={styles.featureDescription}>Multiple media</Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="play-circle-outline" size={24} color="#10B981" />
              <Text style={styles.featureTitle}>Reels</Text>
              <Text style={styles.featureDescription}>Short videos</Text>
            </View>
          </View>
        </View>

        {/* Ad Banner Placeholder */}
        <View style={styles.adBanner}>
          <Text style={styles.adText}>Advertisement</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  clipboardCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clipboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  clipboardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  clipboardUrl: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  clipboardAction: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  clearButton: {
    marginLeft: 8,
  },
  downloadButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  downloadButtonDisabled: {
    opacity: 0.7,
  },
  downloadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  featuresSection: {
    marginBottom: 30,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  featureDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  adBanner: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  adText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});