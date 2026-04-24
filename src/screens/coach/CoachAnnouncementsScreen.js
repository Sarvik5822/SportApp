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
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DrawerMenuButton from '../../components/DrawerMenuButton';
import { MOCK_ANNOUNCEMENTS, ANNOUNCEMENT_PRIORITIES } from '../../data/announcements';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
                gradient: ['#dc2626', '#ef4444'],
            };
        case 'high':
            return {
                bg: '#fff7ed',
                iconColor: '#ea580c',
                border: '#fdba74',
                badgeBg: '#ea580c',
                badgeText: '#fff',
                label: 'High',
                gradient: ['#ea580c', '#f97316'],
            };
        case 'medium':
            return {
                bg: '#fefce8',
                iconColor: '#ca8a04',
                border: '#fde047',
                badgeBg: '#ca8a04',
                badgeText: '#fff',
                label: 'Medium',
                gradient: ['#ca8a04', '#eab308'],
            };
        default:
            return {
                bg: '#eff6ff',
                iconColor: '#2563eb',
                border: '#93c5fd',
                badgeBg: '#2563eb',
                badgeText: '#fff',
                label: 'Low',
                gradient: ['#2563eb', '#3b82f6'],
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

// ═══════════════════════════════════════════════
// ─── FILTER CHIP COMPONENT (matching Members/Sessions) ───
// ═══════════════════════════════════════════════
const FilterChip = ({ label, isSelected, onPress, count }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            marginRight: 8,
            backgroundColor: isSelected ? '#1e3a8a' : '#fff',
            borderWidth: isSelected ? 0 : 1,
            borderColor: '#e5e7eb',
            flexDirection: 'row',
            alignItems: 'center',
            elevation: isSelected ? 3 : 1,
            shadowColor: isSelected ? '#1e3a8a' : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isSelected ? 0.3 : 0.05,
            shadowRadius: 4,
        }}>
        <Text
            style={{
                fontSize: 13,
                fontWeight: '600',
                color: isSelected ? '#fff' : '#6b7280',
                textTransform: 'capitalize',
            }}>
            {label}
        </Text>
        {count !== undefined && count > 0 && (
            <View
                style={{
                    marginLeft: 6,
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#f3f4f6',
                    borderRadius: 10,
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                    minWidth: 20,
                    alignItems: 'center',
                }}>
                <Text
                    style={{
                        fontSize: 10,
                        fontWeight: '700',
                        color: isSelected ? '#fff' : '#9ca3af',
                    }}>
                    {count}
                </Text>
            </View>
        )}
    </TouchableOpacity>
);

