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

// ─── Mock Data ───
const MOCK_EVENTS = [
    {
        _id: 'e1',
        title: 'Inter-Club Karate Championship 2026',
        description: 'Annual karate championship featuring participants from top clubs across the city. Categories: Kata, Kumite, and Team events.',
        type: 'tournament',
        category: 'Martial Arts',
        startDate: '2026-04-15',
        endDate: '2026-04-16',
        startTime: '09:00',
        endTime: '17:00',
        location: { isOnline: false, venue: 'Main Arena, Downtown Branch', city: 'Mumbai' },
        pricing: { isFree: false, memberPrice: 500, earlyBirdPrice: 350, earlyBirdDeadline: '2026-03-30' },
        registration: { currentParticipants: 42, maxParticipants: 60, registrationDeadline: '2026-04-10' },
        tags: ['Karate', 'Championship', 'Kata', 'Kumite'],
        isRegistered: false,
    },
    {
        _id: 'e2',
        title: 'Yoga & Mindfulness Workshop',
        description: 'A relaxing 2-hour workshop focusing on advanced yoga techniques, breathing exercises, and mindfulness meditation for all levels.',
        type: 'workshop',
        category: 'Wellness',
        startDate: '2026-04-05',
        startTime: '07:00',
        endTime: '09:00',
        location: { isOnline: false, venue: 'Yoga Studio, Building A', city: 'Mumbai' },
        pricing: { isFree: true, memberPrice: 0, earlyBirdPrice: 0, earlyBirdDeadline: null },
        registration: { currentParticipants: 18, maxParticipants: 30, registrationDeadline: '2026-04-04' },
        tags: ['Yoga', 'Meditation', 'Wellness'],
        isRegistered: false,
    },
    {
        _id: 'e3',
        title: 'CrossFit Open Challenge',
        description: 'Test your limits with our monthly CrossFit challenge. Five workouts over two days, scaled and Rx divisions available.',
        type: 'fitness_challenge',
        category: 'Fitness',
        startDate: '2026-04-20',
        endDate: '2026-04-21',
        startTime: '06:00',
        endTime: '12:00',
        location: { isOnline: false, venue: 'CrossFit Zone, Ground Floor', city: 'Mumbai' },
        pricing: { isFree: false, memberPrice: 300, earlyBirdPrice: 0, earlyBirdDeadline: null },
        registration: { currentParticipants: 25, maxParticipants: 40, registrationDeadline: '2026-04-18' },
        tags: ['CrossFit', 'Challenge', 'Strength'],
        isRegistered: true,
    },
    {
        _id: 'e4',
        title: 'Sports Nutrition Seminar',
        description: 'Learn about macro tracking, pre/post workout nutrition, supplementation, and diet planning for athletes by certified nutritionist.',
        type: 'seminar',
        category: 'Education',
        startDate: '2026-04-10',
        startTime: '18:00',
        endTime: '20:00',
        location: { isOnline: true, venue: null, city: null },
        pricing: { isFree: true, memberPrice: 0, earlyBirdPrice: 0, earlyBirdDeadline: null },
        registration: { currentParticipants: 55, maxParticipants: 0, registrationDeadline: null },
        tags: ['Nutrition', 'Seminar', 'Online'],
        isRegistered: false,
    },
    {
        _id: 'e5',
        title: 'Club Open Day - Try All Sports Free',
        description: 'Experience all our sports facilities for free! Perfect for new members to explore and existing members to try something new.',
        type: 'open_day',
        category: 'Community',
        startDate: '2026-04-01',
        startTime: '08:00',
        endTime: '20:00',
        location: { isOnline: false, venue: 'All Facilities', city: 'Mumbai' },
        pricing: { isFree: true, memberPrice: 0, earlyBirdPrice: 0, earlyBirdDeadline: null },
        registration: { currentParticipants: 120, maxParticipants: 200, registrationDeadline: null },
        tags: ['Free', 'Open Day', 'All Sports'],
        isRegistered: false,
    },
    {
        _id: 'e6',
        title: 'Members Social Evening & Awards',
        description: 'Annual social gathering with awards for top performers, food, music, and networking with fellow members.',
        type: 'social',
        category: 'Community',
        startDate: '2026-04-25',
        startTime: '19:00',
        endTime: '23:00',
        location: { isOnline: false, venue: 'Rooftop Terrace, Building C', city: 'Mumbai' },
        pricing: { isFree: false, memberPrice: 200, earlyBirdPrice: 150, earlyBirdDeadline: '2026-04-18' },
        registration: { currentParticipants: 68, maxParticipants: 100, registrationDeadline: '2026-04-22' },
        tags: ['Social', 'Awards', 'Networking'],
        isRegistered: false,
    },
];

const EVENT_TYPES = [
    { key: 'all', label: 'All' },
    { key: 'competition', label: 'Competition' },
    { key: 'tournament', label: 'Tournament' },
    { key: 'workshop', label: 'Workshop' },
    { key: 'seminar', label: 'Seminar' },
    { key: 'fitness_challenge', label: 'Challenge' },
    { key: 'open_day', label: 'Open Day' },
    { key: 'social', label: 'Social' },
];

// ─── Helpers ───
const formatDate = dateStr => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getTypeIcon = type => {
    const map = { tournament: 'trophy', competition: 'trophy', workshop: 'book-open-variant', seminar: 'school', fitness_challenge: 'dumbbell', open_day: 'door-open', social: 'account-group' };
    return map[type] || 'calendar-star';
};

const getTypeConfig = type => {
    const map = {
        tournament: { bg: '#fef3c7', text: '#d97706', border: '#fbbf24', gradient: ['#d97706', '#f59e0b'] },
        competition: { bg: '#fee2e2', text: '#dc2626', border: '#f87171', gradient: ['#dc2626', '#ef4444'] },
        workshop: { bg: '#dbeafe', text: '#2563eb', border: '#60a5fa', gradient: ['#2563eb', '#3b82f6'] },
        seminar: { bg: '#ede9fe', text: '#7c3aed', border: '#a78bfa', gradient: ['#7c3aed', '#8b5cf6'] },
        fitness_challenge: { bg: '#fce7f3', text: '#db2777', border: '#f472b6', gradient: ['#db2777', '#ec4899'] },
        open_day: { bg: '#d1fae5', text: '#059669', border: '#34d399', gradient: ['#059669', '#10b981'] },
        social: { bg: '#e0e7ff', text: '#4338ca', border: '#818cf8', gradient: ['#4338ca', '#6366f1'] },
    };
    return map[type] || { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db', gradient: ['#6b7280', '#9ca3af'] };
};

const getDaysUntil = dateStr => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
};

