import React, { useState, useEffect, useCallback } from 'react';
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
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ProfileAvatar from '../../components/ProfileAvatar';
import DrawerMenuButton from '../../components/DrawerMenuButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Mock Data (replace with real API service later) ───
const MOCK_USER = {
    name: 'John Doe',
    email: 'member@test.com',
    phone: '+1 234 567 890',
    membershipStatus: 'Premium',
    membershipEndDate: '2026-12-31',
    status: 'active',
    createdAt: '2024-01-15',
};

const MOCK_STATS = {
    totalAttendance: 48,
    presentCount: 42,
    attendanceRate: 88,
    activePlans: 2,
};

const MOCK_PAYMENTS = [
    {
        id: '1',
        description: 'Monthly Membership',
        type: 'membership',
        amount: 49.99,
        status: 'paid',
        createdAt: '2026-03-01',
    },
    {
        id: '2',
        description: 'Personal Training Session',
        type: 'session',
        amount: 25.0,
        status: 'paid',
        createdAt: '2026-02-20',
    },
    {
        id: '3',
        description: 'Gym Equipment Rental',
        type: 'rental',
        amount: 15.0,
        status: 'pending',
        createdAt: '2026-02-15',
    },
];

const MOCK_FACILITIES = [
    { id: '1', name: 'Main Gym', type: 'Gym', status: 'Open', capacity: 100 },
    { id: '2', name: 'Swimming Pool', type: 'Pool', status: 'Open', capacity: 50 },
    { id: '3', name: 'Tennis Court A', type: 'Court', status: 'Open', capacity: 4 },
    { id: '4', name: 'Yoga Studio', type: 'Studio', status: 'Open', capacity: 30 },
];

const MOCK_AVAILABLE_CLUBS = [
    {
        _id: 'c1',
        name: 'Downtown Fitness Hub',
        address: '123 Main St',
        city: 'Los Angeles',
        code: 'DFH-01',
        memberStatus: 'available',
        sportsOffered: ['Gym', 'Yoga', 'Boxing'],
    },
    {
        _id: 'c2',
        name: 'Westside Athletic Club',
        address: '456 Ocean Ave',
        city: 'Santa Monica',
        code: 'WAC-02',
        memberStatus: 'available',
        sportsOffered: ['Swimming', 'Tennis', 'Basketball'],
    },
];

// ─── Helper Functions ───
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) { return 'Good Morning'; }
    if (hour < 17) { return 'Good Afternoon'; }
    return 'Good Evening';
};

const formatDate = dateStr => {
    if (!dateStr) { return 'N/A'; }
    return new Date(dateStr).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const getPaymentIcon = type => {
    const icons = {
        membership: 'card-account-details',
        session: 'dumbbell',
        rental: 'package-variant',
        default: 'credit-card-outline',
    };
    return icons[type] || icons.default;
};

const getPaymentColor = type => {
    const colors = {
        membership: { primary: '#8b5cf6', gradient: ['#8b5cf6', '#a78bfa'] },
        session: { primary: '#22c55e', gradient: ['#22c55e', '#4ade80'] },
        rental: { primary: '#f59e0b', gradient: ['#f59e0b', '#fbbf24'] },
        default: { primary: '#3b82f6', gradient: ['#3b82f6', '#60a5fa'] },
    };
    return colors[type] || colors.default;
};

const getFacilityIcon = type => {
    const icons = {
        Gym: 'dumbbell',
        Pool: 'swim',
        Court: 'tennis',
        Studio: 'yoga',
        default: 'office-building',
    };
    return icons[type] || icons.default;
};

const getFacilityColor = type => {
    const colors = {
        Gym: { primary: '#ef4444', gradient: ['#ef4444', '#f97316'] },
        Pool: { primary: '#3b82f6', gradient: ['#3b82f6', '#06b6d4'] },
        Court: { primary: '#22c55e', gradient: ['#22c55e', '#10b981'] },
        Studio: { primary: '#ec4899', gradient: ['#ec4899', '#f472b6'] },
        default: { primary: '#6b7280', gradient: ['#6b7280', '#9ca3af'] },
    };
    return colors[type] || colors.default;
};

// ═══════════════════════════════════════════════
// ─── SECTION TITLE COMPONENT ───
// ═══════════════════════════════════════════════
const SectionTitle = ({ title, icon, onViewAll, iconColor = '#059669' }) => (
    <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
            <View
                className="w-8 h-8 rounded-lg justify-center items-center mr-2.5"
                style={{ backgroundColor: `${iconColor}15` }}>
                <Icon name={icon} size={16} color={iconColor} />
            </View>
            <Text className="text-gray-900 font-bold text-lg">{title}</Text>
        </View>
        {onViewAll && (
            <TouchableOpacity
                onPress={onViewAll}
                activeOpacity={0.7}
                className="flex-row items-center bg-emerald-50 px-3 py-1.5 rounded-full">
                <Text className="text-emerald-600 font-semibold text-xs">View All</Text>
                <Icon name="chevron-right" size={14} color="#059669" />
            </TouchableOpacity>
        )}
    </View>
);

// ═══════════════════════════════════════════════
// ─── CIRCULAR STAT COMPONENT ───
// ═══════════════════════════════════════════════
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
                {value}{suffix}
            </Text>
        </View>
        <Text className="text-gray-500 text-[11px] text-center font-medium">{label}</Text>
    </View>
);

