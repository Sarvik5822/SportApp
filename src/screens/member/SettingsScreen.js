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
                colors={['#064e3b', '#059669']}
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
const ToggleRow = ({
    icon,
    iconColor,
    title,
    description,
    value,
    onValueChange,
    disabled,
}) => (
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
                <Text className="text-gray-400 text-xs mt-0.5 leading-4">
                    {description}
                </Text>
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
// ─── MAIN SETTINGS SCREEN ───
// ═══════════════════════════════════════════════
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
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
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

    // ─── Enhanced Password Input Component ───
    const PasswordInput = ({
        label,
        value,
        onChangeText,
        showPassword,
        toggleShow,
        placeholder,
    }) => (
        <View className="mb-4">
            <Text className="text-gray-400 text-[11px] mb-2 font-bold uppercase tracking-wider">
                {label}
            </Text>
            <View
                className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4"
                style={{ borderWidth: 1.5 }}>
                <View
                    className="w-8 h-8 rounded-lg justify-center items-center mr-2"
                    style={{ backgroundColor: '#05966912' }}>
                    <Icon name="lock-outline" size={16} color="#059669" />
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
    // ─── RENDER SECURITY TAB ───
    // ═══════════════════════════════════════════════
    const renderSecurityTab = () => (
        <View>
            {/* Change Password Section */}
            <SectionCard
                title="Change Password"
                icon="lock-outline"
                iconColor="#059669">
                {loading ? (
                    <SkeletonLoader count={3} />
                ) : (
                    <View>
                        <PasswordInput
                            label="Current Password"
                            value={passwordForm.currentPassword}
                            onChangeText={text =>
                                setPasswordForm(p => ({
                                    ...p,
                                    currentPassword: text,
                                }))
                            }
                            showPassword={showCurrentPassword}
                            toggleShow={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                            }
                            placeholder="Enter current password"
                        />
                        <PasswordInput
                            label="New Password"
                            value={passwordForm.newPassword}
                            onChangeText={text =>
                                setPasswordForm(p => ({
                                    ...p,
                                    newPassword: text,
                                }))
                            }
                            showPassword={showNewPassword}
                            toggleShow={() =>
                                setShowNewPassword(!showNewPassword)
                            }
                            placeholder="Enter new password"
                        />
                        <PasswordInput
                            label="Confirm New Password"
                            value={passwordForm.confirmPassword}
                            onChangeText={text =>
                                setPasswordForm(p => ({
                                    ...p,
                                    confirmPassword: text,
                                }))
                            }
                            showPassword={showConfirmPassword}
                            toggleShow={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                            placeholder="Confirm new password"
                        />

                        {/* Password Strength Indicator */}
                        {passwordForm.newPassword.length > 0 && (
                            <View className="mb-4">
                                <View className="flex-row mb-1.5" style={{ gap: 4 }}>
                                    {[1, 2, 3, 4].map(i => (
                                        <View
                                            key={i}
                                            className="flex-1 h-1.5 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    passwordForm.newPassword.length >= i * 3
                                                        ? passwordForm.newPassword.length >= 12
                                                            ? '#059669'
                                                            : passwordForm.newPassword.length >= 8
                                                                ? '#f59e0b'
                                                                : '#ef4444'
                                                        : '#e5e7eb',
                                            }}
                                        />
                                    ))}
                                </View>
                                <Text
                                    className="text-[10px] font-semibold"
                                    style={{
                                        color:
                                            passwordForm.newPassword.length >= 12
                                                ? '#059669'
                                                : passwordForm.newPassword.length >= 8
                                                    ? '#f59e0b'
                                                    : '#ef4444',
                                    }}>
                                    {passwordForm.newPassword.length >= 12
                                        ? 'Strong password'
                                        : passwordForm.newPassword.length >= 8
                                            ? 'Medium strength'
                                            : passwordForm.newPassword.length >= 6
                                                ? 'Weak password'
                                                : 'Too short'}
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity
                            onPress={handleChangePassword}
                            disabled={saving}
                            activeOpacity={0.8}
                            style={{ borderRadius: 14, overflow: 'hidden' }}>
                            <LinearGradient
                                colors={
                                    saving
                                        ? ['#d1d5db', '#d1d5db']
                                        : ['#064e3b', '#059669']
                                }
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
            <SectionCard
                title="Two-Factor Authentication"
                icon="shield-lock-outline"
                iconColor="#3b82f6">
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
                                className="w-7 h-7 rounded-lg justify-center items-center mr-3 mt-0.5"
                                style={{ backgroundColor: '#dbeafe' }}>
                                <Icon
                                    name="information-outline"
                                    size={16}
                                    color="#3b82f6"
                                />
                            </View>
                            <Text className="text-blue-700 text-xs flex-1 leading-4 font-medium">
                                Two-factor authentication adds an extra layer of security.
                                When enabled, you'll need to enter a verification code from
                                your authenticator app each time you sign in.
                            </Text>
                        </View>

                        {/* 2FA Status Card */}
                        <View
                            className="mt-3 rounded-2xl p-4 flex-row items-center"
                            style={{
                                backgroundColor: twoFactorEnabled
                                    ? '#f0fdf4'
                                    : '#fef2f2',
                                borderWidth: 1,
                                borderColor: twoFactorEnabled
                                    ? '#bbf7d0'
                                    : '#fecaca',
                            }}>
                            <View
                                className="w-10 h-10 rounded-xl justify-center items-center mr-3"
                                style={{
                                    backgroundColor: twoFactorEnabled
                                        ? '#dcfce7'
                                        : '#fee2e2',
                                }}>
                                <Icon
                                    name={
                                        twoFactorEnabled
                                            ? 'shield-check'
                                            : 'shield-alert-outline'
                                    }
                                    size={22}
                                    color={
                                        twoFactorEnabled ? '#16a34a' : '#dc2626'
                                    }
                                />
                            </View>
                            <View className="flex-1">
                                <Text
                                    className="font-bold text-sm"
                                    style={{
                                        color: twoFactorEnabled
                                            ? '#166534'
                                            : '#991b1b',
                                    }}>
                                    {twoFactorEnabled
                                        ? 'Account Protected'
                                        : 'Account Vulnerable'}
                                </Text>
                                <Text
                                    className="text-xs mt-0.5"
                                    style={{
                                        color: twoFactorEnabled
                                            ? '#15803d'
                                            : '#b91c1c',
                                    }}>
                                    {twoFactorEnabled
                                        ? 'Your account has an extra layer of security'
                                        : 'Enable 2FA to protect your account'}
                                </Text>
                            </View>
                            {!twoFactorEnabled && (
                                <View className="bg-red-100 px-2.5 py-1 rounded-full">
                                    <Text className="text-red-700 text-[10px] font-bold">
                                        Action Needed
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}
            </SectionCard>

            {/* Active Sessions Section */}
            <SectionCard
                title="Active Sessions"
                icon="devices"
                iconColor="#8b5cf6">
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
                            <Text className="text-gray-900 font-bold text-sm">
                                Current Session
                            </Text>
                            <Text className="text-gray-400 text-xs mt-0.5">
                                Mobile App • Active Now
                            </Text>
                        </View>
                    </View>
                    <View
                        className="px-3 py-1.5 rounded-full flex-row items-center"
                        style={{ backgroundColor: '#dcfce7' }}>
                        <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                        <Text className="text-green-700 text-xs font-bold">
                            Active
                        </Text>
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
                                    onPress: () =>
                                        Alert.alert(
                                            'Success',
                                            'All other sessions signed out.',
                                        ),
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
                    <Text
                        style={{
                            color: '#dc2626',
                            fontWeight: 'bold',
                            fontSize: 14,
                            marginLeft: 8,
                        }}>
                        Sign Out All Other Sessions
                    </Text>
                </TouchableOpacity>
            </SectionCard>
        </View>
    );

    // ═══════════════════════════════════════════════
    // ─── RENDER NOTIFICATIONS TAB ───
    // ═══════════════════════════════════════════════
    const renderNotificationsTab = () => (
        <View>
            {/* Notification Channels */}
            <SectionCard
                title="Notification Method"
                icon="tune-variant"
                iconColor="#3b82f6">
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
                            onValueChange={v =>
                                setNotifications(p => ({ ...p, email: v }))
                            }
                            disabled={saving}
                        />
                        <ToggleRow
                            icon="bell-ring-outline"
                            iconColor="#3b82f6"
                            title="Push Notifications"
                            description="Receive push notifications on your device"
                            value={notifications.push}
                            onValueChange={v =>
                                setNotifications(p => ({ ...p, push: v }))
                            }
                            disabled={saving}
                        />
                        <ToggleRow
                            icon="cellphone-message"
                            iconColor="#8b5cf6"
                            title="SMS Notifications"
                            description="Receive notifications via SMS"
                            value={notifications.sms}
                            onValueChange={v =>
                                setNotifications(p => ({ ...p, sms: v }))
                            }
                            disabled={saving}
                        />

                        {/* Notification Summary Card */}
                        <View
                            className="rounded-2xl p-4"
                            style={{
                                backgroundColor: '#f0fdf4',
                                borderWidth: 1,
                                borderColor: '#bbf7d0',
                            }}>
                            <View className="flex-row items-center mb-3">
                                <View
                                    className="w-7 h-7 rounded-lg justify-center items-center mr-2"
                                    style={{ backgroundColor: '#dcfce7' }}>
                                    <Icon
                                        name="chart-bar"
                                        size={14}
                                        color="#059669"
                                    />
                                </View>
                                <Text className="text-green-800 font-bold text-xs">
                                    NOTIFICATION SUMMARY
                                </Text>
                            </View>
                            <View className="flex-row" style={{ gap: 8 }}>
                                {[
                                    {
                                        label: 'Email',
                                        active: notifications.email,
                                        color: '#059669',
                                    },
                                    {
                                        label: 'Push',
                                        active: notifications.push,
                                        color: '#3b82f6',
                                    },
                                    {
                                        label: 'SMS',
                                        active: notifications.sms,
                                        color: '#8b5cf6',
                                    },
                                ].map(channel => (
                                    <View
                                        key={channel.label}
                                        className="flex-1 rounded-xl p-3 items-center"
                                        style={{
                                            backgroundColor: channel.active
                                                ? `${channel.color}12`
                                                : '#fef2f2',
                                            borderWidth: 1,
                                            borderColor: channel.active
                                                ? `${channel.color}30`
                                                : '#fecaca',
                                        }}>
                                        <Icon
                                            name={
                                                channel.active
                                                    ? 'check-circle'
                                                    : 'close-circle'
                                            }
                                            size={20}
                                            color={
                                                channel.active
                                                    ? channel.color
                                                    : '#ef4444'
                                            }
                                        />
                                        <Text
                                            className="text-[10px] font-bold mt-1"
                                            style={{
                                                color: channel.active
                                                    ? channel.color
                                                    : '#ef4444',
                                            }}>
                                            {channel.label}
                                        </Text>
                                        <Text
                                            className="text-[9px] mt-0.5 font-medium"
                                            style={{
                                                color: channel.active
                                                    ? `${channel.color}99`
                                                    : '#ef444480',
                                            }}>
                                            {channel.active ? 'Enabled' : 'Disabled'}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleSaveNotifications}
                            disabled={saving}
                            activeOpacity={0.8}
                            className="mt-3"
                            style={{ borderRadius: 14, overflow: 'hidden' }}>
                            <LinearGradient
                                colors={
                                    saving
                                        ? ['#d1d5db', '#d1d5db']
                                        : ['#064e3b', '#059669']
                                }
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
                                <Icon
                                    name="content-save-outline"
                                    size={18}
                                    color="#fff"
                                />
                                <Text className="text-white font-bold text-base ml-2">
                                    {saving ? 'Saving...' : 'Save Preferences'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </SectionCard>

            {/* Notification Tips */}
            <SectionCard
                title="Tips"
                icon="lightbulb-outline"
                iconColor="#f59e0b">
                <View
                    className="rounded-2xl p-4 flex-row items-start"
                    style={{
                        backgroundColor: '#fffbeb',
                        borderWidth: 1,
                        borderColor: '#fde68a',
                    }}>
                    <View
                        className="w-7 h-7 rounded-lg justify-center items-center mr-3 mt-0.5"
                        style={{ backgroundColor: '#fef3c7' }}>
                        <Icon
                            name="lightbulb-on-outline"
                            size={16}
                            color="#f59e0b"
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-amber-800 font-bold text-xs mb-1">
                            RECOMMENDED SETTINGS
                        </Text>
                        <Text className="text-amber-700 text-xs leading-4">
                            For the best experience, we recommend enabling push
                            notifications and email notifications. SMS is optional
                            and may incur carrier charges.
                        </Text>
                    </View>
                </View>
            </SectionCard>
        </View>
    );

    // ═══════════════════════════════════════════════
    // ─── RENDER PRIVACY TAB ───
    // ═══════════════════════════════════════════════
    const renderPrivacyTab = () => (
        <View>
            {/* Privacy Controls */}
            <SectionCard
                title="Privacy Controls"
                icon="eye-outline"
                iconColor="#8b5cf6">
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
                            onValueChange={v =>
                                setPrivacy(p => ({
                                    ...p,
                                    profileVisible: v,
                                }))
                            }
                            disabled={saving}
                        />
                        <ToggleRow
                            icon="chart-line"
                            iconColor="#059669"
                            title="Show Activity"
                            description="Display your activity on leaderboards"
                            value={privacy.showActivity}
                            onValueChange={v =>
                                setPrivacy(p => ({ ...p, showActivity: v }))
                            }
                            disabled={saving}
                        />

                        {/* Privacy Status Card */}
                        <View
                            className="rounded-2xl p-4"
                            style={{
                                backgroundColor: privacy.profileVisible
                                    ? '#f0fdf4'
                                    : '#fef2f2',
                                borderWidth: 1,
                                borderColor: privacy.profileVisible
                                    ? '#bbf7d0'
                                    : '#fecaca',
                            }}>
                            <View className="flex-row items-center">
                                <View
                                    className="w-10 h-10 rounded-xl justify-center items-center mr-3"
                                    style={{
                                        backgroundColor: privacy.profileVisible
                                            ? '#dcfce7'
                                            : '#fee2e2',
                                    }}>
                                    <Icon
                                        name={
                                            privacy.profileVisible
                                                ? 'eye-check'
                                                : 'eye-off'
                                        }
                                        size={22}
                                        color={
                                            privacy.profileVisible
                                                ? '#16a34a'
                                                : '#dc2626'
                                        }
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text
                                        className="font-bold text-sm"
                                        style={{
                                            color: privacy.profileVisible
                                                ? '#166534'
                                                : '#991b1b',
                                        }}>
                                        {privacy.profileVisible
                                            ? 'Profile is Public'
                                            : 'Profile is Private'}
                                    </Text>
                                    <Text
                                        className="text-xs mt-0.5"
                                        style={{
                                            color: privacy.profileVisible
                                                ? '#15803d'
                                                : '#b91c1c',
                                        }}>
                                        {privacy.profileVisible
                                            ? 'Other members can find and view your profile'
                                            : 'Only you can see your profile information'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleSavePrivacy}
                            disabled={saving}
                            activeOpacity={0.8}
                            className="mt-3"
                            style={{ borderRadius: 14, overflow: 'hidden' }}>
                            <LinearGradient
                                colors={
                                    saving
                                        ? ['#d1d5db', '#d1d5db']
                                        : ['#064e3b', '#059669']
                                }
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
                                <Icon
                                    name="content-save-outline"
                                    size={18}
                                    color="#fff"
                                />
                                <Text className="text-white font-bold text-base ml-2">
                                    {saving ? 'Saving...' : 'Save Privacy Settings'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </SectionCard>

            {/* Data Management Section */}
            <SectionCard
                title="Data Management"
                icon="database-outline"
                iconColor="#ef4444">
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                        Alert.alert(
                            'Download Data',
                            'Your data export will be sent to your email.',
                        )
                    }
                    className="flex-row items-center bg-white rounded-2xl p-4 mb-3 shadow-sm"
                    style={{
                        elevation: 2,
                        borderLeftWidth: 3,
                        borderLeftColor: '#3b82f6',
                    }}>
                    <LinearGradient
                        colors={['#dbeafe20', '#eff6ff10']}
                        className="w-11 h-11 rounded-xl justify-center items-center"
                        style={{ borderRadius: 12 }}>
                        <Icon name="download" size={20} color="#3b82f6" />
                    </LinearGradient>
                    <View className="ml-3.5 flex-1">
                        <Text className="text-gray-900 font-bold text-sm">
                            Download My Data
                        </Text>
                        <Text className="text-gray-400 text-xs mt-0.5">
                            Export all your personal data
                        </Text>
                    </View>
                    <View
                        className="w-8 h-8 rounded-full justify-center items-center"
                        style={{ backgroundColor: '#f3f4f6' }}>
                        <Icon
                            name="chevron-right"
                            size={18}
                            color="#9ca3af"
                        />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                        Alert.alert(
                            'Delete Account',
                            'Are you sure you want to delete your account? This action cannot be undone.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: () => { },
                                },
                            ],
                        )
                    }
                    className="flex-row items-center rounded-2xl p-4 mb-3 shadow-sm"
                    style={{
                        elevation: 2,
                        borderLeftWidth: 3,
                        borderLeftColor: '#ef4444',
                        backgroundColor: '#fef2f2',
                        borderWidth: 1.5,
                        borderColor: '#fecaca',
                    }}>
                    <LinearGradient
                        colors={['#fee2e220', '#fef2f210']}
                        className="w-11 h-11 rounded-xl justify-center items-center"
                        style={{ borderRadius: 12 }}>
                        <Icon name="delete-outline" size={20} color="#ef4444" />
                    </LinearGradient>
                    <View className="ml-3.5 flex-1">
                        <Text className="text-red-500 font-bold text-sm">
                            Delete My Account
                        </Text>
                        <Text className="text-red-400 text-xs mt-0.5">
                            Permanently remove your account and data
                        </Text>
                    </View>
                    <View
                        className="w-8 h-8 rounded-full justify-center items-center"
                        style={{ backgroundColor: '#fee2e2' }}>
                        <Icon
                            name="chevron-right"
                            size={18}
                            color="#fca5a5"
                        />
                    </View>
                </TouchableOpacity>

                {/* Warning Box */}
                <View
                    className="rounded-2xl p-4 flex-row items-start"
                    style={{
                        backgroundColor: '#fef2f2',
                        borderWidth: 1,
                        borderColor: '#fecaca',
                    }}>
                    <View
                        className="w-7 h-7 rounded-lg justify-center items-center mr-3 mt-0.5"
                        style={{ backgroundColor: '#fee2e2' }}>
                        <Icon
                            name="alert-outline"
                            size={16}
                            color="#dc2626"
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-red-800 font-bold text-xs mb-1">
                            WARNING
                        </Text>
                        <Text className="text-red-700 text-xs leading-4">
                            Deleting your account is permanent and cannot be undone.
                            All your data, including membership history, session records,
                            and personal information will be permanently removed.
                        </Text>
                    </View>
                </View>
            </SectionCard>
        </View>
    );

    // ═══════════════════════════════════════════════
    // ─── LOADING STATE (Dashboard Style) ───
    // ═══════════════════════════════════════════════
    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <View className="w-16 h-16 rounded-2xl bg-emerald-50 justify-center items-center mb-4">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
                <Text className="text-gray-900 font-bold text-base">
                    Loading Settings
                </Text>
                <Text className="text-gray-400 mt-1 text-sm">
                    Preparing your preferences...
                </Text>
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
                        colors={['#059669']}
                        tintColor="#059669"
                    />
                }>
                {/* ═══════════════════════════════════════════════ */}
                {/* ─── HEADER WITH GRADIENT (Dashboard Style) ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <LinearGradient
                    colors={['#064e3b', '#059669', '#10b981']}
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
                                style={{
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.1)',
                                }}>
                                <Icon
                                    name="refresh"
                                    size={20}
                                    color="#fff"
                                    style={
                                        refreshing
                                            ? { transform: [{ rotate: '45deg' }] }
                                            : undefined
                                    }
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Settings Header Content */}
                    <View className="px-5">
                        <View className="flex-row items-center mb-2">
                            <View
                                className="w-12 h-12 rounded-2xl justify-center items-center mr-4"
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.15)',
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.1)',
                                }}>
                                <Icon name="cog" size={24} color="#fff" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white font-bold text-2xl">
                                    Settings
                                </Text>
                                <Text className="text-white/60 text-sm mt-0.5 font-medium">
                                    Manage your account preferences
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Quick Settings Info Bar */}
                    <View
                        className="mx-5 mt-4 bg-white/10 rounded-2xl p-4"
                        style={{
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.1)',
                        }}>
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1 items-center">
                                <View className="w-8 h-8 bg-green-400/20 rounded-lg justify-center items-center mb-1.5">
                                    <Icon
                                        name="shield-check"
                                        size={14}
                                        color="#4ade80"
                                    />
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
                                    <Icon
                                        name="bell-outline"
                                        size={14}
                                        color="#60a5fa"
                                    />
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
                                    <Icon
                                        name="email-outline"
                                        size={14}
                                        color="#a78bfa"
                                    />
                                </View>
                                <Text className="text-white/50 text-[10px] font-semibold uppercase">
                                    Email
                                </Text>
                                <Text className="text-white font-bold text-xs mt-0.5">
                                    {notifications.email ? 'On' : 'Off'}
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
                        style={{
                            elevation: 4,
                            borderWidth: 1,
                            borderColor: '#f3f4f6',
                        }}>
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

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── TAB CONTENT ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-6">
                    {activeTab === 'security' && renderSecurityTab()}
                    {activeTab === 'notifications' && renderNotificationsTab()}
                    {activeTab === 'privacy' && renderPrivacyTab()}
                </View>

                {/* Bottom Spacing */}
                <View className="h-8" />
            </ScrollView>
        </View>
    );
};

export default SettingsScreen;