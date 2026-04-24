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
    const map = {
        resolved: { label: 'Resolved', bg: '#dcfce7', text: '#166534', icon: 'check-circle', gradient: ['#059669', '#34d399'] },
        reviewed: { label: 'Reviewed', bg: '#dbeafe', text: '#1e40af', icon: 'eye-check', gradient: ['#2563eb', '#3b82f6'] },
        pending: { label: 'Pending', bg: '#fef9c3', text: '#854d0e', icon: 'clock-outline', gradient: ['#d97706', '#f59e0b'] },
    };
    return map[status] || { label: status || 'Unknown', bg: '#f3f4f6', text: '#374151', icon: 'help-circle-outline', gradient: ['#6b7280', '#9ca3af'] };
};

const getCategoryConfig = (category) => {
    const found = CATEGORIES.find(c => c.key === category);
    if (!found) return { label: category || 'Unknown', icon: 'help-circle-outline', gradient: ['#6b7280', '#9ca3af'] };
    const colorMap = {
        coach: ['#7c3aed', '#8b5cf6'],
        facility: ['#2563eb', '#3b82f6'],
        service: ['#0891b2', '#06b6d4'],
        cleanliness: ['#059669', '#10b981'],
        equipment: ['#dc2626', '#ef4444'],
        membership: ['#d97706', '#f59e0b'],
        other: ['#6b7280', '#9ca3af'],
    };
    return { label: found.label, icon: found.icon, gradient: colorMap[category] || ['#6b7280', '#9ca3af'] };
};

const getRatingLabel = (r) => {
    const labels = { 1: 'Poor', 2: 'Below Average', 3: 'Average', 4: 'Good', 5: 'Excellent' };
    return labels[r] || '';
};

// ═══════════════════════════════════
// ─── SECTION TITLE COMPONENT ───
// ═══════════════════════════════════
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

// ─── Star Rating Component ───
const StarRating = ({ value, onChange, size = 28, interactive = false }) => (
    <View className="flex-row" style={{ gap: 4 }}>
        {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => interactive && onChange && onChange(star)} activeOpacity={interactive ? 0.7 : 1} disabled={!interactive}>
                <Icon name={star <= value ? 'star' : 'star-outline'} size={size} color={star <= value ? '#eab308' : '#d1d5db'} />
            </TouchableOpacity>
        ))}
    </View>
);

