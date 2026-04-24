import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    TextInput,
    Alert,
    RefreshControl,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DrawerMenuButton from '../../components/DrawerMenuButton';
import { trainingPlans as initialPlans, generatePlanId } from '../../data/trainingPlans';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STATUS_FILTERS = ['all', 'draft', 'active', 'completed', 'cancelled'];

// ─── Sport Config (matching Dashboard/Members/Sessions pattern) ───
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

const getStatusStyle = status => {
    switch (status) {
        case 'active':
            return { bg: '#dcfce7', text: '#166534', label: 'Active', icon: 'play-circle', gradient: ['#22c55e', '#16a34a'] };
        case 'completed':
            return { bg: '#dbeafe', text: '#1e40af', label: 'Completed', icon: 'check-circle', gradient: ['#3b82f6', '#60a5fa'] };
        case 'cancelled':
            return { bg: '#fee2e2', text: '#991b1b', label: 'Cancelled', icon: 'close-circle', gradient: ['#ef4444', '#dc2626'] };
        case 'draft':
            return { bg: '#f3f4f6', text: '#374151', label: 'Draft', icon: 'pencil-outline', gradient: ['#6b7280', '#9ca3af'] };
        default:
            return { bg: '#f3f4f6', text: '#374151', label: status || 'Unknown', icon: 'help-circle', gradient: ['#6b7280', '#9ca3af'] };
    }
};

const getDifficultyStyle = difficulty => {
    switch (difficulty) {
        case 'Beginner':
            return { bg: '#dcfce7', text: '#166534', icon: 'speedometer-slow' };
        case 'Intermediate':
            return { bg: '#fef3c7', text: '#92400e', icon: 'speedometer-medium' };
        case 'Advanced':
            return { bg: '#fee2e2', text: '#991b1b', icon: 'speedometer' };
        default:
            return { bg: '#f3f4f6', text: '#374151', icon: 'speedometer-slow' };
    }
};

const formatDate = dateStr => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

