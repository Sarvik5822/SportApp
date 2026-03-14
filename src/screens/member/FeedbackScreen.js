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
import {
    CATEGORIES,
    DROPDOWN_CATEGORIES,
    TEXT_TARGET_CATEGORIES,
    TARGET_PLACEHOLDERS,
    MOCK_TARGETS,
    MOCK_FEEDBACK_STATS,
    MOCK_MY_FEEDBACK,
} from '../../data/feedback';

// ─── Helpers ───
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const getStatusConfig = (status) => {
    switch (status) {
        case 'resolved':
            return {
                label: 'Resolved',
                bg: '#dcfce7',
                text: '#16a34a',
                icon: 'check-circle',
            };
        case 'reviewed':
            return {
                label: 'Reviewed',
                bg: '#dbeafe',
                text: '#2563eb',
                icon: 'eye-check',
            };
        case 'pending':
            return {
                label: 'Pending',
                bg: '#fef9c3',
                text: '#ca8a04',
                icon: 'clock-outline',
            };
        default:
            return {
                label: status || 'Unknown',
                bg: '#f3f4f6',
                text: '#6b7280',
                icon: 'help-circle-outline',
            };
    }
};

const getCategoryIcon = (category) => {
    const found = CATEGORIES.find(c => c.key === category);
    return found ? found.icon : 'help-circle-outline';
};

const getCategoryLabel = (category) => {
    const found = CATEGORIES.find(c => c.key === category);
    return found ? found.label : category;
};

