import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DrawerMenuButton from '../../components/DrawerMenuButton';
import { coachAttendanceRecords } from '../../data/attendance';

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

const getStatusStyle = status => {
    switch (status) {
        case 'completed':
            return { bg: '#dcfce7', text: '#166534', label: 'Completed' };
        case 'active':
            return { bg: '#fef3c7', text: '#92400e', label: 'Active' };
        case 'incomplete':
            return { bg: '#fee2e2', text: '#991b1b', label: 'Incomplete' };
        default:
            return { bg: '#f3f4f6', text: '#374151', label: status || 'Unknown' };
    }
};

// ─── Stat Card Component ───
const StatCard = ({ icon, iconColor, iconBg, label, value }) => (
    <View
        className="flex-1 bg-white rounded-xl p-3.5 shadow-sm mx-1"
        style={{ elevation: 2 }}>
        <View className="flex-row items-start justify-between">
            <View className="flex-1">
                <Text className="text-gray-400 text-[10px]" numberOfLines={1}>
                    {label}
                </Text>
                <Text className="text-gray-900 font-bold text-xl mt-1">{value}</Text>
            </View>
            <View
                className="w-9 h-9 rounded-full justify-center items-center"
                style={{ backgroundColor: iconBg }}>
                <Icon name={icon} size={18} color={iconColor} />
            </View>
        </View>
    </View>
);

// ─── Attendance Record Item ───
const AttendanceRecordItem = ({ record }) => {
    const statusStyle = getStatusStyle(record.status);
    const initial = (record.memberName || 'M').charAt(0).toUpperCase();

    return (
        <View
            className="bg-white rounded-xl mx-4 mb-3 p-4 shadow-sm"
            style={{ elevation: 2 }}>
            <View className="flex-row items-start">
                {/* Avatar */}
                <View className="w-11 h-11 rounded-full bg-blue-100 justify-center items-center">
                    <Text className="text-blue-700 font-bold text-base">{initial}</Text>
                </View>

                {/* Info */}
                <View className="flex-1 ml-3">
                    <View className="flex-row items-center flex-wrap gap-1.5">
                        <Text
                            className="text-gray-900 font-semibold text-sm"
                            numberOfLines={1}>
                            {record.memberName || 'Unknown Member'}
                        </Text>
                        <View
                            className="px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: statusStyle.bg }}>
                            <Text
                                className="text-[10px] font-semibold capitalize"
                                style={{ color: statusStyle.text }}>
                                {statusStyle.label}
                            </Text>
                        </View>
                        {record.sessionWithCoach ? (
                            <View className="bg-purple-100 px-2 py-0.5 rounded-full">
                                <Text className="text-purple-700 text-[10px] font-semibold">
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
                            <View className="bg-blue-50 px-2 py-0.5 rounded-full">
                                <Text className="text-blue-600 text-[10px] font-semibold">
                                    {record.sport}
                                </Text>
                            </View>
                        </View>
                    ) : null}
                </View>

                {/* Duration */}
                <View className="items-end ml-2">
                    <Text className="text-gray-900 font-bold text-sm">
                        {formatDuration(record.duration)}
                    </Text>
                    {record.clubName ? (
                        <Text className="text-gray-300 text-[10px] mt-0.5">
                            {record.clubName}
                        </Text>
                    ) : null}
                </View>
            </View>
        </View>
    );
};

