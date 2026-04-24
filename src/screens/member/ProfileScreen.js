import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ProfileAvatar from '../../components/ProfileAvatar';
import { currentUser } from '../../data/user';

// ─── Helper Functions ───
const formatDate = dateStr => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
};

// ═══════════════════════════════════════════════
// ─── REUSABLE COMPONENTS ───
// ═══════════════════════════════════════════════
const InfoRow = ({ icon, label, value, iconColor = '#1e3a8a', gradient }) => (
    <View className="flex-row items-center py-3.5 border-b border-gray-50">
        <LinearGradient
            colors={gradient || [`${iconColor}20`, `${iconColor}10`]}
            className="w-11 h-11 rounded-xl justify-center items-center"
            style={{ borderRadius: 12 }}>
            <Icon name={icon} size={20} color={iconColor} />
        </LinearGradient>
        <View className="flex-1 ml-3.5">
            <Text className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider">
                {label}
            </Text>
            <Text className="text-gray-800 font-bold text-sm mt-0.5">
                {value || 'Not provided'}
            </Text>
        </View>
    </View>
);

const SectionTitle = ({ title, icon, iconColor = '#1e3a8a', rightElement }) => (
    <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
            <View
                className="w-8 h-8 rounded-lg justify-center items-center mr-2.5"
                style={{ backgroundColor: `${iconColor}12` }}>
                <Icon name={icon} size={16} color={iconColor} />
            </View>
            <Text className="text-gray-900 font-bold text-lg">{title}</Text>
        </View>
        {rightElement}
    </View>
);

const Section = ({ title, icon, children, rightElement, iconColor = '#1e3a8a' }) => (
    <View
        className="bg-white rounded-2xl p-5 mb-4 shadow-md"
        style={{ elevation: 3 }}>
        <SectionTitle
            title={title}
            icon={icon}
            iconColor={iconColor}
            rightElement={rightElement}
        />
        {children}
    </View>
);

