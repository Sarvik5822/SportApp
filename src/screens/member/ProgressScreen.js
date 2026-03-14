import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    ActivityIndicator,
    Image,
    RefreshControl,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ProfileAvatar from '../../components/ProfileAvatar';
import DrawerMenuButton from '../../components/DrawerMenuButton';
import { currentUser } from '../../data/user';

const AVATAR_OPTIONS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
];

const ProfileScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [profileData, setProfileData] = useState(null);

    // Avatar modal
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState('');

    // Form states
    const [personalForm, setPersonalForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });
    const [healthForm, setHealthForm] = useState({
        height: '',
        weight: '',
        bloodType: '',
        allergies: '',
    });
    const [emergencyForm, setEmergencyForm] = useState({
        name: '',
        phone: '',
        relationship: '',
    });

    // Fetch profile data (mock)
    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 600));
            const member = currentUser;
            setProfileData(member);
            if (member) {
                setPersonalForm({
                    name: member.name || '',
                    email: member.email || '',
                    phone: member.phone || '',
                    address: member.address || '',
                });
                setHealthForm({
                    height: member.healthInfo?.height || member.profile?.height?.replace(' cm', '') || '',
                    weight: member.healthInfo?.weight || member.profile?.weight?.replace(' kg', '') || '',
                    bloodType: member.healthInfo?.bloodType || member.profile?.bloodType || '',
                    allergies: member.healthInfo?.allergies || member.profile?.allergies || '',
                });
                setEmergencyForm({
                    name: member.emergencyContact?.name || '',
                    phone: member.emergencyContact?.phone || '',
                    relationship: member.emergencyContact?.relation || member.emergencyContact?.relationship || '',
                });
                setSelectedAvatar(member.profileImage || '');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchProfile();
        setRefreshing(false);
    };

    // Save handlers (mock)
    const handleSavePersonal = async () => {
        try {
            setSaving(true);
            await new Promise(resolve => setTimeout(resolve, 800));
            setProfileData(prev => ({ ...prev, ...personalForm }));
            Alert.alert('Success', 'Personal information updated successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveHealth = async () => {
        try {
            setSaving(true);
            await new Promise(resolve => setTimeout(resolve, 800));
            setProfileData(prev => ({
                ...prev,
                healthInfo: healthForm,
                profile: {
                    ...prev.profile,
                    height: `${healthForm.height} cm`,
                    weight: `${healthForm.weight} kg`,
                    bloodType: healthForm.bloodType,
                    allergies: healthForm.allergies,
                },
            }));
            Alert.alert('Success', 'Health information updated successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update health info');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEmergency = async () => {
        try {
            setSaving(true);
            await new Promise(resolve => setTimeout(resolve, 800));
            setProfileData(prev => ({
                ...prev,
                emergencyContact: {
                    name: emergencyForm.name,
                    relation: emergencyForm.relationship,
                    phone: emergencyForm.phone,
                },
            }));
            Alert.alert('Success', 'Emergency contact updated successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update emergency contact');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAvatar = async () => {
        try {
            setSaving(true);
            await new Promise(resolve => setTimeout(resolve, 600));
            setProfileData(prev => ({ ...prev, profileImage: selectedAvatar }));
            Alert.alert('Success', 'Avatar updated successfully!');
            setShowAvatarModal(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to update avatar');
        } finally {
            setSaving(false);
        }
    };

    // ─── Reusable Components ───

    const FormField = ({ label, icon, value, onChangeText, placeholder, keyboardType, editable = true }) => (
        <View className="mb-4">
            <Text className="text-gray-500 text-xs mb-1.5 ml-1">{label}</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-3">
                <View className="w-8 h-8 rounded-lg bg-primary/10 justify-center items-center mr-2">
                    <Icon name={icon} size={16} color="#1e3a8a" />
                </View>
                <TextInput
                    className="flex-1 py-3 text-gray-900 text-sm"
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#9ca3af"
                    keyboardType={keyboardType || 'default'}
                    editable={editable}
                />
            </View>
        </View>
    );

    const TabButton = ({ id, label, icon, isActive }) => (
        <TouchableOpacity
            onPress={() => setActiveTab(id)}
            activeOpacity={0.7}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl mx-1 ${isActive ? 'bg-emerald-500' : 'bg-white border border-gray-200'
                }`}
            style={!isActive ? { elevation: 1 } : {}}>
            <Icon name={icon} size={16} color={isActive ? '#fff' : '#6b7280'} />
            <Text
                className={`text-xs font-semibold ml-1.5 ${isActive ? 'text-white' : 'text-gray-600'
                    }`}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    // ─── Loading State ───
    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#059669" />
                <Text className="text-gray-500 mt-3">Loading profile...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1">
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#059669']}
                        />
                    }>
                    {/* ─── Header with Gradient ─── */}
                    <LinearGradient
                        colors={['#1e3a8a', '#3b82f6']}
                        className="px-6 pt-12 pb-16 rounded-b-[30px]">
                        <View className="flex-row justify-between items-center mb-6">
                            <View className="flex-row items-center">
                                <DrawerMenuButton />
                                <Text className="text-white font-bold text-xl ml-2">Profile</Text>
                            </View>
                            <TouchableOpacity
                                onPress={onRefresh}
                                disabled={refreshing}
                                className="w-10 h-10 bg-white/20 rounded-full justify-center items-center">
                                <Icon
                                    name="refresh"
                                    size={20}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Avatar & User Info */}
                        <View className="items-center">
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedAvatar(profileData?.profileImage || '');
                                    setShowAvatarModal(true);
                                }}
                                activeOpacity={0.8}>
                                <View className="relative">
                                    <ProfileAvatar
                                        name={profileData?.name || 'User'}
                                        image={profileData?.profileImage || undefined}
                                        size="xlarge"
                                    />
                                    <View className="absolute bottom-0 right-0 w-9 h-9 bg-emerald-500 rounded-full justify-center items-center border-3 border-white"
                                        style={{ borderWidth: 3, borderColor: '#fff' }}>
                                        <Icon name="camera" size={16} color="#fff" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <Text className="text-white font-bold text-2xl mt-4">
                                {profileData?.name || 'User'}
                            </Text>
                            <Text className="text-white/80 text-sm">
                                {profileData?.email || ''}
                            </Text>

                            <View className="flex-row mt-3">
                                <View className="bg-white/20 px-4 py-2 rounded-full mr-2">
                                    <Text className="text-white font-semibold text-xs">
                                        {profileData?.membership?.type || 'Member'}
                                    </Text>
                                </View>
                                <View className="bg-emerald-500 px-4 py-2 rounded-full">
                                    <Text className="text-white font-semibold text-xs">
                                        {profileData?.status === 'active' ? 'Active' : profileData?.status || 'Active'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* ─── Tab Navigation ─── */}
                    <View className="px-4 -mt-6">
                        <View
                            className="bg-white rounded-2xl p-2 flex-row"
                            style={{ elevation: 4 }}>
                            <TabButton id="personal" label="Personal" icon="account" isActive={activeTab === 'personal'} />
                            <TabButton id="health" label="Health" icon="heart-pulse" isActive={activeTab === 'health'} />
                            <TabButton id="emergency" label="Emergency" icon="phone" isActive={activeTab === 'emergency'} />
                            <TabButton id="documents" label="Docs" icon="file-document" isActive={activeTab === 'documents'} />
                        </View>
                    </View>

                    {/* ─── Tab Content ─── */}
                    <View className="px-4 mt-4">
                        {/* ═══ Personal Tab ═══ */}
                        {activeTab === 'personal' && (
                            <View
                                className="bg-white rounded-2xl p-5 mb-4"
                                style={{ elevation: 3 }}>
                                <View className="flex-row items-center mb-5">
                                    <View className="w-10 h-10 bg-blue-100 rounded-xl justify-center items-center">
                                        <Icon name="account-edit" size={22} color="#1e3a8a" />
                                    </View>
                                    <View className="ml-3">
                                        <Text className="text-gray-900 font-bold text-lg">
                                            Personal Information
                                        </Text>
                                        <Text className="text-gray-400 text-xs">
                                            Update your personal details
                                        </Text>
                                    </View>
                                </View>

                                <FormField
                                    label="Full Name"
                                    icon="account"
                                    value={personalForm.name}
                                    onChangeText={val => setPersonalForm(p => ({ ...p, name: val }))}
                                    placeholder="Enter your full name"
                                />
                                <FormField
                                    label="Email Address"
                                    icon="email"
                                    value={personalForm.email}
                                    onChangeText={val => setPersonalForm(p => ({ ...p, email: val }))}
                                    placeholder="Enter your email"
                                    keyboardType="email-address"
                                />
                                <FormField
                                    label="Phone Number"
                                    icon="phone"
                                    value={personalForm.phone}
                                    onChangeText={val => setPersonalForm(p => ({ ...p, phone: val }))}
                                    placeholder="Enter your phone number"
                                    keyboardType="phone-pad"
                                />
                                <FormField
                                    label="Address"
                                    icon="map-marker"
                                    value={personalForm.address}
                                    onChangeText={val => setPersonalForm(p => ({ ...p, address: val }))}
                                    placeholder="Enter your address"
                                />

                                {/* Branch Info */}
                                {profileData?.branch && (
                                    <View className="bg-blue-50 rounded-xl p-3 mb-4 flex-row items-center border border-blue-100">
                                        <Icon name="office-building" size={18} color="#1e3a8a" />
                                        <View className="ml-2">
                                            <Text className="text-gray-400 text-xs">Branch</Text>
                                            <Text className="text-gray-900 font-medium text-sm">
                                                {profileData.branch?.name || profileData.branch}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {/* Membership Info Card */}
                                <View className="bg-gradient rounded-xl overflow-hidden mb-4">
                                    <LinearGradient
                                        colors={['#059669', '#10b981']}
                                        className="p-4">
                                        <View className="flex-row items-center mb-2">
                                            <Icon name="card-membership" size={20} color="#fbbf24" />
                                            <Text className="text-white font-bold text-sm ml-2">
                                                Membership Details
                                            </Text>
                                        </View>
                                        <View className="flex-row justify-between">
                                            <View>
                                                <Text className="text-white/70 text-xs">Plan</Text>
                                                <Text className="text-white font-semibold">
                                                    {profileData?.membership?.type || 'N/A'}
                                                </Text>
                                            </View>
                                            <View>
                                                <Text className="text-white/70 text-xs">Expires</Text>
                                                <Text className="text-white font-semibold">
                                                    {profileData?.membership?.expiryDate
                                                        ? new Date(profileData.membership.expiryDate).toLocaleDateString()
                                                        : 'N/A'}
                                                </Text>
                                            </View>
                                            <View>
                                                <Text className="text-white/70 text-xs">Days Left</Text>
                                                <Text className="text-white font-semibold">
                                                    {profileData?.membership?.daysRemaining || 'N/A'}
                                                </Text>
                                            </View>
                                        </View>
                                    </LinearGradient>
                                </View>

                                <TouchableOpacity
                                    onPress={handleSavePersonal}
                                    disabled={saving}
                                    activeOpacity={0.8}>
                                    <LinearGradient
                                        colors={saving ? ['#9ca3af', '#9ca3af'] : ['#059669', '#10b981']}
                                        className="rounded-xl py-4 items-center flex-row justify-center">
                                        {saving ? (
                                            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                                        ) : (
                                            <Icon name="content-save" size={18} color="#fff" style={{ marginRight: 8 }} />
                                        )}
                                        <Text className="text-white font-bold">
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* ═══ Health Tab ═══ */}
                        {activeTab === 'health' && (
                            <View
                                className="bg-white rounded-2xl p-5 mb-4"
                                style={{ elevation: 3 }}>
                                <View className="flex-row items-center mb-5">
                                    <View className="w-10 h-10 bg-red-100 rounded-xl justify-center items-center">
                                        <Icon name="heart-pulse" size={22} color="#dc2626" />
                                    </View>
                                    <View className="ml-3">
                                        <Text className="text-gray-900 font-bold text-lg">
                                            Health Information
                                        </Text>
                                        <Text className="text-gray-400 text-xs">
                                            Keep your health details up to date
                                        </Text>
                                    </View>
                                </View>

                                <FormField
                                    label="Height (cm)"
                                    icon="human-male-height"
                                    value={healthForm.height}
                                    onChangeText={val => setHealthForm(p => ({ ...p, height: val }))}
                                    placeholder="e.g. 180"
                                    keyboardType="numeric"
                                />
                                <FormField
                                    label="Weight (kg)"
                                    icon="weight-kilogram"
                                    value={healthForm.weight}
                                    onChangeText={val => setHealthForm(p => ({ ...p, weight: val }))}
                                    placeholder="e.g. 75"
                                    keyboardType="numeric"
                                />
                                <FormField
                                    label="Blood Type"
                                    icon="water"
                                    value={healthForm.bloodType}
                                    onChangeText={val => setHealthForm(p => ({ ...p, bloodType: val }))}
                                    placeholder="e.g. O+"
                                />
                                <FormField
                                    label="Allergies"
                                    icon="alert-circle"
                                    value={healthForm.allergies}
                                    onChangeText={val => setHealthForm(p => ({ ...p, allergies: val }))}
                                    placeholder="e.g. None"
                                />

                                {/* Health Tips Card */}
                                <View className="bg-red-50 rounded-xl p-4 mb-4 border border-red-100">
                                    <View className="flex-row items-center mb-2">
                                        <Icon name="information" size={18} color="#dc2626" />
                                        <Text className="text-red-700 font-semibold text-sm ml-2">
                                            Health Tip
                                        </Text>
                                    </View>
                                    <Text className="text-red-600 text-xs leading-4">
                                        Keeping your health information updated helps our coaches provide
                                        better guidance and ensures your safety during training sessions.
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={handleSaveHealth}
                                    disabled={saving}
                                    activeOpacity={0.8}>
                                    <LinearGradient
                                        colors={saving ? ['#9ca3af', '#9ca3af'] : ['#059669', '#10b981']}
                                        className="rounded-xl py-4 items-center flex-row justify-center">
                                        {saving ? (
                                            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                                        ) : (
                                            <Icon name="content-save" size={18} color="#fff" style={{ marginRight: 8 }} />
                                        )}
                                        <Text className="text-white font-bold">
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* ═══ Emergency Tab ═══ */}
                        {activeTab === 'emergency' && (
                            <View
                                className="bg-white rounded-2xl p-5 mb-4"
                                style={{ elevation: 3 }}>
                                <View className="flex-row items-center mb-5">
                                    <View className="w-10 h-10 bg-orange-100 rounded-xl justify-center items-center">
                                        <Icon name="phone-alert" size={22} color="#ea580c" />
                                    </View>
                                    <View className="ml-3">
                                        <Text className="text-gray-900 font-bold text-lg">
                                            Emergency Contact
                                        </Text>
                                        <Text className="text-gray-400 text-xs">
                                            Who should we contact in an emergency?
                                        </Text>
                                    </View>
                                </View>

                                <FormField
                                    label="Contact Name"
                                    icon="account"
                                    value={emergencyForm.name}
                                    onChangeText={val => setEmergencyForm(p => ({ ...p, name: val }))}
                                    placeholder="e.g. Jane Doe"
                                />
                                <FormField
                                    label="Contact Phone"
                                    icon="phone"
                                    value={emergencyForm.phone}
                                    onChangeText={val => setEmergencyForm(p => ({ ...p, phone: val }))}
                                    placeholder="e.g. +1234567890"
                                    keyboardType="phone-pad"
                                />
                                <FormField
                                    label="Relationship"
                                    icon="account-switch"
                                    value={emergencyForm.relationship}
                                    onChangeText={val => setEmergencyForm(p => ({ ...p, relationship: val }))}
                                    placeholder="e.g. Spouse, Parent, Sibling"
                                />

                                {/* Emergency Info Card */}
                                <View className="bg-orange-50 rounded-xl p-4 mb-4 border border-orange-100">
                                    <View className="flex-row items-center mb-2">
                                        <Icon name="shield-alert" size={18} color="#ea580c" />
                                        <Text className="text-orange-700 font-semibold text-sm ml-2">
                                            Important
                                        </Text>
                                    </View>
                                    <Text className="text-orange-600 text-xs leading-4">
                                        Please ensure your emergency contact information is always current.
                                        This person will be contacted in case of any medical emergency during
                                        your training sessions.
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={handleSaveEmergency}
                                    disabled={saving}
                                    activeOpacity={0.8}>
                                    <LinearGradient
                                        colors={saving ? ['#9ca3af', '#9ca3af'] : ['#059669', '#10b981']}
                                        className="rounded-xl py-4 items-center flex-row justify-center">
                                        {saving ? (
                                            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                                        ) : (
                                            <Icon name="content-save" size={18} color="#fff" style={{ marginRight: 8 }} />
                                        )}
                                        <Text className="text-white font-bold">
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* ═══ Documents Tab ═══ */}
                        {activeTab === 'documents' && (
                            <View
                                className="bg-white rounded-2xl p-5 mb-4"
                                style={{ elevation: 3 }}>
                                <View className="flex-row items-center mb-5">
                                    <View className="w-10 h-10 bg-purple-100 rounded-xl justify-center items-center">
                                        <Icon name="file-document-multiple" size={22} color="#7c3aed" />
                                    </View>
                                    <View className="ml-3">
                                        <Text className="text-gray-900 font-bold text-lg">
                                            Documents
                                        </Text>
                                        <Text className="text-gray-400 text-xs">
                                            Manage your health & safety documents
                                        </Text>
                                    </View>
                                </View>

                                {/* Upload Area */}
                                <View className="border-2 border-dashed border-purple-200 rounded-2xl p-8 items-center bg-purple-50/50">
                                    <View className="w-16 h-16 bg-purple-100 rounded-full justify-center items-center mb-4">
                                        <Icon name="file-upload" size={32} color="#7c3aed" />
                                    </View>
                                    <Text className="text-gray-900 font-semibold text-base mb-1">
                                        Upload Documents
                                    </Text>
                                    <Text className="text-gray-400 text-xs text-center mb-4 px-4">
                                        Upload medical certificates, waivers, or other important documents
                                    </Text>
                                    <Text className="text-gray-400 text-xs text-center mb-5">
                                        Go to <Text className="font-bold text-purple-600">Health & Safety</Text> page
                                        to manage your health documents
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('HealthSafety')}
                                        activeOpacity={0.8}>
                                        <LinearGradient
                                            colors={['#7c3aed', '#a78bfa']}
                                            className="rounded-xl px-6 py-3 flex-row items-center">
                                            <Icon name="shield-plus" size={18} color="#fff" />
                                            <Text className="text-white font-bold ml-2">
                                                Go to Health & Safety
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>

                                {/* Document List Placeholder */}
                                <View className="mt-4">
                                    <Text className="text-gray-500 text-xs font-semibold mb-3 ml-1">
                                        RECENT DOCUMENTS
                                    </Text>
                                    {[
                                        { name: 'Medical Certificate', date: '2025-12-01', icon: 'file-certificate', status: 'verified' },
                                        { name: 'Liability Waiver', date: '2025-01-15', icon: 'file-sign', status: 'verified' },
                                        { name: 'Fitness Assessment', date: '2025-11-20', icon: 'clipboard-pulse', status: 'pending' },
                                    ].map((doc, index) => (
                                        <View
                                            key={index}
                                            className="flex-row items-center p-3 bg-gray-50 rounded-xl mb-2 border border-gray-100">
                                            <View className="w-10 h-10 bg-purple-100 rounded-lg justify-center items-center">
                                                <Icon name={doc.icon} size={20} color="#7c3aed" />
                                            </View>
                                            <View className="flex-1 ml-3">
                                                <Text className="text-gray-900 font-medium text-sm">
                                                    {doc.name}
                                                </Text>
                                                <Text className="text-gray-400 text-xs mt-0.5">
                                                    Uploaded: {new Date(doc.date).toLocaleDateString()}
                                                </Text>
                                            </View>
                                            <View
                                                className={`px-2.5 py-1 rounded-full ${doc.status === 'verified'
                                                        ? 'bg-emerald-100'
                                                        : 'bg-yellow-100'
                                                    }`}>
                                                <Text
                                                    className={`text-xs font-semibold capitalize ${doc.status === 'verified'
                                                            ? 'text-emerald-700'
                                                            : 'text-yellow-700'
                                                        }`}>
                                                    {doc.status}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* ─── Logout Button ─── */}
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
                                                navigation.getParent()?.getParent()?.reset({
                                                    index: 0,
                                                    routes: [{ name: 'Login' }],
                                                });
                                            },
                                        },
                                    ],
                                );
                            }}
                            activeOpacity={0.8}
                            className="bg-red-500 rounded-xl p-4 mb-8 items-center flex-row justify-center"
                            style={{ elevation: 2 }}>
                            <Icon name="logout" size={20} color="#fff" />
                            <Text className="text-white font-bold text-base ml-2">Logout</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Spacing */}
                    <View className="h-4" />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── CHANGE AVATAR MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showAvatarModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAvatarModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
                        {/* Modal Header */}
                        <View className="flex-row justify-between items-center mb-2">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-blue-100 rounded-full justify-center items-center">
                                    <Icon name="camera" size={22} color="#1e3a8a" />
                                </View>
                                <View className="ml-3">
                                    <Text className="text-gray-900 font-bold text-lg">
                                        Change Avatar
                                    </Text>
                                    <Text className="text-gray-400 text-xs">
                                        Select a new avatar for your profile
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setShowAvatarModal(false)}>
                                <Icon name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="mt-4">
                            {/* Current Avatar Preview */}
                            <View className="items-center mb-6">
                                <View className="relative">
                                    <ProfileAvatar
                                        name={profileData?.name || 'User'}
                                        image={selectedAvatar || undefined}
                                        size="xlarge"
                                    />
                                    {selectedAvatar ? (
                                        <View className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5"
                                            style={{ borderWidth: 2, borderColor: '#fff' }}>
                                            <Icon name="check" size={14} color="#fff" />
                                        </View>
                                    ) : null}
                                </View>
                                <Text className="text-gray-500 text-xs mt-2">
                                    {selectedAvatar ? 'Preview' : 'Current avatar (initials)'}
                                </Text>
                            </View>

                            {/* Avatar Grid */}
                            <Text className="text-gray-900 font-semibold text-sm mb-3">
                                Choose an Avatar
                            </Text>
                            <View className="flex-row flex-wrap">
                                {AVATAR_OPTIONS.map((avatar, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => setSelectedAvatar(avatar)}
                                        activeOpacity={0.7}
                                        className="w-1/4 p-1.5">
                                        <View
                                            className={`rounded-xl p-2 border-2 ${selectedAvatar === avatar
                                                    ? 'border-emerald-500 bg-emerald-50'
                                                    : 'border-gray-200 bg-white'
                                                }`}
                                            style={{ elevation: selectedAvatar === avatar ? 3 : 1 }}>
                                            <View className="w-full aspect-square rounded-lg bg-gray-100 justify-center items-center overflow-hidden">
                                                <ProfileAvatar
                                                    name={`Avatar ${index + 1}`}
                                                    image={avatar}
                                                    size="large"
                                                />
                                            </View>
                                            {selectedAvatar === avatar && (
                                                <View className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1"
                                                    style={{ borderWidth: 2, borderColor: '#fff' }}>
                                                    <Icon name="check" size={10} color="#fff" />
                                                </View>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Remove Avatar Option */}
                            <TouchableOpacity
                                onPress={() => setSelectedAvatar('')}
                                activeOpacity={0.7}
                                className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200 flex-row items-center justify-center">
                                <Icon name="account-circle" size={20} color="#6b7280" />
                                <Text className="text-gray-600 font-medium text-sm ml-2">
                                    Use Initials (Remove Avatar)
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>

                        {/* Footer Buttons */}
                        <View className="flex-row gap-3 mt-4">
                            <TouchableOpacity
                                onPress={() => setShowAvatarModal(false)}
                                className="flex-1 border border-gray-300 rounded-xl py-4 items-center">
                                <Text className="text-gray-700 font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSaveAvatar}
                                disabled={saving}
                                activeOpacity={0.8}
                                className="flex-1">
                                <LinearGradient
                                    colors={saving ? ['#9ca3af', '#9ca3af'] : ['#059669', '#10b981']}
                                    className="rounded-xl py-4 items-center flex-row justify-center">
                                    {saving ? (
                                        <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                                    ) : (
                                        <Icon name="check" size={18} color="#fff" style={{ marginRight: 8 }} />
                                    )}
                                    <Text className="text-white font-bold">
                                        {saving ? 'Saving...' : 'Save Avatar'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ProfileScreen;