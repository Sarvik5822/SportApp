import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Switch,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DrawerMenuButton from '../../components/DrawerMenuButton';

// ─── Mock Coach Settings Service ───
const mockCoachSettingsService = {
    getSettings: async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return {
            data: {
                settings: {
                    notifications: { email: true, push: true, sms: false },
                    notificationTypes: {
                        sessionReminders: true,
                        newBooking: true,
                        cancellation: true,
                        clientMessages: true,
                        performanceReports: false,
                        adminAnnouncements: true,
                    },
                    preferences: {
                        language: 'en',
                        timezone: 'pst',
                        dateFormat: 'mdy',
                        darkMode: false,
                        autoAcceptBookings: true,
                        showAvailability: true,
                    },
                },
                twoFactorEnabled: false,
            },
        };
    },
    changePassword: async ({ currentPassword, newPassword }) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return { data: { success: true } };
    },
    toggle2FA: async ({ enable }) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return { data: { twoFactorEnabled: enable } };
    },
    updateNotificationSettings: async settings => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return { data: { success: true } };
    },
    updatePreferences: async preferences => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return { data: { success: true } };
    },
};

// ═══════════════════════════════════════════════
// ─── ENHANCED TAB BUTTON (Dashboard Style) ───
// ═══════════════════════════════════════════════
const TabButton = ({ label, icon, isActive, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="flex-1 py-3 items-center rounded-xl"
        style={{
            backgroundColor: isActive ? undefined : 'transparent',
            overflow: 'hidden',
        }}>
        {isActive ? (
            <LinearGradient
                colors={['#1e3a8a', '#3b82f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 12,
                }}
            />
        ) : null}
        <View className="flex-row items-center">
            <Icon
                name={icon}
                size={14}
                color={isActive ? '#ffffff' : '#9ca3af'}
                style={{ marginRight: 4 }}
            />
            <Text
                className="text-xs font-bold"
                style={{ color: isActive ? '#ffffff' : '#9ca3af' }}>
                {label}
            </Text>
        </View>
    </TouchableOpacity>
);

// ═══════════════════════════════════════════════
// ─── ENHANCED TOGGLE ROW ───
// ═══════════════════════════════════════════════
const ToggleRow = ({ icon, iconColor, title, description, value, onValueChange, disabled }) => (
    <View
        className="flex-row items-center justify-between p-4 bg-white rounded-2xl mb-3 shadow-sm"
        style={{
            elevation: 2,
            borderLeftWidth: 3,
            borderLeftColor: value ? iconColor : '#e5e7eb',
        }}>
        <View className="flex-row items-center flex-1 mr-3">
            <LinearGradient
                colors={[`${iconColor}20`, `${iconColor}10`]}
                className="w-11 h-11 rounded-xl justify-center items-center"
                style={{ borderRadius: 12 }}>
                <Icon name={icon} size={20} color={iconColor} />
            </LinearGradient>
            <View className="ml-3.5 flex-1">
                <Text className="text-gray-900 font-bold text-sm">{title}</Text>
                <Text className="text-gray-400 text-xs mt-0.5 leading-4">{description}</Text>
            </View>
        </View>
        <Switch
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
            trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
            thumbColor={value ? '#1e3a8a' : '#f4f3f4'}
        />
    </View>
);

// ═══════════════════════════════════════════════
// ─── ENHANCED SECTION CARD ───
// ═══════════════════════════════════════════════
const SectionCard = ({ title, icon, iconColor, children }) => (
    <View
        className="bg-white rounded-2xl p-5 mb-4 shadow-md"
        style={{ elevation: 3 }}>
        <View className="flex-row items-center mb-4">
            <View
                className="w-8 h-8 rounded-lg justify-center items-center mr-2.5"
                style={{ backgroundColor: `${iconColor}12` }}>
                <Icon name={icon} size={16} color={iconColor} />
            </View>
            <Text className="text-gray-900 font-bold text-lg">{title}</Text>
        </View>
        {children}
    </View>
);

// ─── Skeleton Loader ───
const SkeletonLoader = ({ count = 3 }) => (
    <View>
        {Array.from({ length: count }).map((_, i) => (
            <View
                key={i}
                className="bg-gray-100 rounded-2xl h-16 mb-3"
                style={{ opacity: 0.6 }}
            />
        ))}
    </View>
);

// ═══════════════════════════════════════════════
// ─── ENHANCED SELECT ROW ───
// ═══════════════════════════════════════════════
const SelectRow = ({ icon, iconColor, label, value, options, onSelect }) => {
    const [expanded, setExpanded] = useState(false);
    const selectedOption = options.find(o => o.value === value);

    return (
        <View className="mb-3">
            <TouchableOpacity
                onPress={() => setExpanded(!expanded)}
                activeOpacity={0.7}
                className="flex-row items-center justify-between p-4 bg-white rounded-2xl shadow-sm"
                style={{
                    elevation: 2,
                    borderLeftWidth: 3,
                    borderLeftColor: iconColor,
                }}>
                <View className="flex-row items-center flex-1">
                    <LinearGradient
                        colors={[`${iconColor}20`, `${iconColor}10`]}
                        className="w-11 h-11 rounded-xl justify-center items-center"
                        style={{ borderRadius: 12 }}>
                        <Icon name={icon} size={20} color={iconColor} />
                    </LinearGradient>
                    <View className="ml-3.5 flex-1">
                        <Text className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider">
                            {label}
                        </Text>
                        <Text className="text-gray-900 font-bold text-sm mt-0.5">
                            {selectedOption?.label || value}
                        </Text>
                    </View>
                </View>
                <View
                    className="w-8 h-8 rounded-full justify-center items-center"
                    style={{ backgroundColor: expanded ? `${iconColor}15` : '#f3f4f6' }}>
                    <Icon
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={expanded ? iconColor : '#9ca3af'}
                    />
                </View>
            </TouchableOpacity>
            {expanded && (
                <View
                    className="bg-white rounded-2xl mt-2 overflow-hidden shadow-md"
                    style={{ elevation: 3 }}>
                    {options.map((option, index) => (
                        <TouchableOpacity
                            key={option.value}
                            onPress={() => {
                                onSelect(option.value);
                                setExpanded(false);
                            }}
                            activeOpacity={0.7}
                            className={`flex-row items-center justify-between px-5 py-3.5 ${index < options.length - 1 ? 'border-b border-gray-50' : ''
                                }`}
                            style={{
                                backgroundColor: option.value === value ? `${iconColor}08` : 'transparent',
                            }}>
                            <View className="flex-row items-center">
                                {option.value === value && (
                                    <View
                                        className="w-2 h-2 rounded-full mr-3"
                                        style={{ backgroundColor: iconColor }}
                                    />
                                )}
                                <Text
                                    className={`text-sm ${option.value === value
                                        ? 'font-bold'
                                        : 'text-gray-600 font-medium'
                                        }`}
                                    style={option.value === value ? { color: iconColor } : undefined}>
                                    {option.label}
                                </Text>
                            </View>
                            {option.value === value && (
                                <LinearGradient
                                    colors={['#1e3a8a', '#3b82f6']}
                                    className="w-6 h-6 rounded-full justify-center items-center"
                                    style={{ borderRadius: 12 }}>
                                    <Icon name="check" size={14} color="#fff" />
                                </LinearGradient>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

// ═══════════════════════════════════════════════
// ─── MAIN COACH SETTINGS SCREEN ───
// ═══════════════════════════════════════════════
const CoachSettingsScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('notifications');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false,
    });

    const [notificationTypes, setNotificationTypes] = useState({
        sessionReminders: true,
        newBooking: true,
        cancellation: true,
        clientMessages: true,
        performanceReports: false,
        adminAnnouncements: true,
    });

    const [preferences, setPreferences] = useState({
        language: 'en',
        timezone: 'pst',
        dateFormat: 'mdy',
        darkMode: false,
        autoAcceptBookings: true,
        showAvailability: true,
    });

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const res = await mockCoachSettingsService.getSettings();
            const data = res.data;
            setTwoFactorEnabled(data?.twoFactorEnabled || false);
            if (data?.settings?.notifications) {
                setNotifications({
                    email: data.settings.notifications.email ?? true,
                    push: data.settings.notifications.push ?? true,
                    sms: data.settings.notifications.sms ?? false,
                });
            }
            if (data?.settings?.notificationTypes) {
                setNotificationTypes(prev => ({
                    ...prev,
                    ...data.settings.notificationTypes,
                }));
            }
            if (data?.settings?.preferences) {
                setPreferences(prev => ({
                    ...prev,
                    ...data.settings.preferences,
                }));
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load settings: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchSettings();
        setRefreshing(false);
    };

    // ─── Password Change Handler ───
    const handleChangePassword = async () => {
        if (
            !passwordForm.currentPassword ||
            !passwordForm.newPassword ||
            !passwordForm.confirmPassword
        ) {
            Alert.alert('Error', 'Please fill in all password fields');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters');
            return;
        }
        try {
            setSaving(true);
            await mockCoachSettingsService.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            Alert.alert('Success', 'Password changed successfully!');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            Alert.alert('Error', 'Failed to change password: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    // ─── 2FA Toggle Handler ───
    const handleToggle2FA = async enable => {
        try {
            setSaving(true);
            const res = await mockCoachSettingsService.toggle2FA({ enable });
            setTwoFactorEnabled(res.data?.twoFactorEnabled ?? enable);
            Alert.alert(
                'Success',
                `Two-factor authentication ${enable ? 'enabled' : 'disabled'} successfully!`,
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to toggle 2FA: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    // ─── Notification Save Handler ───
    const handleSaveNotifications = async () => {
        try {
            setSaving(true);
            await mockCoachSettingsService.updateNotificationSettings({
                notifications,
                notificationTypes,
            });
            Alert.alert('Success', 'Notification preferences saved!');
        } catch (error) {
            Alert.alert('Error', 'Failed to save notifications: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    // ─── Preferences Save Handler ───
    const handleSavePreferences = async () => {
        try {
            setSaving(true);
            await mockCoachSettingsService.updatePreferences(preferences);
            Alert.alert('Success', 'Preferences saved successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to save preferences: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    // ─── Enhanced Password Input Component ───
    const PasswordInput = ({ label, value, onChangeText, showPassword, toggleShow, placeholder }) => (
        <View className="mb-4">
            <Text className="text-gray-400 text-[11px] mb-2 font-bold uppercase tracking-wider">
                {label}
            </Text>
            <View
                className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4"
                style={{ borderWidth: 1.5 }}>
                <View
                    className="w-8 h-8 rounded-lg justify-center items-center mr-2"
                    style={{ backgroundColor: '#1e3a8a12' }}>
                    <Icon name="lock-outline" size={16} color="#1e3a8a" />
                </View>
                <TextInput
                    className="flex-1 py-3.5 text-gray-900 text-sm font-medium"
                    secureTextEntry={!showPassword}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#d1d5db"
                    autoCapitalize="none"
                />
                <TouchableOpacity
                    onPress={toggleShow}
                    activeOpacity={0.7}
                    className="w-8 h-8 rounded-full justify-center items-center"
                    style={{ backgroundColor: '#f3f4f6' }}>
                    <Icon
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color="#6b7280"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    // ═══════════════════════════════════════════════
    // ─── RENDER NOTIFICATIONS TAB ───
    // ═══════════════════════════════════════════════
    const renderNotificationsTab = () => (
        <View>
            {/* Notification Types */}
            <SectionCard title="Notification Alerts" icon="bell-ring-outline" iconColor="#f59e0b">
                {loading ? (
                    <SkeletonLoader count={6} />
                ) : (
                    <View>
                        <ToggleRow
                            icon="clock-alert-outline"
                            iconColor="#3b82f6"
                            title="Session Reminders"
                            description="Get notified before your scheduled sessions"
                            value={notificationTypes.sessionReminders}
                            onValueChange={v =>
                                setNotificationTypes(p => ({ ...p, sessionReminders: v }))
                            }
                            disabled={saving}
                        />
                        <ToggleRow
                            icon="calendar-plus"
                            iconColor="#22c55e"
                            title="New Booking Alerts"
                            description="Receive alerts when clients book your sessions"
                            value={notificationTypes.newBooking}
                            onValueChange={v =>
                                setNotificationTypes(p => ({ ...p, newBooking: v }))
                            }
                            disabled={saving}
                        />
                        <ToggleRow
                            icon="calendar-remove"
                            iconColor="#ef4444"
                            title="Cancellation Notifications"
                            description="Get notified when clients cancel bookings"
                            value={notificationTypes.cancellation}
                            onValueChange={v =>
                                setNotificationTypes(p => ({ ...p, cancellation: v }))
                            }
                            disabled={saving}
                        />
                        <ToggleRow
                            icon="message-text-outline"
                            iconColor="#8b5cf6"
                            title="Client Messages"
                            description="Receive notifications for new messages from clients"
                            value={notificationTypes.clientMessages}
                            onValueChange={v =>
                                setNotificationTypes(p => ({ ...p, clientMessages: v }))
                            }
                            disabled={saving}
                        />
                        <ToggleRow
                            icon="chart-line"
                            iconColor="#059669"
                            title="Performance Reports"
                            description="Weekly summary of your coaching performance"
                            value={notificationTypes.performanceReports}
                            onValueChange={v =>
                                setNotificationTypes(p => ({ ...p, performanceReports: v }))
                            }
                            disabled={saving}
                        />
                        <ToggleRow
                            icon="bullhorn-outline"
                            iconColor="#f97316"
                            title="Admin Announcements"
                            description="Important updates from club management"
                            value={notificationTypes.adminAnnouncements}
                            onValueChange={v =>
                                setNotificationTypes(p => ({ ...p, adminAnnouncements: v }))
                            }
                            disabled={saving}
                        />
                    </View>
                )}
            </SectionCard>

            {/* Notification Channels */}
            <SectionCard title="Notification Method" icon="tune-variant" iconColor="#3b82f6">
                {loading ? (
                    <SkeletonLoader count={3} />
                ) : (
                    <View>
                        <ToggleRow
                            icon="email-outline"
                            iconColor="#059669"
                            title="Email Notifications"
                            description="Receive notifications via email"
                            value={notifications.email}
                            onValueChange={v => setNotifications(p => ({ ...p, email: v }))}
                            disabled={saving}
                        />
                        <ToggleRow
                            icon="bell-ring-outline"
                            iconColor="#3b82f6"
                            title="Push Notifications"
                            description="Receive push notifications on your device"
                            value={notifications.push}
                            onValueChange={v => setNotifications(p => ({ ...p, push: v }))}
                            disabled={saving}
                        />
                        <ToggleRow
                            icon="cellphone-message"
                            iconColor="#8b5cf6"
                            title="SMS Notifications"
                            description="Receive notifications via SMS"
                            value={notifications.sms}
                            onValueChange={v => setNotifications(p => ({ ...p, sms: v }))}
                            disabled={saving}
                        />

                        <TouchableOpacity
                            onPress={handleSaveNotifications}
                            disabled={saving}
                            activeOpacity={0.8}
                            className="mt-3"
                            style={{ borderRadius: 14, overflow: 'hidden' }}>
                            <LinearGradient
                                colors={saving ? ['#d1d5db', '#d1d5db'] : ['#1e3a8a', '#3b82f6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    borderRadius: 14,
                                    paddingVertical: 14,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                {saving && (
                                    <ActivityIndicator
                                        size="small"
                                        color="#fff"
                                        style={{ marginRight: 8 }}
                                    />
                                )}
                                <Icon name="content-save-outline" size={18} color="#fff" />
                                <Text className="text-white font-bold text-base ml-2">
                                    {saving ? 'Saving...' : 'Save Notification Settings'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </SectionCard>
        </View>
    );

    // ═══════════════════════════════════════════════
    // ─── RENDER SECURITY TAB ───
    // ═══════════════════════════════════════════════
    const renderSecurityTab = () => (
        <View>
            {/* Change Password Section */}
            <SectionCard title="Change Password" icon="lock-outline" iconColor="#1e3a8a">
                {loading ? (
                    <SkeletonLoader count={3} />
                ) : (
                    <View>
                        <PasswordInput
                            label="Current Password"
                            value={passwordForm.currentPassword}
                            onChangeText={text =>
                                setPasswordForm(p => ({ ...p, currentPassword: text }))
                            }
                            showPassword={showCurrentPassword}
                            toggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
                            placeholder="Enter current password"
                        />
                        <PasswordInput
                            label="New Password"
                            value={passwordForm.newPassword}
                            onChangeText={text =>
                                setPasswordForm(p => ({ ...p, newPassword: text }))
                            }
                            showPassword={showNewPassword}
                            toggleShow={() => setShowNewPassword(!showNewPassword)}
                            placeholder="Enter new password"
                        />
                        <PasswordInput
                            label="Confirm New Password"
                            value={passwordForm.confirmPassword}
                            onChangeText={text =>
                                setPasswordForm(p => ({ ...p, confirmPassword: text }))
                            }
                            showPassword={showConfirmPassword}
                            toggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                            placeholder="Confirm new password"
                        />
                        <TouchableOpacity
                            onPress={handleChangePassword}
                            disabled={saving}
                            activeOpacity={0.8}
                            style={{ borderRadius: 14, overflow: 'hidden' }}>
                            <LinearGradient
                                colors={saving ? ['#d1d5db', '#d1d5db'] : ['#1e3a8a', '#3b82f6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    borderRadius: 14,
                                    paddingVertical: 14,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                {saving && (
                                    <ActivityIndicator
                                        size="small"
                                        color="#fff"
                                        style={{ marginRight: 8 }}
                                    />
                                )}
                                <Icon name="lock-check" size={18} color="#fff" />
                                <Text className="text-white font-bold text-base ml-2">
                                    {saving ? 'Updating...' : 'Update Password'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </SectionCard>

            {/* Two-Factor Authentication Section */}
            <SectionCard title="Two-Factor Authentication" icon="shield-lock-outline" iconColor="#3b82f6">
                {loading ? (
                    <SkeletonLoader count={1} />
                ) : (
                    <View>
                        <ToggleRow
                            icon="shield-check"
                            iconColor="#3b82f6"
                            title="Enable 2FA"
                            description={
                                twoFactorEnabled
                                    ? '2FA is currently enabled on your account'
                                    : 'Require a verification code in addition to your password'
                            }
                            value={twoFactorEnabled}
                            onValueChange={handleToggle2FA}
                            disabled={saving}
                        />
                        <View
                            className="rounded-2xl p-4 flex-row items-start"
                            style={{
                                backgroundColor: '#eff6ff',
                                borderWidth: 1,
                                borderColor: '#bfdbfe',
                            }}>
                            <View
                                className="w-7 h-7 rounded-lg justify-center items-center mr-3"
                                style={{ backgroundColor: '#dbeafe' }}>
                                <Icon name="information-outline" size={16} color="#3b82f6" />
                            </View>
                            <Text className="text-blue-700 text-xs ml-0 flex-1 leading-4 font-medium">
                                Two-factor authentication adds an extra layer of security. When enabled,
                                you'll need to enter a verification code from your authenticator app each
                                time you sign in.
                            </Text>
                        </View>
                    </View>
                )}
            </SectionCard>

            {/* Active Sessions */}
            <SectionCard title="Active Sessions" icon="devices" iconColor="#8b5cf6">
                <View
                    className="flex-row items-center justify-between p-4 bg-white rounded-2xl mb-3 shadow-sm"
                    style={{
                        elevation: 2,
                        borderLeftWidth: 3,
                        borderLeftColor: '#22c55e',
                    }}>
                    <View className="flex-row items-center flex-1">
                        <LinearGradient
                            colors={['#dcfce720', '#dcfce710']}
                            className="w-11 h-11 rounded-xl justify-center items-center"
                            style={{ borderRadius: 12 }}>
                            <Icon name="cellphone" size={20} color="#22c55e" />
                        </LinearGradient>
                        <View className="ml-3.5 flex-1">
                            <Text className="text-gray-900 font-bold text-sm">Current Session</Text>
                            <Text className="text-gray-400 text-xs mt-0.5">
                                Mobile App • Los Angeles, CA
                            </Text>
                        </View>
                    </View>
                    <View
                        className="px-3 py-1.5 rounded-full flex-row items-center"
                        style={{ backgroundColor: '#dcfce7' }}>
                        <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                        <Text className="text-green-700 text-xs font-bold">Active</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() =>
                        Alert.alert(
                            'Sign Out',
                            'Are you sure you want to sign out all other sessions?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Sign Out',
                                    style: 'destructive',
                                    onPress: () => Alert.alert('Success', 'All other sessions signed out.'),
                                },
                            ],
                        )
                    }
                    activeOpacity={0.7}
                    style={{
                        borderRadius: 14,
                        borderWidth: 1.5,
                        borderColor: '#fee2e2',
                        backgroundColor: '#fef2f2',
                        paddingVertical: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <Icon name="logout" size={18} color="#dc2626" />
                    <Text style={{ color: '#dc2626', fontWeight: 'bold', fontSize: 14, marginLeft: 8 }}>
                        Sign Out All Other Sessions
                    </Text>
                </TouchableOpacity>
            </SectionCard>
        </View>
    );

    // ═══════════════════════════════════════════════
    // ─── RENDER PREFERENCES TAB ───
    // ═══════════════════════════════════════════════
    const renderPreferencesTab = () => (
        <View>
            <SectionCard title="General Preferences" icon="cog-outline" iconColor="#1e3a8a">
                {loading ? (
                    <SkeletonLoader count={3} />
                ) : (
                    <View>
                        {/* Language */}
                        <SelectRow
                            icon="translate"
                            iconColor="#3b82f6"
                            label="Language"
                            value={preferences.language}
                            options={[
                                { value: 'en', label: 'English' },
                                { value: 'es', label: 'Español' },
                                { value: 'fr', label: 'Français' },
                                { value: 'de', label: 'Deutsch' },
                            ]}
                            onSelect={v => setPreferences(p => ({ ...p, language: v }))}
                        />

                        {/* Timezone */}
                        <SelectRow
                            icon="clock-outline"
                            iconColor="#8b5cf6"
                            label="Time Zone"
                            value={preferences.timezone}
                            options={[
                                { value: 'pst', label: 'Pacific Time (PT)' },
                                { value: 'est', label: 'Eastern Time (ET)' },
                                { value: 'cst', label: 'Central Time (CT)' },
                                { value: 'mst', label: 'Mountain Time (MT)' },
                            ]}
                            onSelect={v => setPreferences(p => ({ ...p, timezone: v }))}
                        />

                        {/* Date Format */}
                        <SelectRow
                            icon="calendar-outline"
                            iconColor="#f59e0b"
                            label="Date Format"
                            value={preferences.dateFormat}
                            options={[
                                { value: 'mdy', label: 'MM/DD/YYYY' },
                                { value: 'dmy', label: 'DD/MM/YYYY' },
                                { value: 'ymd', label: 'YYYY-MM-DD' },
                            ]}
                            onSelect={v => setPreferences(p => ({ ...p, dateFormat: v }))}
                        />
                    </View>
                )}
            </SectionCard>

            <SectionCard title="Coach Preferences" icon="whistle" iconColor="#22c55e">
                {loading ? (
                    <SkeletonLoader count={3} />
                ) : (
                    <View>
                        {/* Dark Mode */}
                        <ToggleRow
                            icon="weather-night"
                            iconColor="#6366f1"
                            title="Dark Mode"
                            description="Switch between light and dark themes"
                            value={preferences.darkMode}
                            onValueChange={v => setPreferences(p => ({ ...p, darkMode: v }))}
                            disabled={saving}
                        />

                        {/* Auto-accept Bookings */}
                        <ToggleRow
                            icon="calendar-check"
                            iconColor="#22c55e"
                            title="Auto-accept Bookings"
                            description="Automatically confirm new session bookings"
                            value={preferences.autoAcceptBookings}
                            onValueChange={v =>
                                setPreferences(p => ({ ...p, autoAcceptBookings: v }))
                            }
                            disabled={saving}
                        />

                        {/* Show Availability */}
                        <ToggleRow
                            icon="eye-outline"
                            iconColor="#3b82f6"
                            title="Show Availability to Clients"
                            description="Let clients see your available time slots"
                            value={preferences.showAvailability}
                            onValueChange={v =>
                                setPreferences(p => ({ ...p, showAvailability: v }))
                            }
                            disabled={saving}
                        />

                        <TouchableOpacity
                            onPress={handleSavePreferences}
                            disabled={saving}
                            activeOpacity={0.8}
                            className="mt-3"
                            style={{ borderRadius: 14, overflow: 'hidden' }}>
                            <LinearGradient
                                colors={saving ? ['#d1d5db', '#d1d5db'] : ['#1e3a8a', '#3b82f6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    borderRadius: 14,
                                    paddingVertical: 14,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                {saving && (
                                    <ActivityIndicator
                                        size="small"
                                        color="#fff"
                                        style={{ marginRight: 8 }}
                                    />
                                )}
                                <Icon name="content-save-outline" size={18} color="#fff" />
                                <Text className="text-white font-bold text-base ml-2">
                                    {saving ? 'Saving...' : 'Save All Settings'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </SectionCard>
        </View>
    );

    // ═══════════════════════════════════════════════
    // ─── LOADING STATE (Dashboard Style) ───
    // ═══════════════════════════════════════════════
    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <View className="w-16 h-16 rounded-2xl bg-blue-50 justify-center items-center mb-4">
                    <ActivityIndicator size="large" color="#1e3a8a" />
                </View>
                <Text className="text-gray-900 font-bold text-base">Loading Settings</Text>
                <Text className="text-gray-400 mt-1 text-sm">Preparing your preferences...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#1e3a8a']}
                        tintColor="#1e3a8a"
                    />
                }>
                {/* ═══════════════════════════════════════════════ */}
                {/* ─── HEADER WITH GRADIENT (Dashboard Style) ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <LinearGradient
                    colors={['#0f172a', '#1e3a8a', '#3b82f6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        paddingTop: 48,
                        paddingBottom: 40,
                        borderBottomLeftRadius: 32,
                        borderBottomRightRadius: 32,
                    }}>
                    {/* Top Bar */}
                    <View className="flex-row justify-between items-center px-5 mb-5">
                        <DrawerMenuButton />
                        <View className="flex-row items-center">
                            <TouchableOpacity
                                onPress={onRefresh}
                                disabled={refreshing}
                                className="w-10 h-10 bg-white/15 rounded-full justify-center items-center"
                                style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                                <Icon
                                    name="refresh"
                                    size={20}
                                    color="#fff"
                                    style={refreshing ? { transform: [{ rotate: '45deg' }] } : undefined}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Settings Header Content */}
                    <View className="px-5">
                        <View className="flex-row items-center mb-2">
                            <View
                                className="w-12 h-12 rounded-2xl justify-center items-center mr-4"
                                style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                                <Icon name="cog" size={24} color="#fff" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white font-bold text-2xl">Settings</Text>
                                <Text className="text-white/60 text-sm mt-0.5 font-medium">
                                    Manage your account preferences
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Quick Settings Info Bar */}
                    <View
                        className="mx-5 mt-4 bg-white/10 rounded-2xl p-4"
                        style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1 items-center">
                                <View className="w-8 h-8 bg-green-400/20 rounded-lg justify-center items-center mb-1.5">
                                    <Icon name="shield-check" size={14} color="#4ade80" />
                                </View>
                                <Text className="text-white/50 text-[10px] font-semibold uppercase">
                                    2FA
                                </Text>
                                <Text className="text-white font-bold text-xs mt-0.5">
                                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                </Text>
                            </View>
                            <View className="w-px h-10 bg-white/10" />
                            <View className="flex-1 items-center">
                                <View className="w-8 h-8 bg-blue-400/20 rounded-lg justify-center items-center mb-1.5">
                                    <Icon name="bell-outline" size={14} color="#60a5fa" />
                                </View>
                                <Text className="text-white/50 text-[10px] font-semibold uppercase">
                                    Push
                                </Text>
                                <Text className="text-white font-bold text-xs mt-0.5">
                                    {notifications.push ? 'On' : 'Off'}
                                </Text>
                            </View>
                            <View className="w-px h-10 bg-white/10" />
                            <View className="flex-1 items-center">
                                <View className="w-8 h-8 bg-purple-400/20 rounded-lg justify-center items-center mb-1.5">
                                    <Icon name="translate" size={14} color="#a78bfa" />
                                </View>
                                <Text className="text-white/50 text-[10px] font-semibold uppercase">
                                    Language
                                </Text>
                                <Text className="text-white font-bold text-xs mt-0.5">
                                    {preferences.language === 'en' ? 'English' : preferences.language.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── TAB NAVIGATION (Dashboard Style) ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 -mt-5">
                    <View
                        className="bg-gray-100 rounded-2xl p-1.5 flex-row shadow-md"
                        style={{ elevation: 4, borderWidth: 1, borderColor: '#f3f4f6' }}>
                        <TabButton
                            label="Alerts"
                            icon="bell-outline"
                            isActive={activeTab === 'notifications'}
                            onPress={() => setActiveTab('notifications')}
                        />
                        <TabButton
                            label="Security"
                            icon="lock-outline"
                            isActive={activeTab === 'security'}
                            onPress={() => setActiveTab('security')}
                        />
                        <TabButton
                            label="Prefs"
                            icon="cog-outline"
                            isActive={activeTab === 'preferences'}
                            onPress={() => setActiveTab('preferences')}
                        />
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── TAB CONTENT ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-6">
                    {activeTab === 'notifications' && renderNotificationsTab()}
                    {activeTab === 'security' && renderSecurityTab()}
                    {activeTab === 'preferences' && renderPreferencesTab()}
                </View>

                {/* Bottom Spacing */}
                <View className="h-8" />
            </ScrollView>
        </View>
    );
};

export default CoachSettingsScreen;