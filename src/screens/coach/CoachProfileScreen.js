import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ProfileAvatar from '../../components/ProfileAvatar';
import DrawerMenuButton from '../../components/DrawerMenuButton';
import { coachProfile } from '../../data/user';

// ─── Extended Coach Data (simulating full profile from API) ───
const EXTENDED_COACH_DATA = {
  ...coachProfile,
  address: '456 Sports Avenue, Mumbai, Maharashtra',
  bio:
    coachProfile.bio ||
    'Certified fitness trainer with 8 years of experience in strength training, HIIT, and sports conditioning. Passionate about helping athletes achieve their peak performance.',
  approvalStatus: 'approved',
  branch: { name: 'Downtown Fitness Hub' },
  additionalSkills: [
    'First Aid',
    'Sports Nutrition',
    'Mental Conditioning',
    'Injury Prevention',
  ],
  emergencyContact: {
    name: 'Sarah Williams',
    phone: '+91 98765 43210',
    relationship: 'Spouse',
  },
  createdAt: '2023-06-15',
  lastLogin: '2026-03-13',
  twoFactorEnabled: true,
  stats: {
    totalClients: 45,
    totalSessions: 320,
    activeSessions: 6,
  },
};

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Coach',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Trainer',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Instructor',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Guide',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Expert',
];

// ─── Helper Functions ───
const formatDate = dateStr => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// ─── Reusable Components ───
const InfoRow = ({ icon, label, value, iconColor = '#1e3a8a' }) => (
  <View className="flex-row items-center py-3 border-b border-gray-100">
    <View
      className="w-10 h-10 rounded-lg justify-center items-center"
      style={{ backgroundColor: `${iconColor}15` }}>
      <Icon name={icon} size={20} color={iconColor} />
    </View>
    <View className="flex-1 ml-3">
      <Text className="text-gray-400 text-xs">{label}</Text>
      <Text className="text-gray-800 font-medium text-sm">{value || 'Not provided'}</Text>
    </View>
  </View>
);

const Section = ({ title, icon, children, rightElement }) => (
  <View className="bg-white rounded-2xl p-4 mb-4 shadow-md" style={{ elevation: 3 }}>
    <View className="flex-row items-center justify-between mb-4">
      <View className="flex-row items-center">
        <View
          className="w-8 h-8 rounded-lg justify-center items-center"
          style={{ backgroundColor: '#1e3a8a15' }}>
          <Icon name={icon} size={18} color="#1e3a8a" />
        </View>
        <Text className="text-gray-900 font-bold text-lg ml-2">{title}</Text>
      </View>
      {rightElement}
    </View>
    {children}
  </View>
);

const BadgeComponent = ({ text, variant = 'default' }) => {
  const variants = {
    default: { bg: '#1e3a8a', textColor: '#ffffff' },
    secondary: { bg: '#e5e7eb', textColor: '#374151' },
    outline: { bg: 'transparent', textColor: '#1e3a8a', border: '#1e3a8a' },
    success: { bg: '#dcfce7', textColor: '#166534' },
    warning: { bg: '#fef3c7', textColor: '#92400e' },
    destructive: { bg: '#fee2e2', textColor: '#991b1b' },
  };
  const style = variants[variant] || variants.default;

  return (
    <View
      className="px-3 py-1.5 rounded-full mr-2 mb-2"
      style={{
        backgroundColor: style.bg,
        borderWidth: style.border ? 1 : 0,
        borderColor: style.border || 'transparent',
      }}>
      <Text className="text-xs font-semibold" style={{ color: style.textColor }}>
        {text}
      </Text>
    </View>
  );
};

