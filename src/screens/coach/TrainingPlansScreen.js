import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DrawerMenuButton from '../../components/DrawerMenuButton';
import { trainingPlans as initialPlans, generatePlanId } from '../../data/trainingPlans';

const STATUS_FILTERS = ['all', 'draft', 'active', 'completed', 'cancelled'];

const getStatusStyle = status => {
    switch (status) {
        case 'active':
            return { bg: '#dcfce7', text: '#166534', label: 'Active' };
        case 'completed':
            return { bg: '#dbeafe', text: '#1e40af', label: 'Completed' };
        case 'cancelled':
            return { bg: '#fee2e2', text: '#991b1b', label: 'Cancelled' };
        case 'draft':
            return { bg: '#f3f4f6', text: '#374151', label: 'Draft' };
        default:
            return { bg: '#f3f4f6', text: '#374151', label: status || 'Unknown' };
    }
};

const getDifficultyStyle = difficulty => {
    switch (difficulty) {
        case 'Beginner':
            return { bg: '#dcfce7', text: '#166534' };
        case 'Intermediate':
            return { bg: '#fef3c7', text: '#92400e' };
        case 'Advanced':
            return { bg: '#fee2e2', text: '#991b1b' };
        default:
            return { bg: '#f3f4f6', text: '#374151' };
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

const TrainingPlansScreen = ({ navigation }) => {
    const [plans, setPlans] = useState(initialPlans);
    const [filter, setFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    const filteredPlans = plans.filter(plan => {
        if (filter === 'all') return true;
        return plan.status === filter;
    });

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

    const renderPlanCard = ({ item }) => {
        const statusStyle = getStatusStyle(item.status);
        const difficultyStyle = getDifficultyStyle(item.difficulty);

        return (
            <View
                className="bg-white rounded-2xl mx-4 mb-4 shadow-md"
                style={{ elevation: 3 }}>
                {/* Card Header */}
                <View className="p-4 pb-3">
                    <View className="flex-row items-start">
                        {/* Sport Icon */}
                        <View className="w-14 h-14 rounded-xl bg-blue-50 justify-center items-center mr-3">
                            <Icon name="dumbbell" size={24} color="#1e40af" />
                        </View>

                        {/* Title & Badges */}
                        <View className="flex-1">
                            <Text
                                className="text-gray-900 font-bold text-base"
                                numberOfLines={1}>
                                {item.title}
                            </Text>
                            <View className="flex-row flex-wrap items-center mt-1 gap-1">
                                {/* Sport Badge */}
                                <View className="bg-blue-100 px-2 py-0.5 rounded-full">
                                    <Text className="text-blue-700 text-[10px] font-semibold">
                                        {item.sport}
                                    </Text>
                                </View>
                                {/* Difficulty Badge */}
                                <View
                                    className="px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: difficultyStyle.bg }}>
                                    <Text
                                        className="text-[10px] font-semibold"
                                        style={{ color: difficultyStyle.text }}>
                                        {item.difficulty}
                                    </Text>
                                </View>
                                {/* Status Badge */}
                                <View
                                    className="px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: statusStyle.bg }}>
                                    <Text
                                        className="text-[10px] font-semibold capitalize"
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
                            className="text-gray-400 text-xs mt-2"
                            numberOfLines={2}>
                            {item.description}
                        </Text>
                    ) : null}
                </View>

                {/* Goals */}
                {item.goals && item.goals.length > 0 ? (
                    <View className="px-4 pb-2">
                        <View className="flex-row flex-wrap gap-1">
                            {item.goals.map((goal, idx) => (
                                <View key={idx} className="bg-purple-50 px-2 py-0.5 rounded-full">
                                    <Text className="text-purple-700 text-[10px] font-medium">
                                        {goal}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : null}

                {/* Plan Details */}
                <View className="px-4 pb-3">
                    <View className="flex-row flex-wrap">
                        {/* Member */}
                        <View className="flex-row items-center mr-4 mb-2">
                            <Icon name="account-outline" size={14} color="#6b7280" />
                            <Text className="text-gray-500 text-xs ml-1">
                                {item.memberName || 'N/A'}
                            </Text>
                        </View>
                        {/* Duration */}
                        <View className="flex-row items-center mr-4 mb-2">
                            <Icon name="clock-outline" size={14} color="#6b7280" />
                            <Text className="text-gray-500 text-xs ml-1">
                                {item.duration} weeks
                            </Text>
                        </View>
                        {/* Frequency */}
                        {item.frequency ? (
                            <View className="flex-row items-center mr-4 mb-2">
                                <Icon name="calendar-sync" size={14} color="#6b7280" />
                                <Text className="text-gray-500 text-xs ml-1">
                                    {item.frequency}
                                </Text>
                            </View>
                        ) : null}
                        {/* Exercises Count */}
                        {item.exercises?.length > 0 ? (
                            <View className="flex-row items-center mr-4 mb-2">
                                <Icon name="dumbbell" size={14} color="#6b7280" />
                                <Text className="text-gray-500 text-xs ml-1">
                                    {item.exercises.length} exercises
                                </Text>
                            </View>
                        ) : null}
                        {/* Schedule Days */}
                        {item.schedule?.length > 0 ? (
                            <View className="flex-row items-center mr-4 mb-2">
                                <Icon name="calendar-week" size={14} color="#6b7280" />
                                <Text className="text-gray-500 text-xs ml-1">
                                    {item.schedule.length} days/week
                                </Text>
                            </View>
                        ) : null}
                        {/* Diet */}
                        {item.dietRecommendation?.calories ? (
                            <View className="flex-row items-center mr-4 mb-2">
                                <Icon name="food-apple-outline" size={14} color="#22c55e" />
                                <Text className="text-green-600 text-xs font-medium ml-1">
                                    {item.dietRecommendation.calories} kcal/day
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Date Range */}
                    <View className="flex-row items-center mt-1">
                        <Icon name="calendar-range" size={14} color="#6b7280" />
                        <Text className="text-gray-500 text-xs ml-1">
                            {formatDate(item.startDate)} — {formatDate(item.endDate)}
                        </Text>
                    </View>

                    {/* Progress Bar */}
                    {item.stats?.progressPercentage !== undefined && (
                        <View className="mt-3">
                            <View className="flex-row justify-between items-center mb-1">
                                <Text className="text-gray-500 text-xs">Progress</Text>
                                <Text className="text-gray-700 text-xs font-semibold">
                                    {item.stats.progressPercentage}%
                                </Text>
                            </View>
                            <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <View
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${item.stats.progressPercentage}%`,
                                        backgroundColor: item.stats.progressPercentage >= 75 ? '#22c55e' :
                                            item.stats.progressPercentage >= 40 ? '#f59e0b' : '#3b82f6',
                                    }}
                                />
                            </View>
                        </View>
                    )}
                </View>

                {/* Special Considerations */}
                {item.specialConsiderations?.length > 0 ? (
                    <View className="mx-4 mb-3 p-2.5 bg-amber-50 rounded-xl">
                        <View className="flex-row items-center mb-1">
                            <Icon name="alert-circle-outline" size={14} color="#d97706" />
                            <Text className="text-amber-700 text-xs font-semibold ml-1">
                                Considerations
                            </Text>
                        </View>
                        {item.specialConsiderations.slice(0, 2).map((item2, idx) => (
                            <Text key={idx} className="text-amber-600 text-[11px] ml-5">
                                • {item2}
                            </Text>
                        ))}
                        {item.specialConsiderations.length > 2 ? (
                            <Text className="text-amber-500 text-[11px] ml-5">
                                +{item.specialConsiderations.length - 2} more...
                            </Text>
                        ) : null}
                    </View>
                ) : null}

                {/* Action Buttons */}
                <View className="flex-row border-t border-gray-100 px-4 py-3">
                    <TouchableOpacity
                        onPress={() => navigateToEdit(item)}
                        className="flex-1 flex-row items-center justify-center py-2.5 mr-2 border border-blue-200 rounded-xl bg-blue-50">
                        <Icon name="pencil-outline" size={16} color="#2563eb" />
                        <Text className="text-blue-600 font-semibold text-sm ml-1">
                            Edit
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleDeletePlan(item)}
                        className="flex-1 flex-row items-center justify-center py-2.5 border border-red-200 rounded-xl bg-red-50">
                        <Icon name="trash-can-outline" size={16} color="#dc2626" />
                        <Text className="text-red-600 font-semibold text-sm ml-1">
                            Delete
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <LinearGradient
                colors={['#1e3a8a', '#3b82f6']}
                className="px-6 pt-12 pb-6">
                <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                        <DrawerMenuButton />
                        <View className="ml-2">
                            <Text className="text-white font-bold text-2xl">Training Plans</Text>
                            <Text className="text-white/70 text-sm">
                                Create & manage training plans
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={navigateToCreate}
                        className="w-11 h-11 bg-white/20 rounded-full justify-center items-center">
                        <Icon name="plus" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Stats Bar */}
                <View className="flex-row mt-3 bg-white/15 rounded-xl p-3">
                    <View className="flex-1 items-center">
                        <Text className="text-white font-bold text-lg">
                            {plans.length}
                        </Text>
                        <Text className="text-white/70 text-[10px]">Total</Text>
                    </View>
                    <View className="w-px bg-white/30" />
                    <View className="flex-1 items-center">
                        <Text className="text-white font-bold text-lg">
                            {plans.filter(p => p.status === 'active').length}
                        </Text>
                        <Text className="text-white/70 text-[10px]">Active</Text>
                    </View>
                    <View className="w-px bg-white/30" />
                    <View className="flex-1 items-center">
                        <Text className="text-white font-bold text-lg">
                            {plans.filter(p => p.status === 'draft').length}
                        </Text>
                        <Text className="text-white/70 text-[10px]">Draft</Text>
                    </View>
                    <View className="w-px bg-white/30" />
                    <View className="flex-1 items-center">
                        <Text className="text-white font-bold text-lg">
                            {plans.filter(p => p.status === 'completed').length}
                        </Text>
                        <Text className="text-white/70 text-[10px]">Completed</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Filter Tabs */}
            <View className="flex-row px-4 py-3 bg-white shadow-sm" style={{ elevation: 2 }}>
                <FlatList
                    data={STATUS_FILTERS}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item}
                    renderItem={({ item: tab }) => (
                        <TouchableOpacity
                            onPress={() => setFilter(tab)}
                            className={`px-4 py-2 rounded-full mr-2 ${filter === tab ? 'bg-blue-600' : 'bg-gray-100'
                                }`}>
                            <Text
                                className={`font-semibold capitalize text-sm ${filter === tab ? 'text-white' : 'text-gray-500'
                                    }`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Plans List */}
            <FlatList
                data={filteredPlans}
                renderItem={renderPlanCard}
                keyExtractor={item => item._id}
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#1e3a8a']}
                    />
                }
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center mt-20">
                        <Icon name="clipboard-text-outline" size={64} color="#d1d5db" />
                        <Text className="text-gray-400 text-lg mt-4 font-semibold">
                            No training plans found
                        </Text>
                        <Text className="text-gray-300 text-sm mt-1">
                            Tap + to create your first plan
                        </Text>
                    </View>
                }
            />

            {/* Floating Create Button */}
            <TouchableOpacity
                onPress={navigateToCreate}
                activeOpacity={0.8}
                className="absolute bottom-6 right-6"
                style={{ elevation: 6 }}>
                <LinearGradient
                    colors={['#1e3a8a', '#3b82f6']}
                    className="w-14 h-14 rounded-full justify-center items-center shadow-lg">
                    <Icon name="plus" size={28} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

export default TrainingPlansScreen;