// ═══════════════════════════════════════════════
// ─── PAYMENT ITEM COMPONENT ───
// ═══════════════════════════════════════════════
const PaymentItem = ({ payment }) => {
    const paymentColor = getPaymentColor(payment.type);
    const isPaid = payment.status === 'paid' || payment.status === 'completed';

    return (
        <View
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
            style={{
                elevation: 2,
                borderLeftWidth: 3,
                borderLeftColor: paymentColor.primary,
            }}>
            <View className="flex-row items-center">
                <LinearGradient
                    colors={paymentColor.gradient}
                    className="w-11 h-11 rounded-xl justify-center items-center"
                    style={{ borderRadius: 12 }}>
                    <Icon name={getPaymentIcon(payment.type)} size={20} color="#fff" />
                </LinearGradient>
                <View className="flex-1 ml-3">
                    <Text className="text-gray-900 font-bold text-sm" numberOfLines={1}>
                        {payment.description || payment.type}
                    </Text>
                    <View className="flex-row items-center mt-1">
                        <Icon name="clock-outline" size={12} color="#9ca3af" />
                        <Text className="text-gray-400 text-xs ml-1">
                            {formatDate(payment.createdAt)}
                        </Text>
                    </View>
                </View>
                <View className="items-end">
                    <Text className="text-gray-900 font-bold text-base">
                        ${payment.amount.toFixed(2)}
                    </Text>
                    <View
                        className="px-2.5 py-1 rounded-full mt-1 flex-row items-center"
                        style={{ backgroundColor: isPaid ? '#dcfce7' : '#fef3c7' }}>
                        <Icon
                            name={isPaid ? 'check-circle' : 'clock-outline'}
                            size={10}
                            color={isPaid ? '#166534' : '#92400e'}
                        />
                        <Text
                            className="text-[10px] font-bold capitalize ml-1"
                            style={{ color: isPaid ? '#166534' : '#92400e' }}>
                            {payment.status}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

// ═══════════════════════════════════════════════
// ─── FACILITY CARD COMPONENT ───
// ═══════════════════════════════════════════════
const FacilityCard = ({ facility, onPress }) => {
    const facilityColor = getFacilityColor(facility.type);

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            className="bg-white rounded-2xl mr-3 shadow-sm overflow-hidden"
            style={{ elevation: 3, width: 170 }}>
            <LinearGradient
                colors={facilityColor.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="h-24 justify-center items-center">
                <View className="w-14 h-14 bg-white/20 rounded-2xl justify-center items-center">
                    <Icon name={getFacilityIcon(facility.type)} size={28} color="#fff" />
                </View>
            </LinearGradient>
            <View className="p-3.5">
                <Text className="text-gray-900 font-bold text-sm" numberOfLines={1}>
                    {facility.name}
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">{facility.type}</Text>
                <View className="flex-row items-center justify-between mt-2.5">
                    <View
                        className="px-2.5 py-1 rounded-full flex-row items-center"
                        style={{ backgroundColor: '#dcfce7' }}>
                        <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
                        <Text className="text-green-700 text-[10px] font-bold">
                            {facility.status}
                        </Text>
                    </View>
                    <Text className="text-gray-400 text-[10px] font-medium">
                        {facility.capacity} cap
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// ═══════════════════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════
const MemberDashboardScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Dashboard data
    const [member, setMember] = useState(null);
    const [stats, setStats] = useState(null);
    const [recentPayments, setRecentPayments] = useState([]);
    const [facilities, setFacilities] = useState([]);

    // Punch in/out state
    const [isPunchedIn, setIsPunchedIn] = useState(false);
    const [currentSession, setCurrentSession] = useState(null);
    const [showPunchInModal, setShowPunchInModal] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState('');
    const [elapsedTime, setElapsedTime] = useState('0:00');

    // Join Another Club state
    const [showJoinClubModal, setShowJoinClubModal] = useState(false);
    const [availableClubs, setAvailableClubs] = useState([]);
    const [clubsLoading, setClubsLoading] = useState(false);
    const [myJoinRequests, setMyJoinRequests] = useState([]);
    const [selectedClubId, setSelectedClubId] = useState('');
    const [joinMessage, setJoinMessage] = useState('');
    const [submittingJoin, setSubmittingJoin] = useState(false);

    // Fetch dashboard data (mock)
    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 800));
            setMember(MOCK_USER);
            setStats(MOCK_STATS);
            setRecentPayments(MOCK_PAYMENTS);
            setFacilities(MOCK_FACILITIES);
        } catch (error) {
            Alert.alert('Error', 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // Elapsed time timer
    useEffect(() => {
        let interval;
        if (isPunchedIn && currentSession) {
            interval = setInterval(() => {
                const now = new Date();
                const punchIn = new Date(currentSession.punchInTime);
                const diff = Math.floor((now - punchIn) / 1000);
                const hours = Math.floor(diff / 3600);
                const minutes = Math.floor((diff % 3600) / 60);
                setElapsedTime(`${hours}:${minutes.toString().padStart(2, '0')}`);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPunchedIn, currentSession]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDashboard();
        setRefreshing(false);
    };

    // ─── Punch In/Out Handlers ───
    const handlePunchIn = () => {
        setSelectedFacility('');
        setShowPunchInModal(true);
    };

    const confirmPunchIn = () => {
        if (!selectedFacility) {
            Alert.alert('Error', 'Please select a facility');
            return;
        }
        const newSession = {
            punchInTime: new Date().toISOString(),
            facility: selectedFacility,
        };
        setCurrentSession(newSession);
        setIsPunchedIn(true);
        setShowPunchInModal(false);
        Alert.alert('Success', `Punched in at ${selectedFacility}\nHave a great workout!`);
    };

    const handlePunchOut = () => {
        if (!currentSession) { return; }
        const punchOutTime = new Date();
        const punchInTime = new Date(currentSession.punchInTime);
        const duration = Math.round((punchOutTime - punchInTime) / 60000);

        Alert.alert('Punched Out', `Session duration: ${duration} minutes`);
        setIsPunchedIn(false);
        setCurrentSession(null);
        setElapsedTime('0:00');
    };

    // ─── Join Club Handlers ───
    const handleOpenJoinClubModal = () => {
        setClubsLoading(true);
        setShowJoinClubModal(true);
        setTimeout(() => {
            setAvailableClubs(MOCK_AVAILABLE_CLUBS);
            setMyJoinRequests([]);
            setClubsLoading(false);
        }, 600);
    };

    const handleSubmitJoinRequest = () => {
        if (!selectedClubId) {
            Alert.alert('Error', 'Please select a club');
            return;
        }
        setSubmittingJoin(true);
        setTimeout(() => {
            Alert.alert('Success', 'Join request submitted! The club admin will review your request.');
            setSelectedClubId('');
            setJoinMessage('');
            setSubmittingJoin(false);
            setShowJoinClubModal(false);
        }, 800);
    };

    const handleCancelJoinRequest = requestId => {
        Alert.alert('Cancelled', 'Join request cancelled');
        setMyJoinRequests(prev => prev.filter(r => r._id !== requestId));
    };

    // ─── Stats Config ───
    const statsConfig = [
        {
            label: 'Attendance',
            value: stats?.totalAttendance?.toString() || '0',
            icon: 'calendar-check',
            color: '#059669',
            gradient: ['#059669', '#34d399'],
        },
        {
            label: 'Present',
            value: stats?.presentCount?.toString() || '0',
            icon: 'check-decagram',
            color: '#3b82f6',
            gradient: ['#3b82f6', '#60a5fa'],
        },
        {
            label: 'Rate',
            value: `${stats?.attendanceRate || 0}%`,
            icon: 'trending-up',
            color: '#f59e0b',
            gradient: ['#f59e0b', '#fbbf24'],
        },
        {
            label: 'Plans',
            value: stats?.activePlans?.toString() || '0',
            icon: 'trophy-award',
            color: '#8b5cf6',
            gradient: ['#8b5cf6', '#a78bfa'],
        },
    ];

    // ─── Quick Actions Config ───
    const quickActions = [
        {
            icon: 'calendar-plus',
            label: 'Book Session',
            color: '#22c55e',
            gradient: ['#059669', '#22c55e'],
            onPress: () => navigation.navigate('Sports'),
        },
        {
            icon: 'basketball',
            label: 'View Sports',
            color: '#3b82f6',
            gradient: ['#2563eb', '#3b82f6'],
            onPress: () => navigation.navigate('Sports'),
        },
        {
            icon: 'calendar-clock',
            label: 'My Schedule',
            color: '#f59e0b',
            gradient: ['#d97706', '#f59e0b'],
            onPress: () => navigation.navigate('MySessions'),
        },
        {
            icon: 'trophy-variant',
            label: 'Events',
            color: '#8b5cf6',
            gradient: ['#7c3aed', '#8b5cf6'],
            onPress: () => navigation.navigate('Events'),
        },
        {
            icon: 'credit-card-outline',
            label: 'Payments',
            color: '#ec4899',
            gradient: ['#db2777', '#ec4899'],
            onPress: () => navigation.navigate('MySessions'),
        },
        {
            icon: 'bell-outline',
            label: 'Notices',
            color: '#06b6d4',
            gradient: ['#0891b2', '#06b6d4'],
            onPress: () => navigation.navigate('Announcements'),
        },
    ];

    // ─── Quick Info Config ───
    const quickInfoItems = [
        {
            label: 'Member Since',
            value: member?.createdAt
                ? new Date(member.createdAt).toLocaleDateString()
                : 'N/A',
            icon: 'calendar-account',
            color: '#3b82f6',
        },
        { label: 'Email', value: member?.email || 'N/A', icon: 'email-outline', color: '#8b5cf6' },
        { label: 'Phone', value: member?.phone || 'N/A', icon: 'phone-outline', color: '#22c55e' },
        { label: 'Status', value: member?.status || 'active', icon: 'check-circle', color: '#059669' },
    ];

    // ─── Loading State ───
    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <View className="w-16 h-16 rounded-2xl bg-emerald-50 justify-center items-center mb-4">
                    <ActivityIndicator size="large" color="#059669" />
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
                    colors={['#059669']}
                    tintColor="#059669"
                />
            }>
            {/* ═══════════════════════════════════════════════ */}
            {/* ─── HEADER ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <LinearGradient
                colors={['#064e3b', '#059669', '#10b981']}
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
                                <Text className="text-white text-[8px] font-bold">2</Text>
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
                        <ProfileAvatar name={member?.name || 'User'} size="medium" />
                    </View>
                    <View className="ml-4 flex-1">
                        <Text className="text-white/60 text-sm font-medium">{getGreeting()} 👋</Text>
                        <Text className="text-white font-bold text-2xl mt-0.5">
                            {member?.name || 'User'}
                        </Text>
                        <View className="flex-row items-center mt-1">
                            <Icon name="shield-star" size={14} color="#fbbf24" />
                            <Text className="text-white/70 text-xs ml-1.5">
                                {member?.membershipStatus || 'Active'} Member
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Membership Info Bar */}
                <View className="mx-5 bg-white/10 rounded-2xl p-4" style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                            <View className="w-10 h-10 bg-yellow-400/20 rounded-xl justify-center items-center">
                                <Icon name="card-account-details" size={20} color="#fbbf24" />
                            </View>
                            <View className="ml-3">
                                <Text className="text-white font-bold text-sm">
                                    {member?.membershipStatus || 'Active'} Membership
                                </Text>
                                <Text className="text-white/50 text-xs mt-0.5">
                                    {member?.membershipEndDate
                                        ? `Expires: ${formatDate(member.membershipEndDate)}`
                                        : 'No expiry set'}
                                </Text>
                            </View>
                        </View>
                        <View className="bg-emerald-400 px-4 py-2 rounded-xl flex-row items-center">
                            <View className="w-2 h-2 rounded-full bg-white mr-1.5" />
                            <Text className="text-white font-bold text-xs">
                                {member?.status === 'active' ? 'Active' : member?.status || 'Active'}
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
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('MySessions')}
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
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── BIOMETRIC PUNCH IN/OUT CARD ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-5">
                <TouchableOpacity
                    onPress={isPunchedIn ? handlePunchOut : handlePunchIn}
                    activeOpacity={0.85}>
                    <LinearGradient
                        colors={isPunchedIn ? ['#7f1d1d', '#dc2626'] : ['#064e3b', '#059669']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ borderRadius: 20, padding: 20 }}>
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <Icon name="fingerprint" size={20} color={isPunchedIn ? '#fca5a5' : '#6ee7b7'} />
                                <Text className="text-white font-bold text-base ml-2">
                                    {isPunchedIn ? 'Currently Checked In' : 'Ready to Work Out?'}
                                </Text>
                            </View>
                            {isPunchedIn && (
                                <View className="bg-red-400/20 px-3 py-1.5 rounded-full flex-row items-center">
                                    <View className="w-2 h-2 rounded-full bg-red-400 mr-1.5" />
                                    <Text className="text-red-300 text-xs font-bold">Live</Text>
                                </View>
                            )}
                        </View>

                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <View
                                    className="w-12 h-12 rounded-2xl justify-center items-center"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                                    <Icon
                                        name={isPunchedIn ? 'timer-outline' : 'fingerprint'}
                                        size={28}
                                        color="#fff"
                                    />
                                </View>
                                <View className="ml-3">
                                    {isPunchedIn && currentSession ? (
                                        <View>
                                            <Text className="text-white font-bold text-xl">
                                                {elapsedTime}
                                            </Text>
                                            <View className="flex-row items-center mt-0.5">
                                                <Icon name="map-marker" size={12} color="rgba(255,255,255,0.6)" />
                                                <Text className="text-white/60 text-xs ml-1">
                                                    {currentSession.facility}
                                                </Text>
                                            </View>
                                        </View>
                                    ) : (
                                        <View>
                                            <Text className="text-white font-bold text-xl">
                                                Punch In
                                            </Text>
                                            <Text className="text-white/60 text-xs mt-0.5">
                                                Tap to check in at your facility
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={isPunchedIn ? handlePunchOut : handlePunchIn}
                                activeOpacity={0.8}>
                                <LinearGradient
                                    colors={isPunchedIn ? ['#ef4444', '#dc2626'] : ['#22c55e', '#16a34a']}
                                    style={{
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 10,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}>
                                    <Icon name={isPunchedIn ? 'logout' : 'login'} size={16} color="#fff" />
                                    <Text className="text-white font-bold text-xs ml-1.5">
                                        {isPunchedIn ? 'Punch Out' : 'Punch In'}
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
            {/* ─── RECENT PAYMENTS ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-2">
                <SectionTitle
                    title="Recent Payments"
                    icon="credit-card-outline"
                    iconColor="#8b5cf6"
                    onViewAll={() => navigation.navigate('MySessions')}
                />
                {recentPayments.length > 0 ? (
                    recentPayments.map(payment => (
                        <PaymentItem key={payment.id} payment={payment} />
                    ))
                ) : (
                    <View className="bg-white rounded-2xl p-8 items-center shadow-sm" style={{ elevation: 2 }}>
                        <View className="w-16 h-16 rounded-full bg-gray-50 justify-center items-center mb-3">
                            <Icon name="credit-card-off-outline" size={32} color="#d1d5db" />
                        </View>
                        <Text className="text-gray-400 font-medium">No recent payments</Text>
                    </View>
                )}
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── QUICK INFO CARD ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-6">
                <SectionTitle title="My Profile" icon="account-circle" iconColor="#3b82f6" />
                <View
                    className="bg-white rounded-2xl p-5 shadow-md"
                    style={{ elevation: 3 }}>
                    {quickInfoItems.map((info, index) => (
                        <View
                            key={info.label}
                            className={`flex-row items-center py-3.5 ${index < quickInfoItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
                            <View
                                className="w-10 h-10 rounded-xl justify-center items-center"
                                style={{ backgroundColor: `${info.color}12` }}>
                                <Icon name={info.icon} size={20} color={info.color} />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                                    {info.label}
                                </Text>
                                {info.label === 'Status' ? (
                                    <View className="flex-row items-center mt-1">
                                        <View className="bg-emerald-500 px-3 py-1 rounded-full flex-row items-center">
                                            <View className="w-1.5 h-1.5 rounded-full bg-white mr-1.5" />
                                            <Text className="text-white text-xs font-bold capitalize">
                                                {info.value}
                                            </Text>
                                        </View>
                                    </View>
                                ) : (
                                    <Text className="text-gray-900 font-semibold text-sm mt-0.5">
                                        {info.value}
                                    </Text>
                                )}
                            </View>
                            {info.label !== 'Status' && (
                                <Icon name="chevron-right" size={18} color="#d1d5db" />
                            )}
                        </View>
                    ))}
                </View>
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── FACILITIES ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="mt-6">
                <View className="px-4">
                    <SectionTitle
                        title="Your Facilities"
                        icon="office-building"
                        iconColor="#059669"
                        onViewAll={() => navigation.navigate('Sports')}
                    />
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="pl-4"
                    contentContainerStyle={{ paddingRight: 16 }}>
                    {facilities.length > 0 ? (
                        facilities.map(facility => (
                            <FacilityCard
                                key={facility.id}
                                facility={facility}
                                onPress={() => navigation.navigate('Sports')}
                            />
                        ))
                    ) : (
                        <View className="bg-white rounded-2xl p-8 items-center shadow-sm" style={{ width: 300, elevation: 2 }}>
                            <View className="w-16 h-16 rounded-full bg-gray-50 justify-center items-center mb-3">
                                <Icon name="office-building" size={32} color="#d1d5db" />
                            </View>
                            <Text className="text-gray-400 font-medium">No facilities available</Text>
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── PERFORMANCE OVERVIEW ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-6">
                <SectionTitle title="Performance" icon="chart-arc" iconColor="#22c55e" />
                <View
                    className="bg-white rounded-2xl p-5 shadow-md"
                    style={{ elevation: 3 }}>
                    <View className="flex-row items-center justify-around">
                        <CircularStat
                            value={`${stats?.attendanceRate || 0}%`}
                            label="Attendance Rate"
                            color="#22c55e"
                        />
                        <View className="w-px h-12 bg-gray-100" />
                        <CircularStat
                            value={stats?.presentCount || 0}
                            label="Sessions Done"
                            color="#3b82f6"
                        />
                        <View className="w-px h-12 bg-gray-100" />
                        <CircularStat
                            value={stats?.activePlans || 0}
                            label="Active Plans"
                            color="#8b5cf6"
                        />
                    </View>

                    {/* Membership Badge */}
                    <View className="mt-4 pt-4 border-t border-gray-50">
                        <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                            Membership Perks
                        </Text>
                        <View className="flex-row flex-wrap">
                            {['Full Gym Access', 'Pool Access', 'Group Classes', 'Personal Trainer'].map((perk, idx) => (
                                <View
                                    key={idx}
                                    className="bg-emerald-50 rounded-full px-3 py-1.5 mr-2 mb-2 flex-row items-center">
                                    <Icon name="check-circle" size={12} color="#059669" />
                                    <Text className="text-emerald-700 text-[10px] font-semibold ml-1">
                                        {perk}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── JOIN ANOTHER CLUB CARD ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-6">
                <TouchableOpacity
                    onPress={handleOpenJoinClubModal}
                    activeOpacity={0.85}>
                    <LinearGradient
                        colors={['#1e3a8a', '#3b82f6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ borderRadius: 20, padding: 20 }}>
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <View className="w-12 h-12 bg-white/15 rounded-2xl justify-center items-center">
                                    <Icon name="office-building-marker" size={24} color="#fff" />
                                </View>
                                <View className="ml-3 flex-1">
                                    <Text className="text-white font-bold text-base">
                                        Multi-Club Access
                                    </Text>
                                    <Text className="text-white/60 text-xs mt-0.5">
                                        Request access to join additional clubs
                                    </Text>
                                </View>
                            </View>
                            <LinearGradient
                                colors={['#60a5fa', '#93c5fd']}
                                style={{
                                    borderRadius: 12,
                                    paddingHorizontal: 16,
                                    paddingVertical: 10,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                <Icon name="plus" size={16} color="#fff" />
                                <Text className="text-white font-bold text-xs ml-1">Join</Text>
                            </LinearGradient>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Bottom Spacing */}
            <View className="h-8" />

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
                                <View className="w-8 h-8 rounded-lg bg-emerald-50 justify-center items-center mr-2.5">
                                    <Icon name="fingerprint" size={18} color="#059669" />
                                </View>
                                <Text className="text-gray-900 font-bold text-xl">
                                    Biometric Punch In
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowPunchInModal(false)}>
                                <View className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center">
                                    <Icon name="close" size={18} color="#6b7280" />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <Text className="text-gray-500 text-sm mb-6">
                            Select the facility you're visiting and scan your fingerprint
                        </Text>

                        {/* Fingerprint Icon */}
                        <View className="items-center mb-6">
                            <LinearGradient
                                colors={['#059669', '#10b981']}
                                style={{ width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' }}>
                                <View className="w-20 h-20 bg-white/20 rounded-full justify-center items-center">
                                    <Icon name="fingerprint" size={48} color="#fff" />
                                </View>
                            </LinearGradient>
                            <Text className="text-gray-400 text-sm mt-3">
                                Place your finger on the scanner
                            </Text>
                        </View>

                        {/* Facility Selection */}
                        <Text className="text-gray-900 font-bold text-sm mb-3">
                            Select Facility
                        </Text>
                        <View className="mb-6">
                            {facilities.map(facility => {
                                const isSelected = selectedFacility === facility.name;
                                const facilityColor = getFacilityColor(facility.type);
                                return (
                                    <TouchableOpacity
                                        key={facility.id}
                                        onPress={() => setSelectedFacility(facility.name)}
                                        className={`flex-row items-center p-4 rounded-2xl mb-2 border-2 ${isSelected
                                            ? 'border-emerald-500 bg-emerald-50'
                                            : 'border-gray-100 bg-white'
                                            }`}
                                        activeOpacity={0.7}>
                                        <View
                                            className="w-10 h-10 rounded-xl justify-center items-center mr-3"
                                            style={{ backgroundColor: `${facilityColor.primary}15` }}>
                                            <Icon
                                                name={getFacilityIcon(facility.type)}
                                                size={20}
                                                color={facilityColor.primary}
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-900 font-semibold">{facility.name}</Text>
                                            <Text className="text-gray-400 text-xs mt-0.5">{facility.type} • {facility.capacity} capacity</Text>
                                        </View>
                                        <Icon
                                            name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                                            size={22}
                                            color={isSelected ? '#059669' : '#d1d5db'}
                                        />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Buttons */}
                        <View className="flex-row" style={{ gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => setShowPunchInModal(false)}
                                className="flex-1"
                                style={{
                                    borderRadius: 14,
                                    borderWidth: 1.5,
                                    borderColor: '#e5e7eb',
                                    paddingVertical: 14,
                                    alignItems: 'center',
                                }}>
                                <Text className="text-gray-700 font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={confirmPunchIn}
                                activeOpacity={0.8}
                                className="flex-1"
                                disabled={!selectedFacility}>
                                <LinearGradient
                                    colors={
                                        selectedFacility
                                            ? ['#059669', '#10b981']
                                            : ['#d1d5db', '#d1d5db']
                                    }
                                    style={{ borderRadius: 14, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                                    <Icon name="check" size={18} color="#fff" />
                                    <Text className="text-white font-bold ml-2">Confirm</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── JOIN CLUB MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showJoinClubModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowJoinClubModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '85%' }}>
                        {/* Modal Header */}
                        <View className="flex-row justify-between items-center mb-2">
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-lg bg-blue-50 justify-center items-center mr-2.5">
                                    <Icon name="office-building-marker" size={18} color="#2563eb" />
                                </View>
                                <Text className="text-gray-900 font-bold text-xl">
                                    Join Another Club
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowJoinClubModal(false)}>
                                <View className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center">
                                    <Icon name="close" size={18} color="#6b7280" />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <Text className="text-gray-500 text-sm mb-4">
                            Browse available clubs and request to join. The club admin will
                            review your request.
                        </Text>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Pending Requests */}
                            {myJoinRequests.filter(r => r.status === 'pending').length > 0 && (
                                <View className="mb-4">
                                    <Text className="text-orange-600 font-bold text-sm mb-2">
                                        Pending Requests
                                    </Text>
                                    {myJoinRequests
                                        .filter(r => r.status === 'pending')
                                        .map(request => (
                                            <View
                                                key={request._id}
                                                className="flex-row items-center justify-between p-4 bg-orange-50 rounded-2xl mb-2"
                                                style={{ borderWidth: 1, borderColor: '#fed7aa' }}>
                                                <View className="flex-1">
                                                    <Text className="text-gray-900 font-semibold text-sm">
                                                        {request.branchId?.name || 'Unknown Club'}
                                                    </Text>
                                                    <Text className="text-gray-400 text-xs mt-0.5">
                                                        {request.branchId?.city}
                                                    </Text>
                                                    <View className="flex-row items-center mt-1">
                                                        <Icon name="clock-outline" size={12} color="#ea580c" />
                                                        <Text className="text-orange-600 text-xs ml-1">
                                                            Awaiting admin approval
                                                        </Text>
                                                    </View>
                                                </View>
                                                <TouchableOpacity
                                                    onPress={() => handleCancelJoinRequest(request._id)}>
                                                    <View className="w-8 h-8 bg-red-100 rounded-full justify-center items-center">
                                                        <Icon name="close" size={16} color="#ef4444" />
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                </View>
                            )}

                            {/* Available Clubs */}
                            <Text className="text-gray-900 font-bold text-sm mb-3">
                                Available Clubs
                            </Text>
                            {clubsLoading ? (
                                <View className="items-center py-8">
                                    <ActivityIndicator size="large" color="#2563eb" />
                                    <Text className="text-gray-400 text-sm mt-2">Loading clubs...</Text>
                                </View>
                            ) : availableClubs.filter(c => c.memberStatus === 'available')
                                .length === 0 ? (
                                <View className="bg-gray-50 rounded-2xl p-8 items-center">
                                    <Icon name="office-building-outline" size={40} color="#d1d5db" />
                                    <Text className="text-gray-400 text-sm text-center mt-2">
                                        No additional clubs available to join at the moment.
                                    </Text>
                                </View>
                            ) : (
                                availableClubs
                                    .filter(c => c.memberStatus === 'available')
                                    .map(club => {
                                        const isSelected = selectedClubId === club._id;
                                        return (
                                            <TouchableOpacity
                                                key={club._id}
                                                onPress={() => setSelectedClubId(club._id)}
                                                activeOpacity={0.7}
                                                className={`p-4 rounded-2xl mb-3 ${isSelected
                                                    ? 'bg-blue-50'
                                                    : 'bg-white'
                                                    }`}
                                                style={{
                                                    borderWidth: 2,
                                                    borderColor: isSelected ? '#2563eb' : '#f3f4f6',
                                                }}>
                                                <View className="flex-row justify-between items-start">
                                                    <View className="flex-1">
                                                        <Text className="text-gray-900 font-bold text-sm">
                                                            {club.name}
                                                        </Text>
                                                        <View className="flex-row items-center mt-1">
                                                            <Icon name="map-marker-outline" size={14} color="#9ca3af" />
                                                            <Text className="text-gray-500 text-xs ml-1">
                                                                {club.address}
                                                                {club.city ? `, ${club.city}` : ''}
                                                            </Text>
                                                        </View>
                                                        {club.sportsOffered && club.sportsOffered.length > 0 && (
                                                            <View className="flex-row flex-wrap mt-2">
                                                                {club.sportsOffered.map((sport, idx) => (
                                                                    <View
                                                                        key={idx}
                                                                        className="bg-blue-100 px-2.5 py-1 rounded-full mr-1.5 mb-1">
                                                                        <Text className="text-blue-700 text-[10px] font-semibold">
                                                                            {sport}
                                                                        </Text>
                                                                    </View>
                                                                ))}
                                                            </View>
                                                        )}
                                                    </View>
                                                    <View className="bg-blue-100 px-2.5 py-1 rounded-full">
                                                        <Text className="text-blue-700 text-[10px] font-bold">
                                                            {club.code}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })
                            )}

                            {/* Message Input */}
                            {selectedClubId !== '' && (
                                <View className="mt-2 mb-4">
                                    <Text className="text-gray-900 font-bold text-sm mb-2">
                                        Message to Admin (Optional)
                                    </Text>
                                    <TextInput
                                        className="bg-gray-50 rounded-2xl p-4 text-gray-900"
                                        placeholder="Tell the admin why you'd like to join this club..."
                                        placeholderTextColor="#9ca3af"
                                        value={joinMessage}
                                        onChangeText={setJoinMessage}
                                        multiline
                                        numberOfLines={3}
                                        textAlignVertical="top"
                                        style={{ borderWidth: 1.5, borderColor: '#e5e7eb' }}
                                    />
                                </View>
                            )}
                        </ScrollView>

                        {/* Footer Buttons */}
                        <View className="flex-row mt-4" style={{ gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => setShowJoinClubModal(false)}
                                className="flex-1"
                                style={{
                                    borderRadius: 14,
                                    borderWidth: 1.5,
                                    borderColor: '#e5e7eb',
                                    paddingVertical: 14,
                                    alignItems: 'center',
                                }}>
                                <Text className="text-gray-700 font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSubmitJoinRequest}
                                activeOpacity={0.8}
                                className="flex-1"
                                disabled={!selectedClubId || submittingJoin}>
                                <LinearGradient
                                    colors={
                                        !selectedClubId || submittingJoin
                                            ? ['#d1d5db', '#d1d5db']
                                            : ['#1e3a8a', '#3b82f6']
                                    }
                                    style={{
                                        borderRadius: 14,
                                        paddingVertical: 14,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                    {submittingJoin && (
                                        <ActivityIndicator
                                            size="small"
                                            color="#fff"
                                            style={{ marginRight: 8 }}
                                        />
                                    )}
                                    <Text className="text-white font-bold">
                                        {submittingJoin ? 'Submitting...' : 'Submit Request'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

export default MemberDashboardScreen;
