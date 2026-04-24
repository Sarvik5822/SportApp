import React, { useState, useCallback } from 'react';
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
import DrawerMenuButton from '../../components/DrawerMenuButton';
import { sessions } from '../../data/sessions';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00',
];

const SCREEN_WIDTH = Dimensions.get('window').width;

// ─── Color helpers ───
const getSlotColor = (type) => {
    switch (type) {
        case 'personal_training':
            return { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' };
        case 'group_class':
            return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
        case 'workshop':
            return { bg: '#f3e8ff', text: '#7c3aed', border: '#c4b5fd' };
        case 'assessment':
            return { bg: '#ffedd5', text: '#c2410c', border: '#fdba74' };
        default:
            return { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc' };
    }
};

const getStatusStyle = (status) => {
    switch (status) {
        case 'scheduled':
            return { bg: '#dbeafe', text: '#1e40af', label: 'Scheduled' };
        case 'completed':
            return { bg: '#dcfce7', text: '#166534', label: 'Completed' };
        case 'cancelled':
            return { bg: '#fee2e2', text: '#991b1b', label: 'Cancelled' };
        case 'in_progress':
            return { bg: '#fef3c7', text: '#92400e', label: 'In Progress' };
        default:
            return { bg: '#f3f4f6', text: '#374151', label: status || 'Unknown' };
    }
};

// ─── Date helpers ───
const getWeekDates = (offset = 0) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + (offset * 7));

    const dates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        dates.push(d);
    }
    return dates;
};

const formatDateShort = (date) => {
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

const formatWeekRange = (weekStart, weekEnd) => {
    const startStr = weekStart.toLocaleDateString('en-IN', { month: 'long', day: 'numeric' });
    const endStr = weekEnd.toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
};

const formatTime12 = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
};

const getDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
};

const getDateStr = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// ─── Build schedule from mock data ───
const buildScheduleByDate = (weekDates) => {
    const scheduleByDate = {};
    weekDates.forEach(date => {
        const dateStr = getDateStr(date);
        scheduleByDate[dateStr] = sessions.filter(s => s.date === dateStr);
    });
    return scheduleByDate;
};