// ═══════════════════════════════════════════════
// ─── EXTRACTED SUB-COMPONENTS ───
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

const ConsentCheckbox = ({ checked, onToggle, title, description }) => (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.7} className="flex-row items-start mb-4">
        <View className={`w-6 h-6 rounded-lg border-2 justify-center items-center mt-0.5 ${checked ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-300'}`}>
            {checked && <Icon name="check" size={16} color="#fff" />}
        </View>
        <View className="ml-3 flex-1">
            <Text className="text-gray-900 font-semibold text-sm">{title}</Text>
            <Text className="text-gray-400 text-xs mt-0.5 leading-4">{description}</Text>
        </View>
    </TouchableOpacity>
);

const PaymentOption = ({ value, currentMethod, onSelect, icon, iconColor, iconBg, title, subtitle }) => (
    <TouchableOpacity onPress={() => onSelect(value)} activeOpacity={0.7} className={`flex-row items-center p-4 rounded-2xl border-2 mb-2.5 ${currentMethod === value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-white'}`} style={{ elevation: currentMethod === value ? 2 : 0 }}>
        <View className={`w-6 h-6 rounded-full border-2 justify-center items-center ${currentMethod === value ? 'border-emerald-500' : 'border-gray-300'}`}>
            {currentMethod === value && <View className="w-3.5 h-3.5 rounded-full bg-emerald-500" />}
        </View>
        <View className="w-11 h-11 rounded-xl justify-center items-center ml-3" style={{ backgroundColor: iconBg }}>
            <Icon name={icon} size={20} color={iconColor} />
        </View>
        <View className="ml-3 flex-1">
            <Text className="text-gray-900 font-semibold text-sm">{title}</Text>
            <Text className="text-gray-400 text-xs mt-0.5">{subtitle}</Text>
        </View>
    </TouchableOpacity>
);

