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
    Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DrawerMenuButton from '../../components/DrawerMenuButton';
import { MOCK_ANNOUNCEMENTS, ANNOUNCEMENT_PRIORITIES } from '../../data/announcements';

// ─── Helpers ───
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const getPriorityConfig = (priority) => {
    switch (priority) {
        case 'urgent':
            return {
                bg: '#fee2e2', iconColor: '#dc2626', border: '#fca5a5',
                badgeBg: '#dc2626', badgeText: '#fff', label: 'Urgent',
                gradient: ['#dc2626', '#ef4444'], dotColor: '#dc2626',
            };
        case 'high':
            return {
                bg: '#fff7ed', iconColor: '#ea580c', border: '#fdba74',
                badgeBg: '#ea580c', badgeText: '#fff', label: 'High',
                gradient: ['#ea580c', '#f97316'], dotColor: '#ea580c',
            };
        case 'medium':
            return {
                bg: '#fefce8', iconColor: '#ca8a04', border: '#fde047',
                badgeBg: '#ca8a04', badgeText: '#fff', label: 'Medium',
                gradient: ['#ca8a04', '#eab308'], dotColor: '#ca8a04',
            };
        default:
            return {
                bg: '#eff6ff', iconColor: '#2563eb', border: '#93c5fd',
                badgeBg: '#2563eb', badgeText: '#fff', label: 'Low',
                gradient: ['#2563eb', '#3b82f6'], dotColor: '#2563eb',
            };
    }
};

const getPriorityIcon = (priority) => {
    switch (priority) {
        case 'urgent': return 'alert-circle';
        case 'high': return 'alert';
        case 'medium': return 'information';
        default: return 'information-outline';
    }
};

const getAudienceLabel = (audience) => {
    if (!audience) return '';
    if (Array.isArray(audience)) {
        return audience.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ');
    }
    return String(audience).charAt(0).toUpperCase() + String(audience).slice(1);
};

// ═══════════════════════════════════════════════
// ─── SECTION TITLE COMPONENT ───
// ═══════════════════════════════════════════════
const SectionTitle = ({ title, icon, iconColor = '#059669', rightElement }) => (
    <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
            <View
                className="w-8 h-8 rounded-lg justify-center items-center mr-2.5"
                style={{ backgroundColor: `${iconColor}15` }}>
                <Icon name={icon} size={16} color={iconColor} />
            </View>
            <Text className="text-gray-900 font-bold text-lg">{title}</Text>
        </View>
        {rightElement}
    </View>
);