// ─── Star Rating Component ───
const StarRating = ({ value, onChange, size = 28, interactive = false }) => {
    return (
        <View className="flex-row" style={{ gap: 4 }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                    key={star}
                    onPress={() => interactive && onChange && onChange(star)}
                    activeOpacity={interactive ? 0.7 : 1}
                    disabled={!interactive}>
                    <Icon
                        name={star <= value ? 'star' : 'star-outline'}
                        size={size}
                        color={star <= value ? '#eab308' : '#d1d5db'}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
};

// ─── Component ───
const FeedbackScreen = ({ navigation }) => {
    const [feedbackList, setFeedbackList] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Modals
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    // Target dropdown state
    const [targets, setTargets] = useState([]);
    const [loadingTargets, setLoadingTargets] = useState(false);
    const [showTargetPicker, setShowTargetPicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    // Form
    const [form, setForm] = useState({
        category: '',
        rating: 0,
        subject: '',
        message: '',
        targetId: '',
        targetName: '',
    });

    // ─── Data Fetching (Mock) ───
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 600));
            setFeedbackList([...MOCK_MY_FEEDBACK]);
            setStats({ ...MOCK_FEEDBACK_STATS });
        } catch (error) {
            Alert.alert('Error', 'Failed to load feedback');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    // ─── Target Fetching (Mock) ───
    const fetchTargets = useCallback(async (category) => {
        if (!DROPDOWN_CATEGORIES.includes(category)) {
            setTargets([]);
            return;
        }
        try {
            setLoadingTargets(true);
            await new Promise(resolve => setTimeout(resolve, 400));
            setTargets(MOCK_TARGETS[category] || []);
        } catch (error) {
            setTargets([]);
        } finally {
            setLoadingTargets(false);
        }
    }, []);

    // ─── Handlers ───
    const handleCategoryChange = (category) => {
        setForm(prev => ({
            ...prev,
            category,
            targetId: '',
            targetName: '',
        }));
        setShowCategoryPicker(false);
        fetchTargets(category);
    };

    const handleTargetSelect = (target) => {
        setForm(prev => ({
            ...prev,
            targetId: target._id,
            targetName: target.name,
        }));
        setShowTargetPicker(false);
    };

    const resetForm = () => {
        setForm({
            category: '',
            rating: 0,
            subject: '',
            message: '',
            targetId: '',
            targetName: '',
        });
        setTargets([]);
    };

    const handleSubmit = async () => {
        if (!form.category) {
            Alert.alert('Error', 'Please select a category');
            return;
        }
        if (form.rating === 0) {
            Alert.alert('Error', 'Please select a rating');
            return;
        }
        if (!form.subject.trim()) {
            Alert.alert('Error', 'Please enter a subject');
            return;
        }
        if (!form.message.trim()) {
            Alert.alert('Error', 'Please enter your feedback message');
            return;
        }
        if (DROPDOWN_CATEGORIES.includes(form.category) && !form.targetId && targets.length > 0) {
            Alert.alert('Error', `Please select a ${getCategoryLabel(form.category).toLowerCase()}`);
            return;
        }

        try {
            setSubmitting(true);
            await new Promise(resolve => setTimeout(resolve, 1000));

            const newFeedback = {
                _id: `fb_new_${Date.now()}`,
                category: form.category,
                rating: form.rating,
                subject: form.subject,
                message: form.message,
                status: 'pending',
                targetName: form.targetName || '',
                createdAt: new Date().toISOString(),
                adminResponse: null,
            };

            setFeedbackList(prev => [newFeedback, ...prev]);
            setStats(prev =>
                prev
                    ? {
                        ...prev,
                        total: prev.total + 1,
                        pending: prev.pending + 1,
                    }
                    : prev,
            );

            Alert.alert('Success', 'Feedback submitted successfully!');
            setShowSubmitModal(false);
            resetForm();
        } catch (error) {
            Alert.alert('Error', 'Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setFeedbackList(prev => prev.filter(fb => fb._id !== id));
            setStats(prev =>
                prev
                    ? {
                        ...prev,
                        total: Math.max(0, prev.total - 1),
                        pending: Math.max(0, prev.pending - 1),
                    }
                    : prev,
            );
            Alert.alert('Success', 'Feedback deleted');
            setShowDeleteConfirm(null);
        } catch (error) {
            Alert.alert('Error', 'Failed to delete feedback');
        }
    };

    const handleViewDetail = (fb) => {
        setSelectedFeedback(fb);
        setShowDetailModal(true);
    };

    const handleModalClose = () => {
        resetForm();
        setShowSubmitModal(false);
    };

    // ─── Stats Config ───
    const statsConfig = useMemo(
        () => [
            {
                label: 'Total',
                value: stats?.total?.toString() || '0',
                icon: 'message-text-outline',
                color: '#6b7280',
            },
            {
                label: 'Avg Rating',
                value: stats?.averageRating?.toFixed(1) || '0.0',
                icon: 'star',
                color: '#eab308',
                isStar: true,
            },
            {
                label: 'Pending',
                value: stats?.pending?.toString() || '0',
                icon: 'clock-outline',
                color: '#ca8a04',
            },
            {
                label: 'Resolved',
                value: stats?.resolved?.toString() || '0',
                icon: 'check-circle',
                color: '#16a34a',
            },
        ],
        [stats],
    );

    // ─── Feedback Card ───
    const FeedbackCard = ({ fb }) => {
        const statusCfg = getStatusConfig(fb.status);

        return (
            <TouchableOpacity
                onPress={() => handleViewDetail(fb)}
                activeOpacity={0.8}
                className="bg-white rounded-2xl mb-4 overflow-hidden"
                style={{ elevation: 3 }}>
                {/* Top Color Bar */}
                <View
                    className="h-1.5"
                    style={{ backgroundColor: statusCfg.text }}
                />

                <View className="p-4">
                    {/* Header Row */}
                    <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-row items-start flex-1 mr-3">
                            <View
                                className="w-10 h-10 rounded-full justify-center items-center"
                                style={{ backgroundColor: statusCfg.bg }}>
                                <Icon
                                    name={getCategoryIcon(fb.category)}
                                    size={20}
                                    color={statusCfg.text}
                                />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text
                                    className="text-gray-900 font-bold text-base"
                                    numberOfLines={1}>
                                    {fb.subject}
                                </Text>
                                <View className="flex-row items-center flex-wrap mt-1">
                                    {/* Status Badge */}
                                    <View
                                        className="rounded-full px-2 py-0.5 mr-2 mb-1"
                                        style={{ backgroundColor: statusCfg.bg }}>
                                        <Text
                                            className="text-[10px] font-bold"
                                            style={{ color: statusCfg.text }}>
                                            {statusCfg.label}
                                        </Text>
                                    </View>
                                    {/* Category Badge */}
                                    <View className="bg-gray-100 rounded-full px-2 py-0.5 mr-2 mb-1 border border-gray-200">
                                        <Text className="text-gray-500 text-[10px] font-medium capitalize">
                                            {getCategoryLabel(fb.category)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Delete button for pending */}
                        {fb.status === 'pending' && (
                            <TouchableOpacity
                                onPress={() => setShowDeleteConfirm(fb._id)}
                                activeOpacity={0.7}
                                className="w-8 h-8 rounded-full bg-red-50 justify-center items-center">
                                <Icon name="delete-outline" size={18} color="#ef4444" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Star Rating */}
                    <View className="mb-2">
                        <StarRating value={fb.rating} size={16} />
                    </View>

                    {/* Meta Info */}
                    <View className="flex-row items-center flex-wrap mb-2">
                        <View className="flex-row items-center mr-3">
                            <Icon name="calendar" size={12} color="#9ca3af" />
                            <Text className="text-gray-400 text-xs ml-1">
                                {formatDate(fb.createdAt)}
                            </Text>
                        </View>
                        {fb.targetName ? (
                            <View className="flex-row items-center">
                                <Icon
                                    name={
                                        fb.category === 'coach'
                                            ? 'account'
                                            : fb.category === 'facility'
                                                ? 'office-building'
                                                : 'tag'
                                    }
                                    size={12}
                                    color="#9ca3af"
                                />
                                <Text className="text-gray-400 text-xs ml-1">
                                    {fb.targetName}
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Message Preview */}
                    <Text className="text-gray-500 text-sm leading-5" numberOfLines={2}>
                        {fb.message}
                    </Text>

                    {/* Admin Response Indicator */}
                    {fb.adminResponse && (
                        <View className="flex-row items-center mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                            <Icon name="reply" size={14} color="#2563eb" />
                            <Text className="text-blue-600 text-xs font-medium ml-1.5 flex-1" numberOfLines={1}>
                                Staff responded
                                {fb.respondedBy ? ` — ${fb.respondedBy.name}` : ''}
                            </Text>
                        </View>
                    )}

                    {/* Read More */}
                    <TouchableOpacity
                        onPress={() => handleViewDetail(fb)}
                        activeOpacity={0.7}
                        className="flex-row items-center self-start mt-2">
                        <Text className="text-emerald-600 text-sm font-semibold">
                            View details
                        </Text>
                        <Icon name="chevron-right" size={16} color="#059669" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    // ─── Loading State ───
    if (loading && feedbackList.length === 0) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#059669" />
                <Text className="text-gray-500 mt-3">Loading feedback...</Text>
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
                                Feedback & Ratings
                            </Text>
                            <Text className="text-white/80 text-sm">
                                Share your experience and help us improve
                            </Text>
                        </View>
                    </View>
                    <View className="flex-row" style={{ gap: 8 }}>
                        <TouchableOpacity
                            onPress={onRefresh}
                            disabled={loading || refreshing}
                            className="w-10 h-10 bg-white/20 rounded-full justify-center items-center">
                            <Icon name="refresh" size={22} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowSubmitModal(true)}
                            className="w-10 h-10 bg-white/20 rounded-full justify-center items-center">
                            <Icon name="plus" size={24} color="#fff" />
                        </TouchableOpacity>
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
                {/* ─── Stats Grid ─── */}
                {stats && (
                    <View className="px-2 mt-4">
                        <View className="flex-row flex-wrap">
                            {statsConfig.map(stat => (
                                <View key={stat.label} className="w-1/2 p-2">
                                    <View
                                        className="bg-white rounded-xl p-4 items-center"
                                        style={{ elevation: 3 }}>
                                        <View className="flex-row items-center justify-center">
                                            <Text className="text-gray-900 font-bold text-2xl">
                                                {stat.value}
                                            </Text>
                                            {stat.isStar && (
                                                <Icon
                                                    name="star"
                                                    size={20}
                                                    color="#eab308"
                                                    style={{ marginLeft: 4 }}
                                                />
                                            )}
                                        </View>
                                        <View className="flex-row items-center mt-1">
                                            <Icon
                                                name={stat.icon}
                                                size={14}
                                                color={stat.color}
                                            />
                                            <Text className="text-gray-500 text-xs ml-1">
                                                {stat.label}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* ─── Submit Feedback Button ─── */}
                <View className="px-4 mt-4">
                    <TouchableOpacity
                        onPress={() => setShowSubmitModal(true)}
                        activeOpacity={0.8}>
                        <LinearGradient
                            colors={['#059669', '#10b981']}
                            className="rounded-2xl p-4 flex-row items-center justify-center"
                            style={{ elevation: 3 }}>
                            <Icon name="plus-circle" size={22} color="#fff" />
                            <Text className="text-white font-bold text-base ml-2">
                                Submit New Feedback
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* ─── Feedback History Header ─── */}
                <View className="px-4 mt-6 mb-3">
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 bg-emerald-100 rounded-lg justify-center items-center">
                            <Icon name="message-text-outline" size={18} color="#059669" />
                        </View>
                        <Text className="text-gray-900 font-bold text-base ml-2">
                            My Feedback History
                        </Text>
                        <View className="bg-emerald-500 rounded-full px-2 py-0.5 ml-2">
                            <Text className="text-white text-[10px] font-bold">
                                {feedbackList.length}
                            </Text>
                        </View>
                    </View>
                    <Text className="text-gray-400 text-xs mt-1 ml-10">
                        Your submitted feedback and their status
                    </Text>
                </View>

                {/* ─── Feedback List ─── */}
                <View className="px-4">
                    {feedbackList.length === 0 ? (
                        <View
                            className="bg-white rounded-2xl p-8 items-center"
                            style={{ elevation: 2 }}>
                            <Icon
                                name="message-text-outline"
                                size={48}
                                color="#d1d5db"
                            />
                            <Text className="text-gray-900 font-semibold text-base mt-3">
                                No feedback submitted yet
                            </Text>
                            <Text className="text-gray-400 text-sm text-center mt-1">
                                Share your experience to help us improve
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowSubmitModal(true)}
                                activeOpacity={0.8}
                                className="mt-4">
                                <LinearGradient
                                    colors={['#059669', '#10b981']}
                                    className="rounded-xl px-6 py-3 flex-row items-center">
                                    <Icon name="plus" size={18} color="#fff" />
                                    <Text className="text-white font-bold text-sm ml-1.5">
                                        Submit Your First Feedback
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        feedbackList.map(fb => (
                            <FeedbackCard key={fb._id} fb={fb} />
                        ))
                    )}
                </View>

                {/* Bottom Spacing */}
                <View className="h-8" />
            </ScrollView>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── SUBMIT FEEDBACK MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showSubmitModal}
                transparent
                animationType="slide"
                onRequestClose={handleModalClose}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '90%' }}>
                        {/* Modal Header */}
                        <View className="flex-row justify-between items-center mb-2">
                            <View className="flex-row items-center flex-1">
                                <View className="w-10 h-10 bg-emerald-100 rounded-full justify-center items-center">
                                    <Icon name="message-plus" size={22} color="#059669" />
                                </View>
                                <View className="ml-3 flex-1">
                                    <Text className="text-gray-900 font-bold text-lg">
                                        Submit Feedback
                                    </Text>
                                    <Text className="text-gray-400 text-xs">
                                        Share your experience to help us improve
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={handleModalClose}>
                                <Icon name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            className="mt-4">
                            {/* Category Selector */}
                            <Text className="text-gray-700 font-medium text-sm mb-2">
                                Category *
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowCategoryPicker(true)}
                                activeOpacity={0.7}
                                className="flex-row items-center p-4 bg-gray-50 rounded-xl border border-gray-200 mb-4">
                                {form.category ? (
                                    <View className="flex-row items-center flex-1">
                                        <Icon
                                            name={getCategoryIcon(form.category)}
                                            size={20}
                                            color="#059669"
                                        />
                                        <Text className="text-gray-900 font-medium text-sm ml-2 capitalize">
                                            {getCategoryLabel(form.category)}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text className="text-gray-400 text-sm flex-1">
                                        Select category
                                    </Text>
                                )}
                                <Icon name="chevron-down" size={20} color="#9ca3af" />
                            </TouchableOpacity>

                            {/* Dynamic Target Field */}
                            {form.category &&
                                form.category !== 'other' &&
                                DROPDOWN_CATEGORIES.includes(form.category) && (
                                    <View className="mb-4">
                                        <Text className="text-gray-700 font-medium text-sm mb-2">
                                            {form.category === 'coach'
                                                ? 'Select Coach *'
                                                : 'Select Facility *'}
                                        </Text>
                                        {loadingTargets ? (
                                            <View className="flex-row items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                <ActivityIndicator
                                                    size="small"
                                                    color="#059669"
                                                />
                                                <Text className="text-gray-400 text-sm ml-2">
                                                    Loading{' '}
                                                    {form.category === 'coach'
                                                        ? 'coaches'
                                                        : 'facilities'}
                                                    ...
                                                </Text>
                                            </View>
                                        ) : targets.length === 0 ? (
                                            <View className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                                                <Text className="text-yellow-700 text-xs">
                                                    {form.category === 'coach'
                                                        ? 'No coach assigned to your membership.'
                                                        : 'No facilities found in your plan.'}
                                                </Text>
                                            </View>
                                        ) : (
                                            <TouchableOpacity
                                                onPress={() => setShowTargetPicker(true)}
                                                activeOpacity={0.7}
                                                className="flex-row items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                {form.targetId ? (
                                                    <View className="flex-row items-center flex-1">
                                                        <Icon
                                                            name={
                                                                form.category === 'coach'
                                                                    ? 'account-tie'
                                                                    : 'office-building'
                                                            }
                                                            size={20}
                                                            color="#059669"
                                                        />
                                                        <Text className="text-gray-900 font-medium text-sm ml-2">
                                                            {form.targetName}
                                                        </Text>
                                                    </View>
                                                ) : (
                                                    <Text className="text-gray-400 text-sm flex-1">
                                                        Select a {form.category}
                                                    </Text>
                                                )}
                                                <Icon
                                                    name="chevron-down"
                                                    size={20}
                                                    color="#9ca3af"
                                                />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}

                            {/* Text Target for service/cleanliness/equipment */}
                            {form.category &&
                                TEXT_TARGET_CATEGORIES.includes(form.category) && (
                                    <View className="mb-4">
                                        <Text className="text-gray-700 font-medium text-sm mb-2">
                                            Regarding (Optional)
                                        </Text>
                                        <TextInput
                                            className="bg-gray-50 rounded-xl p-4 text-gray-900 text-sm border border-gray-200"
                                            placeholder={
                                                TARGET_PLACEHOLDERS[form.category] ||
                                                'Specify what this feedback is about...'
                                            }
                                            placeholderTextColor="#9ca3af"
                                            value={form.targetName}
                                            onChangeText={text =>
                                                setForm(prev => ({
                                                    ...prev,
                                                    targetName: text,
                                                }))
                                            }
                                        />
                                    </View>
                                )}

                            {/* Rating */}
                            <Text className="text-gray-700 font-medium text-sm mb-2">
                                Rating *
                            </Text>
                            <View className="mb-4">
                                <StarRating
                                    value={form.rating}
                                    onChange={v =>
                                        setForm(prev => ({ ...prev, rating: v }))
                                    }
                                    size={36}
                                    interactive
                                />
                                {form.rating > 0 && (
                                    <Text className="text-gray-400 text-xs mt-1">
                                        {form.rating === 1
                                            ? 'Poor'
                                            : form.rating === 2
                                                ? 'Below Average'
                                                : form.rating === 3
                                                    ? 'Average'
                                                    : form.rating === 4
                                                        ? 'Good'
                                                        : 'Excellent'}
                                    </Text>
                                )}
                            </View>

                            {/* Subject */}
                            <Text className="text-gray-700 font-medium text-sm mb-2">
                                Subject *
                            </Text>
                            <TextInput
                                className="bg-gray-50 rounded-xl p-4 text-gray-900 text-sm border border-gray-200 mb-4"
                                placeholder="Brief subject of your feedback"
                                placeholderTextColor="#9ca3af"
                                value={form.subject}
                                onChangeText={text =>
                                    setForm(prev => ({ ...prev, subject: text }))
                                }
                            />

                            {/* Message */}
                            <Text className="text-gray-700 font-medium text-sm mb-2">
                                Message *
                            </Text>
                            <TextInput
                                className="bg-gray-50 rounded-xl p-4 text-gray-900 text-sm border border-gray-200 mb-4"
                                placeholder="Describe your experience in detail..."
                                placeholderTextColor="#9ca3af"
                                value={form.message}
                                onChangeText={text =>
                                    setForm(prev => ({ ...prev, message: text }))
                                }
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                style={{ minHeight: 100 }}
                            />
                        </ScrollView>

                        {/* Footer Buttons */}
                        <View className="flex-row gap-3 mt-4">
                            <TouchableOpacity
                                onPress={handleModalClose}
                                className="flex-1 border border-gray-300 rounded-xl py-4 items-center">
                                <Text className="text-gray-700 font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={submitting}
                                activeOpacity={0.8}
                                className="flex-1">
                                <LinearGradient
                                    colors={
                                        submitting
                                            ? ['#9ca3af', '#9ca3af']
                                            : ['#059669', '#10b981']
                                    }
                                    className="rounded-xl py-4 items-center flex-row justify-center">
                                    {submitting ? (
                                        <>
                                            <ActivityIndicator
                                                size="small"
                                                color="#fff"
                                                style={{ marginRight: 8 }}
                                            />
                                            <Text className="text-white font-bold text-sm">
                                                Submitting...
                                            </Text>
                                        </>
                                    ) : (
                                        <Text className="text-white font-bold text-sm">
                                            Submit Feedback
                                        </Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── CATEGORY PICKER MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showCategoryPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowCategoryPicker(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-gray-900 font-bold text-lg">
                                Select Category
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowCategoryPicker(false)}>
                                <Icon name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat.key}
                                onPress={() => handleCategoryChange(cat.key)}
                                activeOpacity={0.7}
                                className={`flex-row items-center p-4 rounded-xl mb-2 border-2 ${form.category === cat.key
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-gray-200 bg-white'
                                    }`}>
                                <View
                                    className="w-10 h-10 rounded-lg justify-center items-center"
                                    style={{
                                        backgroundColor:
                                            form.category === cat.key
                                                ? '#d1fae5'
                                                : '#f3f4f6',
                                    }}>
                                    <Icon
                                        name={cat.icon}
                                        size={22}
                                        color={
                                            form.category === cat.key
                                                ? '#059669'
                                                : '#6b7280'
                                        }
                                    />
                                </View>
                                <Text
                                    className={`ml-3 font-medium text-sm ${form.category === cat.key
                                            ? 'text-emerald-700'
                                            : 'text-gray-900'
                                        }`}>
                                    {cat.label}
                                </Text>
                                {form.category === cat.key && (
                                    <Icon
                                        name="check-circle"
                                        size={20}
                                        color="#059669"
                                        style={{ marginLeft: 'auto' }}
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── TARGET PICKER MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showTargetPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowTargetPicker(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-gray-900 font-bold text-lg">
                                Select{' '}
                                {form.category === 'coach' ? 'Coach' : 'Facility'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowTargetPicker(false)}>
                                <Icon name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        {targets.map(target => (
                            <TouchableOpacity
                                key={target._id}
                                onPress={() => handleTargetSelect(target)}
                                activeOpacity={0.7}
                                className={`flex-row items-center p-4 rounded-xl mb-2 border-2 ${form.targetId === target._id
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-gray-200 bg-white'
                                    }`}>
                                <View
                                    className="w-10 h-10 rounded-lg justify-center items-center"
                                    style={{
                                        backgroundColor:
                                            form.targetId === target._id
                                                ? '#d1fae5'
                                                : '#f3f4f6',
                                    }}>
                                    <Icon
                                        name={
                                            form.category === 'coach'
                                                ? 'account-tie'
                                                : 'office-building'
                                        }
                                        size={22}
                                        color={
                                            form.targetId === target._id
                                                ? '#059669'
                                                : '#6b7280'
                                        }
                                    />
                                </View>
                                <View className="ml-3 flex-1">
                                    <Text
                                        className={`font-medium text-sm ${form.targetId === target._id
                                                ? 'text-emerald-700'
                                                : 'text-gray-900'
                                            }`}>
                                        {target.name}
                                    </Text>
                                    {target.detail && (
                                        <Text className="text-gray-400 text-xs mt-0.5">
                                            {target.detail}
                                        </Text>
                                    )}
                                </View>
                                {form.targetId === target._id && (
                                    <Icon
                                        name="check-circle"
                                        size={20}
                                        color="#059669"
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── FEEDBACK DETAIL MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showDetailModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDetailModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View
                        className="bg-white rounded-t-3xl"
                        style={{ maxHeight: '90%' }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {selectedFeedback && (
                                <View>
                                    {/* Header Gradient */}
                                    <LinearGradient
                                        colors={['#059669', '#10b981']}
                                        className="h-36 justify-center items-center rounded-t-3xl relative">
                                        <Icon
                                            name={getCategoryIcon(
                                                selectedFeedback.category,
                                            )}
                                            size={52}
                                            color="rgba(255,255,255,0.3)"
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowDetailModal(false)}
                                            className="absolute top-4 right-4 w-8 h-8 bg-black/30 rounded-full justify-center items-center">
                                            <Icon name="close" size={20} color="#fff" />
                                        </TouchableOpacity>

                                        {/* Status Badge */}
                                        <View
                                            className="absolute top-4 left-4 rounded-full px-3 py-1"
                                            style={{
                                                backgroundColor: getStatusConfig(
                                                    selectedFeedback.status,
                                                ).bg,
                                            }}>
                                            <Text
                                                className="text-xs font-bold"
                                                style={{
                                                    color: getStatusConfig(
                                                        selectedFeedback.status,
                                                    ).text,
                                                }}>
                                                {
                                                    getStatusConfig(
                                                        selectedFeedback.status,
                                                    ).label
                                                }
                                            </Text>
                                        </View>
                                    </LinearGradient>

                                    <View className="p-5">
                                        {/* Subject */}
                                        <Text className="text-gray-900 font-bold text-xl mb-3">
                                            {selectedFeedback.subject}
                                        </Text>

                                        {/* Meta Badges */}
                                        <View className="flex-row flex-wrap mb-3">
                                            <View className="bg-gray-100 rounded-full px-2.5 py-1 mr-2 mb-1 border border-gray-200">
                                                <Text className="text-gray-600 text-xs font-medium capitalize">
                                                    {getCategoryLabel(
                                                        selectedFeedback.category,
                                                    )}
                                                </Text>
                                            </View>
                                            {selectedFeedback.targetName ? (
                                                <View className="bg-emerald-50 rounded-full px-2.5 py-1 mr-2 mb-1 border border-emerald-200">
                                                    <Text className="text-emerald-700 text-xs font-medium">
                                                        {selectedFeedback.targetName}
                                                    </Text>
                                                </View>
                                            ) : null}
                                        </View>

                                        {/* Rating */}
                                        <View className="mb-4">
                                            <Text className="text-gray-400 text-xs mb-1">
                                                Your Rating
                                            </Text>
                                            <StarRating
                                                value={selectedFeedback.rating}
                                                size={24}
                                            />
                                        </View>

                                        {/* Date */}
                                        <View className="flex-row items-center mb-4">
                                            <Icon
                                                name="calendar"
                                                size={14}
                                                color="#9ca3af"
                                            />
                                            <Text className="text-gray-400 text-xs ml-1">
                                                Submitted on{' '}
                                                {formatDate(
                                                    selectedFeedback.createdAt,
                                                )}
                                            </Text>
                                        </View>

                                        {/* Message */}
                                        <Text className="text-gray-600 text-sm leading-6 mb-4">
                                            {selectedFeedback.message}
                                        </Text>

                                        {/* Admin Response */}
                                        {selectedFeedback.adminResponse && (
                                            <View className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                                <View className="flex-row items-center mb-2">
                                                    <Icon
                                                        name="reply"
                                                        size={16}
                                                        color="#2563eb"
                                                    />
                                                    <Text className="text-blue-700 font-semibold text-sm ml-1.5">
                                                        Staff Response
                                                    </Text>
                                                    {selectedFeedback.respondedBy && (
                                                        <Text className="text-blue-500 text-xs ml-1">
                                                            —{' '}
                                                            {
                                                                selectedFeedback
                                                                    .respondedBy.name
                                                            }
                                                        </Text>
                                                    )}
                                                </View>
                                                <Text className="text-blue-800 text-sm leading-5">
                                                    {selectedFeedback.adminResponse}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        {/* Footer */}
                        <View className="px-5 pb-6 pt-2 border-t border-gray-100">
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => setShowDetailModal(false)}
                                    className="flex-1 border border-gray-300 rounded-xl py-3.5 items-center">
                                    <Text className="text-gray-700 font-semibold">
                                        Close
                                    </Text>
                                </TouchableOpacity>
                                {selectedFeedback?.status === 'pending' && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowDetailModal(false);
                                            setShowDeleteConfirm(
                                                selectedFeedback._id,
                                            );
                                        }}
                                        className="flex-1 border border-red-300 rounded-xl py-3.5 items-center">
                                        <Text className="text-red-500 font-semibold">
                                            Delete
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── DELETE CONFIRM MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={!!showDeleteConfirm}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDeleteConfirm(null)}>
                <View className="flex-1 bg-black/50 justify-center px-6">
                    <View
                        className="bg-white rounded-2xl p-6"
                        style={{ elevation: 10 }}>
                        <View className="items-center mb-4">
                            <View className="w-16 h-16 bg-red-100 rounded-full justify-center items-center">
                                <Icon name="delete-alert" size={36} color="#ef4444" />
                            </View>
                        </View>
                        <Text className="text-gray-900 font-bold text-lg text-center">
                            Delete Feedback
                        </Text>
                        <Text className="text-gray-500 text-sm text-center mt-2">
                            Are you sure you want to delete this feedback? This action
                            cannot be undone.
                        </Text>
                        <View className="flex-row gap-3 mt-6">
                            <TouchableOpacity
                                onPress={() => setShowDeleteConfirm(null)}
                                className="flex-1 border border-gray-300 rounded-xl py-3.5 items-center">
                                <Text className="text-gray-700 font-semibold">
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleDelete(showDeleteConfirm)}
                                activeOpacity={0.8}
                                className="flex-1 bg-red-500 rounded-xl py-3.5 items-center">
                                <Text className="text-white font-bold">Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default FeedbackScreen;