// ═══════════════════════════════════════════════
// ─── REGISTERED EVENT CARD (Horizontal Scroll) ───
// ═══════════════════════════════════════════════
const RegisteredEventCard = ({ event, onPress }) => {
    const tc = getTypeConfig(event.type);
    const daysLeft = getDaysUntil(event.startDate);
    return (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress} className="bg-white rounded-2xl mr-3 shadow-sm overflow-hidden" style={{ elevation: 3, width: 220 }}>
            <LinearGradient colors={tc.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="h-20 justify-center items-center relative">
                <Icon name={getTypeIcon(event.type)} size={36} color="rgba(255,255,255,0.3)" />
                <View className="absolute top-2.5 left-3">
                    <View className="bg-white/20 px-2.5 py-1 rounded-full flex-row items-center">
                        <Icon name="check-circle" size={10} color="#fff" />
                        <Text className="text-white text-[10px] font-bold ml-1">Registered</Text>
                    </View>
                </View>
                <View className="absolute bottom-2.5 right-3">
                    <View className="bg-white/20 px-2.5 py-1 rounded-full">
                        <Text className="text-white text-[10px] font-bold">{daysLeft > 0 ? `${daysLeft}d left` : daysLeft === 0 ? 'Today' : 'Past'}</Text>
                    </View>
                </View>
            </LinearGradient>
            <View className="p-3.5">
                <Text className="text-gray-900 font-bold text-sm" numberOfLines={1}>{event.title}</Text>
                <View className="flex-row items-center mt-1.5">
                    <Icon name="calendar" size={12} color="#9ca3af" />
                    <Text className="text-gray-400 text-xs ml-1">{formatDate(event.startDate)}</Text>
                </View>
                <View className="flex-row items-center mt-1">
                    <Icon name="clock-outline" size={12} color="#9ca3af" />
                    <Text className="text-gray-400 text-xs ml-1">{event.startTime || 'TBA'}</Text>
                </View>
                <View className="flex-row items-center mt-2.5">
                    <View className="flex-row items-center rounded-full px-2.5 py-1 mr-1.5" style={{ backgroundColor: tc.bg, borderWidth: 1, borderColor: tc.border }}>
                        <Text className="text-[10px] font-bold capitalize" style={{ color: tc.text }}>{event.type.replace('_', ' ')}</Text>
                    </View>
                    {event.location?.isOnline && (
                        <View className="bg-blue-50 rounded-full px-2.5 py-1 border border-blue-200">
                            <Text className="text-blue-700 text-[10px] font-bold">Online</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

// ═══════════════════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════
const EventsScreen = ({ navigation }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [registering, setRegistering] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [consentEvent, setConsentEvent] = useState(null);
    const [consentChecks, setConsentChecks] = useState({ termsAccepted: false, rulesAccepted: false, liabilityAccepted: false, dataConsent: false });
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [processingPayment, setProcessingPayment] = useState(false);

    // ─── Fetch ───
    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 600));
            let filtered = [...MOCK_EVENTS];
            if (filterType !== 'all') filtered = filtered.filter(e => e.type === filterType);
            setEvents(filtered);
        } catch (error) {
            Alert.alert('Error', 'Failed to load events');
        } finally {
            setLoading(false);
        }
    }, [filterType]);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);
    const onRefresh = async () => { setRefreshing(true); await fetchEvents(); setRefreshing(false); };

    // ─── Derived Data ───
    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            const s = searchTerm.toLowerCase();
            return e.title?.toLowerCase().includes(s) || e.category?.toLowerCase().includes(s) || e.description?.toLowerCase().includes(s) || e.tags?.some(t => t.toLowerCase().includes(s));
        });
    }, [events, searchTerm]);

    const registeredEvents = useMemo(() => filteredEvents.filter(e => e.isRegistered), [filteredEvents]);
    const upcomingEvents = useMemo(() => filteredEvents.filter(e => !e.isRegistered), [filteredEvents]);

    // Stats
    const eventStats = useMemo(() => ({
        total: filteredEvents.length,
        registered: registeredEvents.length,
        free: filteredEvents.filter(e => e.pricing?.isFree).length,
        upcoming: filteredEvents.filter(e => getDaysUntil(e.startDate) > 0).length,
    }), [filteredEvents, registeredEvents]);

    // ─── Helpers ───
    const isFull = event => { const c = event.registration?.currentParticipants || 0; const m = event.registration?.maxParticipants || 0; return m > 0 && c >= m; };
    const getEventPrice = event => {
        if (!event?.pricing) return 0;
        if (event.pricing.earlyBirdPrice > 0 && event.pricing.earlyBirdDeadline && new Date() <= new Date(event.pricing.earlyBirdDeadline)) return event.pricing.earlyBirdPrice;
        return event.pricing.memberPrice || 0;
    };
    const isEarlyBird = event => event?.pricing?.earlyBirdPrice > 0 && event.pricing?.earlyBirdDeadline && new Date() <= new Date(event.pricing.earlyBirdDeadline);
    const allConsentsGiven = consentChecks.termsAccepted && consentChecks.rulesAccepted && consentChecks.liabilityAccepted && consentChecks.dataConsent;

    // ─── Registration Flow ───
    const handleInitiateRegistration = event => {
        setConsentEvent(event);
        setConsentChecks({ termsAccepted: false, rulesAccepted: false, liabilityAccepted: false, dataConsent: false });
        setShowConsentModal(true);
    };

    const handleConsentProceed = () => {
        setShowConsentModal(false);
        if (!consentEvent) return;
        const isPaid = consentEvent.pricing && !consentEvent.pricing.isFree && consentEvent.pricing.memberPrice > 0;
        if (isPaid) { setPaymentMethod('card'); setShowPaymentModal(true); } else { handleRegister(consentEvent._id); }
    };

    const handlePayAndRegister = async () => {
        if (!consentEvent) return;
        try {
            setProcessingPayment(true);
            await new Promise(resolve => setTimeout(resolve, 1500));
            setEvents(prev => prev.map(e => e._id === consentEvent._id ? { ...e, isRegistered: true } : e));
            Alert.alert('Payment Successful', `Payment of ₹${getEventPrice(consentEvent)} completed. You are now registered for "${consentEvent.title}"!`);
            setShowPaymentModal(false); setConsentEvent(null);
        } catch (error) { Alert.alert('Payment Failed', 'Failed to process payment.'); } finally { setProcessingPayment(false); }
    };

    const handleRegister = async eventId => {
        try {
            setRegistering(eventId);
            await new Promise(resolve => setTimeout(resolve, 800));
            setEvents(prev => prev.map(e => e._id === eventId ? { ...e, isRegistered: true } : e));
            Alert.alert('Success', 'Successfully registered for the event!');
            setConsentEvent(null);
        } catch (error) { Alert.alert('Error', 'Failed to register'); } finally { setRegistering(null); }
    };

    const handleUnregister = eventId => {
        Alert.alert('Unregister', 'Are you sure you want to unregister?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Unregister', style: 'destructive', onPress: async () => {
                    try { setRegistering(eventId); await new Promise(r => setTimeout(r, 800)); setEvents(prev => prev.map(e => e._id === eventId ? { ...e, isRegistered: false } : e)); Alert.alert('Success', 'Successfully unregistered'); }
                    catch (e) { Alert.alert('Error', 'Failed to unregister'); } finally { setRegistering(null); }
                }
            },
        ]);
    };

    const handleViewDetails = event => { setSelectedEvent(event); setShowDetailModal(true); };

    // ─── Stats Config ───
    const statsConfig = [
        { label: 'Total', value: eventStats.total, icon: 'calendar-star', color: '#059669', gradient: ['#059669', '#34d399'] },
        { label: 'Registered', value: eventStats.registered, icon: 'calendar-check', color: '#3b82f6', gradient: ['#2563eb', '#3b82f6'] },
        { label: 'Free', value: eventStats.free, icon: 'tag-check', color: '#f59e0b', gradient: ['#d97706', '#f59e0b'] },
        { label: 'Upcoming', value: eventStats.upcoming, icon: 'clock-fast', color: '#8b5cf6', gradient: ['#7c3aed', '#8b5cf6'] },
    ];

    // ─── Event Card ───
    const EventCard = ({ event }) => {
        const tc = getTypeConfig(event.type);
        const registered = event.isRegistered;
        const full = isFull(event);
        const daysLeft = getDaysUntil(event.startDate);
        const fillPercent = event.registration?.maxParticipants > 0 ? (event.registration.currentParticipants / event.registration.maxParticipants) * 100 : null;

        return (
            <TouchableOpacity onPress={() => handleViewDetails(event)} activeOpacity={0.85} className="bg-white rounded-2xl mb-4 overflow-hidden" style={{ elevation: 3 }}>
                {/* Top Color Strip + Registered Badge */}
                <View className="h-1.5" style={{ backgroundColor: tc.gradient[0] }} />

                <View className="p-4">
                    {/* Row 1: Title + Badges */}
                    <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1 mr-3">
                            <Text className="text-gray-900 font-bold text-base leading-5" numberOfLines={2}>{event.title}</Text>
                        </View>
                        <View className="flex-col items-end gap-1.5">
                            {registered && (
                                <LinearGradient colors={['#059669', '#10b981']} className="px-2.5 py-1 rounded-full flex-row items-center" style={{ borderRadius: 20 }}>
                                    <Icon name="check-circle" size={11} color="#fff" />
                                    <Text className="text-white text-[10px] font-bold ml-1">Registered</Text>
                                </LinearGradient>
                            )}
                            {!registered && daysLeft <= 3 && daysLeft >= 0 && (
                                <View className="bg-red-50 px-2.5 py-1 rounded-full border border-red-200" style={{ borderRadius: 20 }}>
                                    <Text className="text-red-600 text-[10px] font-bold">{daysLeft === 0 ? 'Today!' : `${daysLeft}d left`}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Row 2: Type + Category + Price Tags */}
                    <View className="flex-row flex-wrap mb-3">
                        <LinearGradient colors={tc.gradient} className="flex-row items-center rounded-full px-2.5 py-1 mr-2 mb-1.5" style={{ borderRadius: 20 }}>
                            <Icon name={getTypeIcon(event.type)} size={11} color="#fff" />
                            <Text className="text-white text-[10px] font-bold ml-1 capitalize">{event.type.replace('_', ' ')}</Text>
                        </LinearGradient>
                        <View className="bg-gray-100 rounded-full px-2.5 py-1 mr-2 mb-1.5 border border-gray-200">
                            <Text className="text-gray-600 text-[10px] font-bold capitalize">{event.category}</Text>
                        </View>
                        {event.pricing?.isFree ? (
                            <View className="flex-row items-center bg-emerald-50 rounded-full px-2.5 py-1 mr-2 mb-1.5 border border-emerald-200">
                                <Icon name="tag" size={11} color="#059669" />
                                <Text className="text-emerald-700 text-[10px] font-bold ml-1">Free</Text>
                            </View>
                        ) : event.pricing?.memberPrice > 0 ? (
                            <View className="flex-row items-center bg-orange-50 rounded-full px-2.5 py-1 mr-2 mb-1.5 border border-orange-200">
                                <Text className="text-orange-700 text-[10px] font-bold">₹{event.pricing.memberPrice}</Text>
                            </View>
                        ) : null}
                        {isEarlyBird(event) && (
                            <View className="flex-row items-center bg-yellow-50 rounded-full px-2.5 py-1 mr-2 mb-1.5 border border-yellow-300">
                                <Text className="text-yellow-700 text-[10px] font-bold">🐦 Early Bird ₹{event.pricing.earlyBirdPrice}</Text>
                            </View>
                        )}
                        {event.location?.isOnline && (
                            <View className="flex-row items-center bg-blue-50 rounded-full px-2.5 py-1 mr-2 mb-1.5 border border-blue-200">
                                <Icon name="web" size={11} color="#2563eb" />
                                <Text className="text-blue-700 text-[10px] font-bold ml-1">Online</Text>
                            </View>
                        )}
                    </View>

                    {/* Row 3: Description */}
                    <Text className="text-gray-500 text-sm mb-3 leading-5" numberOfLines={2}>{event.description}</Text>

                    {/* Row 4: Info Items */}
                    <View className="bg-gray-50 rounded-xl p-3 mb-3" style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                        <View className="flex-row items-center mb-2">
                            <View className="w-7 h-7 rounded-lg justify-center items-center mr-2.5" style={{ backgroundColor: '#dbeafe' }}>
                                <Icon name="calendar" size={14} color="#2563eb" />
                            </View>
                            <Text className="text-gray-700 text-xs font-medium flex-1">
                                {formatDate(event.startDate)}{event.endDate && event.endDate !== event.startDate ? ` - ${formatDate(event.endDate)}` : ''}
                            </Text>
                        </View>
                        {event.startTime && (
                            <View className="flex-row items-center mb-2">
                                <View className="w-7 h-7 rounded-lg justify-center items-center mr-2.5" style={{ backgroundColor: '#ede9fe' }}>
                                    <Icon name="clock-outline" size={14} color="#7c3aed" />
                                </View>
                                <Text className="text-gray-700 text-xs font-medium flex-1">{event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}</Text>
                            </View>
                        )}
                        {event.location?.isOnline ? (
                            <View className="flex-row items-center mb-2">
                                <View className="w-7 h-7 rounded-lg justify-center items-center mr-2.5" style={{ backgroundColor: '#e0e7ff' }}>
                                    <Icon name="web" size={14} color="#4338ca" />
                                </View>
                                <Text className="text-gray-700 text-xs font-medium flex-1">Online Event</Text>
                            </View>
                        ) : event.location?.venue ? (
                            <View className="flex-row items-center mb-2">
                                <View className="w-7 h-7 rounded-lg justify-center items-center mr-2.5" style={{ backgroundColor: '#fce7f3' }}>
                                    <Icon name="map-marker" size={14} color="#db2777" />
                                </View>
                                <Text className="text-gray-700 text-xs font-medium flex-1">{event.location.venue}{event.location.city ? `, ${event.location.city}` : ''}</Text>
                            </View>
                        ) : null}
                        {event.registration?.maxParticipants > 0 && (
                            <View className="flex-row items-center">
                                <View className="w-7 h-7 rounded-lg justify-center items-center mr-2.5" style={{ backgroundColor: '#fef3c7' }}>
                                    <Icon name="account-group" size={14} color="#d97706" />
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center justify-between mb-1">
                                        <Text className="text-gray-700 text-xs font-medium">{event.registration.currentParticipants}/{event.registration.maxParticipants} registered</Text>
                                        {full && <View className="bg-red-100 px-2 py-0.5 rounded-full"><Text className="text-red-600 text-[10px] font-bold">FULL</Text></View>}
                                    </View>
                                    <View className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <View className="h-full rounded-full" style={{ width: `${Math.min(fillPercent, 100)}%`, backgroundColor: fillPercent > 85 ? '#ef4444' : fillPercent > 60 ? '#f59e0b' : '#22c55e' }} />
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Row 5: Tags */}
                    {event.tags?.length > 0 && (
                        <View className="flex-row flex-wrap mb-4">
                            {event.tags.map((tag, i) => (
                                <View key={i} className="bg-gray-100 rounded-full px-2.5 py-0.5 mr-1.5 mb-1">
                                    <Text className="text-gray-500 text-[10px] font-medium">#{tag}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Row 6: Action Buttons */}
                    <View className="flex-row gap-3">
                        {registered ? (
                            <TouchableOpacity onPress={() => handleUnregister(event._id)} disabled={registering === event._id} activeOpacity={0.8} className="flex-1" style={{ opacity: registering === event._id ? 0.5 : 1, borderRadius: 14, borderWidth: 1.5, borderColor: '#fecaca', paddingVertical: 13, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff5f5' }}>
                                {registering === event._id ? <ActivityIndicator size="small" color="#ef4444" /> : <><Icon name="close-circle-outline" size={16} color="#ef4444" /><Text className="text-red-500 font-bold text-sm ml-1.5">Unregister</Text></>}
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => handleInitiateRegistration(event)} disabled={full || registering === event._id} activeOpacity={0.8} className="flex-1">
                                <LinearGradient colors={full || registering === event._id ? ['#d1d5db', '#d1d5db'] : ['#059669', '#10b981']} style={{ borderRadius: 14, paddingVertical: 13, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    {registering === event._id ? <ActivityIndicator size="small" color="#fff" /> : <><Icon name={full ? 'account-off' : 'check-circle'} size={16} color="#fff" /><Text className="text-white font-bold text-sm ml-1.5">{full ? 'Event Full' : 'Register Now'}</Text></>}
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => handleViewDetails(event)} activeOpacity={0.8} style={{ borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', paddingVertical: 13, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                            <Icon name="information-outline" size={16} color="#6b7280" />
                            <Text className="text-gray-700 font-bold text-sm ml-1.5">Details</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // ═══════════════════════════════════════════════
    // ─── LOADING STATE ───
    // ═══════════════════════════════════════════════
    if (loading && !refreshing) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <View className="w-16 h-16 rounded-2xl bg-emerald-50 justify-center items-center mb-4">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
                <Text className="text-gray-900 font-bold text-base">Loading Events</Text>
                <Text className="text-gray-400 mt-1 text-sm">Fetching upcoming events...</Text>
            </View>
        );
    }

    // ═══════════════════════════════════════════════
    // ─── MAIN RENDER ───
    // ═══════════════════════════════════════════════
    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} tintColor="#059669" />}>

                {/* ═══════════════════════════════════════ */}
                {/* ─── HEADER ─── */}
                {/* ═══════════════════════════════════════ */}
                <LinearGradient colors={['#064e3b', '#059669', '#10b981']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: 48, paddingBottom: 36, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
                    {/* Top Bar */}
                    <View className="flex-row justify-between items-center px-5 mb-5">
                        <DrawerMenuButton />
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => navigation.navigate('Announcements')} className="w-10 h-10 bg-white/15 rounded-full justify-center items-center mr-2">
                                <Icon name="bell-outline" size={22} color="#fff" />
                                <View className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full justify-center items-center">
                                    <Text className="text-white text-[8px] font-bold">3</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate('Settings')} className="w-10 h-10 bg-white/15 rounded-full justify-center items-center">
                                <Icon name="filter-variant" size={22} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Title */}
                    <View className="px-5 mb-4">
                        <Text className="text-white/60 text-sm font-medium">Discover & Participate</Text>
                        <Text className="text-white font-bold text-2xl mt-0.5">Events & Tournaments</Text>
                        <Text className="text-white/50 text-xs mt-1">Browse upcoming events, tournaments & workshops</Text>
                    </View>

                    {/* Stats Bar */}
                    <View className="mx-5 bg-white/10 rounded-2xl p-3.5" style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                        <View className="flex-row items-center justify-between">
                            {statsConfig.map((stat, idx) => (
                                <View key={stat.label} className={`flex-1 items-center ${idx < statsConfig.length - 1 ? 'border-r border-white/10' : ''}`}>
                                    <Text className="text-white font-bold text-lg">{stat.value}</Text>
                                    <Text className="text-white/50 text-[10px] font-medium mt-0.5">{stat.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </LinearGradient>

                {/* ═══════════════════════════════════════ */}
                {/* ─── SEARCH BAR ─── */}
                {/* ═══════════════════════════════════════ */}
                <View className="mx-4 -mt-5">
                    <View className="bg-white rounded-2xl px-4 flex-row items-center shadow-md" style={{ elevation: 5, borderWidth: 1, borderColor: '#f3f4f6' }}>
                        <Icon name="magnify" size={20} color="#9ca3af" />
                        <TextInput className="flex-1 py-3.5 px-3 text-gray-900 text-sm" placeholder="Search events, tags, categories..." placeholderTextColor="#9ca3af" value={searchTerm} onChangeText={setSearchTerm} />
                        {searchTerm.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchTerm('')} className="w-7 h-7 bg-gray-100 rounded-full justify-center items-center">
                                <Icon name="close" size={14} color="#6b7280" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* ═══════════════════════════════════════ */}
                {/* ─── FILTER PILLS ─── */}
                {/* ═══════════════════════════════════════ */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4" contentContainerStyle={{ paddingHorizontal: 16 }}>
                    {EVENT_TYPES.map(type => (
                        <TouchableOpacity key={type.key} onPress={() => setFilterType(type.key)} activeOpacity={0.7} className="mr-2">
                            {filterType === type.key ? (
                                <LinearGradient colors={['#059669', '#10b981']} className="px-4 py-2 rounded-full shadow-sm" start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ elevation: 2 }}>
                                    <Text className="text-white text-xs font-bold">{type.label}</Text>
                                </LinearGradient>
                            ) : (
                                <View className="bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm" style={{ elevation: 1 }}>
                                    <Text className="text-gray-600 text-xs font-semibold">{type.label}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* ═══════════════════════════════════════ */}
                {/* ─── MY REGISTERED EVENTS (Horizontal) ─── */}
                {/* ═══════════════════════════════════════ */}
                {registeredEvents.length > 0 && (
                    <View className="mt-5">
                        <View className="px-4">
                            <SectionTitle title="My Registered Events" icon="calendar-check" iconColor="#3b82f6" />
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4" contentContainerStyle={{ paddingRight: 16 }}>
                            {registeredEvents.map(event => (
                                <RegisteredEventCard key={event._id} event={event} onPress={() => handleViewDetails(event)} />
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* ═══════════════════════════════════════ */}
                {/* ─── UPCOMING EVENTS LIST ─── */}
                {/* ═══════════════════════════════════════ */}
                <View className="px-4 mt-5">
                    <SectionTitle
                        title="Upcoming Events"
                        icon="calendar-star"
                        iconColor="#059669"
                        onViewAll={() => { setFilterType('all'); setSearchTerm(''); }}
                    />
                    <Text className="text-gray-400 text-xs mb-4 -mt-2">{filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found</Text>

                    {filteredEvents.length === 0 ? (
                        <View className="bg-white rounded-2xl p-10 items-center shadow-sm" style={{ elevation: 2 }}>
                            <View className="w-20 h-20 rounded-full bg-gray-100 justify-center items-center mb-4">
                                <Icon name="calendar-blank" size={40} color="#d1d5db" />
                            </View>
                            <Text className="text-gray-700 font-bold text-lg">No events found</Text>
                            <Text className="text-gray-400 text-sm text-center mt-1.5 max-w-[250px]">{searchTerm ? 'Try adjusting your search or filters' : 'Check back later for new events and tournaments'}</Text>
                            {searchTerm && (
                                <TouchableOpacity onPress={() => { setSearchTerm(''); setFilterType('all'); }} className="mt-4 bg-emerald-50 px-5 py-2.5 rounded-xl border border-emerald-200">
                                    <Text className="text-emerald-600 font-bold text-sm">Clear Filters</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        filteredEvents.map(event => <EventCard key={event._id} event={event} />)
                    )}
                </View>

                <View className="h-8" />
            </ScrollView>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── DETAIL MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal visible={showDetailModal} transparent animationType="slide" onRequestClose={() => setShowDetailModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl" style={{ maxHeight: '90%' }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {selectedEvent && (() => {
                                const tc = getTypeConfig(selectedEvent.type);
                                const daysLeft = getDaysUntil(selectedEvent.startDate);
                                return (
                                    <View>
                                        {/* Gradient Header */}
                                        <LinearGradient colors={tc.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="h-44 justify-center items-center rounded-t-3xl relative">
                                            <Icon name={getTypeIcon(selectedEvent.type)} size={64} color="rgba(255,255,255,0.25)" />
                                            <TouchableOpacity onPress={() => setShowDetailModal(false)} className="absolute top-4 right-4 w-9 h-9 bg-black/30 rounded-full justify-center items-center">
                                                <Icon name="close" size={20} color="#fff" />
                                            </TouchableOpacity>
                                            {selectedEvent.isRegistered && (
                                                <View className="absolute top-4 left-4 bg-white/20 px-3 py-1.5 rounded-full flex-row items-center" style={{ borderRadius: 20 }}>
                                                    <Icon name="check-circle" size={14} color="#fff" />
                                                    <Text className="text-white text-xs font-bold ml-1">Registered</Text>
                                                </View>
                                            )}
                                            <View className="absolute bottom-3 right-4 bg-white/20 px-3 py-1.5 rounded-full">
                                                <Text className="text-white text-xs font-bold">{daysLeft > 0 ? `${daysLeft} days away` : daysLeft === 0 ? 'Happening Today' : 'Past Event'}</Text>
                                            </View>
                                        </LinearGradient>

                                        <View className="p-5">
                                            <Text className="text-gray-900 font-bold text-xl mb-3">{selectedEvent.title}</Text>

                                            {/* Tags */}
                                            <View className="flex-row flex-wrap mb-4">
                                                <LinearGradient colors={tc.gradient} className="flex-row items-center rounded-full px-3 py-1.5 mr-2 mb-1.5" style={{ borderRadius: 20 }}>
                                                    <Icon name={getTypeIcon(selectedEvent.type)} size={12} color="#fff" />
                                                    <Text className="text-white text-xs font-bold ml-1 capitalize">{selectedEvent.type.replace('_', ' ')}</Text>
                                                </LinearGradient>
                                                <View className="bg-gray-100 rounded-full px-3 py-1.5 mr-2 mb-1.5 border border-gray-200">
                                                    <Text className="text-gray-600 text-xs font-bold capitalize">{selectedEvent.category}</Text>
                                                </View>
                                                {selectedEvent.location?.isOnline && (
                                                    <View className="bg-blue-50 rounded-full px-3 py-1.5 mr-2 mb-1.5 border border-blue-200">
                                                        <Text className="text-blue-700 text-xs font-bold">Online</Text>
                                                    </View>
                                                )}
                                            </View>

                                            {/* Description */}
                                            <Text className="text-gray-500 text-sm leading-6 mb-5">{selectedEvent.description}</Text>

                                            {/* Info Grid */}
                                            <View className="bg-gray-50 rounded-2xl p-4 mb-4" style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                                                {[
                                                    { l: 'Date', v: `${formatDate(selectedEvent.startDate)}${selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.startDate ? ` - ${formatDate(selectedEvent.endDate)}` : ''}`, i: 'calendar', c: '#2563eb' },
                                                    { l: 'Time', v: selectedEvent.startTime ? `${selectedEvent.startTime}${selectedEvent.endTime ? ` - ${selectedEvent.endTime}` : ''}` : 'TBA', i: 'clock-outline', c: '#7c3aed' },
                                                    { l: 'Location', v: selectedEvent.location?.isOnline ? 'Online Event' : `${selectedEvent.location?.venue || 'TBA'}${selectedEvent.location?.city ? `, ${selectedEvent.location.city}` : ''}`, i: 'map-marker', c: '#db2777' },
                                                    { l: 'Participants', v: `${selectedEvent.registration?.currentParticipants || 0}${selectedEvent.registration?.maxParticipants > 0 ? `/${selectedEvent.registration.maxParticipants}` : ''} registered`, i: 'account-group', c: '#d97706' },
                                                    { l: 'Pricing', v: selectedEvent.pricing?.isFree ? 'Free' : `₹${selectedEvent.pricing?.memberPrice || 0} (Member)`, i: 'tag', c: '#059669' },
                                                    { l: 'Deadline', v: selectedEvent.registration?.registrationDeadline ? formatDate(selectedEvent.registration.registrationDeadline) : 'No deadline', i: 'alert-circle-outline', c: '#ef4444' },
                                                ].filter(x => x.v).map((item, i) => (
                                                    <View key={i} className={`flex-row items-center py-3 ${i < 5 ? 'border-b border-gray-100' : ''}`}>
                                                        <View className="w-9 h-9 rounded-xl justify-center items-center mr-3" style={{ backgroundColor: `${item.c}12` }}>
                                                            <Icon name={item.i} size={16} color={item.c} />
                                                        </View>
                                                        <View className="flex-1">
                                                            <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">{item.l}</Text>
                                                            <Text className={`text-sm mt-0.5 font-semibold ${item.l === 'Pricing' && selectedEvent.pricing?.isFree ? 'text-emerald-600' : 'text-gray-900'}`}>{item.v}</Text>
                                                        </View>
                                                    </View>
                                                ))}
                                            </View>

                                            {/* Early Bird Banner */}
                                            {selectedEvent.pricing && !selectedEvent.pricing.isFree && selectedEvent.pricing.earlyBirdPrice > 0 && (
                                                <LinearGradient colors={['#fef3c7', '#fde68a']} className="p-4 rounded-2xl mb-4" style={{ borderWidth: 1, borderColor: '#fbbf24' }}>
                                                    <View className="flex-row items-center justify-between">
                                                        <View className="flex-1">
                                                            <Text className="text-yellow-800 font-bold text-sm">🐦 Early Bird Offer</Text>
                                                            <Text className="text-yellow-700 text-xs mt-1">Save ₹{selectedEvent.pricing.memberPrice - selectedEvent.pricing.earlyBirdPrice} — ₹{selectedEvent.pricing.earlyBirdPrice} only</Text>
                                                            {selectedEvent.pricing.earlyBirdDeadline && (
                                                                <Text className="text-yellow-600 text-[10px] mt-0.5">Until {formatDate(selectedEvent.pricing.earlyBirdDeadline)}</Text>
                                                            )}
                                                        </View>
                                                        <View className="bg-yellow-500 px-3 py-2 rounded-xl ml-3">
                                                            <Text className="text-white font-bold text-lg">₹{selectedEvent.pricing.earlyBirdPrice}</Text>
                                                        </View>
                                                    </View>
                                                </LinearGradient>
                                            )}

                                            {/* Tags */}
                                            {selectedEvent.tags?.length > 0 && (
                                                <View className="flex-row flex-wrap">
                                                    {selectedEvent.tags.map((tag, i) => (
                                                        <View key={i} className="bg-gray-100 rounded-full px-3 py-1.5 mr-2 mb-2">
                                                            <Text className="text-gray-500 text-xs font-medium">#{tag}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                );
                            })()}
                        </ScrollView>

                        {/* Footer Buttons */}
                        <View className="px-5 pb-6 pt-3 border-t border-gray-100">
                            <View className="flex-row gap-3">
                                <TouchableOpacity onPress={() => setShowDetailModal(false)} style={{ flex: 1, borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', paddingVertical: 15, alignItems: 'center' }}>
                                    <Text className="text-gray-700 font-bold">Close</Text>
                                </TouchableOpacity>
                                {selectedEvent && (selectedEvent.isRegistered ? (
                                    <TouchableOpacity onPress={() => { setShowDetailModal(false); handleUnregister(selectedEvent._id); }} style={{ flex: 1, borderRadius: 14, borderWidth: 1.5, borderColor: '#fecaca', paddingVertical: 15, alignItems: 'center', backgroundColor: '#fff5f5' }}>
                                        <Text className="text-red-500 font-bold">Unregister</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity onPress={() => { setShowDetailModal(false); handleInitiateRegistration(selectedEvent); }} disabled={isFull(selectedEvent)} activeOpacity={0.8} style={{ flex: 1 }}>
                                        <LinearGradient colors={isFull(selectedEvent) ? ['#d1d5db', '#d1d5db'] : ['#059669', '#10b981']} style={{ borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}>
                                            <Text className="text-white font-bold">{isFull(selectedEvent) ? 'Event Full' : 'Register Now'}</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── CONSENT MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal visible={showConsentModal} transparent animationType="slide" onRequestClose={() => { setShowConsentModal(false); setConsentEvent(null); }}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '85%' }}>
                        {/* Header */}
                        <View className="flex-row justify-between items-center mb-1">
                            <View className="flex-row items-center flex-1">
                                <View className="w-10 h-10 bg-emerald-100 rounded-xl justify-center items-center">
                                    <Icon name="shield-check" size={22} color="#059669" />
                                </View>
                                <View className="ml-3 flex-1">
                                    <Text className="text-gray-900 font-bold text-lg">Registration Consent</Text>
                                    <Text className="text-gray-400 text-xs">Review and accept to proceed</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => { setShowConsentModal(false); setConsentEvent(null); }} className="w-9 h-9 bg-gray-100 rounded-full justify-center items-center">
                                <Icon name="close" size={18} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {consentEvent && (
                                <View className="mt-4">
                                    {/* Event Summary */}
                                    <View className="p-4 bg-gray-50 rounded-2xl mb-4" style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                                        <Text className="text-gray-900 font-bold text-sm">{consentEvent.title}</Text>
                                        <View className="flex-row items-center mt-1.5">
                                            <Icon name="calendar" size={12} color="#9ca3af" />
                                            <Text className="text-gray-400 text-xs ml-1.5">{formatDate(consentEvent.startDate)}{consentEvent.startTime ? ` at ${consentEvent.startTime}` : ''}</Text>
                                        </View>
                                        <View className="flex-row items-center mt-2.5">
                                            {consentEvent.pricing?.isFree ? (
                                                <LinearGradient colors={['#059669', '#10b981']} className="px-3 py-1 rounded-full" style={{ borderRadius: 20 }}>
                                                    <Text className="text-white text-xs font-bold">Free Event</Text>
                                                </LinearGradient>
                                            ) : (
                                                <View className="flex-row items-center">
                                                    <View className="bg-orange-100 rounded-full px-3 py-1 border border-orange-200">
                                                        <Text className="text-orange-700 text-xs font-bold">Paid — ₹{getEventPrice(consentEvent)}</Text>
                                                    </View>
                                                    {isEarlyBird(consentEvent) && (
                                                        <View className="bg-yellow-100 rounded-full px-2.5 py-1 border border-yellow-300 ml-2">
                                                            <Text className="text-yellow-700 text-xs font-bold">🐦 Early Bird</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* Checkboxes */}
                                    <ConsentCheckbox checked={consentChecks.termsAccepted} onToggle={() => setConsentChecks(p => ({ ...p, termsAccepted: !p.termsAccepted }))} title="Terms & Conditions *" description="I have read and agree to the event terms and conditions, including cancellation and refund policies." />
                                    <ConsentCheckbox checked={consentChecks.rulesAccepted} onToggle={() => setConsentChecks(p => ({ ...p, rulesAccepted: !p.rulesAccepted }))} title="Club Rules & Code of Conduct *" description="I agree to follow the club rules, code of conduct, and event-specific guidelines during the event." />
                                    <ConsentCheckbox checked={consentChecks.liabilityAccepted} onToggle={() => setConsentChecks(p => ({ ...p, liabilityAccepted: !p.liabilityAccepted }))} title="Liability Waiver & Health Declaration *" description="I acknowledge that participation involves physical activity and I take responsibility for my own health and safety." />
                                    <ConsentCheckbox checked={consentChecks.dataConsent} onToggle={() => setConsentChecks(p => ({ ...p, dataConsent: !p.dataConsent }))} title="Data & Photography Consent *" description="I consent to the collection of my personal data for event management and permit photography for promotional purposes." />

                                    {!allConsentsGiven && (
                                        <View className="flex-row items-center p-3.5 bg-yellow-50 rounded-2xl border border-yellow-200 mb-2">
                                            <Icon name="alert-circle" size={18} color="#d97706" />
                                            <Text className="text-yellow-700 text-xs ml-2.5 flex-1 font-medium">Please accept all consents to proceed with registration.</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </ScrollView>

                        {/* Footer */}
                        <View className="flex-row mt-4" style={{ gap: 12 }}>
                            <TouchableOpacity onPress={() => { setShowConsentModal(false); setConsentEvent(null); }} style={{ flex: 1, borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', paddingVertical: 15, alignItems: 'center' }}>
                                <Text className="text-gray-700 font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleConsentProceed} disabled={!allConsentsGiven} activeOpacity={0.8} style={{ flex: 1 }}>
                                <LinearGradient colors={allConsentsGiven ? ['#059669', '#10b981'] : ['#d1d5db', '#d1d5db']} style={{ borderRadius: 14, paddingVertical: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                                    <Icon name={allConsentsGiven ? 'arrow-right' : 'lock'} size={16} color="#fff" />
                                    <Text className="text-white font-bold text-sm ml-2">{consentEvent?.pricing && !consentEvent.pricing.isFree && consentEvent.pricing.memberPrice > 0 ? 'Proceed to Payment' : 'Confirm & Register'}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── PAYMENT MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal visible={showPaymentModal} transparent animationType="slide" onRequestClose={() => { if (!processingPayment) { setShowPaymentModal(false); setConsentEvent(null); } }}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '85%' }}>
                        {/* Header */}
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-blue-100 rounded-xl justify-center items-center">
                                    <Icon name="credit-card" size={22} color="#2563eb" />
                                </View>
                                <View className="ml-3">
                                    <Text className="text-gray-900 font-bold text-lg">Complete Payment</Text>
                                    <Text className="text-gray-400 text-xs">Secure payment processing</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => { if (!processingPayment) { setShowPaymentModal(false); setConsentEvent(null); } }} className="w-9 h-9 bg-gray-100 rounded-full justify-center items-center">
                                <Icon name="close" size={18} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {consentEvent && (
                                <View>
                                    {/* Payment Summary */}
                                    <View className="p-4 bg-gray-50 rounded-2xl mb-5" style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                                        <Text className="text-gray-900 font-bold text-sm mb-3">Payment Summary</Text>
                                        <View className="flex-row justify-between mb-2.5">
                                            <Text className="text-gray-500 text-sm">Event</Text>
                                            <Text className="text-gray-900 font-semibold text-sm flex-1 text-right ml-4" numberOfLines={1}>{consentEvent.title}</Text>
                                        </View>
                                        <View className="flex-row justify-between mb-2.5">
                                            <Text className="text-gray-500 text-sm">Date</Text>
                                            <Text className="text-gray-900 text-sm font-medium">{formatDate(consentEvent.startDate)}</Text>
                                        </View>
                                        {isEarlyBird(consentEvent) && (
                                            <>
                                                <View className="flex-row justify-between mb-1.5">
                                                    <Text className="text-gray-400 text-sm line-through">Regular Price</Text>
                                                    <Text className="text-gray-400 text-sm line-through">₹{consentEvent.pricing.memberPrice}</Text>
                                                </View>
                                                <View className="flex-row justify-between mb-2.5">
                                                    <Text className="text-yellow-600 text-sm font-medium">🐦 Early Bird Discount</Text>
                                                    <Text className="text-yellow-600 text-sm font-bold">-₹{consentEvent.pricing.memberPrice - consentEvent.pricing.earlyBirdPrice}</Text>
                                                </View>
                                            </>
                                        )}
                                        <View className="h-px bg-gray-200 my-3" />
                                        <View className="flex-row justify-between items-center">
                                            <Text className="text-gray-900 font-bold text-base">Total Amount</Text>
                                            <LinearGradient colors={['#059669', '#10b981']} className="px-4 py-1.5 rounded-xl">
                                                <Text className="text-white font-bold text-base">₹{getEventPrice(consentEvent)}</Text>
                                            </LinearGradient>
                                        </View>
                                    </View>

                                    {/* Payment Methods */}
                                    <Text className="text-gray-900 font-bold text-sm mb-3">Select Payment Method</Text>
                                    <PaymentOption value="card" currentMethod={paymentMethod} onSelect={setPaymentMethod} icon="credit-card" iconColor="#2563eb" iconBg="#dbeafe" title="Credit / Debit Card" subtitle="Visa, Mastercard, RuPay" />
                                    <PaymentOption value="upi" currentMethod={paymentMethod} onSelect={setPaymentMethod} icon="cellphone" iconColor="#059669" iconBg="#d1fae5" title="UPI" subtitle="Google Pay, PhonePe, Paytm" />
                                    <PaymentOption value="net_banking" currentMethod={paymentMethod} onSelect={setPaymentMethod} icon="bank" iconColor="#7c3aed" iconBg="#ede9fe" title="Net Banking" subtitle="All major banks supported" />
                                    <PaymentOption value="cash" currentMethod={paymentMethod} onSelect={setPaymentMethod} icon="cash" iconColor="#d97706" iconBg="#fef3c7" title="Pay at Counter" subtitle="Pay in person at reception" />

                                    {/* Security Badge */}
                                    <View className="flex-row items-center p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 mt-2">
                                        <View className="w-8 h-8 bg-emerald-100 rounded-lg justify-center items-center mr-2.5">
                                            <Icon name="shield-lock" size={16} color="#059669" />
                                        </View>
                                        <Text className="text-emerald-700 text-xs flex-1 font-medium leading-4">Your payment is secured with 256-bit SSL encryption. We do not store your card details.</Text>
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        {/* Footer */}
                        <View className="flex-row mt-4" style={{ gap: 12 }}>
                            <TouchableOpacity onPress={() => { if (!processingPayment) { setShowPaymentModal(false); setConsentEvent(null); } }} disabled={processingPayment} style={{ flex: 1, borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', paddingVertical: 15, alignItems: 'center', opacity: processingPayment ? 0.5 : 1 }}>
                                <Text className="text-gray-700 font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handlePayAndRegister} disabled={processingPayment} activeOpacity={0.8} style={{ flex: 1 }}>
                                <LinearGradient colors={processingPayment ? ['#9ca3af', '#9ca3af'] : ['#059669', '#10b981']} style={{ borderRadius: 14, paddingVertical: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    {processingPayment ? (
                                        <><ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} /><Text className="text-white font-bold text-sm">Processing...</Text></>
                                    ) : (
                                        <><Icon name="lock" size={14} color="#fff" /><Text className="text-white font-bold text-sm ml-2">Pay ₹{consentEvent ? getEventPrice(consentEvent) : 0} & Register</Text></>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default EventsScreen;