// ═══════════════════════════════════════════════
// ─── PRIORITY STAT CHIP ───
// ═══════════════════════════════════════════════
const PriorityStatChip = ({ count, label, color, gradient, onPress, isActive }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className="mr-2.5 items-center">
        <LinearGradient
            colors={isActive ? gradient : ['#f9fafb', '#f3f4f6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl px-5 py-3 items-center justify-center"
            style={{ elevation: isActive ? 4 : 1 }}>
            <Text className={`font-bold text-xl ${isActive ? 'text-white' : 'text-gray-600'}`}>
                {count}
            </Text>
        </LinearGradient>
        <Text
            className="text-[10px] font-semibold mt-1.5 text-center"
            style={{ color: isActive ? color : '#9ca3af' }}>
            {label}
        </Text>
    </TouchableOpacity>
);

// ═══════════════════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════
const AnnouncementsScreen = ({ navigation }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState('all');
    const [page, setPage] = useState(1);
    const LIMIT = 10;
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // ─── Data Fetching (Mock) ───
    const fetchAnnouncements = useCallback(async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 600));
            let filtered = [...MOCK_ANNOUNCEMENTS];
            if (filterPriority !== 'all') {
                filtered = filtered.filter(a => a.priority === filterPriority);
            }
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setAnnouncements(filtered);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }, [filterPriority]);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAnnouncements();
        setRefreshing(false);
    };

    // ─── Priority Counts ───
    const priorityCounts = useMemo(() => {
        const all = MOCK_ANNOUNCEMENTS;
        return {
            all: all.length,
            urgent: all.filter(a => a.priority === 'urgent').length,
            high: all.filter(a => a.priority === 'high').length,
            medium: all.filter(a => a.priority === 'medium').length,
            low: all.filter(a => a.priority === 'low' || !a.priority).length,
        };
    }, []);

    const newTodayCount = useMemo(() =>
        MOCK_ANNOUNCEMENTS.filter(a =>
            (Date.now() - new Date(a.createdAt).getTime()) < 24 * 60 * 60 * 1000
        ).length, []);

    // ─── Filtered ───
    const filteredAnnouncements = useMemo(() => {
        return announcements.filter(a => {
            const matchesSearch =
                a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.content?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [announcements, searchTerm]);

    const totalPages = Math.ceil(filteredAnnouncements.length / LIMIT);
    const paginatedAnnouncements = useMemo(() => {
        const start = (page - 1) * LIMIT;
        return filteredAnnouncements.slice(start, start + LIMIT);
    }, [filteredAnnouncements, page]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, filterPriority]);

    // ─── Handlers ───
    const handleViewDetail = (announcement) => {
        setSelectedAnnouncement(announcement);
        setShowDetailModal(true);
    };

    const handleOpenAttachment = (attachment) => {
        if (attachment.url && attachment.url !== '#') {
            Linking.openURL(attachment.url).catch(() => { });
        }
    };

    // ─── Announcement Card ───
    const AnnouncementCard = ({ announcement }) => {
        const config = getPriorityConfig(announcement.priority);
        const isNew = (Date.now() - new Date(announcement.createdAt).getTime()) < 48 * 60 * 60 * 1000;

        return (
            <TouchableOpacity
                onPress={() => handleViewDetail(announcement)}
                activeOpacity={0.85}
                className="bg-white rounded-2xl mb-3 overflow-hidden"
                style={{
                    elevation: 3,
                    borderLeftWidth: 4,
                    borderLeftColor: config.iconColor,
                }}>
                <View className="p-4">
                    {/* Top Row */}
                    <View className="flex-row items-start">
                        <LinearGradient
                            colors={config.gradient}
                            className="w-11 h-11 rounded-xl justify-center items-center mr-3"
                            style={{ borderRadius: 12 }}>
                            <Icon name={getPriorityIcon(announcement.priority)} size={20} color="#fff" />
                        </LinearGradient>

                        <View className="flex-1 mr-2">
                            <View className="flex-row items-center">
                                <Text
                                    className="text-gray-900 font-bold text-sm flex-1"
                                    numberOfLines={1}>
                                    {announcement.title}
                                </Text>
                                {isNew && (
                                    <View className="bg-emerald-500 px-2 py-0.5 rounded-full ml-2">
                                        <Text className="text-white text-[9px] font-bold">NEW</Text>
                                    </View>
                                )}
                            </View>

                            <View className="flex-row items-center mt-1.5 flex-wrap">
                                {announcement.author && (
                                    <View className="flex-row items-center mr-3">
                                        <Icon name="account-outline" size={11} color="#9ca3af" />
                                        <Text className="text-gray-400 text-[11px] ml-1">
                                            {announcement.author}
                                        </Text>
                                    </View>
                                )}
                                <View className="flex-row items-center">
                                    <Icon name="clock-outline" size={11} color="#9ca3af" />
                                    <Text className="text-gray-400 text-[11px] ml-1">
                                        {formatDate(announcement.publishDate || announcement.createdAt)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Priority Badge */}
                        <View
                            className="px-2.5 py-1 rounded-full flex-shrink-0 flex-row items-center"
                            style={{ backgroundColor: config.bg, borderWidth: 1, borderColor: config.border }}>
                            <View className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: config.dotColor }} />
                            <Text className="text-[10px] font-bold capitalize" style={{ color: config.iconColor }}>
                                {config.label}
                            </Text>
                        </View>
                    </View>

                    {/* Content Preview */}
                    <Text className="text-gray-500 text-sm leading-5 mt-3 mb-2.5" numberOfLines={2}>
                        {announcement.content}
                    </Text>

                    {/* Bottom Row */}
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            {announcement.targetAudience && (
                                <View className="bg-gray-50 rounded-full px-2.5 py-1 mr-2 border border-gray-100">
                                    <Text className="text-gray-500 text-[10px] font-medium">
                                        {getAudienceLabel(announcement.targetAudience)}
                                    </Text>
                                </View>
                            )}
                            {announcement.attachments && announcement.attachments.length > 0 && (
                                <View className="flex-row items-center bg-blue-50 rounded-full px-2 py-1 border border-blue-100">
                                    <Icon name="paperclip" size={10} color="#3b82f6" />
                                    <Text className="text-blue-600 text-[10px] font-semibold ml-1">
                                        {announcement.attachments.length}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            onPress={() => handleViewDetail(announcement)}
                            activeOpacity={0.7}
                            className="flex-row items-center bg-emerald-50 px-3 py-1.5 rounded-full">
                            <Text className="text-emerald-600 text-[11px] font-semibold">Read more</Text>
                            <Icon name="chevron-right" size={14} color="#059669" />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // ─── Loading State ───
    if (loading && announcements.length === 0) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <View className="w-16 h-16 rounded-2xl bg-emerald-50 justify-center items-center mb-4">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
                <Text className="text-gray-900 font-bold text-base">Loading Announcements</Text>
                <Text className="text-gray-400 mt-1 text-sm">Fetching latest updates...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* ═══════════════════════════════════════════════ */}
            {/* ─── HEADER ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <LinearGradient
                colors={['#064e3b', '#059669', '#10b981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingTop: 48, paddingBottom: 28, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>

                {/* Top Bar */}
                <View className="flex-row justify-between items-center px-5 mb-4">
                    <DrawerMenuButton />
                    <TouchableOpacity
                        onPress={onRefresh}
                        disabled={loading || refreshing}
                        className="w-10 h-10 bg-white/15 rounded-full justify-center items-center">
                        <Icon
                            name="refresh"
                            size={22}
                            color="#fff"
                            style={(loading || refreshing) ? { opacity: 0.5 } : {}}
                        />
                    </TouchableOpacity>
                </View>

                {/* Title Section */}
                <View className="px-5 flex-row items-center">
                    <View className="w-12 h-12 bg-white/15 rounded-2xl justify-center items-center mr-3.5">
                        <Icon name="bullhorn" size={24} color="#fff" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white font-bold text-2xl">Announcements</Text>
                        <Text className="text-white/60 text-sm">Stay updated with latest news</Text>
                    </View>
                </View>

                {/* Summary Stats Bar */}
                <View className="mx-5 mt-4 bg-white/10 rounded-2xl p-4" style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                    <View className="flex-row items-center justify-around">
                        {[
                            { label: 'Total', count: priorityCounts.all, icon: 'bulletin-board', color: '#fff' },
                            { label: 'Urgent', count: priorityCounts.urgent, icon: 'alert-circle', color: '#fca5a5' },
                            { label: 'New Today', count: newTodayCount, icon: 'clock-alert-outline', color: '#6ee7b7' },
                        ].map((item, idx) => (
                            <View key={idx} className="items-center">
                                <View className="flex-row items-center">
                                    <Icon name={item.icon} size={14} color={item.color} />
                                    <Text className="font-bold text-xl ml-1.5" style={{ color: item.color }}>
                                        {item.count}
                                    </Text>
                                </View>
                                <Text className="text-white/50 text-[10px] font-medium uppercase tracking-wider mt-0.5">
                                    {item.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                className="flex-1"
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
                {/* ─── SEARCH BAR ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-5">
                    <View
                        className="flex-row items-center bg-white rounded-2xl px-4 border border-gray-100"
                        style={{ elevation: 3 }}>
                        <Icon name="magnify" size={20} color="#9ca3af" />
                        <TextInput
                            className="flex-1 py-3.5 px-3 text-gray-900 text-sm"
                            placeholder="Search announcements..."
                            placeholderTextColor="#9ca3af"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                        {searchTerm.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setSearchTerm('')}
                                className="w-7 h-7 bg-gray-100 rounded-full justify-center items-center">
                                <Icon name="close" size={14} color="#6b7280" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── PRIORITY FILTER STATS ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-5">
                    <SectionTitle
                        title="Filter by Priority"
                        icon="filter-variant"
                        iconColor="#f59e0b"
                    />
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 16 }}>
                        <PriorityStatChip
                            count={priorityCounts.all}
                            label="All"
                            color="#059669"
                            gradient={['#059669', '#10b981']}
                            isActive={filterPriority === 'all'}
                            onPress={() => setFilterPriority('all')}
                        />
                        <PriorityStatChip
                            count={priorityCounts.urgent}
                            label="Urgent"
                            color="#dc2626"
                            gradient={['#dc2626', '#ef4444']}
                            isActive={filterPriority === 'urgent'}
                            onPress={() => setFilterPriority('urgent')}
                        />
                        <PriorityStatChip
                            count={priorityCounts.high}
                            label="High"
                            color="#ea580c"
                            gradient={['#ea580c', '#f97316']}
                            isActive={filterPriority === 'high'}
                            onPress={() => setFilterPriority('high')}
                        />
                        <PriorityStatChip
                            count={priorityCounts.medium}
                            label="Medium"
                            color="#ca8a04"
                            gradient={['#ca8a04', '#eab308']}
                            isActive={filterPriority === 'medium'}
                            onPress={() => setFilterPriority('medium')}
                        />
                        <PriorityStatChip
                            count={priorityCounts.low}
                            label="Low"
                            color="#2563eb"
                            gradient={['#2563eb', '#3b82f6']}
                            isActive={filterPriority === 'low'}
                            onPress={() => setFilterPriority('low')}
                        />
                    </ScrollView>
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── ANNOUNCEMENTS LIST ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-5">
                    <SectionTitle
                        title={`${filteredAnnouncements.length} Announcement${filteredAnnouncements.length !== 1 ? 's' : ''}`}
                        icon="bulletin-board"
                        iconColor="#059669"
                        rightElement={
                            searchTerm ? (
                                <TouchableOpacity
                                    onPress={() => setSearchTerm('')}
                                    activeOpacity={0.7}
                                    className="bg-red-50 px-3 py-1.5 rounded-full flex-row items-center">
                                    <Icon name="close-circle" size={12} color="#ef4444" />
                                    <Text className="text-red-500 font-semibold text-xs ml-1">Clear</Text>
                                </TouchableOpacity>
                            ) : null
                        }
                    />

                    {paginatedAnnouncements.length === 0 ? (
                        <View className="bg-white rounded-2xl p-10 items-center" style={{ elevation: 3 }}>
                            <View className="w-20 h-20 rounded-full bg-gray-50 justify-center items-center mb-4">
                                <Icon name="bullhorn-outline" size={40} color="#d1d5db" />
                            </View>
                            <Text className="text-gray-900 font-bold text-base">No announcements found</Text>
                            <Text className="text-gray-400 text-sm text-center mt-1.5 max-w-[240]">
                                {searchTerm
                                    ? 'Try adjusting your search terms'
                                    : 'Check back later for new updates'}
                            </Text>
                            {searchTerm && (
                                <TouchableOpacity
                                    onPress={() => setSearchTerm('')}
                                    className="mt-4 bg-emerald-50 px-6 py-2.5 rounded-xl flex-row items-center"
                                    style={{ borderWidth: 1, borderColor: '#d1fae5' }}>
                                    <Icon name="magnify" size={14} color="#059669" />
                                    <Text className="text-emerald-600 font-semibold text-sm ml-2">Clear Search</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        paginatedAnnouncements.map(announcement => (
                            <AnnouncementCard
                                key={announcement._id}
                                announcement={announcement}
                            />
                        ))
                    )}
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── PAGINATION ─── */}
                {/* ═══════════════════════════════════════════════ */}
                {totalPages > 1 && (
                    <View className="flex-row items-center justify-center mt-5 mb-2 px-4">
                        <TouchableOpacity
                            onPress={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                            activeOpacity={0.8}
                            className="mr-2">
                            <View className={`flex-row items-center border rounded-xl px-4 py-2.5 ${page === 1 ? 'border-gray-100 bg-gray-50' : 'border-gray-200 bg-white'}`}
                                style={page !== 1 ? { elevation: 2 } : {}}>
                                <Icon name="chevron-left" size={16} color={page === 1 ? '#d1d5db' : '#374151'} />
                                <Text className={`text-xs font-semibold ml-1 ${page === 1 ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Prev
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <View className="flex-row items-center mx-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <TouchableOpacity
                                    key={p}
                                    onPress={() => setPage(p)}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                    className="mx-0.5">
                                    {page === p ? (
                                        <LinearGradient
                                            colors={['#059669', '#10b981']}
                                            className="w-9 h-9 rounded-xl justify-center items-center"
                                            style={{ elevation: 3 }}>
                                            <Text className="text-white text-xs font-bold">{p}</Text>
                                        </LinearGradient>
                                    ) : (
                                        <View className="w-9 h-9 rounded-xl justify-center items-center bg-white border border-gray-100"
                                            style={{ elevation: 1 }}>
                                            <Text className="text-gray-500 text-xs font-semibold">{p}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                            activeOpacity={0.8}
                            className="ml-2">
                            <View className={`flex-row items-center border rounded-xl px-4 py-2.5 ${page === totalPages ? 'border-gray-100 bg-gray-50' : 'border-gray-200 bg-white'}`}
                                style={page !== totalPages ? { elevation: 2 } : {}}>
                                <Text className={`text-xs font-semibold mr-1 ${page === totalPages ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Next
                                </Text>
                                <Icon name="chevron-right" size={16} color={page === totalPages ? '#d1d5db' : '#374151'} />
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                <View className="h-8" />
            </ScrollView>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── ANNOUNCEMENT DETAIL MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showDetailModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDetailModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-gray-50 rounded-t-3xl" style={{ maxHeight: '90%' }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {selectedAnnouncement && (() => {
                                const config = getPriorityConfig(selectedAnnouncement.priority);
                                return (
                                    <View>
                                        {/* Modal Header Gradient */}
                                        <LinearGradient
                                            colors={config.gradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            className="pt-6 pb-10 rounded-t-3xl relative">
                                            <TouchableOpacity
                                                onPress={() => setShowDetailModal(false)}
                                                className="absolute top-4 right-4 w-8 h-8 bg-black/20 rounded-full justify-center items-center">
                                                <Icon name="close" size={18} color="#fff" />
                                            </TouchableOpacity>

                                            <View className="absolute top-4 left-5">
                                                <View className="flex-row items-center bg-white/20 px-3 py-1.5 rounded-full"
                                                    style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}>
                                                    <View className="w-2 h-2 rounded-full bg-white mr-1.5" />
                                                    <Text className="text-white text-xs font-bold capitalize">
                                                        {config.label} Priority
                                                    </Text>
                                                </View>
                                            </View>

                                            <View className="items-center mt-8">
                                                <View className="w-16 h-16 bg-white/20 rounded-2xl justify-center items-center">
                                                    <Icon name={getPriorityIcon(selectedAnnouncement.priority)} size={32} color="#fff" />
                                                </View>
                                            </View>
                                        </LinearGradient>

                                        <View className="p-5 -mt-5">
                                            {/* Title Card */}
                                            <View className="bg-white rounded-2xl p-5 shadow-md" style={{ elevation: 5 }}>
                                                <Text className="text-gray-900 font-bold text-xl leading-7">
                                                    {selectedAnnouncement.title}
                                                </Text>
                                                <View className="flex-row flex-wrap mt-3 gap-2">
                                                    {selectedAnnouncement.targetAudience && (
                                                        <View className="bg-gray-50 rounded-full px-3 py-1.5 border border-gray-100 flex-row items-center">
                                                            <Icon name="account-group" size={12} color="#6b7280" />
                                                            <Text className="text-gray-600 text-xs font-medium ml-1.5 capitalize">
                                                                {getAudienceLabel(selectedAnnouncement.targetAudience)}
                                                            </Text>
                                                        </View>
                                                    )}
                                                    {selectedAnnouncement.author && (
                                                        <View className="bg-emerald-50 rounded-full px-3 py-1.5 border border-emerald-100 flex-row items-center">
                                                            <Icon name="account-edit" size={12} color="#059669" />
                                                            <Text className="text-emerald-700 text-xs font-medium ml-1.5">
                                                                {selectedAnnouncement.author}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>

                                            {/* Info Grid */}
                                            <View className="bg-white rounded-2xl p-4 mt-3 shadow-sm" style={{ elevation: 2 }}>
                                                <View className="flex-row">
                                                    <View className="flex-1 items-center py-2 border-r border-gray-50">
                                                        <View className="w-9 h-9 rounded-xl bg-blue-50 justify-center items-center mb-1.5">
                                                            <Icon name="calendar" size={18} color="#3b82f6" />
                                                        </View>
                                                        <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">
                                                            Published
                                                        </Text>
                                                        <Text className="text-gray-900 font-semibold text-xs mt-0.5 text-center">
                                                            {formatDate(selectedAnnouncement.publishDate || selectedAnnouncement.createdAt)}
                                                        </Text>
                                                    </View>
                                                    {selectedAnnouncement.expiryDate ? (
                                                        <View className="flex-1 items-center py-2">
                                                            <View className="w-9 h-9 rounded-xl bg-orange-50 justify-center items-center mb-1.5">
                                                                <Icon name="calendar-clock" size={18} color="#f59e0b" />
                                                            </View>
                                                            <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">
                                                                Valid Until
                                                            </Text>
                                                            <Text className="text-gray-900 font-semibold text-xs mt-0.5 text-center">
                                                                {formatDate(selectedAnnouncement.expiryDate)}
                                                            </Text>
                                                        </View>
                                                    ) : (
                                                        <View className="flex-1 items-center py-2">
                                                            <View className="w-9 h-9 rounded-xl bg-emerald-50 justify-center items-center mb-1.5">
                                                                <Icon name="infinity" size={18} color="#059669" />
                                                            </View>
                                                            <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">
                                                                Validity
                                                            </Text>
                                                            <Text className="text-emerald-600 font-semibold text-xs mt-0.5 text-center">
                                                                No Expiry
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>

                                            {/* Content Card */}
                                            <View className="bg-white rounded-2xl p-5 mt-3 shadow-sm" style={{ elevation: 2 }}>
                                                <View className="flex-row items-center mb-3">
                                                    <View className="w-6 h-6 rounded-md bg-emerald-50 justify-center items-center mr-2">
                                                        <Icon name="text-box" size={14} color="#059669" />
                                                    </View>
                                                    <Text className="text-gray-900 font-bold text-sm">Content</Text>
                                                </View>
                                                <Text className="text-gray-600 text-sm leading-7">
                                                    {selectedAnnouncement.content}
                                                </Text>
                                            </View>

                                            {/* Attachments Card */}
                                            {selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0 && (
                                                <View className="bg-white rounded-2xl p-5 mt-3 shadow-sm" style={{ elevation: 2 }}>
                                                    <View className="flex-row items-center mb-3">
                                                        <View className="w-6 h-6 rounded-md bg-blue-50 justify-center items-center mr-2">
                                                            <Icon name="paperclip" size={14} color="#3b82f6" />
                                                        </View>
                                                        <Text className="text-gray-900 font-bold text-sm">Attachments</Text>
                                                        <View className="bg-blue-100 rounded-full px-2 py-0.5 ml-2">
                                                            <Text className="text-blue-700 text-[10px] font-bold">
                                                                {selectedAnnouncement.attachments.length}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    {selectedAnnouncement.attachments.map((att, idx) => (
                                                        <TouchableOpacity
                                                            key={idx}
                                                            onPress={() => handleOpenAttachment(att)}
                                                            activeOpacity={0.7}
                                                            className="flex-row items-center p-3.5 bg-gray-50 rounded-xl border border-gray-100 mb-2">
                                                            <View className="w-10 h-10 bg-blue-100 rounded-xl justify-center items-center">
                                                                <Icon name="file-document-outline" size={20} color="#2563eb" />
                                                            </View>
                                                            <View className="flex-1 ml-3">
                                                                <Text className="text-gray-900 text-sm font-semibold" numberOfLines={1}>
                                                                    {att.filename}
                                                                </Text>
                                                                <Text className="text-gray-400 text-[11px] mt-0.5">Tap to open</Text>
                                                            </View>
                                                            <View className="w-8 h-8 bg-blue-50 rounded-lg justify-center items-center">
                                                                <Icon name="open-in-new" size={16} color="#3b82f6" />
                                                            </View>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                );
                            })()}
                        </ScrollView>

                        {/* Footer */}
                        <View className="px-5 pb-6 pt-3 border-t border-gray-100 bg-gray-50">
                            <TouchableOpacity
                                onPress={() => setShowDetailModal(false)}
                                activeOpacity={0.8}>
                                <LinearGradient
                                    colors={['#059669', '#10b981']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{ borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
                                    <Text className="text-white font-bold text-sm">Close</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default AnnouncementsScreen;