import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ProfileAvatar from '../../components/ProfileAvatar';
import QuickActionCard from '../../components/QuickActionCard';
import StatCard from '../../components/StatCard';
import SectionHeader from '../../components/SectionHeader';
import DrawerMenuButton from '../../components/DrawerMenuButton';
import { coachProfile } from '../../data/user';
import { sessions } from '../../data/sessions';
import { trainees } from '../../data/trainees';
import { MOCK_ANNOUNCEMENTS } from '../../data/announcements';

// ─── Mock Dashboard Data ───
const MOCK_RECENT_ACTIVITY = [
    {
        id: 'a1',
        member: 'John Smith',
        activity: 'Completed Karate session',
        status: 'completed',
        time: '2026-03-13T09:30:00Z',
    },
    {
        id: 'a2',
        member: 'Emily Davis',
        activity: 'Attended Badminton practice',
        status: 'present',
        time: '2026-03-13T14:00:00Z',
    },
    {
        id: 'a3',
        member: 'Jessica Wilson',
        activity: 'Boxing training in progress',
        status: 'active',
        time: '2026-03-13T18:00:00Z',
    },
    {
        id: 'a4',
        member: 'David Martinez',
        activity: 'Missed Weightlifting session',
        status: 'absent',
        time: '2026-03-12T17:00:00Z',
    },
    {
        id: 'a5',
        member: 'Michael Brown',
        activity: 'Swimming session completed',
        status: 'completed',
        time: '2026-03-12T07:00:00Z',
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

const getStatusColor = status => {
    switch (status) {
        case 'completed':
            return { bg: '#dcfce7', text: '#166534' };
        case 'present':
            return { bg: '#dbeafe', text: '#1e40af' };
        case 'active':
            return { bg: '#fef3c7', text: '#92400e' };
        case 'absent':
            return { bg: '#fee2e2', text: '#991b1b' };
        default:
            return { bg: '#f3f4f6', text: '#374151' };
    }
};

const getPriorityColor = priority => {
    switch (priority) {
        case 'urgent':
            return { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' };
        case 'high':
            return { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' };
        case 'medium':
            return { bg: '#fef3c7', text: '#d97706', border: '#fde68a' };
        case 'low':
            return { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' };
        default:
            return { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' };
    }
};

// ─── Activity Item Component ───
const ActivityItem = ({ activity }) => {
    const statusColor = getStatusColor(activity.status);
    return (
        <View
            className="flex-row items-center bg-white rounded-xl p-3.5 mb-3 shadow-sm"
            style={{ elevation: 2 }}>
            {/* Avatar */}
            <View className="w-10 h-10 rounded-full bg-blue-100 justify-center items-center">
                <Text className="text-blue-700 font-bold text-base">
                    {activity.member?.charAt(0) || 'M'}
                </Text>
            </View>
            {/* Info */}
            <View className="flex-1 ml-3">
                <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>
                    {activity.member || 'Unknown'}
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
                    {activity.activity || 'Activity'}
                </Text>
            </View>
            {/* Status & Time */}
            <View className="items-end ml-2">
                <View
                    className="px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: statusColor.bg }}>
                    <Text
                        className="text-xs font-semibold capitalize"
                        style={{ color: statusColor.text }}>
                        {activity.status || 'N/A'}
                    </Text>
                </View>
                <Text className="text-gray-400 text-[10px] mt-1">
                    {activity.time ? formatTime(activity.time) : 'N/A'}
                </Text>
            </View>
        </View>
    );
};

// ─── Session Item Component ───
const SessionItem = ({ session }) => {
    const dateObj = session.date ? new Date(session.date) : null;
    return (
        <View
            className="flex-row items-center bg-white rounded-xl p-3.5 mb-3 shadow-sm"
            style={{ elevation: 2 }}>
            {/* Date Badge */}
            <View className="w-12 h-12 rounded-xl bg-blue-50 justify-center items-center">
                <Text className="text-blue-700 font-bold text-sm">
                    {dateObj ? dateObj.getDate() : '--'}
                </Text>
                <Text className="text-blue-500 text-[10px]">
                    {dateObj
                        ? dateObj.toLocaleDateString('en-IN', { month: 'short' })
                        : ''}
                </Text>
            </View>
            {/* Session Info */}
            <View className="flex-1 ml-3">
                <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>
                    {session.sportName}
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">
                    {session.time} • {session.location || 'TBD'}
                </Text>
            </View>
            {/* Slots Badge */}
            <View className="bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                <Text className="text-gray-600 text-xs font-semibold">
                    {session.bookedSlots}/{session.maxSlots}
                </Text>
            </View>
        </View>
    );
};

// ─── Announcement Item Component ───
const AnnouncementItem = ({ announcement }) => {
    const priorityColor = getPriorityColor(announcement.priority);
    return (
        <View
            className="bg-white rounded-xl p-3.5 mb-3 shadow-sm"
            style={{ elevation: 2 }}>
            <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-2">
                    <View className="flex-row items-center">
                        <Icon name="bell-outline" size={16} color="#9ca3af" />
                        <Text
                            className="text-gray-900 font-semibold text-sm ml-1.5 flex-1"
                            numberOfLines={1}>
                            {announcement.title}
                        </Text>
                    </View>
                    <Text className="text-gray-400 text-xs mt-1.5" numberOfLines={2}>
                        {announcement.content}
                    </Text>
                </View>
                {announcement.priority && (
                    <View
                        className="px-2 py-1 rounded-full"
                        style={{ backgroundColor: priorityColor.bg }}>
                        <Text
                            className="text-[10px] font-semibold capitalize"
                            style={{ color: priorityColor.text }}>
                            {announcement.priority}
                        </Text>
                    </View>
                )}
            </View>
            <Text className="text-gray-300 text-[10px] mt-2">
                {announcement.publishDate
                    ? formatDate(announcement.publishDate)
                    : formatDate(announcement.createdAt)}
            </Text>
        </View>
    );
};

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
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));

            // Build stats from mock data
            const coachTrainees = trainees.filter(t => t.coachId === coachProfile.id);
            const upcoming = sessions.filter(s => s.status === 'upcoming');
            const totalSessions = sessions.length;
            const avgAttendance =
                coachTrainees.length > 0
                    ? Math.round(
                        coachTrainees.reduce((sum, t) => sum + t.attendance, 0) /
                        coachTrainees.length,
                    )
                    : 0;

            setStats({
                totalMembers: coachTrainees.length,
                activeThisWeek: Math.min(coachTrainees.length, 3),
                avgProgressRate: `${avgAttendance}%`,
                averageRating: coachProfile.rating,
                totalSessions: totalSessions,
                upcomingSessions: upcoming.length,
            });

            setRecentActivity(MOCK_RECENT_ACTIVITY);
            setUpcomingSessions(upcoming.slice(0, 5));
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
            label: 'Members Guiding',
            value: stats.totalMembers || 0,
            icon: 'account-group',
            color: '#3b82f6',
        },
        {
            label: 'Active This Week',
            value: stats.activeThisWeek || 0,
            icon: 'lightning-bolt',
            color: '#22c55e',
        },
        {
            label: 'Avg Progress',
            value: stats.avgProgressRate || '0%',
            icon: 'trending-up',
            color: '#059669',
        },
        {
            label: 'Avg Rating',
            value: stats.averageRating ? `${stats.averageRating}/5` : '0/5',
            icon: 'star',
            color: '#f59e0b',
        },
    ];

    // ─── Loading State ───
    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#1e3a8a" />
                <Text className="text-gray-500 mt-3">Loading dashboard...</Text>
            </View>
        );
    }

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
            {/* ═══════════════════════════════════════════════ */}
            {/* ─── HEADER ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <LinearGradient
                colors={['#1e3a8a', '#3b82f6']}
                className="px-6 pt-12 pb-8 rounded-b-[30px]">
                <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-row items-center">
                        <DrawerMenuButton />
                        <View className="ml-2">
                            <ProfileAvatar name={coachProfile.name} size="medium" />
                        </View>
                        <View className="ml-3">
                            <Text className="text-white/80 text-sm">Welcome back,</Text>
                            <Text className="text-white font-bold text-xl">
                                {coachProfile.name}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Sessions')}
                        className="w-10 h-10 bg-white/20 rounded-full justify-center items-center">
                        <Icon name="bell-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Membership-style info bar */}
                <View className="bg-white/20 rounded-xl p-4 flex-row items-center">
                    <Icon name="shield-star" size={28} color="#fbbf24" />
                    <View className="ml-3 flex-1">
                        <Text className="text-white font-semibold">
                            {coachProfile.specialization}
                        </Text>
                        <Text className="text-white/70 text-sm">
                            {coachProfile.experience} Experience •{' '}
                            {coachProfile.totalStudents} Students
                        </Text>
                    </View>
                    <View className="bg-yellow-400 px-3 py-1 rounded-full">
                        <Text className="text-gray-900 font-bold text-xs">
                            ⭐ {coachProfile.rating}
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── MAIN STATS GRID ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-2 -mt-4">
                <View className="flex-row flex-wrap">
                    {statsConfig.map(stat => (
                        <View key={stat.label} className="w-1/2 p-2">
                            <View
                                className="bg-white rounded-xl p-4 shadow-md"
                                style={{ elevation: 3 }}>
                                <View className="flex-row justify-between items-start mb-2">
                                    <View className="flex-1">
                                        <Text className="text-gray-500 text-xs">{stat.label}</Text>
                                        <Text className="text-gray-900 font-bold text-2xl mt-1">
                                            {stat.value}
                                        </Text>
                                    </View>
                                    <View
                                        className="w-10 h-10 rounded-full justify-center items-center"
                                        style={{ backgroundColor: `${stat.color}20` }}>
                                        <Icon name={stat.icon} size={20} color={stat.color} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── SESSION OVERVIEW CARD ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-4">
                <View
                    className="bg-white rounded-2xl p-4 shadow-md"
                    style={{ elevation: 3 }}>
                    <Text className="text-gray-900 font-bold text-lg mb-3">
                        Session Overview
                    </Text>
                    <View className="flex-row items-center justify-between p-3 bg-gray-50 rounded-xl mb-2">
                        <View className="flex-row items-center">
                            <Icon name="calendar-check" size={18} color="#6b7280" />
                            <Text className="text-gray-700 text-sm ml-2">Total Sessions</Text>
                        </View>
                        <Text className="text-gray-900 font-bold">
                            {stats.totalSessions || 0}
                        </Text>
                    </View>
                    <View className="flex-row items-center justify-between p-3 bg-gray-50 rounded-xl mb-3">
                        <View className="flex-row items-center">
                            <Icon name="clock-outline" size={18} color="#6b7280" />
                            <Text className="text-gray-700 text-sm ml-2">Upcoming</Text>
                        </View>
                        <Text className="text-gray-900 font-bold">
                            {stats.upcomingSessions || 0}
                        </Text>
                    </View>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Trainees')}
                            activeOpacity={0.8}
                            className="flex-1">
                            <LinearGradient
                                colors={['#1e3a8a', '#3b82f6']}
                                className="rounded-xl py-3 flex-row items-center justify-center">
                                <Icon name="account-group" size={18} color="#fff" />
                                <Text className="text-white font-bold text-sm ml-1.5">
                                    Members
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Sessions')}
                            activeOpacity={0.8}
                            className="flex-1 border border-gray-200 rounded-xl py-3 flex-row items-center justify-center">
                            <Icon name="calendar-clock" size={18} color="#1e3a8a" />
                            <Text className="text-gray-700 font-bold text-sm ml-1.5">
                                Sessions
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── QUICK ACTIONS ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-4">
                <View
                    className="bg-white rounded-2xl p-4 shadow-md"
                    style={{ elevation: 3 }}>
                    <Text className="text-gray-900 font-bold text-lg mb-3">
                        Quick Actions
                    </Text>
                    {[
                        {
                            icon: 'dumbbell',
                            label: 'Create Session',
                            color: '#22c55e',
                            onPress: () => navigation.navigate('Sessions'),
                        },
                        {
                            icon: 'target',
                            label: 'Create Training Plan',
                            color: '#3b82f6',
                            onPress: () => navigation.navigate('TrainingPlans'),
                        },
                        {
                            icon: 'chart-bar',
                            label: 'Generate Report',
                            color: '#8b5cf6',
                            onPress: () => navigation.navigate('Sessions'),
                        },
                        {
                            icon: 'clock-outline',
                            label: 'View Schedule',
                            color: '#f59e0b',
                            onPress: () => navigation.navigate('Sessions'),
                        },
                    ].map((action, index) => (
                        <TouchableOpacity
                            key={action.label}
                            onPress={action.onPress}
                            activeOpacity={0.7}
                            className={`flex-row items-center p-3.5 rounded-xl ${index < 3 ? 'mb-2' : ''
                                } border border-gray-100`}>
                            <View
                                className="w-9 h-9 rounded-lg justify-center items-center"
                                style={{ backgroundColor: `${action.color}15` }}>
                                <Icon name={action.icon} size={20} color={action.color} />
                            </View>
                            <Text className="text-gray-700 font-semibold text-sm ml-3 flex-1">
                                {action.label}
                            </Text>
                            <Icon name="chevron-right" size={18} color="#d1d5db" />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── RECENT MEMBER ACTIVITY ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-6">
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-gray-900 font-bold text-lg">
                        Recent Member Activity
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Sessions')}
                        activeOpacity={0.7}
                        className="flex-row items-center">
                        <Text className="text-blue-600 font-semibold text-sm">View All</Text>
                        <Icon name="arrow-right" size={16} color="#2563eb" />
                    </TouchableOpacity>
                </View>

                {recentActivity.length > 0 ? (
                    recentActivity.map(activity => (
                        <ActivityItem key={activity.id} activity={activity} />
                    ))
                ) : (
                    <View className="bg-white rounded-xl p-8 items-center">
                        <Icon name="lightning-bolt" size={48} color="#d1d5db" />
                        <Text className="text-gray-400 mt-2">No recent activity</Text>
                    </View>
                )}
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── UPCOMING SESSIONS ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-6">
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-gray-900 font-bold text-lg">
                        Upcoming Sessions
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Sessions')}
                        activeOpacity={0.7}
                        className="flex-row items-center">
                        <Text className="text-blue-600 font-semibold text-sm">View All</Text>
                        <Icon name="arrow-right" size={16} color="#2563eb" />
                    </TouchableOpacity>
                </View>

                {upcomingSessions.length > 0 ? (
                    upcomingSessions.map(session => (
                        <SessionItem key={session.id} session={session} />
                    ))
                ) : (
                    <View className="bg-white rounded-xl p-8 items-center">
                        <Icon name="calendar-blank" size={48} color="#d1d5db" />
                        <Text className="text-gray-400 mt-2 text-sm">
                            No upcoming sessions
                        </Text>
                    </View>
                )}
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── RECENT ANNOUNCEMENTS ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-6">
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-gray-900 font-bold text-lg">
                        Recent Announcements
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Announcements')}
                        activeOpacity={0.7}
                        className="flex-row items-center">
                        <Text className="text-blue-600 font-semibold text-sm">View All</Text>
                        <Icon name="arrow-right" size={16} color="#2563eb" />
                    </TouchableOpacity>
                </View>

                {announcements.length > 0 ? (
                    announcements.map(ann => (
                        <AnnouncementItem
                            key={ann._id || ann.id}
                            announcement={ann}
                        />
                    ))
                ) : (
                    <View className="bg-white rounded-xl p-8 items-center">
                        <Icon name="bell-off-outline" size={48} color="#d1d5db" />
                        <Text className="text-gray-400 mt-2 text-sm">
                            No announcements
                        </Text>
                    </View>
                )}
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── PERFORMANCE OVERVIEW ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-6 mb-6">
                <Text className="text-gray-900 font-bold text-lg mb-3">
                    Performance Overview
                </Text>
                <View className="flex-row flex-wrap justify-between">
                    <StatCard
                        title="Avg Attendance"
                        value={stats.avgProgressRate || '0%'}
                        subtitle="This month"
                        icon="chart-line"
                        color="#22c55e"
                    />
                    <StatCard
                        title="Rating"
                        value={coachProfile.rating}
                        subtitle="Out of 5"
                        icon="star"
                        color="#f59e0b"
                    />
                </View>
            </View>

            {/* Bottom Spacing */}
            <View className="h-6" />
        </ScrollView>
    );
};

export default CoachDashboardScreen;