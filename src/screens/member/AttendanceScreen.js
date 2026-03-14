import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import SectionHeader from '../../components/SectionHeader';
import ProgressBar from '../../components/ProgressBar';

// ─── Mock Data (replace with real API service later) ───
const MOCK_FACILITIES = [
    { _id: 'f1', name: 'Main Gym', type: 'Gym' },
    { _id: 'f2', name: 'Swimming Pool', type: 'Pool' },
    { _id: 'f3', name: 'Tennis Court A', type: 'Court' },
    { _id: 'f4', name: 'Yoga Studio', type: 'Studio' },
];

const MOCK_ATTENDANCE_RECORDS = [
    {
        _id: 'att1',
        facility: 'Main Gym',
        date: '2026-03-13T09:00:00Z',
        punchInTime: '2026-03-13T09:00:00Z',
        punchOutTime: '2026-03-13T10:30:00Z',
        duration: 90,
        status: 'completed',
    },
    {
        _id: 'att2',
        facility: 'Swimming Pool',
        date: '2026-03-12T07:00:00Z',
        punchInTime: '2026-03-12T07:00:00Z',
        punchOutTime: '2026-03-12T08:00:00Z',
        duration: 60,
        status: 'completed',
    },
    {
        _id: 'att3',
        facility: 'Yoga Studio',
        date: '2026-03-11T17:00:00Z',
        punchInTime: '2026-03-11T17:00:00Z',
        punchOutTime: '2026-03-11T18:15:00Z',
        duration: 75,
        status: 'completed',
    },
    {
        _id: 'att4',
        facility: 'Main Gym',
        date: '2026-03-10T06:30:00Z',
        punchInTime: '2026-03-10T06:30:00Z',
        punchOutTime: null,
        duration: 0,
        status: 'incomplete',
    },
    {
        _id: 'att5',
        facility: 'Tennis Court A',
        date: '2026-03-09T15:00:00Z',
        punchInTime: '2026-03-09T15:00:00Z',
        punchOutTime: '2026-03-09T16:30:00Z',
        duration: 90,
        status: 'completed',
    },
    {
        _id: 'att6',
        facility: 'Main Gym',
        date: '2026-03-08T08:00:00Z',
        punchInTime: '2026-03-08T08:00:00Z',
        punchOutTime: '2026-03-08T09:45:00Z',
        duration: 105,
        status: 'completed',
    },
    {
        _id: 'att7',
        facility: 'Swimming Pool',
        date: '2026-03-07T07:30:00Z',
        punchInTime: '2026-03-07T07:30:00Z',
        punchOutTime: '2026-03-07T08:30:00Z',
        duration: 60,
        status: 'completed',
    },
];

const MOCK_STATS = {
    totalAttendance: 48,
    completedCount: 42,
    activeCount: 1,
    incompleteCount: 5,
    attendanceRate: 88,
    totalDuration: 3780, // minutes
};

// ─── Helper Functions ───
const formatDuration = minutes => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const formatElapsedTime = seconds => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getStatusConfig = status => {
    switch (status) {
        case 'completed':
            return {
                icon: 'check-circle',
                color: '#059669',
                bgColor: '#d1fae5',
                textColor: '#065f46',
                label: 'Completed',
            };
        case 'active':
            return {
                icon: 'timer-sand',
                color: '#d97706',
                bgColor: '#fef3c7',
                textColor: '#92400e',
                label: 'Active',
            };
        case 'incomplete':
            return {
                icon: 'alert-circle',
                color: '#dc2626',
                bgColor: '#fee2e2',
                textColor: '#991b1b',
                label: 'Incomplete',
            };
        default:
            return {
                icon: 'help-circle',
                color: '#6b7280',
                bgColor: '#f3f4f6',
                textColor: '#374151',
                label: status,
            };
    }
};

