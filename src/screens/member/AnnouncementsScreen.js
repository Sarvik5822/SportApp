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

const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getPriorityConfig = (priority) => {
    switch (priority) {
        case 'urgent':
            return {
                bg: '#fee2e2',
                iconColor: '#dc2626',
                border: '#fca5a5',
                badgeBg: '#dc2626',
                badgeText: '#fff',
                label: 'Urgent',
            };
        case 'high':
            return {
                bg: '#fff7ed',
                iconColor: '#ea580c',
                border: '#fdba74',
                badgeBg: '#ea580c',
                badgeText: '#fff',
                label: 'High',
            };
        case 'medium':
            return {
                bg: '#fefce8',
                iconColor: '#ca8a04',
                border: '#fde047',
                badgeBg: '#ca8a04',
                badgeText: '#fff',
                label: 'Medium',
            };
        default:
            return {
                bg: '#eff6ff',
                iconColor: '#2563eb',
                border: '#93c5fd',
                badgeBg: '#2563eb',
                badgeText: '#fff',
                label: 'Low',
            };
    }
};

const getAudienceLabel = (audience) => {
    if (!audience) return '';
    if (Array.isArray(audience)) {
        return audience.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ');
    }
    return String(audience).charAt(0).toUpperCase() + String(audience).slice(1);
};

