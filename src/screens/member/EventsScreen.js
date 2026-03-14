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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DrawerMenuButton from '../../components/DrawerMenuButton';
import { MOCK_EVENTS, EVENT_TYPES } from '../../data/events';

// ─── Helpers ───
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const getTypeIcon = (type) => {
    switch (type) {
        case 'tournament':
        case 'competition':
            return 'trophy';
        case 'workshop':
            return 'book-open-variant';
        case 'seminar':
            return 'school';
        case 'fitness_challenge':
            return 'dumbbell';
        case 'open_day':
            return 'door-open';
        case 'social':
            return 'account-group';
        default:
            return 'calendar-star';
    }
};

const getTypeColor = (type) => {
    switch (type) {
        case 'tournament':
            return { bg: '#fef3c7', text: '#d97706', border: '#fbbf24' };
        case 'competition':
            return { bg: '#fee2e2', text: '#dc2626', border: '#f87171' };
        case 'workshop':
            return { bg: '#dbeafe', text: '#2563eb', border: '#60a5fa' };
        case 'seminar':
            return { bg: '#ede9fe', text: '#7c3aed', border: '#a78bfa' };
        case 'fitness_challenge':
            return { bg: '#fce7f3', text: '#db2777', border: '#f472b6' };
        case 'open_day':
            return { bg: '#d1fae5', text: '#059669', border: '#34d399' };
        case 'social':
            return { bg: '#e0e7ff', text: '#4338ca', border: '#818cf8' };
        default:
            return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' };
    }
};