// ═══════════════════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════
const CoachAttendanceScreen = ({ navigation }) => {
    const [allRecords] = useState(coachAttendanceRecords);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        // Simulate initial load
        const timer = setTimeout(() => setLoading(false), 600);
        return () => clearTimeout(timer);
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setRefreshing(false);
    }, []);

    // ─── Filtered & Paginated Data ───
    const filteredRecords = useMemo(() => {
        let records = [...allRecords];

        if (startDate) {
            records = records.filter(r => r.date >= startDate);
        }
        if (endDate) {
            records = records.filter(r => r.date <= endDate);
        }

        // Sort by date descending
        records.sort((a, b) => new Date(b.date) - new Date(a.date));
        return records;
    }, [allRecords, startDate, endDate]);

    const totalRecords = filteredRecords.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / ITEMS_PER_PAGE));
    const paginatedRecords = filteredRecords.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    // ─── Summary Stats ───
    const stats = useMemo(() => {
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

    // ─── Loading State ───
    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#1e3a8a" />
                <Text className="text-gray-500 mt-3">
                    Loading attendance records...
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* ═══ Header ═══ */}
            <LinearGradient
                colors={['#1e3a8a', '#3b82f6']}
                className="px-6 pt-12 pb-6">
                <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                        <DrawerMenuButton />
                        <View className="ml-2">
                            <Text className="text-white font-bold text-2xl">Attendance</Text>
                            <Text className="text-white/70 text-sm">
                                Track member attendance records
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowFilters(!showFilters)}
                        className="w-11 h-11 bg-white/20 rounded-full justify-center items-center">
                        <Icon
                            name={showFilters ? 'filter-off' : 'filter-variant'}
                            size={22}
                            color="#fff"
                        />
                    </TouchableOpacity>
                </View>

                {/* ═══ Summary Stats ═══ */}
                <View className="flex-row mt-2 -mx-1">
                    <StatCard
                        icon="account-group-outline"
                        iconColor="#3b82f6"
                        iconBg="#dbeafe"
                        label="Total Records"
                        value={stats.totalRecords}
                    />
                    <StatCard
                        icon="check-circle-outline"
                        iconColor="#22c55e"
                        iconBg="#dcfce7"
                        label="Completed"
                        value={stats.completedVisits}
                    />
                </View>
                <View className="flex-row mt-2 -mx-1">
                    <StatCard
                        icon="clock-outline"
                        iconColor="#f97316"
                        iconBg="#ffedd5"
                        label="Avg Duration"
                        value={formatDuration(stats.avgDuration)}
                    />
                    <StatCard
                        icon="trending-up"
                        iconColor="#8b5cf6"
                        iconBg="#ede9fe"
                        label="With Coach"
                        value={stats.withCoach}
                    />
                </View>
            </LinearGradient>

            {/* ═══ Filter Panel ═══ */}
            {showFilters ? (
                <View
                    className="bg-white mx-4 mt-4 rounded-2xl p-4 shadow-md"
                    style={{ elevation: 3 }}>
                    <View className="flex-row items-center mb-3">
                        <Icon name="calendar-search" size={18} color="#374151" />
                        <Text className="text-gray-900 font-bold text-base ml-2">
                            Filter Records
                        </Text>
                    </View>

                    <View className="flex-row gap-3 mb-3">
                        <View className="flex-1">
                            <Text className="text-gray-500 text-xs mb-1 font-semibold">
                                Start Date
                            </Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm"
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#9ca3af"
                                value={startDate}
                                onChangeText={setStartDate}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-500 text-xs mb-1 font-semibold">
                                End Date
                            </Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm"
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#9ca3af"
                                value={endDate}
                                onChangeText={setEndDate}
                            />
                        </View>
                    </View>

                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={handleApplyFilter}
                            className="flex-1"
                            activeOpacity={0.8}>
                            <LinearGradient
                                colors={['#1e3a8a', '#3b82f6']}
                                className="rounded-xl py-2.5 flex-row items-center justify-center">
                                <Icon name="check" size={16} color="#fff" />
                                <Text className="text-white font-semibold text-sm ml-1.5">
                                    Apply
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleClearFilters}
                            className="flex-1 border border-gray-200 rounded-xl py-2.5 flex-row items-center justify-center">
                            <Icon name="close" size={16} color="#6b7280" />
                            <Text className="text-gray-600 font-semibold text-sm ml-1.5">
                                Clear
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : null}

            {/* ═══ Records Count ═══ */}
            <View className="flex-row justify-between items-center px-4 mt-4 mb-2">
                <Text className="text-gray-900 font-bold text-base">
                    Attendance Records
                </Text>
                <Text className="text-gray-400 text-xs">
                    Showing {paginatedRecords.length} of {totalRecords}
                </Text>
            </View>

            {/* ═══ Records List ═══ */}
            <FlatList
                data={paginatedRecords}
                renderItem={({ item }) => <AttendanceRecordItem record={item} />}
                keyExtractor={item => item._id}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#1e3a8a']}
                    />
                }
                ListEmptyComponent={
                    <View className="items-center mt-16 px-6">
                        <Icon name="calendar-remove-outline" size={64} color="#d1d5db" />
                        <Text className="text-gray-400 text-lg mt-4 font-semibold">
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
                    className="absolute bottom-0 left-0 right-0 bg-white px-4 py-3 border-t border-gray-100 flex-row items-center justify-between"
                    style={{ elevation: 8 }}>
                    <Text className="text-gray-400 text-xs">
                        Page {currentPage} of {totalPages}
                    </Text>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage <= 1}
                            className={`px-4 py-2 rounded-xl border ${currentPage <= 1
                                    ? 'border-gray-100 bg-gray-50'
                                    : 'border-blue-200 bg-blue-50'
                                }`}>
                            <Text
                                className={`text-sm font-semibold ${currentPage <= 1 ? 'text-gray-300' : 'text-blue-600'
                                    }`}>
                                Previous
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() =>
                                setCurrentPage(prev => Math.min(totalPages, prev + 1))
                            }
                            disabled={currentPage >= totalPages}
                            className={`px-4 py-2 rounded-xl border ${currentPage >= totalPages
                                    ? 'border-gray-100 bg-gray-50'
                                    : 'border-blue-200 bg-blue-50'
                                }`}>
                            <Text
                                className={`text-sm font-semibold ${currentPage >= totalPages ? 'text-gray-300' : 'text-blue-600'
                                    }`}>
                                Next
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : null}
        </View>
    );
};

export default CoachAttendanceScreen;