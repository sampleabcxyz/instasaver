import React, { useState } from 'react';
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

const MOCK_USER_ID = 'user_123';

type DownloadType = 'all' | 'videos' | 'images';

export default function ProfileScreen() {
  const [profileUrl, setProfileUrl] = useState('');
  const [selectedType, setSelectedType] = useState<DownloadType>('all');
  const [isLoading, setIsLoading] = useState(false);

  const downloadProfile = useAction(api.instagram.downloadInstagramProfile);
  const profileDownloads = useQuery(api.profiles.getProfileDownloads);

  const downloadTypes = [
    { id: 'all', label: 'All Media', icon: 'albums-outline', color: '#8B5CF6' },
    { id: 'videos', label: 'Videos & Reels', icon: 'videocam-outline', color: '#EC4899' },
    { id: 'images', label: 'Images Only', icon: 'image-outline', color: '#10B981' },
  ];

  const isInstagramProfileUrl = (text: string) => {
    return text.includes('instagram.com/') && !text.includes('/p/') && !text.includes('/reel/');
  };

  const handleDownload = async () => {
    if (!profileUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid Instagram profile URL');
      return;
    }

    if (!isInstagramProfileUrl(profileUrl)) {
      Alert.alert('Error', 'Please enter a valid Instagram profile URL');
      return;
    }

    setIsLoading(true);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const result = await downloadProfile({
        profileUrl,
        downloadType: selectedType,
        userId: MOCK_USER_ID,
      });
      
      if (result.success) {
        Alert.alert(
          'Download Started! 🚀',
          `Started downloading ${result.data.totalMedia} items from @${result.data.username}`,
          [{ text: 'OK', onPress: () => setProfileUrl('') }]
        );
      } else {
        Alert.alert('Download Failed', result.error || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start download. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectDownloadType = (type: DownloadType) => {
    setSelectedType(type);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#EC4899', '#F59E0B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Profile Downloader</Text>
        <Text style={styles.headerSubtitle}>Download entire Instagram profiles</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Instagram Profile URL</Text>
          <Text style={styles.sectionDescription}>
            Enter the profile URL to download all media
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="https://instagram.com/username"
              value={profileUrl}
              onChangeText={setProfileUrl}
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {profileUrl.length > 0 && (
              <TouchableOpacity onPress={() => setProfileUrl('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.typeSection}>
          <Text style={styles.sectionTitle}>Download Type</Text>
          <Text style={styles.sectionDescription}>
            Choose what type of content to download
          </Text>

          <View style={styles.typeGrid}>
            {downloadTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  selectedType === type.id && styles.typeCardSelected,
                ]}
                onPress={() => selectDownloadType(type.id as DownloadType)}
              >
                <View style={[styles.typeIcon, { backgroundColor: `${type.color}20` }]}>
                  <Ionicons name={type.icon as any} size={24} color={type.color} />
                </View>
                <Text style={[
                  styles.typeLabel,
                  selectedType === type.id && styles.typeLabelSelected,
                ]}>
                  {type.label}
                </Text>
                {selectedType === type.id && (
                  <View style={[styles.selectedIndicator, { backgroundColor: type.color }]}>
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.downloadButton, isLoading && styles.downloadButtonDisabled]}
          onPress={handleDownload}
          disabled={isLoading}
        >
          <LinearGradient
            colors={isLoading ? ['#9CA3AF', '#6B7280'] : ['#EC4899', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.downloadButtonGradient}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="cloud-download-outline" size={20} color="white" />
            )}
            <Text style={styles.downloadButtonText}>
              {isLoading ? 'Starting Download...' : 'Start Profile Download'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Recent Profile Downloads */}
        {profileDownloads && profileDownloads.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Profile Downloads</Text>
            {profileDownloads.slice(0, 3).map((download) => (
              <View key={download._id} style={styles.downloadCard}>
                <View style={styles.downloadInfo}>
                  <Text style={styles.downloadUsername}>@{download.username}</Text>
                  <Text style={styles.downloadProgress}>
                    {download.downloadedMedia}/{download.totalMedia} items
                  </Text>
                  <Text style={styles.downloadStatus}>
                    Status: {download.status.charAt(0).toUpperCase() + download.status.slice(1)}
                  </Text>
                </View>
                <View style={styles.downloadProgress}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${(download.downloadedMedia / download.totalMedia) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Warning */}
        <View style={styles.warningCard}>
          <Ionicons name="warning-outline" size={20} color="#F59E0B" />
          <Text style={styles.warningText}>
            Profile downloads may take longer depending on the number of posts. 
            Large profiles might require a premium subscription.
          </Text>
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
  typeSection: {
    marginBottom: 30,
  },
  typeGrid: {
    gap: 12,
  },
  typeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  typeCardSelected: {
    borderColor: '#EC4899',
    backgroundColor: '#FEF7F0',
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  typeLabelSelected: {
    color: '#EC4899',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 30,
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
  recentSection: {
    marginBottom: 30,
  },
  downloadCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  downloadInfo: {
    marginBottom: 12,
  },
  downloadUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  downloadProgress: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  downloadStatus: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#EC4899',
    borderRadius: 2,
  },
  warningCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
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