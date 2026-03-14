import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Modal,
    RefreshControl,
    Image,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from '../../components/CustomButton';

// ─── Mock Data (replace with real API service later) ───
const MOCK_FACILITIES = [
    {
        _id: 'f1',
        name: 'Main Gym',
        type: 'gym',
        status: 'available',
        location: 'Ground Floor, Block A',
        capacity: 100,
        branch: { name: 'Downtown Branch' },
        openingHours: '6:00 AM - 10:00 PM',
        description: 'State-of-the-art gym with modern equipment for all fitness levels.',
        sports: [{ name: 'Gym' }, { name: 'Strength Training' }, { name: 'CrossFit' }],
        amenities: ['Air Conditioning', 'Lockers', 'Showers', 'Water Fountain', 'WiFi'],
        rules: ['Wear proper gym attire', 'Wipe equipment after use', 'No food on gym floor'],
        imageUrl: null,
    },
    {
        _id: 'f2',
        name: 'Olympic Pool',
        type: 'pool',
        status: 'available',
        location: 'Building B, Level 1',
        capacity: 50,
        branch: { name: 'Downtown Branch' },
        openingHours: '7:00 AM - 9:00 PM',
        description: 'Olympic-sized swimming pool with temperature control.',
        sports: [{ name: 'Swimming' }, { name: 'Water Aerobics' }],
        amenities: ['Changing Rooms', 'Showers', 'Towel Service'],
        rules: ['Shower before entering pool', 'No diving in shallow end', 'Swim cap required'],
        imageUrl: null,
    },
    {
        _id: 'f3',
        name: 'Tennis Court A',
        type: 'court',
        status: 'available',
        location: 'Outdoor Area, East Wing',
        capacity: 4,
        branch: { name: 'Downtown Branch' },
        openingHours: '6:00 AM - 8:00 PM',
        description: 'Professional tennis court with synthetic surface.',
        sports: [{ name: 'Tennis' }],
        amenities: ['Lighting', 'Seating Area', 'Water Station'],
        rules: ['Proper tennis shoes required', 'Book in advance', 'Max 1 hour per session'],
        imageUrl: null,
    },
    {
        _id: 'f4',
        name: 'Yoga Studio',
        type: 'studio',
        status: 'available',
        location: 'Building A, Level 2',
        capacity: 30,
        branch: { name: 'Downtown Branch' },
        openingHours: '6:00 AM - 9:00 PM',
        description: 'Peaceful studio for yoga, pilates, and meditation sessions.',
        sports: [{ name: 'Yoga' }, { name: 'Pilates' }, { name: 'Meditation' }],
        amenities: ['Yoga Mats', 'Sound System', 'Air Conditioning', 'Mirror Wall'],
        rules: ['Remove shoes before entering', 'Arrive 5 min early', 'Silence phones'],
        imageUrl: null,
    },
    {
        _id: 'f5',
        name: 'Basketball Arena',
        type: 'arena',
        status: 'maintenance',
        location: 'Sports Complex, Level 1',
        capacity: 200,
        branch: { name: 'Downtown Branch' },
        openingHours: '8:00 AM - 10:00 PM',
        description: 'Indoor basketball arena with professional court markings.',
        sports: [{ name: 'Basketball' }, { name: 'Volleyball' }],
        amenities: ['Scoreboard', 'Seating', 'Changing Rooms'],
        rules: ['Indoor shoes only', 'No food or drinks on court'],
        imageUrl: null,
    },
    {
        _id: 'f6',
        name: 'Running Track',
        type: 'track',
        status: 'available',
        location: 'Outdoor Area, North',
        capacity: 40,
        branch: { name: 'Downtown Branch' },
        openingHours: '5:00 AM - 9:00 PM',
        description: '400m synthetic running track for all levels.',
        sports: [{ name: 'Running' }, { name: 'Cycling' }],
        amenities: ['Lighting', 'Water Stations', 'Timing System'],
        rules: ['Run in designated lanes', 'No cycling during peak hours'],
        imageUrl: null,
    },
];

const MOCK_CURRENT_PLAN = {
    name: 'Premium',
    sports: ['Gym', 'Swimming', 'Yoga', 'Tennis'],
    facilities: ['Main Gym', 'Olympic Pool', 'Yoga Studio', 'Tennis Court A'],
};

const MOCK_MEMBERSHIP = {
    type: 'Premium',
    status: 'active',
};

const MOCK_ACCESSIBLE_SPORTS = [
    { sportName: 'Gym' },
    { sportName: 'Swimming' },
    { sportName: 'Yoga' },
    { sportName: 'Tennis' },
];

const FILTER_TYPES = [
    { key: 'all', label: 'All' },
    { key: 'gym', label: 'Gym' },
    { key: 'pool', label: 'Pool' },
    { key: 'court', label: 'Court' },
    { key: 'studio', label: 'Studio' },
    { key: 'field', label: 'Field' },
    { key: 'track', label: 'Track' },
    { key: 'arena', label: 'Arena' },
    { key: 'outdoor', label: 'Outdoor' },
];

const FILTER_STATUSES = [
    { key: 'available', label: 'Available' },
    { key: 'maintenance', label: 'Maintenance' },
    { key: 'closed', label: 'Closed' },
];

const TYPE_TO_SPORT_MAP = {
    gym: ['Gym', 'Strength Training', 'Cardio', 'Gym Workout', 'Weightlifting', 'CrossFit', 'Bodybuilding', 'Calisthenics'],
    pool: ['Swimming', 'Water Aerobics', 'Water Polo'],
    studio: ['Yoga', 'Pilates', 'Meditation', 'Dance', 'Zumba'],
    court: ['Tennis', 'Badminton', 'Basketball', 'Volleyball', 'Squash', 'Table Tennis'],
    field: ['Football', 'Cricket', 'Running'],
    track: ['Running', 'Cycling'],
    arena: ['Basketball', 'Volleyball', 'Boxing', 'Martial Arts'],
    outdoor: ['Tennis', 'Running', 'Cycling', 'Football', 'Cricket'],
};

