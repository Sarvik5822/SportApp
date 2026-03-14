import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ProfileAvatar from '../../components/ProfileAvatar';
import ProgressBar from '../../components/ProgressBar';
import { memberAttendance, memberTrainingPlans } from '../../data/members';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Helper Functions ───
const formatDate = dateStr => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatTime = dateStr => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

// ─── Status & Membership Styles ───
const getStatusStyle = status => {
    switch (status) {
        case 'active':
            return { bg: '#dcfce7', text: '#166534', label: 'Active' };
        case 'pending':
            return { bg: '#fef3c7', text: '#92400e', label: 'Pending' };
        case 'expired':
        case 'suspended':
            return { bg: '#fee2e2', text: '#991b1b', label: status.charAt(0).toUpperCase() + status.slice(1) };
        default:
            return { bg: '#f3f4f6', text: '#374151', label: status };
    }
};

const getMembershipStyle = type => {
    switch (type) {
        case 'Platinum':
            return { bg: '#e0e7ff', text: '#3730a3' };
        case 'Gold':
            return { bg: '#fef3c7', text: '#92400e' };
        case 'Silver':
            return { bg: '#f3f4f6', text: '#374151' };
        case 'Basic':
            return { bg: '#e0f2fe', text: '#075985' };
        default:
            return { bg: '#f3f4f6', text: '#374151' };
    }
};

// ─── BMI Helpers ───
const calculateBmi = (height, weight) => {
    if (!height || !weight) return null;
    return (weight / Math.pow(height / 100, 2)).toFixed(1);
};

const getBmiCategory = bmiVal => {
    if (!bmiVal) return 'N/A';
    const v = parseFloat(bmiVal);
    if (v < 18.5) return 'Underweight';
    if (v < 25) return 'Normal';
    if (v < 30) return 'Overweight';
    return 'Obese';
};

const getBmiColor = category => {
    switch (category) {
        case 'Normal':
            return { bg: '#dcfce7', text: '#166534' };
        case 'Underweight':
            return { bg: '#fef3c7', text: '#92400e' };
        case 'Overweight':
            return { bg: '#fed7aa', text: '#c2410c' };
        case 'Obese':
            return { bg: '#fee2e2', text: '#991b1b' };
        default:
            return { bg: '#f3f4f6', text: '#374151' };
    }
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
            <Text className="text-gray-900 font-medium text-sm">{value || 'N/A'}</Text>
        </View>
    </View>
);

const StatMiniCard = ({ icon, label, value, color }) => (
    <View
        className="flex-1 bg-white rounded-xl p-3 mx-1 shadow-sm"
        style={{ elevation: 2 }}>
        <View
            className="w-8 h-8 rounded-lg justify-center items-center mb-2"
            style={{ backgroundColor: `${color}15` }}>
            <Icon name={icon} size={18} color={color} />
        </View>
        <Text className="text-gray-900 font-bold text-lg">{value}</Text>
        <Text className="text-gray-400 text-xs">{label}</Text>
    </View>
);

const SectionCard = ({ title, icon, iconColor = '#1e3a8a', children, rightAction }) => (
    <View
        className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
        style={{ elevation: 3 }}>
        <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
                <Icon name={icon} size={20} color={iconColor} />
                <Text className="text-gray-900 font-bold text-lg ml-2">{title}</Text>
            </View>
            {rightAction}
        </View>
        {children}
    </View>
);

const InfoBlock = ({ label, value, capitalize = false }) => (
    <View className="mb-3">
        <Text className="text-gray-400 text-xs">{label}</Text>
        <Text
            className={`text-gray-900 font-semibold text-sm mt-0.5 ${capitalize ? 'capitalize' : ''}`}>
            {value || 'N/A'}
        </Text>
    </View>
);

const Badge = ({ label, bgColor, textColor }) => (
    <View className="px-3 py-1 rounded-full mr-2 mb-1" style={{ backgroundColor: bgColor }}>
        <Text className="text-xs font-bold" style={{ color: textColor }}>
            {label}
        </Text>
    </View>
);