// ═══════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════
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
    const [form, setForm] = useState({ category: '', rating: 0, subject: '', message: '', targetId: '', targetName: '' });

    // ─── Data Fetching ───
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

    useEffect(() => { fetchData(); }, [fetchData]);
    const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

    // ─── Target Fetching ───
    const fetchTargets = useCallback(async (category) => {
        if (!DROPDOWN_CATEGORIES.includes(category)) { setTargets([]); return; }
        try {
            setLoadingTargets(true);
            await new Promise(resolve => setTimeout(resolve, 400));
            setTargets(MOCK_TARGETS[category] || []);
        } catch (error) { setTargets([]); } finally { setLoadingTargets(false); }
    }, []);

    // ─── Handlers ───
    const handleCategoryChange = (category) => {
        setForm(prev => ({ ...prev, category, targetId: '', targetName: '' }));
        setShowCategoryPicker(false);
        fetchTargets(category);
    };

    const handleTargetSelect = (target) => {
        setForm(prev => ({ ...prev, targetId: target._id, targetName: target.name }));
        setShowTargetPicker(false);
    };

    const resetForm = () => {
        setForm({ category: '', rating: 0, subject: '', message: '', targetId: '', targetName: '' });
        setTargets([]);
    };

    const handleSubmit = async () => {
        if (!form.category) { Alert.alert('Error', 'Please select a category'); return; }
        if (form.rating === 0) { Alert.alert('Error', 'Please select a rating'); return; }
        if (!form.subject.trim()) { Alert.alert('Error', 'Please enter a subject'); return; }
        if (!form.message.trim()) { Alert.alert('Error', 'Please enter your feedback message'); return; }
        if (DROPDOWN_CATEGORIES.includes(form.category) && !form.targetId && targets.length > 0) {
            Alert.alert('Error', `Please select a ${getCategoryConfig(form.category).label.toLowerCase()}`);
            return;
        }
        try {
            setSubmitting(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const newFeedback = {
                _id: `fb_new_${Date.now()}`, category: form.category, rating: form.rating,
                subject: form.subject, message: form.message, status: 'pending',
                targetName: form.targetName || '', createdAt: new Date().toISOString(), adminResponse: null,
            };
            setFeedbackList(prev => [newFeedback, ...prev]);
            setStats(prev => prev ? { ...prev, total: prev.total + 1, pending: prev.pending + 1 } : prev);
            Alert.alert('Success', 'Feedback submitted successfully!');
            setShowSubmitModal(false);
            resetForm();
        } catch (error) { Alert.alert('Error', 'Failed to submit feedback'); } finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setFeedbackList(prev => prev.filter(fb => fb._id !== id));
            setStats(prev => prev ? { ...prev, total: Math.max(0, prev.total - 1), pending: Math.max(0, prev.pending - 1) } : prev);
            Alert.alert('Success', 'Feedback deleted');
            setShowDeleteConfirm(null);
        } catch (error) { Alert.alert('Error', 'Failed to delete feedback'); }
    };

    const handleViewDetail = (fb) => { setSelectedFeedback(fb); setShowDetailModal(true); };
    const handleModalClose = () => { resetForm(); setShowSubmitModal(false); };

    // ─── Stats Config ───
    const statsConfig = useMemo(() => [
        { label: 'Total', value: stats?.total?.toString() || '0', icon: 'message-text-outline', gradient: ['#6b7280', '#9ca3af'] },
        { label: 'Avg Rating', value: stats?.averageRating?.toFixed(1) || '0.0', icon: 'star', gradient: ['#d97706', '#f59e0b'], isStar: true },
        { label: 'Pending', value: stats?.pending?.toString() || '0', icon: 'clock-outline', gradient: ['#d97706', '#f59e0b'] },
        { label: 'Resolved', value: stats?.resolved?.toString() || '0', icon: 'check-circle', gradient: ['#059669', '#34d399'] },
    ], [stats]);

    // ─── Feedback Card ───
    const FeedbackCard = ({ fb }) => {
        const statusCfg = getStatusConfig(fb.status);
        const catCfg = getCategoryConfig(fb.category);

        return (
            <TouchableOpacity onPress={() => handleViewDetail(fb)} activeOpacity={0.85} className="bg-white rounded-2xl mb-4 overflow-hidden" style={{ elevation: 3 }}>
                <View className="h-1.5" style={{ backgroundColor: statusCfg.gradient[0] }} />
                <View className="p-4">
                    {/* Header */}
                    <View className="flex-row items-start justify-between mb-2.5">
                        <View className="flex-row items-start flex-1 mr-3">
                            <LinearGradient colors={catCfg.gradient} className="w-11 h-11 rounded-xl justify-center items-center" style={{ borderRadius: 14 }}>
                                <Icon name={catCfg.icon} size={20} color="#fff" />
                            </LinearGradient>
                            <View className="ml-3 flex-1">
                                <Text className="text-gray-900 font-bold text-base leading-5" numberOfLines={1}>{fb.subject}</Text>
                                <View className="flex-row items-center flex-wrap mt-1.5">
                                    <LinearGradient colors={statusCfg.gradient} className="rounded-full px-2.5 py-0.5 mr-2" style={{ borderRadius: 20 }}>
                                        <Text className="text-white text-[10px] font-bold">{statusCfg.label}</Text>
                                    </LinearGradient>
                                    <View className="bg-gray-100 rounded-full px-2.5 py-0.5 mr-2 border border-gray-200">
                                        <Text className="text-gray-600 text-[10px] font-bold capitalize">{catCfg.label}</Text>
                                    </View>
                                    {fb.targetName ? (
                                        <View className="bg-emerald-50 rounded-full px-2.5 py-0.5 border border-emerald-200">
                                            <Text className="text-emerald-700 text-[10px] font-bold" numberOfLines={1}>{fb.targetName}</Text>
                                        </View>
                                    ) : null}
                                </View>
                            </View>
                        </View>
                        {fb.status === 'pending' && (
                            <TouchableOpacity onPress={() => setShowDeleteConfirm(fb._id)} activeOpacity={0.7} className="w-8 h-8 rounded-lg bg-red-50 justify-center items-center border border-red-100">
                                <Icon name="delete-outline" size={16} color="#ef4444" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Stars */}
                    <View className="flex-row items-center mb-2.5">
                        <StarRating value={fb.rating} size={15} />
                        <Text className="text-gray-400 text-xs ml-2 font-medium">{getRatingLabel(fb.rating)}</Text>
                    </View>

                    {/* Meta */}
                    <View className="flex-row items-center mb-2">
                        <View className="w-7 h-7 rounded-lg justify-center items-center" style={{ backgroundColor: '#9ca3af12' }}>
                            <Icon name="calendar" size={13} color="#9ca3af" />
                        </View>
                        <Text className="text-gray-400 text-xs ml-2">{formatDate(fb.createdAt)}</Text>
                    </View>

                    {/* Message */}
                    <Text className="text-gray-500 text-sm leading-5" numberOfLines={2}>{fb.message}</Text>

                    {/* Admin Response */}
                    {fb.adminResponse && (
                        <View className="flex-row items-center mt-3 p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                            <View className="w-7 h-7 rounded-lg justify-center items-center" style={{ backgroundColor: '#2563eb15' }}>
                                <Icon name="reply" size={14} color="#2563eb" />
                            </View>
                            <Text className="text-blue-700 text-xs font-semibold ml-2 flex-1" numberOfLines={1}>
                                Staff responded{fb.respondedBy ? ` — ${fb.respondedBy.name}` : ''}
                            </Text>
                        </View>
                    )}

                    {/* View Details */}
                    <TouchableOpacity onPress={() => handleViewDetail(fb)} activeOpacity={0.7} className="flex-row items-center self-start mt-2.5">
                        <Text className="text-emerald-600 text-xs font-bold">View details</Text>
                        <Icon name="chevron-right" size={14} color="#059669" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    // ─── Loading State ───
    if (loading && feedbackList.length === 0) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <View className="w-16 h-16 rounded-2xl bg-emerald-50 justify-center items-center mb-4">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
                <Text className="text-gray-900 font-bold text-base">Loading Feedback</Text>
                <Text className="text-gray-400 mt-1 text-sm">Fetching your feedback history...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} tintColor="#059669" />}>

                {/* ═══════════════════════════════════════ */}
                {/* ─── HEADER ─── */}
                {/* ═══════════════════════════════════════ */}
                <LinearGradient colors={['#064e3b', '#059669', '#10b981']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: 48, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
                    {/* Top Bar */}
                    <View className="flex-row justify-between items-center px-5 mb-5">
                        <DrawerMenuButton />
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => navigation.navigate('Announcements')} className="w-10 h-10 bg-white/15 rounded-full justify-center items-center mr-2">
                                <Icon name="bell-outline" size={22} color="#fff" />
                                <View className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full justify-center items-center">
                                    <Text className="text-white text-[8px] font-bold">2</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onRefresh} disabled={loading || refreshing} className="w-10 h-10 bg-white/15 rounded-full justify-center items-center">
                                <Icon name="refresh" size={22} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Title */}
                    <View className="px-5 mb-4">
                        <Text className="text-white/60 text-sm font-medium">Share your experience</Text>
                        <Text className="text-white font-bold text-2xl mt-0.5">Feedback & Ratings</Text>
                        <Text className="text-white/50 text-xs mt-1">Help us improve by providing your valuable feedback</Text>
                    </View>

                    {/* Summary Glass Card */}
                    <View className="mx-5 bg-white/10 rounded-2xl p-4" style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <View className="w-11 h-11 bg-yellow-400/20 rounded-xl justify-center items-center">
                                    <Icon name="star" size={22} color="#fbbf24" />
                                </View>
                                <View className="ml-3 flex-1">
                                    <Text className="text-white font-bold text-sm">
                                        Avg Rating: {stats?.averageRating?.toFixed(1) || '0.0'} / 5.0
                                    </Text>
                                    <Text className="text-white/50 text-xs mt-0.5">
                                        Based on {stats?.total || 0} feedback{((stats?.total || 0) !== 1) ? 's' : ''}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setShowSubmitModal(true)} activeOpacity={0.8}>
                                <LinearGradient colors={['#fbbf24', '#f59e0b']} style={{ borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }}>
                                    <Icon name="plus" size={16} color="#fff" />
                                    <Text className="text-white font-bold text-xs ml-1">New</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>

                {/* ═══════════════════════════════════════ */}
                {/* ─── STATS GRID ─── */}
                {/* ═══════════════════════════════════════ */}
                <View className="px-4 -mt-5">
                    <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
                        {statsConfig.map(stat => (
                            <View key={stat.label} style={{ width: '50%', padding: 4 }}>
                                <View className="bg-white rounded-2xl p-4 shadow-md" style={{ elevation: 4 }}>
                                    <View className="flex-row justify-between items-start">
                                        <View className="flex-1">
                                            <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider">{stat.label}</Text>
                                            <View className="flex-row items-center mt-1">
                                                <Text className="text-gray-900 font-bold text-3xl">{stat.value}</Text>
                                                {stat.isStar && <Icon name="star" size={20} color="#eab308" style={{ marginLeft: 4 }} />}
                                            </View>
                                        </View>
                                        <LinearGradient colors={stat.gradient} className="w-11 h-11 rounded-xl justify-center items-center" style={{ borderRadius: 12 }}>
                                            <Icon name={stat.icon} size={20} color="#fff" />
                                        </LinearGradient>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ═══════════════════════════════════════ */}
                {/* ─── SUBMIT FEEDBACK CARD ─── */}
                {/* ═══════════════════════════════════════ */}
                <View className="px-4 mt-5">
                    <TouchableOpacity onPress={() => setShowSubmitModal(true)} activeOpacity={0.85}>
                        <LinearGradient colors={['#064e3b', '#059669']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 20, padding: 20 }}>
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-row items-center">
                                    <Icon name="message-plus" size={20} color="#6ee7b7" />
                                    <Text className="text-white font-bold text-base ml-2">Share Your Experience</Text>
                                </View>
                                <View className="bg-emerald-400/20 px-3 py-1.5 rounded-full flex-row items-center">
                                    <View className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5" />
                                    <Text className="text-emerald-300 text-xs font-bold">Open</Text>
                                </View>
                            </View>
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View className="w-12 h-12 rounded-2xl justify-center items-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                                        <Icon name="rate-review" size={28} color="#fff" />
                                    </View>
                                    <View className="ml-3 flex-1">
                                        <Text className="text-white font-bold text-sm">Submit New Feedback</Text>
                                        <Text className="text-white/60 text-xs mt-0.5">Rate coaches, facilities, services & more</Text>
                                    </View>
                                </View>
                                <LinearGradient colors={['#34d399', '#6ee7b7']} style={{ borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }}>
                                    <Icon name="arrow-right" size={16} color="#fff" />
                                    <Text className="text-white font-bold text-xs ml-1">Write</Text>
                                </LinearGradient>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* ═══════════════════════════════════════ */}
                {/* ─── FEEDBACK HISTORY ─── */}
                {/* ═══════════════════════════════════════ */}
                <View className="px-4 mt-6">
                    <SectionTitle title="My Feedback History" icon="message-text-outline" iconColor="#2563eb" />
                    <Text className="text-gray-400 text-xs mb-4 -mt-2 ml-[42px]">{feedbackList.length} feedback{feedbackList.length !== 1 ? 's' : ''} submitted</Text>

                    {feedbackList.length === 0 ? (
                        <View className="bg-white rounded-2xl p-10 items-center shadow-sm" style={{ elevation: 2 }}>
                            <View className="w-20 h-20 rounded-full bg-gray-100 justify-center items-center mb-4">
                                <Icon name="message-text-outline" size={40} color="#d1d5db" />
                            </View>
                            <Text className="text-gray-700 font-bold text-lg">No feedback yet</Text>
                            <Text className="text-gray-400 text-sm text-center mt-1.5 max-w-[260px]">Share your experience to help us improve our services</Text>
                            <TouchableOpacity onPress={() => setShowSubmitModal(true)} activeOpacity={0.8} className="mt-5">
                                <LinearGradient colors={['#059669', '#10b981']} className="rounded-xl px-6 py-3.5 flex-row items-center shadow-sm" style={{ elevation: 3 }}>
                                    <Icon name="plus" size={18} color="#fff" />
                                    <Text className="text-white font-bold text-sm ml-2">Submit Your First Feedback</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        feedbackList.map(fb => <FeedbackCard key={fb._id} fb={fb} />)
                    )}
                </View>

                <View className="h-8" />
            </ScrollView>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── SUBMIT FEEDBACK MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal visible={showSubmitModal} transparent animationType="slide" onRequestClose={handleModalClose}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '90%' }}>
                        {/* Header */}
                        <View className="flex-row justify-between items-center mb-1">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-emerald-100 rounded-xl justify-center items-center">
                                    <Icon name="message-plus" size={22} color="#059669" />
                                </View>
                                <View className="ml-3">
                                    <Text className="text-gray-900 font-bold text-lg">Submit Feedback</Text>
                                    <Text className="text-gray-400 text-xs">Share your experience to help us improve</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={handleModalClose} className="w-9 h-9 bg-gray-100 rounded-full justify-center items-center">
                                <Icon name="close" size={18} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="mt-4">
                            {/* Category Selector */}
                            <Text className="text-gray-900 font-bold text-sm mb-2">Category *</Text>
                            <TouchableOpacity onPress={() => setShowCategoryPicker(true)} activeOpacity={0.7} className="flex-row items-center p-4 bg-gray-50 rounded-2xl mb-4" style={{ borderWidth: 1.5, borderColor: form.category ? '#059669' : '#e5e7eb' }}>
                                {form.category ? (
                                    <View className="flex-row items-center flex-1">
                                        <LinearGradient colors={getCategoryConfig(form.category).gradient} className="w-8 h-8 rounded-lg justify-center items-center" style={{ borderRadius: 8 }}>
                                            <Icon name={getCategoryConfig(form.category).icon} size={16} color="#fff" />
                                        </LinearGradient>
                                        <Text className="text-gray-900 font-semibold text-sm ml-2.5 capitalize">{getCategoryConfig(form.category).label}</Text>
                                    </View>
                                ) : (
                                    <Text className="text-gray-400 text-sm flex-1">Select category</Text>
                                )}
                                <Icon name="chevron-down" size={20} color="#9ca3af" />
                            </TouchableOpacity>

                            {/* Dynamic Target Field */}
                            {form.category && form.category !== 'other' && DROPDOWN_CATEGORIES.includes(form.category) && (
                                <View className="mb-4">
                                    <Text className="text-gray-900 font-bold text-sm mb-2">{form.category === 'coach' ? 'Select Coach *' : 'Select Facility *'}</Text>
                                    {loadingTargets ? (
                                        <View className="flex-row items-center p-4 bg-gray-50 rounded-2xl" style={{ borderWidth: 1.5, borderColor: '#e5e7eb' }}>
                                            <ActivityIndicator size="small" color="#059669" />
                                            <Text className="text-gray-400 text-sm ml-2">Loading...</Text>
                                        </View>
                                    ) : targets.length === 0 ? (
                                        <View className="p-3.5 bg-yellow-50 rounded-2xl border border-yellow-200">
                                            <Text className="text-yellow-700 text-xs font-medium">No {form.category === 'coach' ? 'coaches' : 'facilities'} found.</Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity onPress={() => setShowTargetPicker(true)} activeOpacity={0.7} className="flex-row items-center p-4 bg-gray-50 rounded-2xl" style={{ borderWidth: 1.5, borderColor: form.targetId ? '#059669' : '#e5e7eb' }}>
                                            {form.targetId ? (
                                                <View className="flex-row items-center flex-1">
                                                    <View className="w-8 h-8 rounded-lg justify-center items-center" style={{ backgroundColor: '#05966915' }}>
                                                        <Icon name={form.category === 'coach' ? 'account-tie' : 'office-building'} size={16} color="#059669" />
                                                    </View>
                                                    <Text className="text-gray-900 font-semibold text-sm ml-2.5">{form.targetName}</Text>
                                                </View>
                                            ) : (
                                                <Text className="text-gray-400 text-sm flex-1">Select a {form.category}</Text>
                                            )}
                                            <Icon name="chevron-down" size={20} color="#9ca3af" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}

                            {/* Text Target */}
                            {form.category && TEXT_TARGET_CATEGORIES.includes(form.category) && (
                                <View className="mb-4">
                                    <Text className="text-gray-900 font-bold text-sm mb-2">Regarding <Text className="text-gray-400 font-normal">(Optional)</Text></Text>
                                    <TextInput className="bg-gray-50 rounded-2xl p-4 text-gray-900 text-sm" placeholder={TARGET_PLACEHOLDERS[form.category] || 'Specify...'} placeholderTextColor="#9ca3af" value={form.targetName} onChangeText={text => setForm(prev => ({ ...prev, targetName: text }))} style={{ borderWidth: 1.5, borderColor: '#e5e7eb' }} />
                                </View>
                            )}

                            {/* Rating */}
                            <Text className="text-gray-900 font-bold text-sm mb-2">Rating *</Text>
                            <View className="bg-gray-50 rounded-2xl p-4 mb-1" style={{ borderWidth: 1.5, borderColor: form.rating > 0 ? '#eab308' : '#e5e7eb' }}>
                                <StarRating value={form.rating} onChange={v => setForm(prev => ({ ...prev, rating: v }))} size={36} interactive />
                                {form.rating > 0 && (
                                    <Text className="text-yellow-600 text-xs font-bold mt-2 ml-1">{getRatingLabel(form.rating)}</Text>
                                )}
                            </View>
                            {!form.rating && <View className="h-3" />}

                            {/* Subject */}
                            <Text className="text-gray-900 font-bold text-sm mb-2">Subject *</Text>
                            <TextInput className="bg-gray-50 rounded-2xl p-4 text-gray-900 text-sm mb-4" placeholder="Brief subject of your feedback" placeholderTextColor="#9ca3af" value={form.subject} onChangeText={text => setForm(prev => ({ ...prev, subject: text }))} style={{ borderWidth: 1.5, borderColor: '#e5e7eb' }} />

                            {/* Message */}
                            <Text className="text-gray-900 font-bold text-sm mb-2">Message *</Text>
                            <TextInput className="bg-gray-50 rounded-2xl p-4 text-gray-900 text-sm mb-2" placeholder="Describe your experience in detail..." placeholderTextColor="#9ca3af" value={form.message} onChangeText={text => setForm(prev => ({ ...prev, message: text }))} multiline numberOfLines={4} textAlignVertical="top" style={{ borderWidth: 1.5, borderColor: '#e5e7eb', minHeight: 100 }} />
                        </ScrollView>

                        {/* Footer */}
                        <View className="flex-row mt-4" style={{ gap: 12 }}>
                            <TouchableOpacity onPress={handleModalClose} className="flex-1" style={{ borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', paddingVertical: 15, alignItems: 'center' }}>
                                <Text className="text-gray-700 font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSubmit} disabled={submitting} activeOpacity={0.8} className="flex-1">
                                <LinearGradient colors={submitting ? ['#d1d5db', '#d1d5db'] : ['#059669', '#10b981']} style={{ borderRadius: 14, paddingVertical: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    {submitting ? <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} /> : <Icon name="send" size={16} color="#fff" style={{ marginRight: 8 }} />}
                                    <Text className="text-white font-bold text-sm">{submitting ? 'Submitting...' : 'Submit Feedback'}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── CATEGORY PICKER MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal visible={showCategoryPicker} transparent animationType="slide" onRequestClose={() => setShowCategoryPicker(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-lg bg-emerald-50 justify-center items-center mr-2.5">
                                    <Icon name="shape" size={18} color="#059669" />
                                </View>
                                <Text className="text-gray-900 font-bold text-xl">Select Category</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowCategoryPicker(false)} className="w-9 h-9 bg-gray-100 rounded-full justify-center items-center">
                                <Icon name="close" size={18} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {CATEGORIES.map(cat => {
                                const cc = getCategoryConfig(cat.key);
                                const isSelected = form.category === cat.key;
                                return (
                                    <TouchableOpacity key={cat.key} onPress={() => handleCategoryChange(cat.key)} activeOpacity={0.7} className={`flex-row items-center p-4 rounded-2xl mb-2 ${isSelected ? 'bg-emerald-50' : 'bg-white'}`} style={{ borderWidth: 2, borderColor: isSelected ? '#059669' : '#f3f4f6' }}>
                                        <LinearGradient colors={cc.gradient} className="w-10 h-10 rounded-xl justify-center items-center" style={{ borderRadius: 12 }}>
                                            <Icon name={cat.icon} size={20} color="#fff" />
                                        </LinearGradient>
                                        <Text className={`ml-3 font-semibold text-sm flex-1 ${isSelected ? 'text-emerald-700' : 'text-gray-900'}`}>{cat.label}</Text>
                                        {isSelected && <Icon name="check-circle" size={20} color="#059669" />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── TARGET PICKER MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal visible={showTargetPicker} transparent animationType="slide" onRequestClose={() => setShowTargetPicker(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-lg bg-blue-50 justify-center items-center mr-2.5">
                                    <Icon name={form.category === 'coach' ? 'account-tie' : 'office-building'} size={18} color="#2563eb" />
                                </View>
                                <Text className="text-gray-900 font-bold text-xl">Select {form.category === 'coach' ? 'Coach' : 'Facility'}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowTargetPicker(false)} className="w-9 h-9 bg-gray-100 rounded-full justify-center items-center">
                                <Icon name="close" size={18} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {targets.map(target => {
                                const isSelected = form.targetId === target._id;
                                return (
                                    <TouchableOpacity key={target._id} onPress={() => handleTargetSelect(target)} activeOpacity={0.7} className={`flex-row items-center p-4 rounded-2xl mb-2 ${isSelected ? 'bg-emerald-50' : 'bg-white'}`} style={{ borderWidth: 2, borderColor: isSelected ? '#059669' : '#f3f4f6' }}>
                                        <View className="w-10 h-10 rounded-xl justify-center items-center mr-3" style={{ backgroundColor: isSelected ? '#d1fae5' : '#f3f4f6' }}>
                                            <Icon name={form.category === 'coach' ? 'account-tie' : 'office-building'} size={20} color={isSelected ? '#059669' : '#6b7280'} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className={`font-semibold text-sm ${isSelected ? 'text-emerald-700' : 'text-gray-900'}`}>{target.name}</Text>
                                            {target.detail && <Text className="text-gray-400 text-xs mt-0.5">{target.detail}</Text>}
                                        </View>
                                        {isSelected && <Icon name="check-circle" size={20} color="#059669" />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── FEEDBACK DETAIL MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal visible={showDetailModal} transparent animationType="slide" onRequestClose={() => setShowDetailModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl" style={{ maxHeight: '90%' }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {selectedFeedback && (() => {
                                const sCfg = getStatusConfig(selectedFeedback.status);
                                const cCfg = getCategoryConfig(selectedFeedback.category);
                                return (
                                    <View>
                                        {/* Gradient Header */}
                                        <LinearGradient colors={cCfg.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="h-44 justify-center items-center rounded-t-3xl relative">
                                            <Icon name={cCfg.icon} size={64} color="rgba(255,255,255,0.25)" />
                                            <TouchableOpacity onPress={() => setShowDetailModal(false)} className="absolute top-4 right-4 w-9 h-9 bg-black/30 rounded-full justify-center items-center">
                                                <Icon name="close" size={20} color="#fff" />
                                            </TouchableOpacity>
                                            <View className="absolute top-4 left-4">
                                                <LinearGradient colors={sCfg.gradient} className="px-3 py-1.5 rounded-full" style={{ borderRadius: 20 }}>
                                                    <Text className="text-white text-xs font-bold">{sCfg.label}</Text>
                                                </LinearGradient>
                                            </View>
                                            <View className="absolute bottom-3 right-4 bg-white/20 px-3 py-1.5 rounded-full">
                                                <Text className="text-white text-xs font-bold">{cCfg.label}</Text>
                                            </View>
                                        </LinearGradient>

                                        <View className="p-5">
                                            <Text className="text-gray-900 font-bold text-xl mb-3">{selectedFeedback.subject}</Text>

                                            {/* Badges */}
                                            <View className="flex-row flex-wrap mb-3">
                                                {selectedFeedback.targetName && (
                                                    <View className="bg-emerald-50 rounded-full px-3 py-1.5 mr-2 border border-emerald-200">
                                                        <Text className="text-emerald-700 text-xs font-bold">{selectedFeedback.targetName}</Text>
                                                    </View>
                                                )}
                                            </View>

                                            {/* Rating */}
                                            <View className="bg-gray-50 rounded-2xl p-4 mb-4" style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                                                <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1.5">Your Rating</Text>
                                                <View className="flex-row items-center">
                                                    <StarRating value={selectedFeedback.rating} size={24} />
                                                    <Text className="text-gray-900 font-bold text-base ml-3">{selectedFeedback.rating}/5</Text>
                                                    <Text className="text-gray-400 text-xs ml-2">— {getRatingLabel(selectedFeedback.rating)}</Text>
                                                </View>
                                            </View>

                                            {/* Date */}
                                            <View className="flex-row items-center mb-4">
                                                <View className="w-9 h-9 rounded-xl justify-center items-center" style={{ backgroundColor: '#9ca3af12' }}>
                                                    <Icon name="calendar" size={16} color="#9ca3af" />
                                                </View>
                                                <View className="ml-3">
                                                    <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">Submitted</Text>
                                                    <Text className="text-gray-900 font-semibold text-sm mt-0.5">{formatDate(selectedFeedback.createdAt)}</Text>
                                                </View>
                                            </View>

                                            {/* Message */}
                                            <Text className="text-gray-600 text-sm leading-6 mb-4">{selectedFeedback.message}</Text>

                                            {/* Admin Response */}
                                            {selectedFeedback.adminResponse && (
                                                <View className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                                                    <View className="flex-row items-center mb-2.5">
                                                        <View className="w-8 h-8 rounded-lg justify-center items-center" style={{ backgroundColor: '#2563eb15' }}>
                                                            <Icon name="reply" size={16} color="#2563eb" />
                                                        </View>
                                                        <Text className="text-blue-700 font-bold text-sm ml-2">Staff Response</Text>
                                                    </View>
                                                    {selectedFeedback.respondedBy && (
                                                        <Text className="text-blue-500 text-xs font-medium mb-2 ml-10">— {selectedFeedback.respondedBy.name}</Text>
                                                    )}
                                                    <Text className="text-blue-800 text-sm leading-5 ml-10">{selectedFeedback.adminResponse}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                );
                            })()}
                        </ScrollView>

                        {/* Footer */}
                        <View className="px-5 pb-6 pt-3 border-t border-gray-100">
                            <View className="flex-row" style={{ gap: 12 }}>
                                <TouchableOpacity onPress={() => setShowDetailModal(false)} className="flex-1" style={{ borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', paddingVertical: 15, alignItems: 'center' }}>
                                    <Text className="text-gray-700 font-bold">Close</Text>
                                </TouchableOpacity>
                                {selectedFeedback?.status === 'pending' && (
                                    <TouchableOpacity onPress={() => { setShowDetailModal(false); setShowDeleteConfirm(selectedFeedback._id); }} className="flex-1" style={{ borderRadius: 14, borderWidth: 1.5, borderColor: '#fecaca', paddingVertical: 15, alignItems: 'center', backgroundColor: '#fff5f5' }}>
                                        <Text className="text-red-500 font-bold">Delete</Text>
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
            <Modal visible={!!showDeleteConfirm} transparent animationType="fade" onRequestClose={() => setShowDeleteConfirm(null)}>
                <View className="flex-1 bg-black/50 justify-center px-6">
                    <View className="bg-white rounded-2xl p-6 shadow-sm" style={{ elevation: 10 }}>
                        <View className="items-center mb-4">
                            <View className="w-16 h-16 bg-red-100 rounded-2xl justify-center items-center">
                                <Icon name="delete-alert" size={36} color="#ef4444" />
                            </View>
                        </View>
                        <Text className="text-gray-900 font-bold text-lg text-center">Delete Feedback</Text>
                        <Text className="text-gray-500 text-sm text-center mt-2 leading-5">Are you sure you want to delete this feedback? This action cannot be undone.</Text>
                        <View className="flex-row mt-6" style={{ gap: 12 }}>
                            <TouchableOpacity onPress={() => setShowDeleteConfirm(null)} className="flex-1" style={{ borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', paddingVertical: 14, alignItems: 'center' }}>
                                <Text className="text-gray-700 font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(showDeleteConfirm)} activeOpacity={0.8} className="flex-1">
                                <LinearGradient colors={['#dc2626', '#ef4444']} style={{ borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
                                    <Text className="text-white font-bold">Delete</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default FeedbackScreen;