import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
    Alert, Modal, TextInput, RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DrawerMenuButton from '../../components/DrawerMenuButton';
import SectionHeader from '../../components/SectionHeader';
import ProgressBar from '../../components/ProgressBar';

const MOCK_FACILITIES = [
    { _id: 'f1', name: 'Main Gym', type: 'Gym' },
    { _id: 'f2', name: 'Swimming Pool', type: 'Pool' },
    { _id: 'f3', name: 'Tennis Court A', type: 'Court' },
    { _id: 'f4', name: 'Yoga Studio', type: 'Studio' },
];

const MOCK_ATTENDANCE_RECORDS = [
    { _id: 'att1', facility: 'Main Gym', date: '2026-03-13T09:00:00Z', punchInTime: '2026-03-13T09:00:00Z', punchOutTime: '2026-03-13T10:30:00Z', duration: 90, status: 'completed' },
    { _id: 'att2', facility: 'Swimming Pool', date: '2026-03-12T07:00:00Z', punchInTime: '2026-03-12T07:00:00Z', punchOutTime: '2026-03-12T08:00:00Z', duration: 60, status: 'completed' },
    { _id: 'att3', facility: 'Yoga Studio', date: '2026-03-11T17:00:00Z', punchInTime: '2026-03-11T17:00:00Z', punchOutTime: '2026-03-11T18:15:00Z', duration: 75, status: 'completed' },
    { _id: 'att4', facility: 'Main Gym', date: '2026-03-10T06:30:00Z', punchInTime: '2026-03-10T06:30:00Z', punchOutTime: null, duration: 0, status: 'incomplete' },
    { _id: 'att5', facility: 'Tennis Court A', date: '2026-03-09T15:00:00Z', punchInTime: '2026-03-09T15:00:00Z', punchOutTime: '2026-03-09T16:30:00Z', duration: 90, status: 'completed' },
    { _id: 'att6', facility: 'Main Gym', date: '2026-03-08T08:00:00Z', punchInTime: '2026-03-08T08:00:00Z', punchOutTime: '2026-03-08T09:45:00Z', duration: 105, status: 'completed' },
    { _id: 'att7', facility: 'Swimming Pool', date: '2026-03-07T07:30:00Z', punchInTime: '2026-03-07T07:30:00Z', punchOutTime: '2026-03-07T08:30:00Z', duration: 60, status: 'completed' },
];

const MOCK_STATS = { totalAttendance: 48, completedCount: 42, activeCount: 1, incompleteCount: 5, attendanceRate: 88, totalDuration: 3780 };

