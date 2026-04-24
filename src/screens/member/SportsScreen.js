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
    Alert,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DrawerMenuButton from '../../components/DrawerMenuButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
        description: 'State-of-the-art gym with modern equipment for all fitness levels. Features free weights, cardio machines, and functional training zones.',
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
        description: 'Olympic-sized swimming pool with temperature control and dedicated lap lanes.',
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
        description: 'Professional tennis court with synthetic surface and floodlighting.',
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
        description: 'Peaceful studio for yoga, pilates, and meditation sessions with ambient lighting.',
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
        description: 'Indoor basketball arena with professional court markings and electronic scoreboard.',
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
        description: '400m synthetic running track for all levels with professional timing system.',
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

// ─── Design Token Helpers ───
const getGradientForType = type => {
    switch (type) {
        case 'gym': return ['#064e3b', '#059669'];
        case 'pool': return ['#0c4a6e', '#0284c7'];
        case 'court': return ['#78350f', '#d97706'];
        case 'studio': return ['#4c1d95', '#7c3aed'];
        case 'arena': return ['#7f1d1d', '#dc2626'];
        case 'track': return ['#164e63', '#0891b2'];
        case 'field': return ['#14532d', '#16a34a'];
        case 'outdoor': return ['#7c2d12', '#ea580c'];
        default: return ['#064e3b', '#059669'];
    }
};

const getLightGradientForType = type => {
    switch (type) {
        case 'gym': return ['#ecfdf5', '#d1fae5'];
        case 'pool': return ['#f0f9ff', '#e0f2fe'];
        case 'court': return ['#fffbeb', '#fef3c7'];
        case 'studio': return ['#f5f3ff', '#ede9fe'];
        case 'arena': return ['#fef2f2', '#fee2e2'];
        case 'track': return ['#ecfeff', '#cffafe'];
        case 'field': return ['#f0fdf4', '#dcfce7'];
        case 'outdoor': return ['#fff7ed', '#ffedd5'];
        default: return ['#ecfdf5', '#d1fae5'];
    }
};

const getAccentColor = type => {
    switch (type) {
        case 'gym': return '#059669';
        case 'pool': return '#0284c7';
        case 'court': return '#d97706';
        case 'studio': return '#7c3aed';
        case 'arena': return '#dc2626';
        case 'track': return '#0891b2';
        case 'field': return '#16a34a';
        case 'outdoor': return '#ea580c';
        default: return '#059669';
    }
};

