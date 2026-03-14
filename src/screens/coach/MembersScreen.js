import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ProfileAvatar from '../../components/ProfileAvatar';
import { members } from '../../data/members';
import { coachProfile } from '../../data/user';

// ─── Status Badge Colors ───
const getStatusStyle = status => {
    switch (status) {
        case 'active':
            return { bg: '#dcfce7', text: '#166534', label: 'Active' };
        case 'pending':
            return { bg: '#fef3c7', text: '#92400e', label: 'Pending' };
        case 'suspended':
            return { bg: '#fee2e2', text: '#991b1b', label: 'Suspended' };
        default:
            return { bg: '#f3f4f6', text: '#374151', label: status };
    }
};

// ─── Membership Badge Colors ───
const getMembershipStyle = type => {
    switch (type) {
        case 'Platinum':
            return { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' };
        case 'Gold':
            return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
        case 'Silver':
            return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
        case 'Basic':
            return { bg: '#e0f2fe', text: '#075985', border: '#bae6fd' };
        default:
            return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
    }
};

// ─── Filter Chip Component ───
const FilterChip = ({ label, isSelected, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className={`px-4 py-2 rounded-full mr-2 mb-2 ${isSelected ? '' : 'border border-gray-200'
            }`}
        style={
            isSelected
                ? { backgroundColor: '#1e3a8a' }
                : { backgroundColor: '#fff' }
        }>
        <Text
            className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-600'
                }`}>
            {label}
        </Text>
    </TouchableOpacity>
);

// ─── Member Card Component ───
const MemberCard = ({ member, onViewProfile, onMessage }) => {
    const statusStyle = getStatusStyle(member.status);
    const membershipStyle = getMembershipStyle(member.membershipType);

    return (
        <View
            className="bg-white rounded-2xl p-4 mb-3 mx-4 shadow-sm"
            style={{ elevation: 3 }}>
            {/* Top Row: Avatar + Info */}
            <View className="flex-row items-start">
                <ProfileAvatar name={member.name} size="medium" />
                <View className="flex-1 ml-3 min-w-0">
                    <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>
                        {member.name}
                    </Text>
                    <Text className="text-gray-400 text-sm" numberOfLines={1}>
                        {member.email}
                    </Text>
                    <View className="flex-row items-center mt-2 flex-wrap">
                        {/* Membership Badge */}
                        <View
                            className="px-2.5 py-1 rounded-full mr-2 mb-1"
                            style={{
                                backgroundColor: membershipStyle.bg,
                                borderWidth: 1,
                                borderColor: membershipStyle.border,
                            }}>
                            <Text
                                className="text-xs font-bold"
                                style={{ color: membershipStyle.text }}>
                                {member.membershipType}
                            </Text>
                        </View>
                        {/* Status Badge */}
                        <View
                            className="px-2.5 py-1 rounded-full mb-1"
                            style={{ backgroundColor: statusStyle.bg }}>
                            <Text
                                className="text-xs font-semibold"
                                style={{ color: statusStyle.text }}>
                                {statusStyle.label}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Stats Row */}
            <View className="mt-4 pt-3 border-t border-gray-100">
                <View className="flex-row justify-between mb-2">
                    <View className="flex-row items-center">
                        <Icon name="map-marker-check" size={14} color="#6b7280" />
                        <Text className="text-gray-500 text-sm ml-1">Total Visits</Text>
                    </View>
                    <Text className="text-gray-900 font-bold text-sm">
                        {member.stats?.totalVisits || 0}
                    </Text>
                </View>
                <View className="flex-row justify-between">
                    <View className="flex-row items-center">
                        <Icon name="calendar-month" size={14} color="#6b7280" />
                        <Text className="text-gray-500 text-sm ml-1">This Month</Text>
                    </View>
                    <Text className="text-green-600 font-bold text-sm">
                        {member.stats?.thisMonthVisits || 0} visits
                    </Text>
                </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row mt-4 gap-2">
                <TouchableOpacity
                    onPress={() => onViewProfile(member)}
                    activeOpacity={0.8}
                    className="flex-1">
                    <LinearGradient
                        colors={['#1e3a8a', '#3b82f6']}
                        className="rounded-xl py-3 flex-row items-center justify-center">
                        <Icon name="eye" size={16} color="#fff" />
                        <Text className="text-white font-bold text-sm ml-1.5">View</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onMessage(member)}
                    activeOpacity={0.7}
                    className="w-12 border border-gray-200 rounded-xl justify-center items-center">
                    <Icon name="message-text-outline" size={20} color="#1e3a8a" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

// ═══════════════════════════════════════════════
// ─── MAIN MEMBERS SCREEN ───
// ═══════════════════════════════════════════════
const MembersScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [membershipFilter, setMembershipFilter] = useState('all');

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

    // Stats summary
    const activeCount = myMembers.filter(m => m.status === 'active').length;
    const pendingCount = myMembers.filter(m => m.status === 'pending').length;

    const handleViewProfile = member => {
        navigation.navigate('MemberProfile', { member });
    };

    const handleMessage = member => {
        // In a real app, this would navigate to messages
        console.log('Message member:', member.name);
    };

    const clearFilters = () => {
        setStatusFilter('all');
        setMembershipFilter('all');
        setSearchQuery('');
    };

    const hasActiveFilters =
        statusFilter !== 'all' || membershipFilter !== 'all' || searchQuery.trim() !== '';

    return (
        <View className="flex-1 bg-gray-50">
            {/* ─── Header ─── */}
            <LinearGradient
                colors={['#1e3a8a', '#3b82f6']}
                className="px-6 pt-12 pb-6">
                <Text className="text-white font-bold text-2xl">My Members</Text>
                <Text className="text-white/80 mt-1">
                    {myMembers.length} total • {activeCount} active • {pendingCount} pending
                </Text>
            </LinearGradient>

            {/* ─── Search & Filter Bar ─── */}
            <View className="px-4 py-3 bg-white shadow-sm" style={{ elevation: 2 }}>
                <View className="flex-row items-center">
                    {/* Search Input */}
                    <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 mr-3">
                        <Icon name="magnify" size={20} color="#9ca3af" />
                        <TextInput
                            className="flex-1 py-3 px-2 text-gray-900"
                            placeholder="Search by name, email, sport..."
                            placeholderTextColor="#9ca3af"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Icon name="close-circle" size={18} color="#9ca3af" />
                            </TouchableOpacity>
                        )}
                    </View>
                    {/* Filter Toggle */}
                    <TouchableOpacity
                        onPress={() => setShowFilters(!showFilters)}
                        activeOpacity={0.7}
                        className="w-11 h-11 rounded-xl justify-center items-center"
                        style={{
                            backgroundColor: showFilters || hasActiveFilters ? '#1e3a8a' : '#f3f4f6',
                        }}>
                        <Icon
                            name="filter-variant"
                            size={22}
                            color={showFilters || hasActiveFilters ? '#fff' : '#6b7280'}
                        />
                    </TouchableOpacity>
                </View>

                {/* ─── Filter Panel ─── */}
                {showFilters && (
                    <View className="mt-3 pt-3 border-t border-gray-100">
                        {/* Status Filters */}
                        <Text className="text-gray-700 font-semibold text-sm mb-2">
                            Status
                        </Text>
                        <View className="flex-row flex-wrap mb-3">
                            {[
                                { value: 'all', label: 'All Status' },
                                { value: 'active', label: 'Active' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'suspended', label: 'Suspended' },
                            ].map(item => (
                                <FilterChip
                                    key={item.value}
                                    label={item.label}
                                    isSelected={statusFilter === item.value}
                                    onPress={() => setStatusFilter(item.value)}
                                />
                            ))}
                        </View>

                        {/* Membership Filters */}
                        <Text className="text-gray-700 font-semibold text-sm mb-2">
                            Membership Type
                        </Text>
                        <View className="flex-row flex-wrap mb-2">
                            {[
                                { value: 'all', label: 'All' },
                                { value: 'Platinum', label: 'Platinum' },
                                { value: 'Gold', label: 'Gold' },
                                { value: 'Silver', label: 'Silver' },
                                { value: 'Basic', label: 'Basic' },
                            ].map(item => (
                                <FilterChip
                                    key={item.value}
                                    label={item.label}
                                    isSelected={membershipFilter === item.value}
                                    onPress={() => setMembershipFilter(item.value)}
                                />
                            ))}
                        </View>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <TouchableOpacity
                                onPress={clearFilters}
                                activeOpacity={0.7}
                                className="flex-row items-center justify-center py-2">
                                <Icon name="close" size={16} color="#dc2626" />
                                <Text className="text-red-600 font-semibold text-sm ml-1">
                                    Clear All Filters
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            {/* ─── Results Count ─── */}
            {hasActiveFilters && (
                <View className="px-4 py-2">
                    <Text className="text-gray-500 text-sm">
                        Showing {filteredMembers.length} of {myMembers.length} members
                    </Text>
                </View>
            )}

            {/* ─── Members List ─── */}
            <ScrollView className="flex-1 pt-2">
                {filteredMembers.length > 0 ? (
                    filteredMembers.map(member => (
                        <MemberCard
                            key={member.id}
                            member={member}
                            onViewProfile={handleViewProfile}
                            onMessage={handleMessage}
                        />
                    ))
                ) : (
                    <View className="items-center mt-20 px-6">
                        <View className="w-20 h-20 rounded-full bg-gray-100 justify-center items-center mb-4">
                            <Icon name="account-search" size={40} color="#d1d5db" />
                        </View>
                        <Text className="text-gray-900 font-bold text-lg">
                            No members found
                        </Text>
                        <Text className="text-gray-400 text-sm text-center mt-2">
                            {hasActiveFilters
                                ? 'Try adjusting your search or filters'
                                : 'No members are assigned to you yet'}
                        </Text>
                        {hasActiveFilters && (
                            <TouchableOpacity
                                onPress={clearFilters}
                                activeOpacity={0.7}
                                className="mt-4">
                                <LinearGradient
                                    colors={['#1e3a8a', '#3b82f6']}
                                    className="px-6 py-3 rounded-xl">
                                    <Text className="text-white font-bold text-sm">
                                        Clear Filters
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                <View className="h-6" />
            </ScrollView>
        </View>
    );
};

export default MembersScreen;