// ─── Component ───
const AnnouncementsScreen = ({ navigation }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState('all');

    // Pagination
    const [page, setPage] = useState(1);
    const LIMIT = 10;

    // Detail Modal
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
            // Sort by date (newest first)
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setAnnouncements(filtered);
        } catch (error) {
            // Silently handle error
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

    // ─── Filtered Announcements ───
    const filteredAnnouncements = useMemo(() => {
        return announcements.filter(a => {
            const matchesSearch =
                a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.content?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [announcements, searchTerm]);

    // ─── Pagination ───
    const totalPages = Math.ceil(filteredAnnouncements.length / LIMIT);
    const paginatedAnnouncements = useMemo(() => {
        const start = (page - 1) * LIMIT;
        return filteredAnnouncements.slice(start, start + LIMIT);
    }, [filteredAnnouncements, page]);

    // Reset page when filters change
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

        return (
            <TouchableOpacity
                onPress={() => handleViewDetail(announcement)}
                activeOpacity={0.8}
                className="bg-white rounded-2xl mb-4 overflow-hidden"
                style={{ elevation: 3 }}>
                {/* Top Color Bar */}
                <View
                    className="h-1.5"
                    style={{ backgroundColor: config.border }}
                />

                <View className="p-4">
                    {/* Header Row */}
                    <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-row items-start flex-1 mr-3">
                            <View
                                className="w-10 h-10 rounded-full justify-center items-center"
                                style={{ backgroundColor: config.bg }}>
                                <Icon name="bullhorn" size={20} color={config.iconColor} />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text
                                    className="text-gray-900 font-bold text-base"
                                    numberOfLines={2}>
                                    {announcement.title}
                                </Text>
                                <View className="flex-row items-center flex-wrap mt-1.5">
                                    {(announcement.author) && (
                                        <View className="flex-row items-center mr-3 mb-1">
                                            <Icon name="account" size={12} color="#9ca3af" />
                                            <Text className="text-gray-400 text-xs ml-1">
                                                {announcement.author}
                                            </Text>
                                        </View>
                                    )}
                                    <View className="flex-row items-center mr-3 mb-1">
                                        <Icon name="calendar" size={12} color="#9ca3af" />
                                        <Text className="text-gray-400 text-xs ml-1">
                                            {formatDate(announcement.publishDate || announcement.createdAt)}
                                        </Text>
                                    </View>
                                    {announcement.targetAudience && (
                                        <View className="bg-gray-100 rounded-full px-2 py-0.5 mb-1 border border-gray-200">
                                            <Text className="text-gray-500 text-[10px] font-medium">
                                                {getAudienceLabel(announcement.targetAudience)}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>

                        {/* Priority Badge */}
                        {announcement.priority && (
                            <View
                                className="rounded-full px-2.5 py-1 flex-shrink-0"
                                style={{ backgroundColor: config.badgeBg }}>
                                <Text
                                    className="text-[10px] font-bold capitalize"
                                    style={{ color: config.badgeText }}>
                                    {config.label}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Content Preview */}
                    <Text className="text-gray-500 text-sm leading-5 mb-2" numberOfLines={2}>
                        {announcement.content}
                    </Text>

                    {/* Attachments Count */}
                    {announcement.attachments && announcement.attachments.length > 0 && (
                        <View className="flex-row items-center mb-2">
                            <Icon name="paperclip" size={13} color="#9ca3af" />
                            <Text className="text-gray-400 text-xs ml-1">
                                {announcement.attachments.length} attachment
                                {announcement.attachments.length > 1 ? 's' : ''}
                            </Text>
                        </View>
                    )}

                    {/* Expiry Date */}
                    {announcement.expiryDate && (
                        <Text className="text-gray-400 text-xs mb-2">
                            Valid until {formatDate(announcement.expiryDate)}
                        </Text>
                    )}

                    {/* Read More */}
                    <TouchableOpacity
                        onPress={() => handleViewDetail(announcement)}
                        activeOpacity={0.7}
                        className="flex-row items-center self-start">
                        <Text className="text-emerald-600 text-sm font-semibold">
                            Read more
                        </Text>
                        <Icon name="chevron-right" size={16} color="#059669" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    // ─── Loading State ───
    if (loading && announcements.length === 0) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#059669" />
                <Text className="text-gray-500 mt-3">Loading announcements...</Text>
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
                    <View className="flex-row items-center flex-1">
                        <DrawerMenuButton />
                        <View className="ml-2 flex-1">
                            <Text className="text-white font-bold text-2xl">
                                Announcements
                            </Text>
                            <Text className="text-white/80 text-sm">
                                Stay updated with the latest news and updates
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={onRefresh}
                        disabled={loading || refreshing}
                        className="w-10 h-10 bg-white/20 rounded-full justify-center items-center">
                        <Icon
                            name="refresh"
                            size={22}
                            color="#fff"
                            style={loading || refreshing ? { opacity: 0.5 } : {}}
                        />
                    </TouchableOpacity>
                </View>

                {/* Total Count */}
                {filteredAnnouncements.length > 0 && (
                    <View className="bg-white/20 rounded-full px-3 py-1 self-start mt-1">
                        <Text className="text-white text-xs font-medium">
                            {filteredAnnouncements.length} announcement
                            {filteredAnnouncements.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                )}
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
                            placeholder="Search announcements..."
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

                {/* ─── Priority Filter Chips ─── */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mt-3"
                    contentContainerStyle={{ paddingHorizontal: 16 }}>
                    {ANNOUNCEMENT_PRIORITIES.map(priority => (
                        <TouchableOpacity
                            key={priority.key}
                            onPress={() => setFilterPriority(priority.key)}
                            activeOpacity={0.8}
                            className={`mr-2 px-4 py-2 rounded-full ${filterPriority === priority.key
                                ? 'bg-emerald-500'
                                : 'bg-white border border-gray-200'
                                }`}
                            style={filterPriority !== priority.key ? { elevation: 1 } : {}}>
                            <Text
                                className={`text-xs font-semibold ${filterPriority === priority.key
                                    ? 'text-white'
                                    : 'text-gray-600'
                                    }`}>
                                {priority.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* ─── Announcements List ─── */}
                <View className="px-4 mt-4">
                    {paginatedAnnouncements.length === 0 ? (
                        <View
                            className="bg-white rounded-2xl p-8 items-center"
                            style={{ elevation: 2 }}>
                            <Icon name="bullhorn-outline" size={48} color="#d1d5db" />
                            <Text className="text-gray-900 font-semibold text-base mt-3">
                                No announcements found
                            </Text>
                            <Text className="text-gray-400 text-sm text-center mt-1">
                                {searchTerm
                                    ? 'Try adjusting your search'
                                    : 'No announcements available at this time'}
                            </Text>
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

                {/* ─── Pagination ─── */}
                {totalPages > 1 && !searchTerm && (
                    <View className="flex-row items-center justify-center gap-4 my-4 px-4">
                        <TouchableOpacity
                            onPress={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                            activeOpacity={0.7}
                            className={`flex-row items-center border rounded-xl px-4 py-2.5 ${page === 1
                                ? 'border-gray-200 bg-gray-100'
                                : 'border-gray-300 bg-white'
                                }`}
                            style={page !== 1 ? { elevation: 1 } : {}}>
                            <Icon
                                name="chevron-left"
                                size={18}
                                color={page === 1 ? '#d1d5db' : '#374151'}
                            />
                            <Text
                                className={`text-sm font-semibold ml-1 ${page === 1 ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                Previous
                            </Text>
                        </TouchableOpacity>

                        <Text className="text-gray-500 text-sm">
                            Page {page} of {totalPages}
                        </Text>

                        <TouchableOpacity
                            onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                            activeOpacity={0.7}
                            className={`flex-row items-center border rounded-xl px-4 py-2.5 ${page === totalPages
                                ? 'border-gray-200 bg-gray-100'
                                : 'border-gray-300 bg-white'
                                }`}
                            style={page !== totalPages ? { elevation: 1 } : {}}>
                            <Text
                                className={`text-sm font-semibold mr-1 ${page === totalPages ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                Next
                            </Text>
                            <Icon
                                name="chevron-right"
                                size={18}
                                color={page === totalPages ? '#d1d5db' : '#374151'}
                            />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Bottom Spacing */}
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
                    <View className="bg-white rounded-t-3xl" style={{ maxHeight: '90%' }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {selectedAnnouncement && (
                                <View>
                                    {/* Header Gradient */}
                                    <LinearGradient
                                        colors={['#059669', '#10b981']}
                                        className="h-36 justify-center items-center rounded-t-3xl relative">
                                        <Icon
                                            name="bullhorn"
                                            size={52}
                                            color="rgba(255,255,255,0.3)"
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowDetailModal(false)}
                                            className="absolute top-4 right-4 w-8 h-8 bg-black/30 rounded-full justify-center items-center">
                                            <Icon name="close" size={20} color="#fff" />
                                        </TouchableOpacity>

                                        {/* Priority Badge on Modal */}
                                        {selectedAnnouncement.priority && (
                                            <View
                                                className="absolute top-4 left-4 rounded-full px-3 py-1"
                                                style={{
                                                    backgroundColor: getPriorityConfig(
                                                        selectedAnnouncement.priority,
                                                    ).badgeBg,
                                                }}>
                                                <Text className="text-white text-xs font-bold capitalize">
                                                    {getPriorityConfig(selectedAnnouncement.priority).label}{' '}
                                                    Priority
                                                </Text>
                                            </View>
                                        )}
                                    </LinearGradient>

                                    <View className="p-5">
                                        {/* Title */}
                                        <Text className="text-gray-900 font-bold text-xl mb-3">
                                            {selectedAnnouncement.title}
                                        </Text>

                                        {/* Meta Badges */}
                                        <View className="flex-row flex-wrap mb-4">
                                            {selectedAnnouncement.targetAudience && (
                                                <View className="bg-gray-100 rounded-full px-2.5 py-1 mr-2 mb-1 border border-gray-200">
                                                    <Text className="text-gray-600 text-xs font-medium capitalize">
                                                        For:{' '}
                                                        {getAudienceLabel(
                                                            selectedAnnouncement.targetAudience,
                                                        )}
                                                    </Text>
                                                </View>
                                            )}
                                            {selectedAnnouncement.author && (
                                                <View className="bg-emerald-50 rounded-full px-2.5 py-1 mr-2 mb-1 border border-emerald-200">
                                                    <Text className="text-emerald-700 text-xs font-medium">
                                                        By: {selectedAnnouncement.author}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* Info Grid */}
                                        <View className="flex-row flex-wrap mb-4">
                                            <View className="w-1/2 mb-3 pr-2">
                                                <Text className="text-gray-400 text-xs">
                                                    Published
                                                </Text>
                                                <Text className="text-gray-900 font-medium text-sm mt-0.5">
                                                    {formatDateTime(
                                                        selectedAnnouncement.publishDate ||
                                                        selectedAnnouncement.createdAt,
                                                    )}
                                                </Text>
                                            </View>
                                            {selectedAnnouncement.expiryDate && (
                                                <View className="w-1/2 mb-3 pr-2">
                                                    <Text className="text-gray-400 text-xs">
                                                        Valid Until
                                                    </Text>
                                                    <Text className="text-gray-900 font-medium text-sm mt-0.5">
                                                        {formatDate(
                                                            selectedAnnouncement.expiryDate,
                                                        )}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* Content */}
                                        <Text className="text-gray-600 text-sm leading-6 mb-4">
                                            {selectedAnnouncement.content}
                                        </Text>

                                        {/* Attachments */}
                                        {selectedAnnouncement.attachments &&
                                            selectedAnnouncement.attachments.length > 0 && (
                                                <View className="mb-4">
                                                    <Text className="text-gray-900 font-semibold text-sm mb-2">
                                                        Attachments
                                                    </Text>
                                                    {selectedAnnouncement.attachments.map(
                                                        (att, idx) => (
                                                            <TouchableOpacity
                                                                key={idx}
                                                                onPress={() =>
                                                                    handleOpenAttachment(att)
                                                                }
                                                                activeOpacity={0.7}
                                                                className="flex-row items-center p-3 bg-gray-50 rounded-xl border border-gray-200 mb-2">
                                                                <View className="w-8 h-8 bg-blue-100 rounded-lg justify-center items-center">
                                                                    <Icon
                                                                        name="paperclip"
                                                                        size={16}
                                                                        color="#2563eb"
                                                                    />
                                                                </View>
                                                                <Text className="text-blue-600 text-sm font-medium ml-3 flex-1">
                                                                    {att.filename}
                                                                </Text>
                                                                <Icon
                                                                    name="open-in-new"
                                                                    size={16}
                                                                    color="#9ca3af"
                                                                />
                                                            </TouchableOpacity>
                                                        ),
                                                    )}
                                                </View>
                                            )}
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        {/* Footer Button */}
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

export default AnnouncementsScreen;