// ─── Tab Button ───
const TabButton = ({ label, isActive, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="mr-1 mb-2"
        style={{
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: isActive ? '#1e3a8a' : '#f3f4f6',
        }}>
        <Text
            className="text-xs font-semibold"
            style={{ color: isActive ? '#fff' : '#6b7280' }}>
            {label}
        </Text>
    </TouchableOpacity>
);

// ═══════════════════════════════════════════════
// ─── TAB CONTENT COMPONENTS ───
// ═══════════════════════════════════════════════

// ─── Overview Tab ───
const OverviewTab = ({ member, bmi, activePlan }) => {
    const bmiCategory = getBmiCategory(bmi);
    const bmiColor = getBmiColor(bmiCategory);

    return (
        <View>
            {/* Stats Cards */}
            <View className="flex-row mb-4">
                <View
                    className="flex-1 bg-white rounded-xl p-4 mr-2 shadow-sm"
                    style={{ elevation: 2 }}>
                    <View className="flex-row items-start justify-between">
                        <View className="flex-1">
                            <Text className="text-gray-400 text-xs">This Month</Text>
                            <Text className="text-gray-900 font-bold text-2xl mt-1">
                                {member.stats?.thisMonthVisits || 0}
                            </Text>
                            <Text className="text-gray-400 text-xs">visits</Text>
                        </View>
                        <View className="w-10 h-10 rounded-full bg-blue-50 justify-center items-center">
                            <Icon name="calendar-month" size={20} color="#3b82f6" />
                        </View>
                    </View>
                </View>
                <View
                    className="flex-1 bg-white rounded-xl p-4 ml-2 shadow-sm"
                    style={{ elevation: 2 }}>
                    <View className="flex-row items-start justify-between">
                        <View className="flex-1">
                            <Text className="text-gray-400 text-xs">Total Visits</Text>
                            <Text className="text-gray-900 font-bold text-2xl mt-1">
                                {member.stats?.totalVisits || 0}
                            </Text>
                            <Text className="text-gray-400 text-xs">all time</Text>
                        </View>
                        <View className="w-10 h-10 rounded-full bg-green-50 justify-center items-center">
                            <Icon name="trending-up" size={20} color="#22c55e" />
                        </View>
                    </View>
                </View>
            </View>

            {/* Training Plan Card */}
            <View
                className="bg-white rounded-xl p-4 mb-4 shadow-sm"
                style={{ elevation: 2 }}>
                <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                        <Text className="text-gray-400 text-xs">Training Plan</Text>
                        <Text className="text-gray-900 font-bold text-xl mt-1">
                            {member.stats?.hasActivePlan ? 'Active' : 'None'}
                        </Text>
                        <Text className="text-gray-400 text-xs mt-0.5">
                            {activePlan?.title || 'No active plan'}
                        </Text>
                    </View>
                    <View className="w-10 h-10 rounded-full bg-orange-50 justify-center items-center">
                        <Icon name="dumbbell" size={20} color="#f59e0b" />
                    </View>
                </View>
            </View>

            {/* BMI Card */}
            {bmi && (
                <SectionCard title="Body Mass Index (BMI)" icon="scale-bathroom">
                    <View className="flex-row items-center mb-3">
                        <Text className="text-gray-900 font-bold text-4xl mr-4">{bmi}</Text>
                        <View
                            className="px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: bmiColor.bg }}>
                            <Text className="font-bold text-sm" style={{ color: bmiColor.text }}>
                                {bmiCategory}
                            </Text>
                        </View>
                    </View>
                    <ProgressBar
                        progress={Math.min(parseFloat(bmi), 40)}
                        total={40}
                        showPercentage={false}
                        color={
                            bmiCategory === 'Normal'
                                ? 'bg-green-500'
                                : bmiCategory === 'Underweight'
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                        }
                    />
                    <View className="flex-row justify-between mt-1">
                        <Text className="text-gray-400 text-[10px]">{'<18.5'}</Text>
                        <Text className="text-gray-400 text-[10px]">18.5-25</Text>
                        <Text className="text-gray-400 text-[10px]">25-30</Text>
                        <Text className="text-gray-400 text-[10px]">{'>30'}</Text>
                    </View>
                </SectionCard>
            )}

            {/* Accessible Sports */}
            {member.accessibleSports && member.accessibleSports.length > 0 && (
                <SectionCard title="Accessible Sports" icon="run">
                    <View className="flex-row flex-wrap">
                        {member.accessibleSports.map((sport, index) => (
                            <View
                                key={index}
                                className="px-3 py-1.5 rounded-full border border-gray-200 mr-2 mb-2">
                                <Text className="text-gray-700 text-sm font-medium">
                                    {typeof sport === 'object' ? sport.sportName : sport}
                                </Text>
                            </View>
                        ))}
                    </View>
                </SectionCard>
            )}
        </View>
    );
};

// ─── Attendance Tab ───
const AttendanceTab = ({ attendance }) => (
    <SectionCard title="Recent Visit History" icon="history">
        {attendance.length > 0 ? (
            attendance.map((record, index) => {
                const statusColor =
                    record.status === 'completed'
                        ? { bg: '#dcfce7', text: '#166534' }
                        : { bg: '#f3f4f6', text: '#374151' };
                return (
                    <View
                        key={record._id || index}
                        className="p-3.5 rounded-xl border border-gray-100 mb-2">
                        <View className="flex-row items-start justify-between">
                            <View className="flex-1">
                                <Text className="text-gray-900 font-semibold text-sm">
                                    {formatDate(record.date)}
                                </Text>
                                <View className="flex-row flex-wrap items-center mt-1.5">
                                    {record.punchInTime && (
                                        <View className="flex-row items-center mr-3 mb-1">
                                            <Icon name="clock-in" size={12} color="#9ca3af" />
                                            <Text className="text-gray-400 text-xs ml-1">
                                                In: {formatTime(record.punchInTime)}
                                            </Text>
                                        </View>
                                    )}
                                    {record.punchOutTime && (
                                        <View className="flex-row items-center mr-3 mb-1">
                                            <Icon name="clock-out" size={12} color="#9ca3af" />
                                            <Text className="text-gray-400 text-xs ml-1">
                                                Out: {formatTime(record.punchOutTime)}
                                            </Text>
                                        </View>
                                    )}
                                    {record.facility && (
                                        <View className="flex-row items-center mr-3 mb-1">
                                            <Icon name="map-marker" size={12} color="#9ca3af" />
                                            <Text className="text-gray-400 text-xs ml-1">
                                                {record.facility}
                                            </Text>
                                        </View>
                                    )}
                                    {record.duration > 0 && (
                                        <View className="flex-row items-center mb-1">
                                            <Icon name="timer-outline" size={12} color="#9ca3af" />
                                            <Text className="text-gray-400 text-xs ml-1">
                                                {record.duration} min
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                            <View
                                className="px-2.5 py-1 rounded-full"
                                style={{ backgroundColor: statusColor.bg }}>
                                <Text
                                    className="text-xs font-semibold"
                                    style={{ color: statusColor.text }}>
                                    {record.status || 'recorded'}
                                </Text>
                            </View>
                        </View>
                    </View>
                );
            })
        ) : (
            <View className="items-center py-8">
                <Icon name="calendar-blank" size={48} color="#d1d5db" />
                <Text className="text-gray-400 mt-2 text-sm">
                    No attendance records found
                </Text>
            </View>
        )}
    </SectionCard>
);

// ─── Training Plans Tab ───
const TrainingTab = ({ plans }) => (
    <SectionCard title="Training Plans" icon="dumbbell">
        {plans.length > 0 ? (
            plans.map((plan, index) => {
                const planStatusColor =
                    plan.status === 'active'
                        ? { bg: '#dcfce7', text: '#166534' }
                        : plan.status === 'completed'
                            ? { bg: '#dbeafe', text: '#1e40af' }
                            : { bg: '#f3f4f6', text: '#374151' };
                return (
                    <View
                        key={plan._id || index}
                        className="p-4 rounded-xl border border-gray-100 mb-3">
                        <View className="flex-row items-start justify-between mb-2">
                            <View className="flex-1 mr-2">
                                <Text className="text-gray-900 font-bold text-sm">
                                    {plan.title || plan.name || 'Training Plan'}
                                </Text>
                            </View>
                            <View
                                className="px-2.5 py-1 rounded-full"
                                style={{ backgroundColor: planStatusColor.bg }}>
                                <Text
                                    className="text-xs font-semibold capitalize"
                                    style={{ color: planStatusColor.text }}>
                                    {plan.status}
                                </Text>
                            </View>
                        </View>
                        {plan.description && (
                            <Text className="text-gray-400 text-xs mb-2">
                                {plan.description}
                            </Text>
                        )}
                        <View className="flex-row flex-wrap mb-2">
                            <Text className="text-gray-500 text-xs mr-3">
                                Sport: {plan.sport || 'N/A'}
                            </Text>
                            <Text className="text-gray-500 text-xs mr-3">
                                Duration: {plan.duration} weeks
                            </Text>
                        </View>
                        <View className="flex-row flex-wrap mb-2">
                            <Text className="text-gray-500 text-xs mr-3">
                                Start: {formatDate(plan.startDate)}
                            </Text>
                            <Text className="text-gray-500 text-xs">
                                End: {formatDate(plan.endDate)}
                            </Text>
                        </View>
                        {plan.goals?.length > 0 && (
                            <View className="flex-row flex-wrap mb-2">
                                {plan.goals.map((goal, idx) => (
                                    <View
                                        key={idx}
                                        className="px-2 py-0.5 rounded-full border border-gray-200 mr-1 mb-1">
                                        <Text className="text-gray-600 text-[10px] font-medium">
                                            {goal}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                        {plan.stats?.progressPercentage > 0 && (
                            <View className="mt-2">
                                <View className="flex-row items-center justify-between mb-1">
                                    <Text className="text-gray-500 text-xs">Progress</Text>
                                    <Text className="text-gray-900 text-xs font-bold">
                                        {plan.stats.progressPercentage}%
                                    </Text>
                                </View>
                                <ProgressBar
                                    progress={plan.stats.progressPercentage}
                                    total={100}
                                    showPercentage={false}
                                    height={6}
                                    color="bg-blue-500"
                                />
                            </View>
                        )}
                    </View>
                );
            })
        ) : (
            <View className="items-center py-8">
                <Icon name="dumbbell" size={48} color="#d1d5db" />
                <Text className="text-gray-400 mt-2 text-sm">
                    No training plans found for this member
                </Text>
            </View>
        )}
    </SectionCard>
);

// ─── Health Info Tab ───
const HealthTab = ({ member, bmi }) => {
    const bmiCategory = getBmiCategory(bmi);
    return (
        <View>
            {/* General Health */}
            <SectionCard title="General Health" icon="heart-pulse" iconColor="#ef4444">
                <View className="flex-row flex-wrap">
                    <View className="w-1/2 pr-2 mb-3">
                        <InfoBlock label="Height" value={member.healthInfo?.height ? `${member.healthInfo.height} cm` : null} />
                    </View>
                    <View className="w-1/2 pl-2 mb-3">
                        <InfoBlock label="Weight" value={member.healthInfo?.weight ? `${member.healthInfo.weight} kg` : null} />
                    </View>
                    <View className="w-1/2 pr-2 mb-3">
                        <InfoBlock label="Blood Type" value={member.healthInfo?.bloodType} />
                    </View>
                    <View className="w-1/2 pl-2 mb-3">
                        <InfoBlock label="BMI" value={bmi ? `${bmi} (${bmiCategory})` : null} />
                    </View>
                </View>
                <InfoBlock
                    label="Chronic Illness"
                    value={member.healthInfo?.chronicIllness}
                    capitalize
                />
                {member.healthInfo?.chronicIllnessDetails ? (
                    <Text className="text-gray-400 text-xs -mt-2 mb-3">
                        {member.healthInfo.chronicIllnessDetails}
                    </Text>
                ) : null}
                <InfoBlock
                    label="Allergies"
                    value={
                        member.healthInfo?.allergies?.length > 0
                            ? member.healthInfo.allergies.join(', ')
                            : member.healthInfo?.allergyDetails || 'None'
                    }
                />
                <InfoBlock
                    label="Regular Medication"
                    value={member.healthInfo?.regularMedication}
                    capitalize
                />
                {member.healthInfo?.medicationDetails ? (
                    <Text className="text-gray-400 text-xs -mt-2 mb-3">
                        {member.healthInfo.medicationDetails}
                    </Text>
                ) : null}
                {member.healthInfo?.medicalConditions?.length > 0 && (
                    <View className="mb-2">
                        <Text className="text-gray-400 text-xs mb-1">Medical Conditions</Text>
                        <View className="flex-row flex-wrap">
                            {member.healthInfo.medicalConditions.map((cond, idx) => (
                                <View
                                    key={idx}
                                    className="px-2.5 py-1 rounded-full mr-1 mb-1"
                                    style={{ backgroundColor: '#fee2e2' }}>
                                    <Text className="text-xs font-semibold" style={{ color: '#991b1b' }}>
                                        {cond}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </SectionCard>

            {/* Injury History */}
            <SectionCard title="Injury History" icon="alert-circle" iconColor="#f59e0b">
                <InfoBlock label="Major Injury" value={member.healthInfo?.majorInjury} capitalize />
                {member.healthInfo?.injuryDetails ? (
                    <Text className="text-gray-400 text-xs -mt-2 mb-3">
                        {member.healthInfo.injuryDetails}
                    </Text>
                ) : null}
                <InfoBlock label="Joint Injury" value={member.healthInfo?.jointInjury} capitalize />
                {member.healthInfo?.jointInjuryDetails ? (
                    <Text className="text-gray-400 text-xs -mt-2 mb-3">
                        {member.healthInfo.jointInjuryDetails}
                    </Text>
                ) : null}
                <InfoBlock label="Fracture History" value={member.healthInfo?.fractureHistory} capitalize />
                {member.healthInfo?.fractureDetails ? (
                    <Text className="text-gray-400 text-xs -mt-2 mb-3">
                        {member.healthInfo.fractureDetails}
                    </Text>
                ) : null}
                <InfoBlock label="Fainting Spells" value={member.healthInfo?.faintingSpells} capitalize />

                {member.healthInfo?.exerciseRestrictions ? (
                    <View className="p-3 rounded-xl mt-2" style={{ backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' }}>
                        <View className="flex-row items-center mb-1">
                            <Icon name="alert" size={14} color="#dc2626" />
                            <Text className="text-red-700 font-semibold text-xs ml-1">
                                Exercise Restrictions
                            </Text>
                        </View>
                        <Text className="text-red-600 text-xs">
                            {member.healthInfo.exerciseRestrictions}
                        </Text>
                    </View>
                ) : null}
            </SectionCard>

            {/* Emergency Contact */}
            <SectionCard title="Emergency Contact" icon="phone-alert" iconColor="#dc2626">
                {member.emergencyContact ? (
                    <View>
                        <InfoBlock label="Name" value={member.emergencyContact.name} />
                        <InfoBlock label="Phone" value={member.emergencyContact.phone} />
                        <InfoBlock label="Relationship" value={member.emergencyContact.relationship} />
                    </View>
                ) : (
                    <Text className="text-gray-400 text-sm">No emergency contact provided</Text>
                )}
            </SectionCard>
        </View>
    );
};

// ─── Fitness Assessment Tab ───
const FitnessTab = ({ member }) => (
    <View>
        <SectionCard title="Fitness Assessment" icon="arm-flex">
            <View className="flex-row flex-wrap mb-4">
                {[
                    { label: 'Fitness Level', value: member.fitnessLevel },
                    { label: 'Prior Training', value: member.priorTraining },
                    { label: 'Training Years', value: member.trainingYears },
                    { label: 'Competition Exp', value: member.competitionExperience },
                ].map((item, idx) => (
                    <View
                        key={idx}
                        className="w-1/2 p-1 mb-2">
                        <View className="bg-gray-50 rounded-xl p-3 items-center">
                            <Text className="text-gray-400 text-xs">{item.label}</Text>
                            <Text className="text-gray-900 font-bold text-base mt-1 capitalize">
                                {item.value || 'N/A'}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Health Goals */}
            {member.healthGoals?.length > 0 && (
                <View>
                    <Text className="text-gray-900 font-bold text-base mb-3">
                        Health Goals
                    </Text>
                    {member.healthGoals.map((goal, idx) => {
                        const goalName = typeof goal === 'object' ? goal.name : goal;
                        const goalProgress =
                            typeof goal === 'object' && goal.progress !== undefined
                                ? goal.progress
                                : null;
                        return (
                            <View
                                key={idx}
                                className="p-3 rounded-xl border border-gray-100 mb-2">
                                <View className="flex-row items-center justify-between mb-1">
                                    <Text className="text-gray-900 font-semibold text-sm">
                                        {goalName}
                                    </Text>
                                    {goalProgress !== null && (
                                        <Text className="text-gray-500 text-xs">{goalProgress}%</Text>
                                    )}
                                </View>
                                {goalProgress !== null && (
                                    <ProgressBar
                                        progress={goalProgress}
                                        total={100}
                                        showPercentage={false}
                                        height={6}
                                        color="bg-blue-500"
                                    />
                                )}
                            </View>
                        );
                    })}
                </View>
            )}
        </SectionCard>
    </View>
);

// ─── Personal Details Tab ───
const PersonalTab = ({ member }) => (
    <SectionCard title="Personal Information" icon="account-details">
        <InfoRow icon="account" label="Full Name" value={member.name} />
        <InfoRow icon="email" label="Email" value={member.email} />
        <InfoRow icon="phone" label="Phone" value={member.phone} />
        <InfoRow icon="gender-male-female" label="Gender" value={member.gender} />
        <InfoRow icon="cake-variant" label="Date of Birth" value={formatDate(member.dob)} />
        <InfoRow icon="map-marker" label="Address" value={member.address} />
        <InfoRow icon="calendar-arrow-right" label="Join Date" value={formatDate(member.joinDate)} />
        <InfoRow
            icon="calendar-clock"
            label="Membership Expiry"
            value={formatDate(member.membershipExpiry)}
        />
        {member.lastLogin && (
            <InfoRow
                icon="login"
                label="Last Login"
                value={formatDate(member.lastLogin)}
            />
        )}
    </SectionCard>
);

// ═══════════════════════════════════════════════
// ─── MAIN MEMBER PROFILE SCREEN ───
// ═══════════════════════════════════════════════
const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'attendance', label: 'Visits' },
    { key: 'training', label: 'Training' },
    { key: 'health', label: 'Health' },
    { key: 'fitness', label: 'Fitness' },
    { key: 'personal', label: 'Personal' },
];

const MemberProfileScreen = ({ route, navigation }) => {
    const { member } = route.params || {};
    const [activeTab, setActiveTab] = useState('overview');

    if (!member) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center px-6">
                <Icon name="account-alert" size={64} color="#d1d5db" />
                <Text className="text-gray-900 font-bold text-lg mt-4">
                    Member Not Found
                </Text>
                <Text className="text-gray-400 text-sm text-center mt-2">
                    This member could not be found or is not assigned to you.
                </Text>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                    className="mt-6">
                    <LinearGradient
                        colors={['#1e3a8a', '#3b82f6']}
                        className="px-6 py-3 rounded-xl">
                        <Text className="text-white font-bold text-sm">Go Back</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    }

    const statusStyle = getStatusStyle(member.status);
    const membershipStyle = getMembershipStyle(member.membershipType);
    const bmi = calculateBmi(member.healthInfo?.height, member.healthInfo?.weight);

    // Get mock data for this member
    const attendance = memberAttendance[member.id] || [];
    const trainingPlans = memberTrainingPlans[member.id] || [];
    const activePlan = trainingPlans.find(p => p.status === 'active') || null;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab member={member} bmi={bmi} activePlan={activePlan} />;
            case 'attendance':
                return <AttendanceTab attendance={attendance} />;
            case 'training':
                return <TrainingTab plans={trainingPlans} />;
            case 'health':
                return <HealthTab member={member} bmi={bmi} />;
            case 'fitness':
                return <FitnessTab member={member} />;
            case 'personal':
                return <PersonalTab member={member} />;
            default:
                return <OverviewTab member={member} bmi={bmi} activePlan={activePlan} />;
        }
    };

    return (
        <ScrollView className="flex-1 bg-gray-50">
            {/* ─── Header ─── */}
            <LinearGradient
                colors={['#1e3a8a', '#3b82f6']}
                className="px-6 pt-12 pb-12 rounded-b-[30px]">
                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                    className="w-10 h-10 bg-white/20 rounded-full justify-center items-center mb-4">
                    <Icon name="arrow-left" size={22} color="#fff" />
                </TouchableOpacity>

                {/* Profile Info */}
                <View className="items-center">
                    <ProfileAvatar name={member.name} size="xlarge" />
                    <Text className="text-white font-bold text-2xl mt-4">
                        {member.name}
                    </Text>
                    <View className="flex-row items-center mt-1">
                        <Icon name="email" size={14} color="rgba(255,255,255,0.7)" />
                        <Text className="text-white/70 text-sm ml-1">{member.email}</Text>
                    </View>
                    {member.phone && (
                        <View className="flex-row items-center mt-1">
                            <Icon name="phone" size={14} color="rgba(255,255,255,0.7)" />
                            <Text className="text-white/70 text-sm ml-1">{member.phone}</Text>
                        </View>
                    )}

                    {/* Badges */}
                    <View className="flex-row mt-3">
                        <View
                            className="px-4 py-2 rounded-full mr-2"
                            style={{ backgroundColor: membershipStyle.bg }}>
                            <Text
                                className="font-bold text-sm"
                                style={{ color: membershipStyle.text }}>
                                {member.membershipType || 'Basic'}
                            </Text>
                        </View>
                        <View
                            className="px-4 py-2 rounded-full"
                            style={{ backgroundColor: statusStyle.bg }}>
                            <Text
                                className="font-semibold text-sm"
                                style={{ color: statusStyle.text }}>
                                {statusStyle.label}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Quick Stats Row */}
                <View className="flex-row justify-between mt-6 bg-white/15 rounded-xl p-3">
                    <View className="items-center flex-1">
                        <Text className="text-white/60 text-xs">Member Since</Text>
                        <Text className="text-white font-bold text-sm mt-0.5">
                            {formatDate(member.joinDate)}
                        </Text>
                    </View>
                    <View className="w-px bg-white/20" />
                    <View className="items-center flex-1">
                        <Text className="text-white/60 text-xs">Total Visits</Text>
                        <Text className="text-white font-bold text-sm mt-0.5">
                            {member.stats?.totalVisits || 0}
                        </Text>
                    </View>
                    <View className="w-px bg-white/20" />
                    <View className="items-center flex-1">
                        <Text className="text-white/60 text-xs">This Month</Text>
                        <Text className="text-white font-bold text-sm mt-0.5 text-green-300">
                            {member.stats?.thisMonthVisits || 0}
                        </Text>
                    </View>
                    <View className="w-px bg-white/20" />
                    <View className="items-center flex-1">
                        <Text className="text-white/60 text-xs">Expiry</Text>
                        <Text className="text-white font-bold text-sm mt-0.5">
                            {formatDate(member.membershipExpiry)}
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            {/* ─── Tabs ─── */}
            <View className="px-4 pt-4">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-4">
                    {TABS.map(tab => (
                        <TabButton
                            key={tab.key}
                            label={tab.label}
                            isActive={activeTab === tab.key}
                            onPress={() => setActiveTab(tab.key)}
                        />
                    ))}
                </ScrollView>

                {/* ─── Tab Content ─── */}
                {renderTabContent()}
            </View>

            {/* Bottom Spacing */}
            <View className="h-8" />
        </ScrollView>
    );
};

export default MemberProfileScreen;