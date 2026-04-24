import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Modal,
    Alert,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DrawerMenuButton from '../../components/DrawerMenuButton';
import {
    coachAttendanceRecords,
    coachSelfAttendanceRecords,
    coachSelfAttendanceStats,
    clubFacilities,
} from '../../data/attendance';
import { coachProfile } from '../../data/user';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Constants ───
const ITEMS_PER_PAGE = 10;

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

const formatDuration = minutes => {
    if (!minutes && minutes !== 0) return 'N/A';
    if (minutes === 0) return '0m';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
};

const formatElapsedTime = seconds => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getStatusStyle = status => {
    switch (status) {
        case 'completed':
            return { bg: '#dcfce7', text: '#166534', label: 'Completed', icon: 'check-circle', gradient: ['#22c55e', '#4ade80'] };
        case 'active':
            return { bg: '#fef3c7', text: '#92400e', label: 'Active', icon: 'timer-sand', gradient: ['#f59e0b', '#fbbf24'] };
        case 'incomplete':
            return { bg: '#fee2e2', text: '#991b1b', label: 'Incomplete', icon: 'alert-circle', gradient: ['#ef4444', '#f87171'] };
        default:
            return { bg: '#f3f4f6', text: '#374151', label: status || 'Unknown', icon: 'help-circle', gradient: ['#6b7280', '#9ca3af'] };
    }
};

// ═══════════════════════════════════════════════
// ─── SECTION TITLE COMPONENT ───
// ═══════════════════════════════════════════════
const SectionTitle = ({ title, icon, onViewAll, iconColor = '#1e3a8a', subtitle }) => (
    <View className="mb-4">
        <View className="flex-row justify-between items-center">
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
        {subtitle ? (
            <Text className="text-gray-400 text-xs mt-1 ml-10">{subtitle}</Text>
        ) : null}
    </View>
);