// ─── Component ───
const EventsScreen = ({ navigation }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [registering, setRegistering] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    // Detail Modal
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Consent Modal
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [consentEvent, setConsentEvent] = useState(null);
    const [consentChecks, setConsentChecks] = useState({
        termsAccepted: false,
        rulesAccepted: false,
        liabilityAccepted: false,
        dataConsent: false,
    });

    // Payment Modal
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [processingPayment, setProcessingPayment] = useState(false);

    // ─── Data Fetching (Mock) ───
    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 600));
            let filtered = [...MOCK_EVENTS];
            if (filterType !== 'all') {
                filtered = filtered.filter(e => e.type === filterType);
            }
            setEvents(filtered);
        } catch (error) {
            Alert.alert('Error', 'Failed to load events');
        } finally {
            setLoading(false);
        }
    }, [filterType]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchEvents();
        setRefreshing(false);
    };

    // ─── Filtered Events ───
    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            const matchesSearch =
                e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.description?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [events, searchTerm]);

    const registeredEvents = useMemo(() => {
        return filteredEvents.filter(e => e.isRegistered);
    }, [filteredEvents]);

    const upcomingEvents = useMemo(() => {
        return filteredEvents.filter(e => !e.isRegistered);
    }, [filteredEvents]);

    // ─── Event Helpers ───
    const isRegistered = (event) => event.isRegistered || false;

    const getParticipantCount = (event) =>
        event.registration?.currentParticipants || 0;

    const getMaxParticipants = (event) =>
        event.registration?.maxParticipants || 0;

    const isFull = (event) => {
        const current = getParticipantCount(event);
        const max = getMaxParticipants(event);
        return max > 0 && current >= max;
    };

    const getEventPrice = (event) => {
        if (!event?.pricing) return 0;
        if (
            event.pricing.earlyBirdPrice > 0 &&
            event.pricing.earlyBirdDeadline &&
            new Date() <= new Date(event.pricing.earlyBirdDeadline)
        ) {
            return event.pricing.earlyBirdPrice;
        }
        return event.pricing.memberPrice || 0;
    };

    const isEarlyBird = (event) => {
        if (!event?.pricing) return false;
        return (
            event.pricing.earlyBirdPrice > 0 &&
            event.pricing.earlyBirdDeadline &&
            new Date() <= new Date(event.pricing.earlyBirdDeadline)
        );
    };

    const allConsentsGiven =
        consentChecks.termsAccepted &&
        consentChecks.rulesAccepted &&
        consentChecks.liabilityAccepted &&
        consentChecks.dataConsent;

    // ─── Registration Flow ───
    const handleInitiateRegistration = (event) => {
        setConsentEvent(event);
        setConsentChecks({
            termsAccepted: false,
            rulesAccepted: false,
            liabilityAccepted: false,
            dataConsent: false,
        });
        setShowConsentModal(true);
    };

    const handleConsentProceed = () => {
        setShowConsentModal(false);
        const event = consentEvent;
        if (!event) return;

        const isPaidEvent =
            event.pricing && !event.pricing.isFree && event.pricing.memberPrice > 0;

        if (isPaidEvent) {
            setPaymentMethod('card');
            setShowPaymentModal(true);
        } else {
            handleRegister(event._id);
        }
    };

    const handlePayAndRegister = async () => {
        if (!consentEvent) return;
        try {
            setProcessingPayment(true);
            await new Promise(resolve => setTimeout(resolve, 1500));
            // Update local state
            setEvents(prev =>
                prev.map(e =>
                    e._id === consentEvent._id ? { ...e, isRegistered: true } : e,
                ),
            );
            Alert.alert(
                'Payment Successful',
                `Payment of ₹${getEventPrice(consentEvent)} completed. You are now registered for "${consentEvent.title}"!`,
            );
            setShowPaymentModal(false);
            setConsentEvent(null);
        } catch (error) {
            Alert.alert('Payment Failed', 'Failed to process payment. Please try again.');
        } finally {
            setProcessingPayment(false);
        }
    };

    const handleRegister = async (eventId) => {
        try {
            setRegistering(eventId);
            await new Promise(resolve => setTimeout(resolve, 800));
            setEvents(prev =>
                prev.map(e =>
                    e._id === eventId ? { ...e, isRegistered: true } : e,
                ),
            );
            Alert.alert('Success', 'Successfully registered for the event!');
            setConsentEvent(null);
        } catch (error) {
            Alert.alert('Error', 'Failed to register for event');
        } finally {
            setRegistering(null);
        }
    };

    const handleUnregister = async (eventId) => {
        Alert.alert(
            'Unregister',
            'Are you sure you want to unregister from this event?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Unregister',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setRegistering(eventId);
                            await new Promise(resolve => setTimeout(resolve, 800));
                            setEvents(prev =>
                                prev.map(e =>
                                    e._id === eventId ? { ...e, isRegistered: false } : e,
                                ),
                            );
                            Alert.alert('Success', 'Successfully unregistered from the event');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to unregister from event');
                        } finally {
                            setRegistering(null);
                        }
                    },
                },
            ],
        );
    };

    const handleViewDetails = (event) => {
        setSelectedEvent(event);
        setShowDetailModal(true);
    };

    // ─── Consent Checkbox Component ───
    const ConsentCheckbox = ({ checked, onToggle, title, description }) => (
        <TouchableOpacity
            onPress={onToggle}
            activeOpacity={0.7}
            className="flex-row items-start mb-4">
            <View
                className={`w-6 h-6 rounded-md border-2 justify-center items-center mt-0.5 ${checked
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'bg-white border-gray-300'
                    }`}>
                {checked && <Icon name="check" size={16} color="#fff" />}
            </View>
            <View className="ml-3 flex-1">
                <Text className="text-gray-900 font-medium text-sm">{title}</Text>
                <Text className="text-gray-400 text-xs mt-0.5 leading-4">
                    {description}
                </Text>
            </View>
        </TouchableOpacity>
    );

    // ─── Payment Method Option Component ───
    const PaymentOption = ({ value, icon, iconColor, iconBg, title, subtitle }) => (
        <TouchableOpacity
            onPress={() => setPaymentMethod(value)}
            activeOpacity={0.7}
            className={`flex-row items-center p-4 rounded-xl border-2 mb-2 ${paymentMethod === value
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 bg-white'
                }`}>
            <View
                className={`w-6 h-6 rounded-full border-2 justify-center items-center ${paymentMethod === value
                    ? 'border-emerald-500'
                    : 'border-gray-300'
                    }`}>
                {paymentMethod === value && (
                    <View className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                )}
            </View>
            <View
                className="w-10 h-10 rounded-lg justify-center items-center ml-3"
                style={{ backgroundColor: iconBg }}>
                <Icon name={icon} size={20} color={iconColor} />
            </View>
            <View className="ml-3 flex-1">
                <Text className="text-gray-900 font-medium text-sm">{title}</Text>
                <Text className="text-gray-400 text-xs">{subtitle}</Text>
            </View>
        </TouchableOpacity>
    );

    // ─── Event Card Component ───
    const EventCard = ({ event }) => {
        const typeColor = getTypeColor(event.type);
        const registered = isRegistered(event);
        const full = isFull(event);
        const earlyBird = isEarlyBird(event);

        return (
            <TouchableOpacity
                onPress={() => handleViewDetails(event)}
                activeOpacity={0.8}
                className={`bg-white rounded-2xl mb-4 overflow-hidden ${registered ? 'border-2 border-emerald-400' : ''
                    }`}
                style={{ elevation: 3 }}>
                {/* Top Color Bar */}
                <View
                    className="h-2"
                    style={{ backgroundColor: typeColor.border }}
                />

                <View className="p-4">
                    {/* Header Row */}
                    <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-1 mr-3">
                            <Text className="text-gray-900 font-bold text-base" numberOfLines={2}>
                                {event.title}
                            </Text>
                        </View>
                        {registered && (
                            <View className="bg-emerald-100 px-2.5 py-1 rounded-full flex-row items-center">
                                <Icon name="check-circle" size={12} color="#059669" />
                                <Text className="text-emerald-700 text-[10px] font-bold ml-1">
                                    Registered
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Badges Row */}
                    <View className="flex-row flex-wrap mb-3">
                        <View
                            className="flex-row items-center rounded-full px-2.5 py-1 mr-2 mb-1"
                            style={{
                                backgroundColor: typeColor.bg,
                                borderWidth: 1,
                                borderColor: typeColor.border,
                            }}>
                            <Icon name={getTypeIcon(event.type)} size={12} color={typeColor.text} />
                            <Text
                                className="text-xs font-medium ml-1 capitalize"
                                style={{ color: typeColor.text }}>
                                {(event.type || '').replace('_', ' ')}
                            </Text>
                        </View>
                        <View className="flex-row items-center bg-gray-100 rounded-full px-2.5 py-1 mr-2 mb-1 border border-gray-200">
                            <Text className="text-gray-600 text-xs font-medium capitalize">
                                {event.category}
                            </Text>
                        </View>
                        {event.pricing?.isFree ? (
                            <View className="flex-row items-center bg-emerald-50 rounded-full px-2.5 py-1 mr-2 mb-1 border border-emerald-200">
                                <Icon name="tag" size={12} color="#059669" />
                                <Text className="text-emerald-700 text-xs font-medium ml-1">
                                    Free
                                </Text>
                            </View>
                        ) : event.pricing?.memberPrice > 0 ? (
                            <View className="flex-row items-center bg-orange-50 rounded-full px-2.5 py-1 mr-2 mb-1 border border-orange-200">
                                <Text className="text-orange-700 text-xs font-medium">
                                    ₹{event.pricing.memberPrice}
                                </Text>
                            </View>
                        ) : null}
                        {earlyBird && (
                            <View className="flex-row items-center bg-yellow-50 rounded-full px-2.5 py-1 mr-2 mb-1 border border-yellow-300">
                                <Text className="text-yellow-700 text-xs font-medium">
                                    🐦 Early Bird
                                </Text>
                            </View>
                        )}
                        {event.location?.isOnline && (
                            <View className="flex-row items-center bg-blue-50 rounded-full px-2.5 py-1 mr-2 mb-1 border border-blue-200">
                                <Icon name="web" size={12} color="#2563eb" />
                                <Text className="text-blue-700 text-xs font-medium ml-1">
                                    Online
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Description */}
                    <Text className="text-gray-500 text-sm mb-3" numberOfLines={2}>
                        {event.description}
                    </Text>

                    {/* Info Row */}
                    <View className="mb-3">
                        <View className="flex-row items-center mb-1.5">
                            <Icon name="calendar" size={14} color="#9ca3af" />
                            <Text className="text-gray-500 text-xs ml-2">
                                {formatDate(event.startDate)}
                                {event.endDate && event.endDate !== event.startDate
                                    ? ` - ${formatDate(event.endDate)}`
                                    : ''}
                            </Text>
                        </View>
                        {event.startTime && (
                            <View className="flex-row items-center mb-1.5">
                                <Icon name="clock-outline" size={14} color="#9ca3af" />
                                <Text className="text-gray-500 text-xs ml-2">
                                    {event.startTime}
                                    {event.endTime ? ` - ${event.endTime}` : ''}
                                </Text>
                            </View>
                        )}
                        {event.location?.isOnline ? (
                            <View className="flex-row items-center mb-1.5">
                                <Icon name="web" size={14} color="#9ca3af" />
                                <Text className="text-gray-500 text-xs ml-2">Online Event</Text>
                            </View>
                        ) : event.location?.venue ? (
                            <View className="flex-row items-center mb-1.5">
                                <Icon name="map-marker" size={14} color="#9ca3af" />
                                <Text className="text-gray-500 text-xs ml-2">
                                    {event.location.venue}
                                    {event.location.city ? `, ${event.location.city}` : ''}
                                </Text>
                            </View>
                        ) : null}
                        {getMaxParticipants(event) > 0 && (
                            <View className="flex-row items-center">
                                <Icon name="account-group" size={14} color="#9ca3af" />
                                <Text className="text-gray-500 text-xs ml-2">
                                    {getParticipantCount(event)}/{getMaxParticipants(event)} registered
                                </Text>
                                {full && (
                                    <View className="bg-red-100 px-2 py-0.5 rounded-full ml-2">
                                        <Text className="text-red-600 text-[10px] font-bold">FULL</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Tags */}
                    {event.tags && event.tags.length > 0 && (
                        <View className="flex-row flex-wrap mb-3">
                            {event.tags.map((tag, index) => (
                                <View
                                    key={index}
                                    className="bg-gray-100 rounded-full px-2.5 py-0.5 mr-1.5 mb-1">
                                    <Text className="text-gray-500 text-[10px]">{tag}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View className="flex-row gap-2">
                        {registered ? (
                            <TouchableOpacity
                                onPress={() => handleUnregister(event._id)}
                                disabled={registering === event._id}
                                activeOpacity={0.8}
                                className="flex-1 border border-red-300 rounded-xl py-3 items-center flex-row justify-center"
                                style={{ opacity: registering === event._id ? 0.5 : 1 }}>
                                {registering === event._id ? (
                                    <ActivityIndicator size="small" color="#ef4444" />
                                ) : (
                                    <>
                                        <Icon name="close-circle-outline" size={16} color="#ef4444" />
                                        <Text className="text-red-500 font-semibold text-sm ml-1.5">
                                            Unregister
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={() => handleInitiateRegistration(event)}
                                disabled={full || registering === event._id}
                                activeOpacity={0.8}
                                className="flex-1">
                                <LinearGradient
                                    colors={
                                        full || registering === event._id
                                            ? ['#d1d5db', '#d1d5db']
                                            : ['#059669', '#10b981']
                                    }
                                    className="rounded-xl py-3 items-center flex-row justify-center">
                                    {registering === event._id ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <Icon
                                                name={full ? 'account-off' : 'check-circle'}
                                                size={16}
                                                color="#fff"
                                            />
                                            <Text className="text-white font-bold text-sm ml-1.5">
                                                {full ? 'Event Full' : 'Register Now'}
                                            </Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={() => handleViewDetails(event)}
                            activeOpacity={0.8}
                            className="border border-gray-200 rounded-xl py-3 px-4 items-center flex-row justify-center">
                            <Icon name="information-outline" size={16} color="#6b7280" />
                            <Text className="text-gray-700 font-semibold text-sm ml-1.5">
                                Details
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // ─── Loading State ───
    if (loading && events.length === 0) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#059669" />
                <Text className="text-gray-500 mt-3">Loading events...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* ─── Header ─── */}
            <LinearGradient
                colors={['#059669', '#10b981']}
                className="px-6 pt-12 pb-6">
                <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                        <DrawerMenuButton />
                        <View className="ml-2">
                            <Text className="text-white font-bold text-2xl">
                                Events & Tournaments
                            </Text>
                            <Text className="text-white/80 text-sm">
                                Participate in sports events, tournaments & workshops
                            </Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#059669']}
                    />
                }>
                {/* ─── Search Bar ─── */}
                <View className="mx-4 mt-4">
                    <View
                        className="flex-row items-center bg-white rounded-xl px-4 border border-gray-200"
                        style={{ elevation: 1 }}>
                        <Icon name="magnify" size={20} color="#9ca3af" />
                        <TextInput
                            className="flex-1 py-3 px-3 text-gray-900 text-sm"
                            placeholder="Search events..."
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
                    {EVENT_TYPES.map(type => (
                        <TouchableOpacity
                            key={type.key}
                            onPress={() => setFilterType(type.key)}
                            activeOpacity={0.8}
                            className={`mr-2 px-4 py-2 rounded-full ${filterType === type.key
                                ? 'bg-emerald-500'
                                : 'bg-white border border-gray-200'
                                }`}
                            style={filterType !== type.key ? { elevation: 1 } : {}}>
                            <Text
                                className={`text-xs font-semibold ${filterType === type.key
                                    ? 'text-white'
                                    : 'text-gray-600'
                                    }`}>
                                {type.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* ─── My Registered Events Section ─── */}
                {registeredEvents.length > 0 && (
                    <View className="mx-4 mt-4">
                        <View
                            className="bg-white rounded-2xl overflow-hidden"
                            style={{ elevation: 3 }}>
                            <View className="p-4 border-b border-gray-100">
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 bg-emerald-100 rounded-lg justify-center items-center">
                                        <Icon name="calendar-check" size={18} color="#059669" />
                                    </View>
                                    <Text className="text-gray-900 font-bold text-base ml-2">
                                        My Registered Events
                                    </Text>
                                    <View className="bg-emerald-500 rounded-full px-2 py-0.5 ml-2">
                                        <Text className="text-white text-[10px] font-bold">
                                            {registeredEvents.length}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            {registeredEvents.map((event, index) => (
                                <TouchableOpacity
                                    key={event._id}
                                    onPress={() => handleViewDetails(event)}
                                    activeOpacity={0.7}
                                    className={`flex-row items-center p-4 ${index < registeredEvents.length - 1
                                        ? 'border-b border-gray-100'
                                        : ''
                                        }`}>
                                    <View className="w-12 h-12 bg-emerald-100 rounded-xl justify-center items-center">
                                        <Icon
                                            name={getTypeIcon(event.type)}
                                            size={22}
                                            color="#059669"
                                        />
                                    </View>
                                    <View className="flex-1 ml-3">
                                        <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>
                                            {event.title}
                                        </Text>
                                        <View className="flex-row items-center mt-1">
                                            <Icon name="calendar" size={12} color="#9ca3af" />
                                            <Text className="text-gray-400 text-xs ml-1">
                                                {formatDate(event.startDate)}
                                                {event.startTime ? ` at ${event.startTime}` : ''}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="bg-emerald-100 px-2.5 py-1 rounded-full">
                                        <Text className="text-emerald-700 text-[10px] font-bold">
                                            Registered
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* ─── Upcoming Events ─── */}
                <View className="px-4 mt-4">
                    <View className="flex-row items-center mb-3">
                        <View className="w-8 h-8 bg-blue-100 rounded-lg justify-center items-center">
                            <Icon name="calendar-star" size={18} color="#2563eb" />
                        </View>
                        <Text className="text-gray-900 font-bold text-base ml-2">
                            Upcoming Events
                        </Text>
                        <Text className="text-gray-400 text-xs ml-2">
                            ({filteredEvents.length} events)
                        </Text>
                    </View>

                    {filteredEvents.length === 0 ? (
                        <View
                            className="bg-white rounded-2xl p-8 items-center"
                            style={{ elevation: 2 }}>
                            <Icon name="calendar-blank" size={48} color="#d1d5db" />
                            <Text className="text-gray-900 font-semibold text-base mt-3">
                                No events found
                            </Text>
                            <Text className="text-gray-400 text-sm text-center mt-1">
                                {searchTerm
                                    ? 'Try adjusting your search'
                                    : 'Check back later for new events'}
                            </Text>
                        </View>
                    ) : (
                        filteredEvents.map(event => (
                            <EventCard key={event._id} event={event} />
                        ))
                    )}
                </View>

                {/* Bottom Spacing */}
                <View className="h-8" />
            </ScrollView>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── EVENT DETAIL MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showDetailModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDetailModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl" style={{ maxHeight: '90%' }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {selectedEvent && (
                                <View>
                                    {/* Header Gradient */}
                                    <LinearGradient
                                        colors={['#059669', '#10b981']}
                                        className="h-40 justify-center items-center rounded-t-3xl relative">
                                        <Icon
                                            name={getTypeIcon(selectedEvent.type)}
                                            size={56}
                                            color="rgba(255,255,255,0.4)"
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowDetailModal(false)}
                                            className="absolute top-4 right-4 w-8 h-8 bg-black/30 rounded-full justify-center items-center">
                                            <Icon name="close" size={20} color="#fff" />
                                        </TouchableOpacity>
                                        {isRegistered(selectedEvent) && (
                                            <View className="absolute top-4 left-4 bg-white/20 rounded-full px-3 py-1 flex-row items-center">
                                                <Icon name="check-circle" size={14} color="#fff" />
                                                <Text className="text-white text-xs font-bold ml-1">
                                                    Registered
                                                </Text>
                                            </View>
                                        )}
                                    </LinearGradient>

                                    <View className="p-5">
                                        {/* Title */}
                                        <Text className="text-gray-900 font-bold text-xl mb-2">
                                            {selectedEvent.title}
                                        </Text>

                                        {/* Badges */}
                                        <View className="flex-row flex-wrap mb-3">
                                            {(() => {
                                                const tc = getTypeColor(selectedEvent.type);
                                                return (
                                                    <View
                                                        className="flex-row items-center rounded-full px-2.5 py-1 mr-2 mb-1"
                                                        style={{
                                                            backgroundColor: tc.bg,
                                                            borderWidth: 1,
                                                            borderColor: tc.border,
                                                        }}>
                                                        <Icon
                                                            name={getTypeIcon(selectedEvent.type)}
                                                            size={12}
                                                            color={tc.text}
                                                        />
                                                        <Text
                                                            className="text-xs font-medium ml-1 capitalize"
                                                            style={{ color: tc.text }}>
                                                            {(selectedEvent.type || '').replace('_', ' ')}
                                                        </Text>
                                                    </View>
                                                );
                                            })()}
                                            <View className="bg-gray-100 rounded-full px-2.5 py-1 mr-2 mb-1 border border-gray-200">
                                                <Text className="text-gray-600 text-xs font-medium capitalize">
                                                    {selectedEvent.category}
                                                </Text>
                                            </View>
                                            {selectedEvent.location?.isOnline && (
                                                <View className="bg-blue-50 rounded-full px-2.5 py-1 mr-2 mb-1 border border-blue-200">
                                                    <Text className="text-blue-700 text-xs font-medium">
                                                        Online
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* Description */}
                                        <Text className="text-gray-500 text-sm leading-5 mb-4">
                                            {selectedEvent.description}
                                        </Text>

                                        {/* Info Grid */}
                                        <View className="flex-row flex-wrap mb-4">
                                            <View className="w-1/2 mb-3 pr-2">
                                                <Text className="text-gray-400 text-xs">Date</Text>
                                                <Text className="text-gray-900 font-medium text-sm mt-0.5">
                                                    {formatDate(selectedEvent.startDate)}
                                                    {selectedEvent.endDate &&
                                                        selectedEvent.endDate !== selectedEvent.startDate
                                                        ? ` - ${formatDate(selectedEvent.endDate)}`
                                                        : ''}
                                                </Text>
                                            </View>
                                            {selectedEvent.startTime && (
                                                <View className="w-1/2 mb-3 pr-2">
                                                    <Text className="text-gray-400 text-xs">Time</Text>
                                                    <Text className="text-gray-900 font-medium text-sm mt-0.5">
                                                        {selectedEvent.startTime}
                                                        {selectedEvent.endTime
                                                            ? ` - ${selectedEvent.endTime}`
                                                            : ''}
                                                    </Text>
                                                </View>
                                            )}
                                            <View className="w-1/2 mb-3 pr-2">
                                                <Text className="text-gray-400 text-xs">Location</Text>
                                                {selectedEvent.location?.isOnline ? (
                                                    <Text className="text-gray-900 font-medium text-sm mt-0.5">
                                                        Online Event
                                                    </Text>
                                                ) : (
                                                    <Text className="text-gray-900 font-medium text-sm mt-0.5">
                                                        {selectedEvent.location?.venue || 'TBA'}
                                                        {selectedEvent.location?.city
                                                            ? `, ${selectedEvent.location.city}`
                                                            : ''}
                                                    </Text>
                                                )}
                                            </View>
                                            <View className="w-1/2 mb-3 pr-2">
                                                <Text className="text-gray-400 text-xs">
                                                    Participants
                                                </Text>
                                                <Text className="text-gray-900 font-medium text-sm mt-0.5">
                                                    {getParticipantCount(selectedEvent)}
                                                    {getMaxParticipants(selectedEvent) > 0
                                                        ? `/${getMaxParticipants(selectedEvent)}`
                                                        : ''}{' '}
                                                    registered
                                                </Text>
                                            </View>
                                            <View className="w-1/2 mb-3 pr-2">
                                                <Text className="text-gray-400 text-xs">Pricing</Text>
                                                {selectedEvent.pricing?.isFree ? (
                                                    <Text className="text-emerald-600 font-medium text-sm mt-0.5">
                                                        Free
                                                    </Text>
                                                ) : (
                                                    <Text className="text-gray-900 font-medium text-sm mt-0.5">
                                                        ₹{selectedEvent.pricing?.memberPrice || 0}{' '}
                                                        (Member)
                                                    </Text>
                                                )}
                                            </View>
                                            {selectedEvent.registration?.registrationDeadline && (
                                                <View className="w-1/2 mb-3 pr-2">
                                                    <Text className="text-gray-400 text-xs">
                                                        Registration Deadline
                                                    </Text>
                                                    <Text className="text-gray-900 font-medium text-sm mt-0.5">
                                                        {formatDate(
                                                            selectedEvent.registration
                                                                .registrationDeadline,
                                                        )}
                                                    </Text>
                                                </View>
                                            )}
                                            <View className="w-1/2 mb-3 pr-2">
                                                <Text className="text-gray-400 text-xs">Status</Text>
                                                <Text className="text-gray-900 font-medium text-sm mt-0.5">
                                                    {isRegistered(selectedEvent)
                                                        ? 'Registered'
                                                        : 'Not Registered'}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Early Bird Info */}
                                        {selectedEvent.pricing &&
                                            !selectedEvent.pricing.isFree &&
                                            selectedEvent.pricing.earlyBirdPrice > 0 && (
                                                <View className="p-3 bg-yellow-50 rounded-xl border border-yellow-200 mb-4">
                                                    <Text className="text-yellow-800 font-medium text-sm">
                                                        🐦 Early Bird Price: ₹
                                                        {selectedEvent.pricing.earlyBirdPrice}
                                                        {selectedEvent.pricing.earlyBirdDeadline && (
                                                            <>
                                                                {' '}
                                                                (until{' '}
                                                                {formatDate(
                                                                    selectedEvent.pricing
                                                                        .earlyBirdDeadline,
                                                                )}
                                                                )
                                                            </>
                                                        )}
                                                    </Text>
                                                </View>
                                            )}

                                        {/* Tags */}
                                        {selectedEvent.tags &&
                                            selectedEvent.tags.length > 0 && (
                                                <View className="flex-row flex-wrap mb-2">
                                                    {selectedEvent.tags.map((tag, index) => (
                                                        <View
                                                            key={index}
                                                            className="bg-gray-100 rounded-full px-3 py-1 mr-1.5 mb-1">
                                                            <Text className="text-gray-500 text-xs">
                                                                {tag}
                                                            </Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        {/* Footer Buttons */}
                        <View className="px-5 pb-6 pt-2 border-t border-gray-100">
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => setShowDetailModal(false)}
                                    className="flex-1 border border-gray-300 rounded-xl py-3.5 items-center">
                                    <Text className="text-gray-700 font-semibold">Close</Text>
                                </TouchableOpacity>
                                {selectedEvent &&
                                    (isRegistered(selectedEvent) ? (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setShowDetailModal(false);
                                                handleUnregister(selectedEvent._id);
                                            }}
                                            className="flex-1 border border-red-300 rounded-xl py-3.5 items-center">
                                            <Text className="text-red-500 font-semibold">
                                                Unregister
                                            </Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setShowDetailModal(false);
                                                handleInitiateRegistration(selectedEvent);
                                            }}
                                            disabled={isFull(selectedEvent)}
                                            activeOpacity={0.8}
                                            className="flex-1">
                                            <LinearGradient
                                                colors={
                                                    isFull(selectedEvent)
                                                        ? ['#d1d5db', '#d1d5db']
                                                        : ['#059669', '#10b981']
                                                }
                                                className="rounded-xl py-3.5 items-center">
                                                <Text className="text-white font-bold">
                                                    {isFull(selectedEvent)
                                                        ? 'Event Full'
                                                        : 'Register Now'}
                                                </Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    ))}
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── CONSENT & PERMISSION MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showConsentModal}
                transparent
                animationType="slide"
                onRequestClose={() => {
                    setShowConsentModal(false);
                    setConsentEvent(null);
                }}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '85%' }}>
                        {/* Modal Header */}
                        <View className="flex-row justify-between items-center mb-2">
                            <View className="flex-row items-center flex-1">
                                <View className="w-10 h-10 bg-emerald-100 rounded-full justify-center items-center">
                                    <Icon name="shield-check" size={22} color="#059669" />
                                </View>
                                <View className="ml-3 flex-1">
                                    <Text className="text-gray-900 font-bold text-lg">
                                        Registration Consent
                                    </Text>
                                    <Text className="text-gray-400 text-xs">
                                        Review and accept terms
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowConsentModal(false);
                                    setConsentEvent(null);
                                }}>
                                <Icon name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {consentEvent && (
                                <View className="mt-4">
                                    {/* Event Summary */}
                                    <View className="p-3 bg-gray-50 rounded-xl border border-gray-200 mb-4">
                                        <Text className="text-gray-900 font-semibold text-sm">
                                            {consentEvent.title}
                                        </Text>
                                        <Text className="text-gray-400 text-xs mt-1">
                                            {formatDate(consentEvent.startDate)}
                                            {consentEvent.startTime
                                                ? ` at ${consentEvent.startTime}`
                                                : ''}
                                        </Text>
                                        <View className="flex-row items-center mt-2">
                                            {consentEvent.pricing?.isFree ? (
                                                <View className="bg-emerald-100 rounded-full px-2.5 py-0.5 border border-emerald-200">
                                                    <Text className="text-emerald-700 text-xs font-medium">
                                                        Free Event
                                                    </Text>
                                                </View>
                                            ) : (
                                                <View className="flex-row items-center">
                                                    <View className="bg-orange-100 rounded-full px-2.5 py-0.5 border border-orange-200">
                                                        <Text className="text-orange-700 text-xs font-medium">
                                                            Paid Event — ₹{getEventPrice(consentEvent)}
                                                        </Text>
                                                    </View>
                                                    {isEarlyBird(consentEvent) && (
                                                        <View className="bg-yellow-100 rounded-full px-2.5 py-0.5 border border-yellow-300 ml-2">
                                                            <Text className="text-yellow-700 text-xs font-medium">
                                                                🐦 Early Bird
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* Divider */}
                                    <View className="h-[1px] bg-gray-200 mb-4" />

                                    {/* Consent Checkboxes */}
                                    <ConsentCheckbox
                                        checked={consentChecks.termsAccepted}
                                        onToggle={() =>
                                            setConsentChecks(prev => ({
                                                ...prev,
                                                termsAccepted: !prev.termsAccepted,
                                            }))
                                        }
                                        title="Terms & Conditions *"
                                        description="I have read and agree to the event terms and conditions, including cancellation and refund policies."
                                    />
                                    <ConsentCheckbox
                                        checked={consentChecks.rulesAccepted}
                                        onToggle={() =>
                                            setConsentChecks(prev => ({
                                                ...prev,
                                                rulesAccepted: !prev.rulesAccepted,
                                            }))
                                        }
                                        title="Club Rules & Code of Conduct *"
                                        description="I agree to follow the club rules, code of conduct, and event-specific guidelines during the event."
                                    />
                                    <ConsentCheckbox
                                        checked={consentChecks.liabilityAccepted}
                                        onToggle={() =>
                                            setConsentChecks(prev => ({
                                                ...prev,
                                                liabilityAccepted: !prev.liabilityAccepted,
                                            }))
                                        }
                                        title="Liability Waiver & Health Declaration *"
                                        description="I acknowledge that participation involves physical activity and I take responsibility for my own health and safety. I confirm I am medically fit to participate."
                                    />
                                    <ConsentCheckbox
                                        checked={consentChecks.dataConsent}
                                        onToggle={() =>
                                            setConsentChecks(prev => ({
                                                ...prev,
                                                dataConsent: !prev.dataConsent,
                                            }))
                                        }
                                        title="Data & Photography Consent *"
                                        description="I consent to the collection and use of my personal data for event management purposes. I also permit the club to capture and use photographs/videos from the event for promotional purposes."
                                    />

                                    {/* Warning */}
                                    {!allConsentsGiven && (
                                        <View className="flex-row items-center p-3 bg-yellow-50 rounded-xl border border-yellow-200 mb-2">
                                            <Icon
                                                name="alert-circle"
                                                size={18}
                                                color="#d97706"
                                            />
                                            <Text className="text-yellow-700 text-xs ml-2 flex-1">
                                                Please accept all the above consents to proceed
                                                with registration.
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </ScrollView>

                        {/* Footer Buttons */}
                        <View className="flex-row gap-3 mt-4">
                            <TouchableOpacity
                                onPress={() => {
                                    setShowConsentModal(false);
                                    setConsentEvent(null);
                                }}
                                className="flex-1 border border-gray-300 rounded-xl py-4 items-center">
                                <Text className="text-gray-700 font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleConsentProceed}
                                disabled={!allConsentsGiven}
                                activeOpacity={0.8}
                                className="flex-1">
                                <LinearGradient
                                    colors={
                                        allConsentsGiven
                                            ? ['#059669', '#10b981']
                                            : ['#d1d5db', '#d1d5db']
                                    }
                                    className="rounded-xl py-4 items-center">
                                    <Text className="text-white font-bold text-sm">
                                        {consentEvent?.pricing &&
                                            !consentEvent.pricing.isFree &&
                                            consentEvent.pricing.memberPrice > 0
                                            ? 'Proceed to Payment'
                                            : 'Confirm & Register'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── PAYMENT MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showPaymentModal}
                transparent
                animationType="slide"
                onRequestClose={() => {
                    if (!processingPayment) {
                        setShowPaymentModal(false);
                        setConsentEvent(null);
                    }
                }}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '85%' }}>
                        {/* Modal Header */}
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-blue-100 rounded-full justify-center items-center">
                                    <Icon name="credit-card" size={22} color="#2563eb" />
                                </View>
                                <View className="ml-3">
                                    <Text className="text-gray-900 font-bold text-lg">
                                        Complete Payment
                                    </Text>
                                    <Text className="text-gray-400 text-xs">
                                        Secure payment processing
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    if (!processingPayment) {
                                        setShowPaymentModal(false);
                                        setConsentEvent(null);
                                    }
                                }}>
                                <Icon name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {consentEvent && (
                                <View>
                                    {/* Payment Summary */}
                                    <View className="p-4 bg-gray-50 rounded-xl border border-gray-200 mb-4">
                                        <Text className="text-gray-900 font-semibold text-sm mb-3">
                                            Payment Summary
                                        </Text>
                                        <View className="flex-row justify-between mb-2">
                                            <Text className="text-gray-500 text-sm">Event</Text>
                                            <Text className="text-gray-900 font-medium text-sm flex-1 text-right ml-4" numberOfLines={1}>
                                                {consentEvent.title}
                                            </Text>
                                        </View>
                                        <View className="flex-row justify-between mb-2">
                                            <Text className="text-gray-500 text-sm">Date</Text>
                                            <Text className="text-gray-900 text-sm">
                                                {formatDate(consentEvent.startDate)}
                                            </Text>
                                        </View>
                                        {isEarlyBird(consentEvent) && (
                                            <>
                                                <View className="flex-row justify-between mb-1">
                                                    <Text className="text-gray-400 text-sm">
                                                        Regular Price
                                                    </Text>
                                                    <Text className="text-gray-400 text-sm line-through">
                                                        ₹{consentEvent.pricing.memberPrice}
                                                    </Text>
                                                </View>
                                                <View className="flex-row justify-between mb-2">
                                                    <Text className="text-yellow-600 text-sm">
                                                        🐦 Early Bird Discount
                                                    </Text>
                                                    <Text className="text-yellow-600 text-sm">
                                                        -₹
                                                        {consentEvent.pricing.memberPrice -
                                                            consentEvent.pricing.earlyBirdPrice}
                                                    </Text>
                                                </View>
                                            </>
                                        )}
                                        <View className="h-[1px] bg-gray-200 my-2" />
                                        <View className="flex-row justify-between">
                                            <Text className="text-gray-900 font-bold text-base">
                                                Total Amount
                                            </Text>
                                            <Text className="text-emerald-600 font-bold text-base">
                                                ₹{getEventPrice(consentEvent)}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Payment Methods */}
                                    <Text className="text-gray-900 font-semibold text-sm mb-3">
                                        Select Payment Method
                                    </Text>

                                    <PaymentOption
                                        value="card"
                                        icon="credit-card"
                                        iconColor="#2563eb"
                                        iconBg="#dbeafe"
                                        title="Credit / Debit Card"
                                        subtitle="Visa, Mastercard, RuPay"
                                    />
                                    <PaymentOption
                                        value="upi"
                                        icon="cellphone"
                                        iconColor="#059669"
                                        iconBg="#d1fae5"
                                        title="UPI"
                                        subtitle="Google Pay, PhonePe, Paytm"
                                    />
                                    <PaymentOption
                                        value="net_banking"
                                        icon="bank"
                                        iconColor="#7c3aed"
                                        iconBg="#ede9fe"
                                        title="Net Banking"
                                        subtitle="All major banks supported"
                                    />
                                    <PaymentOption
                                        value="cash"
                                        icon="cash"
                                        iconColor="#d97706"
                                        iconBg="#fef3c7"
                                        title="Pay at Counter (Cash)"
                                        subtitle="Pay in person at the club reception"
                                    />

                                    {/* Security Note */}
                                    <View className="flex-row items-center p-3 bg-emerald-50 rounded-xl border border-emerald-200 mt-3">
                                        <Icon
                                            name="shield-check"
                                            size={18}
                                            color="#059669"
                                        />
                                        <Text className="text-emerald-700 text-xs ml-2 flex-1">
                                            Your payment is secured with 256-bit SSL encryption.
                                            We do not store your card details.
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        {/* Footer Buttons */}
                        <View className="flex-row gap-3 mt-4">
                            <TouchableOpacity
                                onPress={() => {
                                    if (!processingPayment) {
                                        setShowPaymentModal(false);
                                        setConsentEvent(null);
                                    }
                                }}
                                disabled={processingPayment}
                                className="flex-1 border border-gray-300 rounded-xl py-4 items-center"
                                style={{ opacity: processingPayment ? 0.5 : 1 }}>
                                <Text className="text-gray-700 font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handlePayAndRegister}
                                disabled={processingPayment}
                                activeOpacity={0.8}
                                className="flex-1">
                                <LinearGradient
                                    colors={
                                        processingPayment
                                            ? ['#9ca3af', '#9ca3af']
                                            : ['#059669', '#10b981']
                                    }
                                    className="rounded-xl py-4 items-center flex-row justify-center">
                                    {processingPayment ? (
                                        <>
                                            <ActivityIndicator
                                                size="small"
                                                color="#fff"
                                                style={{ marginRight: 8 }}
                                            />
                                            <Text className="text-white font-bold text-sm">
                                                Processing...
                                            </Text>
                                        </>
                                    ) : (
                                        <Text className="text-white font-bold text-sm">
                                            Pay ₹{consentEvent ? getEventPrice(consentEvent) : 0} &
                                            Register
                                        </Text>
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