// ─── Component ───
const AttendanceScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [timeFilter, setTimeFilter] = useState('all');
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    // Data
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState(null);
    const [facilities, setFacilities] = useState([]);

    // Active session
    const [activeSession, setActiveSession] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef(null);

    // Punch-in modal
    const [showPunchInModal, setShowPunchInModal] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState('');
    const [punchNotes, setPunchNotes] = useState('');
    const [punchLoading, setPunchLoading] = useState(false);

    // ─── Fetch Data ───
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 600));

            let filteredRecords = [...MOCK_ATTENDANCE_RECORDS];
            if (timeFilter === 'week') {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                filteredRecords = filteredRecords.filter(
                    r => new Date(r.date) >= weekAgo,
                );
            } else if (timeFilter === 'month') {
                const monthAgo = new Date();
                monthAgo.setDate(monthAgo.getDate() - 30);
                filteredRecords = filteredRecords.filter(
                    r => new Date(r.date) >= monthAgo,
                );
            }

            setAttendanceRecords(filteredRecords);
            setAttendanceStats(MOCK_STATS);
            setFacilities(MOCK_FACILITIES);
        } catch (error) {
            Alert.alert('Error', 'Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    }, [timeFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ─── Live Timer ───
    useEffect(() => {
        if (activeSession) {
            const punchInTime = new Date(activeSession.punchInTime).getTime();

            const updateTimer = () => {
                const now = Date.now();
                setElapsedTime(Math.floor((now - punchInTime) / 1000));
            };

            updateTimer();
            timerRef.current = setInterval(updateTimer, 1000);

            return () => {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };
        } else {
            setElapsedTime(0);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    }, [activeSession]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    // ─── Punch In ───
    const handlePunchInClick = () => {
        setSelectedFacility('');
        setPunchNotes('');
        setShowPunchInModal(true);
    };

    const handlePunchInConfirm = async () => {
        try {
            setPunchLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            const facilityObj = facilities.find(f => f._id === selectedFacility);
            const newSession = {
                _id: `session_${Date.now()}`,
                punchInTime: new Date().toISOString(),
                facility: facilityObj?.name || 'General',
                notes: punchNotes.trim(),
            };

            setActiveSession(newSession);
            setShowPunchInModal(false);
            Alert.alert(
                '✅ Punched In!',
                'Your session has started. Have a great workout!',
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to punch in');
        } finally {
            setPunchLoading(false);
        }
    };

    // ─── Punch Out ───
    const handlePunchOut = async () => {
        try {
            setPunchLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            const durationMinutes = Math.round(elapsedTime / 60);
            Alert.alert(
                '👋 Punched Out!',
                `Session completed. Duration: ${formatDuration(durationMinutes)}`,
            );

            // Add to records
            const newRecord = {
                _id: activeSession._id,
                facility: activeSession.facility,
                date: activeSession.punchInTime,
                punchInTime: activeSession.punchInTime,
                punchOutTime: new Date().toISOString(),
                duration: durationMinutes,
                status: 'completed',
            };
            setAttendanceRecords(prev => [newRecord, ...prev]);
            setActiveSession(null);
        } catch (error) {
            Alert.alert('Error', 'Failed to punch out');
        } finally {
            setPunchLoading(false);
        }
    };

    // ─── Stats ───
    const totalVisits = attendanceStats?.totalAttendance || 0;
    const completedCount = attendanceStats?.completedCount || 0;
    const attendanceRate = attendanceStats?.attendanceRate || 0;
    const totalDuration = attendanceStats?.totalDuration || 0;
    const monthlyGoal = 20;
    const goalProgress = Math.min((completedCount / monthlyGoal) * 100, 100);

    const statsConfig = [
        {
            label: 'Total Visits',
            value: totalVisits.toString(),
            icon: 'calendar-check',
            color: '#3b82f6',
        },
        {
            label: 'Completed',
            value: completedCount.toString(),
            icon: 'check-circle',
            color: '#059669',
        },
        {
            label: 'Rate',
            value: `${attendanceRate}%`,
            icon: 'trending-up',
            color: '#f59e0b',
        },
        {
            label: 'Goal',
            value: `${completedCount}/${monthlyGoal}`,
            icon: 'target',
            color: '#8b5cf6',
        },
    ];

    const achievements = [
        {
            title: '30-Day Streak',
            description: 'Attended for 30 consecutive days',
            earned: completedCount >= 30,
            icon: '🔥',
        },
        {
            title: 'Early Bird',
            description: 'Attended 10 morning sessions',
            earned: completedCount >= 10,
            icon: '🌅',
        },
        {
            title: 'Consistent',
            description: 'Completion rate above 80%',
            earned: parseFloat(attendanceRate) >= 80,
            icon: '⭐',
        },
        {
            title: 'Century Club',
            description: 'Completed 100 total visits',
            earned: totalVisits >= 100,
            icon: '💯',
        },
    ];

    const filterOptions = [
        { label: 'All Time', value: 'all' },
        { label: 'This Week', value: 'week' },
        { label: 'This Month', value: 'month' },
    ];

    // ─── Loading State ───
    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#059669" />
                <Text className="text-gray-500 mt-3">Loading attendance...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView
                className="flex-1"
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
                        <View>
                            <Text className="text-white font-bold text-2xl">
                                Attendance & Performance
                            </Text>
                            <Text className="text-white/80 text-sm mt-1">
                                Track your visits with punch-in / punch-out
                            </Text>
                        </View>
                    </View>

                    {/* Time Filter Chips */}
                    <View className="flex-row mt-2">
                        {filterOptions.map(option => (
                            <TouchableOpacity
                                key={option.value}
                                onPress={() => setTimeFilter(option.value)}
                                className={`mr-2 px-4 py-2 rounded-full ${timeFilter === option.value
                                        ? 'bg-white'
                                        : 'bg-white/20'
                                    }`}
                                activeOpacity={0.7}>
                                <Text
                                    className={`text-sm font-semibold ${timeFilter === option.value
                                            ? 'text-emerald-700'
                                            : 'text-white'
                                        }`}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </LinearGradient>

                {/* ─── Punch In / Punch Out Card ─── */}
                <View className="px-4 -mt-4">
                    <View
                        className={`bg-white rounded-2xl p-5 border-2 ${activeSession ? 'border-red-400' : 'border-emerald-400'
                            }`}
                        style={{ elevation: 6 }}>
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <View
                                    className={`w-16 h-16 rounded-full justify-center items-center ${activeSession ? 'bg-red-100' : 'bg-emerald-100'
                                        }`}>
                                    {activeSession ? (
                                        <Icon name="timer-sand" size={36} color="#dc2626" />
                                    ) : (
                                        <Icon name="login" size={36} color="#059669" />
                                    )}
                                </View>
                                <View className="ml-4 flex-1">
                                    {activeSession ? (
                                        <>
                                            <Text className="text-red-700 font-bold text-lg">
                                                Session Active
                                            </Text>
                                            <View className="flex-row items-center mt-1">
                                                <Icon name="clock-outline" size={14} color="#6b7280" />
                                                <Text className="text-gray-500 text-sm ml-1">
                                                    Started{' '}
                                                    {new Date(
                                                        activeSession.punchInTime,
                                                    ).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </Text>
                                            </View>
                                            {activeSession.facility && (
                                                <View className="flex-row items-center mt-0.5">
                                                    <Icon name="map-marker" size={14} color="#6b7280" />
                                                    <Text className="text-gray-500 text-sm ml-1">
                                                        {activeSession.facility}
                                                    </Text>
                                                </View>
                                            )}
                                            <Text className="text-red-600 font-mono font-bold text-2xl mt-2">
                                                {formatElapsedTime(elapsedTime)}
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            <Text className="text-emerald-700 font-bold text-lg">
                                                Ready to Start?
                                            </Text>
                                            <Text className="text-gray-500 text-sm mt-1">
                                                Tap Punch In to start tracking your visit
                                            </Text>
                                        </>
                                    )}
                                </View>
                            </View>

                            {activeSession ? (
                                <TouchableOpacity
                                    onPress={handlePunchOut}
                                    disabled={punchLoading}
                                    activeOpacity={0.8}
                                    className="bg-red-500 rounded-xl px-5 py-4 flex-row items-center">
                                    {punchLoading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <Icon name="logout" size={20} color="#fff" />
                                            <Text className="text-white font-bold ml-2 text-base">
                                                Out
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    onPress={handlePunchInClick}
                                    disabled={punchLoading}
                                    activeOpacity={0.8}>
                                    <LinearGradient
                                        colors={['#059669', '#10b981']}
                                        className="rounded-xl px-5 py-4 flex-row items-center">
                                        {punchLoading ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <>
                                                <Icon name="login" size={20} color="#fff" />
                                                <Text className="text-white font-bold ml-2 text-base">
                                                    In
                                                </Text>
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                {/* ─── Stats Grid ─── */}
                <View className="px-2 mt-4">
                    <View className="flex-row flex-wrap">
                        {statsConfig.map(stat => (
                            <View key={stat.label} className="w-1/2 p-2">
                                <View
                                    className="bg-white rounded-xl p-4 shadow-md"
                                    style={{ elevation: 3 }}>
                                    <View className="flex-row justify-between items-start">
                                        <View>
                                            <Text className="text-gray-500 text-xs">
                                                {stat.label}
                                            </Text>
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

                {/* ─── Monthly Progress ─── */}
                <View className="px-4 mt-4">
                    <View
                        className="bg-white rounded-2xl p-5 shadow-sm"
                        style={{ elevation: 3 }}>
                        <View className="flex-row items-center mb-4">
                            <Icon name="chart-arc" size={22} color="#8b5cf6" />
                            <Text className="text-gray-900 font-bold text-lg ml-2">
                                Monthly Progress
                            </Text>
                        </View>

                        <ProgressBar
                            progress={completedCount}
                            total={monthlyGoal}
                            label={`Visit Goal (${completedCount}/${monthlyGoal})`}
                            color="bg-emerald-500"
                            height={10}
                        />

                        {/* Progress Stats Row */}
                        <View className="flex-row mt-4 pt-4 border-t border-gray-100">
                            <View className="flex-1 items-center">
                                <Text className="text-emerald-600 font-bold text-xl">
                                    {completedCount}
                                </Text>
                                <Text className="text-gray-400 text-xs mt-1">Completed</Text>
                            </View>
                            <View className="flex-1 items-center">
                                <Text className="text-yellow-600 font-bold text-xl">
                                    {attendanceStats?.activeCount || 0}
                                </Text>
                                <Text className="text-gray-400 text-xs mt-1">Active</Text>
                            </View>
                            <View className="flex-1 items-center">
                                <Text className="text-red-600 font-bold text-xl">
                                    {attendanceStats?.incompleteCount || 0}
                                </Text>
                                <Text className="text-gray-400 text-xs mt-1">Incomplete</Text>
                            </View>
                            <View className="flex-1 items-center">
                                <Text className="text-blue-600 font-bold text-xl">
                                    {formatDuration(totalDuration)}
                                </Text>
                                <Text className="text-gray-400 text-xs mt-1">Total Time</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* ─── Attendance History ─── */}
                <SectionHeader
                    title="Attendance History"
                    icon="history"
                    showSeeAll={false}
                />
                <View className="px-4">
                    {attendanceRecords.length > 0 ? (
                        attendanceRecords.map(record => {
                            const statusConfig = getStatusConfig(record.status);
                            return (
                                <View
                                    key={record._id}
                                    className="bg-white rounded-xl p-4 mb-3 shadow-sm flex-row items-center"
                                    style={{ elevation: 2 }}>
                                    {/* Status Icon */}
                                    <View
                                        className="w-12 h-12 rounded-full justify-center items-center"
                                        style={{ backgroundColor: statusConfig.bgColor }}>
                                        <Icon
                                            name={statusConfig.icon}
                                            size={22}
                                            color={statusConfig.color}
                                        />
                                    </View>

                                    {/* Details */}
                                    <View className="flex-1 ml-3">
                                        <Text className="text-gray-900 font-semibold text-base">
                                            {record.facility || 'General'}
                                        </Text>
                                        <View className="flex-row flex-wrap items-center mt-1">
                                            <View className="flex-row items-center mr-3">
                                                <Icon name="calendar" size={12} color="#9ca3af" />
                                                <Text className="text-gray-400 text-xs ml-1">
                                                    {new Date(record.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </Text>
                                            </View>
                                            {record.punchInTime && (
                                                <View className="flex-row items-center mr-3">
                                                    <Icon name="login" size={12} color="#9ca3af" />
                                                    <Text className="text-gray-400 text-xs ml-1">
                                                        {new Date(
                                                            record.punchInTime,
                                                        ).toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </Text>
                                                </View>
                                            )}
                                            {record.punchOutTime && (
                                                <View className="flex-row items-center mr-3">
                                                    <Icon name="logout" size={12} color="#9ca3af" />
                                                    <Text className="text-gray-400 text-xs ml-1">
                                                        {new Date(
                                                            record.punchOutTime,
                                                        ).toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </Text>
                                                </View>
                                            )}
                                            {record.duration > 0 && (
                                                <View className="flex-row items-center">
                                                    <Icon
                                                        name="clock-outline"
                                                        size={12}
                                                        color="#9ca3af"
                                                    />
                                                    <Text className="text-gray-400 text-xs ml-1">
                                                        {formatDuration(record.duration)}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* Status Badge */}
                                    <View
                                        className="px-3 py-1 rounded-full"
                                        style={{ backgroundColor: statusConfig.bgColor }}>
                                        <Text
                                            className="text-xs font-semibold"
                                            style={{ color: statusConfig.textColor }}>
                                            {statusConfig.label}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <View className="bg-white rounded-xl p-8 items-center">
                            <Icon name="calendar-blank" size={48} color="#d1d5db" />
                            <Text className="text-gray-400 mt-2 text-base">
                                No attendance records found
                            </Text>
                            <Text className="text-gray-300 text-sm mt-1">
                                Punch in to start tracking your visits!
                            </Text>
                        </View>
                    )}
                </View>

                {/* ─── Achievements ─── */}
                <SectionHeader
                    title="Achievements"
                    icon="trophy"
                    showSeeAll={false}
                />
                <View className="px-4">
                    {achievements.map((achievement, index) => (
                        <View
                            key={index}
                            className={`bg-white rounded-xl p-4 mb-3 flex-row items-start shadow-sm ${achievement.earned ? 'border-2 border-emerald-300' : 'opacity-50'
                                }`}
                            style={{ elevation: achievement.earned ? 3 : 1 }}>
                            <Text className="text-3xl mr-3">{achievement.icon}</Text>
                            <View className="flex-1">
                                <Text className="text-gray-900 font-semibold text-sm">
                                    {achievement.title}
                                </Text>
                                <Text className="text-gray-400 text-xs mt-1">
                                    {achievement.description}
                                </Text>
                            </View>
                            {achievement.earned && (
                                <View className="bg-emerald-100 w-8 h-8 rounded-full justify-center items-center">
                                    <Icon name="trophy" size={18} color="#059669" />
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Bottom Spacing */}
                <View className="h-8" />
            </ScrollView>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── PUNCH IN MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showPunchInModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPunchInModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6">
                        {/* Modal Header */}
                        <View className="flex-row justify-between items-center mb-2">
                            <View className="flex-row items-center">
                                <Icon name="login" size={22} color="#059669" />
                                <Text className="text-gray-900 font-bold text-xl ml-2">
                                    Punch In
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowPunchInModal(false)}
                                className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center">
                                <Icon name="close" size={20} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-gray-500 text-sm mb-6">
                            Select a facility and add optional notes to start your session.
                        </Text>

                        {/* Facility Selection */}
                        <Text className="text-gray-700 font-medium text-sm mb-3">
                            Select Facility (Optional)
                        </Text>
                        <View className="mb-4">
                            {facilities.map(facility => (
                                <TouchableOpacity
                                    key={facility._id}
                                    onPress={() =>
                                        setSelectedFacility(
                                            selectedFacility === facility._id ? '' : facility._id,
                                        )
                                    }
                                    className={`flex-row items-center p-4 rounded-xl mb-2 border-2 ${selectedFacility === facility._id
                                            ? 'border-emerald-500 bg-emerald-50'
                                            : 'border-gray-200 bg-white'
                                        }`}
                                    activeOpacity={0.7}>
                                    <Icon
                                        name={
                                            selectedFacility === facility._id
                                                ? 'radiobox-marked'
                                                : 'radiobox-blank'
                                        }
                                        size={22}
                                        color={
                                            selectedFacility === facility._id ? '#059669' : '#d1d5db'
                                        }
                                    />
                                    <View className="ml-3 flex-1">
                                        <Text className="text-gray-900 font-semibold">
                                            {facility.name}
                                        </Text>
                                        <Text className="text-gray-400 text-xs">
                                            {facility.type}
                                        </Text>
                                    </View>
                                    <Icon name="map-marker" size={16} color="#9ca3af" />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Notes */}
                        <Text className="text-gray-700 font-medium text-sm mb-2">
                            Notes (Optional)
                        </Text>
                        <TextInput
                            className="bg-gray-100 rounded-xl p-4 text-gray-900 mb-6"
                            placeholder="E.g., Leg day, Cardio session..."
                            placeholderTextColor="#9ca3af"
                            value={punchNotes}
                            onChangeText={setPunchNotes}
                            multiline
                            numberOfLines={2}
                            textAlignVertical="top"
                        />

                        {/* Buttons */}
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setShowPunchInModal(false)}
                                className="flex-1 border border-gray-300 rounded-xl py-4 items-center">
                                <Text className="text-gray-700 font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handlePunchInConfirm}
                                activeOpacity={0.8}
                                className="flex-1"
                                disabled={punchLoading}>
                                <LinearGradient
                                    colors={['#059669', '#10b981']}
                                    className="rounded-xl py-4 items-center flex-row justify-center">
                                    {punchLoading ? (
                                        <ActivityIndicator
                                            size="small"
                                            color="#fff"
                                            style={{ marginRight: 8 }}
                                        />
                                    ) : (
                                        <Icon
                                            name="login"
                                            size={18}
                                            color="#fff"
                                            style={{ marginRight: 8 }}
                                        />
                                    )}
                                    <Text className="text-white font-bold">
                                        {punchLoading ? 'Punching In...' : 'Confirm Punch In'}
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

export default AttendanceScreen;