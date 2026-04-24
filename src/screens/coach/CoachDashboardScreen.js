import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ProfileAvatar from '../../components/ProfileAvatar';
import DrawerMenuButton from '../../components/DrawerMenuButton';
import { coachProfile } from '../../data/user';
import { sessions } from '../../data/sessions';
import { members } from '../../data/members';
import { MOCK_ANNOUNCEMENTS } from '../../data/announcements';
import { coachSelfAttendanceStats } from '../../data/attendance';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Mock Dashboard Data ───
const MOCK_RECENT_ACTIVITY = [
    {
        id: 'a1',
        member: 'John Smith',
        activity: 'Completed Karate session',
        status: 'completed',
        time: '2026-03-13T09:30:00Z',
        sport: 'Karate',
    },
    {
        id: 'a2',
        member: 'Emily Davis',
        activity: 'Attended Badminton practice',
        status: 'present',
        time: '2026-03-13T14:00:00Z',
        sport: 'Badminton',
    },
    {
        id: 'a3',
        member: 'Jessica Wilson',
        activity: 'Boxing training in progress',
        status: 'active',
        time: '2026-03-13T18:00:00Z',
        sport: 'Boxing',
    },
    {
        id: 'a4',
        member: 'David Martinez',
        activity: 'Missed Weightlifting session',
        status: 'absent',
        time: '2026-03-12T17:00:00Z',
        sport: 'Weightlifting',
    },
    {
        id: 'a5',
        member: 'Michael Brown',
        activity: 'Swimming session completed',
        status: 'completed',
        time: '2026-03-12T07:00:00Z',
        sport: 'Swimming',
    },
];

// ─── Helper Functions ───
const formatDate = dateStr => {
    if (!dateStr) {
        return 'N/A';
    }
    return new Date(dateStr).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const formatTime = dateStr => {
    if (!dateStr) {
        return '';
    }
    return new Date(dateStr).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) { return 'Good Morning'; }
    if (hour < 17) { return 'Good Afternoon'; }
    return 'Good Evening';
};

const getStatusConfig = status => {
    switch (status) {
        case 'completed':
            return { bg: '#dcfce7', text: '#166534', icon: 'check-circle', iconColor: '#22c55e' };
        case 'present':
            return { bg: '#dbeafe', text: '#1e40af', icon: 'account-check', iconColor: '#3b82f6' };
        case 'active':
            return { bg: '#fef3c7', text: '#92400e', icon: 'lightning-bolt', iconColor: '#f59e0b' };
        case 'absent':
            return { bg: '#fee2e2', text: '#991b1b', icon: 'account-remove', iconColor: '#ef4444' };
        default:
            return { bg: '#f3f4f6', text: '#374151', icon: 'help-circle', iconColor: '#6b7280' };
    }
};

const getSportColor = sport => {
    const colors = {
        Karate: { primary: '#ef4444', gradient: ['#ef4444', '#f97316'] },
        Badminton: { primary: '#22c55e', gradient: ['#22c55e', '#10b981'] },
        Swimming: { primary: '#3b82f6', gradient: ['#3b82f6', '#06b6d4'] },
        Boxing: { primary: '#f59e0b', gradient: ['#f59e0b', '#ef4444'] },
        Weightlifting: { primary: '#8b5cf6', gradient: ['#8b5cf6', '#6366f1'] },
        Yoga: { primary: '#ec4899', gradient: ['#ec4899', '#f472b6'] },
        default: { primary: '#6b7280', gradient: ['#6b7280', '#9ca3af'] },
    };
    return colors[sport] || colors.default;
};

const getSportIcon = sport => {
    const icons = {
        Karate: 'karate',
        Badminton: 'badminton',
        Swimming: 'swim',
        Boxing: 'boxing-glove',
        Weightlifting: 'weight-lifter',
        Yoga: 'yoga',
        default: 'dumbbell',
    };
    return icons[sport] || icons.default;
};