const TabButton = ({ label, isActive, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className={`flex-1 py-3 items-center rounded-xl ${isActive ? '' : ''}`}
    style={{
      backgroundColor: isActive ? '#1e3a8a' : 'transparent',
    }}>
    <Text
      className="text-xs font-bold"
      style={{ color: isActive ? '#ffffff' : '#6b7280' }}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ═══════════════════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════
const CoachProfileScreen = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [refreshing, setRefreshing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [currentAvatar, setCurrentAvatar] = useState('');

  const [formData, setFormData] = useState({
    name: EXTENDED_COACH_DATA.name || '',
    phone: EXTENDED_COACH_DATA.phone || '',
    bio: EXTENDED_COACH_DATA.bio || '',
    address: EXTENDED_COACH_DATA.address || '',
    specializations: EXTENDED_COACH_DATA.specialization
      ? [EXTENDED_COACH_DATA.specialization]
      : [],
    additionalSkills: EXTENDED_COACH_DATA.additionalSkills || [],
    certifications: EXTENDED_COACH_DATA.certifications || [],
    emergencyContact: EXTENDED_COACH_DATA.emergencyContact || {
      name: '',
      phone: '',
      relationship: '',
    },
  });

  const coachData = EXTENDED_COACH_DATA;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setRefreshing(false);
  }, []);

  const handleSave = () => {
    Alert.alert('Success', 'Profile updated successfully!', [{ text: 'OK' }]);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data to original
    setFormData({
      name: EXTENDED_COACH_DATA.name || '',
      phone: EXTENDED_COACH_DATA.phone || '',
      bio: EXTENDED_COACH_DATA.bio || '',
      address: EXTENDED_COACH_DATA.address || '',
      specializations: EXTENDED_COACH_DATA.specialization
        ? [EXTENDED_COACH_DATA.specialization]
        : [],
      additionalSkills: EXTENDED_COACH_DATA.additionalSkills || [],
      certifications: EXTENDED_COACH_DATA.certifications || [],
      emergencyContact: EXTENDED_COACH_DATA.emergencyContact || {
        name: '',
        phone: '',
        relationship: '',
      },
    });
    setIsEditing(false);
  };

  const confirmAvatarChange = () => {
    if (selectedAvatar) {
      setCurrentAvatar(selectedAvatar);
      Alert.alert('Success', 'Avatar updated successfully!');
    }
    setShowAvatarModal(false);
  };

  const getApprovalBadgeVariant = status => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'destructive';
    }
  };

  // ─── Tab Content Renderers ───
  const renderPersonalTab = () => (
    <Section title="Personal Information" icon="account">
      <View className="space-y-1">
        {isEditing ? (
          <>
            <View className="mb-4">
              <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
                Full Name
              </Text>
              <TextInput
                value={formData.name}
                onChangeText={text =>
                  setFormData({ ...formData, name: text })
                }
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm"
                placeholder="Enter your name"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View className="mb-4">
              <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
                Email Address
              </Text>
              <View className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3">
                <Text className="text-gray-400 text-sm">
                  {coachData.email}
                </Text>
              </View>
            </View>
            <View className="mb-4">
              <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
                Phone Number
              </Text>
              <TextInput
                value={formData.phone}
                onChangeText={text =>
                  setFormData({ ...formData, phone: text })
                }
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm"
                placeholder="Enter phone number"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
              />
            </View>
            <View className="mb-4">
              <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
                Branch
              </Text>
              <View className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3">
                <Text className="text-gray-400 text-sm">
                  {coachData.branch?.name || 'Not assigned'}
                </Text>
              </View>
            </View>
            <View className="mb-2">
              <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
                Address
              </Text>
              <TextInput
                value={formData.address}
                onChangeText={text =>
                  setFormData({ ...formData, address: text })
                }
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm"
                placeholder="Enter your address"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </>
        ) : (
          <>
            <InfoRow icon="account" label="Full Name" value={formData.name} />
            <InfoRow icon="email" label="Email" value={coachData.email} />
            <InfoRow icon="phone" label="Phone" value={formData.phone} />
            <InfoRow
              icon="office-building"
              label="Branch"
              value={coachData.branch?.name || 'Not assigned'}
            />
            <InfoRow
              icon="map-marker"
              label="Address"
              value={formData.address}
            />
          </>
        )}
      </View>
    </Section>
  );

  const renderProfessionalTab = () => (
    <Section title="Professional Profile" icon="certificate">
      <View className="space-y-1">
        {isEditing ? (
          <>
            <View className="mb-4">
              <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
                Bio
              </Text>
              <TextInput
                value={formData.bio}
                onChangeText={text =>
                  setFormData({ ...formData, bio: text })
                }
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm"
                placeholder="Tell us about your experience..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={{ minHeight: 120 }}
              />
            </View>
            <View className="mb-4">
              <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
                Specializations (comma separated)
              </Text>
              <TextInput
                value={formData.specializations.join(', ')}
                onChangeText={text =>
                  setFormData({
                    ...formData,
                    specializations: text
                      .split(',')
                      .map(s => s.trim())
                      .filter(Boolean),
                  })
                }
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm"
                placeholder="e.g., Yoga, Pilates, Meditation"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View className="mb-4">
              <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
                Additional Skills (comma separated)
              </Text>
              <TextInput
                value={formData.additionalSkills.join(', ')}
                onChangeText={text =>
                  setFormData({
                    ...formData,
                    additionalSkills: text
                      .split(',')
                      .map(s => s.trim())
                      .filter(Boolean),
                  })
                }
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm"
                placeholder="e.g., First Aid, Nutrition"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </>
        ) : (
          <>
            {/* Bio */}
            <View className="mb-4">
              <Text className="text-gray-500 text-xs mb-1 font-semibold">
                Bio
              </Text>
              <Text className="text-gray-700 text-sm leading-5">
                {formData.bio || 'No bio added'}
              </Text>
            </View>

            {/* Specializations */}
            <View className="mb-4">
              <Text className="text-gray-500 text-xs mb-2 font-semibold">
                Specializations
              </Text>
              <View className="flex-row flex-wrap">
                {formData.specializations.length > 0 ? (
                  formData.specializations.map((spec, index) => (
                    <BadgeComponent key={index} text={spec} variant="default" />
                  ))
                ) : (
                  <Text className="text-gray-400 text-sm">
                    No specializations added
                  </Text>
                )}
              </View>
            </View>

            {/* Additional Skills */}
            <View className="mb-4">
              <Text className="text-gray-500 text-xs mb-2 font-semibold">
                Additional Skills
              </Text>
              <View className="flex-row flex-wrap">
                {formData.additionalSkills.length > 0 ? (
                  formData.additionalSkills.map((skill, index) => (
                    <BadgeComponent
                      key={index}
                      text={skill}
                      variant="outline"
                    />
                  ))
                ) : (
                  <Text className="text-gray-400 text-sm">
                    No skills added
                  </Text>
                )}
              </View>
            </View>

            {/* Stats */}
            <View className="flex-row mt-2">
              <View className="flex-1 bg-blue-50 rounded-xl p-3 mr-2 items-center">
                <Text className="text-blue-800 font-bold text-xl">
                  {coachData.stats?.totalClients || coachData.totalStudents || 0}
                </Text>
                <Text className="text-blue-600 text-xs mt-1">
                  Total Clients
                </Text>
              </View>
              <View className="flex-1 bg-yellow-50 rounded-xl p-3 ml-2 items-center">
                <Text className="text-yellow-800 font-bold text-xl">
                  {coachData.rating || 0} / 5.0
                </Text>
                <Text className="text-yellow-600 text-xs mt-1">
                  Avg Rating
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
    </Section>
  );

  const renderCertificationsTab = () => (
    <Section title="Certifications & Qualifications" icon="medal">
      {isEditing && (
        <View className="mb-4">
          <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
            Certifications (comma separated)
          </Text>
          <TextInput
            value={formData.certifications.join(', ')}
            onChangeText={text =>
              setFormData({
                ...formData,
                certifications: text
                  .split(',')
                  .map(s => s.trim())
                  .filter(Boolean),
              })
            }
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm"
            placeholder="e.g., Certified Yoga Instructor, CPR Certified"
            placeholderTextColor="#9ca3af"
          />
        </View>
      )}
      {formData.certifications.length > 0 ? (
        formData.certifications.map((cert, index) => (
          <View
            key={index}
            className="flex-row items-center p-3.5 border border-gray-100 rounded-xl mb-2">
            <View
              className="w-10 h-10 rounded-full justify-center items-center"
              style={{ backgroundColor: '#1e3a8a15' }}>
              <Icon name="medal" size={20} color="#1e3a8a" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-gray-800 font-semibold text-sm">
                {typeof cert === 'object' ? cert.name : cert}
              </Text>
              {typeof cert === 'object' && cert.issuer && (
                <Text className="text-gray-400 text-xs mt-0.5">
                  {cert.issuer}
                </Text>
              )}
            </View>
            <Icon name="check-circle" size={20} color="#22c55e" />
          </View>
        ))
      ) : (
        <View className="py-8 items-center">
          <Icon name="medal-outline" size={48} color="#d1d5db" />
          <Text className="text-gray-400 mt-2 text-sm">
            No certifications added
          </Text>
        </View>
      )}
    </Section>
  );

  const renderEmergencyTab = () => (
    <>
      {/* Emergency Contact */}
      <Section title="Emergency Contact" icon="alert-circle">
        {isEditing ? (
          <>
            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
                  Contact Name
                </Text>
                <TextInput
                  value={formData.emergencyContact?.name || ''}
                  onChangeText={text =>
                    setFormData({
                      ...formData,
                      emergencyContact: {
                        ...formData.emergencyContact,
                        name: text,
                      },
                    })
                  }
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm"
                  placeholder="Name"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
                  Contact Phone
                </Text>
                <TextInput
                  value={formData.emergencyContact?.phone || ''}
                  onChangeText={text =>
                    setFormData({
                      ...formData,
                      emergencyContact: {
                        ...formData.emergencyContact,
                        phone: text,
                      },
                    })
                  }
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm"
                  placeholder="Phone"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
            <View className="mb-2">
              <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
                Relationship
              </Text>
              <TextInput
                value={formData.emergencyContact?.relationship || ''}
                onChangeText={text =>
                  setFormData({
                    ...formData,
                    emergencyContact: {
                      ...formData.emergencyContact,
                      relationship: text,
                    },
                  })
                }
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm"
                placeholder="e.g., Spouse, Parent, Sibling"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </>
        ) : (
          <>
            <InfoRow
              icon="account-heart"
              label="Contact Name"
              value={formData.emergencyContact?.name}
              iconColor="#dc2626"
            />
            <InfoRow
              icon="phone-alert"
              label="Contact Phone"
              value={formData.emergencyContact?.phone}
              iconColor="#dc2626"
            />
            <InfoRow
              icon="heart"
              label="Relationship"
              value={formData.emergencyContact?.relationship}
              iconColor="#dc2626"
            />
          </>
        )}
      </Section>

      {/* Availability */}
      <Section title="Availability Schedule" icon="clock">
        {coachData.availability &&
          Object.keys(coachData.availability).length > 0 ? (
          Object.entries(coachData.availability).map(([day, times]) => (
            <View
              key={day}
              className="flex-row items-center justify-between p-3 rounded-xl border border-gray-100 mb-2">
              <View className="flex-row items-center">
                <View
                  className="w-8 h-8 rounded-lg justify-center items-center mr-2"
                  style={{
                    backgroundColor:
                      times === 'Off' ? '#fee2e220' : '#dcfce720',
                  }}>
                  <Icon
                    name={times === 'Off' ? 'close-circle' : 'check-circle'}
                    size={16}
                    color={times === 'Off' ? '#dc2626' : '#22c55e'}
                  />
                </View>
                <Text className="font-semibold text-gray-800 text-sm capitalize">
                  {day}
                </Text>
              </View>
              <Text
                className="text-sm"
                style={{ color: times === 'Off' ? '#dc2626' : '#6b7280' }}>
                {typeof times === 'string' ? times : JSON.stringify(times)}
              </Text>
            </View>
          ))
        ) : (
          <View className="py-6 items-center">
            <Icon name="clock-alert-outline" size={48} color="#d1d5db" />
            <Text className="text-gray-400 mt-2 text-sm text-center">
              No availability set.{'\n'}Update your schedule to set
              availability.
            </Text>
          </View>
        )}
      </Section>
    </>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalTab();
      case 'professional':
        return renderProfessionalTab();
      case 'certifications':
        return renderCertificationsTab();
      case 'emergency':
        return renderEmergencyTab();
      default:
        return renderPersonalTab();
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1e3a8a']}
          />
        }>
        {/* ═══════════════════════════════════════════════ */}
        {/* ─── HEADER WITH GRADIENT ─── */}
        {/* ═══════════════════════════════════════════════ */}
        <LinearGradient
          colors={['#1e3a8a', '#3b82f6']}
          className="px-6 pt-12 pb-16 rounded-b-[30px]">
          {/* Top Bar */}
          <View className="flex-row justify-between items-center mb-6">
            <DrawerMenuButton />
            <Text className="text-white font-bold text-lg">My Profile</Text>
            <TouchableOpacity
              onPress={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
              className="w-10 h-10 bg-white/20 rounded-full justify-center items-center">
              <Icon
                name={isEditing ? 'content-save' : 'pencil'}
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {/* Profile Info */}
          <View className="items-center">
            <TouchableOpacity
              onPress={() => {
                setSelectedAvatar(currentAvatar);
                setShowAvatarModal(true);
              }}
              activeOpacity={0.8}>
              <View className="relative">
                <ProfileAvatar
                  name={coachData.name}
                  image={currentAvatar || null}
                  size="xlarge"
                />
                <View className="absolute bottom-0 right-0 w-9 h-9 bg-white rounded-full justify-center items-center shadow-md"
                  style={{ elevation: 4 }}>
                  <Icon name="camera" size={18} color="#1e3a8a" />
                </View>
              </View>
            </TouchableOpacity>

            <Text className="text-white font-bold text-2xl mt-4">
              {coachData.name}
            </Text>
            <Text className="text-white/80 text-sm">Professional Coach</Text>

            {/* Approval Status Badge */}
            <View className="mt-2">
              <View
                className="flex-row items-center px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor:
                    coachData.approvalStatus === 'approved'
                      ? '#dcfce7'
                      : coachData.approvalStatus === 'pending'
                        ? '#fef3c7'
                        : '#fee2e2',
                }}>
                <Icon
                  name="shield-check"
                  size={14}
                  color={
                    coachData.approvalStatus === 'approved'
                      ? '#166534'
                      : coachData.approvalStatus === 'pending'
                        ? '#92400e'
                        : '#991b1b'
                  }
                />
                <Text
                  className="text-xs font-semibold ml-1 capitalize"
                  style={{
                    color:
                      coachData.approvalStatus === 'approved'
                        ? '#166534'
                        : coachData.approvalStatus === 'pending'
                          ? '#92400e'
                          : '#991b1b',
                  }}>
                  {coachData.approvalStatus || 'N/A'}
                </Text>
              </View>
            </View>

            {/* Rating & Experience Pills */}
            <View className="flex-row mt-4">
              <View className="bg-white/20 px-4 py-2 rounded-full mr-2">
                <Text className="text-white font-semibold text-sm">
                  {coachData.experience}
                </Text>
              </View>
              <View className="bg-yellow-400 px-4 py-2 rounded-full flex-row items-center">
                <Icon name="star" size={14} color="#fff" />
                <Text className="text-white font-bold text-sm ml-1">
                  {coachData.rating}
                </Text>
              </View>
              <View className="bg-white/20 px-4 py-2 rounded-full ml-2">
                <Text className="text-white font-semibold text-sm">
                  {coachData.stats?.totalSessions || 0} sessions
                </Text>
              </View>
            </View>
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
              <View className="flex-row items-center">
                <Icon name="email-outline" size={14} color="#6b7280" />
                <Text className="text-gray-400 text-xs ml-1">Email</Text>
              </View>
              <Text
                className="text-gray-800 font-semibold text-xs mt-1"
                numberOfLines={1}>
                {coachData.email}
              </Text>
            </View>
            <View className="flex-1 items-center border-r border-gray-100">
              <View className="flex-row items-center">
                <Icon name="phone-outline" size={14} color="#6b7280" />
                <Text className="text-gray-400 text-xs ml-1">Phone</Text>
              </View>
              <Text className="text-gray-800 font-semibold text-xs mt-1">
                {coachData.phone || 'N/A'}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <View className="flex-row items-center">
                <Icon name="calendar-outline" size={14} color="#6b7280" />
                <Text className="text-gray-400 text-xs ml-1">Joined</Text>
              </View>
              <Text className="text-gray-800 font-semibold text-xs mt-1">
                {coachData.createdAt
                  ? new Date(coachData.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    year: 'numeric',
                  })
                  : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════ */}
        {/* ─── SECURITY INFO ─── */}
        {/* ═══════════════════════════════════════════════ */}
        {(coachData.twoFactorEnabled || coachData.lastLogin) && (
          <View className="px-4 mt-4">
            <View className="flex-row">
              {coachData.twoFactorEnabled && (
                <View className="flex-row items-center bg-green-50 px-3 py-2 rounded-full mr-2">
                  <Icon name="shield-check" size={14} color="#16a34a" />
                  <Text className="text-green-700 text-xs font-semibold ml-1">
                    2FA Enabled
                  </Text>
                </View>
              )}
              {coachData.lastLogin && (
                <View className="flex-row items-center bg-gray-100 px-3 py-2 rounded-full">
                  <Icon name="clock-outline" size={14} color="#6b7280" />
                  <Text className="text-gray-500 text-xs ml-1">
                    Last login: {formatDate(coachData.lastLogin)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* ─── TAB NAVIGATION ─── */}
        {/* ═══════════════════════════════════════════════ */}
        <View className="px-4 mt-6">
          <View className="bg-gray-200 rounded-xl p-1 flex-row">
            <TabButton
              label="Personal"
              isActive={activeTab === 'personal'}
              onPress={() => setActiveTab('personal')}
            />
            <TabButton
              label="Professional"
              isActive={activeTab === 'professional'}
              onPress={() => setActiveTab('professional')}
            />
            <TabButton
              label="Certs"
              isActive={activeTab === 'certifications'}
              onPress={() => setActiveTab('certifications')}
            />
            <TabButton
              label="Emergency"
              isActive={activeTab === 'emergency'}
              onPress={() => setActiveTab('emergency')}
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
            <View className="flex-row">
              <TouchableOpacity
                onPress={handleCancel}
                activeOpacity={0.7}
                className="flex-1 mr-2 border border-gray-300 rounded-xl py-3.5 items-center">
                <Text className="text-gray-600 font-bold text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                activeOpacity={0.7}
                className="flex-1 ml-2 rounded-xl py-3.5 items-center overflow-hidden">
                <LinearGradient
                  colors={['#1e3a8a', '#3b82f6']}
                  className="absolute inset-0"
                />
                <View className="flex-row items-center">
                  <Icon name="content-save" size={18} color="#fff" />
                  <Text className="text-white font-bold text-base ml-2">
                    Save Changes
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* ─── LOGOUT BUTTON ─── */}
        {/* ═══════════════════════════════════════════════ */}
        <View className="px-4 mb-8">
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Logout', 'Are you sure you want to logout?', [
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
              ]);
            }}
            activeOpacity={0.7}
            className="bg-red-500 rounded-xl py-4 items-center flex-row justify-center shadow-md"
            style={{ elevation: 3 }}>
            <Icon name="logout" size={20} color="#fff" />
            <Text className="text-white font-bold text-base ml-2">Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View className="h-6" />
      </ScrollView>

      {/* ═══════════════════════════════════════════════ */}
      {/* ─── AVATAR SELECTION MODAL ─── */}
      {/* ═══════════════════════════════════════════════ */}
      <Modal
        visible={showAvatarModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAvatarModal(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl px-6 pt-6 pb-8 max-h-[80%]">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-900 font-bold text-xl">
                Change Avatar
              </Text>
              <TouchableOpacity
                onPress={() => setShowAvatarModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center">
                <Icon name="close" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <Text className="text-gray-400 text-sm mb-6">
              Select a new avatar for your profile.
            </Text>

            {/* Avatar Grid */}
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap justify-between">
                {AVATAR_OPTIONS.map((avatar, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedAvatar(avatar)}
                    activeOpacity={0.7}
                    className="mb-4"
                    style={{ width: '23%' }}>
                    <View
                      className="aspect-square rounded-2xl p-2 border-2"
                      style={{
                        borderColor:
                          selectedAvatar === avatar ? '#1e3a8a' : '#e5e7eb',
                        backgroundColor:
                          selectedAvatar === avatar ? '#1e3a8a10' : '#f9fafb',
                      }}>
                      <Image
                        source={{ uri: avatar }}
                        className="w-full h-full rounded-xl"
                        resizeMode="contain"
                      />
                    </View>
                    {selectedAvatar === avatar && (
                      <View className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full justify-center items-center">
                        <Icon name="check" size={14} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Current Selection Preview */}
              {selectedAvatar ? (
                <View className="items-center mt-4 mb-4 p-4 bg-gray-50 rounded-2xl">
                  <Text className="text-gray-500 text-xs mb-2 font-semibold">
                    Selected Avatar
                  </Text>
                  <Image
                    source={{ uri: selectedAvatar }}
                    className="w-20 h-20 rounded-full"
                    resizeMode="contain"
                    style={{ backgroundColor: '#e5e7eb' }}
                  />
                </View>
              ) : null}
            </ScrollView>

            {/* Modal Actions */}
            <View className="flex-row mt-4">
              <TouchableOpacity
                onPress={() => setShowAvatarModal(false)}
                activeOpacity={0.7}
                className="flex-1 mr-2 border border-gray-300 rounded-xl py-3.5 items-center">
                <Text className="text-gray-600 font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmAvatarChange}
                activeOpacity={0.7}
                className="flex-1 ml-2 rounded-xl py-3.5 items-center overflow-hidden"
                disabled={!selectedAvatar}>
                <LinearGradient
                  colors={
                    selectedAvatar
                      ? ['#1e3a8a', '#3b82f6']
                      : ['#9ca3af', '#9ca3af']
                  }
                  className="absolute inset-0"
                />
                <Text className="text-white font-bold">Save Avatar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CoachProfileScreen;