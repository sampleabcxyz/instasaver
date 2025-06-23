import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import * as Haptics from 'expo-haptics';

const MOCK_USER_ID = 'user_123';

type Theme = 'light' | 'dark' | 'amoled';

export default function SettingsScreen() {
  const userPrefs = useQuery(api.downloads.getUserPreferences, { userId: MOCK_USER_ID });
  const updatePrefs = useMutation(api.downloads.updateUserPreferences);

  const [selectedTheme, setSelectedTheme] = useState<Theme>(userPrefs?.theme || 'light');
  const [selectedLanguage, setSelectedLanguage] = useState(userPrefs?.language || 'en');

  const themes = [
    { id: 'light', label: 'Light', icon: 'sunny-outline', color: '#F59E0B' },
    { id: 'dark', label: 'Dark', icon: 'moon-outline', color: '#6B7280' },
    { id: 'amoled', label: 'AMOLED', icon: 'contrast-outline', color: '#000000' },
  ];

  const languages = [
    { id: 'en', label: 'English', flag: '🇺🇸' },
    { id: 'es', label: 'Español', flag: '🇪🇸' },
    { id: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { id: 'fr', label: 'Français', flag: '🇫🇷' },
    { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { id: 'pt', label: 'Português', flag: '🇧🇷' },
  ];

  const handleThemeChange = async (theme: Theme) => {
    setSelectedTheme(theme);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      await updatePrefs({ userId: MOCK_USER_ID, theme });
    } catch (error) {
      Alert.alert('Error', 'Failed to update theme');
    }
  };

  const handleLanguageChange = async (language: string) => {
    setSelectedLanguage(language);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      await updatePrefs({ userId: MOCK_USER_ID, language });
    } catch (error) {
      Alert.alert('Error', 'Failed to update language');
    }
  };

  const showDisclaimer = () => {
    Alert.alert(
      'Disclaimer',
      'This app is not affiliated with Instagram. Please respect copyright and privacy before downloading any media. Use downloaded content responsibly and in accordance with applicable laws.',
      [{ text: 'OK' }]
    );
  };

  const showAbout = () => {
    Alert.alert(
      'About InstaSaver',
      'InstaSaver v1.0.0\n\nA modern Instagram content downloader built with React Native and Expo.\n\nDeveloped with ❤️ using Bloom AI',
      [{ text: 'OK' }]
    );
  };

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement 
  }: { 
    icon: string; 
    title: string; 
    subtitle?: string; 
    onPress?: () => void; 
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon as any} size={20} color="#8B5CF6" />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (onPress && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your experience</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <SettingSection title="Appearance">
          <View style={styles.themeGrid}>
            {themes.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeCard,
                  selectedTheme === theme.id && styles.themeCardSelected,
                ]}
                onPress={() => handleThemeChange(theme.id as Theme)}
              >
                <View style={[styles.themeIcon, { backgroundColor: `${theme.color}20` }]}>
                  <Ionicons name={theme.icon as any} size={24} color={theme.color} />
                </View>
                <Text style={[
                  styles.themeLabel,
                  selectedTheme === theme.id && styles.themeLabelSelected,
                ]}>
                  {theme.label}
                </Text>
                {selectedTheme === theme.id && (
                  <View style={[styles.selectedIndicator, { backgroundColor: theme.color }]}>
                    <Ionicons name="checkmark" size={12} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </SettingSection>

        <SettingSection title="Language">
          <View style={styles.languageList}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.id}
                style={[
                  styles.languageItem,
                  selectedLanguage === language.id && styles.languageItemSelected,
                ]}
                onPress={() => handleLanguageChange(language.id)}
              >
                <Text style={styles.languageFlag}>{language.flag}</Text>
                <Text style={[
                  styles.languageLabel,
                  selectedLanguage === language.id && styles.languageLabelSelected,
                ]}>
                  {language.label}
                </Text>
                {selectedLanguage === language.id && (
                  <Ionicons name="checkmark" size={16} color="#8B5CF6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </SettingSection>

        <SettingSection title="Download Settings">
          <SettingItem
            icon="folder-outline"
            title="Download Folder"
            subtitle={userPrefs?.downloadFolder || 'Default (Downloads/InstaSaver)'}
            onPress={() => Alert.alert('Coming Soon', 'Custom download folder selection will be available in the next update.')}
          />
          <SettingItem
            icon="notifications-outline"
            title="Download Notifications"
            subtitle="Get notified when downloads complete"
            rightElement={<Switch value={true} onValueChange={() => {}} />}
          />
          <SettingItem
            icon="wifi-outline"
            title="Download over WiFi only"
            subtitle="Save mobile data"
            rightElement={<Switch value={false} onValueChange={() => {}} />}
          />
        </SettingSection>

        <SettingSection title="Ads & Premium">
          <SettingItem
            icon="diamond-outline"
            title="Upgrade to Premium"
            subtitle="Remove ads and unlock unlimited downloads"
            onPress={() => Alert.alert('Premium', 'Premium features coming soon!')}
          />
          <SettingItem
            icon="tv-outline"
            title="Ad Frequency"
            subtitle={`Show ads every ${userPrefs?.adFrequency || 4} downloads`}
            onPress={() => Alert.alert('Ad Settings', 'Ad frequency can be adjusted in premium version.')}
          />
        </SettingSection>

        <SettingSection title="Support & Info">
          <SettingItem
            icon="help-circle-outline"
            title="Help & FAQ"
            subtitle="Get help with common issues"
            onPress={() => Alert.alert('Help', 'Help documentation coming soon!')}
          />
          <SettingItem
            icon="mail-outline"
            title="Contact Support"
            subtitle="Get in touch with our team"
            onPress={() => Alert.alert('Contact', 'Email: support@instasaver.app')}
          />
          <SettingItem
            icon="star-outline"
            title="Rate App"
            subtitle="Help us improve by rating the app"
            onPress={() => Alert.alert('Rate App', 'Thank you for your support!')}
          />
          <SettingItem
            icon="share-outline"
            title="Share App"
            subtitle="Tell your friends about InstaSaver"
            onPress={() => Alert.alert('Share', 'Share functionality coming soon!')}
          />
        </SettingSection>

        <SettingSection title="Legal">
          <SettingItem
            icon="document-text-outline"
            title="Privacy Policy"
            onPress={() => Alert.alert('Privacy Policy', 'Privacy policy will be available on our website.')}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            title="Terms of Service"
            onPress={() => Alert.alert('Terms of Service', 'Terms of service will be available on our website.')}
          />
          <SettingItem
            icon="warning-outline"
            title="Disclaimer"
            onPress={showDisclaimer}
          />
        </SettingSection>

        <SettingSection title="About">
          <SettingItem
            icon="information-circle-outline"
            title="About InstaSaver"
            subtitle="Version 1.0.0"
            onPress={showAbout}
          />
          <SettingItem
            icon="code-slash-outline"
            title="Built with Bloom AI"
            subtitle="Powered by modern technology"
            onPress={() => Alert.alert('Technology', 'Built with React Native, Expo, and Convex backend.')}
          />
        </SettingSection>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ using Bloom AI
          </Text>
          <Text style={styles.footerSubtext}>
            InstaSaver v1.0.0
          </Text>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  themeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '30%',
    position: 'relative',
  },
  themeCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F8FAFC',
  },
  themeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  themeLabelSelected: {
    color: '#8B5CF6',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageList: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  languageItemSelected: {
    backgroundColor: '#F8FAFC',
  },
  languageFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  languageLabelSelected: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
});