// ═══════════════════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════
const CoachScheduleScreen = ({ navigation }) => {
    const [weekOffset, setWeekOffset] = useState(0);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    const weekDates = getWeekDates(weekOffset);
    const weekStart = weekDates[0];
    const weekEnd = weekDates[6];
    const scheduleByDate = buildScheduleByDate(weekDates);

    // Flatten all sessions for list view
    const allSessions = [];
    Object.values(scheduleByDate).forEach(daySessions => {
        allSessions.push(...daySessions);
    });
    allSessions.sort((a, b) => {
        const dateCompare = (a.date || '').localeCompare(b.date || '');
        if (dateCompare !== 0) return dateCompare;
        return (a.startTime || '').localeCompare(b.startTime || '');
    });

    // Count stats
    const totalThisWeek = allSessions.length;
    const scheduledCount = allSessions.filter(s => s.status === 'scheduled').length;
    const completedCount = allSessions.filter(s => s.status === 'completed').length;

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setRefreshing(false);
    }, []);

    const getSessionsForSlot = (dateStr, timeSlot) => {
        const daySessions = scheduleByDate[dateStr] || [];
        return daySessions.filter(s => {
            if (!s.startTime) return false;
            const sessionHour = parseInt(s.startTime.split(':')[0], 10);
            const slotHour = parseInt(timeSlot.split(':')[0], 10);
            return sessionHour === slotHour;
        });
    };

    // ─── Loading State ───
    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#1e3a8a" />
                <Text className="text-gray-500 mt-3">Loading schedule...</Text>
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
                        colors={['#1e3a8a']}
                    />
                }>
                {/* ═══════════════════════════════════════════════ */}
                {/* ─── HEADER ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <LinearGradient
                    colors={['#1e3a8a', '#3b82f6']}
                    className="px-6 pt-12 pb-6 rounded-b-[30px]">
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center">
                            <DrawerMenuButton />
                            <View className="ml-3">
                                <Text className="text-white font-bold text-2xl">My Schedule</Text>
                                <Text className="text-white/70 text-sm">
                                    Manage your coaching sessions
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Sessions')}
                            className="w-10 h-10 bg-white/20 rounded-full justify-center items-center">
                            <Icon name="calendar-plus" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Stats Bar */}
                    <View className="flex-row bg-white/15 rounded-xl p-3">
                        <View className="flex-1 items-center">
                            <Text className="text-white font-bold text-lg">{totalThisWeek}</Text>
                            <Text className="text-white/70 text-[10px]">This Week</Text>
                        </View>
                        <View className="w-px bg-white/30" />
                        <View className="flex-1 items-center">
                            <Text className="text-white font-bold text-lg">{scheduledCount}</Text>
                            <Text className="text-white/70 text-[10px]">Scheduled</Text>
                        </View>
                        <View className="w-px bg-white/30" />
                        <View className="flex-1 items-center">
                            <Text className="text-white font-bold text-lg">{completedCount}</Text>
                            <Text className="text-white/70 text-[10px]">Completed</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── WEEK NAVIGATION ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-4">
                    <View
                        className="bg-white rounded-2xl p-4 shadow-md"
                        style={{ elevation: 3 }}>
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-gray-900 font-bold text-base">Weekly Schedule</Text>
                            <View className="flex-row items-center">
                                {/* View Toggle */}
                                <TouchableOpacity
                                    onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                                    className="w-8 h-8 bg-gray-100 rounded-lg justify-center items-center mr-2">
                                    <Icon
                                        name={viewMode === 'list' ? 'view-grid' : 'view-list'}
                                        size={18}
                                        color="#6b7280"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Week Range & Navigation */}
                        <View className="flex-row items-center justify-between mb-3">
                            <TouchableOpacity
                                onPress={() => setWeekOffset(prev => prev - 1)}
                                className="w-9 h-9 bg-gray-100 rounded-lg justify-center items-center">
                                <Icon name="chevron-left" size={22} color="#374151" />
                            </TouchableOpacity>
                            <View className="flex-1 items-center">
                                <Text className="text-gray-700 font-semibold text-sm">
                                    {formatWeekRange(weekStart, weekEnd)}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setWeekOffset(0)}
                                className="px-3 py-1.5 bg-blue-100 rounded-lg mr-2">
                                <Text className="text-blue-700 font-semibold text-xs">Today</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setWeekOffset(prev => prev + 1)}
                                className="w-9 h-9 bg-gray-100 rounded-lg justify-center items-center">
                                <Icon name="chevron-right" size={22} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        {/* Day Headers */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View className="flex-row">
                                {weekDates.map((date, i) => {
                                    const isToday = date.toDateString() === new Date().toDateString();
                                    const daySessionCount = (scheduleByDate[getDateStr(date)] || []).length;
                                    return (
                                        <View
                                            key={i}
                                            className={`items-center px-3 py-2 mx-1 rounded-xl ${isToday ? 'bg-blue-600' : 'bg-gray-50'
                                                }`}
                                            style={{ minWidth: 52 }}>
                                            <Text
                                                className={`font-bold text-xs ${isToday ? 'text-white' : 'text-gray-700'
                                                    }`}>
                                                {DAYS[i]}
                                            </Text>
                                            <Text
                                                className={`text-lg font-bold ${isToday ? 'text-white' : 'text-gray-900'
                                                    }`}>
                                                {date.getDate()}
                                            </Text>
                                            <Text
                                                className={`text-[10px] ${isToday ? 'text-white/80' : 'text-gray-400'
                                                    }`}>
                                                {formatDateShort(date).split(' ')[0]}
                                            </Text>
                                            {daySessionCount > 0 && (
                                                <View
                                                    className={`mt-1 px-1.5 py-0.5 rounded-full ${isToday ? 'bg-white/30' : 'bg-blue-100'
                                                        }`}>
                                                    <Text
                                                        className={`text-[9px] font-bold ${isToday ? 'text-white' : 'text-blue-700'
                                                            }`}>
                                                        {daySessionCount}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── GRID VIEW (Compact Timeline) ─── */}
                {/* ═══════════════════════════════════════════════ */}
                {viewMode === 'grid' && (
                    <View className="px-4 mt-4">
                        <View
                            className="bg-white rounded-2xl p-4 shadow-md"
                            style={{ elevation: 3 }}>
                            <Text className="text-gray-900 font-bold text-base mb-3">
                                Time Grid
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View>
                                    {/* Header Row */}
                                    <View className="flex-row mb-1">
                                        <View style={{ width: 50 }} />
                                        {weekDates.map((date, i) => {
                                            const isToday = date.toDateString() === new Date().toDateString();
                                            return (
                                                <View
                                                    key={i}
                                                    style={{ width: 90 }}
                                                    className={`items-center py-1 mx-0.5 rounded-lg ${isToday ? 'bg-blue-600' : 'bg-gray-100'
                                                        }`}>
                                                    <Text
                                                        className={`text-[10px] font-bold ${isToday ? 'text-white' : 'text-gray-600'
                                                            }`}>
                                                        {DAYS[i]} {date.getDate()}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>

                                    {/* Time Rows */}
                                    {TIME_SLOTS.map((time) => (
                                        <View key={time} className="flex-row">
                                            <View
                                                style={{ width: 50 }}
                                                className="justify-start pt-1">
                                                <Text className="text-gray-400 text-[10px]">{time}</Text>
                                            </View>
                                            {weekDates.map((date, i) => {
                                                const dateStr = getDateStr(date);
                                                const slotSessions = getSessionsForSlot(dateStr, time);
                                                return (
                                                    <View
                                                        key={`${time}-${i}`}
                                                        style={{ width: 90, minHeight: 40 }}
                                                        className="border border-gray-100 rounded mx-0.5 mb-0.5 p-0.5">
                                                        {slotSessions.map((session, idx) => {
                                                            const color = getSlotColor(session.type);
                                                            return (
                                                                <View
                                                                    key={session.id || idx}
                                                                    className="rounded p-1 mb-0.5"
                                                                    style={{
                                                                        backgroundColor: color.bg,
                                                                        borderLeftWidth: 2,
                                                                        borderLeftColor: color.border,
                                                                    }}>
                                                                    <Text
                                                                        className="font-semibold"
                                                                        style={{
                                                                            color: color.text,
                                                                            fontSize: 9,
                                                                        }}
                                                                        numberOfLines={1}>
                                                                        {session.title || session.sport}
                                                                    </Text>
                                                                    <Text
                                                                        style={{
                                                                            color: color.text,
                                                                            fontSize: 8,
                                                                            opacity: 0.8,
                                                                        }}>
                                                                        {session.startTime}-{session.endTime}
                                                                    </Text>
                                                                </View>
                                                            );
                                                        })}
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>

                            {/* Legend */}
                            <View className="flex-row flex-wrap mt-3 pt-3 border-t border-gray-100">
                                {[
                                    { label: 'Personal Training', type: 'personal_training' },
                                    { label: 'Group Class', type: 'group_class' },
                                    { label: 'Workshop', type: 'workshop' },
                                    { label: 'Assessment', type: 'assessment' },
                                ].map(item => {
                                    const color = getSlotColor(item.type);
                                    return (
                                        <View key={item.type} className="flex-row items-center mr-4 mb-2">
                                            <View
                                                className="w-3 h-3 rounded"
                                                style={{
                                                    backgroundColor: color.bg,
                                                    borderWidth: 1,
                                                    borderColor: color.border,
                                                }}
                                            />
                                            <Text className="text-gray-500 text-[10px] ml-1.5">
                                                {item.label}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                )}

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── LIST VIEW: Sessions This Week ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-4 mb-6">
                    <View
                        className="bg-white rounded-2xl p-4 shadow-md"
                        style={{ elevation: 3 }}>
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-gray-900 font-bold text-base">
                                Sessions This Week
                            </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Sessions')}
                                className="flex-row items-center">
                                <Text className="text-blue-600 font-semibold text-xs">Manage</Text>
                                <Icon name="arrow-right" size={14} color="#2563eb" />
                            </TouchableOpacity>
                        </View>

                        {allSessions.length > 0 ? (
                            allSessions.map((session) => {
                                const statusStyle = getStatusStyle(session.status);
                                const slotColor = getSlotColor(session.type);
                                const dateObj = session.date ? new Date(session.date) : null;
                                const duration = getDuration(session.startTime, session.endTime);

                                return (
                                    <View
                                        key={session.id}
                                        className="mb-3 rounded-xl border border-gray-100 overflow-hidden"
                                        style={{ elevation: 1 }}>
                                        {/* Color accent bar */}
                                        <View
                                            style={{
                                                height: 3,
                                                backgroundColor: slotColor.border,
                                            }}
                                        />

                                        <View className="p-3">
                                            <View className="flex-row items-start">
                                                {/* Date Badge */}
                                                <View className="w-12 h-14 rounded-xl justify-center items-center mr-3"
                                                    style={{ backgroundColor: slotColor.bg }}>
                                                    <Text
                                                        className="font-bold text-sm"
                                                        style={{ color: slotColor.text }}>
                                                        {dateObj ? dateObj.getDate() : '--'}
                                                    </Text>
                                                    <Text
                                                        className="text-[10px]"
                                                        style={{ color: slotColor.text, opacity: 0.8 }}>
                                                        {dateObj
                                                            ? dateObj.toLocaleDateString('en-IN', { month: 'short' })
                                                            : ''}
                                                    </Text>
                                                </View>

                                                {/* Session Info */}
                                                <View className="flex-1">
                                                    <View className="flex-row items-center justify-between">
                                                        <Text
                                                            className="text-gray-900 font-bold text-sm flex-1"
                                                            numberOfLines={1}>
                                                            {session.title || session.sport}
                                                        </Text>
                                                        <View
                                                            className="px-2 py-0.5 rounded-full ml-2"
                                                            style={{ backgroundColor: statusStyle.bg }}>
                                                            <Text
                                                                className="text-[10px] font-semibold"
                                                                style={{ color: statusStyle.text }}>
                                                                {statusStyle.label}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    {/* Sport Badge */}
                                                    {session.sport && (
                                                        <View className="flex-row mt-1">
                                                            <View
                                                                className="px-2 py-0.5 rounded-full"
                                                                style={{ backgroundColor: slotColor.bg }}>
                                                                <Text
                                                                    className="text-[10px] font-semibold"
                                                                    style={{ color: slotColor.text }}>
                                                                    {session.sport}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    )}

                                                    {/* Details Row */}
                                                    <View className="flex-row flex-wrap mt-2">
                                                        <View className="flex-row items-center mr-3 mb-1">
                                                            <Icon name="clock-outline" size={12} color="#6b7280" />
                                                            <Text className="text-gray-500 text-[11px] ml-1">
                                                                {formatTime12(session.startTime)} - {formatTime12(session.endTime)}
                                                                {duration > 0 ? ` (${duration}m)` : ''}
                                                            </Text>
                                                        </View>
                                                        <View className="flex-row items-center mr-3 mb-1">
                                                            <Icon name="map-marker-outline" size={12} color="#6b7280" />
                                                            <Text className="text-gray-500 text-[11px] ml-1">
                                                                {session.facilityName || session.location || 'Not specified'}
                                                            </Text>
                                                        </View>
                                                        <View className="flex-row items-center mr-3 mb-1">
                                                            <Icon name="account-group-outline" size={12} color="#6b7280" />
                                                            <Text className="text-gray-500 text-[11px] ml-1">
                                                                {session.enrolled ?? session.bookedSlots ?? 0}/
                                                                {session.maxParticipants ?? session.maxSlots} enrolled
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    {/* Member Info */}
                                                    {session.memberName ? (
                                                        <View className="flex-row items-center mt-1">
                                                            <Icon name="account-outline" size={12} color="#9ca3af" />
                                                            <Text className="text-gray-400 text-[11px] ml-1">
                                                                Member:{' '}
                                                                <Text className="text-gray-700 font-semibold">
                                                                    {session.memberName}
                                                                </Text>
                                                            </Text>
                                                        </View>
                                                    ) : null}
                                                </View>
                                            </View>

                                            {/* Action Button */}
                                            <TouchableOpacity
                                                onPress={() => navigation.navigate('Sessions')}
                                                className="mt-3 flex-row items-center justify-center py-2 border border-blue-200 rounded-xl bg-blue-50">
                                                <Icon name="eye-outline" size={14} color="#2563eb" />
                                                <Text className="text-blue-600 font-semibold text-xs ml-1">
                                                    View Details
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })
                        ) : (
                            <View className="items-center py-8">
                                <Icon name="calendar-blank-outline" size={48} color="#d1d5db" />
                                <Text className="text-gray-400 mt-2 text-sm">
                                    No sessions scheduled for this week
                                </Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Sessions')}
                                    className="mt-4 px-4 py-2 border border-blue-200 rounded-xl bg-blue-50">
                                    <Text className="text-blue-600 font-semibold text-sm">
                                        Create a Session
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {/* Bottom Spacing */}
                <View className="h-6" />
            </ScrollView>
        </View>
    );
};

export default CoachScheduleScreen;