// ═══════════════════════════════════════════════
// ─── ATTENDANCE RECORD ITEM (Member Records) ───
// ═══════════════════════════════════════════════
const AttendanceRecordItem = ({ record }) => {
    const statusStyle = getStatusStyle(record.status);
    const initial = (record.memberName || 'M').charAt(0).toUpperCase();

    const getSportColor = (sport) => {
        const colors = {
            Karate: '#ef4444',
            Badminton: '#22c55e',
            Swimming: '#3b82f6',
            Boxing: '#f59e0b',
            Weightlifting: '#8b5cf6',
            Yoga: '#ec4899',
        };
        return colors[sport] || '#6b7280';
    };

    return (
        <View
            className="bg-white rounded-2xl mx-4 mb-3 p-4 shadow-sm"
            style={{
                elevation: 2,
                borderLeftWidth: 3,
                borderLeftColor: record.sport ? getSportColor(record.sport) : '#3b82f6',
            }}>
            <View className="flex-row items-start">
                {/* Avatar */}
                <LinearGradient
                    colors={['#3b82f6', '#60a5fa']}
                    className="w-11 h-11 rounded-full justify-center items-center"
                    style={{ borderRadius: 22 }}>
                    <Text className="text-white font-bold text-base">{initial}</Text>
                </LinearGradient>

                {/* Info */}
                <View className="flex-1 ml-3">
                    <View className="flex-row items-center flex-wrap gap-1.5">
                        <Text
                            className="text-gray-900 font-bold text-sm"
                            numberOfLines={1}>
                            {record.memberName || 'Unknown Member'}
                        </Text>
                        <View
                            className="px-2 py-0.5 rounded-full flex-row items-center"
                            style={{ backgroundColor: statusStyle.bg }}>
                            <Icon name={statusStyle.icon} size={10} color={statusStyle.text} />
                            <Text
                                className="text-[10px] font-bold capitalize ml-0.5"
                                style={{ color: statusStyle.text }}>
                                {statusStyle.label}
                            </Text>
                        </View>
                        {record.sessionWithCoach ? (
                            <View className="bg-purple-100 px-2 py-0.5 rounded-full flex-row items-center">
                                <Icon name="account-star" size={10} color="#7c3aed" />
                                <Text className="text-purple-700 text-[10px] font-bold ml-0.5">
                                    With Coach
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Details Row */}
                    <View className="flex-row items-center flex-wrap mt-1.5 gap-x-3 gap-y-1">
                        <View className="flex-row items-center">
                            <Icon name="calendar-outline" size={12} color="#9ca3af" />
                            <Text className="text-gray-400 text-xs ml-1">
                                {formatDate(record.date)}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Icon name="clock-outline" size={12} color="#9ca3af" />
                            <Text className="text-gray-400 text-xs ml-1">
                                {formatTime(record.punchInTime)} →{' '}
                                {record.punchOutTime
                                    ? formatTime(record.punchOutTime)
                                    : 'Active'}
                            </Text>
                        </View>
                        {record.facility ? (
                            <View className="flex-row items-center">
                                <Icon name="map-marker-outline" size={12} color="#9ca3af" />
                                <Text className="text-gray-400 text-xs ml-1">
                                    {record.facility}
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Sport tag */}
                    {record.sport ? (
                        <View className="flex-row mt-1.5">
                            <View
                                className="px-2.5 py-0.5 rounded-full flex-row items-center"
                                style={{ backgroundColor: `${getSportColor(record.sport)}12` }}>
                                <Icon name="dumbbell" size={10} color={getSportColor(record.sport)} />
                                <Text
                                    className="text-[10px] font-bold ml-1"
                                    style={{ color: getSportColor(record.sport) }}>
                                    {record.sport}
                                </Text>
                            </View>
                        </View>
                    ) : null}
                </View>

                {/* Duration */}
                <View className="items-end ml-2 bg-gray-50 rounded-xl px-3 py-2">
                    <Text className="text-gray-900 font-bold text-sm">
                        {formatDuration(record.duration)}
                    </Text>
                    {record.clubName ? (
                        <Text className="text-gray-400 text-[10px] mt-0.5">
                            {record.clubName}
                        </Text>
                    ) : null}
                </View>
            </View>
        </View>
    );
};

// ═══════════════════════════════════════════════
// ─── COACH SELF ATTENDANCE RECORD ITEM ───
// ═══════════════════════════════════════════════
const CoachSelfRecordItem = ({ record, isLast }) => {
    const statusStyle = getStatusStyle(record.status);

    return (
        <View className={`flex-row ${!isLast ? 'mb-3' : ''}`}>
            {/* Timeline */}
            <View className="items-center mr-3" style={{ width: 40 }}>
                <LinearGradient
                    colors={statusStyle.gradient}
                    className="w-10 h-10 rounded-full justify-center items-center"
                    style={{ borderRadius: 20 }}>
                    <Icon
                        name={statusStyle.icon}
                        size={18}
                        color="#fff"
                    />
                </LinearGradient>
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
                className="flex-1 bg-white rounded-2xl p-4 shadow-sm"
                style={{
                    elevation: 2,
                    borderLeftWidth: 3,
                    borderLeftColor: statusStyle.text,
                }}>
                <View className="flex-row items-start justify-between">
                    <View className="flex-1 mr-2">
                        <Text className="text-gray-900 font-bold text-sm">
                            {record.facility || 'General'}
                        </Text>
                        <View className="flex-row flex-wrap items-center mt-1.5 gap-x-3 gap-y-1">
                            <View className="flex-row items-center">
                                <Icon name="calendar" size={12} color="#9ca3af" />
                                <Text className="text-gray-400 text-xs ml-1">
                                    {formatDate(record.date)}
                                </Text>
                            </View>
                            {record.punchInTime ? (
                                <View className="flex-row items-center">
                                    <Icon name="login" size={12} color="#22c55e" />
                                    <Text className="text-gray-400 text-xs ml-1">
                                        {formatTime(record.punchInTime)}
                                    </Text>
                                </View>
                            ) : null}
                            {record.punchOutTime ? (
                                <View className="flex-row items-center">
                                    <Icon name="logout" size={12} color="#ef4444" />
                                    <Text className="text-gray-400 text-xs ml-1">
                                        {formatTime(record.punchOutTime)}
                                    </Text>
                                </View>
                            ) : null}
                            {record.duration > 0 ? (
                                <View className="flex-row items-center">
                                    <Icon name="clock-outline" size={12} color="#9ca3af" />
                                    <Text className="text-gray-400 text-xs ml-1">
                                        {formatDuration(record.duration)}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                        {record.notes ? (
                            <Text className="text-gray-300 text-xs mt-1.5" numberOfLines={1}>
                                💬 {record.notes}
                            </Text>
                        ) : null}
                    </View>

                    {/* Status Badge */}
                    <View
                        className="px-2.5 py-1 rounded-full flex-row items-center"
                        style={{ backgroundColor: statusStyle.bg }}>
                        <Icon name={statusStyle.icon} size={12} color={statusStyle.text} />
                        <Text
                            className="text-[10px] font-bold ml-1"
                            style={{ color: statusStyle.text }}>
                            {statusStyle.label}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

// ═══════════════════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════
const CoachAttendanceScreen = ({ navigation }) => {
    // ─── Tab State ───
    const [activeTab, setActiveTab] = useState('myAttendance'); // 'myAttendance' | 'memberRecords'

    // ─── Member Records State ───
    const [allRecords] = useState(coachAttendanceRecords);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    // ─── Coach Self Attendance State ───
    const [selfRecords, setSelfRecords] = useState(coachSelfAttendanceRecords);
    const [selfStats] = useState(coachSelfAttendanceStats);
    const [activeSession, setActiveSession] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef(null);

    // ─── Punch In Modal State ───
    const [showPunchInModal, setShowPunchInModal] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState('');
    const [punchNotes, setPunchNotes] = useState('');
    const [punchLoading, setPunchLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 600);
        return () => clearTimeout(timer);
    }, []);

    // ─── Live Timer for Active Session ───
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

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setRefreshing(false);
    }, []);

    // ─── Punch In Handler ───
    const handlePunchInClick = () => {
        setSelectedFacility('');
        setPunchNotes('');
        setShowPunchInModal(true);
    };

    const handlePunchInConfirm = async () => {
        try {
            setPunchLoading(true);
            await new Promise(resolve => setTimeout(resolve, 800));

            const facilityObj = clubFacilities.find(f => f._id === selectedFacility);
            const newSession = {
                _id: `csa_${Date.now()}`,
                punchInTime: new Date().toISOString(),
                facility: facilityObj?.name || 'General',
                clubName: 'Downtown Fitness Hub',
                notes: punchNotes.trim(),
            };

            setActiveSession(newSession);
            setShowPunchInModal(false);
            Alert.alert(
                '✅ Punched In!',
                `You have punched in at ${facilityObj?.name || 'the club'}. Your shift has started!`,
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to punch in. Please try again.');
        } finally {
            setPunchLoading(false);
        }
    };

    // ─── Punch Out Handler ───
    const handlePunchOut = async () => {
        try {
            setPunchLoading(true);
            await new Promise(resolve => setTimeout(resolve, 800));

            const durationMinutes = Math.round(elapsedTime / 60);
            Alert.alert(
                '👋 Punched Out!',
                `Shift completed. Duration: ${formatDuration(durationMinutes)}`,
            );

            const newRecord = {
                _id: activeSession._id,
                date: activeSession.punchInTime,
                punchInTime: activeSession.punchInTime,
                punchOutTime: new Date().toISOString(),
                facility: activeSession.facility,
                duration: durationMinutes,
                status: 'completed',
                clubName: activeSession.clubName,
                notes: activeSession.notes,
            };
            setSelfRecords(prev => [newRecord, ...prev]);
            setActiveSession(null);
        } catch (error) {
            Alert.alert('Error', 'Failed to punch out. Please try again.');
        } finally {
            setPunchLoading(false);
        }
    };

    // ─── Filtered & Paginated Member Records ───
    const filteredRecords = useMemo(() => {
        let records = [...allRecords];

        if (startDate) {
            records = records.filter(r => r.date >= startDate);
        }
        if (endDate) {
            records = records.filter(r => r.date <= endDate);
        }

        records.sort((a, b) => new Date(b.date) - new Date(a.date));
        return records;
    }, [allRecords, startDate, endDate]);

    const totalRecords = filteredRecords.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / ITEMS_PER_PAGE));
    const paginatedRecords = filteredRecords.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    // ─── Member Records Summary Stats ───
    const memberStats = useMemo(() => {
        const completed = filteredRecords.filter(
            r => r.status === 'completed',
        ).length;
        const withCoach = filteredRecords.filter(r => r.sessionWithCoach).length;
        const durations = filteredRecords
            .filter(r => r.duration)
            .map(r => r.duration);
        const avgDuration =
            durations.length > 0
                ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length)
                : 0;

        return {
            totalRecords,
            completedVisits: completed,
            avgDuration,
            withCoach,
        };
    }, [filteredRecords, totalRecords]);

    const handleApplyFilter = () => {
        setCurrentPage(1);
        setShowFilters(false);
    };

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
        setShowFilters(false);
    };

    // ─── Stats Configs ───
    const selfStatsConfig = [
        {
            label: 'Total Days',
            value: selfStats.totalDays.toString(),
            icon: 'calendar-check',
            color: '#3b82f6',
            gradient: ['#3b82f6', '#60a5fa'],
        },
        {
            label: 'Completed',
            value: selfStats.completedDays.toString(),
            icon: 'check-circle',
            color: '#22c55e',
            gradient: ['#22c55e', '#4ade80'],
        },
        {
            label: 'Rate',
            value: `${selfStats.attendanceRate}%`,
            icon: 'trending-up',
            color: '#f59e0b',
            gradient: ['#f59e0b', '#fbbf24'],
        },
        {
            label: 'Streak',
            value: `${selfStats.currentStreak}d`,
            icon: 'fire',
            color: '#ef4444',
            gradient: ['#ef4444', '#f87171'],
        },
    ];

    const memberStatsConfig = [
        {
            label: 'Total Records',
            value: memberStats.totalRecords,
            icon: 'account-group-outline',
            color: '#3b82f6',
            gradient: ['#3b82f6', '#60a5fa'],
        },
        {
            label: 'Completed',
            value: memberStats.completedVisits,
            icon: 'check-circle-outline',
            color: '#22c55e',
            gradient: ['#22c55e', '#4ade80'],
        },
        {
            label: 'Avg Duration',
            value: formatDuration(memberStats.avgDuration),
            icon: 'clock-outline',
            color: '#f97316',
            gradient: ['#f97316', '#fb923c'],
        },
        {
            label: 'With Coach',
            value: memberStats.withCoach,
            icon: 'account-star',
            color: '#8b5cf6',
            gradient: ['#8b5cf6', '#a78bfa'],
        },
    ];

    // ─── Loading State ───
    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <View className="w-16 h-16 rounded-2xl bg-blue-50 justify-center items-center mb-4">
                    <ActivityIndicator size="large" color="#1e3a8a" />
                </View>
                <Text className="text-gray-900 font-bold text-base">Loading Attendance</Text>
                <Text className="text-gray-400 mt-1 text-sm">Preparing your records...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* ═══════════════════════════════════════════════ */}
            {/* ─── HEADER ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <LinearGradient
                colors={['#0f172a', '#1e3a8a', '#3b82f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingTop: 48, paddingBottom: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
                {/* Top Bar */}
                <View className="flex-row justify-between items-center px-5 mb-4">
                    <DrawerMenuButton />
                    <View className="flex-row items-center">
                        {activeTab === 'memberRecords' ? (
                            <TouchableOpacity
                                onPress={() => setShowFilters(!showFilters)}
                                className="w-10 h-10 bg-white/15 rounded-full justify-center items-center mr-2">
                                <Icon
                                    name={showFilters ? 'filter-off' : 'filter-variant'}
                                    size={22}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                        ) : null}
                        <TouchableOpacity
                            onPress={onRefresh}
                            disabled={refreshing}
                            className="w-10 h-10 bg-white/15 rounded-full justify-center items-center">
                            <Icon
                                name="refresh"
                                size={22}
                                color="#fff"
                                style={refreshing ? { opacity: 0.5 } : {}}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Title */}
                <View className="px-5 mb-4">
                    <Text className="text-white/60 text-sm font-medium">Coach Portal</Text>
                    <Text className="text-white font-bold text-2xl mt-0.5">Attendance</Text>
                    <Text className="text-white/70 text-sm mt-1">
                        Track your & member attendance
                    </Text>
                </View>

                {/* Tab Switcher */}
                <View className="mx-5 flex-row bg-white/10 rounded-2xl p-1" style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                    <TouchableOpacity
                        onPress={() => setActiveTab('myAttendance')}
                        className="flex-1 py-3 rounded-xl items-center flex-row justify-center"
                        style={activeTab === 'myAttendance' ? { backgroundColor: '#fff' } : {}}
                        activeOpacity={0.7}>
                        <Icon
                            name="account-check"
                            size={16}
                            color={activeTab === 'myAttendance' ? '#1e3a8a' : '#fff'}
                        />
                        <Text
                            className={`font-bold text-sm ml-2 ${activeTab === 'myAttendance'
                                ? 'text-blue-900'
                                : 'text-white'
                                }`}>
                            My Attendance
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('memberRecords')}
                        className="flex-1 py-3 rounded-xl items-center flex-row justify-center"
                        style={activeTab === 'memberRecords' ? { backgroundColor: '#fff' } : {}}
                        activeOpacity={0.7}>
                        <Icon
                            name="account-group"
                            size={16}
                            color={activeTab === 'memberRecords' ? '#1e3a8a' : '#fff'}
                        />
                        <Text
                            className={`font-bold text-sm ml-2 ${activeTab === 'memberRecords'
                                ? 'text-blue-900'
                                : 'text-white'
                                }`}>
                            Member Records
                        </Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── MY ATTENDANCE TAB ─── */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'myAttendance' ? (
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
                    {/* ─── Punch In / Punch Out Card ─── */}
                    <View className="px-4 mt-4">
                        <TouchableOpacity
                            onPress={activeSession ? undefined : handlePunchInClick}
                            activeOpacity={activeSession ? 1 : 0.85}>
                            <LinearGradient
                                colors={activeSession ? ['#7f1d1d', '#dc2626'] : ['#0f172a', '#1e3a8a']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ borderRadius: 20, padding: 20 }}>
                                <View className="flex-row items-center justify-between mb-4">
                                    <View className="flex-row items-center">
                                        <Icon
                                            name={activeSession ? 'timer-sand' : 'clipboard-check-outline'}
                                            size={20}
                                            color={activeSession ? '#fca5a5' : '#60a5fa'}
                                        />
                                        <Text className="text-white font-bold text-base ml-2">
                                            {activeSession ? 'Shift Active' : 'Ready to Start?'}
                                        </Text>
                                    </View>
                                    {activeSession ? (
                                        <View className="bg-red-400/20 px-3 py-1.5 rounded-full flex-row items-center">
                                            <View className="w-2 h-2 rounded-full bg-red-400 mr-1.5" />
                                            <Text className="text-red-300 text-xs font-bold">
                                                In Progress
                                            </Text>
                                        </View>
                                    ) : (
                                        <View className="bg-green-400/20 px-3 py-1.5 rounded-full flex-row items-center">
                                            <View className="w-2 h-2 rounded-full bg-green-400 mr-1.5" />
                                            <Text className="text-green-400 text-xs font-bold">
                                                {selfStats.attendanceRate}% Rate
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center flex-1">
                                        <View
                                            className="w-12 h-12 rounded-2xl justify-center items-center"
                                            style={{ backgroundColor: activeSession ? 'rgba(239,68,68,0.2)' : 'rgba(249,115,22,0.2)' }}>
                                            {activeSession ? (
                                                <Text className="text-2xl">⏱️</Text>
                                            ) : (
                                                <Text className="text-2xl">🔥</Text>
                                            )}
                                        </View>
                                        <View className="ml-3 flex-1">
                                            {activeSession ? (
                                                <>
                                                    <Text className="text-white font-bold text-xl">
                                                        {formatElapsedTime(elapsedTime)}
                                                    </Text>
                                                    <View className="flex-row items-center mt-0.5">
                                                        <Icon name="clock-outline" size={12} color="rgba(255,255,255,0.5)" />
                                                        <Text className="text-white/50 text-xs ml-1">
                                                            Started {formatTime(activeSession.punchInTime)}
                                                        </Text>
                                                    </View>
                                                    {activeSession.facility ? (
                                                        <View className="flex-row items-center mt-0.5">
                                                            <Icon name="map-marker" size={12} color="rgba(255,255,255,0.5)" />
                                                            <Text className="text-white/50 text-xs ml-1">
                                                                {activeSession.facility}
                                                            </Text>
                                                        </View>
                                                    ) : null}
                                                </>
                                            ) : (
                                                <>
                                                    <Text className="text-white font-bold text-xl">
                                                        {selfStats.currentStreak} Day Streak
                                                    </Text>
                                                    <Text className="text-blue-300/70 text-xs mt-0.5">
                                                        {selfStats.totalHours}h total this month
                                                    </Text>
                                                </>
                                            )}
                                        </View>
                                    </View>

                                    {activeSession ? (
                                        <TouchableOpacity
                                            onPress={handlePunchOut}
                                            disabled={punchLoading}
                                            activeOpacity={0.8}>
                                            <LinearGradient
                                                colors={['#ef4444', '#dc2626']}
                                                style={{
                                                    borderRadius: 12,
                                                    paddingHorizontal: 16,
                                                    paddingVertical: 10,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                }}>
                                                {punchLoading ? (
                                                    <ActivityIndicator size="small" color="#fff" />
                                                ) : (
                                                    <>
                                                        <Icon name="logout" size={16} color="#fff" />
                                                        <Text className="text-white font-bold text-xs ml-1.5">
                                                            Punch Out
                                                        </Text>
                                                    </>
                                                )}
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={handlePunchInClick}
                                            disabled={punchLoading}
                                            activeOpacity={0.8}>
                                            <LinearGradient
                                                colors={['#22c55e', '#16a34a']}
                                                style={{
                                                    borderRadius: 12,
                                                    paddingHorizontal: 16,
                                                    paddingVertical: 10,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                }}>
                                                {punchLoading ? (
                                                    <ActivityIndicator size="small" color="#fff" />
                                                ) : (
                                                    <>
                                                        <Icon name="login" size={16} color="#fff" />
                                                        <Text className="text-white font-bold text-xs ml-1.5">
                                                            Punch In
                                                        </Text>
                                                    </>
                                                )}
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* ─── Self Stats Grid ─── */}
                    <View className="px-4 mt-5">
                        <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
                            {selfStatsConfig.map(stat => (
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

                    {/* ─── Monthly Summary Card ─── */}
                    <View className="px-4 mt-6">
                        <SectionTitle title="Monthly Summary" icon="chart-arc" iconColor="#22c55e" />
                        <View
                            className="bg-white rounded-2xl p-5 shadow-md"
                            style={{ elevation: 3 }}>

                            {/* Progress Bar */}
                            <View className="mb-4">
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                                        Attendance ({selfStats.completedDays}/{selfStats.totalDays} days)
                                    </Text>
                                    <Text className="text-blue-600 text-xs font-bold">
                                        {selfStats.attendanceRate}%
                                    </Text>
                                </View>
                                <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <LinearGradient
                                        colors={['#1e3a8a', '#3b82f6']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{
                                            height: '100%',
                                            width: `${selfStats.attendanceRate}%`,
                                            borderRadius: 999,
                                        }}
                                    />
                                </View>
                            </View>

                            {/* Stats Row */}
                            <View className="flex-row pt-4 border-t border-gray-50">
                                {[
                                    { value: `${selfStats.totalHours}h`, label: 'Total Hours', color: '#3b82f6' },
                                    { value: `${selfStats.avgHoursPerDay}h`, label: 'Avg/Day', color: '#22c55e' },
                                    { value: selfStats.completedDays, label: 'Completed', color: '#f59e0b' },
                                    { value: selfStats.incompleteDays, label: 'Incomplete', color: '#ef4444' },
                                ].map((item, idx) => (
                                    <View key={item.label} className="flex-1 items-center">
                                        <View
                                            className="w-12 h-12 rounded-full justify-center items-center mb-1.5"
                                            style={{
                                                backgroundColor: `${item.color}12`,
                                                borderWidth: 2.5,
                                                borderColor: `${item.color}30`,
                                            }}>
                                            <Text className="font-bold text-base" style={{ color: item.color }}>
                                                {item.value}
                                            </Text>
                                        </View>
                                        <Text className="text-gray-500 text-[10px] text-center font-medium">
                                            {item.label}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* ─── Self Attendance History ─── */}
                    <View className="px-4 mt-6">
                        <SectionTitle
                            title="My History"
                            icon="history"
                            iconColor="#f59e0b"
                            subtitle="Your punch in/out records at the club"
                        />

                        {selfRecords.length > 0 ? (
                            selfRecords.map((record, index) => (
                                <CoachSelfRecordItem
                                    key={record._id}
                                    record={record}
                                    isLast={index === selfRecords.length - 1}
                                />
                            ))
                        ) : (
                            <View className="bg-white rounded-2xl p-8 items-center shadow-sm" style={{ elevation: 2 }}>
                                <View className="w-16 h-16 rounded-full bg-gray-50 justify-center items-center mb-3">
                                    <Icon name="calendar-blank" size={32} color="#d1d5db" />
                                </View>
                                <Text className="text-gray-400 font-medium text-base">
                                    No attendance records yet
                                </Text>
                                <Text className="text-gray-300 text-sm mt-1">
                                    Punch in to start tracking your shifts!
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Bottom Spacing */}
                    <View className="h-8" />
                </ScrollView>
            ) : null}

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── MEMBER RECORDS TAB ─── */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'memberRecords' ? (
                <View className="flex-1">
                    {/* ═══ Summary Stats ═══ */}
                    <View className="px-4 mt-4">
                        <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
                            {memberStatsConfig.map(stat => (
                                <View key={stat.label} style={{ width: '50%', padding: 4 }}>
                                    <View
                                        className="bg-white rounded-2xl p-4 shadow-md"
                                        style={{ elevation: 4 }}>
                                        <View className="flex-row justify-between items-start">
                                            <View className="flex-1">
                                                <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                                                    {stat.label}
                                                </Text>
                                                <Text className="text-gray-900 font-bold text-2xl mt-1">
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

                    {/* ═══ Filter Panel ═══ */}
                    {showFilters ? (
                        <View className="px-4 mt-4">
                            <View
                                className="bg-white rounded-2xl p-5 shadow-md"
                                style={{ elevation: 3 }}>
                                <View className="flex-row items-center mb-4">
                                    <View className="w-8 h-8 rounded-lg bg-blue-50 justify-center items-center mr-2.5">
                                        <Icon name="calendar-search" size={16} color="#1e3a8a" />
                                    </View>
                                    <Text className="text-gray-900 font-bold text-lg">
                                        Filter Records
                                    </Text>
                                </View>

                                <View className="flex-row gap-3 mb-4">
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                                            Start Date
                                        </Text>
                                        <TextInput
                                            className="bg-gray-50 rounded-2xl px-4 py-3 text-gray-900 text-sm"
                                            style={{ borderWidth: 1.5, borderColor: startDate ? '#3b82f6' : '#f3f4f6' }}
                                            placeholder="YYYY-MM-DD"
                                            placeholderTextColor="#9ca3af"
                                            value={startDate}
                                            onChangeText={setStartDate}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                                            End Date
                                        </Text>
                                        <TextInput
                                            className="bg-gray-50 rounded-2xl px-4 py-3 text-gray-900 text-sm"
                                            style={{ borderWidth: 1.5, borderColor: endDate ? '#3b82f6' : '#f3f4f6' }}
                                            placeholder="YYYY-MM-DD"
                                            placeholderTextColor="#9ca3af"
                                            value={endDate}
                                            onChangeText={setEndDate}
                                        />
                                    </View>
                                </View>

                                <View className="flex-row" style={{ gap: 8 }}>
                                    <TouchableOpacity
                                        onPress={handleApplyFilter}
                                        className="flex-1"
                                        activeOpacity={0.8}>
                                        <LinearGradient
                                            colors={['#1e3a8a', '#3b82f6']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={{
                                                borderRadius: 14,
                                                paddingVertical: 12,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                            <Icon name="check" size={16} color="#fff" />
                                            <Text className="text-white font-bold text-sm ml-1.5">
                                                Apply
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleClearFilters}
                                        className="flex-1"
                                        activeOpacity={0.8}
                                        style={{
                                            borderRadius: 14,
                                            borderWidth: 1.5,
                                            borderColor: '#e5e7eb',
                                            paddingVertical: 12,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                        <Icon name="close" size={16} color="#6b7280" />
                                        <Text className="text-gray-600 font-bold text-sm ml-1.5">
                                            Clear
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ) : null}

                    {/* ═══ Records Count ═══ */}
                    <View className="flex-row justify-between items-center px-4 mt-4 mb-2">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 rounded-lg bg-blue-50 justify-center items-center mr-2.5">
                                <Icon name="clipboard-list" size={16} color="#1e3a8a" />
                            </View>
                            <Text className="text-gray-900 font-bold text-lg">
                                Member Records
                            </Text>
                        </View>
                        <View className="bg-gray-100 px-3 py-1.5 rounded-full">
                            <Text className="text-gray-500 text-xs font-semibold">
                                {paginatedRecords.length} of {totalRecords}
                            </Text>
                        </View>
                    </View>

                    {/* ═══ Records List ═══ */}
                    <FlatList
                        data={paginatedRecords}
                        renderItem={({ item }) => <AttendanceRecordItem record={item} />}
                        keyExtractor={item => item._id}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#1e3a8a']}
                                tintColor="#1e3a8a"
                            />
                        }
                        ListEmptyComponent={
                            <View className="items-center mt-16 px-6">
                                <View className="w-20 h-20 rounded-full bg-gray-50 justify-center items-center mb-4">
                                    <Icon name="calendar-remove-outline" size={40} color="#d1d5db" />
                                </View>
                                <Text className="text-gray-400 text-lg font-bold">
                                    No records found
                                </Text>
                                <Text className="text-gray-300 text-sm mt-1 text-center">
                                    {startDate || endDate
                                        ? 'Try adjusting your date filters'
                                        : 'No attendance records available yet'}
                                </Text>
                            </View>
                        }
                    />

                    {/* ═══ Pagination ═══ */}
                    {totalPages > 1 ? (
                        <View
                            className="absolute bottom-0 left-0 right-0 bg-white px-4 py-3 flex-row items-center justify-between"
                            style={{
                                elevation: 8,
                                borderTopWidth: 1,
                                borderTopColor: '#f3f4f6',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: -2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 4,
                            }}>
                            <View className="bg-gray-100 px-3 py-1.5 rounded-full">
                                <Text className="text-gray-500 text-xs font-semibold">
                                    Page {currentPage} of {totalPages}
                                </Text>
                            </View>
                            <View className="flex-row" style={{ gap: 8 }}>
                                <TouchableOpacity
                                    onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage <= 1}
                                    activeOpacity={0.8}>
                                    {currentPage <= 1 ? (
                                        <View
                                            style={{
                                                borderRadius: 12,
                                                paddingHorizontal: 16,
                                                paddingVertical: 10,
                                                backgroundColor: '#f9fafb',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                            }}>
                                            <Icon name="chevron-left" size={16} color="#d1d5db" />
                                            <Text className="text-gray-300 text-sm font-bold ml-1">
                                                Previous
                                            </Text>
                                        </View>
                                    ) : (
                                        <LinearGradient
                                            colors={['#eff6ff', '#dbeafe']}
                                            style={{
                                                borderRadius: 12,
                                                paddingHorizontal: 16,
                                                paddingVertical: 10,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                            }}>
                                            <Icon name="chevron-left" size={16} color="#2563eb" />
                                            <Text className="text-blue-600 text-sm font-bold ml-1">
                                                Previous
                                            </Text>
                                        </LinearGradient>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() =>
                                        setCurrentPage(prev => Math.min(totalPages, prev + 1))
                                    }
                                    disabled={currentPage >= totalPages}
                                    activeOpacity={0.8}>
                                    {currentPage >= totalPages ? (
                                        <View
                                            style={{
                                                borderRadius: 12,
                                                paddingHorizontal: 16,
                                                paddingVertical: 10,
                                                backgroundColor: '#f9fafb',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                            }}>
                                            <Text className="text-gray-300 text-sm font-bold mr-1">
                                                Next
                                            </Text>
                                            <Icon name="chevron-right" size={16} color="#d1d5db" />
                                        </View>
                                    ) : (
                                        <LinearGradient
                                            colors={['#1e3a8a', '#3b82f6']}
                                            style={{
                                                borderRadius: 12,
                                                paddingHorizontal: 16,
                                                paddingVertical: 10,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                            }}>
                                            <Text className="text-white text-sm font-bold mr-1">
                                                Next
                                            </Text>
                                            <Icon name="chevron-right" size={16} color="#fff" />
                                        </LinearGradient>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : null}
                </View>
            ) : null}

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── PUNCH IN MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showPunchInModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPunchInModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl">
                        <View className="p-5">
                            {/* Handle bar */}
                            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-4" />

                            {/* Modal Header */}
                            <View className="flex-row justify-between items-center mb-2">
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 rounded-lg bg-blue-50 justify-center items-center mr-2.5">
                                        <Icon name="login" size={16} color="#1e3a8a" />
                                    </View>
                                    <Text className="text-gray-900 font-bold text-lg">
                                        Punch In
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setShowPunchInModal(false)}
                                    className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center">
                                    <Icon name="close" size={18} color="#6b7280" />
                                </TouchableOpacity>
                            </View>
                            <Text className="text-gray-400 text-sm mb-4 ml-10">
                                Select the facility where you'll be coaching today.
                            </Text>

                            {/* Coach Info */}
                            <LinearGradient
                                colors={['#0f172a', '#1e3a8a']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ borderRadius: 16, padding: 16, marginBottom: 16 }}>
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 rounded-full bg-white/20 justify-center items-center">
                                        <Text className="text-white font-bold text-base">
                                            {(coachProfile.name || 'C').charAt(0)}
                                        </Text>
                                    </View>
                                    <View className="ml-3">
                                        <Text className="text-white font-bold">
                                            {coachProfile.name}
                                        </Text>
                                        <Text className="text-blue-300/70 text-xs">
                                            Downtown Fitness Hub
                                        </Text>
                                    </View>
                                </View>
                            </LinearGradient>

                            {/* Facility Selection */}
                            <Text className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                                Select Facility
                            </Text>
                            <ScrollView style={{ maxHeight: 200 }} className="mb-4">
                                {clubFacilities.map(facility => (
                                    <TouchableOpacity
                                        key={facility._id}
                                        onPress={() =>
                                            setSelectedFacility(
                                                selectedFacility === facility._id ? '' : facility._id,
                                            )
                                        }
                                        className={`flex-row items-center p-4 rounded-2xl mb-2`}
                                        style={{
                                            borderWidth: 1.5,
                                            borderColor: selectedFacility === facility._id ? '#93c5fd' : '#f3f4f6',
                                            backgroundColor: selectedFacility === facility._id ? '#eff6ff' : '#f9fafb',
                                        }}
                                        activeOpacity={0.7}>
                                        {selectedFacility === facility._id ? (
                                            <View className="w-6 h-6 bg-blue-500 rounded-full justify-center items-center">
                                                <Icon name="check" size={14} color="#fff" />
                                            </View>
                                        ) : (
                                            <View
                                                className="w-6 h-6 rounded-full"
                                                style={{ borderWidth: 2, borderColor: '#d1d5db' }}
                                            />
                                        )}
                                        <View className="ml-3 flex-1">
                                            <Text className={`font-semibold ${selectedFacility === facility._id ? 'text-blue-700' : 'text-gray-900'}`}>
                                                {facility.name}
                                            </Text>
                                            <Text className="text-gray-400 text-xs">
                                                {facility.type}
                                            </Text>
                                        </View>
                                        <Icon name="map-marker" size={16} color={selectedFacility === facility._id ? '#3b82f6' : '#d1d5db'} />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Notes */}
                            <Text className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                                Notes (Optional)
                            </Text>
                            <TextInput
                                className="bg-gray-50 rounded-2xl p-4 text-gray-900 mb-5"
                                style={{ borderWidth: 1.5, borderColor: punchNotes ? '#3b82f6' : '#f3f4f6' }}
                                placeholder="E.g., Morning karate sessions, Boxing training..."
                                placeholderTextColor="#9ca3af"
                                value={punchNotes}
                                onChangeText={setPunchNotes}
                                multiline
                                numberOfLines={2}
                                textAlignVertical="top"
                            />

                            {/* Buttons */}
                            <View className="flex-row" style={{ gap: 10 }}>
                                <TouchableOpacity
                                    onPress={() => setShowPunchInModal(false)}
                                    className="flex-1"
                                    activeOpacity={0.8}
                                    style={{
                                        borderRadius: 14,
                                        borderWidth: 1.5,
                                        borderColor: '#e5e7eb',
                                        paddingVertical: 14,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                    <Text className="text-gray-700 font-bold">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handlePunchInConfirm}
                                    activeOpacity={0.8}
                                    className="flex-1"
                                    disabled={punchLoading}>
                                    <LinearGradient
                                        colors={['#1e3a8a', '#3b82f6']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{
                                            borderRadius: 14,
                                            paddingVertical: 14,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
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

                        {/* Safe area bottom */}
                        <View className="h-6" />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default CoachAttendanceScreen;