const getPriorityConfig = priority => {
    switch (priority) {
        case 'urgent':
            return { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5', icon: 'alert-circle', gradient: ['#fee2e2', '#fecaca'] };
        case 'high':
            return { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa', icon: 'alert', gradient: ['#fff7ed', '#fed7aa'] };
        case 'medium':
            return { bg: '#fefce8', text: '#ca8a04', border: '#fde68a', icon: 'information', gradient: ['#fefce8', '#fef08a'] };
        case 'low':
            return { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', icon: 'information-outline', gradient: ['#f0fdf4', '#dcfce7'] };
        default:
            return { bg: '#f9fafb', text: '#6b7280', border: '#e5e7eb', icon: 'information-outline', gradient: ['#f9fafb', '#f3f4f6'] };
    }
};

// ═══════════════════════════════════════════════
// ─── ENHANCED ACTIVITY ITEM ───
// ═══════════════════════════════════════════════
const ActivityItem = ({ activity, isLast }) => {
    const statusConfig = getStatusConfig(activity.status);
    const sportColor = getSportColor(activity.sport);

    return (
        <View className={`flex-row ${!isLast ? 'mb-3' : ''}`}>
            {/* Timeline Line */}
            <View className="items-center mr-3" style={{ width: 40 }}>
                <View
                    className="w-10 h-10 rounded-full justify-center items-center"
                    style={{ backgroundColor: `${sportColor.primary}15` }}>
                    <Icon name={getSportIcon(activity.sport)} size={18} color={sportColor.primary} />
                </View>
                {!isLast && (
                    <View
                        className="flex-1"
                        style={{
                            width: 2,
                            backgroundColor: '#e5e7eb',
                            marginTop: 4,
                            minHeight: 20,
                        }}
                    />
                )}
            </View>

            {/* Content Card */}
            <View
                className="flex-1 bg-white rounded-2xl p-3.5 shadow-sm"
                style={{
                    elevation: 2,
                    borderLeftWidth: 3,
                    borderLeftColor: sportColor.primary,
                }}>
                <View className="flex-row items-start justify-between">
                    <View className="flex-1 mr-2">
                        <Text className="text-gray-900 font-bold text-sm" numberOfLines={1}>
                            {activity.member || 'Unknown'}
                        </Text>
                        <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
                            {activity.activity || 'Activity'}
                        </Text>
                    </View>
                    <View className="items-end">
                        <View
                            className="px-2.5 py-1 rounded-full flex-row items-center"
                            style={{ backgroundColor: statusConfig.bg }}>
                            <Icon name={statusConfig.icon} size={12} color={statusConfig.text} />
                            <Text
                                className="text-[10px] font-bold capitalize ml-1"
                                style={{ color: statusConfig.text }}>
                                {activity.status || 'N/A'}
                            </Text>
                        </View>
                        <Text className="text-gray-400 text-[10px] mt-1.5">
                            {activity.time ? formatTime(activity.time) : 'N/A'}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

// ═══════════════════════════════════════════════
// ─── ENHANCED SESSION ITEM ───
// ═══════════════════════════════════════════════
const SessionItem = ({ session }) => {
    const dateObj = session.date ? new Date(session.date) : null;
    const sportColor = getSportColor(session.sport || session.sportName);
    const slotsPercentage = session.maxSlots > 0
        ? (session.bookedSlots / session.maxSlots) * 100
        : 0;
    const isAlmostFull = slotsPercentage >= 80;

    return (
        <View
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
            style={{ elevation: 2 }}>
            <View className="flex-row items-center">
                {/* Sport Icon Badge */}
                <LinearGradient
                    colors={sportColor.gradient}
                    className="w-14 h-14 rounded-2xl justify-center items-center"
                    style={{ borderRadius: 16 }}>
                    <Icon name={getSportIcon(session.sport || session.sportName)} size={24} color="#fff" />
                </LinearGradient>

                {/* Session Info */}
                <View className="flex-1 ml-3">
                    <Text className="text-gray-900 font-bold text-sm" numberOfLines={1}>
                        {session.sportName || session.sport || session.title}
                    </Text>
                    <View className="flex-row items-center mt-1">
                        <Icon name="clock-outline" size={12} color="#9ca3af" />
                        <Text className="text-gray-500 text-xs ml-1">
                            {session.time}
                        </Text>
                        <View className="w-1 h-1 rounded-full bg-gray-300 mx-2" />
                        <Icon name="map-marker-outline" size={12} color="#9ca3af" />
                        <Text className="text-gray-500 text-xs ml-1" numberOfLines={1}>
                            {session.location || 'TBD'}
                        </Text>
                    </View>
                    {/* Slots Progress Bar */}
                    <View className="mt-2">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-gray-400 text-[10px]">
                                {session.bookedSlots}/{session.maxSlots} slots filled
                            </Text>
                            {isAlmostFull && (
                                <Text className="text-orange-500 text-[10px] font-bold">Almost Full</Text>
                            )}
                        </View>
                        <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <View
                                className="h-full rounded-full"
                                style={{
                                    width: `${Math.min(slotsPercentage, 100)}%`,
                                    backgroundColor: isAlmostFull ? '#f59e0b' : sportColor.primary,
                                }}
                            />
                        </View>
                    </View>
                </View>

                {/* Date Badge */}
                <View className="items-center ml-2 bg-gray-50 rounded-xl px-3 py-2">
                    <Text className="text-gray-900 font-bold text-lg leading-tight">
                        {dateObj ? dateObj.getDate() : '--'}
                    </Text>
                    <Text className="text-gray-500 text-[10px] font-semibold uppercase">
                        {dateObj
                            ? dateObj.toLocaleDateString('en-IN', { month: 'short' })
                            : ''}
                    </Text>
                </View>
            </View>
        </View>
    );
};

// ═══════════════════════════════════════════════
// ─── ENHANCED ANNOUNCEMENT ITEM ───
// ═══════════════════════════════════════════════
const AnnouncementItem = ({ announcement }) => {
    const priorityConfig = getPriorityConfig(announcement.priority);

    return (
        <View
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm overflow-hidden"
            style={{
                elevation: 2,
                borderLeftWidth: 4,
                borderLeftColor: priorityConfig.text,
            }}>
            <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-2">
                    <View className="flex-row items-center">
                        <View
                            className="w-7 h-7 rounded-lg justify-center items-center mr-2"
                            style={{ backgroundColor: priorityConfig.bg }}>
                            <Icon name="bell-outline" size={14} color={priorityConfig.text} />
                        </View>
                        <Text
                            className="text-gray-900 font-bold text-sm flex-1"
                            numberOfLines={1}>
                            {announcement.title}
                        </Text>
                    </View>
                    <Text className="text-gray-500 text-xs mt-2 leading-4" numberOfLines={2}>
                        {announcement.content}
                    </Text>
                </View>
                {announcement.priority && (
                    <View
                        className="px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: priorityConfig.bg }}>
                        <Text
                            className="text-[10px] font-bold capitalize"
                            style={{ color: priorityConfig.text }}>
                            {announcement.priority}
                        </Text>
                    </View>
                )}
            </View>
            <View className="flex-row items-center mt-3 pt-2 border-t border-gray-50">
                <Icon name="clock-outline" size={12} color="#d1d5db" />
                <Text className="text-gray-400 text-[10px] ml-1">
                    {announcement.publishDate
                        ? formatDate(announcement.publishDate)
                        : formatDate(announcement.createdAt)}
                </Text>
                {announcement.attachments && announcement.attachments.length > 0 && (
                    <View className="flex-row items-center ml-3">
                        <Icon name="paperclip" size={12} color="#d1d5db" />
                        <Text className="text-gray-400 text-[10px] ml-1">
                            {announcement.attachments.length} file{announcement.attachments.length > 1 ? 's' : ''}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

// ═══════════════════════════════════════════════
// ─── CIRCULAR PROGRESS COMPONENT ───
// ═══════════════════════════════════════════════
const CircularStat = ({ value, label, color, icon, suffix = '' }) => {
    return (
        <View className="items-center flex-1">
            <View
                className="w-16 h-16 rounded-full justify-center items-center mb-2"
                style={{
                    backgroundColor: `${color}12`,
                    borderWidth: 3,
                    borderColor: `${color}30`,
                }}>
                <Text className="font-bold text-lg" style={{ color }}>
                    {value}{suffix}
                </Text>
            </View>
            <Text className="text-gray-500 text-[11px] text-center font-medium">{label}</Text>
        </View>
    );
};

// ═══════════════════════════════════════════════
// ─── SECTION TITLE COMPONENT ───
// ═══════════════════════════════════════════════
const SectionTitle = ({ title, icon, onViewAll, iconColor = '#1e3a8a' }) => (
    <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
            <View
                className="w-8 h-8 rounded-lg justify-center items-center mr-2.5"
                style={{ backgroundColor: `${iconColor}12` }}>
                <Icon name={icon} size={16} color={iconColor} />
            </View>
            <Text className="text-gray-900 font-bold text-lg">{title}</Text>
        </View>
        {onViewAll && (
            <TouchableOpacity
                onPress={onViewAll}
                activeOpacity={0.7}
                className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-full">
                <Text className="text-blue-600 font-semibold text-xs">View All</Text>
                <Icon name="chevron-right" size={14} color="#2563eb" />
            </TouchableOpacity>
        )}
    </View>
);

// ═══════════════════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════
const CoachDashboardScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Dashboard data state
    const [stats, setStats] = useState({});
    const [recentActivity, setRecentActivity] = useState([]);
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [announcements, setAnnouncements] = useState([]);

    // Fetch all dashboard data (mock)
    const fetchAllData = useCallback(async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 800));

            const coachMembers = members.filter(m => m.coachId === coachProfile.id || m.status === 'active');
            const upcoming = sessions.filter(s => s.status === 'upcoming' || s.status === 'scheduled');
            const totalSessions = sessions.length;
            const avgAttendance =
                coachMembers.length > 0
                    ? Math.round(
                        coachMembers.reduce((sum, m) => sum + (m.stats?.attendanceRate || 0), 0) /
                        coachMembers.length,
                    )
                    : 0;

            setStats({
                totalMembers: coachMembers.length,
                activeThisWeek: Math.min(coachMembers.length, 3),
                avgProgressRate: `${avgAttendance}%`,
                averageRating: coachProfile.rating,
                totalSessions: totalSessions,
                upcomingSessions: upcoming.length,
            });

            setRecentActivity(MOCK_RECENT_ACTIVITY);
            setUpcomingSessions(upcoming.slice(0, 4));
            setAnnouncements(MOCK_ANNOUNCEMENTS.slice(0, 3));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAllData();
        setRefreshing(false);
    };

    // ─── Stats Config ───
    const statsConfig = [
        {
            label: 'Members',
            value: stats.totalMembers || 0,
            icon: 'account-group',
            color: '#3b82f6',
            gradient: ['#3b82f6', '#60a5fa'],
        },
        {
            label: 'Active',
            value: stats.activeThisWeek || 0,
            icon: 'lightning-bolt',
            color: '#22c55e',
            gradient: ['#22c55e', '#4ade80'],
        },
        {
            label: 'Avg Progress',
            value: stats.avgProgressRate || '0%',
            icon: 'trending-up',
            color: '#8b5cf6',
            gradient: ['#8b5cf6', '#a78bfa'],
        },
        {
            label: 'Rating',
            value: stats.averageRating ? `${stats.averageRating}` : '0',
            icon: 'star',
            color: '#f59e0b',
            gradient: ['#f59e0b', '#fbbf24'],
        },
    ];

    // ─── Quick Actions Config ───
    const quickActions = [
        {
            icon: 'clipboard-check-outline',
            label: 'Mark Attendance',
            color: '#1e3a8a',
            gradient: ['#1e3a8a', '#3b82f6'],
            onPress: () => navigation.navigate('Attendance'),
        },
        {
            icon: 'dumbbell',
            label: 'New Session',
            color: '#22c55e',
            gradient: ['#059669', '#22c55e'],
            onPress: () => navigation.navigate('Sessions'),
        },
        {
            icon: 'target',
            label: 'Training Plan',
            color: '#8b5cf6',
            gradient: ['#7c3aed', '#8b5cf6'],
            onPress: () => navigation.navigate('TrainingPlans'),
        },
        {
            icon: 'chart-bar',
            label: 'Reports',
            color: '#f59e0b',
            gradient: ['#d97706', '#f59e0b'],
            onPress: () => navigation.navigate('Reports'),
        },
        {
            icon: 'calendar-clock',
            label: 'Schedule',
            color: '#ec4899',
            gradient: ['#db2777', '#ec4899'],
            onPress: () => navigation.navigate('Schedule'),
        },
        {
            icon: 'account-group',
            label: 'Members',
            color: '#06b6d4',
            gradient: ['#0891b2', '#06b6d4'],
            onPress: () => navigation.navigate('Members'),
        },
    ];

    // ─── Loading State ───
    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <View className="w-16 h-16 rounded-2xl bg-blue-50 justify-center items-center mb-4">
                    <ActivityIndicator size="large" color="#1e3a8a" />
                </View>
                <Text className="text-gray-900 font-bold text-base">Loading Dashboard</Text>
                <Text className="text-gray-400 mt-1 text-sm">Preparing your workspace...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
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
            {/* ─── HEADER ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <LinearGradient
                colors={['#0f172a', '#1e3a8a', '#3b82f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingTop: 48, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
                {/* Top Bar */}
                <View className="flex-row justify-between items-center px-5 mb-5">
                    <DrawerMenuButton />
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Announcements')}
                            className="w-10 h-10 bg-white/15 rounded-full justify-center items-center mr-2">
                            <Icon name="bell-outline" size={22} color="#fff" />
                            <View className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full justify-center items-center">
                                <Text className="text-white text-[8px] font-bold">3</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Settings')}
                            className="w-10 h-10 bg-white/15 rounded-full justify-center items-center">
                            <Icon name="cog-outline" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Profile Section */}
                <View className="flex-row items-center px-5 mb-5">
                    <View style={{ borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 36 }}>
                        <ProfileAvatar name={coachProfile.name} size="medium" />
                    </View>
                    <View className="ml-4 flex-1">
                        <Text className="text-white/60 text-sm font-medium">{getGreeting()} 👋</Text>
                        <Text className="text-white font-bold text-2xl mt-0.5">
                            {coachProfile.name}
                        </Text>
                        <View className="flex-row items-center mt-1">
                            <Icon name="shield-star" size={14} color="#fbbf24" />
                            <Text className="text-white/70 text-xs ml-1.5">
                                {coachProfile.specialization}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Coach Info Bar */}
                <View className="mx-5 bg-white/10 rounded-2xl p-4" style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                            <View className="w-10 h-10 bg-yellow-400/20 rounded-xl justify-center items-center">
                                <Icon name="trophy" size={20} color="#fbbf24" />
                            </View>
                            <View className="ml-3">
                                <Text className="text-white font-bold text-sm">
                                    {coachProfile.experience} Experience
                                </Text>
                                <Text className="text-white/50 text-xs mt-0.5">
                                    {coachProfile.totalStudents} Students Trained
                                </Text>
                            </View>
                        </View>
                        <View className="bg-yellow-400 px-4 py-2 rounded-xl flex-row items-center">
                            <Icon name="star" size={14} color="#78350f" />
                            <Text className="text-yellow-900 font-bold text-sm ml-1">
                                {coachProfile.rating}
                            </Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── STATS GRID ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 -mt-5">
                <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
                    {statsConfig.map(stat => (
                        <View key={stat.label} style={{ width: '50%', padding: 4 }}>
                            <View
                                className="bg-white rounded-2xl p-4 shadow-md"
                                style={{ elevation: 4 }}>
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                                            {stat.label}
                                        </Text>
                                        <Text className="text-gray-900 font-bold text-3xl mt-1">
                                            {stat.value}
                                        </Text>
                                    </View>
                                    <LinearGradient
                                        colors={stat.gradient}
                                        className="w-11 h-11 rounded-xl justify-center items-center"
                                        style={{ borderRadius: 12 }}>
                                        <Icon name={stat.icon} size={20} color="#fff" />
                                    </LinearGradient>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── MY ATTENDANCE STATUS ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-5">
                <TouchableOpacity
                    onPress={() => navigation.navigate('Attendance')}
                    activeOpacity={0.85}>
                    <LinearGradient
                        colors={['#0f172a', '#1e3a8a']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ borderRadius: 20, padding: 20 }}>
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <Icon name="clipboard-check-outline" size={20} color="#60a5fa" />
                                <Text className="text-white font-bold text-base ml-2">
                                    My Attendance
                                </Text>
                            </View>
                            <View className="bg-green-400/20 px-3 py-1.5 rounded-full flex-row items-center">
                                <View className="w-2 h-2 rounded-full bg-green-400 mr-1.5" />
                                <Text className="text-green-400 text-xs font-bold">
                                    {coachSelfAttendanceStats.attendanceRate}% Rate
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <View className="w-12 h-12 bg-orange-500/20 rounded-2xl justify-center items-center">
                                    <Text className="text-2xl">🔥</Text>
                                </View>
                                <View className="ml-3">
                                    <Text className="text-white font-bold text-xl">
                                        {coachSelfAttendanceStats.currentStreak} Day Streak
                                    </Text>
                                    <Text className="text-blue-300/70 text-xs mt-0.5">
                                        {coachSelfAttendanceStats.totalHours}h total this month
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Attendance')}
                                activeOpacity={0.8}>
                                <LinearGradient
                                    colors={['#22c55e', '#16a34a']}
                                    style={{ borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }}>
                                    <Icon name="login" size={16} color="#fff" />
                                    <Text className="text-white font-bold text-xs ml-1.5">
                                        Punch In
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── QUICK ACTIONS ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-6">
                <SectionTitle title="Quick Actions" icon="flash" iconColor="#f59e0b" />
                <View className="flex-row flex-wrap" style={{ marginHorizontal: -6 }}>
                    {quickActions.map(action => (
                        <TouchableOpacity
                            key={action.label}
                            onPress={action.onPress}
                            activeOpacity={0.8}
                            style={{ width: (SCREEN_WIDTH - 32 - 24) / 3, marginHorizontal: 4, marginBottom: 12 }}>
                            <View
                                className="bg-white rounded-2xl items-center py-4 px-2 shadow-sm"
                                style={{ elevation: 2 }}>
                                <LinearGradient
                                    colors={action.gradient}
                                    className="w-12 h-12 rounded-xl justify-center items-center mb-2.5"
                                    style={{ borderRadius: 14 }}>
                                    <Icon name={action.icon} size={22} color="#fff" />
                                </LinearGradient>
                                <Text className="text-gray-700 font-semibold text-[11px] text-center" numberOfLines={1}>
                                    {action.label}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── SESSION OVERVIEW CARD ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-2">
                <View
                    className="bg-white rounded-2xl p-5 shadow-md"
                    style={{ elevation: 3 }}>
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 rounded-lg bg-blue-50 justify-center items-center mr-2.5">
                                <Icon name="calendar-month" size={16} color="#1e3a8a" />
                            </View>
                            <Text className="text-gray-900 font-bold text-lg">
                                Session Overview
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row mb-4">
                        <View className="flex-1 bg-blue-50 rounded-xl p-3.5 mr-2">
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <Text className="text-blue-400 text-xs font-medium">Total</Text>
                                    <Text className="text-blue-900 font-bold text-2xl mt-0.5">
                                        {stats.totalSessions || 0}
                                    </Text>
                                </View>
                                <Icon name="calendar-check" size={24} color="#93c5fd" />
                            </View>
                        </View>
                        <View className="flex-1 bg-green-50 rounded-xl p-3.5 ml-2">
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <Text className="text-green-400 text-xs font-medium">Upcoming</Text>
                                    <Text className="text-green-900 font-bold text-2xl mt-0.5">
                                        {stats.upcomingSessions || 0}
                                    </Text>
                                </View>
                                <Icon name="clock-fast" size={24} color="#86efac" />
                            </View>
                        </View>
                    </View>

                    <View className="flex-row" style={{ gap: 8 }}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Members')}
                            activeOpacity={0.8}
                            className="flex-1">
                            <LinearGradient
                                colors={['#1e3a8a', '#3b82f6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ borderRadius: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon name="account-group" size={18} color="#fff" />
                                <Text className="text-white font-bold text-sm ml-2">
                                    Members
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Sessions')}
                            activeOpacity={0.8}
                            className="flex-1"
                            style={{
                                borderRadius: 14,
                                borderWidth: 1.5,
                                borderColor: '#e5e7eb',
                                paddingVertical: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                            <Icon name="calendar-clock" size={18} color="#1e3a8a" />
                            <Text className="text-gray-700 font-bold text-sm ml-2">
                                Sessions
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── RECENT MEMBER ACTIVITY ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-6">
                <SectionTitle
                    title="Recent Activity"
                    icon="lightning-bolt"
                    iconColor="#f59e0b"
                    onViewAll={() => navigation.navigate('Sessions')}
                />

                {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                        <ActivityItem
                            key={activity.id}
                            activity={activity}
                            isLast={index === recentActivity.length - 1}
                        />
                    ))
                ) : (
                    <View className="bg-white rounded-2xl p-8 items-center shadow-sm" style={{ elevation: 2 }}>
                        <View className="w-16 h-16 rounded-full bg-gray-50 justify-center items-center mb-3">
                            <Icon name="lightning-bolt" size={32} color="#d1d5db" />
                        </View>
                        <Text className="text-gray-400 font-medium">No recent activity</Text>
                    </View>
                )}
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── UPCOMING SESSIONS ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-6">
                <SectionTitle
                    title="Upcoming Sessions"
                    icon="calendar-clock"
                    iconColor="#3b82f6"
                    onViewAll={() => navigation.navigate('Sessions')}
                />

                {upcomingSessions.length > 0 ? (
                    upcomingSessions.map(session => (
                        <SessionItem key={session.id} session={session} />
                    ))
                ) : (
                    <View className="bg-white rounded-2xl p-8 items-center shadow-sm" style={{ elevation: 2 }}>
                        <View className="w-16 h-16 rounded-full bg-gray-50 justify-center items-center mb-3">
                            <Icon name="calendar-blank" size={32} color="#d1d5db" />
                        </View>
                        <Text className="text-gray-400 font-medium">No upcoming sessions</Text>
                    </View>
                )}
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── RECENT ANNOUNCEMENTS ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-6">
                <SectionTitle
                    title="Announcements"
                    icon="bullhorn"
                    iconColor="#8b5cf6"
                    onViewAll={() => navigation.navigate('Announcements')}
                />

                {announcements.length > 0 ? (
                    announcements.map(ann => (
                        <AnnouncementItem
                            key={ann._id || ann.id}
                            announcement={ann}
                        />
                    ))
                ) : (
                    <View className="bg-white rounded-2xl p-8 items-center shadow-sm" style={{ elevation: 2 }}>
                        <View className="w-16 h-16 rounded-full bg-gray-50 justify-center items-center mb-3">
                            <Icon name="bell-off-outline" size={32} color="#d1d5db" />
                        </View>
                        <Text className="text-gray-400 font-medium">No announcements</Text>
                    </View>
                )}
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── PERFORMANCE OVERVIEW ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-6 mb-4">
                <SectionTitle title="Performance" icon="chart-arc" iconColor="#22c55e" />
                <View
                    className="bg-white rounded-2xl p-5 shadow-md"
                    style={{ elevation: 3 }}>
                    <View className="flex-row items-center justify-around">
                        <CircularStat
                            value={stats.avgProgressRate || '0%'}
                            label="Avg Attendance"
                            color="#22c55e"
                            icon="chart-line"
                        />
                        <View className="w-px h-12 bg-gray-100" />
                        <CircularStat
                            value={coachProfile.rating}
                            label="Rating"
                            color="#f59e0b"
                            icon="star"
                            suffix="/5"
                        />
                        <View className="w-px h-12 bg-gray-100" />
                        <CircularStat
                            value={coachProfile.totalStudents}
                            label="Students"
                            color="#3b82f6"
                            icon="account-group"
                        />
                    </View>

                    {/* Certifications Preview */}
                    <View className="mt-4 pt-4 border-t border-gray-50">
                        <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                            Certifications
                        </Text>
                        <View className="flex-row flex-wrap">
                            {coachProfile.certifications?.slice(0, 3).map((cert, idx) => (
                                <View
                                    key={idx}
                                    className="bg-blue-50 rounded-full px-3 py-1.5 mr-2 mb-2 flex-row items-center">
                                    <Icon name="certificate" size={12} color="#3b82f6" />
                                    <Text className="text-blue-700 text-[10px] font-semibold ml-1" numberOfLines={1}>
                                        {cert}
                                    </Text>
                                </View>
                            ))}
                            {coachProfile.certifications?.length > 3 && (
                                <View className="bg-gray-100 rounded-full px-3 py-1.5 mr-2 mb-2">
                                    <Text className="text-gray-500 text-[10px] font-semibold">
                                        +{coachProfile.certifications.length - 3} more
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </View>

            {/* Bottom Spacing */}
            <View className="h-8" />
        </ScrollView>
    );
};

export default CoachDashboardScreen;