const EditField = ({
    label,
    value,
    onChangeText,
    placeholder,
    multiline,
    numberOfLines,
    keyboardType,
    disabled,
    disabledValue,
}) => (
    <View className="mb-4">
        <Text className="text-gray-400 text-[11px] mb-2 font-bold uppercase tracking-wider">
            {label}
        </Text>
        {disabled ? (
            <View className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5">
                <Text className="text-gray-400 text-sm font-medium">{disabledValue}</Text>
            </View>
        ) : (
            <TextInput
                value={value}
                onChangeText={onChangeText}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 text-sm font-medium"
                placeholder={placeholder}
                placeholderTextColor="#d1d5db"
                multiline={multiline}
                numberOfLines={numberOfLines}
                textAlignVertical={multiline ? 'top' : 'center'}
                keyboardType={keyboardType}
                style={multiline ? { minHeight: 100 } : undefined}
            />
        )}
    </View>
);

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
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════
const ProfileScreen = ({ navigation }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        age: currentUser.profile?.age?.toString() || '',
        gender: currentUser.profile?.gender || '',
        height: currentUser.profile?.height || '',
        weight: currentUser.profile?.weight || '',
        bloodType: currentUser.profile?.bloodType || '',
        allergies: currentUser.profile?.allergies || '',
        conditions: currentUser.profile?.conditions || '',
        emergencyName: currentUser.emergencyContact?.name || '',
        emergencyRelation: currentUser.emergencyContact?.relation || '',
        emergencyPhone: currentUser.emergencyContact?.phone || '',
    });

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 600);
        return () => clearTimeout(timer);
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setRefreshing(false);
    }, []);

    const handleSave = () => {
        Alert.alert('Success', 'Profile updated successfully!', [
            { text: 'OK' },
        ]);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            name: currentUser.name || '',
            phone: currentUser.phone || '',
            age: currentUser.profile?.age?.toString() || '',
            gender: currentUser.profile?.gender || '',
            height: currentUser.profile?.height || '',
            weight: currentUser.profile?.weight || '',
            bloodType: currentUser.profile?.bloodType || '',
            allergies: currentUser.profile?.allergies || '',
            conditions: currentUser.profile?.conditions || '',
            emergencyName: currentUser.emergencyContact?.name || '',
            emergencyRelation: currentUser.emergencyContact?.relation || '',
            emergencyPhone: currentUser.emergencyContact?.phone || '',
        });
        setIsEditing(false);
    };

    // ─── Edit Button Component ───
    const EditButton = ({ color = '#3b82f6' }) =>
        !isEditing ? (
            <TouchableOpacity
                onPress={() => setIsEditing(true)}
                className="w-8 h-8 rounded-lg justify-center items-center"
                style={{ backgroundColor: `${color}12` }}>
                <Icon name="pencil" size={16} color={color} />
            </TouchableOpacity>
        ) : null;

    // ═══════════════════════════════════════════════
    // ─── TAB RENDERERS ───
    // ═══════════════════════════════════════════════
    const renderPersonalTab = () => (
        <Section
            title="Personal Information"
            icon="account"
            iconColor="#3b82f6"
            rightElement={<EditButton color="#3b82f6" />}>
            {isEditing ? (
                <>
                    <EditField
                        label="Full Name"
                        value={formData.name}
                        onChangeText={text =>
                            setFormData({ ...formData, name: text })
                        }
                        placeholder="Enter your name"
                    />
                    <EditField
                        label="Email Address"
                        disabled
                        disabledValue={currentUser.email}
                    />
                    <EditField
                        label="Phone Number"
                        value={formData.phone}
                        onChangeText={text =>
                            setFormData({ ...formData, phone: text })
                        }
                        placeholder="Enter phone number"
                        keyboardType="phone-pad"
                    />
                    <View className="flex-row" style={{ gap: 10 }}>
                        <View className="flex-1">
                            <EditField
                                label="Age"
                                value={formData.age}
                                onChangeText={text =>
                                    setFormData({ ...formData, age: text })
                                }
                                placeholder="Age"
                                keyboardType="numeric"
                            />
                        </View>
                        <View className="flex-1">
                            <EditField
                                label="Gender"
                                value={formData.gender}
                                onChangeText={text =>
                                    setFormData({ ...formData, gender: text })
                                }
                                placeholder="Gender"
                            />
                        </View>
                    </View>
                </>
            ) : (
                <>
                    <InfoRow
                        icon="account"
                        label="Full Name"
                        value={formData.name}
                        iconColor="#3b82f6"
                        gradient={['#dbeafe', '#eff6ff']}
                    />
                    <InfoRow
                        icon="email"
                        label="Email"
                        value={currentUser.email}
                        iconColor="#8b5cf6"
                        gradient={['#ede9fe', '#f5f3ff']}
                    />
                    <InfoRow
                        icon="phone"
                        label="Phone"
                        value={formData.phone}
                        iconColor="#22c55e"
                        gradient={['#dcfce7', '#f0fdf4']}
                    />
                    <InfoRow
                        icon="calendar"
                        label="Age"
                        value={`${formData.age} years`}
                        iconColor="#f59e0b"
                        gradient={['#fef3c7', '#fffbeb']}
                    />
                    <InfoRow
                        icon="gender-male-female"
                        label="Gender"
                        value={formData.gender}
                        iconColor="#ec4899"
                        gradient={['#fce7f3', '#fdf2f8']}
                    />
                </>
            )}
        </Section>
    );

    const renderPhysicalTab = () => (
        <Section
            title="Physical Information"
            icon="ruler"
            iconColor="#22c55e"
            rightElement={<EditButton color="#22c55e" />}>
            {isEditing ? (
                <View className="flex-row flex-wrap" style={{ gap: 10 }}>
                    <View style={{ flex: 1, minWidth: '45%' }}>
                        <EditField
                            label="Height"
                            value={formData.height}
                            onChangeText={text =>
                                setFormData({ ...formData, height: text })
                            }
                            placeholder="e.g., 175 cm"
                        />
                    </View>
                    <View style={{ flex: 1, minWidth: '45%' }}>
                        <EditField
                            label="Weight"
                            value={formData.weight}
                            onChangeText={text =>
                                setFormData({ ...formData, weight: text })
                            }
                            placeholder="e.g., 70 kg"
                        />
                    </View>
                    <View style={{ flex: 1, minWidth: '45%' }}>
                        <EditField
                            label="Blood Type"
                            value={formData.bloodType}
                            onChangeText={text =>
                                setFormData({ ...formData, bloodType: text })
                            }
                            placeholder="e.g., O+"
                        />
                    </View>
                </View>
            ) : (
                <>
                    {/* Visual Physical Stats */}
                    <View className="flex-row mb-5" style={{ gap: 10 }}>
                        <View className="flex-1 bg-blue-50 rounded-2xl p-4 items-center">
                            <View className="w-10 h-10 bg-blue-100 rounded-xl justify-center items-center mb-2">
                                <Icon name="human-male-height" size={20} color="#3b82f6" />
                            </View>
                            <Text className="text-blue-900 font-bold text-2xl">
                                {formData.height?.replace(/[^\d.]/g, '') || '—'}
                            </Text>
                            <Text className="text-blue-500 text-[11px] mt-1 font-semibold">
                                Height (cm)
                            </Text>
                        </View>
                        <View className="flex-1 bg-green-50 rounded-2xl p-4 items-center">
                            <View className="w-10 h-10 bg-green-100 rounded-xl justify-center items-center mb-2">
                                <Icon name="weight-kilogram" size={20} color="#22c55e" />
                            </View>
                            <Text className="text-green-900 font-bold text-2xl">
                                {formData.weight?.replace(/[^\d.]/g, '') || '—'}
                            </Text>
                            <Text className="text-green-500 text-[11px] mt-1 font-semibold">
                                Weight (kg)
                            </Text>
                        </View>
                    </View>

                    <InfoRow
                        icon="human-male-height"
                        label="Height"
                        value={formData.height}
                        iconColor="#22c55e"
                        gradient={['#dcfce7', '#f0fdf4']}
                    />
                    <InfoRow
                        icon="weight-kilogram"
                        label="Weight"
                        value={formData.weight}
                        iconColor="#3b82f6"
                        gradient={['#dbeafe', '#eff6ff']}
                    />
                    <InfoRow
                        icon="water"
                        label="Blood Type"
                        value={formData.bloodType}
                        iconColor="#ef4444"
                        gradient={['#fee2e2', '#fef2f2']}
                    />
                </>
            )}
        </Section>
    );

    const renderHealthTab = () => (
        <Section
            title="Health Information"
            icon="heart-pulse"
            iconColor="#ef4444"
            rightElement={<EditButton color="#ef4444" />}>
            {isEditing ? (
                <>
                    <EditField
                        label="Allergies"
                        value={formData.allergies}
                        onChangeText={text =>
                            setFormData({ ...formData, allergies: text })
                        }
                        placeholder="List any allergies (comma separated)"
                        multiline
                        numberOfLines={2}
                    />
                    <EditField
                        label="Medical Conditions"
                        value={formData.conditions}
                        onChangeText={text =>
                            setFormData({ ...formData, conditions: text })
                        }
                        placeholder="List any medical conditions (comma separated)"
                        multiline
                        numberOfLines={2}
                    />
                </>
            ) : (
                <>
                    {/* Allergies Card */}
                    <View className="mb-5">
                        <Text className="text-gray-400 text-[11px] mb-2 font-bold uppercase tracking-wider">
                            Allergies
                        </Text>
                        {formData.allergies && formData.allergies !== 'None' ? (
                            <View className="bg-red-50 rounded-xl p-4" style={{ borderLeftWidth: 3, borderLeftColor: '#ef4444' }}>
                                <View className="flex-row items-start">
                                    <View className="w-8 h-8 bg-red-100 rounded-lg justify-center items-center mr-3 mt-0.5">
                                        <Icon name="alert-circle" size={16} color="#ef4444" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-red-800 font-bold text-sm mb-1">Allergy Alert</Text>
                                        <Text className="text-gray-700 text-sm leading-5 font-medium">
                                            {formData.allergies}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View className="bg-green-50 rounded-xl p-4" style={{ borderLeftWidth: 3, borderLeftColor: '#22c55e' }}>
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 bg-green-100 rounded-lg justify-center items-center mr-3">
                                        <Icon name="check-circle" size={16} color="#22c55e" />
                                    </View>
                                    <Text className="text-green-800 font-semibold text-sm">
                                        No allergies reported
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Medical Conditions Card */}
                    <View className="mb-2">
                        <Text className="text-gray-400 text-[11px] mb-2 font-bold uppercase tracking-wider">
                            Medical Conditions
                        </Text>
                        {formData.conditions && formData.conditions !== 'None' ? (
                            <View className="bg-orange-50 rounded-xl p-4" style={{ borderLeftWidth: 3, borderLeftColor: '#f59e0b' }}>
                                <View className="flex-row items-start">
                                    <View className="w-8 h-8 bg-orange-100 rounded-lg justify-center items-center mr-3 mt-0.5">
                                        <Icon name="medical-bag" size={16} color="#f59e0b" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-orange-800 font-bold text-sm mb-1">Medical Note</Text>
                                        <Text className="text-gray-700 text-sm leading-5 font-medium">
                                            {formData.conditions}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View className="bg-green-50 rounded-xl p-4" style={{ borderLeftWidth: 3, borderLeftColor: '#22c55e' }}>
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 bg-green-100 rounded-lg justify-center items-center mr-3">
                                        <Icon name="check-circle" size={16} color="#22c55e" />
                                    </View>
                                    <Text className="text-green-800 font-semibold text-sm">
                                        No medical conditions reported
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </>
            )}
        </Section>
    );

    const renderMoreTab = () => (
        <>
            {/* Emergency Contact */}
            <Section
                title="Emergency Contact"
                icon="contacts"
                iconColor="#dc2626"
                rightElement={<EditButton color="#dc2626" />}>
                {isEditing ? (
                    <>
                        <EditField
                            label="Contact Name"
                            value={formData.emergencyName}
                            onChangeText={text =>
                                setFormData({ ...formData, emergencyName: text })
                            }
                            placeholder="Enter contact name"
                        />
                        <EditField
                            label="Relationship"
                            value={formData.emergencyRelation}
                            onChangeText={text =>
                                setFormData({
                                    ...formData,
                                    emergencyRelation: text,
                                })
                            }
                            placeholder="e.g., Spouse, Parent, Sibling"
                        />
                        <EditField
                            label="Contact Phone"
                            value={formData.emergencyPhone}
                            onChangeText={text =>
                                setFormData({
                                    ...formData,
                                    emergencyPhone: text,
                                })
                            }
                            placeholder="Enter phone number"
                            keyboardType="phone-pad"
                        />
                    </>
                ) : (
                    <>
                        <InfoRow
                            icon="account-heart"
                            label="Contact Name"
                            value={formData.emergencyName}
                            iconColor="#dc2626"
                            gradient={['#fee2e2', '#fef2f2']}
                        />
                        <InfoRow
                            icon="heart"
                            label="Relationship"
                            value={formData.emergencyRelation}
                            iconColor="#f59e0b"
                            gradient={['#fef3c7', '#fffbeb']}
                        />
                        <InfoRow
                            icon="phone-alert"
                            label="Contact Phone"
                            value={formData.emergencyPhone}
                            iconColor="#22c55e"
                            gradient={['#dcfce7', '#f0fdf4']}
                        />
                    </>
                )}
            </Section>

            {/* Membership Details */}
            <Section
                title="Membership Details"
                icon="card-membership"
                iconColor="#8b5cf6">
                {/* Membership Plan Highlight */}
                <View className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 mb-4" style={{ borderLeftWidth: 3, borderLeftColor: '#8b5cf6' }}>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                            <Text className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider">
                                Current Plan
                            </Text>
                            <View className="flex-row items-center mt-1">
                                <Icon name="crown" size={18} color="#f59e0b" />
                                <Text className="text-gray-900 font-bold text-lg ml-1.5">
                                    {currentUser.membership?.type || 'N/A'}
                                </Text>
                            </View>
                        </View>
                        <View className="bg-emerald-100 px-3.5 py-1.5 rounded-full flex-row items-center">
                            <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                            <Text className="text-emerald-700 text-xs font-bold">Active</Text>
                        </View>
                    </View>
                </View>

                <InfoRow
                    icon="calendar-check"
                    label="Start Date"
                    value={currentUser.membership?.startDate || 'N/A'}
                    iconColor="#22c55e"
                    gradient={['#dcfce7', '#f0fdf4']}
                />
                <InfoRow
                    icon="calendar-remove"
                    label="Expiry Date"
                    value={currentUser.membership?.expiryDate || 'N/A'}
                    iconColor="#ef4444"
                    gradient={['#fee2e2', '#fef2f2']}
                />

                {/* Days Remaining with Progress */}
                <View className="flex-row items-center py-3.5">
                    <LinearGradient
                        colors={['#3b82f620', '#3b82f610']}
                        className="w-11 h-11 rounded-xl justify-center items-center"
                        style={{ borderRadius: 12 }}>
                        <Icon name="clock" size={20} color="#3b82f6" />
                    </LinearGradient>
                    <View className="flex-1 ml-3.5">
                        <Text className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider">
                            Days Remaining
                        </Text>
                        <Text className="text-gray-800 font-bold text-sm mt-0.5">
                            {currentUser.membership?.daysRemaining || 0} days
                        </Text>
                    </View>
                    <View className="w-24">
                        <View className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <LinearGradient
                                colors={['#1e3a8a', '#3b82f6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    height: '100%',
                                    width: `${Math.min(
                                        100,
                                        ((currentUser.membership?.daysRemaining || 0) / 365) * 100,
                                    )}%`,
                                    borderRadius: 999,
                                }}
                            />
                        </View>
                    </View>
                </View>
            </Section>
        </>
    );

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'personal':
                return renderPersonalTab();
            case 'physical':
                return renderPhysicalTab();
            case 'health':
                return renderHealthTab();
            case 'more':
                return renderMoreTab();
            default:
                return renderPersonalTab();
        }
    };

    // ═══════════════════════════════════════════════
    // ─── LOADING STATE ───
    // ═══════════════════════════════════════════════
    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <View className="w-16 h-16 rounded-2xl bg-blue-50 justify-center items-center mb-4">
                    <ActivityIndicator size="large" color="#1e3a8a" />
                </View>
                <Text className="text-gray-900 font-bold text-base">
                    Loading Profile
                </Text>
                <Text className="text-gray-400 mt-1 text-sm">
                    Fetching your information...
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
                        colors={['#1e3a8a']}
                        tintColor="#1e3a8a"
                    />
                }>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── HEADER WITH GRADIENT ─── */}
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
                    <View className="flex-row justify-between items-center px-5 mb-6">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="w-10 h-10 bg-white/15 rounded-full justify-center items-center"
                            style={{
                                borderWidth: 1,
                                borderColor: 'rgba(255,255,255,0.1)',
                            }}>
                            <Icon name="arrow-left" size={20} color="#fff" />
                        </TouchableOpacity>
                        <Text className="text-white font-bold text-lg">
                            My Profile
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                if (isEditing) {
                                    handleSave();
                                } else {
                                    setIsEditing(true);
                                }
                            }}
                            className="w-10 h-10 bg-white/15 rounded-full justify-center items-center"
                            style={{
                                borderWidth: 1,
                                borderColor: 'rgba(255,255,255,0.1)',
                            }}>
                            <Icon
                                name={isEditing ? 'content-save' : 'pencil'}
                                size={20}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Profile Info */}
                    <View className="items-center px-5">
                        <View
                            style={{
                                borderWidth: 3,
                                borderColor: 'rgba(255,255,255,0.25)',
                                borderRadius: 70,
                                padding: 3,
                            }}>
                            <ProfileAvatar
                                name={currentUser.name}
                                size="xlarge"
                            />
                        </View>

                        <Text className="text-white font-bold text-2xl mt-4">
                            {currentUser.name}
                        </Text>
                        <View className="flex-row items-center mt-1">
                            <Icon name="shield-star" size={14} color="#fbbf24" />
                            <Text className="text-white/70 text-sm ml-1.5 font-medium">
                                {getGreeting()} 👋
                            </Text>
                        </View>

                        {/* Membership & Status Badges */}
                        <View className="flex-row mt-3" style={{ gap: 8 }}>
                            <LinearGradient
                                colors={['#f59e0b', '#fbbf24']}
                                className="px-4 py-2 rounded-xl flex-row items-center"
                                style={{ borderRadius: 12 }}>
                                <Icon name="crown" size={14} color="#78350f" />
                                <Text className="text-yellow-900 font-bold text-xs ml-1.5">
                                    {currentUser.membership?.type || 'Member'}
                                </Text>
                            </LinearGradient>
                            <View
                                className="bg-emerald-400/20 px-4 py-2 rounded-xl flex-row items-center"
                                style={{
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.1)',
                                }}>
                                <View className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5" />
                                <Text className="text-emerald-300 font-bold text-xs">
                                    Active
                                </Text>
                            </View>
                        </View>

                        {/* Days Remaining Pill */}
                        {currentUser.membership?.daysRemaining !== undefined && (
                            <View
                                className="mt-3 bg-white/10 px-4 py-2 rounded-xl flex-row items-center"
                                style={{
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.1)',
                                }}>
                                <Icon
                                    name="calendar-clock"
                                    size={14}
                                    color="#60a5fa"
                                />
                                <Text className="text-white/80 text-xs ml-1.5 font-medium">
                                    {currentUser.membership.daysRemaining} days
                                    remaining
                                </Text>
                            </View>
                        )}
                    </View>
                </LinearGradient>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── QUICK INFO CARDS ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 -mt-6">
                    <View
                        className="bg-white rounded-2xl p-4 shadow-lg flex-row"
                        style={{ elevation: 5 }}>
                        <View className="flex-1 items-center border-r border-gray-100">
                            <View className="w-8 h-8 bg-purple-50 rounded-lg justify-center items-center mb-1.5">
                                <Icon
                                    name="email-outline"
                                    size={14}
                                    color="#8b5cf6"
                                />
                            </View>
                            <Text className="text-gray-400 text-[10px] font-semibold uppercase">
                                Email
                            </Text>
                            <Text
                                className="text-gray-800 font-bold text-[11px] mt-0.5"
                                numberOfLines={1}>
                                {currentUser.email}
                            </Text>
                        </View>
                        <View className="flex-1 items-center border-r border-gray-100">
                            <View className="w-8 h-8 bg-green-50 rounded-lg justify-center items-center mb-1.5">
                                <Icon
                                    name="phone-outline"
                                    size={14}
                                    color="#22c55e"
                                />
                            </View>
                            <Text className="text-gray-400 text-[10px] font-semibold uppercase">
                                Phone
                            </Text>
                            <Text className="text-gray-800 font-bold text-[11px] mt-0.5">
                                {currentUser.phone || 'N/A'}
                            </Text>
                        </View>
                        <View className="flex-1 items-center">
                            <View className="w-8 h-8 bg-blue-50 rounded-lg justify-center items-center mb-1.5">
                                <Icon
                                    name="card-account-details-outline"
                                    size={14}
                                    color="#3b82f6"
                                />
                            </View>
                            <Text className="text-gray-400 text-[10px] font-semibold uppercase">
                                Plan
                            </Text>
                            <Text className="text-gray-800 font-bold text-[11px] mt-0.5">
                                {currentUser.membership?.type || 'N/A'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── TAB NAVIGATION ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-6">
                    <View
                        className="bg-gray-100 rounded-2xl p-1.5 flex-row"
                        style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                        <TabButton
                            label="Personal"
                            icon="account"
                            isActive={activeTab === 'personal'}
                            onPress={() => setActiveTab('personal')}
                        />
                        <TabButton
                            label="Physical"
                            icon="ruler"
                            isActive={activeTab === 'physical'}
                            onPress={() => setActiveTab('physical')}
                        />
                        <TabButton
                            label="Health"
                            icon="heart-pulse"
                            isActive={activeTab === 'health'}
                            onPress={() => setActiveTab('health')}
                        />
                        <TabButton
                            label="More"
                            icon="dots-horizontal"
                            isActive={activeTab === 'more'}
                            onPress={() => setActiveTab('more')}
                        />
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── TAB CONTENT ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-4">{renderActiveTab()}</View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── EDIT MODE ACTIONS ─── */}
                {/* ═══════════════════════════════════════════════ */}
                {isEditing && (
                    <View className="px-4 mb-4">
                        <View className="flex-row" style={{ gap: 10 }}>
                            <TouchableOpacity
                                onPress={handleCancel}
                                activeOpacity={0.7}
                                className="flex-1"
                                style={{
                                    borderWidth: 1.5,
                                    borderColor: '#e5e7eb',
                                    borderRadius: 14,
                                    paddingVertical: 14,
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                }}>
                                <Icon name="close" size={18} color="#6b7280" />
                                <Text className="text-gray-600 font-bold text-base ml-2">
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSave}
                                activeOpacity={0.7}
                                className="flex-1 overflow-hidden"
                                style={{ borderRadius: 14 }}>
                                <LinearGradient
                                    colors={['#1e3a8a', '#3b82f6']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{
                                        paddingVertical: 14,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 14,
                                    }}>
                                    <Icon name="content-save" size={18} color="#fff" />
                                    <Text className="text-white font-bold text-base ml-2">
                                        Save Changes
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── SETTINGS BUTTON ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mb-3">
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Settings')}
                        activeOpacity={0.8}
                        className="bg-white rounded-2xl p-4 flex-row items-center shadow-sm"
                        style={{
                            elevation: 2,
                            borderWidth: 1.5,
                            borderColor: '#f3f4f6',
                        }}>
                        <View className="w-10 h-10 rounded-xl bg-emerald-50 justify-center items-center mr-3">
                            <Icon name="cog" size={20} color="#059669" />
                        </View>
                        <Text className="text-gray-900 font-bold text-base flex-1">
                            Settings
                        </Text>
                        <Icon name="chevron-right" size={20} color="#d1d5db" />
                    </TouchableOpacity>
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── LOGOUT BUTTON ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mb-8">
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                'Logout',
                                'Are you sure you want to logout?',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                        text: 'Logout',
                                        style: 'destructive',
                                        onPress: () => {
                                            navigation
                                                .getParent()
                                                ?.getParent()
                                                ?.reset({
                                                    index: 0,
                                                    routes: [{ name: 'Login' }],
                                                });
                                        },
                                    },
                                ],
                            );
                        }}
                        activeOpacity={0.7}
                        style={{ borderRadius: 16, overflow: 'hidden' }}>
                        <LinearGradient
                            colors={['#ef4444', '#dc2626']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                paddingVertical: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 16,
                            }}>
                            <Icon name="logout" size={20} color="#fff" />
                            <Text className="text-white font-bold text-base ml-2">
                                Logout
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Bottom Spacing */}
                <View className="h-8" />
            </ScrollView>
        </View>
    );
};

export default ProfileScreen;