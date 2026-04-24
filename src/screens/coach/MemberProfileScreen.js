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
            return { bg: '#dcfce7', text: '#166534', label: 'Active', icon: 'check-circle' };
        case 'pending':
            return { bg: '#fef3c7', text: '#92400e', label: 'Pending', icon: 'clock-outline' };
        case 'expired':
        case 'suspended':
            return { bg: '#fee2e2', text: '#991b1b', label: status.charAt(0).toUpperCase() + status.slice(1), icon: 'alert-circle' };
        default:
            return { bg: '#f3f4f6', text: '#374151', label: status, icon: 'help-circle' };
    }
};

const getMembershipStyle = type => {
    switch (type) {
        case 'Platinum':
            return { bg: '#e0e7ff', text: '#3730a3', icon: 'diamond-stone', gradient: ['#6366f1', '#818cf8'] };
        case 'Gold':
            return { bg: '#fef3c7', text: '#92400e', icon: 'star', gradient: ['#f59e0b', '#fbbf24'] };
        case 'Silver':
            return { bg: '#f3f4f6', text: '#374151', icon: 'shield', gradient: ['#6b7280', '#9ca3af'] };
        case 'Basic':
            return { bg: '#e0f2fe', text: '#075985', icon: 'account', gradient: ['#0ea5e9', '#38bdf8'] };
        default:
            return { bg: '#f3f4f6', text: '#374151', icon: 'account', gradient: ['#6b7280', '#9ca3af'] };
    }
};

// ─── Sport Config ───
const getSportConfig = sport => {
    const configs = {
        Karate: { color: '#ef4444', icon: 'karate', gradient: ['#ef4444', '#f97316'] },
        Badminton: { color: '#22c55e', icon: 'badminton', gradient: ['#22c55e', '#10b981'] },
        Swimming: { color: '#3b82f6', icon: 'swim', gradient: ['#3b82f6', '#06b6d4'] },
        Boxing: { color: '#f59e0b', icon: 'boxing-glove', gradient: ['#f59e0b', '#ef4444'] },
        Weightlifting: { color: '#8b5cf6', icon: 'weight-lifter', gradient: ['#8b5cf6', '#6366f1'] },
        Yoga: { color: '#ec4899', icon: 'yoga', gradient: ['#ec4899', '#f472b6'] },
        Tennis: { color: '#06b6d4', icon: 'tennis', gradient: ['#06b6d4', '#22d3ee'] },
        default: { color: '#6b7280', icon: 'dumbbell', gradient: ['#6b7280', '#9ca3af'] },
    };
    return configs[sport] || configs.default;
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
            return { bg: '#dcfce7', text: '#166534', gradient: ['#22c55e', '#16a34a'] };
        case 'Underweight':
            return { bg: '#fef3c7', text: '#92400e', gradient: ['#f59e0b', '#d97706'] };
        case 'Overweight':
            return { bg: '#fed7aa', text: '#c2410c', gradient: ['#f97316', '#ea580c'] };
        case 'Obese':
            return { bg: '#fee2e2', text: '#991b1b', gradient: ['#ef4444', '#dc2626'] };
        default:
            return { bg: '#f3f4f6', text: '#374151', gradient: ['#6b7280', '#9ca3af'] };
    }
};

// ═══════════════════════════════════════════════
// ─── REUSABLE COMPONENTS ───
// ═══════════════════════════════════════════════

const InfoRow = ({ icon, label, value, iconColor = '#1e3a8a' }) => (
    <View className="flex-row items-center py-3.5 border-b border-gray-50">
        <View
            className="w-10 h-10 rounded-xl justify-center items-center"
            style={{ backgroundColor: `${iconColor}12` }}>
            <Icon name={icon} size={18} color={iconColor} />
        </View>
        <View className="flex-1 ml-3">
            <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">{label}</Text>
            <Text className="text-gray-900 font-semibold text-sm mt-0.5">{value || 'N/A'}</Text>
        </View>
    </View>
);

const SectionCard = ({ title, icon, iconColor = '#1e3a8a', children, rightAction }) => (
    <View
        className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
        style={{ elevation: 3 }}>
        <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
                <View
                    className="w-9 h-9 rounded-xl justify-center items-center mr-2.5"
                    style={{ backgroundColor: `${iconColor}12` }}>
                    <Icon name={icon} size={18} color={iconColor} />
                </View>
                <Text className="text-gray-900 font-bold text-lg">{title}</Text>
            </View>
            {rightAction}
        </View>
        {children}
    </View>
);