const formatDuration = m => { if (!m) return '0m'; const h = Math.floor(m / 60); return h > 0 ? `${h}h ${m % 60}m` : `${m}m`; };
const formatElapsedTime = s => `${Math.floor(s / 3600).toString().padStart(2, '0')}:${Math.floor((s % 3600) / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

const getStatusConfig = status => {
    const map = {
        completed: { icon: 'check-circle', color: '#059669', bgColor: '#d1fae5', textColor: '#065f46', label: 'Completed' },
        active: { icon: 'timer-sand', color: '#d97706', bgColor: '#fef3c7', textColor: '#92400e', label: 'Active' },
        incomplete: { icon: 'alert-circle', color: '#dc2626', bgColor: '#fee2e2', textColor: '#991b1b', label: 'Incomplete' },
    };
    return map[status] || { icon: 'help-circle', color: '#6b7280', bgColor: '#f3f4f6', textColor: '#374151', label: status };
};

const getFacilityIcon = type => {
    const icons = { Gym: 'dumbbell', Pool: 'swim', Court: 'tennis', Studio: 'yoga' };
    return icons[type] || 'office-building';
};

const getFacilityColor = type => {
    const colors = { Gym: '#ef4444', Pool: '#3b82f6', Court: '#22c55e', Studio: '#ec4899' };
    return colors[type] || '#6b7280';
};

// ═══════════════════════════════════════════════
// ─── SECTION TITLE COMPONENT ───
// ═══════════════════════════════════════════════
const SectionTitle = ({ title, icon, onViewAll, iconColor = '#059669' }) => (
    <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-lg justify-center items-center mr-2.5" style={{ backgroundColor: `${iconColor}15` }}>
                <Icon name={icon} size={16} color={iconColor} />
            </View>
            <Text className="text-gray-900 font-bold text-lg">{title}</Text>
        </View>
        {onViewAll && (
            <TouchableOpacity onPress={onViewAll} activeOpacity={0.7} className="flex-row items-center bg-emerald-50 px-3 py-1.5 rounded-full">
                <Text className="text-emerald-600 font-semibold text-xs">View All</Text>
                <Icon name="chevron-right" size={14} color="#059669" />
            </TouchableOpacity>
        )}
    </View>
);

// ═══════════════════════════════════════════════
// ─── PUNCH IN MODAL CONTENT ───
// ═══════════════════════════════════════════════
const PunchInModalContent = ({ facilities, selectedFacility, setSelectedFacility, punchNotes, setPunchNotes, punchLoading, onClose, onConfirm }) => (
    <>
        <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-emerald-50 justify-center items-center mr-2.5">
                    <Icon name="fingerprint" size={18} color="#059669" />
                </View>
                <Text className="text-gray-900 font-bold text-xl">Punch In</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
                <View className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center">
                    <Icon name="close" size={18} color="#6b7280" />
                </View>
            </TouchableOpacity>
        </View>
        <Text className="text-gray-500 text-sm mb-6">Select the facility you're visiting and add optional notes.</Text>

        <View className="items-center mb-6">
            <LinearGradient colors={['#059669', '#10b981']} style={{ width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' }}>
                <View className="w-20 h-20 bg-white/20 rounded-full justify-center items-center">
                    <Icon name="fingerprint" size={48} color="#fff" />
                </View>
            </LinearGradient>
            <Text className="text-gray-400 text-sm mt-3">Place your finger on the scanner</Text>
        </View>

        <Text className="text-gray-900 font-bold text-sm mb-3">Select Facility</Text>
        <View className="mb-4">
            {facilities.map(f => {
                const isSelected = selectedFacility === f._id;
                const fColor = getFacilityColor(f.type);
                return (
                    <TouchableOpacity key={f._id} onPress={() => setSelectedFacility(isSelected ? '' : f._id)}
                        className={`flex-row items-center p-4 rounded-2xl mb-2 border-2 ${isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-white'}`}
                        activeOpacity={0.7}>
                        <View className="w-10 h-10 rounded-xl justify-center items-center mr-3" style={{ backgroundColor: `${fColor}15` }}>
                            <Icon name={getFacilityIcon(f.type)} size={20} color={fColor} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-900 font-semibold">{f.name}</Text>
                            <Text className="text-gray-400 text-xs mt-0.5">{f.type}</Text>
                        </View>
                        <Icon name={isSelected ? 'radiobox-marked' : 'radiobox-blank'} size={22} color={isSelected ? '#059669' : '#d1d5db'} />
                    </TouchableOpacity>
                );
            })}
        </View>

        <View className="flex-row items-center mb-2">
            <View className="w-6 h-6 rounded-md bg-gray-100 justify-center items-center mr-2">
                <Icon name="text-box-outline" size={14} color="#6b7280" />
            </View>
            <Text className="text-gray-700 font-medium text-sm">Notes (Optional)</Text>
        </View>
        <TextInput className="bg-gray-50 rounded-2xl p-4 text-gray-900 mb-6" placeholder="E.g., Leg day, Cardio session..." placeholderTextColor="#9ca3af"
            value={punchNotes} onChangeText={setPunchNotes} multiline numberOfLines={2} textAlignVertical="top" style={{ borderWidth: 1.5, borderColor: '#e5e7eb' }} />

        <View className="flex-row" style={{ gap: 12 }}>
            <TouchableOpacity onPress={onClose} className="flex-1" style={{ borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', paddingVertical: 14, alignItems: 'center' }}>
                <Text className="text-gray-700 font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} activeOpacity={0.8} className="flex-1" disabled={punchLoading}>
                <LinearGradient colors={punchLoading ? ['#d1d5db', '#d1d5db'] : ['#059669', '#10b981']}
                    style={{ borderRadius: 14, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                    {punchLoading ? <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} /> : <Icon name="login" size={18} color="#fff" style={{ marginRight: 8 }} />}
                    <Text className="text-white font-bold">{punchLoading ? 'Punching In...' : 'Confirm Punch In'}</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    </>
);

// ═══════════════════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════
const AttendanceScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [timeFilter, setTimeFilter] = useState('all');
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState(null);
    const [facilities, setFacilities] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef(null);
    const [showPunchInModal, setShowPunchInModal] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState('');
    const [punchNotes, setPunchNotes] = useState('');
    const [punchLoading, setPunchLoading] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 600));
            let filtered = [...MOCK_ATTENDANCE_RECORDS];
            if (timeFilter === 'week') { const d = new Date(); d.setDate(d.getDate() - 7); filtered = filtered.filter(r => new Date(r.date) >= d); }
            if (timeFilter === 'month') { const d = new Date(); d.setDate(d.getDate() - 30); filtered = filtered.filter(r => new Date(r.date) >= d); }
            setAttendanceRecords(filtered);
            setAttendanceStats(MOCK_STATS);
            setFacilities(MOCK_FACILITIES);
        } catch (error) {
            Alert.alert('Error', 'Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    }, [timeFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (activeSession) {
            const t = new Date(activeSession.punchInTime).getTime();
            const update = () => setElapsedTime(Math.floor((Date.now() - t) / 1000));
            update();
            timerRef.current = setInterval(update, 1000);
            return () => { if (timerRef.current) clearInterval(timerRef.current); };
        } else {
            setElapsedTime(0);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    }, [activeSession]);

    const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };
    const handlePunchInClick = () => { setSelectedFacility(''); setPunchNotes(''); setShowPunchInModal(true); };

    const handlePunchInConfirm = async () => {
        try {
            setPunchLoading(true);
            await new Promise(resolve => setTimeout(resolve, 800));
            const f = facilities.find(x => x._id === selectedFacility);
            setActiveSession({ _id: `s_${Date.now()}`, punchInTime: new Date().toISOString(), facility: f?.name || 'General', notes: punchNotes.trim() });
            setShowPunchInModal(false);
            Alert.alert('✅ Punched In!', 'Your session has started. Have a great workout!');
        } catch (error) { Alert.alert('Error', 'Failed to punch in'); } finally { setPunchLoading(false); }
    };

    const handlePunchOut = async () => {
        try {
            setPunchLoading(true);
            await new Promise(resolve => setTimeout(resolve, 800));
            const dur = Math.round(elapsedTime / 60);
            Alert.alert('👋 Punched Out!', `Session completed. Duration: ${formatDuration(dur)}`);
            setAttendanceRecords(prev => [{ _id: activeSession._id, facility: activeSession.facility, date: activeSession.punchInTime, punchInTime: activeSession.punchInTime, punchOutTime: new Date().toISOString(), duration: dur, status: 'completed' }, ...prev]);
            setActiveSession(null);
        } catch (error) { Alert.alert('Error', 'Failed to punch out'); } finally { setPunchLoading(false); }
    };

    const handleCloseModal = useCallback(() => { setShowPunchInModal(false); }, []);

    const totalVisits = attendanceStats?.totalAttendance || 0;
    const completedCount = attendanceStats?.completedCount || 0;
    const attendanceRate = attendanceStats?.attendanceRate || 0;
    const totalDuration = attendanceStats?.totalDuration || 0;
    const monthlyGoal = 20;

    const statsConfig = [
        { label: 'Total Visits', value: totalVisits.toString(), icon: 'calendar-check', gradient: ['#059669', '#34d399'] },
        { label: 'Completed', value: completedCount.toString(), icon: 'check-decagram', gradient: ['#2563eb', '#60a5fa'] },
        { label: 'Rate', value: `${attendanceRate}%`, icon: 'trending-up', gradient: ['#d97706', '#fbbf24'] },
        { label: 'Goal', value: `${completedCount}/${monthlyGoal}`, icon: 'target', gradient: ['#7c3aed', '#a78bfa'] },
    ];

    const achievements = [
        { title: '30-Day Streak', description: 'Attended for 30 consecutive days', earned: completedCount >= 30, icon: '🔥' },
        { title: 'Early Bird', description: 'Attended 10 morning sessions', earned: completedCount >= 10, icon: '🌅' },
        { title: 'Consistent', description: 'Completion rate above 80%', earned: parseFloat(attendanceRate) >= 80, icon: '⭐' },
        { title: 'Century Club', description: 'Completed 100 total visits', earned: totalVisits >= 100, icon: '💯' },
    ];

    const filterOptions = [
        { label: 'All Time', value: 'all' },
        { label: 'This Week', value: 'week' },
        { label: 'This Month', value: 'month' },
    ];

    if (loading && !refreshing) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <View className="w-16 h-16 rounded-2xl bg-emerald-50 justify-center items-center mb-4">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
                <Text className="text-gray-900 font-bold text-base">Loading Attendance</Text>
                <Text className="text-gray-400 mt-1 text-sm">Preparing your performance data...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} tintColor="#059669" />}>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── HEADER ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <LinearGradient colors={['#064e3b', '#059669', '#10b981']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={{ paddingTop: 48, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
                    <View className="flex-row justify-between items-center px-5 mb-5">
                        <DrawerMenuButton />
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => navigation.navigate('Announcements')} className="w-10 h-10 bg-white/15 rounded-full justify-center items-center mr-2">
                                <Icon name="bell-outline" size={22} color="#fff" />
                                <View className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full justify-center items-center">
                                    <Text className="text-white text-[8px] font-bold">2</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate('Settings')} className="w-10 h-10 bg-white/15 rounded-full justify-center items-center">
                                <Icon name="cog-outline" size={22} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="px-5">
                        <View className="flex-row items-center mb-2">
                            <View className="w-10 h-10 bg-white/15 rounded-xl justify-center items-center mr-3">
                                <Icon name="chart-timeline-variant-shimmer" size={22} color="#fff" />
                            </View>
                            <View>
                                <Text className="text-white font-bold text-2xl">Attendance & Performance</Text>
                                <Text className="text-white/60 text-sm">Track visits with punch-in / punch-out</Text>
                            </View>
                        </View>
                    </View>

                    <View className="mx-5 mt-5 bg-white/10 rounded-2xl p-4" style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <View className="w-10 h-10 bg-yellow-400/20 rounded-xl justify-center items-center">
                                    <Icon name="clock-check-outline" size={20} color="#fbbf24" />
                                </View>
                                <View className="ml-3">
                                    <Text className="text-white font-bold text-sm">Filter Period</Text>
                                    <Text className="text-white/50 text-xs mt-0.5">
                                        {timeFilter === 'all' ? 'Showing all records' : timeFilter === 'week' ? 'Last 7 days' : 'Last 30 days'}
                                    </Text>
                                </View>
                            </View>
                            <View className="bg-emerald-400 px-4 py-2 rounded-xl flex-row items-center">
                                <View className="w-2 h-2 rounded-full bg-white mr-1.5" />
                                <Text className="text-white font-bold text-xs">{attendanceRecords.length} Records</Text>
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
                                <TouchableOpacity activeOpacity={0.8} className="bg-white rounded-2xl p-4 shadow-md" style={{ elevation: 4 }}>
                                    <View className="flex-row justify-between items-start">
                                        <View className="flex-1">
                                            <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider">{stat.label}</Text>
                                            <Text className="text-gray-900 font-bold text-3xl mt-1">{stat.value}</Text>
                                        </View>
                                        <LinearGradient colors={stat.gradient} className="w-11 h-11 rounded-xl justify-center items-center" style={{ borderRadius: 12 }}>
                                            <Icon name={stat.icon} size={20} color="#fff" />
                                        </LinearGradient>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── BIOMETRIC PUNCH IN/OUT CARD ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-5">
                    <TouchableOpacity onPress={activeSession ? handlePunchOut : handlePunchInClick} activeOpacity={0.85}>
                        <LinearGradient
                            colors={activeSession ? ['#7f1d1d', '#dc2626'] : ['#064e3b', '#059669']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={{ borderRadius: 20, padding: 20 }}>
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center">
                                    <Icon name="fingerprint" size={20} color={activeSession ? '#fca5a5' : '#6ee7b7'} />
                                    <Text className="text-white font-bold text-base ml-2">
                                        {activeSession ? 'Currently Checked In' : 'Ready to Work Out?'}
                                    </Text>
                                </View>
                                {activeSession && (
                                    <View className="bg-red-400/20 px-3 py-1.5 rounded-full flex-row items-center">
                                        <View className="w-2 h-2 rounded-full bg-red-400 mr-1.5" />
                                        <Text className="text-red-300 text-xs font-bold">Live</Text>
                                    </View>
                                )}
                            </View>

                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View className="w-12 h-12 rounded-2xl justify-center items-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                                        <Icon name={activeSession ? 'timer-outline' : 'fingerprint'} size={28} color="#fff" />
                                    </View>
                                    <View className="ml-3">
                                        {activeSession ? (
                                            <View>
                                                <Text className="text-white font-bold text-xl">{formatElapsedTime(elapsedTime)}</Text>
                                                <View className="flex-row items-center mt-0.5">
                                                    <Icon name="map-marker" size={12} color="rgba(255,255,255,0.6)" />
                                                    <Text className="text-white/60 text-xs ml-1">{activeSession.facility}</Text>
                                                </View>
                                            </View>
                                        ) : (
                                            <View>
                                                <Text className="text-white font-bold text-xl">Punch In</Text>
                                                <Text className="text-white/60 text-xs mt-0.5">Tap to check in at your facility</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <TouchableOpacity onPress={activeSession ? handlePunchOut : handlePunchInClick} activeOpacity={0.8} disabled={punchLoading}>
                                    <LinearGradient
                                        colors={activeSession ? ['#ef4444', '#dc2626'] : ['#22c55e', '#16a34a']}
                                        style={{ borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }}>
                                        {punchLoading ? <ActivityIndicator size="small" color="#fff" /> : (
                                            <>
                                                <Icon name={activeSession ? 'logout' : 'login'} size={16} color="#fff" />
                                                <Text className="text-white font-bold text-xs ml-1.5">{activeSession ? 'Punch Out' : 'Punch In'}</Text>
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── FILTER TABS ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-6">
                    <View className="flex-row bg-white rounded-2xl p-1.5 shadow-sm" style={{ elevation: 2 }}>
                        {filterOptions.map(option => {
                            const isActive = timeFilter === option.value;
                            return (
                                <TouchableOpacity key={option.value} onPress={() => setTimeFilter(option.value)} activeOpacity={0.7}
                                    className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${isActive ? 'bg-emerald-500' : ''}`}>
                                    <Icon name="calendar-range" size={15} color={isActive ? '#fff' : '#6b7280'} />
                                    <Text className={`text-xs font-bold ml-1.5 ${isActive ? 'text-white' : 'text-gray-500'}`}>{option.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── MONTHLY PROGRESS ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-6">
                    <SectionTitle title="Monthly Progress" icon="chart-arc" iconColor="#8b5cf6" />
                    <View className="bg-white rounded-2xl p-5 shadow-md" style={{ elevation: 3 }}>
                        <View className="mb-3">
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-gray-700 text-sm font-semibold">Visit Goal</Text>
                                <Text className="text-purple-600 text-sm font-bold">{completedCount}/{monthlyGoal}</Text>
                            </View>
                            <ProgressBar progress={completedCount} total={monthlyGoal} label="" color="bg-emerald-500" height={10} />
                        </View>
                        <View className="flex-row mt-4 pt-4 border-t border-gray-100">
                            {[
                                { v: completedCount, l: 'Completed', c: '#059669', bg: '#ecfdf5' },
                                { v: attendanceStats?.activeCount || 0, l: 'Active', c: '#d97706', bg: '#fffbeb' },
                                { v: attendanceStats?.incompleteCount || 0, l: 'Incomplete', c: '#dc2626', bg: '#fef2f2' },
                                { v: formatDuration(totalDuration), l: 'Total Time', c: '#2563eb', bg: '#eff6ff' },
                            ].map((x, i) => (
                                <View key={i} className="flex-1 items-center">
                                    <View className="w-12 h-12 rounded-xl justify-center items-center mb-2" style={{ backgroundColor: x.bg }}>
                                        <Text className="font-bold text-lg" style={{ color: x.c }}>{x.v}</Text>
                                    </View>
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{x.l}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── ATTENDANCE HISTORY ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-6">
                    <SectionTitle title="Attendance History" icon="history" iconColor="#059669" />
                    {attendanceRecords.length > 0 ? (
                        attendanceRecords.map(record => {
                            const sc = getStatusConfig(record.status);
                            return (
                                <View key={record._id} className="bg-white rounded-2xl p-4 mb-3 shadow-md flex-row items-center overflow-hidden" style={{ elevation: 3 }}>
                                    <View className="w-12 h-12 rounded-xl justify-center items-center mr-3" style={{ backgroundColor: sc.bgColor }}>
                                        <Icon name={sc.icon} size={22} color={sc.color} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-900 font-bold text-sm">{record.facility || 'General'}</Text>
                                        <View className="flex-row flex-wrap items-center mt-1" style={{ gap: 8 }}>
                                            <View className="flex-row items-center">
                                                <View className="w-5 h-5 rounded-md bg-gray-50 justify-center items-center mr-1">
                                                    <Icon name="calendar" size={10} color="#9ca3af" />
                                                </View>
                                                <Text className="text-gray-400 text-[11px]">{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                                            </View>
                                            {record.punchInTime && (
                                                <View className="flex-row items-center">
                                                    <View className="w-5 h-5 rounded-md bg-emerald-50 justify-center items-center mr-1">
                                                        <Icon name="login" size={10} color="#059669" />
                                                    </View>
                                                    <Text className="text-gray-400 text-[11px]">{new Date(record.punchInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                                                </View>
                                            )}
                                            {record.punchOutTime && (
                                                <View className="flex-row items-center">
                                                    <View className="w-5 h-5 rounded-md bg-red-50 justify-center items-center mr-1">
                                                        <Icon name="logout" size={10} color="#ef4444" />
                                                    </View>
                                                    <Text className="text-gray-400 text-[11px]">{new Date(record.punchOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                                                </View>
                                            )}
                                            {record.duration > 0 && (
                                                <View className="flex-row items-center">
                                                    <View className="w-5 h-5 rounded-md bg-blue-50 justify-center items-center mr-1">
                                                        <Icon name="clock-outline" size={10} color="#2563eb" />
                                                    </View>
                                                    <Text className="text-blue-500 text-[11px] font-semibold">{formatDuration(record.duration)}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    <View className="px-3 py-1.5 rounded-lg flex-row items-center" style={{ backgroundColor: sc.bgColor }}>
                                        <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: sc.color }} />
                                        <Text className="text-[10px] font-bold" style={{ color: sc.textColor }}>{sc.label}</Text>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <View className="bg-white rounded-2xl p-8 items-center shadow-md" style={{ elevation: 3 }}>
                            <View className="w-20 h-20 bg-gray-100 rounded-full justify-center items-center mb-4">
                                <Icon name="calendar-blank" size={40} color="#d1d5db" />
                            </View>
                            <Text className="text-gray-900 font-bold text-lg">No Records Found</Text>
                            <Text className="text-gray-400 text-sm text-center mt-2 px-4">Punch in to start tracking your visits!</Text>
                            <TouchableOpacity activeOpacity={0.8} className="mt-5" onPress={onRefresh}>
                                <LinearGradient colors={['#059669', '#10b981']} className="px-6 py-3.5 rounded-xl flex-row items-center shadow-md" style={{ elevation: 3 }}>
                                    <Icon name="refresh" size={16} color="#fff" />
                                    <Text className="text-white font-bold text-sm ml-2">Refresh</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── ACHIEVEMENTS ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-6">
                    <SectionTitle title="Achievements" icon="trophy" iconColor="#f59e0b" />
                    <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
                        {achievements.map((a, i) => (
                            <View key={i} style={{ width: '50%', padding: 4 }}>
                                <View className={`rounded-2xl p-4 shadow-sm ${a.earned ? 'bg-white border-2 border-amber-300' : 'bg-white opacity-50'}`}
                                    style={{ elevation: a.earned ? 3 : 1 }}>
                                    <View className="flex-row items-start">
                                        <View className={`w-12 h-12 rounded-xl justify-center items-center mr-3 ${a.earned ? 'bg-amber-50' : 'bg-gray-100'}`}>
                                            <Text className="text-2xl">{a.icon}</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-900 font-bold text-sm">{a.title}</Text>
                                            <Text className="text-gray-400 text-[11px] mt-0.5 leading-3" numberOfLines={2}>{a.description}</Text>
                                        </View>
                                    </View>
                                    {a.earned && (
                                        <View className="flex-row items-center mt-3 pt-3 border-t border-amber-100">
                                            <View className="w-5 h-5 bg-amber-100 rounded-full justify-center items-center mr-1.5">
                                                <Icon name="trophy" size={12} color="#d97706" />
                                            </View>
                                            <Text className="text-amber-700 text-[10px] font-bold uppercase tracking-wider">Earned</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <View className="h-8" />
            </ScrollView>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── PUNCH IN MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal visible={showPunchInModal} transparent animationType="slide" onRequestClose={handleCloseModal}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '90%' }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <PunchInModalContent
                                facilities={facilities}
                                selectedFacility={selectedFacility}
                                setSelectedFacility={setSelectedFacility}
                                punchNotes={punchNotes}
                                setPunchNotes={setPunchNotes}
                                punchLoading={punchLoading}
                                onClose={handleCloseModal}
                                onConfirm={handlePunchInConfirm}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default AttendanceScreen;