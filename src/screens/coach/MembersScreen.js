import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ProfileAvatar from '../../components/ProfileAvatar';
import DrawerMenuButton from '../../components/DrawerMenuButton';
import { members } from '../../data/members';
import { coachProfile } from '../../data/user';

// ─── Status Badge Colors ───
const getStatusStyle = status => {
    switch (status) {
        case 'active':
            return { bg: '#dcfce7', text: '#166534', label: 'Active', icon: 'check-circle', gradient: ['#22c55e', '#16a34a'] };
        case 'pending':
            return { bg: '#fef3c7', text: '#92400e', label: 'Pending', icon: 'clock-outline', gradient: ['#f59e0b', '#d97706'] };
        case 'suspended':
            return { bg: '#fee2e2', text: '#991b1b', label: 'Suspended', icon: 'alert-circle', gradient: ['#ef4444', '#dc2626'] };
        default:
            return { bg: '#f3f4f6', text: '#374151', label: status, icon: 'help-circle', gradient: ['#6b7280', '#9ca3af'] };
    }
};

// ─── Membership Badge Colors ───
const getMembershipStyle = type => {
    switch (type) {
        case 'Platinum':
            return { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe', icon: 'diamond-stone', gradient: ['#6366f1', '#818cf8'] };
        case 'Gold':
            return { bg: '#fef3c7', text: '#92400e', border: '#fde68a', icon: 'star', gradient: ['#f59e0b', '#fbbf24'] };
        case 'Silver':
            return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb', icon: 'shield', gradient: ['#6b7280', '#9ca3af'] };
        case 'Basic':
            return { bg: '#e0f2fe', text: '#075985', border: '#bae6fd', icon: 'account', gradient: ['#0ea5e9', '#38bdf8'] };
        default:
            return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb', icon: 'account', gradient: ['#6b7280', '#9ca3af'] };
    }
};

// ─── Sport Color Mapping ───
const getSportConfig = sport => {
    const configs = {
        Karate: { color: '#ef4444', icon: 'karate', gradient: ['#ef4444', '#f97316'] },
        Badminton: { color: '#22c55e', icon: 'badminton', gradient: ['#22c55e', '#10b981'] },
        Swimming: { color: '#3b82f6', icon: 'swim', gradient: ['#3b82f6', '#06b6d4'] },
        Boxing: { color: '#f59e0b', icon: 'boxing-glove', gradient: ['#f59e0b', '#ef4444'] },
        Weightlifting: { color: '#8b5cf6', icon: 'weight-lifter', gradient: ['#8b5cf6', '#6366f1'] },
        Yoga: { color: '#ec4899', icon: 'yoga', gradient: ['#ec4899', '#f472b6'] },
        Tennis: { color: '#06b6d4', icon: 'tennis', gradient: ['#06b6d4', '#22d3ee'] },
        default: { color: '#6b7280', icon: 'dumbbell', gradient: ['#6b7280', '#9ca3af'] },
    };
    return configs[sport] || configs.default;
};

// ─── Filter Chip Component ───
const FilterChip = ({ label, isSelected, onPress, count }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            marginRight: 8,
            marginBottom: 8,
            backgroundColor: isSelected ? '#1e3a8a' : '#fff',
            borderWidth: isSelected ? 0 : 1,
            borderColor: '#e5e7eb',
            flexDirection: 'row',
            alignItems: 'center',
        }}>
        <Text
            style={{
                fontSize: 13,
                fontWeight: '600',
                color: isSelected ? '#fff' : '#6b7280',
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

// ─── Section Title Component ───
const SectionTitle = ({ title, icon, iconColor = '#1e3a8a' }) => (
    <View className="flex-row items-center mb-3">
        <View
            className="w-8 h-8 rounded-lg justify-center items-center mr-2.5"
            style={{ backgroundColor: `${iconColor}12` }}>
            <Icon name={icon} size={16} color={iconColor} />
        </View>
        <Text className="text-gray-900 font-bold text-base">{title}</Text>
    </View>
);

// ═══════════════════════════════════════════════
// ─── ENHANCED MEMBER CARD ───
// ═══════════════════════════════════════════════
const MemberCard = ({ member, onViewProfile }) => {
    const statusStyle = getStatusStyle(member.status);
    const membershipStyle = getMembershipStyle(member.membershipType);
    const sportConfig = getSportConfig(member.sport);
    const attendanceRate = member.stats?.attendanceRate || 0;
    const streak = member.stats?.streak || 0;

    return (
        <View
            className="bg-white rounded-2xl mb-3 mx-4 shadow-sm overflow-hidden"
            style={{ elevation: 4 }}>
            {/* Top Color Accent Bar */}
            <LinearGradient
                colors={sportConfig.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: 4 }}
            />

            <View className="p-4">
                {/* Top Row: Avatar + Info + Status */}
                <View className="flex-row items-start">
                    {/* Avatar with sport badge */}
                    <View>
                        <View style={{ borderWidth: 2, borderColor: `${sportConfig.color}30`, borderRadius: 36 }}>
                            <ProfileAvatar name={member.name} size="medium" />
                        </View>
                        {/* Sport Mini Badge */}
                        <View
                            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full justify-center items-center"
                            style={{ backgroundColor: sportConfig.color }}>
                            <Icon name={sportConfig.icon} size={14} color="#fff" />
                        </View>
                    </View>

                    {/* Member Info */}
                    <View className="flex-1 ml-3.5 min-w-0">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-gray-900 font-bold text-base flex-1 mr-2" numberOfLines={1}>
                                {member.name}
                            </Text>
                            {/* Status Badge */}
                            <View
                                className="flex-row items-center px-2.5 py-1 rounded-full"
                                style={{ backgroundColor: statusStyle.bg }}>
                                <View
                                    className="w-1.5 h-1.5 rounded-full mr-1.5"
                                    style={{ backgroundColor: statusStyle.text }}
                                />
                                <Text
                                    className="text-[10px] font-bold"
                                    style={{ color: statusStyle.text }}>
                                    {statusStyle.label}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row items-center mt-1">
                            <Icon name="email-outline" size={12} color="#9ca3af" />
                            <Text className="text-gray-400 text-xs ml-1 flex-1" numberOfLines={1}>
                                {member.email}
                            </Text>
                        </View>

                        {/* Membership & Sport Badges */}
                        <View className="flex-row items-center mt-2.5 flex-wrap">
                            <View
                                className="flex-row items-center px-2.5 py-1 rounded-full mr-2 mb-1"
                                style={{
                                    backgroundColor: membershipStyle.bg,
                                    borderWidth: 1,
                                    borderColor: membershipStyle.border,
                                }}>
                                <Icon name={membershipStyle.icon} size={10} color={membershipStyle.text} />
                                <Text
                                    className="text-[10px] font-bold ml-1"
                                    style={{ color: membershipStyle.text }}>
                                    {member.membershipType}
                                </Text>
                            </View>
                            <View
                                className="flex-row items-center px-2.5 py-1 rounded-full mb-1"
                                style={{ backgroundColor: `${sportConfig.color}12` }}>
                                <Icon name={sportConfig.icon} size={10} color={sportConfig.color} />
                                <Text
                                    className="text-[10px] font-bold ml-1"
                                    style={{ color: sportConfig.color }}>
                                    {member.sport}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Stats Row */}
                <View className="flex-row mt-4 bg-gray-50 rounded-xl p-3" style={{ gap: 2 }}>
                    <View className="flex-1 items-center">
                        <View className="flex-row items-center">
                            <Icon name="map-marker-check" size={14} color="#3b82f6" />
                            <Text className="text-gray-900 font-bold text-sm ml-1">
                                {member.stats?.totalVisits || 0}
                            </Text>
                        </View>
                        <Text className="text-gray-400 text-[10px] mt-0.5">Total Visits</Text>
                    </View>
                    <View className="w-px bg-gray-200" />
                    <View className="flex-1 items-center">
                        <View className="flex-row items-center">
                            <Icon name="calendar-month" size={14} color="#22c55e" />
                            <Text className="text-green-600 font-bold text-sm ml-1">
                                {member.stats?.thisMonthVisits || 0}
                            </Text>
                        </View>
                        <Text className="text-gray-400 text-[10px] mt-0.5">This Month</Text>
                    </View>
                    <View className="w-px bg-gray-200" />
                    <View className="flex-1 items-center">
                        <View className="flex-row items-center">
                            <Icon name="percent" size={14} color="#8b5cf6" />
                            <Text className="text-purple-600 font-bold text-sm ml-1">
                                {attendanceRate}%
                            </Text>
                        </View>
                        <Text className="text-gray-400 text-[10px] mt-0.5">Attendance</Text>
                    </View>
                    <View className="w-px bg-gray-200" />
                    <View className="flex-1 items-center">
                        <View className="flex-row items-center">
                            <Text className="text-xs">🔥</Text>
                            <Text className="text-orange-500 font-bold text-sm ml-1">
                                {streak}
                            </Text>
                        </View>
                        <Text className="text-gray-400 text-[10px] mt-0.5">Streak</Text>
                    </View>
                </View>

                {/* Attendance Progress Bar */}
                <View className="mt-3">
                    <View className="flex-row items-center justify-between mb-1.5">
                        <Text className="text-gray-400 text-[10px] font-medium">Attendance Rate</Text>
                        <Text className="text-gray-900 text-[10px] font-bold">{attendanceRate}%</Text>
                    </View>
                    <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <LinearGradient
                            colors={attendanceRate >= 80 ? ['#22c55e', '#16a34a'] : attendanceRate >= 60 ? ['#f59e0b', '#d97706'] : ['#ef4444', '#dc2626']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                height: '100%',
                                width: `${Math.min(attendanceRate, 100)}%`,
                                borderRadius: 999,
                            }}
                        />
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row mt-4" style={{ gap: 8 }}>
                    <TouchableOpacity
                        onPress={() => onViewProfile(member)}
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
                            <Text className="text-white font-bold text-sm ml-1.5">View Profile</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

// ═══════════════════════════════════════════════
// ─── MAIN MEMBERS SCREEN ───
// ═══════════════════════════════════════════════
const ITEMS_PER_PAGE = 5;

const MembersScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [membershipFilter, setMembershipFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Filter members assigned to this coach
    const myMembers = members.filter(m => m.coachId === coachProfile.id);

    // Apply search and filters
    const filteredMembers = useMemo(() => {
        let result = myMembers;

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                m =>
                    m.name.toLowerCase().includes(query) ||
                    m.email.toLowerCase().includes(query) ||
                    m.sport.toLowerCase().includes(query),
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter(m => m.status === statusFilter);
        }

        // Membership filter
        if (membershipFilter !== 'all') {
            result = result.filter(m => m.membershipType === membershipFilter);
        }

        return result;
    }, [myMembers, searchQuery, statusFilter, membershipFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
    const paginatedMembers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredMembers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredMembers, currentPage]);

    // Reset to page 1 when filters or search change
    const handleSearchChange = (text) => {
        setSearchQuery(text);
        setCurrentPage(1);
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handleMembershipFilter = (value) => {
        setMembershipFilter(value);
        setCurrentPage(1);
    };

    // Stats summary
    const activeCount = myMembers.filter(m => m.status === 'active').length;
    const pendingCount = myMembers.filter(m => m.status === 'pending').length;
    const suspendedCount = myMembers.filter(m => m.status === 'suspended').length;

    const handleViewProfile = member => {
        navigation.navigate('MemberProfile', { member });
    };

    const clearFilters = () => {
        setStatusFilter('all');
        setMembershipFilter('all');
        setSearchQuery('');
        setCurrentPage(1);
    };

    const hasActiveFilters =
        statusFilter !== 'all' || membershipFilter !== 'all' || searchQuery.trim() !== '';

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setRefreshing(false);
    }, []);

    // Membership counts
    const membershipCounts = useMemo(() => ({
        Platinum: myMembers.filter(m => m.membershipType === 'Platinum').length,
        Gold: myMembers.filter(m => m.membershipType === 'Gold').length,
        Silver: myMembers.filter(m => m.membershipType === 'Silver').length,
        Basic: myMembers.filter(m => m.membershipType === 'Basic').length,
    }), [myMembers]);

    return (
        <View className="flex-1 bg-gray-50">
            {/* ═══════════════════════════════════════════════ */}
            {/* ─── HEADER ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <LinearGradient
                colors={['#0f172a', '#1e3a8a', '#3b82f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingTop: 48, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
                {/* Top Bar */}
                <View className="flex-row justify-between items-center px-5 mb-5">
                    <DrawerMenuButton />
                    <Text className="text-white font-bold text-xl">My Members</Text>
                    <TouchableOpacity
                        onPress={() => setShowFilters(!showFilters)}
                        className="w-10 h-10 bg-white/15 rounded-full justify-center items-center">
                        <Icon
                            name={showFilters ? 'filter-remove' : 'filter-variant'}
                            size={22}
                            color="#fff"
                        />
                        {hasActiveFilters && (
                            <View className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full justify-center items-center">
                                <Text className="text-white text-[8px] font-bold">!</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Summary Info */}
                <View className="px-5 mb-4">
                    <Text className="text-white/60 text-sm">
                        Managing {myMembers.length} members • {activeCount} active
                    </Text>
                </View>


            </LinearGradient>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── SEARCH BAR ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 -mt-5">
                <View
                    className="bg-white rounded-2xl shadow-md"
                    style={{ elevation: 4 }}>
                    <View className="flex-row items-center px-4">
                        <Icon name="magnify" size={22} color="#9ca3af" />
                        <TextInput
                            className="flex-1 py-3.5 px-2.5 text-gray-900 text-sm"
                            placeholder="Search by name, email, sport..."
                            placeholderTextColor="#9ca3af"
                            value={searchQuery}
                            onChangeText={handleSearchChange}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => { setSearchQuery(''); setCurrentPage(1); }} activeOpacity={0.7}>
                                <View className="w-7 h-7 rounded-full bg-gray-100 justify-center items-center">
                                    <Icon name="close" size={14} color="#9ca3af" />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── FILTER PANEL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            {showFilters && (
                <View className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm" style={{ elevation: 3 }}>
                    {/* Status Filters */}
                    <SectionTitle title="Status" icon="account-check" iconColor="#22c55e" />
                    <View className="flex-row flex-wrap mb-2">
                        {[
                            { value: 'all', label: 'All', count: myMembers.length },
                            { value: 'active', label: 'Active', count: activeCount },
                            { value: 'pending', label: 'Pending', count: pendingCount },
                            { value: 'suspended', label: 'Suspended', count: suspendedCount },
                        ].map(item => (
                            <FilterChip
                                key={item.value}
                                label={item.label}
                                count={item.count}
                                isSelected={statusFilter === item.value}
                                onPress={() => handleStatusFilter(item.value)}
                            />
                        ))}
                    </View>

                    {/* Membership Filters */}
                    <SectionTitle title="Membership" icon="card-account-details" iconColor="#f59e0b" />
                    <View className="flex-row flex-wrap mb-2">
                        {[
                            { value: 'all', label: 'All', count: myMembers.length },
                            { value: 'Platinum', label: 'Platinum', count: membershipCounts.Platinum },
                            { value: 'Gold', label: 'Gold', count: membershipCounts.Gold },
                            { value: 'Silver', label: 'Silver', count: membershipCounts.Silver },
                            { value: 'Basic', label: 'Basic', count: membershipCounts.Basic },
                        ].map(item => (
                            <FilterChip
                                key={item.value}
                                label={item.label}
                                count={item.count}
                                isSelected={membershipFilter === item.value}
                                onPress={() => handleMembershipFilter(item.value)}
                            />
                        ))}
                    </View>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <TouchableOpacity
                            onPress={clearFilters}
                            activeOpacity={0.7}
                            className="flex-row items-center justify-center py-2.5 mt-1 bg-red-50 rounded-xl">
                            <Icon name="filter-remove" size={16} color="#dc2626" />
                            <Text className="text-red-600 font-semibold text-sm ml-1.5">
                                Clear All Filters
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── RESULTS COUNT ─── */}
            {/* ═══════════════════════════════════════════════ */}
            {hasActiveFilters && (
                <View className="flex-row items-center justify-between px-5 pt-3 pb-1">
                    <Text className="text-gray-500 text-sm">
                        Found <Text className="text-gray-900 font-bold">{filteredMembers.length}</Text> of {myMembers.length} members
                    </Text>
                    <TouchableOpacity onPress={clearFilters} activeOpacity={0.7}>
                        <Text className="text-blue-600 text-xs font-semibold">Reset</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── MEMBERS LIST ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <ScrollView
                className="flex-1 pt-3"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#1e3a8a']}
                        tintColor="#1e3a8a"
                    />
                }>
                {filteredMembers.length > 0 ? (
                    <>
                        {paginatedMembers.map(member => (
                            <MemberCard
                                key={member.id}
                                member={member}
                                onViewProfile={handleViewProfile}
                            />
                        ))}

                        {/* ─── PAGINATION CONTROLS ─── */}
                        {totalPages > 1 && (
                            <View className="mx-4 mt-2 mb-4 bg-white rounded-2xl p-3 shadow-sm" style={{ elevation: 3 }}>
                                <View className="flex-row items-center justify-between">
                                    {/* Previous Button */}
                                    <TouchableOpacity
                                        onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        activeOpacity={0.7}
                                        disabled={currentPage === 1}
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 12,
                                            backgroundColor: currentPage === 1 ? '#f3f4f6' : '#1e3a8a',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}>
                                        <Icon
                                            name="chevron-left"
                                            size={22}
                                            color={currentPage === 1 ? '#d1d5db' : '#fff'}
                                        />
                                    </TouchableOpacity>

                                    {/* Page Numbers */}
                                    <View className="flex-row items-center" style={{ gap: 4 }}>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(page => {
                                                // Show first, last, current, and adjacent pages
                                                if (page === 1 || page === totalPages) return true;
                                                if (Math.abs(page - currentPage) <= 1) return true;
                                                return false;
                                            })
                                            .reduce((acc, page, idx, arr) => {
                                                // Add ellipsis between non-consecutive pages
                                                if (idx > 0 && page - arr[idx - 1] > 1) {
                                                    acc.push({ type: 'ellipsis', key: `ellipsis-${page}` });
                                                }
                                                acc.push({ type: 'page', value: page, key: `page-${page}` });
                                                return acc;
                                            }, [])
                                            .map(item => {
                                                if (item.type === 'ellipsis') {
                                                    return (
                                                        <Text key={item.key} className="text-gray-400 text-sm px-1">
                                                            •••
                                                        </Text>
                                                    );
                                                }
                                                const isActive = item.value === currentPage;
                                                return (
                                                    <TouchableOpacity
                                                        key={item.key}
                                                        onPress={() => setCurrentPage(item.value)}
                                                        activeOpacity={0.7}
                                                        style={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: 10,
                                                            backgroundColor: isActive ? '#1e3a8a' : 'transparent',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}>
                                                        <Text
                                                            style={{
                                                                fontSize: 14,
                                                                fontWeight: isActive ? '700' : '500',
                                                                color: isActive ? '#fff' : '#6b7280',
                                                            }}>
                                                            {item.value}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                    </View>

                                    {/* Next Button */}
                                    <TouchableOpacity
                                        onPress={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        activeOpacity={0.7}
                                        disabled={currentPage === totalPages}
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 12,
                                            backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#1e3a8a',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}>
                                        <Icon
                                            name="chevron-right"
                                            size={22}
                                            color={currentPage === totalPages ? '#d1d5db' : '#fff'}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Page Info */}
                                <Text className="text-gray-400 text-[11px] text-center mt-2 font-medium">
                                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredMembers.length)} of {filteredMembers.length} members
                                </Text>
                            </View>
                        )}
                    </>
                ) : (
                    <View className="items-center mt-16 px-6">
                        <View
                            className="w-24 h-24 rounded-full justify-center items-center mb-4"
                            style={{ backgroundColor: '#f0f4ff' }}>
                            <Icon name="account-search" size={48} color="#93c5fd" />
                        </View>
                        <Text className="text-gray-900 font-bold text-lg">
                            No members found
                        </Text>
                        <Text className="text-gray-400 text-sm text-center mt-2 leading-5">
                            {hasActiveFilters
                                ? 'Try adjusting your search or filters to find members'
                                : 'No members are assigned to you yet'}
                        </Text>
                        {hasActiveFilters && (
                            <TouchableOpacity
                                onPress={clearFilters}
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
                )}
                <View className="h-8" />
            </ScrollView>
        </View>
    );
};

export default MembersScreen;