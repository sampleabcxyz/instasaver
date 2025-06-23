import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import * as Haptics from 'expo-haptics';

type FilterType = 'all' | 'image' | 'video' | 'reel' | 'carousel';

export default function HistoryScreen() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  const downloads = useQuery(api.downloads.getDownloadHistory);
  const deleteDownload = useMutation(api.downloads.deleteDownload);

  const filters = [
    { id: 'all', label: 'All', icon: 'albums-outline', color: '#8B5CF6' },
    { id: 'image', label: 'Photos', icon: 'image-outline', color: '#10B981' },
    { id: 'video', label: 'Videos', icon: 'videocam-outline', color: '#EC4899' },
    { id: 'reel', label: 'Reels', icon: 'play-circle-outline', color: '#F59E0B' },
    { id: 'carousel', label: 'Carousel', icon: 'albums-outline', color: '#8B5CF6' },
  ];

  const filteredDownloads = downloads?.filter(download => 
    selectedFilter === 'all' || download.mediaType === selectedFilter
  ) || [];

  const handleDelete = (id: string, mediaType: string) => {
    Alert.alert(
      'Delete Download',
      `Are you sure you want to delete this ${mediaType}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDownload({ id: id as any });
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete download');
            }
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'image': return 'image-outline';
      case 'video': return 'videocam-outline';
      case 'reel': return 'play-circle-outline';
      case 'carousel': return 'albums-outline';
      default: return 'document-outline';
    }
  };

  const getMediaTypeColor = (mediaType: string) => {
    switch (mediaType) {
      case 'image': return '#10B981';
      case 'video': return '#EC4899';
      case 'reel': return '#F59E0B';
      case 'carousel': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const renderDownloadItem = ({ item }: { item: any }) => (
    <View style={styles.downloadCard}>
      <View style={styles.downloadHeader}>
        <View style={styles.mediaInfo}>
          <View style={[styles.mediaTypeIcon, { backgroundColor: `${getMediaTypeColor(item.mediaType)}20` }]}>
            <Ionicons 
              name={getMediaTypeIcon(item.mediaType) as any} 
              size={20} 
              color={getMediaTypeColor(item.mediaType)} 
            />
          </View>
          <View style={styles.downloadDetails}>
            <Text style={styles.downloadTitle}>
              {item.mediaType.charAt(0).toUpperCase() + item.mediaType.slice(1)}
              {item.mediaType === 'carousel' && ` (${item.mediaUrls.length} items)`}
            </Text>
            <Text style={styles.downloadUsername}>@{item.username || 'unknown'}</Text>
            <Text style={styles.downloadDate}>{formatDate(item.downloadedAt)}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item._id, item.mediaType)}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {item.thumbnailUrl && (
        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
      )}

      {item.caption && (
        <Text style={styles.caption} numberOfLines={2}>
          {item.caption}
        </Text>
      )}

      <View style={styles.downloadMeta}>
        <Text style={styles.metaText}>
          <Ionicons name="folder-outline" size={12} color="#9CA3AF" /> {formatFileSize(item.fileSize)}
        </Text>
        {item.duration && (
          <Text style={styles.metaText}>
            <Ionicons name="time-outline" size={12} color="#9CA3AF" /> {item.duration}s
          </Text>
        )}
        <Text style={styles.metaText}>
          <Ionicons name="link-outline" size={12} color="#9CA3AF" /> {item.mediaUrls.length} file(s)
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={16} color="#8B5CF6" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="download-outline" size={16} color="#8B5CF6" />
          <Text style={styles.actionButtonText}>Re-download</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="eye-outline" size={16} color="#8B5CF6" />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="cloud-download-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Downloads Yet</Text>
      <Text style={styles.emptyDescription}>
        Start downloading Instagram content to see your history here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#10B981', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Download History</Text>
        <Text style={styles.headerSubtitle}>
          {filteredDownloads.length} {selectedFilter === 'all' ? 'total' : selectedFilter} downloads
        </Text>
      </LinearGradient>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === item.id && [styles.filterChipActive, { backgroundColor: `${item.color}20` }],
              ]}
              onPress={() => {
                setSelectedFilter(item.id as FilterType);
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <Ionicons 
                name={item.icon as any} 
                size={16} 
                color={selectedFilter === item.id ? item.color : '#9CA3AF'} 
              />
              <Text style={[
                styles.filterChipText,
                selectedFilter === item.id && [styles.filterChipTextActive, { color: item.color }],
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredDownloads}
        keyExtractor={(item) => item._id}
        renderItem={renderDownloadItem}
        contentContainerStyle={styles.downloadsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Ad Banner Placeholder */}
      {filteredDownloads.length > 0 && (
        <View style={styles.adBanner}>
          <Text style={styles.adText}>Advertisement</Text>
        </View>
      )}
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
  filterContainer: {
    paddingVertical: 16,
  },
  filterList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    borderColor: 'transparent',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginLeft: 6,
  },
  filterChipTextActive: {
    fontWeight: '600',
  },
  downloadsList: {
    padding: 20,
    paddingTop: 0,
  },
  downloadCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  downloadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mediaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mediaTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  downloadDetails: {
    flex: 1,
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  downloadUsername: {
    fontSize: 14,
    color: '#8B5CF6',
    marginTop: 2,
  },
  downloadDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
  },
  caption: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  downloadMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  adBanner: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    margin: 20,
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