/**
 * Preference Center Screen Component
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  SafeAreaView,
  Switch,
  Modal,
  Animated,
} from 'react-native';
import { useSendmator } from '../context/SendmatorContext';
import type {
  PreferenceCenterProps,
  ContactData,
  PreferenceChannel,
  PreferenceCategory,
  ChannelPreferences,
  ContactPreferences,
  PreferenceCenterTheme,
} from '../types';
import {
  LightTheme,
  DarkTheme,
  MonochromeTheme,
  OceanBlueTheme,
  SunsetPurpleTheme,
  IndigoDarkTheme,
  ForestGreenTheme,
  SlateGreyTheme,
} from '../themes';

const CHANNELS: Array<{ key: PreferenceChannel; label: string; icon: string }> =
  [
    { key: 'email', label: 'Email', icon: '📧' },
    { key: 'sms', label: 'SMS', icon: '💬' },
    { key: 'whatsapp', label: 'WhatsApp', icon: '📱' },
    { key: 'push', label: 'Push', icon: '🔔' },
  ];

const CATEGORIES: Array<{
  key: PreferenceCategory;
  label: string;
  description: string;
}> = [
  {
    key: 'transactional',
    label: 'Essential Messages',
    description:
      'Order confirmations, receipts, account updates, security alerts, and OTP codes',
  },
  {
    key: 'promotional',
    label: 'Marketing Messages',
    description:
      'Promotional offers, newsletters, marketing campaigns, and announcements',
  },
];

const AVAILABLE_THEMES: Array<{ name: string; theme: PreferenceCenterTheme }> =
  [
    {
      name: 'Default',
      theme: {
        colors: {
          primary: '#6366F1',
          background: '#F8FAFC',
          surface: '#FFFFFF',
          text: '#0F172A',
          textSecondary: '#64748B',
          border: '#E2E8F0',
          success: '#10B981',
          error: '#EF4444',
          accent: '#8B5CF6',
        },
      },
    },
    { name: 'Light', theme: LightTheme },
    { name: 'Dark', theme: DarkTheme },
    { name: 'Monochrome', theme: MonochromeTheme },
    { name: 'Ocean Blue', theme: OceanBlueTheme },
    { name: 'Sunset Purple', theme: SunsetPurpleTheme },
    { name: 'Indigo Dark', theme: IndigoDarkTheme },
    { name: 'Forest Green', theme: ForestGreenTheme },
    { name: 'Slate Grey', theme: SlateGreyTheme },
  ];

export function PreferenceCenterScreen({
  contactId,
  onClose,
  onSave,
  theme,
  hideHeader = false,
}: PreferenceCenterProps) {
  const { client, config, syncFcmToken } = useSendmator();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contact, setContact] = useState<ContactData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<ContactPreferences>({});
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);
  const [expandedChannels, setExpandedChannels] = useState<
    Record<string, boolean>
  >({
    email: false,
    sms: false,
    whatsapp: false,
    push: false,
  });

  // Animation values for each channel
  const animationRefs = useRef<Record<string, Animated.Value>>({
    email: new Animated.Value(0),
    sms: new Animated.Value(0),
    whatsapp: new Animated.Value(0),
    push: new Animated.Value(0),
  });

  // Use selected theme or prop theme
  const activeTheme = theme || AVAILABLE_THEMES[selectedThemeIndex]?.theme;

  const colors = {
    primary: activeTheme?.colors?.primary || '#6366F1',
    background: activeTheme?.colors?.background || '#F8FAFC',
    surface: activeTheme?.colors?.surface || '#FFFFFF',
    text: activeTheme?.colors?.text || '#0F172A',
    textSecondary: activeTheme?.colors?.textSecondary || '#64748B',
    border: activeTheme?.colors?.border || '#E2E8F0',
    success: activeTheme?.colors?.success || '#10B981',
    error: activeTheme?.colors?.error || '#EF4444',
    accent: activeTheme?.colors?.accent || '#8B5CF6',
  };

  const loadContact = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const contactData = await client.getContact(contactId);
      setContact(contactData);
      setPreferences(contactData.preferences || {});

      // Sync FCM token when preference screen is opened
      // This ensures the contact always has the latest device token
      syncFcmToken(contactId).catch((err) => {
        console.warn('[PreferenceCenterScreen] FCM token sync failed:', err);
        // Don't show error to user - token sync is a background operation
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load contact';
      setError(errorMessage);
      config.onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [client, config, contactId, syncFcmToken]);

  useEffect(() => {
    loadContact();
  }, [loadContact]);

  const handleToggle = (
    channel: PreferenceChannel,
    category: PreferenceCategory
  ) => {
    if (!contact) return;

    const currentValue = getPreferenceValue(channel, category);
    const newValue = !currentValue;

    // Optimistic update
    setPreferences((prev) => ({
      ...prev,
      [channel]: {
        ...((prev[channel] as ChannelPreferences) || {}),
        [category]: newValue,
      },
    }));

    // Update on server using internal contact UUID
    client
      .updateSinglePreference(contact.id, channel, category, newValue)
      .then(() => {
        onSave?.(preferences);
      })
      .catch((err) => {
        // Revert on error
        setPreferences((prev) => ({
          ...prev,
          [channel]: {
            ...((prev[channel] as ChannelPreferences) || {}),
            [category]: currentValue,
          },
        }));
        config.onError?.(err);
        Alert.alert('Error', 'Failed to update preference');
      });
  };

  const handleUnsubscribeAll = () => {
    if (!contact) return;

    Alert.alert(
      'Unsubscribe from All',
      'Are you sure you want to unsubscribe from ALL communications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unsubscribe',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              await client.unsubscribeAll(contact.id);
              await loadContact();
              Alert.alert('Success', 'Unsubscribed from all communications');
            } catch (err) {
              config.onError?.(
                err instanceof Error ? err : new Error('Unsubscribe failed')
              );
              Alert.alert('Error', 'Failed to unsubscribe');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const handleSubscribeAll = async () => {
    if (!contact) return;

    try {
      setSaving(true);
      await client.subscribeAll(contact.id);
      await loadContact();
      Alert.alert('Success', 'Subscribed to all communications');
    } catch (err) {
      config.onError?.(
        err instanceof Error ? err : new Error('Subscribe failed')
      );
      Alert.alert('Error', 'Failed to subscribe');
    } finally {
      setSaving(false);
    }
  };

  const getPreferenceValue = (
    channel: PreferenceChannel,
    category: PreferenceCategory
  ): boolean => {
    const channelPrefs = preferences[channel] as ChannelPreferences | undefined;
    // Return exactly what the API provides, no defaults
    return channelPrefs?.[category] ?? false;
  };

  const getChannelStats = (channel: PreferenceChannel) => {
    const channelPrefs = preferences[channel] as ChannelPreferences | undefined;
    if (!channelPrefs) return { subscribed: 0, total: 0 };

    const subscribed = Object.values(channelPrefs).filter(
      (v) => v === true
    ).length;
    const total = Object.keys(channelPrefs).length;
    return { subscribed, total };
  };

  const toggleChannel = (channelKey: PreferenceChannel) => {
    const isExpanding = !expandedChannels[channelKey];
    const animationValue = animationRefs.current[channelKey];

    if (animationValue) {
      Animated.timing(animationValue, {
        toValue: isExpanding ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }

    setExpandedChannels((prev) => ({
      ...prev,
      [channelKey]: isExpanding,
    }));
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading preferences...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !contact) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.errorContainer}>
          <Text style={[styles.errorIcon]}>⚠️</Text>
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Something Went Wrong
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {error || 'Failed to load contact'}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={loadContact}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={[styles.closeButtonText, { color: colors.text }]}>
                Close
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      {!hideHeader && (
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Preferences
            </Text>
            <Text
              style={[styles.headerSubtitle, { color: colors.textSecondary }]}
            >
              Manage your communication settings
            </Text>
          </View>
          <View style={styles.headerActions}>
            {/* Theme Picker Button - Only show if no theme prop is provided */}
            {!theme && (
              <TouchableOpacity
                onPress={() => setShowThemePicker(true)}
                style={[
                  styles.themeButton,
                  { backgroundColor: colors.primary + '20', marginRight: 8 },
                ]}
              >
                <Text
                  style={[styles.themeButtonIcon, { color: colors.primary }]}
                >
                  🎨
                </Text>
              </TouchableOpacity>
            )}
            {onClose && (
              <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                <View
                  style={[
                    styles.closeIconCircle,
                    { backgroundColor: colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.closeIconText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    ✕
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Theme Picker Modal */}
      <Modal
        visible={showThemePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowThemePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Theme
            </Text>
            <ScrollView style={styles.themeList}>
              {AVAILABLE_THEMES.map((themeOption, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.themeOption,
                    { borderColor: colors.border },
                    selectedThemeIndex === index && {
                      backgroundColor: colors.primary + '15',
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => {
                    setSelectedThemeIndex(index);
                    setShowThemePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.themeOptionText,
                      { color: colors.text },
                      selectedThemeIndex === index && {
                        color: colors.primary,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {themeOption.name}
                  </Text>
                  {selectedThemeIndex === index && (
                    <Text
                      style={[styles.themeCheckmark, { color: colors.primary }]}
                    >
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[
                styles.modalCloseButton,
                { backgroundColor: colors.border },
              ]}
              onPress={() => setShowThemePicker(false)}
            >
              <Text
                style={[styles.modalCloseButtonText, { color: colors.text }]}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Contact Info Card */}
        <View style={[styles.contactCard, { backgroundColor: colors.surface }]}>
          <View
            style={[styles.avatarCircle, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.avatarText}>
              {contact.first_name?.[0] ||
                contact.email?.[0]?.toUpperCase() ||
                'U'}
            </Text>
          </View>
          <View style={styles.contactInfo}>
            {contact.first_name || contact.last_name ? (
              <Text style={[styles.contactName, { color: colors.text }]}>
                {[contact.first_name, contact.last_name]
                  .filter(Boolean)
                  .join(' ')}
              </Text>
            ) : null}
            <Text
              style={[styles.contactEmail, { color: colors.textSecondary }]}
            >
              {contact.email}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.actionButtonPrimary,
              {
                backgroundColor: colors.primary + '15',
                borderColor: colors.primary,
              },
            ]}
            onPress={handleSubscribeAll}
            disabled={saving}
          >
            <View
              style={[
                styles.actionIconCircle,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.actionIcon}>✓</Text>
            </View>
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>
              Enable All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.actionButtonSecondary,
              {
                backgroundColor: colors.textSecondary + '15',
                borderColor: colors.textSecondary,
              },
            ]}
            onPress={handleUnsubscribeAll}
            disabled={saving}
          >
            <View
              style={[
                styles.actionIconCircle,
                { backgroundColor: colors.textSecondary },
              ]}
            >
              <Text style={styles.actionIcon}>✕</Text>
            </View>
            <Text
              style={[styles.actionButtonText, { color: colors.textSecondary }]}
            >
              Disable All
            </Text>
          </TouchableOpacity>
        </View>

        {/* Channels Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          CHANNELS
        </Text>

        {CHANNELS.map((channel) => {
          const stats = getChannelStats(channel.key);
          const progress =
            stats.total > 0 ? (stats.subscribed / stats.total) * 100 : 0;
          const isExpanded = expandedChannels[channel.key];

          return (
            <View
              key={channel.key}
              style={[
                styles.channelCard,
                {
                  backgroundColor: colors.surface,
                  shadowColor: colors.text,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.channelHeader}
                onPress={() => toggleChannel(channel.key)}
                activeOpacity={0.7}
              >
                <View style={styles.channelInfo}>
                  <Text style={[styles.channelTitle, { color: colors.text }]}>
                    {channel.label}
                  </Text>
                  <View style={styles.statsRow}>
                    <Text
                      style={[
                        styles.channelStats,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {stats.subscribed} of {stats.total} active
                    </Text>
                    <View
                      style={[
                        styles.progressBar,
                        { backgroundColor: colors.border },
                      ]}
                    >
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${progress}%`,
                            backgroundColor: colors.primary,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
                <Text
                  style={[styles.expandIcon, { color: colors.textSecondary }]}
                >
                  {isExpanded ? '−' : '+'}
                </Text>
              </TouchableOpacity>

              {/* Categories - Collapsible */}
              <Animated.View
                style={{
                  maxHeight: animationRefs.current[channel.key]?.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1000],
                  }),
                  opacity: animationRefs.current[channel.key],
                  overflow: 'hidden',
                }}
              >
                {isExpanded && (
                  <>
                    <View
                      style={[
                        styles.categoriesSeparator,
                        { backgroundColor: colors.border },
                      ]}
                    />
                    <View style={styles.categoriesContainer}>
                      {CATEGORIES.map((category, catIndex) => {
                        const isEnabled = getPreferenceValue(
                          channel.key,
                          category.key
                        );

                        return (
                          <View
                            key={`${channel.key}-${category.key}`}
                            style={[
                              styles.preferenceRow,
                              catIndex > 0 && {
                                borderTopColor: colors.border,
                                borderTopWidth: 1,
                              },
                            ]}
                          >
                            <View style={styles.preferenceInfo}>
                              <Text
                                style={[
                                  styles.preferenceLabel,
                                  { color: colors.text },
                                ]}
                              >
                                {category.label}
                              </Text>
                              <Text
                                style={[
                                  styles.preferenceDescription,
                                  { color: colors.textSecondary },
                                ]}
                              >
                                {category.description}
                              </Text>
                            </View>
                            <Switch
                              value={isEnabled}
                              onValueChange={() =>
                                handleToggle(channel.key, category.key)
                              }
                              trackColor={{
                                false: colors.border,
                                true: colors.primary + '40',
                              }}
                              thumbColor={isEnabled ? '#FFFFFF' : '#FFFFFF'}
                              ios_backgroundColor={colors.border}
                            />
                          </View>
                        );
                      })}
                    </View>
                  </>
                )}
              </Animated.View>
            </View>
          );
        })}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Changes are saved automatically
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
    opacity: 0.7,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeButtonIcon: {
    fontSize: 18,
  },
  closeIcon: {
    marginLeft: 0,
  },
  closeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIconText: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  themeList: {
    marginBottom: 16,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  themeOptionText: {
    fontSize: 18,
    fontWeight: '600',
  },
  themeCheckmark: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  contactCard: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  contactEmail: {
    fontSize: 15,
    opacity: 0.7,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  actionButtonPrimary: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButtonSecondary: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  channelCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  channelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  channelIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  channelIcon: {
    fontSize: 28,
  },
  channelInfo: {
    flex: 1,
  },
  channelTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  channelStats: {
    fontSize: 13,
    fontWeight: '400',
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoriesSeparator: {
    height: 1,
    marginHorizontal: 20,
    marginTop: 8,
  },
  categoriesContainer: {
    paddingTop: 8,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingVertical: 16,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 20,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  preferenceDescription: {
    fontSize: 13,
    marginTop: 2,
    opacity: 0.7,
    lineHeight: 18,
  },
  expandIcon: {
    fontSize: 20,
    fontWeight: '400',
    marginLeft: 16,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.6,
  },
});