const getStatusConfig = status => {
    switch (status) {
        case 'active':
        case 'available':
            return { bg: '#dcfce7', text: '#166534', icon: 'check-circle', dot: '#22c55e' };
        case 'maintenance':
            return { bg: '#fef3c7', text: '#92400e', icon: 'alert-circle', dot: '#f59e0b' };
        case 'inactive':
        case 'closed':
            return { bg: '#fee2e2', text: '#991b1b', icon: 'close-circle', dot: '#ef4444' };
        default:
            return { bg: '#f3f4f6', text: '#374151', icon: 'help-circle', dot: '#9ca3af' };
    }
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
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════
const SportsScreen = ({ navigation }) => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [membershipLoading, setMembershipLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('available');
    const [viewMode, setViewMode] = useState('all');

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
        if (!facility) return false;  // ← ADD THIS
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
                <View className="w-16 h-16 rounded-2xl bg-emerald-50 justify-center items-center mb-4">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
                <Text className="text-gray-900 font-bold text-base">Loading Sports</Text>
                <Text className="text-gray-400 mt-1 text-sm">Preparing your facilities...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} tintColor="#059669" />
                }>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── HEADER ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <LinearGradient
                    colors={['#064e3b', '#059669', '#10b981']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ paddingTop: 48, paddingBottom: 36, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
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

                    {/* Title Section */}
                    <View className="px-5">
                        <View className="flex-row items-center mb-2">
                            <View className="w-10 h-10 bg-white/15 rounded-xl justify-center items-center mr-3">
                                <Icon name="dumbbell" size={22} color="#fff" />
                            </View>
                            <View>
                                <Text className="text-white font-bold text-2xl">
                                    Sports & Facilities
                                </Text>
                                <Text className="text-white/60 text-sm">
                                    Explore and book facilities at your branch
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Quick Stats Bar */}
                    <View className="mx-5 mt-5 bg-white/10 rounded-2xl p-4" style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <View className="w-10 h-10 bg-yellow-400/20 rounded-xl justify-center items-center">
                                    <Icon name="star" size={20} color="#fbbf24" />
                                </View>
                                <View className="ml-3">
                                    <Text className="text-white font-bold text-sm">
                                        {currentPlan?.name || membership?.type || 'Premium'} Plan
                                    </Text>
                                    <Text className="text-white/50 text-xs mt-0.5">
                                        {memberSportNames.length} sports · {planFacilitiesCount} facilities
                                    </Text>
                                </View>
                            </View>
                            <View className="bg-emerald-400 px-4 py-2 rounded-xl flex-row items-center">
                                <View className="w-2 h-2 rounded-full bg-white mr-1.5" />
                                <Text className="text-white font-bold text-xs">Active</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── MY PLAN SPORTS BANNER ─── */}
                {/* ═══════════════════════════════════════════════ */}
                {!membershipLoading && memberSportNames.length > 0 && (
                    <View className="px-4 -mt-5">
                        <LinearGradient
                            colors={['#ecfdf5', '#f0fdf4']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="rounded-2xl p-4 shadow-md"
                            style={{ elevation: 5, borderWidth: 1.5, borderColor: '#a7f3d0' }}>
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-row items-center">
                                    <View className="w-7 h-7 bg-emerald-500 rounded-lg justify-center items-center mr-2">
                                        <Icon name="shield-check" size={16} color="#fff" />
                                    </View>
                                    <Text className="text-gray-900 font-bold text-sm">Your Plan Includes</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Profile')}
                                    className="flex-row items-center bg-emerald-500 px-3 py-1.5 rounded-lg">
                                    <Icon name="pencil" size={12} color="#fff" />
                                    <Text className="text-white font-bold text-[10px] ml-1">Manage</Text>
                                </TouchableOpacity>
                            </View>
                            <View className="flex-row flex-wrap">
                                {memberSportNames.map((sport, idx) => (
                                    <View
                                        key={idx}
                                        className="flex-row items-center bg-white rounded-xl px-3 py-2 mr-2 mb-2 shadow-sm"
                                        style={{ elevation: 1, borderWidth: 1, borderColor: '#bbf7d0' }}>
                                        <Icon name="check-decagram" size={14} color="#059669" />
                                        <Text className="text-emerald-800 text-xs font-semibold ml-1.5">
                                            {sport}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </LinearGradient>
                    </View>
                )}

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── VIEW MODE TABS ─── */}
                {/* ═══════════════════════════════════════════════ */}
                {(currentPlan || memberSportNames.length > 0) && (
                    <View className="px-4 mt-5">
                        <View className="flex-row bg-white rounded-2xl p-1.5 shadow-sm" style={{ elevation: 2 }}>
                            <TouchableOpacity
                                onPress={() => setViewMode('all')}
                                className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${viewMode === 'all' ? 'bg-emerald-500' : ''}`}>
                                <Icon
                                    name="office-building"
                                    size={16}
                                    color={viewMode === 'all' ? '#fff' : '#6b7280'}
                                />
                                <Text
                                    className={`text-xs font-bold ml-1.5 ${viewMode === 'all' ? 'text-white' : 'text-gray-500'}`}>
                                    All Facilities ({facilities.length})
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setViewMode('my-plan')}
                                className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${viewMode === 'my-plan' ? 'bg-emerald-500' : ''}`}>
                                <Icon
                                    name="star"
                                    size={16}
                                    color={viewMode === 'my-plan' ? '#fff' : '#6b7280'}
                                />
                                <Text
                                    className={`text-xs font-bold ml-1.5 ${viewMode === 'my-plan' ? 'text-white' : 'text-gray-500'}`}>
                                    My Plan ({planFacilitiesCount})
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── SEARCH BAR ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-4">
                    <View className="flex-row items-center bg-white rounded-2xl px-4 shadow-sm" style={{ elevation: 2, borderWidth: 1.5, borderColor: '#e5e7eb' }}>
                        <Icon name="magnify" size={20} color="#9ca3af" />
                        <TextInput
                            className="flex-1 py-3.5 px-3 text-gray-900 text-sm"
                            placeholder="Search by name, type, or location..."
                            placeholderTextColor="#9ca3af"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                        {searchTerm.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchTerm('')} className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center">
                                <Icon name="close" size={16} color="#6b7280" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── SPORT → FACILITY MAPPING (Expandable) ─── */}
                {/* ═══════════════════════════════════════════════ */}
                {!membershipLoading && !loading && memberSportNames.length > 0 && sportFacilityMapping.length > 0 && (
                    <View className="px-4 mt-5">
                        <SectionTitle title="Your Sports & Facilities" icon="dumbbell" iconColor="#059669" />
                        <View className="bg-white rounded-2xl overflow-hidden shadow-md" style={{ elevation: 3 }}>
                            {sportFacilityMapping.map((item, idx) => {
                                const isExpanded = expandedSports[item.sport] !== false;
                                const sportIcon = item.sport.toLowerCase() === 'swimming' ? 'swim'
                                    : item.sport.toLowerCase() === 'yoga' ? 'meditation'
                                        : item.sport.toLowerCase() === 'tennis' ? 'tennis'
                                            : 'dumbbell';
                                return (
                                    <View
                                        key={idx}
                                        className={`${idx < sportFacilityMapping.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                        <TouchableOpacity
                                            onPress={() => toggleSportExpand(item.sport)}
                                            activeOpacity={0.7}
                                            className="flex-row items-center p-4">
                                            <LinearGradient
                                                colors={['#059669', '#10b981']}
                                                className="w-11 h-11 rounded-xl justify-center items-center"
                                                style={{ borderRadius: 12 }}>
                                                <Icon name={sportIcon} size={20} color="#fff" />
                                            </LinearGradient>
                                            <View className="flex-1 ml-3">
                                                <View className="flex-row items-center">
                                                    <Text className="text-gray-900 font-bold">{item.sport}</Text>
                                                    <View className="bg-emerald-100 px-2 py-0.5 rounded-full ml-2">
                                                        <Text className="text-emerald-700 text-[10px] font-bold">In Plan</Text>
                                                    </View>
                                                </View>
                                                <Text className="text-gray-400 text-xs mt-0.5">
                                                    {item.facilities.length > 0
                                                        ? `${item.facilities.length} facilit${item.facilities.length === 1 ? 'y' : 'ies'} available`
                                                        : 'No matching facility'}
                                                </Text>
                                            </View>
                                            <View className={`w-7 h-7 rounded-full justify-center items-center ${isExpanded ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                                <Icon
                                                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                                    size={16}
                                                    color={isExpanded ? '#059669' : '#9ca3af'}
                                                />
                                            </View>
                                        </TouchableOpacity>

                                        {isExpanded && (
                                            <View className="px-4 pb-4">
                                                {item.facilities.length > 0 ? (
                                                    item.facilities.map(facility => {
                                                        const accentColor = getAccentColor(facility.type);
                                                        const statusCfg = getStatusConfig(facility.status);
                                                        return (
                                                            <TouchableOpacity
                                                                key={facility._id || facility.id}
                                                                onPress={() => handleViewDetails(facility)}
                                                                activeOpacity={0.7}
                                                                className="flex-row items-center p-3.5 bg-gray-50 rounded-2xl mb-2"
                                                                style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                                                                <LinearGradient
                                                                    colors={getGradientForType(facility.type)}
                                                                    className="w-12 h-12 rounded-xl justify-center items-center"
                                                                    style={{ borderRadius: 12 }}>
                                                                    <Icon
                                                                        name={FACILITY_TYPE_ICONS[facility.type] || 'office-building'}
                                                                        size={22}
                                                                        color="#fff"
                                                                    />
                                                                </LinearGradient>
                                                                <View className="flex-1 ml-3">
                                                                    <Text className="text-gray-900 font-bold text-sm">
                                                                        {facility.name}
                                                                    </Text>
                                                                    <View className="flex-row items-center mt-0.5">
                                                                        <Text className="text-gray-400 text-xs capitalize">
                                                                            {facility.type}
                                                                        </Text>
                                                                        {facility.location && (
                                                                            <>
                                                                                <Text className="text-gray-300 text-xs mx-1">·</Text>
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
                                                                            {facility.sports.slice(0, 3).map((fs, fi) => {
                                                                                const fsName = getFacilitySportName(fs);
                                                                                const isCurrentSport = fsName.toLowerCase() === item.sport.toLowerCase();
                                                                                return (
                                                                                    <View
                                                                                        key={fi}
                                                                                        className={`rounded-lg px-2 py-0.5 mr-1 ${isCurrentSport
                                                                                            ? 'bg-emerald-100'
                                                                                            : 'bg-white border border-gray-200'
                                                                                            }`}>
                                                                                        <Text className={`text-[10px] ${isCurrentSport ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
                                                                                            {fsName}
                                                                                        </Text>
                                                                                    </View>
                                                                                );
                                                                            })}
                                                                        </View>
                                                                    )}
                                                                </View>
                                                                <View className="items-end ml-2">
                                                                    <View
                                                                        className="px-2.5 py-1 rounded-lg flex-row items-center"
                                                                        style={{ backgroundColor: statusCfg.bg }}>
                                                                        <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: statusCfg.dot }} />
                                                                        <Text className="text-[10px] font-bold capitalize" style={{ color: statusCfg.text }}>
                                                                            {facility.status}
                                                                        </Text>
                                                                    </View>
                                                                    <Icon name="chevron-right" size={16} color="#d1d5db" style={{ marginTop: 6 }} />
                                                                </View>
                                                            </TouchableOpacity>
                                                        );
                                                    })
                                                ) : (
                                                    <View className="items-center py-6">
                                                        <View className="w-14 h-14 bg-gray-100 rounded-full justify-center items-center mb-3">
                                                            <Icon name="office-building-outline" size={28} color="#d1d5db" />
                                                        </View>
                                                        <Text className="text-gray-400 text-sm">No facility available</Text>
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

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── TYPE FILTER CHIPS ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="mt-5 px-4">
                    <View className="flex-row items-center mb-3">
                        <View className="w-6 h-6 rounded-md bg-gray-100 justify-center items-center mr-2">
                            <Icon name="filter-variant" size={14} color="#6b7280" />
                        </View>
                        <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Filter by Type</Text>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 4 }}>
                        {FILTER_TYPES.map(type => {
                            const isSelected = filterType === type.key;
                            return (
                                <TouchableOpacity
                                    key={type.key}
                                    onPress={() => setFilterType(type.key)}
                                    activeOpacity={0.7}
                                    className="mr-2">
                                    {isSelected ? (
                                        <LinearGradient
                                            colors={['#059669', '#10b981']}
                                            className="px-4 py-2.5 rounded-xl flex-row items-center"
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}>
                                            <Icon name="check" size={12} color="#fff" />
                                            <Text className="text-white text-xs font-bold ml-1">{type.label}</Text>
                                        </LinearGradient>
                                    ) : (
                                        <View className="bg-white px-4 py-2.5 rounded-xl shadow-sm" style={{ elevation: 1, borderWidth: 1, borderColor: '#e5e7eb' }}>
                                            <Text className="text-gray-600 text-xs font-semibold">{type.label}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* ─── STATUS FILTER CHIPS ─── */}
                <View className="mt-3 px-4">
                    <View className="flex-row items-center mb-3">
                        <View className="w-6 h-6 rounded-md bg-gray-100 justify-center items-center mr-2">
                            <Icon name="circle-slice-8" size={14} color="#6b7280" />
                        </View>
                        <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Filter by Status</Text>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 4 }}>
                        {FILTER_STATUSES.map(status => {
                            const isSelected = filterStatus === status.key;
                            const statusCfg = getStatusConfig(status.key);
                            return (
                                <TouchableOpacity
                                    key={status.key}
                                    onPress={() => setFilterStatus(status.key)}
                                    activeOpacity={0.7}
                                    className="mr-2">
                                    {isSelected ? (
                                        <View
                                            className="px-4 py-2.5 rounded-xl flex-row items-center"
                                            style={{ backgroundColor: statusCfg.bg, borderWidth: 1.5, borderColor: statusCfg.dot }}>
                                            <View className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: statusCfg.dot }} />
                                            <Text className="text-xs font-bold" style={{ color: statusCfg.text }}>{status.label}</Text>
                                        </View>
                                    ) : (
                                        <View className="bg-white px-4 py-2.5 rounded-xl shadow-sm" style={{ elevation: 1, borderWidth: 1, borderColor: '#e5e7eb' }}>
                                            <Text className="text-gray-600 text-xs font-semibold">{status.label}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── FACILITIES LIST ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-5">
                    {loading ? (
                        <View className="items-center py-12">
                            <View className="w-16 h-16 rounded-2xl bg-emerald-50 justify-center items-center mb-4">
                                <ActivityIndicator size="large" color="#059669" />
                            </View>
                            <Text className="text-gray-900 font-bold">Loading Facilities</Text>
                            <Text className="text-gray-400 text-sm mt-1">Fetching latest data...</Text>
                        </View>
                    ) : filteredFacilities.length === 0 ? (
                        <View className="bg-white rounded-2xl p-8 items-center shadow-md" style={{ elevation: 3 }}>
                            <View className="w-20 h-20 bg-gray-100 rounded-full justify-center items-center mb-4">
                                <Icon name="office-building-outline" size={40} color="#d1d5db" />
                            </View>
                            <Text className="text-gray-900 font-bold text-lg">No Facilities Found</Text>
                            <Text className="text-gray-400 text-sm text-center mt-2">
                                {viewMode === 'my-plan'
                                    ? 'No facilities match your current plan. Upgrade to access more!'
                                    : searchTerm
                                        ? 'Try adjusting your search or filters'
                                        : 'No facilities available for the selected filters'}
                            </Text>
                            {viewMode === 'my-plan' && (
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Profile')}
                                    activeOpacity={0.8}
                                    className="mt-5">
                                    <LinearGradient
                                        colors={['#059669', '#10b981']}
                                        className="px-6 py-3.5 rounded-xl flex-row items-center shadow-md"
                                        style={{ elevation: 3 }}>
                                        <Icon name="arrow-right" size={16} color="#fff" />
                                        <Text className="text-white font-bold text-sm ml-2">Upgrade Membership</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <View>
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                                    {filteredFacilities.length} Facilities
                                    {viewMode === 'my-plan' && ' · In Your Plan'}
                                </Text>
                            </View>

                            {filteredFacilities.map(facility => {
                                const inPlan = currentPlan || memberSportNames.length > 0
                                    ? isFacilityInPlan(facility) : null;
                                const statusCfg = getStatusConfig(facility.status);
                                const accentColor = getAccentColor(facility.type);

                                return (
                                    <TouchableOpacity
                                        key={facility._id || facility.id}
                                        onPress={() => handleViewDetails(facility)}
                                        activeOpacity={0.85}
                                        className="bg-white rounded-2xl mb-4 overflow-hidden shadow-md"
                                        style={{
                                            elevation: 3,
                                            borderWidth: inPlan === true ? 2 : 0,
                                            borderColor: inPlan === true ? '#059669' : 'transparent',
                                        }}>
                                        {/* Facility Header Gradient */}
                                        <LinearGradient
                                            colors={getGradientForType(facility.type)}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            className="h-32 justify-center items-center relative">
                                            <View className="w-16 h-16 bg-white/20 rounded-2xl justify-center items-center">
                                                <Icon
                                                    name={FACILITY_TYPE_ICONS[facility.type] || 'office-building'}
                                                    size={32}
                                                    color="#fff"
                                                />
                                            </View>
                                            {/* Plan Badge */}
                                            {inPlan !== null && (
                                                <View className="absolute top-3 left-3">
                                                    {inPlan ? (
                                                        <View className="flex-row items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg" style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}>
                                                            <Icon name="check-decagram" size={14} color="#fff" />
                                                            <Text className="text-white text-[11px] font-bold ml-1">In Your Plan</Text>
                                                        </View>
                                                    ) : (
                                                        <View className="flex-row items-center bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                                                            <Icon name="lock" size={14} color="rgba(255,255,255,0.7)" />
                                                            <Text className="text-white/80 text-[11px] font-bold ml-1">Not in Plan</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            )}
                                            {/* Status Badge */}
                                            <View className="absolute top-3 right-3">
                                                <View
                                                    className="px-3 py-1.5 rounded-lg flex-row items-center"
                                                    style={{ backgroundColor: statusCfg.bg }}>
                                                    <View className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: statusCfg.dot }} />
                                                    <Text className="text-[11px] font-bold capitalize" style={{ color: statusCfg.text }}>
                                                        {facility.status}
                                                    </Text>
                                                </View>
                                            </View>
                                            {/* Type Label */}
                                            <View className="absolute bottom-3 right-3">
                                                <View className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-lg">
                                                    <Text className="text-white text-[11px] font-bold capitalize">{facility.type}</Text>
                                                </View>
                                            </View>
                                        </LinearGradient>

                                        {/* Facility Info */}
                                        <View className="p-4">
                                            <Text className="text-gray-900 font-bold text-lg">{facility.name}</Text>

                                            {/* Details Row */}
                                            <View className="flex-row items-center mt-1.5">
                                                <Icon name="map-marker" size={14} color="#9ca3af" />
                                                <Text className="text-gray-500 text-xs ml-1.5 flex-1" numberOfLines={1}>
                                                    {facility.location}
                                                </Text>
                                                {facility.capacity && (
                                                    <View className="flex-row items-center">
                                                        <Icon name="account-group" size={14} color="#9ca3af" />
                                                        <Text className="text-gray-500 text-xs ml-1">{facility.capacity}</Text>
                                                    </View>
                                                )}
                                            </View>

                                            {/* Opening Hours */}
                                            {facility.openingHours && (
                                                <View className="flex-row items-center mt-1.5">
                                                    <Icon name="clock-outline" size={14} color="#9ca3af" />
                                                    <Text className="text-gray-500 text-xs ml-1.5">{facility.openingHours}</Text>
                                                </View>
                                            )}

                                            {/* Sports Badges */}
                                            {facility.sports && facility.sports.length > 0 && (
                                                <View className="flex-row flex-wrap mt-3 pt-3 border-t border-gray-100">
                                                    {facility.sports.slice(0, 5).map((sport, i) => {
                                                        const sportName = getFacilitySportName(sport);
                                                        const sportInPlan = memberSportNames.length > 0 ? isSportInPlan(sportName) : null;
                                                        return (
                                                            <View
                                                                key={i}
                                                                className={`flex-row items-center rounded-lg px-2.5 py-1 mr-1.5 mb-1.5 ${sportInPlan === true
                                                                    ? 'bg-emerald-50 border border-emerald-200'
                                                                    : 'bg-gray-50 border border-gray-200'
                                                                    }`}>
                                                                {sportInPlan === true && (
                                                                    <Icon name="check-circle" size={10} color="#059669" />
                                                                )}
                                                                {sportInPlan === false && memberSportNames.length > 0 && (
                                                                    <Icon name="lock" size={10} color="#d1d5db" />
                                                                )}
                                                                <Text className={`text-[10px] font-semibold ${sportInPlan === true
                                                                    ? 'text-emerald-700 ml-0.5'
                                                                    : sportInPlan === false
                                                                        ? 'text-gray-400 ml-0.5'
                                                                        : 'text-gray-500'
                                                                    }`}>
                                                                    {sportName}
                                                                </Text>
                                                            </View>
                                                        );
                                                    })}
                                                    {facility.sports.length > 5 && (
                                                        <View className="flex-row items-center bg-gray-100 rounded-lg px-2.5 py-1">
                                                            <Text className="text-gray-400 text-[10px] font-bold">+{facility.sports.length - 5}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            )}

                                            {/* View Details Button */}
                                            <TouchableOpacity
                                                onPress={() => handleViewDetails(facility)}
                                                className="flex-row items-center justify-center mt-3 py-3 rounded-xl"
                                                style={{ backgroundColor: `${accentColor}08`, borderWidth: 1.5, borderColor: `${accentColor}20` }}>
                                                <Icon name="information-outline" size={16} color={accentColor} />
                                                <Text className="font-bold text-xs ml-2" style={{ color: accentColor }}>View Details</Text>
                                                <Icon name="chevron-right" size={14} color={accentColor} style={{ marginLeft: 4 }} />
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
                    <View className="bg-white rounded-t-3xl" style={{ maxHeight: '92%' }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {selectedFacility && (
                                <View>
                                    {/* Modal Header */}
                                    <LinearGradient
                                        colors={getGradientForType(selectedFacility.type)}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        className="h-52 justify-center items-center rounded-t-3xl relative">
                                        <View className="w-20 h-20 bg-white/20 rounded-2xl justify-center items-center">
                                            <Icon
                                                name={FACILITY_TYPE_ICONS[selectedFacility.type] || 'office-building'}
                                                size={40}
                                                color="#fff"
                                            />
                                        </View>
                                        {/* Close Button */}
                                        <TouchableOpacity
                                            onPress={() => setShowDetailModal(false)}
                                            className="absolute top-4 right-4 w-9 h-9 bg-black/30 backdrop-blur-sm rounded-full justify-center items-center">
                                            <Icon name="close" size={18} color="#fff" />
                                        </TouchableOpacity>
                                        {/* Plan Badge */}
                                        {(currentPlan || memberSportNames.length > 0) && isFacilityInPlan(selectedFacility) && (
                                            <View className="absolute top-4 left-4">
                                                <View className="flex-row items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg" style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}>
                                                    <Icon name="check-decagram" size={14} color="#fff" />
                                                    <Text className="text-white text-xs font-bold ml-1">In Your Plan</Text>
                                                </View>
                                            </View>
                                        )}
                                    </LinearGradient>

                                    <View className="p-5">
                                        {/* Title */}
                                        <Text className="text-gray-900 font-bold text-2xl">{selectedFacility.name}</Text>
                                        <Text className="text-gray-500 text-sm mt-1">Complete facility information and guidelines</Text>

                                        {/* Plan Access Notice */}
                                        {(currentPlan || memberSportNames.length > 0) && (
                                            <View className={`mt-4 p-4 rounded-2xl ${isFacilityInPlan(selectedFacility)
                                                ? 'bg-emerald-50 border-2 border-emerald-200'
                                                : 'bg-amber-50 border-2 border-amber-200'
                                                }`}>
                                                <View className="flex-row items-start">
                                                    <View className={`w-10 h-10 rounded-xl justify-center items-center ${isFacilityInPlan(selectedFacility) ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                                                        <Icon
                                                            name={isFacilityInPlan(selectedFacility) ? 'shield-check' : 'shield-lock'}
                                                            size={22}
                                                            color={isFacilityInPlan(selectedFacility) ? '#059669' : '#d97706'}
                                                        />
                                                    </View>
                                                    <View className="ml-3 flex-1">
                                                        <Text className={`font-bold text-sm ${isFacilityInPlan(selectedFacility) ? 'text-emerald-900' : 'text-amber-900'}`}>
                                                            {isFacilityInPlan(selectedFacility)
                                                                ? `Included in your ${currentPlan?.name || membership?.type} plan`
                                                                : `Not included in your ${currentPlan?.name || membership?.type} plan`}
                                                        </Text>
                                                        <Text className={`text-xs mt-1 leading-4 ${isFacilityInPlan(selectedFacility) ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                            {isFacilityInPlan(selectedFacility)
                                                                ? 'You have full access to this facility with your current membership.'
                                                                : 'Upgrade your membership to get access to this facility and its amenities.'}
                                                        </Text>
                                                        {!isFacilityInPlan(selectedFacility) && (
                                                            <TouchableOpacity
                                                                onPress={() => { setShowDetailModal(false); navigation.navigate('Profile'); }}
                                                                className="mt-2.5 self-start">
                                                                <LinearGradient
                                                                    colors={['#d97706', '#f59e0b']}
                                                                    className="px-4 py-2.5 rounded-xl flex-row items-center shadow-sm"
                                                                    style={{ elevation: 2 }}>
                                                                    <Icon name="arrow-right" size={14} color="#fff" />
                                                                    <Text className="text-white font-bold text-xs ml-1.5">Upgrade Plan</Text>
                                                                </LinearGradient>
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>
                                                </View>
                                            </View>
                                        )}

                                        {/* Info Grid */}
                                        <View className="flex-row flex-wrap mt-5">
                                            {[
                                                { label: 'Type', value: selectedFacility.type, capitalize: true, icon: 'tag-outline' },
                                                { label: 'Status', value: selectedFacility.status, isStatus: true, icon: 'circle-slice-8' },
                                                { label: 'Location', value: selectedFacility.location, icon: 'map-marker-outline' },
                                                { label: 'Capacity', value: selectedFacility.capacity ? `${selectedFacility.capacity} people` : null, icon: 'account-group-outline' },
                                                {
                                                    label: 'Branch',
                                                    value: typeof selectedFacility.branch === 'object' ? selectedFacility.branch?.name
                                                        : typeof selectedFacility.branchId === 'object' ? selectedFacility.branchId?.name
                                                            : selectedFacility.branch || null,
                                                    icon: 'office-building-outline',
                                                },
                                                { label: 'Opening Hours', value: selectedFacility.openingHours, icon: 'clock-outline' },
                                                { label: 'Age Restriction', value: selectedFacility.ageRestriction, icon: 'account-child-outline' },
                                                { label: 'Max Occupancy', value: selectedFacility.maxOccupancy ? `${selectedFacility.maxOccupancy} people` : null, icon: 'human-queue' },
                                            ].filter(item => item.value).map((item, index) => {
                                                const accentColor = getAccentColor(selectedFacility.type);
                                                return (
                                                    <View key={index} className="w-1/2 mb-4 pr-2">
                                                        <View className="flex-row items-center mb-1">
                                                            <Icon name={item.icon} size={12} color="#9ca3af" />
                                                            <Text className="text-gray-400 text-[11px] font-bold uppercase tracking-wider ml-1">{item.label}</Text>
                                                        </View>
                                                        {item.isStatus ? (
                                                            <View className="px-3 py-1.5 rounded-lg flex-row items-center self-start" style={{ backgroundColor: getStatusConfig(selectedFacility.status).bg }}>
                                                                <View className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: getStatusConfig(selectedFacility.status).dot }} />
                                                                <Text className="text-xs font-bold capitalize" style={{ color: getStatusConfig(selectedFacility.status).text }}>
                                                                    {selectedFacility.status}
                                                                </Text>
                                                            </View>
                                                        ) : (
                                                            <Text className={`text-gray-900 font-semibold text-sm ${item.capitalize ? 'capitalize' : ''}`}>
                                                                {item.value}
                                                            </Text>
                                                        )}
                                                    </View>
                                                );
                                            })}
                                        </View>

                                        {/* Description */}
                                        {selectedFacility.description && (
                                            <View className="mt-2 mb-5">
                                                <View className="flex-row items-center mb-2">
                                                    <View className="w-6 h-6 rounded-md bg-gray-100 justify-center items-center mr-2">
                                                        <Icon name="text-box-outline" size={14} color="#6b7280" />
                                                    </View>
                                                    <Text className="text-gray-900 font-bold">Description</Text>
                                                </View>
                                                <Text className="text-gray-500 text-sm leading-5 ml-8">{selectedFacility.description}</Text>
                                            </View>
                                        )}

                                        {/* Amenities */}
                                        {selectedFacility.amenities && selectedFacility.amenities.length > 0 && (
                                            <View className="mb-5">
                                                <View className="flex-row items-center mb-3">
                                                    <View className="w-6 h-6 rounded-md bg-emerald-50 justify-center items-center mr-2">
                                                        <Icon name="check-circle" size={14} color="#059669" />
                                                    </View>
                                                    <Text className="text-gray-900 font-bold">Amenities</Text>
                                                </View>
                                                <View className="flex-row flex-wrap ml-8">
                                                    {selectedFacility.amenities.map((amenity, index) => (
                                                        <View key={index} className="flex-row items-center bg-emerald-50 rounded-xl px-3 py-2 mr-2 mb-2" style={{ borderWidth: 1, borderColor: '#a7f3d0' }}>
                                                            <Icon name="check-circle" size={12} color="#059669" />
                                                            <Text className="text-emerald-800 text-xs font-semibold ml-1.5">{amenity}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                        )}

                                        {/* Rules */}
                                        {(selectedFacility.rules?.length > 0 || selectedFacility.safetyRules?.length > 0) && (
                                            <View className="mb-5">
                                                <View className="flex-row items-center mb-3">
                                                    <View className="w-6 h-6 rounded-md bg-amber-50 justify-center items-center mr-2">
                                                        <Icon name="shield-check" size={14} color="#d97706" />
                                                    </View>
                                                    <Text className="text-gray-900 font-bold">Rules & Guidelines</Text>
                                                </View>
                                                <View className="bg-amber-50 rounded-2xl p-4 ml-8" style={{ borderWidth: 1, borderColor: '#fde68a' }}>
                                                    {(selectedFacility.rules || selectedFacility.safetyRules || []).map((rule, index) => (
                                                        <View key={index} className="flex-row items-start mb-2 last:mb-0">
                                                            <View className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 mr-2.5" />
                                                            <Text className="text-gray-700 text-sm flex-1 leading-5">{rule}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                        )}

                                        {/* Available Sports */}
                                        {selectedFacility.sports && selectedFacility.sports.length > 0 && (
                                            <View className="mb-5">
                                                <View className="flex-row items-center mb-3">
                                                    <View className="w-6 h-6 rounded-md bg-blue-50 justify-center items-center mr-2">
                                                        <Icon name="dumbbell" size={14} color="#2563eb" />
                                                    </View>
                                                    <Text className="text-gray-900 font-bold">Available Sports</Text>
                                                </View>
                                                <View className="flex-row flex-wrap ml-8">
                                                    {selectedFacility.sports.map((sport, i) => {
                                                        const sportName = getFacilitySportName(sport);
                                                        const sportInPlan = memberSportNames.length > 0 ? isSportInPlan(sportName) : null;
                                                        return (
                                                            <View
                                                                key={i}
                                                                className={`flex-row items-center rounded-xl px-3 py-2 mr-2 mb-2 ${sportInPlan === true
                                                                    ? 'bg-emerald-50 border-2 border-emerald-200'
                                                                    : sportInPlan === false
                                                                        ? 'bg-gray-50 border border-gray-200'
                                                                        : 'bg-blue-50 border border-blue-200'
                                                                    }`}>
                                                                {sportInPlan === true && <Icon name="check-circle" size={14} color="#059669" />}
                                                                {sportInPlan === false && <Icon name="lock" size={14} color="#d1d5db" />}
                                                                {sportInPlan === null && <Icon name="dumbbell" size={12} color="#2563eb" />}
                                                                <Text className={`text-xs font-bold ml-1.5 ${sportInPlan === true
                                                                    ? 'text-emerald-700'
                                                                    : sportInPlan === false
                                                                        ? 'text-gray-400'
                                                                        : 'text-blue-700'
                                                                    }`}>
                                                                    {sportName}
                                                                </Text>
                                                                {sportInPlan === true && (
                                                                    <Text className="text-emerald-500 text-[10px] font-semibold ml-1">✓ Plan</Text>
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

                        {/* Footer */}
                        <View className="px-5 pb-6 pt-3 border-t border-gray-100 bg-white">
                            <View className="flex-row" style={{ gap: 12 }}>
                                <TouchableOpacity
                                    onPress={() => setShowDetailModal(false)}
                                    className="flex-1"
                                    style={{
                                        borderRadius: 14,
                                        borderWidth: 1.5,
                                        borderColor: '#e5e7eb',
                                        paddingVertical: 15,
                                        alignItems: 'center',
                                    }}>
                                    <Text className="text-gray-700 font-bold">Close</Text>
                                </TouchableOpacity>
                                {(currentPlan || memberSportNames.length > 0) && isFacilityInPlan(selectedFacility) && (
                                    <TouchableOpacity
                                        onPress={() => { setShowDetailModal(false); navigation.navigate('Sports'); }}
                                        className="flex-1">
                                        <LinearGradient
                                            colors={['#059669', '#10b981']}
                                            style={{ borderRadius: 14, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon name="calendar-plus" size={16} color="#fff" />
                                            <Text className="text-white font-bold text-sm ml-2">Book Session</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default SportsScreen;