const InfoBlock = ({ label, value, capitalize = false }) => (
    <View className="mb-3">
        <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">{label}</Text>
        <Text
            className={`text-gray-900 font-semibold text-sm mt-0.5 ${capitalize ? 'capitalize' : ''}`}>
            {value || 'N/A'}
        </Text>
    </View>
);

// ─── Tab Button ───
const TabButton = ({ label, icon, isActive, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 16,
            marginRight: 8,
            marginBottom: 8,
            backgroundColor: isActive ? '#1e3a8a' : '#fff',
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: isActive ? 0 : 1,
            borderColor: '#e5e7eb',
            elevation: isActive ? 3 : 1,
            shadowColor: isActive ? '#1e3a8a' : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isActive ? 0.3 : 0.05,
            shadowRadius: 4,
        }}>
        <Icon
            name={icon}
            size={14}
            color={isActive ? '#fff' : '#9ca3af'}
            style={{ marginRight: 5 }}
        />
        <Text
            style={{
                fontSize: 12,
                fontWeight: '700',
                color: isActive ? '#fff' : '#6b7280',
            }}>
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
    const sportConfig = getSportConfig(member.sport);
    const attendanceRate = member.stats?.attendanceRate || 0;

    return (
        <View>
            {/* Quick Stats Grid */}
            <View className="flex-row flex-wrap mb-4" style={{ marginHorizontal: -4 }}>
                {[
                    {
                        label: 'This Month',
                        value: member.stats?.thisMonthVisits || 0,
                        suffix: ' visits',
                        icon: 'calendar-month',
                        color: '#3b82f6',
                        gradient: ['#3b82f6', '#60a5fa'],
                    },
                    {
                        label: 'Total Visits',
                        value: member.stats?.totalVisits || 0,
                        suffix: '',
                        icon: 'trending-up',
                        color: '#22c55e',
                        gradient: ['#22c55e', '#4ade80'],
                    },
                    {
                        label: 'Attendance',
                        value: `${attendanceRate}%`,
                        suffix: '',
                        icon: 'percent',
                        color: '#8b5cf6',
                        gradient: ['#8b5cf6', '#a78bfa'],
                    },
                    {
                        label: 'Streak',
                        value: member.stats?.streak || 0,
                        suffix: ' days',
                        icon: 'fire',
                        color: '#f59e0b',
                        gradient: ['#f59e0b', '#fbbf24'],
                    },
                ].map((stat, idx) => (
                    <View key={idx} style={{ width: '50%', padding: 4 }}>
                        <View
                            className="bg-white rounded-2xl p-4 shadow-sm"
                            style={{ elevation: 3 }}>
                            <View className="flex-row items-start justify-between">
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">
                                        {stat.label}
                                    </Text>
                                    <Text className="text-gray-900 font-bold text-2xl mt-1">
                                        {stat.value}
                                    </Text>
                                    {stat.suffix ? (
                                        <Text className="text-gray-400 text-[10px]">{stat.suffix}</Text>
                                    ) : null}
                                </View>
                                <LinearGradient
                                    colors={stat.gradient}
                                    style={{ width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                                    <Icon name={stat.icon} size={18} color="#fff" />
                                </LinearGradient>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* Training Plan Card */}
            <View
                className="bg-white rounded-2xl overflow-hidden mb-4 shadow-sm"
                style={{ elevation: 3 }}>
                <LinearGradient
                    colors={member.stats?.hasActivePlan ? ['#059669', '#22c55e'] : ['#6b7280', '#9ca3af']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ height: 3 }}
                />
                <View className="p-4">
                    <View className="flex-row items-start justify-between">
                        <View className="flex-1">
                            <View className="flex-row items-center mb-1">
                                <View
                                    className="w-8 h-8 rounded-lg justify-center items-center mr-2"
                                    style={{ backgroundColor: member.stats?.hasActivePlan ? '#dcfce7' : '#f3f4f6' }}>
                                    <Icon
                                        name="dumbbell"
                                        size={16}
                                        color={member.stats?.hasActivePlan ? '#22c55e' : '#9ca3af'}
                                    />
                                </View>
                                <Text className="text-gray-900 font-bold text-base">Training Plan</Text>
                            </View>
                            <Text className="text-gray-500 text-xs mt-1 ml-10">
                                {activePlan?.title || 'No active plan assigned'}
                            </Text>
                        </View>
                        <View
                            className="px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: member.stats?.hasActivePlan ? '#dcfce7' : '#f3f4f6' }}>
                            <Text
                                className="text-xs font-bold"
                                style={{ color: member.stats?.hasActivePlan ? '#166534' : '#6b7280' }}>
                                {member.stats?.hasActivePlan ? 'Active' : 'None'}
                            </Text>
                        </View>
                    </View>
                    {activePlan?.stats?.progressPercentage > 0 && (
                        <View className="mt-3 ml-10">
                            <View className="flex-row items-center justify-between mb-1.5">
                                <Text className="text-gray-400 text-[10px]">Progress</Text>
                                <Text className="text-gray-900 text-[10px] font-bold">{activePlan.stats.progressPercentage}%</Text>
                            </View>
                            <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <LinearGradient
                                    colors={['#22c55e', '#16a34a']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{
                                        height: '100%',
                                        width: `${Math.min(activePlan.stats.progressPercentage, 100)}%`,
                                        borderRadius: 999,
                                    }}
                                />
                            </View>
                        </View>
                    )}
                </View>
            </View>

            {/* BMI Card */}
            {bmi && (
                <SectionCard title="Body Mass Index" icon="scale-bathroom" iconColor="#8b5cf6">
                    <View className="flex-row items-center mb-4">
                        <View
                            className="w-20 h-20 rounded-2xl justify-center items-center mr-4"
                            style={{ backgroundColor: bmiColor.bg }}>
                            <Text className="font-bold text-2xl" style={{ color: bmiColor.text }}>
                                {bmi}
                            </Text>
                        </View>
                        <View className="flex-1">
                            <View
                                className="px-3 py-1.5 rounded-full self-start mb-2"
                                style={{ backgroundColor: bmiColor.bg }}>
                                <Text className="font-bold text-sm" style={{ color: bmiColor.text }}>
                                    {bmiCategory}
                                </Text>
                            </View>
                            <Text className="text-gray-400 text-xs">
                                {member.healthInfo?.height}cm • {member.healthInfo?.weight}kg
                            </Text>
                        </View>
                    </View>
                    <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <LinearGradient
                            colors={bmiColor.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                height: '100%',
                                width: `${Math.min((parseFloat(bmi) / 40) * 100, 100)}%`,
                                borderRadius: 999,
                            }}
                        />
                    </View>
                    <View className="flex-row justify-between mt-1.5">
                        <Text className="text-gray-400 text-[10px]">{'<18.5'}</Text>
                        <Text className="text-gray-400 text-[10px]">18.5-25</Text>
                        <Text className="text-gray-400 text-[10px]">25-30</Text>
                        <Text className="text-gray-400 text-[10px]">{'>30'}</Text>
                    </View>
                </SectionCard>
            )}

            {/* Accessible Sports */}
            {member.accessibleSports && member.accessibleSports.length > 0 && (
                <SectionCard title="Accessible Sports" icon="run" iconColor="#22c55e">
                    <View className="flex-row flex-wrap">
                        {member.accessibleSports.map((sport, index) => {
                            const sportName = typeof sport === 'object' ? sport.sportName : sport;
                            const config = getSportConfig(sportName);
                            return (
                                <View
                                    key={index}
                                    className="flex-row items-center px-3 py-2 rounded-xl mr-2 mb-2"
                                    style={{ backgroundColor: `${config.color}10`, borderWidth: 1, borderColor: `${config.color}20` }}>
                                    <Icon name={config.icon} size={14} color={config.color} />
                                    <Text
                                        className="text-sm font-semibold ml-1.5"
                                        style={{ color: config.color }}>
                                        {sportName}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </SectionCard>
            )}
        </View>
    );
};

// ─── Attendance Tab ───
const AttendanceTab = ({ attendance, member }) => {
    const sportConfig = getSportConfig(member?.sport);

    return (
        <SectionCard title="Recent Visit History" icon="history" iconColor="#3b82f6">
            {attendance.length > 0 ? (
                attendance.map((record, index) => {
                    const isCompleted = record.status === 'completed';
                    return (
                        <View key={record._id || index} className="flex-row mb-3">
                            {/* Timeline */}
                            <View className="items-center mr-3" style={{ width: 36 }}>
                                <View
                                    className="w-9 h-9 rounded-full justify-center items-center"
                                    style={{ backgroundColor: isCompleted ? '#dcfce7' : '#f3f4f6' }}>
                                    <Icon
                                        name={isCompleted ? 'check-circle' : 'clock-outline'}
                                        size={16}
                                        color={isCompleted ? '#22c55e' : '#9ca3af'}
                                    />
                                </View>
                                {index < attendance.length - 1 && (
                                    <View
                                        style={{
                                            width: 2,
                                            flex: 1,
                                            backgroundColor: '#e5e7eb',
                                            marginTop: 4,
                                            minHeight: 16,
                                        }}
                                    />
                                )}
                            </View>

                            {/* Content */}
                            <View
                                className="flex-1 bg-gray-50 rounded-xl p-3.5"
                                style={{ borderLeftWidth: 3, borderLeftColor: isCompleted ? '#22c55e' : '#e5e7eb' }}>
                                <View className="flex-row items-center justify-between mb-1.5">
                                    <Text className="text-gray-900 font-bold text-sm">
                                        {formatDate(record.date)}
                                    </Text>
                                    <View
                                        className="px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: isCompleted ? '#dcfce7' : '#f3f4f6' }}>
                                        <Text
                                            className="text-[10px] font-bold capitalize"
                                            style={{ color: isCompleted ? '#166534' : '#6b7280' }}>
                                            {record.status || 'recorded'}
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex-row flex-wrap items-center">
                                    {record.punchInTime && (
                                        <View className="flex-row items-center mr-3 mb-1">
                                            <Icon name="login" size={11} color="#22c55e" />
                                            <Text className="text-gray-500 text-[11px] ml-1">
                                                {formatTime(record.punchInTime)}
                                            </Text>
                                        </View>
                                    )}
                                    {record.punchOutTime && (
                                        <View className="flex-row items-center mr-3 mb-1">
                                            <Icon name="logout" size={11} color="#ef4444" />
                                            <Text className="text-gray-500 text-[11px] ml-1">
                                                {formatTime(record.punchOutTime)}
                                            </Text>
                                        </View>
                                    )}
                                    {record.facility && (
                                        <View className="flex-row items-center mr-3 mb-1">
                                            <Icon name="map-marker" size={11} color="#8b5cf6" />
                                            <Text className="text-gray-500 text-[11px] ml-1">
                                                {record.facility}
                                            </Text>
                                        </View>
                                    )}
                                    {record.duration > 0 && (
                                        <View className="flex-row items-center mb-1">
                                            <Icon name="timer-outline" size={11} color="#f59e0b" />
                                            <Text className="text-gray-500 text-[11px] ml-1">
                                                {record.duration} min
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    );
                })
            ) : (
                <View className="items-center py-10">
                    <View className="w-20 h-20 rounded-full bg-gray-50 justify-center items-center mb-3">
                        <Icon name="calendar-blank" size={40} color="#d1d5db" />
                    </View>
                    <Text className="text-gray-900 font-bold text-base">No Records</Text>
                    <Text className="text-gray-400 mt-1 text-sm">
                        No attendance records found
                    </Text>
                </View>
            )}
        </SectionCard>
    );
};

// ─── Training Plans Tab ───
const TrainingTab = ({ plans }) => (
    <SectionCard title="Training Plans" icon="dumbbell" iconColor="#f59e0b">
        {plans.length > 0 ? (
            plans.map((plan, index) => {
                const isActive = plan.status === 'active';
                const isCompleted = plan.status === 'completed';
                const statusColor = isActive
                    ? { bg: '#dcfce7', text: '#166534', gradient: ['#22c55e', '#16a34a'] }
                    : isCompleted
                        ? { bg: '#dbeafe', text: '#1e40af', gradient: ['#3b82f6', '#60a5fa'] }
                        : { bg: '#f3f4f6', text: '#374151', gradient: ['#6b7280', '#9ca3af'] };

                return (
                    <View
                        key={plan._id || index}
                        className="bg-gray-50 rounded-2xl overflow-hidden mb-3"
                        style={{ borderLeftWidth: 4, borderLeftColor: isActive ? '#22c55e' : isCompleted ? '#3b82f6' : '#e5e7eb' }}>
                        <View className="p-4">
                            <View className="flex-row items-start justify-between mb-2">
                                <View className="flex-1 mr-2">
                                    <Text className="text-gray-900 font-bold text-sm">
                                        {plan.title || plan.name || 'Training Plan'}
                                    </Text>
                                    {plan.description && (
                                        <Text className="text-gray-400 text-xs mt-1" numberOfLines={2}>
                                            {plan.description}
                                        </Text>
                                    )}
                                </View>
                                <View
                                    className="px-2.5 py-1 rounded-full flex-row items-center"
                                    style={{ backgroundColor: statusColor.bg }}>
                                    <Icon
                                        name={isActive ? 'play-circle' : isCompleted ? 'check-circle' : 'pause-circle'}
                                        size={10}
                                        color={statusColor.text}
                                    />
                                    <Text
                                        className="text-[10px] font-bold capitalize ml-1"
                                        style={{ color: statusColor.text }}>
                                        {plan.status}
                                    </Text>
                                </View>
                            </View>

                            {/* Plan Details */}
                            <View className="flex-row flex-wrap mb-2">
                                <View className="flex-row items-center mr-4 mb-1">
                                    <Icon name="run" size={12} color="#9ca3af" />
                                    <Text className="text-gray-500 text-xs ml-1">{plan.sport || 'N/A'}</Text>
                                </View>
                                <View className="flex-row items-center mr-4 mb-1">
                                    <Icon name="clock-outline" size={12} color="#9ca3af" />
                                    <Text className="text-gray-500 text-xs ml-1">{plan.duration} weeks</Text>
                                </View>
                            </View>

                            <View className="flex-row flex-wrap mb-2">
                                <View className="flex-row items-center mr-4 mb-1">
                                    <Icon name="calendar-start" size={12} color="#22c55e" />
                                    <Text className="text-gray-500 text-xs ml-1">{formatDate(plan.startDate)}</Text>
                                </View>
                                <View className="flex-row items-center mb-1">
                                    <Icon name="calendar-end" size={12} color="#ef4444" />
                                    <Text className="text-gray-500 text-xs ml-1">{formatDate(plan.endDate)}</Text>
                                </View>
                            </View>

                            {/* Goals */}
                            {plan.goals?.length > 0 && (
                                <View className="flex-row flex-wrap mb-2">
                                    {plan.goals.map((goal, idx) => (
                                        <View
                                            key={idx}
                                            className="flex-row items-center px-2.5 py-1 rounded-full mr-1.5 mb-1"
                                            style={{ backgroundColor: '#e0f2fe' }}>
                                            <Icon name="target" size={9} color="#0284c7" />
                                            <Text className="text-[10px] font-semibold ml-1" style={{ color: '#0284c7' }}>
                                                {goal}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Progress */}
                            {plan.stats?.progressPercentage > 0 && (
                                <View className="mt-2">
                                    <View className="flex-row items-center justify-between mb-1.5">
                                        <Text className="text-gray-400 text-[10px] font-medium">Progress</Text>
                                        <Text className="text-gray-900 text-xs font-bold">
                                            {plan.stats.progressPercentage}%
                                        </Text>
                                    </View>
                                    <View className="h-2 bg-white rounded-full overflow-hidden">
                                        <LinearGradient
                                            colors={statusColor.gradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={{
                                                height: '100%',
                                                width: `${Math.min(plan.stats.progressPercentage, 100)}%`,
                                                borderRadius: 999,
                                            }}
                                        />
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                );
            })
        ) : (
            <View className="items-center py-10">
                <View className="w-20 h-20 rounded-full bg-gray-50 justify-center items-center mb-3">
                    <Icon name="dumbbell" size={40} color="#d1d5db" />
                </View>
                <Text className="text-gray-900 font-bold text-base">No Plans</Text>
                <Text className="text-gray-400 mt-1 text-sm">
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
                    {[
                        { label: 'Height', value: member.healthInfo?.height ? `${member.healthInfo.height} cm` : null, icon: 'human-male-height', color: '#3b82f6' },
                        { label: 'Weight', value: member.healthInfo?.weight ? `${member.healthInfo.weight} kg` : null, icon: 'weight-kilogram', color: '#22c55e' },
                        { label: 'Blood Type', value: member.healthInfo?.bloodType, icon: 'water', color: '#ef4444' },
                        { label: 'BMI', value: bmi ? `${bmi} (${bmiCategory})` : null, icon: 'scale-bathroom', color: '#8b5cf6' },
                    ].map((item, idx) => (
                        <View key={idx} style={{ width: '50%', padding: 4, marginBottom: 4 }}>
                            <View className="bg-gray-50 rounded-xl p-3">
                                <View className="flex-row items-center mb-1.5">
                                    <Icon name={item.icon} size={14} color={item.color} />
                                    <Text className="text-gray-400 text-[10px] font-medium ml-1.5 uppercase tracking-wider">{item.label}</Text>
                                </View>
                                <Text className="text-gray-900 font-bold text-sm">{item.value || 'N/A'}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View className="mt-2">
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
                            <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider mb-1.5">Medical Conditions</Text>
                            <View className="flex-row flex-wrap">
                                {member.healthInfo.medicalConditions.map((cond, idx) => (
                                    <View
                                        key={idx}
                                        className="flex-row items-center px-2.5 py-1.5 rounded-full mr-1.5 mb-1"
                                        style={{ backgroundColor: '#fee2e2' }}>
                                        <Icon name="alert-circle" size={10} color="#991b1b" />
                                        <Text className="text-xs font-semibold ml-1" style={{ color: '#991b1b' }}>
                                            {cond}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
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
                    <LinearGradient
                        colors={['#fef2f2', '#fee2e2']}
                        style={{ borderRadius: 12, padding: 12, marginTop: 8, borderWidth: 1, borderColor: '#fecaca' }}>
                        <View className="flex-row items-center mb-1.5">
                            <Icon name="alert" size={14} color="#dc2626" />
                            <Text className="text-red-700 font-bold text-xs ml-1.5">
                                Exercise Restrictions
                            </Text>
                        </View>
                        <Text className="text-red-600 text-xs leading-4">
                            {member.healthInfo.exerciseRestrictions}
                        </Text>
                    </LinearGradient>
                ) : null}
            </SectionCard>

            {/* Emergency Contact */}
            <SectionCard title="Emergency Contact" icon="phone-alert" iconColor="#dc2626">
                {member.emergencyContact ? (
                    <View className="bg-red-50 rounded-xl p-4" style={{ borderWidth: 1, borderColor: '#fecaca' }}>
                        <InfoRow icon="account" label="Name" value={member.emergencyContact.name} iconColor="#dc2626" />
                        <InfoRow icon="phone" label="Phone" value={member.emergencyContact.phone} iconColor="#dc2626" />
                        <InfoRow icon="heart" label="Relationship" value={member.emergencyContact.relationship} iconColor="#dc2626" />
                    </View>
                ) : (
                    <View className="items-center py-6">
                        <Icon name="phone-off" size={32} color="#d1d5db" />
                        <Text className="text-gray-400 text-sm mt-2">No emergency contact provided</Text>
                    </View>
                )}
            </SectionCard>
        </View>
    );
};

// ─── Fitness Assessment Tab ───
const FitnessTab = ({ member }) => (
    <View>
        <SectionCard title="Fitness Assessment" icon="arm-flex" iconColor="#8b5cf6">
            <View className="flex-row flex-wrap mb-4" style={{ marginHorizontal: -4 }}>
                {[
                    { label: 'Fitness Level', value: member.fitnessLevel, icon: 'speedometer', color: '#3b82f6' },
                    { label: 'Prior Training', value: member.priorTraining, icon: 'history', color: '#22c55e' },
                    { label: 'Training Years', value: member.trainingYears, icon: 'calendar-clock', color: '#f59e0b' },
                    { label: 'Competition', value: member.competitionExperience, icon: 'trophy', color: '#8b5cf6' },
                ].map((item, idx) => (
                    <View key={idx} style={{ width: '50%', padding: 4 }}>
                        <View className="bg-gray-50 rounded-xl p-3.5 items-center">
                            <LinearGradient
                                colors={[`${item.color}20`, `${item.color}10`]}
                                style={{ width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                                <Icon name={item.icon} size={18} color={item.color} />
                            </LinearGradient>
                            <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">{item.label}</Text>
                            <Text className="text-gray-900 font-bold text-sm mt-1 capitalize">
                                {item.value || 'N/A'}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Health Goals */}
            {member.healthGoals?.length > 0 && (
                <View>
                    <View className="flex-row items-center mb-3">
                        <View className="w-8 h-8 rounded-lg justify-center items-center mr-2" style={{ backgroundColor: '#fef3c7' }}>
                            <Icon name="target" size={16} color="#f59e0b" />
                        </View>
                        <Text className="text-gray-900 font-bold text-base">Health Goals</Text>
                    </View>
                    {member.healthGoals.map((goal, idx) => {
                        const goalName = typeof goal === 'object' ? goal.name : goal;
                        const goalProgress =
                            typeof goal === 'object' && goal.progress !== undefined
                                ? goal.progress
                                : null;
                        const progressColor = goalProgress >= 75 ? ['#22c55e', '#16a34a'] : goalProgress >= 50 ? ['#f59e0b', '#d97706'] : ['#3b82f6', '#60a5fa'];

                        return (
                            <View
                                key={idx}
                                className="bg-gray-50 rounded-xl p-3.5 mb-2">
                                <View className="flex-row items-center justify-between mb-2">
                                    <View className="flex-row items-center flex-1">
                                        <Icon name="flag-checkered" size={14} color="#6b7280" />
                                        <Text className="text-gray-900 font-semibold text-sm ml-2">
                                            {goalName}
                                        </Text>
                                    </View>
                                    {goalProgress !== null && (
                                        <View
                                            className="px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: goalProgress >= 75 ? '#dcfce7' : goalProgress >= 50 ? '#fef3c7' : '#dbeafe' }}>
                                            <Text
                                                className="text-xs font-bold"
                                                style={{ color: goalProgress >= 75 ? '#166534' : goalProgress >= 50 ? '#92400e' : '#1e40af' }}>
                                                {goalProgress}%
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                {goalProgress !== null && (
                                    <View className="h-2 bg-white rounded-full overflow-hidden">
                                        <LinearGradient
                                            colors={progressColor}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={{
                                                height: '100%',
                                                width: `${Math.min(goalProgress, 100)}%`,
                                                borderRadius: 999,
                                            }}
                                        />
                                    </View>
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
    <SectionCard title="Personal Information" icon="account-details" iconColor="#1e3a8a">
        <InfoRow icon="account" label="Full Name" value={member.name} />
        <InfoRow icon="email" label="Email" value={member.email} iconColor="#3b82f6" />
        <InfoRow icon="phone" label="Phone" value={member.phone} iconColor="#22c55e" />
        <InfoRow icon="gender-male-female" label="Gender" value={member.gender} iconColor="#8b5cf6" />
        <InfoRow icon="cake-variant" label="Date of Birth" value={formatDate(member.dob)} iconColor="#ec4899" />
        <InfoRow icon="map-marker" label="Address" value={member.address} iconColor="#f59e0b" />
        <InfoRow icon="calendar-arrow-right" label="Join Date" value={formatDate(member.joinDate)} iconColor="#06b6d4" />
        <InfoRow
            icon="calendar-clock"
            label="Membership Expiry"
            value={formatDate(member.membershipExpiry)}
            iconColor="#ef4444"
        />
        {member.lastLogin && (
            <InfoRow
                icon="login"
                label="Last Login"
                value={formatDate(member.lastLogin)}
                iconColor="#6b7280"
            />
        )}
    </SectionCard>
);

// ═══════════════════════════════════════════════
// ─── MAIN MEMBER PROFILE SCREEN ───
// ═══════════════════════════════════════════════
const TABS = [
    { key: 'overview', label: 'Overview', icon: 'view-dashboard' },
    { key: 'attendance', label: 'Visits', icon: 'calendar-check' },
    { key: 'training', label: 'Training', icon: 'dumbbell' },
    { key: 'health', label: 'Health', icon: 'heart-pulse' },
    { key: 'fitness', label: 'Fitness', icon: 'arm-flex' },
    { key: 'personal', label: 'Personal', icon: 'account-details' },
];

const MemberProfileScreen = ({ route, navigation }) => {
    const { member } = route.params || {};
    const [activeTab, setActiveTab] = useState('overview');

    if (!member) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center px-6">
                <View className="w-24 h-24 rounded-full bg-gray-100 justify-center items-center mb-4">
                    <Icon name="account-alert" size={48} color="#d1d5db" />
                </View>
                <Text className="text-gray-900 font-bold text-lg mt-2">
                    Member Not Found
                </Text>
                <Text className="text-gray-400 text-sm text-center mt-2 leading-5">
                    This member could not be found or is not assigned to you.
                </Text>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                    className="mt-6">
                    <LinearGradient
                        colors={['#1e3a8a', '#3b82f6']}
                        style={{ borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="arrow-left" size={16} color="#fff" />
                        <Text className="text-white font-bold text-sm ml-2">Go Back</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    }

    const statusStyle = getStatusStyle(member.status);
    const membershipStyle = getMembershipStyle(member.membershipType);
    const sportConfig = getSportConfig(member.sport);
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
                return <AttendanceTab attendance={attendance} member={member} />;
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
        <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
            {/* ═══════════════════════════════════════════════ */}
            {/* ─── HEADER ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <LinearGradient
                colors={['#0f172a', '#1e3a8a', '#3b82f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingTop: 48, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
                {/* Top Bar */}
                <View className="flex-row justify-between items-center px-5 mb-5">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                        className="w-10 h-10 bg-white/15 rounded-full justify-center items-center">
                        <Icon name="arrow-left" size={22} color="#fff" />
                    </TouchableOpacity>
                    <Text className="text-white font-bold text-lg">Member Profile</Text>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        className="w-10 h-10 bg-white/15 rounded-full justify-center items-center">
                        <Icon name="dots-vertical" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Profile Info */}
                <View className="items-center px-5">
                    <View style={{ borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 72, padding: 3 }}>
                        <ProfileAvatar name={member.name} size="xlarge" />
                    </View>

                    {/* Sport Badge on Avatar */}
                    <View
                        className="absolute justify-center items-center"
                        style={{
                            bottom: -8,
                            alignSelf: 'center',
                        }}>
                    </View>

                    <Text className="text-white font-bold text-2xl mt-4">
                        {member.name}
                    </Text>

                    <View className="flex-row items-center mt-1.5">
                        <Icon name="email-outline" size={14} color="rgba(255,255,255,0.6)" />
                        <Text className="text-white/60 text-sm ml-1.5">{member.email}</Text>
                    </View>
                    {member.phone && (
                        <View className="flex-row items-center mt-1">
                            <Icon name="phone-outline" size={14} color="rgba(255,255,255,0.6)" />
                            <Text className="text-white/60 text-sm ml-1.5">{member.phone}</Text>
                        </View>
                    )}

                    {/* Badges Row */}
                    <View className="flex-row mt-3.5" style={{ gap: 8 }}>
                        <View
                            className="flex-row items-center px-3.5 py-2 rounded-full"
                            style={{ backgroundColor: membershipStyle.bg }}>
                            <Icon name={membershipStyle.icon} size={12} color={membershipStyle.text} />
                            <Text
                                className="font-bold text-xs ml-1.5"
                                style={{ color: membershipStyle.text }}>
                                {member.membershipType || 'Basic'}
                            </Text>
                        </View>
                        <View
                            className="flex-row items-center px-3.5 py-2 rounded-full"
                            style={{ backgroundColor: statusStyle.bg }}>
                            <Icon name={statusStyle.icon} size={12} color={statusStyle.text} />
                            <Text
                                className="font-bold text-xs ml-1.5"
                                style={{ color: statusStyle.text }}>
                                {statusStyle.label}
                            </Text>
                        </View>
                        <View
                            className="flex-row items-center px-3.5 py-2 rounded-full"
                            style={{ backgroundColor: `${sportConfig.color}20` }}>
                            <Icon name={sportConfig.icon} size={12} color={sportConfig.color} />
                            <Text
                                className="font-bold text-xs ml-1.5"
                                style={{ color: sportConfig.color }}>
                                {member.sport}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Quick Stats Bar */}
                <View
                    className="mx-5 mt-5 bg-white/10 rounded-2xl p-4"
                    style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                    <View className="flex-row items-center justify-between">
                        <View className="items-center flex-1">
                            <View className="w-10 h-10 bg-blue-400/20 rounded-xl justify-center items-center mb-1.5">
                                <Icon name="calendar-arrow-right" size={18} color="#93c5fd" />
                            </View>
                            <Text className="text-white font-bold text-xs">
                                {formatDate(member.joinDate)}
                            </Text>
                            <Text className="text-white/40 text-[10px] mt-0.5">Member Since</Text>
                        </View>
                        <View className="w-px h-12 bg-white/10" />
                        <View className="items-center flex-1">
                            <View className="w-10 h-10 bg-green-400/20 rounded-xl justify-center items-center mb-1.5">
                                <Icon name="map-marker-check" size={18} color="#86efac" />
                            </View>
                            <Text className="text-white font-bold text-xs">
                                {member.stats?.totalVisits || 0}
                            </Text>
                            <Text className="text-white/40 text-[10px] mt-0.5">Total Visits</Text>
                        </View>
                        <View className="w-px h-12 bg-white/10" />
                        <View className="items-center flex-1">
                            <View className="w-10 h-10 bg-yellow-400/20 rounded-xl justify-center items-center mb-1.5">
                                <Icon name="fire" size={18} color="#fbbf24" />
                            </View>
                            <Text className="text-white font-bold text-xs text-green-300">
                                {member.stats?.thisMonthVisits || 0}
                            </Text>
                            <Text className="text-white/40 text-[10px] mt-0.5">This Month</Text>
                        </View>
                        <View className="w-px h-12 bg-white/10" />
                        <View className="items-center flex-1">
                            <View className="w-10 h-10 bg-red-400/20 rounded-xl justify-center items-center mb-1.5">
                                <Icon name="calendar-clock" size={18} color="#fca5a5" />
                            </View>
                            <Text className="text-white font-bold text-xs">
                                {formatDate(member.membershipExpiry)}
                            </Text>
                            <Text className="text-white/40 text-[10px] mt-0.5">Expiry</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── TABS ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 pt-5">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-4">
                    {TABS.map(tab => (
                        <TabButton
                            key={tab.key}
                            label={tab.label}
                            icon={tab.icon}
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