// ─── Filter Chip Component (matching MembersScreen/SessionsScreen) ───
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
// ─── ENHANCED TRAINING PLAN CARD ───
// ═══════════════════════════════════════════════
const PlanCard = ({ item, onEdit, onDelete }) => {
    const statusStyle = getStatusStyle(item.status);
    const difficultyStyle = getDifficultyStyle(item.difficulty);
    const sportConfig = getSportConfig(item.sport);
    const progressPercentage = item.stats?.progressPercentage || 0;

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
                {/* Top Row: Sport Icon + Info */}
                <View className="flex-row items-start">
                    {/* Sport Icon Badge */}
                    <LinearGradient
                        colors={sportConfig.gradient}
                        className="w-14 h-14 rounded-2xl justify-center items-center"
                        style={{ borderRadius: 16 }}>
                        <Icon name={sportConfig.icon} size={24} color="#fff" />
                    </LinearGradient>

                    {/* Title & Badges */}
                    <View className="flex-1 ml-3.5 min-w-0">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-gray-900 font-bold text-base flex-1 mr-2" numberOfLines={1}>
                                {item.title}
                            </Text>
                        </View>

                        {/* Badges Row */}
                        <View className="flex-row flex-wrap items-center mt-1.5" style={{ gap: 4 }}>
                            {/* Sport Badge */}
                            <View
                                className="flex-row items-center px-2.5 py-1 rounded-full"
                                style={{ backgroundColor: `${sportConfig.color}12` }}>
                                <Icon name={sportConfig.icon} size={10} color={sportConfig.color} />
                                <Text
                                    className="text-[10px] font-bold ml-1"
                                    style={{ color: sportConfig.color }}>
                                    {item.sport}
                                </Text>
                            </View>
                            {/* Difficulty Badge */}
                            <View
                                className="flex-row items-center px-2.5 py-1 rounded-full"
                                style={{ backgroundColor: difficultyStyle.bg }}>
                                <Icon name={difficultyStyle.icon} size={10} color={difficultyStyle.text} />
                                <Text
                                    className="text-[10px] font-bold ml-1"
                                    style={{ color: difficultyStyle.text }}>
                                    {item.difficulty}
                                </Text>
                            </View>
                            {/* Status Badge */}
                            <View
                                className="flex-row items-center px-2.5 py-1 rounded-full"
                                style={{ backgroundColor: statusStyle.bg }}>
                                <View
                                    className="w-1.5 h-1.5 rounded-full mr-1"
                                    style={{ backgroundColor: statusStyle.text }}
                                />
                                <Text
                                    className="text-[10px] font-bold capitalize"
                                    style={{ color: statusStyle.text }}>
                                    {statusStyle.label}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Description */}
                {item.description ? (
                    <Text
                        className="text-gray-400 text-xs mt-2.5 ml-0.5 leading-4"
                        numberOfLines={2}>
                        {item.description}
                    </Text>
                ) : null}

                {/* Goals */}
                {item.goals && item.goals.length > 0 ? (
                    <View className="flex-row flex-wrap mt-2.5" style={{ gap: 4 }}>
                        {item.goals.map((goal, idx) => (
                            <View
                                key={idx}
                                className="flex-row items-center px-2.5 py-1 rounded-full"
                                style={{ backgroundColor: '#f3e8ff' }}>
                                <Icon name="target" size={9} color="#7c3aed" />
                                <Text className="text-purple-700 text-[10px] font-bold ml-1">
                                    {goal}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : null}

                {/* Plan Details Row */}
                <View className="flex-row flex-wrap mt-3 bg-gray-50 rounded-xl p-3" style={{ gap: 2 }}>
                    {/* Member */}
                    <View className="flex-1 items-center" style={{ minWidth: '22%' }}>
                        <View className="flex-row items-center">
                            <Icon name="account-outline" size={14} color="#3b82f6" />
                            <Text className="text-gray-900 font-bold text-xs ml-1" numberOfLines={1}>
                                {item.memberName || 'N/A'}
                            </Text>
                        </View>
                        <Text className="text-gray-400 text-[10px] mt-0.5">Member</Text>
                    </View>
                    <View className="w-px bg-gray-200" />
                    {/* Duration */}
                    <View className="flex-1 items-center" style={{ minWidth: '22%' }}>
                        <View className="flex-row items-center">
                            <Icon name="clock-outline" size={14} color="#22c55e" />
                            <Text className="text-gray-900 font-bold text-xs ml-1">
                                {item.duration}w
                            </Text>
                        </View>
                        <Text className="text-gray-400 text-[10px] mt-0.5">Duration</Text>
                    </View>
                    <View className="w-px bg-gray-200" />
                    {/* Exercises */}
                    <View className="flex-1 items-center" style={{ minWidth: '22%' }}>
                        <View className="flex-row items-center">
                            <Icon name="dumbbell" size={14} color="#8b5cf6" />
                            <Text className="text-gray-900 font-bold text-xs ml-1">
                                {item.exercises?.length || 0}
                            </Text>
                        </View>
                        <Text className="text-gray-400 text-[10px] mt-0.5">Exercises</Text>
                    </View>
                    {/* Schedule */}
                    {item.schedule?.length > 0 ? (
                        <>
                            <View className="w-px bg-gray-200" />
                            <View className="flex-1 items-center" style={{ minWidth: '22%' }}>
                                <View className="flex-row items-center">
                                    <Icon name="calendar-week" size={14} color="#f59e0b" />
                                    <Text className="text-gray-900 font-bold text-xs ml-1">
                                        {item.schedule.length}
                                    </Text>
                                </View>
                                <Text className="text-gray-400 text-[10px] mt-0.5">Days/wk</Text>
                            </View>
                        </>
                    ) : null}
                </View>

                {/* Date Range */}
                <View className="flex-row items-center mt-3 bg-blue-50 rounded-lg px-3 py-2" style={{ borderWidth: 1, borderColor: '#dbeafe' }}>
                    <Icon name="calendar-range" size={14} color="#1e40af" />
                    <Text className="text-blue-800 text-xs ml-1.5 font-medium">
                        {formatDate(item.startDate)} — {formatDate(item.endDate)}
                    </Text>
                </View>

                {/* Frequency */}
                {item.frequency ? (
                    <View className="flex-row items-center mt-2.5">
                        <View className="flex-row items-center bg-green-50 px-3 py-1.5 rounded-full" style={{ borderWidth: 1, borderColor: '#bbf7d0' }}>
                            <Icon name="calendar-sync" size={12} color="#16a34a" />
                            <Text className="text-green-700 text-xs font-bold ml-1">
                                {item.frequency}
                            </Text>
                        </View>
                    </View>
                ) : null}

                {/* Diet Badge */}
                {item.dietRecommendation?.calories ? (
                    <View className="flex-row items-center mt-2.5">
                        <View className="flex-row items-center bg-orange-50 px-3 py-1.5 rounded-full" style={{ borderWidth: 1, borderColor: '#fed7aa' }}>
                            <Icon name="food-apple-outline" size={12} color="#ea580c" />
                            <Text className="text-orange-700 text-xs font-bold ml-1">
                                {item.dietRecommendation.calories} kcal/day
                            </Text>
                        </View>
                    </View>
                ) : null}

                {/* Progress Bar */}
                {item.stats?.progressPercentage !== undefined && (
                    <View className="mt-3">
                        <View className="flex-row items-center justify-between mb-1.5">
                            <Text className="text-gray-400 text-[10px] font-medium">Progress</Text>
                            <Text className="text-gray-900 text-[10px] font-bold">{progressPercentage}%</Text>
                        </View>
                        <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <LinearGradient
                                colors={
                                    progressPercentage >= 75
                                        ? ['#22c55e', '#16a34a']
                                        : progressPercentage >= 40
                                            ? ['#f59e0b', '#d97706']
                                            : sportConfig.gradient
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    height: '100%',
                                    width: `${Math.min(progressPercentage, 100)}%`,
                                    borderRadius: 999,
                                }}
                            />
                        </View>
                    </View>
                )}

                {/* Special Considerations */}
                {item.specialConsiderations?.length > 0 ? (
                    <View className="mt-3 p-3 bg-amber-50 rounded-xl" style={{ borderWidth: 1, borderColor: '#fde68a' }}>
                        <View className="flex-row items-center mb-1.5">
                            <View className="w-6 h-6 rounded-lg bg-amber-100 justify-center items-center mr-2">
                                <Icon name="alert-circle-outline" size={12} color="#d97706" />
                            </View>
                            <Text className="text-amber-800 font-bold text-xs">
                                Considerations
                            </Text>
                        </View>
                        {item.specialConsiderations.slice(0, 2).map((consideration, idx) => (
                            <Text key={idx} className="text-amber-700 text-[11px] ml-8 leading-4">
                                • {consideration}
                            </Text>
                        ))}
                        {item.specialConsiderations.length > 2 ? (
                            <Text className="text-amber-500 text-[11px] ml-8">
                                +{item.specialConsiderations.length - 2} more...
                            </Text>
                        ) : null}
                    </View>
                ) : null}

                {/* Action Buttons */}
                <View className="flex-row mt-4" style={{ gap: 8 }}>
                    <TouchableOpacity
                        onPress={() => onEdit(item)}
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
                            <Icon name="pencil-outline" size={16} color="#fff" />
                            <Text className="text-white font-bold text-sm ml-1.5">Edit</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onDelete(item)}
                        activeOpacity={0.8}
                        className="flex-1"
                        style={{
                            borderRadius: 14,
                            borderWidth: 1.5,
                            borderColor: '#fecaca',
                            backgroundColor: '#fef2f2',
                            paddingVertical: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                        <Icon name="trash-can-outline" size={16} color="#dc2626" />
                        <Text className="text-red-600 font-bold text-sm ml-1.5">Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

// ═══════════════════════════════════════════════
// ─── MAIN TRAINING PLANS SCREEN ───
// ═══════════════════════════════════════════════
const ITEMS_PER_PAGE = 5;

const TrainingPlansScreen = ({ navigation }) => {
    const [plans, setPlans] = useState(initialPlans);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredPlans = useMemo(() => {
        return plans.filter(plan => {
            const matchesFilter = filter === 'all' || plan.status === filter;
            const matchesSearch = !searchQuery.trim() ||
                (plan.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (plan.sport || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (plan.memberName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (plan.difficulty || '').toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [plans, filter, searchQuery]);

    const totalPages = Math.ceil(filteredPlans.length / ITEMS_PER_PAGE);
    const paginatedPlans = filteredPlans.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    // Reset to page 1 when filter or search changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchQuery]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setRefreshing(false);
    }, []);

    const handleDeletePlan = plan => {
        Alert.alert(
            'Delete Training Plan',
            `Are you sure you want to delete "${plan.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setPlans(prev => prev.filter(p => p._id !== plan._id));
                    },
                },
            ],
        );
    };

    const handleCreatePlan = newPlan => {
        const planWithId = {
            ...newPlan,
            _id: generatePlanId(),
            stats: { progressPercentage: 0 },
        };
        setPlans(prev => [planWithId, ...prev]);
    };

    const handleUpdatePlan = (planId, updatedData) => {
        setPlans(prev =>
            prev.map(p =>
                p._id === planId ? { ...p, ...updatedData } : p,
            ),
        );
    };

    const navigateToCreate = () => {
        navigation.navigate('CreateEditTrainingPlan', {
            mode: 'create',
            onSave: handleCreatePlan,
        });
    };

    const navigateToEdit = plan => {
        navigation.navigate('CreateEditTrainingPlan', {
            mode: 'edit',
            plan,
            onSave: data => handleUpdatePlan(plan._id, data),
        });
    };

    // Stats counts
    const draftCount = plans.filter(p => p.status === 'draft').length;
    const activeCount = plans.filter(p => p.status === 'active').length;
    const completedCount = plans.filter(p => p.status === 'completed').length;
    const cancelledCount = plans.filter(p => p.status === 'cancelled').length;

    const filterCounts = {
        all: plans.length,
        draft: draftCount,
        active: activeCount,
        completed: completedCount,
        cancelled: cancelledCount,
    };

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
                    <Text className="text-white font-bold text-xl">Training Plans</Text>
                    <View className="w-10 h-10" />
                </View>

                {/* Subtitle */}
                <View className="px-5 mb-4">
                    <Text className="text-white/60 text-sm">
                        Create & manage training plans • {plans.length} total
                    </Text>
                </View>

                {/* Stats Bar */}
                <View
                    className="mx-5 bg-white/10 rounded-2xl p-4"
                    style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                    <View className="flex-row items-center justify-between">
                        {[
                            { label: 'Total', value: plans.length, icon: 'clipboard-text', color: '#93c5fd' },
                            { label: 'Draft', value: draftCount, icon: 'pencil-outline', color: '#d1d5db' },
                            { label: 'Active', value: activeCount, icon: 'play-circle', color: '#86efac' },
                            { label: 'Completed', value: completedCount, icon: 'check-circle', color: '#93c5fd' },
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
            {/* ─── SEARCH BAR (floating overlap) ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 -mt-5">
                <View
                    className="bg-white rounded-2xl shadow-md"
                    style={{ elevation: 4 }}>
                    <View className="flex-row items-center px-4">
                        <Icon name="magnify" size={22} color="#9ca3af" />
                        <TextInput
                            className="flex-1 py-3.5 px-2.5 text-gray-900 text-sm"
                            placeholder="Search by title, sport, member, difficulty..."
                            placeholderTextColor="#9ca3af"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
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
                <View className="flex-row">
                    {STATUS_FILTERS.map(tab => (
                        <FilterChip
                            key={tab}
                            label={tab}
                            count={filterCounts[tab]}
                            isSelected={filter === tab}
                            onPress={() => setFilter(tab)}
                        />
                    ))}
                </View>
            </View>

            {/* Results Count */}
            {(searchQuery.trim() || filter !== 'all') && (
                <View className="flex-row items-center justify-between px-5 pb-2">
                    <Text className="text-gray-500 text-sm">
                        Found <Text className="text-gray-900 font-bold">{filteredPlans.length}</Text> of {plans.length} plans
                    </Text>
                    {(searchQuery.trim() || filter !== 'all') && (
                        <TouchableOpacity onPress={() => { setFilter('all'); setSearchQuery(''); }} activeOpacity={0.7}>
                            <Text className="text-blue-600 text-xs font-semibold">Reset</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── PLANS LIST ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <FlatList
                data={paginatedPlans}
                renderItem={({ item }) => (
                    <PlanCard
                        item={item}
                        onEdit={navigateToEdit}
                        onDelete={handleDeletePlan}
                    />
                )}
                keyExtractor={item => item._id}
                contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#1e3a8a']}
                        tintColor="#1e3a8a"
                    />
                }
                ListFooterComponent={
                    totalPages > 1 ? (
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
                    ) : null
                }
                ListEmptyComponent={
                    <View className="items-center mt-16 px-6">
                        <View
                            className="w-24 h-24 rounded-full justify-center items-center mb-4"
                            style={{ backgroundColor: '#f0f4ff' }}>
                            <Icon name="clipboard-text-outline" size={48} color="#93c5fd" />
                        </View>
                        <Text className="text-gray-900 font-bold text-lg">
                            No training plans found
                        </Text>
                        <Text className="text-gray-400 text-sm text-center mt-2 leading-5">
                            {searchQuery.trim() || filter !== 'all'
                                ? 'Try adjusting your search or filters to find plans'
                                : 'Tap + to create your first training plan'}
                        </Text>
                        {(searchQuery.trim() || filter !== 'all') && (
                            <TouchableOpacity
                                onPress={() => { setFilter('all'); setSearchQuery(''); }}
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
                }
            />

            {/* Floating Create Button */}
            <TouchableOpacity
                onPress={navigateToCreate}
                activeOpacity={0.8}
                className="absolute bottom-6 right-6"
                style={{ elevation: 8 }}>
                <LinearGradient
                    colors={['#1e3a8a', '#3b82f6']}
                    className="w-14 h-14 rounded-full justify-center items-center"
                    style={{
                        borderRadius: 28,
                        shadowColor: '#1e3a8a',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                    }}>
                    <Icon name="plus" size={28} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

export default TrainingPlansScreen;