// ─── Facility type icon mapping ───
const FACILITY_TYPE_ICONS = {
    gym: 'dumbbell',
    pool: 'pool',
    court: 'tennis',
    studio: 'meditation',
    field: 'soccer-field',
    track: 'run-fast',
    arena: 'basketball',
    outdoor: 'nature-people',
};

// ─── Component ───
const SportsScreen = ({ navigation }) => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [membershipLoading, setMembershipLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('available');
    const [viewMode, setViewMode] = useState('all'); // 'all' | 'my-plan'

    // Membership
    const [membership, setMembership] = useState(null);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [accessibleSports, setAccessibleSports] = useState([]);

    // Detail modal
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Expandable sport sections
    const [expandedSports, setExpandedSports] = useState({});

    // ─── Data Fetching (Mock) ───
    const fetchMembershipData = useCallback(async () => {
        try {
            setMembershipLoading(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            setMembership(MOCK_MEMBERSHIP);
            setCurrentPlan(MOCK_CURRENT_PLAN);
            setAccessibleSports(MOCK_ACCESSIBLE_SPORTS);
        } catch (error) {
            console.error('Failed to fetch membership:', error);
        } finally {
            setMembershipLoading(false);
        }
    }, []);

    const fetchFacilities = useCallback(async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 600));
            let filtered = [...MOCK_FACILITIES];
            if (filterStatus !== 'all') {
                filtered = filtered.filter(f => f.status === filterStatus);
            }
            if (filterType !== 'all') {
                filtered = filtered.filter(f => f.type === filterType);
            }
            setFacilities(filtered);
        } catch (error) {
            Alert.alert('Error', 'Failed to load facilities');
        } finally {
            setLoading(false);
        }
    }, [filterType, filterStatus]);

    useEffect(() => {
        fetchMembershipData();
    }, [fetchMembershipData]);

    useEffect(() => {
        fetchFacilities();
    }, [fetchFacilities]);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchMembershipData(), fetchFacilities()]);
        setRefreshing(false);
    };

    // ─── Helpers ───
    const getFacilitySportName = fs => {
        if (typeof fs === 'string') return fs;
        if (fs.name) return fs.name;
        if (fs.sportId && typeof fs.sportId === 'object') return fs.sportId.name || '';
        return fs.sportName || '';
    };

    const memberSportNames = useMemo(() => {
        if (accessibleSports.length > 0) {
            return accessibleSports
                .map(s => s.sportName || (s.sportId && typeof s.sportId === 'object' ? s.sportId.name : ''))
                .filter(Boolean);
        }
        if (currentPlan?.sports && currentPlan.sports.length > 0) {
            return currentPlan.sports;
        }
        return [];
    }, [accessibleSports, currentPlan]);

    const isSportInPlan = sportName => {
        if (memberSportNames.length === 0) return false;
        return memberSportNames.some(s => s.toLowerCase() === sportName.toLowerCase());
    };

    const isFacilityInPlan = facility => {
        if (!currentPlan && memberSportNames.length === 0) return false;
        if (currentPlan?.facilities && currentPlan.facilities.length > 0) {
            const match = currentPlan.facilities.some(
                f => f.toLowerCase() === facility.name?.toLowerCase(),
            );
            if (match) return true;
        }
        if (facility.sports && facility.sports.length > 0 && memberSportNames.length > 0) {
            return facility.sports.some(fs => {
                const sportName = getFacilitySportName(fs);
                return isSportInPlan(sportName);
            });
        }
        if (memberSportNames.length > 0) {
            const mappedSports = TYPE_TO_SPORT_MAP[facility.type?.toLowerCase()] || [];
            return mappedSports.some(ms =>
                memberSportNames.some(ps => ps.toLowerCase() === ms.toLowerCase()),
            );
        }
        return false;
    };

    const getStatusColor = status => {
        switch (status) {
            case 'active':
            case 'available':
                return { bg: 'bg-emerald-500', text: 'text-white' };
            case 'maintenance':
                return { bg: 'bg-yellow-500', text: 'text-white' };
            case 'inactive':
            case 'closed':
                return { bg: 'bg-red-500', text: 'text-white' };
            default:
                return { bg: 'bg-gray-500', text: 'text-white' };
        }
    };

    const getGradientForType = type => {
        switch (type) {
            case 'gym':
                return ['#059669', '#10b981'];
            case 'pool':
                return ['#0284c7', '#38bdf8'];
            case 'court':
                return ['#d97706', '#fbbf24'];
            case 'studio':
                return ['#7c3aed', '#a78bfa'];
            case 'arena':
                return ['#dc2626', '#f87171'];
            case 'track':
                return ['#0891b2', '#22d3ee'];
            case 'field':
                return ['#16a34a', '#4ade80'];
            case 'outdoor':
                return ['#ea580c', '#fb923c'];
            default:
                return ['#059669', '#3b82f6'];
        }
    };

    // ─── Filtered Facilities ───
    const filteredFacilities = useMemo(() => {
        return facilities.filter(f => {
            const matchesSearch =
                f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                f.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                f.location?.toLowerCase().includes(searchTerm.toLowerCase());
            if (!matchesSearch) return false;
            if (viewMode === 'my-plan') return isFacilityInPlan(f);
            return true;
        });
    }, [facilities, searchTerm, viewMode, memberSportNames, currentPlan]);

    const planFacilitiesCount = useMemo(() => {
        return facilities.filter(f => isFacilityInPlan(f)).length;
    }, [facilities, memberSportNames, currentPlan]);

    // ─── Sport → Facility Mapping ───
    const sportFacilityMapping = useMemo(() => {
        if (memberSportNames.length === 0 || facilities.length === 0) return [];
        return memberSportNames.map(sport => {
            const matchedFacilities = facilities.filter(facility => {
                if (facility.sports && facility.sports.length > 0) {
                    const hasDirectMatch = facility.sports.some(fs => {
                        const sportName = getFacilitySportName(fs);
                        return sportName.toLowerCase() === sport.toLowerCase();
                    });
                    if (hasDirectMatch) return true;
                }
                const mappedSports = TYPE_TO_SPORT_MAP[facility.type?.toLowerCase()] || [];
                return mappedSports.some(ms => ms.toLowerCase() === sport.toLowerCase());
            });
            return { sport, facilities: matchedFacilities };
        });
    }, [memberSportNames, facilities]);

    const toggleSportExpand = sport => {
        setExpandedSports(prev => ({ ...prev, [sport]: !prev[sport] }));
    };

    const handleViewDetails = facility => {
        setSelectedFacility(facility);
        setShowDetailModal(true);
    };

    // ─── Loading State ───
    if (loading && membershipLoading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#059669" />
                <Text className="text-gray-500 mt-3">Loading sports & facilities...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* ─── Header ─── */}
            <LinearGradient
                colors={['#059669', '#10b981']}
                className="px-6 pt-12 pb-6">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-white font-bold text-2xl mb-1">
                            Sports & Facilities
                        </Text>
                        <Text className="text-white/80 text-sm">
                            Explore available facilities at your branch
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={fetchFacilities}
                        className="w-10 h-10 bg-white/20 rounded-full justify-center items-center">
                        <Icon
                            name={loading ? 'loading' : 'refresh'}
                            size={22}
                            color="#fff"
                        />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />
                }>
                {/* ─── Membership Plan Banner ─── */}
                {membershipLoading ? (
                    <View className="mx-4 mt-4 bg-white rounded-xl p-4" style={{ elevation: 2 }}>
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-gray-200 rounded-full" />
                            <View className="ml-3 flex-1">
                                <View className="w-32 h-4 bg-gray-200 rounded mb-2" />
                                <View className="w-48 h-3 bg-gray-200 rounded" />
                            </View>
                        </View>
                    </View>
                ) : currentPlan ? (
                    <View
                        className="mx-4 mt-4 bg-white rounded-2xl border-2 border-emerald-500 overflow-hidden"
                        style={{ elevation: 4 }}>
                        <LinearGradient
                            colors={['#ecfdf5', '#eff6ff']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="p-5">
                            <View className="flex-row items-start">
                                <View className="w-12 h-12 bg-emerald-100 rounded-full justify-center items-center">
                                    <Icon name="star" size={24} color="#059669" />
                                </View>
                                <View className="ml-3 flex-1">
                                    <View className="flex-row items-center mb-1">
                                        <Text className="text-gray-900 font-semibold text-base">
                                            Your Plan:{' '}
                                        </Text>
                                        <View className="bg-emerald-500 px-3 py-1 rounded-full">
                                            <Text className="text-white font-bold text-xs">
                                                {currentPlan.name}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text className="text-gray-500 text-xs mb-3">
                                        Your membership includes access to the following sports & facilities
                                    </Text>

                                    {/* Selected Sports */}
                                    {memberSportNames.length > 0 && (
                                        <View className="mb-2">
                                            <View className="flex-row items-center mb-2">
                                                <Icon name="dumbbell" size={12} color="#6b7280" />
                                                <Text className="text-gray-500 text-xs font-medium uppercase ml-1">
                                                    Your Selected Sports
                                                </Text>
                                            </View>
                                            <View className="flex-row flex-wrap">
                                                {memberSportNames.map((sport, idx) => (
                                                    <View
                                                        key={idx}
                                                        className="flex-row items-center bg-emerald-100 border border-emerald-200 rounded-full px-2.5 py-1 mr-1.5 mb-1.5">
                                                        <Icon name="check-circle" size={12} color="#059669" />
                                                        <Text className="text-emerald-700 text-xs font-medium ml-1">
                                                            {sport}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}

                                    {/* Plan Facilities */}
                                    {currentPlan.facilities && currentPlan.facilities.length > 0 && (
                                        <View>
                                            <View className="flex-row items-center mb-2">
                                                <Icon name="office-building" size={12} color="#6b7280" />
                                                <Text className="text-gray-500 text-xs font-medium uppercase ml-1">
                                                    Facilities Included
                                                </Text>
                                            </View>
                                            <View className="flex-row flex-wrap">
                                                {currentPlan.facilities.map((fac, idx) => (
                                                    <View
                                                        key={idx}
                                                        className="flex-row items-center bg-blue-100 border border-blue-200 rounded-full px-2.5 py-1 mr-1.5 mb-1.5">
                                                        <Icon name="check-circle" size={12} color="#2563eb" />
                                                        <Text className="text-blue-700 text-xs font-medium ml-1">
                                                            {fac}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Manage Plan Button */}
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Profile')}
                                className="flex-row items-center justify-center border border-emerald-300 bg-white rounded-xl py-2.5 mt-3">
                                <Icon name="credit-card-outline" size={16} color="#059669" />
                                <Text className="text-emerald-700 font-semibold text-sm ml-2">
                                    Manage Plan
                                </Text>
                                <Icon name="arrow-right" size={16} color="#059669" style={{ marginLeft: 4 }} />
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                ) : membership ? (
                    <View
                        className="mx-4 mt-4 bg-white rounded-2xl border-2 border-yellow-400 overflow-hidden"
                        style={{ elevation: 3 }}>
                        <LinearGradient
                            colors={['#fefce8', '#fff7ed']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="p-4 flex-row items-center">
                            <View className="w-12 h-12 bg-yellow-100 rounded-full justify-center items-center">
                                <Icon name="credit-card" size={24} color="#d97706" />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-gray-900 font-semibold">
                                    Membership: {membership.type || 'Active'}
                                </Text>
                                <Text className="text-gray-500 text-xs mt-1">
                                    Upgrade your plan to access more sports and facilities
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Profile')}
                                className="border border-gray-300 rounded-lg px-3 py-2">
                                <Text className="text-gray-700 text-xs font-semibold">View Plans</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                ) : null}

                {/* ─── Sport → Facility Mapping (Expandable) ─── */}
                {!membershipLoading &&
                    !loading &&
                    memberSportNames.length > 0 &&
                    sportFacilityMapping.length > 0 && (
                        <View className="mx-4 mt-4">
                            <View
                                className="bg-white rounded-2xl overflow-hidden"
                                style={{ elevation: 3 }}>
                                {/* Section Header */}
                                <View className="p-4 border-b border-gray-100">
                                    <View className="flex-row items-center">
                                        <Icon name="dumbbell" size={20} color="#059669" />
                                        <Text className="text-gray-900 font-bold text-base ml-2">
                                            Your Sports & Their Facilities
                                        </Text>
                                    </View>
                                    <Text className="text-gray-500 text-xs mt-1">
                                        Sports included in your{' '}
                                        <Text className="font-semibold">
                                            {currentPlan?.name || membership?.type || 'membership'}
                                        </Text>
                                    </Text>
                                </View>

                                {/* Expandable Sport Items */}
                                {sportFacilityMapping.map((item, idx) => {
                                    const isExpanded = expandedSports[item.sport] !== false; // default expanded
                                    return (
                                        <View
                                            key={idx}
                                            className={`${idx < sportFacilityMapping.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                            {/* Sport Header (Accordion Trigger) */}
                                            <TouchableOpacity
                                                onPress={() => toggleSportExpand(item.sport)}
                                                activeOpacity={0.7}
                                                className="flex-row items-center p-4">
                                                <View className="w-10 h-10 bg-emerald-100 rounded-lg justify-center items-center">
                                                    <Icon name="dumbbell" size={18} color="#059669" />
                                                </View>
                                                <View className="flex-1 ml-3">
                                                    <View className="flex-row items-center">
                                                        <Text className="text-gray-900 font-semibold">
                                                            {item.sport}
                                                        </Text>
                                                        <View className="bg-emerald-500 rounded-full px-2 py-0.5 ml-2 flex-row items-center">
                                                            <Icon name="check-circle" size={10} color="#fff" />
                                                            <Text className="text-white text-[10px] font-bold ml-0.5">
                                                                In Plan
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <Text className="text-gray-400 text-xs mt-0.5">
                                                        {item.facilities.length > 0
                                                            ? `Available at ${item.facilities.length} facilit${item.facilities.length === 1 ? 'y' : 'ies'}`
                                                            : 'No matching facility found'}
                                                    </Text>
                                                </View>
                                                <Icon
                                                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                                    size={20}
                                                    color="#9ca3af"
                                                />
                                            </TouchableOpacity>

                                            {/* Expanded Facilities */}
                                            {isExpanded && (
                                                <View className="px-4 pb-4">
                                                    {item.facilities.length > 0 ? (
                                                        item.facilities.map(facility => (
                                                            <TouchableOpacity
                                                                key={facility._id || facility.id}
                                                                onPress={() => handleViewDetails(facility)}
                                                                activeOpacity={0.7}
                                                                className="flex-row items-center p-3 bg-gray-50 rounded-xl mb-2 border border-gray-200">
                                                                {/* Facility Icon */}
                                                                <LinearGradient
                                                                    colors={getGradientForType(facility.type)}
                                                                    className="w-12 h-12 rounded-lg justify-center items-center">
                                                                    <Icon
                                                                        name={FACILITY_TYPE_ICONS[facility.type] || 'office-building'}
                                                                        size={22}
                                                                        color="#fff"
                                                                    />
                                                                </LinearGradient>
                                                                <View className="flex-1 ml-3">
                                                                    <Text className="text-gray-900 font-medium text-sm">
                                                                        {facility.name}
                                                                    </Text>
                                                                    <View className="flex-row items-center mt-0.5">
                                                                        <Text className="text-gray-400 text-xs capitalize">
                                                                            {facility.type}
                                                                        </Text>
                                                                        {facility.location && (
                                                                            <>
                                                                                <Text className="text-gray-300 text-xs mx-1">•</Text>
                                                                                <Icon name="map-marker" size={10} color="#9ca3af" />
                                                                                <Text className="text-gray-400 text-xs ml-0.5" numberOfLines={1}>
                                                                                    {facility.location}
                                                                                </Text>
                                                                            </>
                                                                        )}
                                                                    </View>
                                                                    {/* Sport badges */}
                                                                    {facility.sports && facility.sports.length > 0 && (
                                                                        <View className="flex-row flex-wrap mt-1.5">
                                                                            {facility.sports.map((fs, fi) => {
                                                                                const fsName = getFacilitySportName(fs);
                                                                                const isCurrentSport =
                                                                                    fsName.toLowerCase() === item.sport.toLowerCase();
                                                                                const isInPlan = isSportInPlan(fsName);
                                                                                return (
                                                                                    <View
                                                                                        key={fi}
                                                                                        className={`flex-row items-center rounded-full px-2 py-0.5 mr-1 mb-1 border ${isCurrentSport
                                                                                            ? 'border-emerald-400 bg-emerald-50'
                                                                                            : isInPlan
                                                                                                ? 'border-blue-300 bg-blue-50'
                                                                                                : 'border-gray-200 bg-white'
                                                                                            }`}>
                                                                                        {(isCurrentSport || isInPlan) && (
                                                                                            <Icon
                                                                                                name="check-circle"
                                                                                                size={8}
                                                                                                color={isCurrentSport ? '#059669' : '#2563eb'}
                                                                                            />
                                                                                        )}
                                                                                        <Text
                                                                                            className={`text-[10px] ${isCurrentSport
                                                                                                ? 'text-emerald-700 font-semibold'
                                                                                                : isInPlan
                                                                                                    ? 'text-blue-600'
                                                                                                    : 'text-gray-400'
                                                                                                } ${isCurrentSport || isInPlan ? 'ml-0.5' : ''}`}>
                                                                                            {fsName}
                                                                                        </Text>
                                                                                    </View>
                                                                                );
                                                                            })}
                                                                        </View>
                                                                    )}
                                                                </View>
                                                                {/* Status + Chevron */}
                                                                <View className="items-end ml-2">
                                                                    <View
                                                                        className={`px-2 py-0.5 rounded-full ${getStatusColor(facility.status).bg}`}>
                                                                        <Text className={`text-[10px] font-bold ${getStatusColor(facility.status).text}`}>
                                                                            {facility.status}
                                                                        </Text>
                                                                    </View>
                                                                    <Icon
                                                                        name="chevron-right"
                                                                        size={16}
                                                                        color="#d1d5db"
                                                                        style={{ marginTop: 4 }}
                                                                    />
                                                                </View>
                                                            </TouchableOpacity>
                                                        ))
                                                    ) : (
                                                        <View className="items-center py-4">
                                                            <Icon name="office-building" size={32} color="#d1d5db" />
                                                            <Text className="text-gray-400 text-sm mt-2">
                                                                No facility available for this sport
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                {/* ─── View Mode Tabs ─── */}
                {(currentPlan || memberSportNames.length > 0) && (
                    <View className="mx-4 mt-4">
                        <View className="flex-row bg-gray-200 rounded-xl p-1">
                            <TouchableOpacity
                                onPress={() => setViewMode('all')}
                                className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg ${viewMode === 'all' ? 'bg-white' : ''
                                    }`}
                                style={viewMode === 'all' ? { elevation: 1 } : {}}>
                                <Icon
                                    name="office-building"
                                    size={16}
                                    color={viewMode === 'all' ? '#059669' : '#6b7280'}
                                />
                                <Text
                                    className={`text-xs font-semibold ml-1.5 ${viewMode === 'all' ? 'text-emerald-600' : 'text-gray-500'
                                        }`}>
                                    All ({facilities.length})
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setViewMode('my-plan')}
                                className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg ${viewMode === 'my-plan' ? 'bg-white' : ''
                                    }`}
                                style={viewMode === 'my-plan' ? { elevation: 1 } : {}}>
                                <Icon
                                    name="star"
                                    size={16}
                                    color={viewMode === 'my-plan' ? '#059669' : '#6b7280'}
                                />
                                <Text
                                    className={`text-xs font-semibold ml-1.5 ${viewMode === 'my-plan' ? 'text-emerald-600' : 'text-gray-500'
                                        }`}>
                                    My Plan ({planFacilitiesCount})
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* ─── Search Bar ─── */}
                <View className="mx-4 mt-4">
                    <View className="flex-row items-center bg-white rounded-xl px-4 border border-gray-200" style={{ elevation: 1 }}>
                        <Icon name="magnify" size={20} color="#9ca3af" />
                        <TextInput
                            className="flex-1 py-3 px-3 text-gray-900 text-sm"
                            placeholder="Search facilities..."
                            placeholderTextColor="#9ca3af"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                        {searchTerm.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchTerm('')}>
                                <Icon name="close-circle" size={18} color="#d1d5db" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* ─── Type Filter Chips ─── */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mt-3"
                    contentContainerStyle={{ paddingHorizontal: 16 }}>
                    {FILTER_TYPES.map(type => (
                        <TouchableOpacity
                            key={type.key}
                            onPress={() => setFilterType(type.key)}
                            activeOpacity={0.8}
                            className={`mr-2 px-4 py-2 rounded-full ${filterType === type.key ? 'bg-emerald-500' : 'bg-white border border-gray-200'
                                }`}
                            style={filterType !== type.key ? { elevation: 1 } : {}}>
                            <Text
                                className={`text-xs font-semibold ${filterType === type.key ? 'text-white' : 'text-gray-600'
                                    }`}>
                                {type.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* ─── Status Filter Chips ─── */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mt-2"
                    contentContainerStyle={{ paddingHorizontal: 16 }}>
                    {FILTER_STATUSES.map(status => (
                        <TouchableOpacity
                            key={status.key}
                            onPress={() => setFilterStatus(status.key)}
                            activeOpacity={0.8}
                            className={`mr-2 px-4 py-2 rounded-full ${filterStatus === status.key ? 'bg-blue-500' : 'bg-white border border-gray-200'
                                }`}
                            style={filterStatus !== status.key ? { elevation: 1 } : {}}>
                            <Text
                                className={`text-xs font-semibold ${filterStatus === status.key ? 'text-white' : 'text-gray-600'
                                    }`}>
                                {status.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* ─── Facilities List ─── */}
                <View className="px-4 mt-4">
                    {loading ? (
                        <View className="items-center py-12">
                            <ActivityIndicator size="large" color="#059669" />
                            <Text className="text-gray-400 mt-3">Loading facilities...</Text>
                        </View>
                    ) : filteredFacilities.length === 0 ? (
                        <View className="bg-white rounded-2xl p-8 items-center" style={{ elevation: 2 }}>
                            <Icon name="office-building" size={48} color="#d1d5db" />
                            <Text className="text-gray-900 font-semibold text-base mt-3">
                                No facilities found
                            </Text>
                            <Text className="text-gray-400 text-sm text-center mt-1">
                                {viewMode === 'my-plan'
                                    ? 'No facilities match your current plan. Upgrade to access more!'
                                    : searchTerm
                                        ? 'Try adjusting your search'
                                        : 'No facilities available for the selected filters'}
                            </Text>
                            {viewMode === 'my-plan' && (
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Profile')}
                                    className="flex-row items-center border border-gray-300 rounded-xl px-4 py-2.5 mt-4">
                                    <Icon name="arrow-right" size={16} color="#6b7280" />
                                    <Text className="text-gray-700 font-semibold text-sm ml-2">
                                        Upgrade Membership
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <View>
                            <Text className="text-gray-400 text-xs mb-3">
                                {filteredFacilities.length} facilities found
                                {viewMode === 'my-plan' && ' (included in your plan)'}
                            </Text>

                            {filteredFacilities.map(facility => {
                                const inPlan =
                                    currentPlan || memberSportNames.length > 0
                                        ? isFacilityInPlan(facility)
                                        : null;
                                const statusColor = getStatusColor(facility.status);

                                return (
                                    <TouchableOpacity
                                        key={facility._id || facility.id}
                                        onPress={() => handleViewDetails(facility)}
                                        activeOpacity={0.8}
                                        className={`bg-white rounded-2xl mb-4 overflow-hidden ${inPlan === true ? 'border-2 border-emerald-400' : ''
                                            } ${inPlan === false ? 'opacity-80' : ''}`}
                                        style={{ elevation: 3 }}>
                                        {/* Facility Image / Gradient */}
                                        <LinearGradient
                                            colors={getGradientForType(facility.type)}
                                            className="h-36 justify-center items-center relative">
                                            <Icon
                                                name={FACILITY_TYPE_ICONS[facility.type] || 'office-building'}
                                                size={48}
                                                color="rgba(255,255,255,0.5)"
                                            />
                                            {/* Plan Badge */}
                                            {inPlan !== null && (
                                                <View className="absolute top-3 right-3">
                                                    {inPlan ? (
                                                        <View className="flex-row items-center bg-emerald-500 rounded-full px-2.5 py-1">
                                                            <Icon name="check-circle" size={12} color="#fff" />
                                                            <Text className="text-white text-[10px] font-bold ml-1">
                                                                In Your Plan
                                                            </Text>
                                                        </View>
                                                    ) : (
                                                        <View className="flex-row items-center bg-gray-800/70 rounded-full px-2.5 py-1">
                                                            <Icon name="lock" size={12} color="#fff" />
                                                            <Text className="text-white text-[10px] font-bold ml-1">
                                                                Not in Plan
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            )}
                                        </LinearGradient>

                                        {/* Facility Info */}
                                        <View className="p-4">
                                            <View className="flex-row items-start justify-between mb-2">
                                                <View className="flex-1">
                                                    <Text className="text-gray-900 font-bold text-lg">
                                                        {facility.name}
                                                    </Text>
                                                    <Text className="text-gray-500 text-sm capitalize">
                                                        {facility.type}
                                                    </Text>
                                                </View>
                                                <View className={`px-3 py-1 rounded-full ${statusColor.bg}`}>
                                                    <Text className={`text-xs font-bold ${statusColor.text}`}>
                                                        {facility.status}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Details */}
                                            {facility.location && (
                                                <View className="flex-row items-center mb-1.5">
                                                    <Icon name="map-marker" size={14} color="#9ca3af" />
                                                    <Text className="text-gray-500 text-xs ml-1.5" numberOfLines={1}>
                                                        {facility.location}
                                                    </Text>
                                                </View>
                                            )}
                                            {facility.branch && (
                                                <View className="flex-row items-center mb-1.5">
                                                    <Icon name="office-building" size={14} color="#9ca3af" />
                                                    <Text className="text-gray-500 text-xs ml-1.5" numberOfLines={1}>
                                                        {typeof facility.branch === 'object'
                                                            ? facility.branch.name
                                                            : facility.branch}
                                                    </Text>
                                                </View>
                                            )}
                                            {facility.capacity && (
                                                <View className="flex-row items-center mb-2">
                                                    <Icon name="account-group" size={14} color="#9ca3af" />
                                                    <Text className="text-gray-500 text-xs ml-1.5">
                                                        Capacity: {facility.capacity}
                                                    </Text>
                                                </View>
                                            )}

                                            {/* Sports Badges */}
                                            {facility.sports && facility.sports.length > 0 && (
                                                <View className="border-t border-gray-100 pt-2 mt-1">
                                                    <Text className="text-gray-400 text-[10px] mb-1.5">Sports:</Text>
                                                    <View className="flex-row flex-wrap">
                                                        {facility.sports.slice(0, 4).map((sport, i) => {
                                                            const sportName = getFacilitySportName(sport);
                                                            const sportInPlan =
                                                                memberSportNames.length > 0 ? isSportInPlan(sportName) : null;
                                                            return (
                                                                <View
                                                                    key={i}
                                                                    className={`flex-row items-center rounded-full px-2 py-0.5 mr-1 mb-1 border ${sportInPlan === true
                                                                        ? 'border-emerald-400 bg-emerald-50'
                                                                        : sportInPlan === false
                                                                            ? 'border-gray-200 bg-white'
                                                                            : 'border-gray-200 bg-white'
                                                                        }`}>
                                                                    {sportInPlan === true && (
                                                                        <Icon name="check-circle" size={10} color="#059669" />
                                                                    )}
                                                                    <Text
                                                                        className={`text-[10px] ${sportInPlan === true
                                                                            ? 'text-emerald-700 ml-0.5'
                                                                            : 'text-gray-500'
                                                                            }`}>
                                                                        {sportName}
                                                                    </Text>
                                                                </View>
                                                            );
                                                        })}
                                                        {facility.sports.length > 4 && (
                                                            <View className="border border-gray-200 rounded-full px-2 py-0.5">
                                                                <Text className="text-gray-400 text-[10px]">
                                                                    +{facility.sports.length - 4}
                                                                </Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                </View>
                                            )}

                                            {/* View Details Button */}
                                            <TouchableOpacity
                                                onPress={() => handleViewDetails(facility)}
                                                className="flex-row items-center justify-center border border-gray-200 rounded-xl py-2.5 mt-3">
                                                <Icon name="information-outline" size={16} color="#6b7280" />
                                                <Text className="text-gray-700 font-semibold text-sm ml-2">
                                                    View Details
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Bottom Spacing */}
                <View className="h-8" />
            </ScrollView>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── FACILITY DETAIL MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showDetailModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDetailModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl" style={{ maxHeight: '90%' }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {selectedFacility && (
                                <View>
                                    {/* Header Image */}
                                    <LinearGradient
                                        colors={getGradientForType(selectedFacility.type)}
                                        className="h-48 justify-center items-center rounded-t-3xl relative">
                                        <Icon
                                            name={FACILITY_TYPE_ICONS[selectedFacility.type] || 'office-building'}
                                            size={64}
                                            color="rgba(255,255,255,0.4)"
                                        />
                                        {/* Close Button */}
                                        <TouchableOpacity
                                            onPress={() => setShowDetailModal(false)}
                                            className="absolute top-4 right-4 w-8 h-8 bg-black/30 rounded-full justify-center items-center">
                                            <Icon name="close" size={20} color="#fff" />
                                        </TouchableOpacity>
                                    </LinearGradient>

                                    <View className="p-5">
                                        {/* Title + Plan Badge */}
                                        <View className="flex-row items-start justify-between mb-1">
                                            <Text className="text-gray-900 font-bold text-xl flex-1">
                                                {selectedFacility.name}
                                            </Text>
                                            {(currentPlan || memberSportNames.length > 0) &&
                                                isFacilityInPlan(selectedFacility) && (
                                                    <View className="flex-row items-center bg-emerald-500 rounded-full px-2.5 py-1 ml-2">
                                                        <Icon name="check-circle" size={12} color="#fff" />
                                                        <Text className="text-white text-[10px] font-bold ml-1">
                                                            In Plan
                                                        </Text>
                                                    </View>
                                                )}
                                        </View>
                                        <Text className="text-gray-500 text-sm mb-4">
                                            Complete facility information and guidelines
                                        </Text>

                                        {/* Plan Access Notice */}
                                        {(currentPlan || memberSportNames.length > 0) && (
                                            <View
                                                className={`p-4 rounded-xl mb-4 ${isFacilityInPlan(selectedFacility)
                                                    ? 'bg-emerald-50 border border-emerald-200'
                                                    : 'bg-amber-50 border border-amber-200'
                                                    }`}>
                                                <View className="flex-row items-start">
                                                    <Icon
                                                        name={
                                                            isFacilityInPlan(selectedFacility)
                                                                ? 'check-circle'
                                                                : 'lock'
                                                        }
                                                        size={20}
                                                        color={
                                                            isFacilityInPlan(selectedFacility) ? '#059669' : '#d97706'
                                                        }
                                                    />
                                                    <View className="ml-3 flex-1">
                                                        <Text
                                                            className={`font-semibold text-sm ${isFacilityInPlan(selectedFacility)
                                                                ? 'text-emerald-900'
                                                                : 'text-amber-900'
                                                                }`}>
                                                            {isFacilityInPlan(selectedFacility)
                                                                ? `✅ Included in your ${currentPlan?.name || membership?.type} plan`
                                                                : `🔒 Not included in your ${currentPlan?.name || membership?.type} plan`}
                                                        </Text>
                                                        <Text
                                                            className={`text-xs mt-1 ${isFacilityInPlan(selectedFacility)
                                                                ? 'text-emerald-700'
                                                                : 'text-amber-700'
                                                                }`}>
                                                            {isFacilityInPlan(selectedFacility)
                                                                ? 'You have full access to this facility.'
                                                                : 'Upgrade your membership to access this facility.'}
                                                        </Text>
                                                        {!isFacilityInPlan(selectedFacility) && (
                                                            <TouchableOpacity
                                                                onPress={() => {
                                                                    setShowDetailModal(false);
                                                                    navigation.navigate('Profile');
                                                                }}
                                                                className="bg-amber-600 rounded-lg px-4 py-2 mt-2 self-start flex-row items-center">
                                                                <Text className="text-white font-semibold text-xs">
                                                                    Upgrade Plan
                                                                </Text>
                                                                <Icon name="arrow-right" size={14} color="#fff" style={{ marginLeft: 4 }} />
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>
                                                </View>
                                            </View>
                                        )}

                                        {/* Info Grid */}
                                        <View className="flex-row flex-wrap mb-4">
                                            {[
                                                { label: 'Type', value: selectedFacility.type, capitalize: true },
                                                { label: 'Status', value: selectedFacility.status, isStatus: true },
                                                { label: 'Location', value: selectedFacility.location },
                                                { label: 'Capacity', value: selectedFacility.capacity ? `${selectedFacility.capacity} people` : null },
                                                {
                                                    label: 'Branch',
                                                    value:
                                                        typeof selectedFacility.branch === 'object'
                                                            ? selectedFacility.branch?.name
                                                            : typeof selectedFacility.branchId === 'object'
                                                                ? selectedFacility.branchId?.name
                                                                : selectedFacility.branch || null,
                                                },
                                                { label: 'Opening Hours', value: selectedFacility.openingHours },
                                                { label: 'Age Restriction', value: selectedFacility.ageRestriction },
                                                { label: 'Max Occupancy', value: selectedFacility.maxOccupancy ? `${selectedFacility.maxOccupancy} people` : null },
                                            ]
                                                .filter(item => item.value)
                                                .map((item, index) => (
                                                    <View key={index} className="w-1/2 mb-3 pr-2">
                                                        <Text className="text-gray-400 text-xs">{item.label}</Text>
                                                        {item.isStatus ? (
                                                            <View
                                                                className={`self-start px-2.5 py-0.5 rounded-full mt-1 ${getStatusColor(selectedFacility.status).bg
                                                                    }`}>
                                                                <Text
                                                                    className={`text-xs font-bold ${getStatusColor(selectedFacility.status).text
                                                                        }`}>
                                                                    {selectedFacility.status}
                                                                </Text>
                                                            </View>
                                                        ) : (
                                                            <Text
                                                                className={`text-gray-900 font-medium text-sm mt-0.5 ${item.capitalize ? 'capitalize' : ''
                                                                    }`}>
                                                                {item.value}
                                                            </Text>
                                                        )}
                                                    </View>
                                                ))}
                                        </View>

                                        {/* Description */}
                                        {selectedFacility.description && (
                                            <View className="mb-4">
                                                <Text className="text-gray-900 font-semibold mb-2">
                                                    Description
                                                </Text>
                                                <Text className="text-gray-500 text-sm leading-5">
                                                    {selectedFacility.description}
                                                </Text>
                                            </View>
                                        )}

                                        {/* Amenities */}
                                        {selectedFacility.amenities &&
                                            selectedFacility.amenities.length > 0 && (
                                                <View className="mb-4">
                                                    <View className="flex-row items-center mb-2">
                                                        <Icon name="check-circle" size={16} color="#059669" />
                                                        <Text className="text-gray-900 font-semibold ml-2">
                                                            Amenities
                                                        </Text>
                                                    </View>
                                                    <View className="flex-row flex-wrap">
                                                        {selectedFacility.amenities.map((amenity, index) => (
                                                            <View
                                                                key={index}
                                                                className="flex-row items-center w-1/2 mb-2">
                                                                <Icon name="check-circle" size={12} color="#059669" />
                                                                <Text className="text-gray-600 text-sm ml-2">
                                                                    {amenity}
                                                                </Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>
                                            )}

                                        {/* Rules */}
                                        {(selectedFacility.rules?.length > 0 ||
                                            selectedFacility.safetyRules?.length > 0) && (
                                                <View className="mb-4">
                                                    <View className="flex-row items-center mb-2">
                                                        <Icon name="shield-check" size={16} color="#059669" />
                                                        <Text className="text-gray-900 font-semibold ml-2">
                                                            Rules & Guidelines
                                                        </Text>
                                                    </View>
                                                    {(
                                                        selectedFacility.rules ||
                                                        selectedFacility.safetyRules ||
                                                        []
                                                    ).map((rule, index) => (
                                                        <View
                                                            key={index}
                                                            className="flex-row items-start mb-1.5">
                                                            <Text className="text-emerald-600 mt-0.5">•</Text>
                                                            <Text className="text-gray-600 text-sm ml-2 flex-1">
                                                                {rule}
                                                            </Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}

                                        {/* Available Sports */}
                                        {selectedFacility.sports &&
                                            selectedFacility.sports.length > 0 && (
                                                <View className="mb-4">
                                                    <Text className="text-gray-900 font-semibold mb-2">
                                                        Available Sports
                                                    </Text>
                                                    <View className="flex-row flex-wrap">
                                                        {selectedFacility.sports.map((sport, i) => {
                                                            const sportName = getFacilitySportName(sport);
                                                            const sportInPlan =
                                                                memberSportNames.length > 0
                                                                    ? isSportInPlan(sportName)
                                                                    : null;
                                                            return (
                                                                <View
                                                                    key={i}
                                                                    className={`flex-row items-center rounded-full px-3 py-1.5 mr-2 mb-2 border ${sportInPlan === true
                                                                        ? 'border-emerald-300 bg-emerald-100'
                                                                        : sportInPlan === false
                                                                            ? 'border-gray-200 bg-gray-100'
                                                                            : 'border-gray-200 bg-gray-100'
                                                                        }`}>
                                                                    {sportInPlan === true && (
                                                                        <Icon name="check-circle" size={12} color="#059669" />
                                                                    )}
                                                                    {sportInPlan === false && (
                                                                        <Icon name="lock" size={12} color="#9ca3af" />
                                                                    )}
                                                                    <Text
                                                                        className={`text-xs font-medium ${sportInPlan === true
                                                                            ? 'text-emerald-700 ml-1'
                                                                            : sportInPlan === false
                                                                                ? 'text-gray-500 ml-1'
                                                                                : 'text-gray-600'
                                                                            }`}>
                                                                        {sportName}
                                                                    </Text>
                                                                    {sportInPlan === true && (
                                                                        <Text className="text-emerald-500 text-[10px] ml-1">
                                                                            (In Plan)
                                                                        </Text>
                                                                    )}
                                                                </View>
                                                            );
                                                        })}
                                                    </View>
                                                </View>
                                            )}
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        {/* Close Button */}
                        <View className="px-5 pb-6 pt-2 border-t border-gray-100">
                            <TouchableOpacity
                                onPress={() => setShowDetailModal(false)}
                                className="border border-gray-300 rounded-xl py-3.5 items-center">
                                <Text className="text-gray-700 font-semibold">Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default SportsScreen;