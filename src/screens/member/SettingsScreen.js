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

// ─── Mock Settings Service (replace with real API later) ───
const mockSettingsService = {
    getSettings: async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return {
            data: {
                settings: {
                    notifications: { email: true, push: true, sms: false },
                    privacy: { profileVisible: true, showActivity: true },
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
    updateNotificationSettings: async notifications => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return { data: { success: true } };
    },
    updatePrivacySettings: async privacy => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return { data: { success: true } };
    },
};

// ─── Tab Button Component ───
const TabButton = ({ label, icon, isActive, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${isActive ? 'bg-emerald-500' : 'bg-transparent'
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
            trackColor={{ false: '#e5e7eb', true: '#6ee7b7' }}
            thumbColor={value ? '#059669' : '#f4f3f4'}
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

// ─── Main Settings Screen ───
const SettingsScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('security');
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

    const [privacy, setPrivacy] = useState({
        profileVisible: true,
        showActivity: true,
    });

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const res = await mockSettingsService.getSettings();
            const data = res.data;
            setTwoFactorEnabled(data?.twoFactorEnabled || false);
            if (data?.settings?.notifications) {
                setNotifications({
                    email: data.settings.notifications.email ?? true,
                    push: data.settings.notifications.push ?? true,
                    sms: data.settings.notifications.sms ?? false,
                });
            }
            if (data?.settings?.privacy) {
                setPrivacy({
                    profileVisible: data.settings.privacy.profileVisible ?? true,
                    showActivity: data.settings.privacy.showActivity ?? true,
                });
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
            await mockSettingsService.changePassword({
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
            const res = await mockSettingsService.toggle2FA({ enable });
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
            await mockSettingsService.updateNotificationSettings(notifications);
            Alert.alert('Success', 'Notification preferences saved!');
        } catch (error) {
            Alert.alert('Error', 'Failed to save notifications: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    // ─── Privacy Save Handler ───
    const handleSavePrivacy = async () => {
        try {
            setSaving(true);
            await mockSettingsService.updatePrivacySettings(privacy);
            Alert.alert('Success', 'Privacy settings saved!');
        } catch (error) {
            Alert.alert('Error', 'Failed to save privacy settings: ' + error.message);
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

    // ─── Render Security Tab ───
    const renderSecurityTab = () => (
        <View>
            {/* Change Password Section */}
            <SectionCard title="Change Password" icon="lock-outline" iconColor="#059669">
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
                                colors={saving ? ['#d1d5db', '#d1d5db'] : ['#059669', '#10b981']}
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
        </View>
    );

    // ─── Render Notifications Tab ───
    const renderNotificationsTab = () => (
        <View>
            <SectionCard title="Notification Channels" icon="bell-outline" iconColor="#f59e0b">
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
                            icon="message-text-outline"
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
                                colors={saving ? ['#d1d5db', '#d1d5db'] : ['#f59e0b', '#fbbf24']}
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
                                    {saving ? 'Saving...' : 'Save Preferences'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </SectionCard>
        </View>
    );

    // ─── Render Privacy Tab ───
    const renderPrivacyTab = () => (
        <View>
            <SectionCard title="Privacy Controls" icon="eye-outline" iconColor="#8b5cf6">
                {loading ? (
                    <SkeletonLoader count={2} />
                ) : (
                    <View>
                        <ToggleRow
                            icon="account-eye-outline"
                            iconColor="#8b5cf6"
                            title="Profile Visibility"
                            description="Allow other members to see your profile"
                            value={privacy.profileVisible}
                            onValueChange={v => setPrivacy(p => ({ ...p, profileVisible: v }))}
                            disabled={saving}
                        />
                        <ToggleRow
                            icon="chart-line"
                            iconColor="#059669"
                            title="Show Activity"
                            description="Display your activity on leaderboards"
                            value={privacy.showActivity}
                            onValueChange={v => setPrivacy(p => ({ ...p, showActivity: v }))}
                            disabled={saving}
                        />

                        <TouchableOpacity
                            onPress={handleSavePrivacy}
                            disabled={saving}
                            activeOpacity={0.8}
                            className="mt-2">
                            <LinearGradient
                                colors={saving ? ['#d1d5db', '#d1d5db'] : ['#8b5cf6', '#a78bfa']}
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
                                    {saving ? 'Saving...' : 'Save Privacy Settings'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </SectionCard>

            {/* Data Management Section */}
            <SectionCard title="Data Management" icon="database-outline" iconColor="#ef4444">
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => Alert.alert('Download Data', 'Your data export will be sent to your email.')}
                    className="flex-row items-center bg-white rounded-xl p-4 mb-3 shadow-sm"
                    style={{ elevation: 2 }}>
                    <View className="w-10 h-10 rounded-lg bg-blue-50 justify-center items-center">
                        <Icon name="download" size={20} color="#3b82f6" />
                    </View>
                    <View className="ml-3 flex-1">
                        <Text className="text-gray-900 font-semibold text-sm">Download My Data</Text>
                        <Text className="text-gray-400 text-xs mt-0.5">
                            Export all your personal data
                        </Text>
                    </View>
                    <Icon name="chevron-right" size={20} color="#d1d5db" />
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                        Alert.alert(
                            'Delete Account',
                            'Are you sure you want to delete your account? This action cannot be undone.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Delete', style: 'destructive', onPress: () => { } },
                            ],
                        )
                    }
                    className="flex-row items-center bg-white rounded-xl p-4 mb-3 border border-red-200 shadow-sm"
                    style={{ elevation: 2 }}>
                    <View className="w-10 h-10 rounded-lg bg-red-50 justify-center items-center">
                        <Icon name="delete-outline" size={20} color="#ef4444" />
                    </View>
                    <View className="ml-3 flex-1">
                        <Text className="text-red-500 font-semibold text-sm">Delete My Account</Text>
                        <Text className="text-gray-400 text-xs mt-0.5">
                            Permanently remove your account and data
                        </Text>
                    </View>
                    <Icon name="chevron-right" size={20} color="#fca5a5" />
                </TouchableOpacity>
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
                    colors={['#059669']}
                />
            }>
            {/* ─── Header ─── */}
            <LinearGradient
                colors={['#059669', '#10b981']}
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
                        label="Security"
                        icon="lock-outline"
                        isActive={activeTab === 'security'}
                        onPress={() => setActiveTab('security')}
                    />
                    <TabButton
                        label="Alerts"
                        icon="bell-outline"
                        isActive={activeTab === 'notifications'}
                        onPress={() => setActiveTab('notifications')}
                    />
                    <TabButton
                        label="Privacy"
                        icon="eye-outline"
                        isActive={activeTab === 'privacy'}
                        onPress={() => setActiveTab('privacy')}
                    />
                </View>
            </View>

            {/* ─── Tab Content ─── */}
            <View className="px-4 mt-6">
                {activeTab === 'security' && renderSecurityTab()}
                {activeTab === 'notifications' && renderNotificationsTab()}
                {activeTab === 'privacy' && renderPrivacyTab()}
            </View>

            {/* Bottom Spacing */}
            <View className="h-8" />
        </ScrollView>
    );
};

export default SettingsScreen;