// ═══════════════════════════════════════════════
// ─── ENHANCED ANNOUNCEMENT CARD ───
// ═══════════════════════════════════════════════
const AnnouncementCard = ({ announcement, onViewDetail }) => {
    const config = getPriorityConfig(announcement.priority);
    const dateObj = announcement.publishDate
        ? new Date(announcement.publishDate)
        : announcement.createdAt
            ? new Date(announcement.createdAt)
            : null;

    return (
        <TouchableOpacity
            onPress={() => onViewDetail(announcement)}
            activeOpacity={0.85}
            className="bg-white rounded-2xl mb-3 mx-4 shadow-sm overflow-hidden"
            style={{ elevation: 4 }}>
            {/* Top Color Accent Bar */}
            <LinearGradient
                colors={config.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: 4 }}
            />

            <View className="p-4">
                {/* Top Row: Icon + Info + Date Badge */}
                <View className="flex-row items-start">
                    {/* Priority Icon Badge */}
                    <LinearGradient
                        colors={config.gradient}
                        className="w-14 h-14 rounded-2xl justify-center items-center"
                        style={{ borderRadius: 16 }}>
                        <Icon name="bullhorn" size={24} color="#fff" />
                    </LinearGradient>

                    {/* Title & Badges */}
                    <View className="flex-1 ml-3.5 min-w-0">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-gray-900 font-bold text-base flex-1 mr-2" numberOfLines={2}>
                                {announcement.title}
                            </Text>
                        </View>

                        {/* Badges Row */}
                        <View className="flex-row flex-wrap items-center mt-1.5" style={{ gap: 4 }}>
                            {/* Priority Badge */}
                            {announcement.priority && (
                                <View
                                    className="flex-row items-center px-2.5 py-1 rounded-full"
                                    style={{ backgroundColor: config.bg }}>
                                    <View
                                        className="w-1.5 h-1.5 rounded-full mr-1"
                                        style={{ backgroundColor: config.iconColor }}
                                    />
                                    <Text
                                        className="text-[10px] font-bold capitalize"
                                        style={{ color: config.iconColor }}>
                                        {config.label}
                                    </Text>
                                </View>
                            )}
                            {/* Author Badge */}
                            {announcement.author && (
                                <View className="flex-row items-center px-2.5 py-1 rounded-full bg-gray-100">
                                    <Icon name="account" size={10} color="#6b7280" />
                                    <Text className="text-gray-600 text-[10px] font-bold ml-1">
                                        {announcement.author}
                                    </Text>
                                </View>
                            )}
                            {/* Audience Badge */}
                            {announcement.targetAudience && (
                                <View
                                    className="flex-row items-center px-2.5 py-1 rounded-full"
                                    style={{ backgroundColor: '#e0f2fe' }}>
                                    <Icon name="account-group-outline" size={10} color="#0284c7" />
                                    <Text className="text-[10px] font-bold ml-1" style={{ color: '#0284c7' }}>
                                        {getAudienceLabel(announcement.targetAudience)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Date Badge */}
                    <View className="items-center ml-2 bg-gray-50 rounded-xl px-3 py-2" style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                        <Text className="text-gray-900 font-bold text-lg leading-tight">
                            {dateObj ? dateObj.getDate() : '--'}
                        </Text>
                        <Text className="text-gray-500 text-[10px] font-semibold uppercase">
                            {dateObj
                                ? dateObj.toLocaleDateString('en-IN', { month: 'short' })
                                : ''}
                        </Text>
                    </View>
                </View>

                {/* Content Preview */}
                <Text className="text-gray-400 text-xs mt-2.5 ml-0.5 leading-4" numberOfLines={2}>
                    {announcement.content}
                </Text>

                {/* Details Row */}
                <View className="flex-row flex-wrap mt-3 bg-gray-50 rounded-xl p-3" style={{ gap: 2 }}>
                    {/* Published Date */}
                    <View className="flex-1 items-center" style={{ minWidth: '30%' }}>
                        <View className="flex-row items-center">
                            <Icon name="calendar" size={14} color="#3b82f6" />
                            <Text className="text-gray-900 font-bold text-xs ml-1" numberOfLines={1}>
                                {formatDate(announcement.publishDate || announcement.createdAt)}
                            </Text>
                        </View>
                        <Text className="text-gray-400 text-[10px] mt-0.5">Published</Text>
                    </View>
                    <View className="w-px bg-gray-200" />
                    {/* Expiry */}
                    <View className="flex-1 items-center" style={{ minWidth: '30%' }}>
                        <View className="flex-row items-center">
                            <Icon name="calendar-clock" size={14} color={announcement.expiryDate ? '#f59e0b' : '#d1d5db'} />
                            <Text className="text-gray-900 font-bold text-xs ml-1" numberOfLines={1}>
                                {announcement.expiryDate ? formatDate(announcement.expiryDate) : 'No Expiry'}
                            </Text>
                        </View>
                        <Text className="text-gray-400 text-[10px] mt-0.5">Valid Until</Text>
                    </View>
                    <View className="w-px bg-gray-200" />
                    {/* Attachments */}
                    <View className="flex-1 items-center" style={{ minWidth: '20%' }}>
                        <View className="flex-row items-center">
                            <Icon name="paperclip" size={14} color="#8b5cf6" />
                            <Text className="text-gray-900 font-bold text-xs ml-1">
                                {announcement.attachments?.length || 0}
                            </Text>
                        </View>
                        <Text className="text-gray-400 text-[10px] mt-0.5">Files</Text>
                    </View>
                </View>

                {/* Action Button */}
                <View className="flex-row mt-4" style={{ gap: 8 }}>
                    <TouchableOpacity
                        onPress={() => onViewDetail(announcement)}
                        activeOpacity={0.8}
                        className="flex-1">
                        <LinearGradient
                            colors={['#1e3a8a', '#3b82f6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                borderRadius: 14,
                                paddingVertical: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                            <Icon name="eye-outline" size={16} color="#fff" />
                            <Text className="text-white font-bold text-sm ml-1.5">Read More</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// ═══════════════════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════
const ITEMS_PER_PAGE = 10;

const CoachAnnouncementsScreen = ({ navigation }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

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
    const totalPages = Math.ceil(filteredAnnouncements.length / ITEMS_PER_PAGE);
    const paginatedAnnouncements = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAnnouncements.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredAnnouncements, currentPage]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
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

    // Stats counts
    const urgentCount = MOCK_ANNOUNCEMENTS.filter(a => a.priority === 'urgent').length;
    const highCount = MOCK_ANNOUNCEMENTS.filter(a => a.priority === 'high').length;
    const mediumCount = MOCK_ANNOUNCEMENTS.filter(a => a.priority === 'medium').length;
    const lowCount = MOCK_ANNOUNCEMENTS.filter(a => a.priority === 'low').length;

    const filterCounts = {
        all: MOCK_ANNOUNCEMENTS.length,
        urgent: urgentCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
    };

    const hasActiveFilters = searchTerm.trim() !== '' || filterPriority !== 'all';

    // ─── Loading State (matching Dashboard pattern) ───
    if (loading && announcements.length === 0) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <View className="w-16 h-16 rounded-2xl bg-blue-50 justify-center items-center mb-4">
                    <ActivityIndicator size="large" color="#1e3a8a" />
                </View>
                <Text className="text-gray-900 font-bold text-base">Loading Announcements</Text>
                <Text className="text-gray-400 mt-1 text-sm">Fetching latest updates...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* ═══════════════════════════════════════════════ */}
            {/* ─── HEADER (matching Dashboard/Members/Sessions pattern) ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <LinearGradient
                colors={['#0f172a', '#1e3a8a', '#3b82f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingTop: 48, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
                {/* Top Bar */}
                <View className="flex-row justify-between items-center px-5 mb-5">
                    <DrawerMenuButton />
                    <Text className="text-white font-bold text-xl">Announcements</Text>
                    <TouchableOpacity
                        onPress={onRefresh}
                        disabled={loading || refreshing}
                        className="w-10 h-10 bg-white/15 rounded-full justify-center items-center">
                        <Icon
                            name="refresh"
                            size={22}
                            color="#fff"
                            style={loading || refreshing ? { opacity: 0.5 } : {}}
                        />
                    </TouchableOpacity>
                </View>

                {/* Subtitle */}
                <View className="px-5 mb-4">
                    <Text className="text-white/60 text-sm">
                        Stay updated with the latest news • {MOCK_ANNOUNCEMENTS.length} total
                    </Text>
                </View>

                {/* Stats Bar */}
                <View
                    className="mx-5 bg-white/10 rounded-2xl p-4"
                    style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                    <View className="flex-row items-center justify-between">
                        {[
                            { label: 'Total', value: MOCK_ANNOUNCEMENTS.length, icon: 'bullhorn', color: '#93c5fd' },
                            { label: 'Urgent', value: urgentCount, icon: 'alert-circle', color: '#fca5a5' },
                            { label: 'High', value: highCount, icon: 'arrow-up-circle', color: '#fdba74' },
                            { label: 'Medium', value: mediumCount, icon: 'minus-circle', color: '#fde047' },
                        ].map((stat, idx) => (
                            <React.Fragment key={stat.label}>
                                {idx > 0 && <View className="w-px h-12 bg-white/10" />}
                                <View className="items-center flex-1">
                                    <View
                                        className="w-10 h-10 rounded-xl justify-center items-center mb-1.5"
                                        style={{ backgroundColor: `${stat.color}20` }}>
                                        <Icon name={stat.icon} size={18} color={stat.color} />
                                    </View>
                                    <Text className="text-white font-bold text-sm">{stat.value}</Text>
                                    <Text className="text-white/40 text-[10px] mt-0.5">{stat.label}</Text>
                                </View>
                            </React.Fragment>
                        ))}
                    </View>
                </View>
            </LinearGradient>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── SEARCH BAR (floating overlap like Members/Sessions) ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 -mt-5">
                <View
                    className="bg-white rounded-2xl shadow-md"
                    style={{ elevation: 4 }}>
                    <View className="flex-row items-center px-4">
                        <Icon name="magnify" size={22} color="#9ca3af" />
                        <TextInput
                            className="flex-1 py-3.5 px-2.5 text-gray-900 text-sm"
                            placeholder="Search announcements..."
                            placeholderTextColor="#9ca3af"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                        {searchTerm.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchTerm('')} activeOpacity={0.7}>
                                <View className="w-7 h-7 rounded-full bg-gray-100 justify-center items-center">
                                    <Icon name="close" size={14} color="#9ca3af" />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── FILTER CHIPS ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 pt-4 pb-2">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {ANNOUNCEMENT_PRIORITIES.map(priority => (
                        <FilterChip
                            key={priority.key}
                            label={priority.label}
                            count={filterCounts[priority.key]}
                            isSelected={filterPriority === priority.key}
                            onPress={() => setFilterPriority(priority.key)}
                        />
                    ))}
                </ScrollView>
            </View>

            {/* Results Count */}
            {hasActiveFilters && (
                <View className="flex-row items-center justify-between px-5 pb-2">
                    <Text className="text-gray-500 text-sm">
                        Found <Text className="text-gray-900 font-bold">{filteredAnnouncements.length}</Text> of {MOCK_ANNOUNCEMENTS.length} announcements
                    </Text>
                    <TouchableOpacity onPress={() => { setFilterPriority('all'); setSearchTerm(''); }} activeOpacity={0.7}>
                        <Text className="text-blue-600 text-xs font-semibold">Reset</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── ANNOUNCEMENTS LIST ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#1e3a8a']}
                        tintColor="#1e3a8a"
                    />
                }>
                <View className="pt-2">
                    {paginatedAnnouncements.length === 0 ? (
                        <View className="items-center mt-16 px-6">
                            <View
                                className="w-24 h-24 rounded-full justify-center items-center mb-4"
                                style={{ backgroundColor: '#f0f4ff' }}>
                                <Icon name="bullhorn-outline" size={48} color="#93c5fd" />
                            </View>
                            <Text className="text-gray-900 font-bold text-lg">
                                No announcements found
                            </Text>
                            <Text className="text-gray-400 text-sm text-center mt-2 leading-5">
                                {hasActiveFilters
                                    ? 'Try adjusting your search or filters to find announcements'
                                    : 'No announcements available at this time'}
                            </Text>
                            {hasActiveFilters && (
                                <TouchableOpacity
                                    onPress={() => { setFilterPriority('all'); setSearchTerm(''); }}
                                    activeOpacity={0.7}
                                    className="mt-5">
                                    <LinearGradient
                                        colors={['#1e3a8a', '#3b82f6']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{
                                            borderRadius: 14,
                                            paddingHorizontal: 24,
                                            paddingVertical: 12,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}>
                                        <Icon name="filter-remove" size={16} color="#fff" />
                                        <Text className="text-white font-bold text-sm ml-2">
                                            Clear Filters
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        paginatedAnnouncements.map(announcement => (
                            <AnnouncementCard
                                key={announcement._id}
                                announcement={announcement}
                                onViewDetail={handleViewDetail}
                            />
                        ))
                    )}
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── PAGINATION (matching Sessions/Members pattern) ─── */}
                {/* ═══════════════════════════════════════════════ */}
                {totalPages > 1 && (
                    <View className="flex-row items-center justify-center mx-4 mb-4 mt-2" style={{ gap: 8 }}>
                        {/* Previous Button */}
                        <TouchableOpacity
                            onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            activeOpacity={0.7}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                backgroundColor: currentPage === 1 ? '#f3f4f6' : '#1e3a8a',
                                justifyContent: 'center',
                                alignItems: 'center',
                                elevation: currentPage === 1 ? 0 : 3,
                            }}>
                            <Icon name="chevron-left" size={20} color={currentPage === 1 ? '#d1d5db' : '#fff'} />
                        </TouchableOpacity>

                        {/* Page Numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <TouchableOpacity
                                key={page}
                                onPress={() => setCurrentPage(page)}
                                activeOpacity={0.7}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 12,
                                    backgroundColor: currentPage === page ? '#1e3a8a' : '#fff',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderWidth: currentPage === page ? 0 : 1,
                                    borderColor: '#e5e7eb',
                                    elevation: currentPage === page ? 3 : 1,
                                }}>
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: '700',
                                        color: currentPage === page ? '#fff' : '#6b7280',
                                    }}>
                                    {page}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        {/* Next Button */}
                        <TouchableOpacity
                            onPress={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            activeOpacity={0.7}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#1e3a8a',
                                justifyContent: 'center',
                                alignItems: 'center',
                                elevation: currentPage === totalPages ? 0 : 3,
                            }}>
                            <Icon name="chevron-right" size={20} color={currentPage === totalPages ? '#d1d5db' : '#fff'} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Bottom Spacing */}
                <View className="h-8" />
            </ScrollView>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── ANNOUNCEMENT DETAIL MODAL (Enhanced) ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showDetailModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDetailModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl" style={{ maxHeight: '90%' }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {selectedAnnouncement && (() => {
                                const modalConfig = getPriorityConfig(selectedAnnouncement.priority);
                                return (
                                    <View>
                                        {/* Header Gradient (matching Dashboard/Sessions header style) */}
                                        <LinearGradient
                                            colors={['#0f172a', '#1e3a8a', '#3b82f6']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={{
                                                paddingTop: 20,
                                                paddingBottom: 28,
                                                borderTopLeftRadius: 24,
                                                borderTopRightRadius: 24,
                                            }}>
                                            {/* Top Bar */}
                                            <View className="flex-row items-center justify-between px-5 mb-4">
                                                {/* Priority Badge */}
                                                {selectedAnnouncement.priority && (
                                                    <View
                                                        className="flex-row items-center px-3 py-1.5 rounded-full"
                                                        style={{ backgroundColor: `${modalConfig.iconColor}30` }}>
                                                        <View
                                                            className="w-2 h-2 rounded-full mr-1.5"
                                                            style={{ backgroundColor: modalConfig.badgeBg === '#dc2626' ? '#fca5a5' : modalConfig.badgeBg === '#ea580c' ? '#fdba74' : '#93c5fd' }}
                                                        />
                                                        <Text className="text-white text-xs font-bold capitalize">
                                                            {modalConfig.label} Priority
                                                        </Text>
                                                    </View>
                                                )}
                                                <TouchableOpacity
                                                    onPress={() => setShowDetailModal(false)}
                                                    className="w-8 h-8 bg-white/15 rounded-full justify-center items-center">
                                                    <Icon name="close" size={18} color="#fff" />
                                                </TouchableOpacity>
                                            </View>

                                            {/* Icon & Title */}
                                            <View className="px-5">
                                                <View className="flex-row items-center mb-3">
                                                    <LinearGradient
                                                        colors={modalConfig.gradient}
                                                        style={{ width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}>
                                                        <Icon name="bullhorn" size={24} color="#fff" />
                                                    </LinearGradient>
                                                    <View className="ml-3 flex-1">
                                                        <Text className="text-white font-bold text-xl" numberOfLines={3}>
                                                            {selectedAnnouncement.title}
                                                        </Text>
                                                    </View>
                                                </View>

                                                {/* Meta Badges */}
                                                <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                                                    {selectedAnnouncement.author && (
                                                        <View className="flex-row items-center bg-white/15 px-3 py-1.5 rounded-full">
                                                            <Icon name="account" size={12} color="#93c5fd" />
                                                            <Text className="text-white/80 text-xs font-medium ml-1.5">
                                                                {selectedAnnouncement.author}
                                                            </Text>
                                                        </View>
                                                    )}
                                                    {selectedAnnouncement.targetAudience && (
                                                        <View className="flex-row items-center bg-white/15 px-3 py-1.5 rounded-full">
                                                            <Icon name="account-group-outline" size={12} color="#93c5fd" />
                                                            <Text className="text-white/80 text-xs font-medium ml-1.5">
                                                                {getAudienceLabel(selectedAnnouncement.targetAudience)}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        </LinearGradient>

                                        {/* Content Section */}
                                        <View className="px-5 pt-5">
                                            {/* Info Grid (matching MemberProfile pattern) */}
                                            <View
                                                className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
                                                style={{ elevation: 3 }}>
                                                <View className="flex-row items-center mb-4">
                                                    <View className="w-9 h-9 rounded-xl justify-center items-center mr-2.5" style={{ backgroundColor: '#3b82f612' }}>
                                                        <Icon name="information-outline" size={18} color="#3b82f6" />
                                                    </View>
                                                    <Text className="text-gray-900 font-bold text-lg">Details</Text>
                                                </View>

                                                <View className="flex-row flex-wrap">
                                                    <View className="w-1/2 mb-3 pr-2">
                                                        <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">Published</Text>
                                                        <Text className="text-gray-900 font-semibold text-sm mt-0.5">
                                                            {formatDateTime(
                                                                selectedAnnouncement.publishDate ||
                                                                selectedAnnouncement.createdAt,
                                                            )}
                                                        </Text>
                                                    </View>
                                                    {selectedAnnouncement.expiryDate && (
                                                        <View className="w-1/2 mb-3 pr-2">
                                                            <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">Valid Until</Text>
                                                            <Text className="text-gray-900 font-semibold text-sm mt-0.5">
                                                                {formatDate(selectedAnnouncement.expiryDate)}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>

                                            {/* Content Card */}
                                            <View
                                                className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
                                                style={{ elevation: 3 }}>
                                                <View className="flex-row items-center mb-4">
                                                    <View className="w-9 h-9 rounded-xl justify-center items-center mr-2.5" style={{ backgroundColor: '#22c55e12' }}>
                                                        <Icon name="text-box-outline" size={18} color="#22c55e" />
                                                    </View>
                                                    <Text className="text-gray-900 font-bold text-lg">Content</Text>
                                                </View>
                                                <Text className="text-gray-600 text-sm leading-6">
                                                    {selectedAnnouncement.content}
                                                </Text>
                                            </View>

                                            {/* Attachments Card */}
                                            {selectedAnnouncement.attachments &&
                                                selectedAnnouncement.attachments.length > 0 && (
                                                    <View
                                                        className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
                                                        style={{ elevation: 3 }}>
                                                        <View className="flex-row items-center mb-4">
                                                            <View className="w-9 h-9 rounded-xl justify-center items-center mr-2.5" style={{ backgroundColor: '#8b5cf612' }}>
                                                                <Icon name="paperclip" size={18} color="#8b5cf6" />
                                                            </View>
                                                            <Text className="text-gray-900 font-bold text-lg">
                                                                Attachments ({selectedAnnouncement.attachments.length})
                                                            </Text>
                                                        </View>
                                                        {selectedAnnouncement.attachments.map(
                                                            (att, idx) => (
                                                                <TouchableOpacity
                                                                    key={idx}
                                                                    onPress={() => handleOpenAttachment(att)}
                                                                    activeOpacity={0.7}
                                                                    className="flex-row items-center p-3.5 bg-gray-50 rounded-xl mb-2"
                                                                    style={{ borderLeftWidth: 3, borderLeftColor: '#8b5cf6' }}>
                                                                    <View className="w-10 h-10 bg-purple-100 rounded-xl justify-center items-center">
                                                                        <Icon
                                                                            name="file-document-outline"
                                                                            size={18}
                                                                            color="#8b5cf6"
                                                                        />
                                                                    </View>
                                                                    <View className="ml-3 flex-1">
                                                                        <Text className="text-gray-900 text-sm font-semibold" numberOfLines={1}>
                                                                            {att.filename}
                                                                        </Text>
                                                                        <Text className="text-gray-400 text-[10px] mt-0.5">
                                                                            Tap to open
                                                                        </Text>
                                                                    </View>
                                                                    <View className="w-8 h-8 bg-gray-100 rounded-lg justify-center items-center">
                                                                        <Icon
                                                                            name="open-in-new"
                                                                            size={14}
                                                                            color="#9ca3af"
                                                                        />
                                                                    </View>
                                                                </TouchableOpacity>
                                                            ),
                                                        )}
                                                    </View>
                                                )}
                                        </View>
                                    </View>
                                );
                            })()}
                        </ScrollView>

                        {/* Footer Button (matching CreateEditSession action buttons) */}
                        <View className="px-5 pb-6 pt-3 border-t border-gray-100">
                            <TouchableOpacity
                                onPress={() => setShowDetailModal(false)}
                                activeOpacity={0.8}>
                                <LinearGradient
                                    colors={['#1e3a8a', '#3b82f6']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{
                                        borderRadius: 14,
                                        paddingVertical: 14,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                    <Icon name="close-circle-outline" size={18} color="#fff" />
                                    <Text className="text-white font-bold text-base ml-2">Close</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default CoachAnnouncementsScreen;