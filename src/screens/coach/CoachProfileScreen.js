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
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';
import ProfileAvatar from '../../components/ProfileAvatar';
import DrawerMenuButton from '../../components/DrawerMenuButton';
import { coachProfile } from '../../data/user';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  'https://api.dicebear.com/7.x/avataaars/png?seed=Sarah&size=200',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Coach&size=200',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Trainer&size=200',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Instructor&size=200',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Teacher&size=200',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Mentor&size=200',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Guide&size=200',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Expert&size=200',
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
    <SectionTitle title={title} icon={icon} iconColor={iconColor} rightElement={rightElement} />
    {children}
  </View>
);

const BadgeComponent = ({ text, variant = 'default' }) => {
  const variants = {
    default: { colors: ['#1e3a8a', '#3b82f6'], textColor: '#ffffff' },
    secondary: { colors: ['#e5e7eb', '#f3f4f6'], textColor: '#374151' },
    outline: { colors: ['transparent', 'transparent'], textColor: '#1e3a8a', border: '#1e3a8a' },
    success: { colors: ['#dcfce7', '#f0fdf4'], textColor: '#166534' },
    warning: { colors: ['#fef3c7', '#fffbeb'], textColor: '#92400e' },
    destructive: { colors: ['#fee2e2', '#fef2f2'], textColor: '#991b1b' },
  };
  const style = variants[variant] || variants.default;

  if (variant === 'outline') {
    return (
      <View
        className="px-3.5 py-2 rounded-full mr-2 mb-2"
        style={{
          borderWidth: 1.5,
          borderColor: style.border || '#1e3a8a',
          backgroundColor: '#1e3a8a08',
        }}>
        <Text className="text-xs font-bold" style={{ color: style.textColor }}>
          {text}
        </Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={style.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      className="px-3.5 py-2 rounded-full mr-2 mb-2"
      style={{ borderRadius: 20 }}>
      <Text className="text-xs font-bold" style={{ color: style.textColor }}>
        {text}
      </Text>
    </LinearGradient>
  );
};

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

const CircularStat = ({ value, label, color, suffix = '' }) => (
  <View className="items-center flex-1">
    <View
      className="w-16 h-16 rounded-full justify-center items-center mb-2"
      style={{
        backgroundColor: `${color}12`,
        borderWidth: 3,
        borderColor: `${color}30`,
      }}>
      <Text className="font-bold text-lg" style={{ color }}>
        {value}
        {suffix}
      </Text>
    </View>
    <Text className="text-gray-500 text-[11px] text-center font-medium">
      {label}
    </Text>
  </View>
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

  const handlePickFromGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 500,
      maxHeight: 500,
      selectionLimit: 1,
    };
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to pick image');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const pickedUri = response.assets[0].uri;
        setSelectedAvatar(pickedUri);
      }
    });
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

  // ─── Edit Field Component ───
  const EditField = ({ label, value, onChangeText, placeholder, multiline, numberOfLines, keyboardType, disabled, disabledValue }) => (
    <View className="mb-4">
      <Text className="text-gray-400 text-[11px] mb-2 font-bold uppercase tracking-wider">
        {label}
      </Text>
      {disabled ? (
        <View className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5">
          <Text className="text-gray-400 text-sm font-medium">
            {disabledValue}
          </Text>
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
          style={multiline ? { minHeight: 120 } : undefined}
        />
      )}
    </View>
  );

  // ─── Tab Content Renderers ───
  const renderPersonalTab = () => (
    <Section title="Personal Information" icon="account" iconColor="#3b82f6">
      <View className="space-y-1">
        {isEditing ? (
          <>
            <EditField
              label="Full Name"
              value={formData.name}
              onChangeText={text => setFormData({ ...formData, name: text })}
              placeholder="Enter your name"
            />
            <EditField
              label="Email Address"
              disabled
              disabledValue={coachData.email}
            />
            <EditField
              label="Phone Number"
              value={formData.phone}
              onChangeText={text => setFormData({ ...formData, phone: text })}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
            <EditField
              label="Branch"
              disabled
              disabledValue={coachData.branch?.name || 'Not assigned'}
            />
            <EditField
              label="Address"
              value={formData.address}
              onChangeText={text => setFormData({ ...formData, address: text })}
              placeholder="Enter your address"
            />
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
              value={coachData.email}
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
              icon="office-building"
              label="Branch"
              value={coachData.branch?.name || 'Not assigned'}
              iconColor="#f59e0b"
              gradient={['#fef3c7', '#fffbeb']}
            />
            <InfoRow
              icon="map-marker"
              label="Address"
              value={formData.address}
              iconColor="#ec4899"
              gradient={['#fce7f3', '#fdf2f8']}
            />
          </>
        )}
      </View>
    </Section>
  );

  const renderProfessionalTab = () => (
    <Section title="Professional Profile" icon="certificate" iconColor="#8b5cf6">
      <View className="space-y-1">
        {isEditing ? (
          <>
            <EditField
              label="Bio"
              value={formData.bio}
              onChangeText={text => setFormData({ ...formData, bio: text })}
              placeholder="Tell us about your experience..."
              multiline
              numberOfLines={5}
            />
            <EditField
              label="Specializations (comma separated)"
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
              placeholder="e.g., Yoga, Pilates, Meditation"
            />
            <EditField
              label="Additional Skills (comma separated)"
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
              placeholder="e.g., First Aid, Nutrition"
            />
          </>
        ) : (
          <>
            {/* Bio */}
            <View className="mb-5">
              <Text className="text-gray-400 text-[11px] mb-2 font-bold uppercase tracking-wider">
                Bio
              </Text>
              <View className="bg-gray-50 rounded-xl p-4" style={{ borderLeftWidth: 3, borderLeftColor: '#8b5cf6' }}>
                <Text className="text-gray-700 text-sm leading-5 font-medium">
                  {formData.bio || 'No bio added'}
                </Text>
              </View>
            </View>

            {/* Specializations */}
            <View className="mb-5">
              <Text className="text-gray-400 text-[11px] mb-3 font-bold uppercase tracking-wider">
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
            <View className="mb-5">
              <Text className="text-gray-400 text-[11px] mb-3 font-bold uppercase tracking-wider">
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
            <View className="flex-row mt-2" style={{ gap: 10 }}>
              <View className="flex-1 bg-blue-50 rounded-2xl p-4 items-center">
                <View className="w-10 h-10 bg-blue-100 rounded-xl justify-center items-center mb-2">
                  <Icon name="account-group" size={20} color="#3b82f6" />
                </View>
                <Text className="text-blue-900 font-bold text-2xl">
                  {coachData.stats?.totalClients || coachData.totalStudents || 0}
                </Text>
                <Text className="text-blue-500 text-[11px] mt-1 font-semibold">
                  Total Clients
                </Text>
              </View>
              <View className="flex-1 bg-yellow-50 rounded-2xl p-4 items-center">
                <View className="w-10 h-10 bg-yellow-100 rounded-xl justify-center items-center mb-2">
                  <Icon name="star" size={20} color="#f59e0b" />
                </View>
                <Text className="text-yellow-900 font-bold text-2xl">
                  {coachData.rating || 0}
                </Text>
                <Text className="text-yellow-600 text-[11px] mt-1 font-semibold">
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
    <Section title="Certifications & Qualifications" icon="medal" iconColor="#f59e0b">
      {isEditing && (
        <EditField
          label="Certifications (comma separated)"
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
          placeholder="e.g., Certified Yoga Instructor, CPR Certified"
        />
      )}
      {formData.certifications.length > 0 ? (
        formData.certifications.map((cert, index) => {
          const certColors = [
            { primary: '#3b82f6', gradient: ['#dbeafe', '#eff6ff'] },
            { primary: '#22c55e', gradient: ['#dcfce7', '#f0fdf4'] },
            { primary: '#f59e0b', gradient: ['#fef3c7', '#fffbeb'] },
            { primary: '#8b5cf6', gradient: ['#ede9fe', '#f5f3ff'] },
          ];
          const colorSet = certColors[index % certColors.length];

          return (
            <View
              key={index}
              className="flex-row items-center p-4 rounded-2xl mb-3 shadow-sm"
              style={{
                elevation: 2,
                backgroundColor: '#fff',
                borderLeftWidth: 3,
                borderLeftColor: colorSet.primary,
              }}>
              <LinearGradient
                colors={colorSet.gradient}
                className="w-11 h-11 rounded-xl justify-center items-center"
                style={{ borderRadius: 12 }}>
                <Icon name="medal" size={20} color={colorSet.primary} />
              </LinearGradient>
              <View className="flex-1 ml-3.5">
                <Text className="text-gray-800 font-bold text-sm">
                  {typeof cert === 'object' ? cert.name : cert}
                </Text>
                {typeof cert === 'object' && cert.issuer && (
                  <Text className="text-gray-400 text-xs mt-0.5 font-medium">
                    {cert.issuer}
                  </Text>
                )}
              </View>
              <View className="w-8 h-8 bg-green-50 rounded-full justify-center items-center">
                <Icon name="check-circle" size={18} color="#22c55e" />
              </View>
            </View>
          );
        })
      ) : (
        <View className="py-10 items-center">
          <View className="w-16 h-16 rounded-full bg-gray-50 justify-center items-center mb-3">
            <Icon name="medal-outline" size={32} color="#d1d5db" />
          </View>
          <Text className="text-gray-400 mt-1 text-sm font-medium">
            No certifications added
          </Text>
        </View>
      )}
    </Section>
  );

  const renderEmergencyTab = () => (
    <>
      {/* Emergency Contact */}
      <Section title="Emergency Contact" icon="alert-circle" iconColor="#dc2626">
        {isEditing ? (
          <>
            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <EditField
                  label="Contact Name"
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
                  placeholder="Name"
                />
              </View>
              <View className="flex-1 ml-2">
                <EditField
                  label="Contact Phone"
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
                  placeholder="Phone"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
            <EditField
              label="Relationship"
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
              placeholder="e.g., Spouse, Parent, Sibling"
            />
          </>
        ) : (
          <>
            <InfoRow
              icon="account-heart"
              label="Contact Name"
              value={formData.emergencyContact?.name}
              iconColor="#dc2626"
              gradient={['#fee2e2', '#fef2f2']}
            />
            <InfoRow
              icon="phone-alert"
              label="Contact Phone"
              value={formData.emergencyContact?.phone}
              iconColor="#dc2626"
              gradient={['#fee2e2', '#fef2f2']}
            />
            <InfoRow
              icon="heart"
              label="Relationship"
              value={formData.emergencyContact?.relationship}
              iconColor="#dc2626"
              gradient={['#fee2e2', '#fef2f2']}
            />
          </>
        )}
      </Section>

      {/* Availability */}
      <Section title="Availability Schedule" icon="clock" iconColor="#22c55e">
        {coachData.availability &&
          Object.keys(coachData.availability).length > 0 ? (
          Object.entries(coachData.availability).map(([day, times], index) => {
            const isOff = times === 'Off';
            return (
              <View
                key={day}
                className="flex-row items-center justify-between p-3.5 rounded-2xl mb-2.5 shadow-sm"
                style={{
                  elevation: 1,
                  backgroundColor: isOff ? '#fef2f2' : '#ffffff',
                  borderLeftWidth: 3,
                  borderLeftColor: isOff ? '#ef4444' : '#22c55e',
                }}>
                <View className="flex-row items-center">
                  <View
                    className="w-9 h-9 rounded-xl justify-center items-center mr-3"
                    style={{
                      backgroundColor: isOff ? '#fee2e220' : '#dcfce720',
                    }}>
                    <Icon
                      name={isOff ? 'close-circle' : 'check-circle'}
                      size={18}
                      color={isOff ? '#ef4444' : '#22c55e'}
                    />
                  </View>
                  <Text className="font-bold text-gray-800 text-sm capitalize">
                    {day}
                  </Text>
                </View>
                <View
                  className="px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: isOff ? '#fee2e2' : '#f0fdf4',
                  }}>
                  <Text
                    className="text-xs font-bold"
                    style={{ color: isOff ? '#dc2626' : '#16a34a' }}>
                    {typeof times === 'string' ? times : JSON.stringify(times)}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <View className="py-10 items-center">
            <View className="w-16 h-16 rounded-full bg-gray-50 justify-center items-center mb-3">
              <Icon name="clock-alert-outline" size={32} color="#d1d5db" />
            </View>
            <Text className="text-gray-400 mt-1 text-sm text-center font-medium">
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
              className="w-10 h-10 bg-white/15 rounded-full justify-center items-center"
              style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <Icon
                name={isEditing ? 'content-save' : 'pencil'}
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {/* Profile Info */}
          <View className="items-center px-5">
            <TouchableOpacity
              onPress={() => {
                setSelectedAvatar(currentAvatar);
                setShowAvatarModal(true);
              }}
              activeOpacity={0.8}>
              <View className="relative">
                <View
                  style={{
                    borderWidth: 3,
                    borderColor: 'rgba(255,255,255,0.25)',
                    borderRadius: 70,
                    padding: 3,
                  }}>
                  <ProfileAvatar
                    name={coachData.name}
                    image={currentAvatar || null}
                    size="xlarge"
                  />
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedAvatar(currentAvatar);
                    setShowAvatarModal(true);
                  }}
                  activeOpacity={0.8}
                  style={{ position: 'absolute', bottom: 4, right: 4 }}>
                  <LinearGradient
                    colors={['#ffffff', '#f3f4f6']}
                    className="w-10 h-10 rounded-full justify-center items-center shadow-lg"
                    style={{ borderRadius: 20, elevation: 5 }}>
                    <Icon name="camera" size={20} color="#1e3a8a" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            <Text className="text-white font-bold text-2xl mt-4">
              {coachData.name}
            </Text>
            <View className="flex-row items-center mt-1">
              <Icon name="shield-star" size={14} color="#fbbf24" />
              <Text className="text-white/70 text-sm ml-1.5 font-medium">
                Professional Coach
              </Text>
            </View>

            {/* Approval Status Badge */}
            <View className="mt-3">
              <View
                className="flex-row items-center px-4 py-2 rounded-full"
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
                  className="text-xs font-bold ml-1.5 capitalize"
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
            <View className="flex-row mt-4" style={{ gap: 8 }}>
              <View
                className="bg-white/10 px-4 py-2.5 rounded-xl flex-row items-center"
                style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <Icon name="trophy" size={14} color="#fbbf24" />
                <Text className="text-white font-bold text-sm ml-1.5">
                  {coachData.experience}
                </Text>
              </View>
              <LinearGradient
                colors={['#f59e0b', '#fbbf24']}
                className="px-4 py-2.5 rounded-xl flex-row items-center"
                style={{ borderRadius: 12 }}>
                <Icon name="star" size={14} color="#78350f" />
                <Text className="text-yellow-900 font-bold text-sm ml-1.5">
                  {coachData.rating}
                </Text>
              </LinearGradient>
              <View
                className="bg-white/10 px-4 py-2.5 rounded-xl flex-row items-center"
                style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <Icon name="calendar-check" size={14} color="#60a5fa" />
                <Text className="text-white font-bold text-sm ml-1.5">
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
              <View className="w-8 h-8 bg-purple-50 rounded-lg justify-center items-center mb-1.5">
                <Icon name="email-outline" size={14} color="#8b5cf6" />
              </View>
              <Text className="text-gray-400 text-[10px] font-semibold uppercase">
                Email
              </Text>
              <Text
                className="text-gray-800 font-bold text-[11px] mt-0.5"
                numberOfLines={1}>
                {coachData.email}
              </Text>
            </View>
            <View className="flex-1 items-center border-r border-gray-100">
              <View className="w-8 h-8 bg-green-50 rounded-lg justify-center items-center mb-1.5">
                <Icon name="phone-outline" size={14} color="#22c55e" />
              </View>
              <Text className="text-gray-400 text-[10px] font-semibold uppercase">
                Phone
              </Text>
              <Text className="text-gray-800 font-bold text-[11px] mt-0.5">
                {coachData.phone || 'N/A'}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <View className="w-8 h-8 bg-blue-50 rounded-lg justify-center items-center mb-1.5">
                <Icon name="calendar-outline" size={14} color="#3b82f6" />
              </View>
              <Text className="text-gray-400 text-[10px] font-semibold uppercase">
                Joined
              </Text>
              <Text className="text-gray-800 font-bold text-[11px] mt-0.5">
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
            <View className="flex-row" style={{ gap: 8 }}>
              {coachData.twoFactorEnabled && (
                <View
                  className="flex-row items-center bg-green-50 px-3.5 py-2.5 rounded-xl"
                  style={{ borderWidth: 1, borderColor: '#dcfce7' }}>
                  <Icon name="shield-check" size={14} color="#16a34a" />
                  <Text className="text-green-700 text-xs font-bold ml-1.5">
                    2FA Enabled
                  </Text>
                </View>
              )}
              {coachData.lastLogin && (
                <View
                  className="flex-row items-center bg-gray-50 px-3.5 py-2.5 rounded-xl flex-1"
                  style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                  <Icon name="clock-outline" size={14} color="#6b7280" />
                  <Text className="text-gray-500 text-xs ml-1.5 font-medium">
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
              label="Professional"
              icon="briefcase"
              isActive={activeTab === 'professional'}
              onPress={() => setActiveTab('professional')}
            />
            <TabButton
              label="Certs"
              icon="medal"
              isActive={activeTab === 'certifications'}
              onPress={() => setActiveTab('certifications')}
            />
            <TabButton
              label="More"
              icon="dots-horizontal"
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

      {/* ═══════════════════════════════════════════════ */}
      {/* ─── AVATAR SELECTION MODAL ─── */}
      {/* ═══════════════════════════════════════════════ */}
      <Modal
        visible={showAvatarModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAvatarModal(false)}>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl px-6 pt-6 pb-8 max-h-[80%]">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-2">
              <View>
                <Text className="text-gray-900 font-bold text-xl">
                  Change Avatar
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  Select a new avatar for your profile.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAvatarModal(false)}
                className="w-9 h-9 bg-gray-100 rounded-full justify-center items-center">
                <Icon name="close" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View className="h-px bg-gray-100 my-4" />

            {/* Pick from Gallery Button */}
            <TouchableOpacity
              onPress={handlePickFromGallery}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f0f9ff',
                borderWidth: 1.5,
                borderColor: '#bae6fd',
                borderRadius: 14,
                paddingVertical: 14,
                marginBottom: 16,
              }}>
              <Icon name="image-multiple" size={20} color="#0284c7" />
              <Text
                style={{
                  color: '#0284c7',
                  fontWeight: 'bold',
                  fontSize: 14,
                  marginLeft: 8,
                }}>
                Pick from Gallery
              </Text>
            </TouchableOpacity>

            {/* Or Divider */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
              <Text style={{ marginHorizontal: 12, color: '#9ca3af', fontSize: 12, fontWeight: '600' }}>
                OR choose an avatar
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
            </View>

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
                      className="aspect-square rounded-2xl p-2"
                      style={{
                        borderWidth: 2.5,
                        borderColor:
                          selectedAvatar === avatar ? '#1e3a8a' : '#f3f4f6',
                        backgroundColor:
                          selectedAvatar === avatar ? '#1e3a8a08' : '#f9fafb',
                        borderRadius: 16,
                      }}>
                      <Image
                        source={{ uri: avatar }}
                        className="w-full h-full rounded-xl"
                        resizeMode="contain"
                      />
                    </View>
                    {selectedAvatar === avatar && (
                      <View
                        style={{
                          position: 'absolute',
                          top: -4,
                          right: -4,
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          justifyContent: 'center',
                          alignItems: 'center',
                          overflow: 'hidden',
                        }}>
                        <LinearGradient
                          colors={['#1e3a8a', '#3b82f6']}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <Icon name="check" size={14} color="#fff" />
                        </LinearGradient>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Current Selection Preview */}
              {selectedAvatar ? (
                <View className="items-center mt-4 mb-4 p-5 bg-gray-50 rounded-2xl">
                  <Text className="text-gray-400 text-[11px] mb-3 font-bold uppercase tracking-wider">
                    Selected Avatar
                  </Text>
                  <View
                    style={{
                      borderWidth: 3,
                      borderColor: '#1e3a8a20',
                      borderRadius: 44,
                      padding: 3,
                    }}>
                    <Image
                      source={{ uri: selectedAvatar }}
                      className="w-20 h-20 rounded-full"
                      resizeMode="contain"
                      style={{ backgroundColor: '#e5e7eb' }}
                    />
                  </View>
                </View>
              ) : null}
            </ScrollView>

            {/* Modal Actions */}
            <View className="flex-row mt-4" style={{ gap: 10 }}>
              <TouchableOpacity
                onPress={() => setShowAvatarModal(false)}
                activeOpacity={0.7}
                className="flex-1"
                style={{
                  borderWidth: 1.5,
                  borderColor: '#e5e7eb',
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}>
                <Text className="text-gray-600 font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmAvatarChange}
                activeOpacity={0.7}
                className="flex-1 overflow-hidden"
                disabled={!selectedAvatar}
                style={{ borderRadius: 14 }}>
                <LinearGradient
                  colors={
                    selectedAvatar
                      ? ['#1e3a8a', '#3b82f6']
                      : ['#d1d5db', '#d1d5db']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    paddingVertical: 14,
                    alignItems: 'center',
                    borderRadius: 14,
                  }}>
                  <Text className="text-white font-bold">Save Avatar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CoachProfileScreen;