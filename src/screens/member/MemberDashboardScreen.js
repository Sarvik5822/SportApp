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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ProfileAvatar from '../../components/ProfileAvatar';
import QuickActionCard from '../../components/QuickActionCard';
import StatCard from '../../components/StatCard';
import SectionHeader from '../../components/SectionHeader';
import CustomButton from '../../components/CustomButton';
import DrawerMenuButton from '../../components/DrawerMenuButton';

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

// ─── Component ───
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
            // Simulate API delay
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
        if (!currentSession) return;
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
        // Simulate API fetch
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
            label: 'Total Attendance',
            value: stats?.totalAttendance?.toString() || '0',
            icon: 'calendar-check',
            trend: `${stats?.attendanceRate || 0}% rate`,
            color: '#059669',
        },
        {
            label: 'Present Count',
            value: stats?.presentCount?.toString() || '0',
            icon: 'trending-up',
            trend: 'Sessions attended',
            color: '#3b82f6',
        },
        {
            label: 'Attendance Rate',
            value: `${stats?.attendanceRate || 0}%`,
            icon: 'clock-outline',
            trend: 'Overall rate',
            color: '#f59e0b',
        },
        {
            label: 'Active Plans',
            value: stats?.activePlans?.toString() || '0',
            icon: 'trophy-award',
            trend: 'Training plans',
            color: '#8b5cf6',
        },
    ];

    // ─── Loading State ───
    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#059669" />
                <Text className="text-gray-500 mt-3">Loading dashboard...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />
            }>
            {/* ─── Header ─── */}
            <LinearGradient
                colors={['#059669', '#10b981']}
                className="px-6 pt-12 pb-8 rounded-b-[30px]">
                <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-row items-center">
                        <DrawerMenuButton />
                        <ProfileAvatar name={member?.name || 'User'} size="medium" />
                        <View className="ml-3">
                            <Text className="text-white/80 text-sm">Welcome back,</Text>
                            <Text className="text-white font-bold text-xl">
                                {member?.name || 'User'}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Announcements')}
                        className="w-10 h-10 bg-white/20 rounded-full justify-center items-center">
                        <Icon name="bell-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Membership Status */}
                <View className="bg-white/20 rounded-xl p-4 flex-row items-center">
                    <Icon name="card-membership" size={28} color="#fbbf24" />
                    <View className="ml-3 flex-1">
                        <Text className="text-white font-semibold">
                            {member?.membershipStatus || 'Active'} Member
                        </Text>
                        <Text className="text-white/70 text-sm">
                            {member?.membershipEndDate
                                ? `Expires: ${new Date(member.membershipEndDate).toLocaleDateString()}`
                                : 'No expiry set'}
                        </Text>
                    </View>
                    <View className="bg-emerald-400 px-3 py-1 rounded-full">
                        <Text className="text-white font-bold text-xs">
                            {member?.status === 'active' ? 'Active' : member?.status || 'Active'}
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            {/* ─── Biometric Punch In/Out Card ─── */}
            <View className="px-4 -mt-4">
                <View
                    className="bg-white rounded-2xl p-5 border-2 border-emerald-500"
                    style={{ elevation: 6 }}>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                            <View className="w-16 h-16 bg-emerald-100 rounded-full justify-center items-center">
                                <Icon name="fingerprint" size={36} color="#059669" />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="text-gray-900 font-bold text-lg">
                                    {isPunchedIn ? 'Currently Checked In' : 'Ready to Work Out?'}
                                </Text>
                                {isPunchedIn && currentSession ? (
                                    <View>
                                        <View className="flex-row items-center mt-1">
                                            <Icon name="map-marker" size={14} color="#6b7280" />
                                            <Text className="text-gray-500 text-sm ml-1">
                                                {currentSession.facility}
                                            </Text>
                                        </View>
                                        <Text className="text-emerald-600 text-sm font-semibold mt-1">
                                            Session time: {elapsedTime}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text className="text-gray-500 text-sm mt-1">
                                        Tap to punch in at your facility
                                    </Text>
                                )}
                            </View>
                        </View>

                        {isPunchedIn ? (
                            <TouchableOpacity
                                onPress={handlePunchOut}
                                activeOpacity={0.8}
                                className="bg-red-500 rounded-xl px-5 py-3 flex-row items-center">
                                <Icon name="logout" size={20} color="#fff" />
                                <Text className="text-white font-bold ml-2">Out</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={handlePunchIn}
                                activeOpacity={0.8}>
                                <LinearGradient
                                    colors={['#059669', '#10b981']}
                                    className="rounded-xl px-5 py-3 flex-row items-center">
                                    <Icon name="login" size={20} color="#fff" />
                                    <Text className="text-white font-bold ml-2">In</Text>
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
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('MySessions')}
                                className="bg-white rounded-xl p-4 shadow-md"
                                style={{ elevation: 3 }}>
                                <View className="flex-row justify-between items-start mb-2">
                                    <View>
                                        <Text className="text-gray-500 text-xs">{stat.label}</Text>
                                        <Text className="text-gray-900 font-bold text-2xl mt-1">
                                            {stat.value}
                                        </Text>
                                        <Text className="text-gray-400 text-xs mt-1">{stat.trend}</Text>
                                    </View>
                                    <View
                                        className="w-10 h-10 rounded-full justify-center items-center"
                                        style={{ backgroundColor: `${stat.color}20` }}>
                                        <Icon name={stat.icon} size={20} color={stat.color} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>

            {/* ─── Quick Actions ─── */}
            <View className="px-2 mt-2">
                <SectionHeader title="Quick Actions" icon="lightning-bolt" showSeeAll={false} />
                <View className="flex-row flex-wrap">
                    <QuickActionCard
                        title="Book Session"
                        icon="calendar-plus"
                        onPress={() => navigation.navigate('Sports')}
                        color="#22c55e"
                    />
                    <QuickActionCard
                        title="View Sports"
                        icon="basketball"
                        onPress={() => navigation.navigate('Sports')}
                        color="#3b82f6"
                    />
                    <QuickActionCard
                        title="My Schedule"
                        icon="calendar-clock"
                        onPress={() => navigation.navigate('MySessions')}
                        color="#f59e0b"
                    />
                    <QuickActionCard
                        title="Events"
                        icon="trophy-variant"
                        onPress={() => navigation.navigate('Events')}
                        color="#8b5cf6"
                    />
                </View>
            </View>

            {/* ─── Recent Payments ─── */}
            <SectionHeader
                title="Recent Payments"
                icon="credit-card-outline"
                onSeeAll={() => navigation.navigate('MySessions')}
            />
            <View className="px-4">
                {recentPayments.length > 0 ? (
                    recentPayments.map(payment => (
                        <View
                            key={payment.id}
                            className="bg-white rounded-xl p-4 mb-3 shadow-sm flex-row items-center"
                            style={{ elevation: 2 }}>
                            <View className="w-12 h-12 bg-emerald-100 rounded-full justify-center items-center">
                                <Icon name="calendar" size={22} color="#059669" />
                            </View>
                            <View className="flex-1 ml-4">
                                <Text className="text-gray-900 font-semibold">
                                    {payment.description || payment.type}
                                </Text>
                                <View className="flex-row items-center mt-1">
                                    <Icon name="calendar" size={12} color="#9ca3af" />
                                    <Text className="text-gray-400 text-xs ml-1">
                                        {new Date(payment.createdAt).toLocaleDateString()}
                                    </Text>
                                    <Text className="text-gray-400 text-xs ml-3">
                                        ${payment.amount}
                                    </Text>
                                </View>
                            </View>
                            <View
                                className={`px-3 py-1 rounded-full ${payment.status === 'paid' || payment.status === 'completed'
                                    ? 'bg-emerald-100'
                                    : 'bg-yellow-100'
                                    }`}>
                                <Text
                                    className={`text-xs font-semibold ${payment.status === 'paid' || payment.status === 'completed'
                                        ? 'text-emerald-700'
                                        : 'text-yellow-700'
                                        }`}>
                                    {payment.status}
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <View className="bg-white rounded-xl p-8 items-center">
                        <Icon name="calendar-blank" size={48} color="#d1d5db" />
                        <Text className="text-gray-400 mt-2">No recent payments</Text>
                    </View>
                )}
            </View>

            {/* ─── Quick Info Card ─── */}
            <SectionHeader title="Quick Info" icon="information-outline" showSeeAll={false} />
            <View className="px-4">
                <View
                    className="bg-white rounded-xl p-4 shadow-sm"
                    style={{ elevation: 2 }}>
                    {[
                        {
                            label: 'Member Since',
                            value: member?.createdAt
                                ? new Date(member.createdAt).toLocaleDateString()
                                : 'N/A',
                            icon: 'calendar-account',
                        },
                        { label: 'Email', value: member?.email || 'N/A', icon: 'email-outline' },
                        { label: 'Phone', value: member?.phone || 'N/A', icon: 'phone-outline' },
                        { label: 'Status', value: member?.status || 'active', icon: 'check-circle' },
                    ].map((info, index) => (
                        <View
                            key={info.label}
                            className={`flex-row items-center py-3 ${index < 3 ? 'border-b border-gray-100' : ''
                                }`}>
                            <View className="w-10 h-10 bg-emerald-50 rounded-lg justify-center items-center">
                                <Icon name={info.icon} size={20} color="#059669" />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-gray-400 text-xs">{info.label}</Text>
                                {info.label === 'Status' ? (
                                    <View className="bg-emerald-500 px-3 py-0.5 rounded-full self-start mt-1">
                                        <Text className="text-white text-xs font-bold">{info.value}</Text>
                                    </View>
                                ) : (
                                    <Text className="text-gray-900 font-medium text-sm mt-0.5">
                                        {info.value}
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* ─── Facilities ─── */}
            <SectionHeader
                title="Your Facilities"
                icon="office-building"
                onSeeAll={() => navigation.navigate('Sports')}
            />
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="pl-4"
                contentContainerStyle={{ paddingRight: 16 }}>
                {facilities.length > 0 ? (
                    facilities.map(facility => (
                        <TouchableOpacity
                            key={facility.id}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('Sports')}
                            className="bg-white rounded-xl mr-3 shadow-sm overflow-hidden"
                            style={{ elevation: 2, width: 160 }}>
                            <LinearGradient
                                colors={['#059669', '#3b82f6']}
                                className="h-24 justify-center items-center">
                                <Icon name="office-building" size={36} color="#fff" />
                            </LinearGradient>
                            <View className="p-3">
                                <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>
                                    {facility.name}
                                </Text>
                                <Text className="text-gray-400 text-xs mt-1">{facility.type}</Text>
                                <View className="flex-row items-center justify-between mt-2">
                                    <View className="bg-emerald-100 px-2 py-0.5 rounded-full">
                                        <Text className="text-emerald-700 text-xs font-medium">
                                            {facility.status}
                                        </Text>
                                    </View>
                                    <Text className="text-gray-400 text-xs">{facility.capacity} cap</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View className="bg-white rounded-xl p-8 items-center" style={{ width: 300 }}>
                        <Icon name="office-building" size={48} color="#d1d5db" />
                        <Text className="text-gray-400 mt-2">No facilities available</Text>
                    </View>
                )}
            </ScrollView>

            {/* ─── Join Another Club Card ─── */}
            <View className="px-4 mt-4">
                <TouchableOpacity
                    onPress={handleOpenJoinClubModal}
                    activeOpacity={0.8}
                    className="bg-white rounded-2xl p-5 border-2 border-dashed border-blue-300"
                    style={{ elevation: 2 }}>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                            <View className="w-12 h-12 bg-blue-100 rounded-full justify-center items-center">
                                <Icon name="office-building-marker" size={24} color="#2563eb" />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-gray-900 font-bold text-base">
                                    Multi-Club Access
                                </Text>
                                <Text className="text-gray-500 text-xs mt-1">
                                    Request access to join additional clubs
                                </Text>
                            </View>
                        </View>
                        <View className="bg-blue-600 rounded-xl px-4 py-2 flex-row items-center">
                            <Icon name="plus" size={16} color="#fff" />
                            <Text className="text-white font-bold text-sm ml-1">Join</Text>
                        </View>
                    </View>
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
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-gray-900 font-bold text-xl">
                                Biometric Punch In
                            </Text>
                            <TouchableOpacity onPress={() => setShowPunchInModal(false)}>
                                <Icon name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-gray-500 text-sm mb-6">
                            Select the facility you're visiting and scan your fingerprint
                        </Text>

                        {/* Fingerprint Icon */}
                        <View className="items-center mb-6">
                            <View className="w-28 h-28 bg-emerald-100 rounded-full justify-center items-center">
                                <Icon name="fingerprint" size={64} color="#059669" />
                            </View>
                            <Text className="text-gray-400 text-sm mt-3">
                                Place your finger on the scanner
                            </Text>
                        </View>

                        {/* Facility Selection */}
                        <Text className="text-gray-700 font-medium text-sm mb-3">
                            Select Facility
                        </Text>
                        <View className="mb-6">
                            {facilities.map(facility => (
                                <TouchableOpacity
                                    key={facility.id}
                                    onPress={() => setSelectedFacility(facility.name)}
                                    className={`flex-row items-center p-4 rounded-xl mb-2 border-2 ${selectedFacility === facility.name
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-gray-200 bg-white'
                                        }`}
                                    activeOpacity={0.7}>
                                    <Icon
                                        name={
                                            selectedFacility === facility.name
                                                ? 'radiobox-marked'
                                                : 'radiobox-blank'
                                        }
                                        size={22}
                                        color={
                                            selectedFacility === facility.name ? '#059669' : '#d1d5db'
                                        }
                                    />
                                    <View className="ml-3">
                                        <Text className="text-gray-900 font-semibold">{facility.name}</Text>
                                        <Text className="text-gray-400 text-xs">{facility.type}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Buttons */}
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setShowPunchInModal(false)}
                                className="flex-1 border border-gray-300 rounded-xl py-4 items-center">
                                <Text className="text-gray-700 font-semibold">Cancel</Text>
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
                                    className="rounded-xl py-4 items-center">
                                    <Text className="text-white font-bold">Confirm Punch In</Text>
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
                                <Icon name="office-building-marker" size={22} color="#2563eb" />
                                <Text className="text-gray-900 font-bold text-xl ml-2">
                                    Join Another Club
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowJoinClubModal(false)}>
                                <Icon name="close" size={24} color="#6b7280" />
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
                                    <Text className="text-orange-600 font-semibold text-sm mb-2">
                                        Pending Requests
                                    </Text>
                                    {myJoinRequests
                                        .filter(r => r.status === 'pending')
                                        .map(request => (
                                            <View
                                                key={request._id}
                                                className="flex-row items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-200 mb-2">
                                                <View>
                                                    <Text className="text-gray-900 font-medium text-sm">
                                                        {request.branchId?.name || 'Unknown Club'}
                                                    </Text>
                                                    <Text className="text-gray-400 text-xs">
                                                        {request.branchId?.city}
                                                    </Text>
                                                    <Text className="text-orange-600 text-xs mt-1">
                                                        Awaiting admin approval
                                                    </Text>
                                                </View>
                                                <TouchableOpacity
                                                    onPress={() => handleCancelJoinRequest(request._id)}>
                                                    <Icon name="close-circle" size={22} color="#ef4444" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                </View>
                            )}

                            {/* Available Clubs */}
                            <Text className="text-gray-900 font-semibold text-sm mb-3">
                                Available Clubs
                            </Text>
                            {clubsLoading ? (
                                <View className="items-center py-8">
                                    <ActivityIndicator size="large" color="#2563eb" />
                                </View>
                            ) : availableClubs.filter(c => c.memberStatus === 'available')
                                .length === 0 ? (
                                <Text className="text-gray-400 text-sm text-center py-6">
                                    No additional clubs available to join at the moment.
                                </Text>
                            ) : (
                                availableClubs
                                    .filter(c => c.memberStatus === 'available')
                                    .map(club => (
                                        <TouchableOpacity
                                            key={club._id}
                                            onPress={() => setSelectedClubId(club._id)}
                                            activeOpacity={0.7}
                                            className={`p-4 rounded-xl border-2 mb-3 ${selectedClubId === club._id
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 bg-white'
                                                }`}>
                                            <View className="flex-row justify-between items-start">
                                                <View className="flex-1">
                                                    <Text className="text-gray-900 font-semibold">
                                                        {club.name}
                                                    </Text>
                                                    <View className="flex-row items-center mt-1">
                                                        <Icon name="map-marker" size={14} color="#9ca3af" />
                                                        <Text className="text-gray-500 text-sm ml-1">
                                                            {club.address}
                                                            {club.city ? `, ${club.city}` : ''}
                                                        </Text>
                                                    </View>
                                                    {club.sportsOffered && club.sportsOffered.length > 0 && (
                                                        <View className="flex-row flex-wrap mt-2">
                                                            {club.sportsOffered.map((sport, idx) => (
                                                                <View
                                                                    key={idx}
                                                                    className="bg-blue-100 px-2 py-0.5 rounded-full mr-1 mb-1">
                                                                    <Text className="text-blue-700 text-xs">
                                                                        {sport}
                                                                    </Text>
                                                                </View>
                                                            ))}
                                                        </View>
                                                    )}
                                                </View>
                                                <View className="bg-blue-100 px-2 py-1 rounded-full">
                                                    <Text className="text-blue-700 text-xs font-medium">
                                                        {club.code}
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))
                            )}

                            {/* Message Input */}
                            {selectedClubId !== '' && (
                                <View className="mt-2 mb-4">
                                    <Text className="text-gray-700 font-medium text-sm mb-2">
                                        Message to Admin (Optional)
                                    </Text>
                                    <TextInput
                                        className="bg-gray-100 rounded-xl p-4 text-gray-900"
                                        placeholder="Tell the admin why you'd like to join this club..."
                                        placeholderTextColor="#9ca3af"
                                        value={joinMessage}
                                        onChangeText={setJoinMessage}
                                        multiline
                                        numberOfLines={3}
                                        textAlignVertical="top"
                                    />
                                </View>
                            )}
                        </ScrollView>

                        {/* Footer Buttons */}
                        <View className="flex-row gap-3 mt-4">
                            <TouchableOpacity
                                onPress={() => setShowJoinClubModal(false)}
                                className="flex-1 border border-gray-300 rounded-xl py-4 items-center">
                                <Text className="text-gray-700 font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSubmitJoinRequest}
                                activeOpacity={0.8}
                                className="flex-1"
                                disabled={!selectedClubId || submittingJoin}>
                                <View
                                    className={`rounded-xl py-4 items-center flex-row justify-center ${!selectedClubId || submittingJoin
                                        ? 'bg-gray-300'
                                        : 'bg-blue-600'
                                        }`}>
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
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

export default MemberDashboardScreen;