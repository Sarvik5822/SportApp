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

// ─── Tab Button Component ───
const TabButton = ({ label, icon, isActive, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${isActive ? 'bg-blue-600' : 'bg-transparent'
            }`}>
        <Icon name={icon} size={18} color={isActive ? '#fff' : '#6b7280'} />
        <Text
            className={`ml-1.5 font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-500'
                }`}>
            {label}
        </Text>
    </TouchableOpacity>
);

// ─── Toggle Row Component ───
const ToggleRow = ({ icon, iconColor, title, description, value, onValueChange, disabled }) => (
    <View
        className="flex-row items-center justify-between p-4 bg-white rounded-xl mb-3 shadow-sm"
        style={{ elevation: 2 }}>
        <View className="flex-row items-center flex-1 mr-3">
            <View
                className="w-10 h-10 rounded-lg justify-center items-center"
                style={{ backgroundColor: `${iconColor}15` }}>
                <Icon name={icon} size={20} color={iconColor} />
            </View>
            <View className="ml-3 flex-1">
                <Text className="text-gray-900 font-semibold text-sm">{title}</Text>
                <Text className="text-gray-400 text-xs mt-0.5">{description}</Text>
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

// ─── Section Card Component ───
const SectionCard = ({ title, icon, iconColor, children }) => (
    <View className="bg-gray-50 rounded-2xl p-4 mb-4">
        <View className="flex-row items-center mb-4">
            <View
                className="w-9 h-9 rounded-lg justify-center items-center"
                style={{ backgroundColor: `${iconColor}15` }}>
                <Icon name={icon} size={20} color={iconColor} />
            </View>
            <Text className="text-gray-900 font-bold text-lg ml-2">{title}</Text>
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
                className="bg-gray-200 rounded-xl h-16 mb-3"
                style={{ opacity: 0.5 }}
            />
        ))}
    </View>
);

// ─── Select Row Component (simulated dropdown) ───
const SelectRow = ({ icon, iconColor, label, value, options, onSelect }) => {
    const [expanded, setExpanded] = useState(false);
    const selectedOption = options.find(o => o.value === value);

    return (
        <View className="mb-3">
            <TouchableOpacity
                onPress={() => setExpanded(!expanded)}
                activeOpacity={0.7}
                className="flex-row items-center justify-between p-4 bg-white rounded-xl shadow-sm"
                style={{ elevation: 2 }}>
                <View className="flex-row items-center flex-1">
                    <View
                        className="w-10 h-10 rounded-lg justify-center items-center"
                        style={{ backgroundColor: `${iconColor}15` }}>
                        <Icon name={icon} size={20} color={iconColor} />
                    </View>
                    <View className="ml-3 flex-1">
                        <Text className="text-gray-400 text-xs">{label}</Text>
                        <Text className="text-gray-900 font-semibold text-sm mt-0.5">
                            {selectedOption?.label || value}
                        </Text>
                    </View>
                </View>
                <Icon
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#9ca3af"
                />
            </TouchableOpacity>
            {expanded && (
                <View className="bg-white rounded-xl mt-1 overflow-hidden shadow-sm" style={{ elevation: 2 }}>
                    {options.map((option, index) => (
                        <TouchableOpacity
                            key={option.value}
                            onPress={() => {
                                onSelect(option.value);
                                setExpanded(false);
                            }}
                            activeOpacity={0.7}
                            className={`flex-row items-center justify-between px-4 py-3 ${index < options.length - 1 ? 'border-b border-gray-100' : ''
                                } ${option.value === value ? 'bg-blue-50' : ''}`}>
                            <Text
                                className={`text-sm ${option.value === value
                                    ? 'text-blue-700 font-semibold'
                                    : 'text-gray-700'
                                    }`}>
                                {option.label}
                            </Text>
                            {option.value === value && (
                                <Icon name="check" size={18} color="#1e3a8a" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

// ─── Main Coach Settings Screen ───
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

    // ─── Password Input Component ───
    const PasswordInput = ({ label, value, onChangeText, showPassword, toggleShow, placeholder }) => (
        <View className="mb-4">
            <Text className="text-gray-700 font-medium text-sm mb-2">{label}</Text>
            <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4">
                <Icon name="lock-outline" size={20} color="#9ca3af" />
                <TextInput
                    className="flex-1 py-3.5 px-3 text-gray-900 text-sm"
                    secureTextEntry={!showPassword}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#d1d5db"
                    autoCapitalize="none"
                />
                <TouchableOpacity onPress={toggleShow} activeOpacity={0.7}>
                    <Icon
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#9ca3af"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    // ─── Render Notifications Tab ───
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
                            className="mt-2">
                            <LinearGradient
                                colors={saving ? ['#d1d5db', '#d1d5db'] : ['#1e3a8a', '#3b82f6']}
                                className="rounded-xl py-4 items-center flex-row justify-center">
                                {saving && (
                                    <ActivityIndicator
                                        size="small"
                                        color="#fff"
                                        style={{ marginRight: 8 }}
                                    />
                                )}
                                <Icon name="content-save-outline" size={20} color="#fff" />
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

    // ─── Render Security Tab ───
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
                            activeOpacity={0.8}>
                            <LinearGradient
                                colors={saving ? ['#d1d5db', '#d1d5db'] : ['#1e3a8a', '#3b82f6']}
                                className="rounded-xl py-4 items-center flex-row justify-center">
                                {saving && (
                                    <ActivityIndicator
                                        size="small"
                                        color="#fff"
                                        style={{ marginRight: 8 }}
                                    />
                                )}
                                <Icon name="lock-check" size={20} color="#fff" />
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
                        <View className="bg-blue-50 rounded-xl p-3 flex-row items-start">
                            <Icon name="information-outline" size={18} color="#3b82f6" />
                            <Text className="text-blue-700 text-xs ml-2 flex-1">
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
                    className="flex-row items-center justify-between p-4 bg-white rounded-xl mb-3 shadow-sm"
                    style={{ elevation: 2 }}>
                    <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 rounded-lg bg-green-50 justify-center items-center">
                            <Icon name="cellphone" size={20} color="#22c55e" />
                        </View>
                        <View className="ml-3 flex-1">
                            <Text className="text-gray-900 font-semibold text-sm">Current Session</Text>
                            <Text className="text-gray-400 text-xs mt-0.5">
                                Mobile App • Los Angeles, CA
                            </Text>
                        </View>
                    </View>
                    <View className="bg-green-100 px-2.5 py-1 rounded-full">
                        <Text className="text-green-700 text-xs font-semibold">Active</Text>
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
                    className="flex-row items-center justify-center p-3 border border-gray-200 rounded-xl">
                    <Icon name="logout" size={18} color="#6b7280" />
                    <Text className="text-gray-600 font-semibold text-sm ml-2">
                        Sign Out All Other Sessions
                    </Text>
                </TouchableOpacity>
            </SectionCard>
        </View>
    );

    // ─── Render Preferences Tab ───
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
                            className="mt-2">
                            <LinearGradient
                                colors={saving ? ['#d1d5db', '#d1d5db'] : ['#1e3a8a', '#3b82f6']}
                                className="rounded-xl py-4 items-center flex-row justify-center">
                                {saving && (
                                    <ActivityIndicator
                                        size="small"
                                        color="#fff"
                                        style={{ marginRight: 8 }}
                                    />
                                )}
                                <Icon name="content-save-outline" size={20} color="#fff" />
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

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#1e3a8a']}
                />
            }>
            {/* ─── Header ─── */}
            <LinearGradient
                colors={['#1e3a8a', '#3b82f6']}
                className="px-6 pt-12 pb-8 rounded-b-[30px]">
                <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center">
                        <DrawerMenuButton />
                        <View className="ml-2">
                            <Text className="text-white font-bold text-2xl">Settings</Text>
                            <Text className="text-white/80 text-sm">
                                Manage your account preferences
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={onRefresh}
                        disabled={loading}
                        className="w-10 h-10 bg-white/20 rounded-full justify-center items-center">
                        <Icon
                            name="refresh"
                            size={22}
                            color="#fff"
                            style={loading ? { transform: [{ rotate: '45deg' }] } : undefined}
                        />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* ─── Tab Selector ─── */}
            <View className="px-4 -mt-5">
                <View
                    className="bg-white rounded-2xl p-1.5 flex-row shadow-md"
                    style={{ elevation: 4 }}>
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

            {/* ─── Tab Content ─── */}
            <View className="px-4 mt-6">
                {activeTab === 'notifications' && renderNotificationsTab()}
                {activeTab === 'security' && renderSecurityTab()}
                {activeTab === 'preferences' && renderPreferencesTab()}
            </View>

            {/* Bottom Spacing */}
            <View className="h-8" />
        </ScrollView>
    );
};

export default CoachSettingsScreen;