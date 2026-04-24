import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Modal,
    FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { members } from '../../data/members';
import { SPORTS_LIST } from '../../data/sessions';
import { DAYS_OF_WEEK, DIFFICULTY_LEVELS, PLAN_STATUSES } from '../../data/trainingPlans';

// ─── Sport Config ───
const getSportConfig = sport => {
    const configs = {
        Karate: { color: '#ef4444', icon: 'karate', gradient: ['#ef4444', '#f97316'] },
        Badminton: { color: '#22c55e', icon: 'badminton', gradient: ['#22c55e', '#10b981'] },
        Swimming: { color: '#3b82f6', icon: 'swim', gradient: ['#3b82f6', '#06b6d4'] },
        Boxing: { color: '#f59e0b', icon: 'boxing-glove', gradient: ['#f59e0b', '#ef4444'] },
        Weightlifting: { color: '#8b5cf6', icon: 'weight-lifter', gradient: ['#8b5cf6', '#6366f1'] },
        Yoga: { color: '#ec4899', icon: 'yoga', gradient: ['#ec4899', '#f472b6'] },
        default: { color: '#6b7280', icon: 'dumbbell', gradient: ['#6b7280', '#9ca3af'] },
    };
    return configs[sport] || configs.default;
};

// ─── Reusable Section Card (matching MemberProfileScreen/CreateEditSessionScreen pattern) ───
const SectionCard = ({ title, icon, iconColor = '#1e3a8a', children, rightAction }) => (
    <View
        className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
        style={{ elevation: 3 }}>
        <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
                <View
                    className="w-9 h-9 rounded-xl justify-center items-center mr-2.5"
                    style={{ backgroundColor: `${iconColor}12` }}>
                    <Icon name={icon} size={18} color={iconColor} />
                </View>
                <Text className="text-gray-900 font-bold text-lg">{title}</Text>
            </View>
            {rightAction}
        </View>
        {children}
    </View>
);

// ─── Form Field Label (matching CreateEditSessionScreen) ───
const FieldLabel = ({ label, required }) => (
    <Text className="text-gray-500 text-xs mb-2 font-semibold uppercase tracking-wider">
        {label} {required && <Text className="text-red-500">*</Text>}
    </Text>
);

// ─── Picker Modal Component (matching CreateEditSessionScreen) ───
const PickerModal = ({ visible, onClose, title, data, onSelect, selectedValue, renderLabel }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}>
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl max-h-[70%]">
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 rounded-lg bg-blue-50 justify-center items-center mr-2.5">
                                <Icon name="format-list-bulleted" size={16} color="#1e3a8a" />
                            </View>
                            <Text className="text-gray-900 font-bold text-lg">{title}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center">
                            <Icon name="close" size={18} color="#6b7280" />
                        </TouchableOpacity>
                    </View>
                    {/* Options */}
                    <FlatList
                        data={data}
                        keyExtractor={(item, index) => item._id || item.id || item.value || String(index)}
                        renderItem={({ item }) => {
                            const itemValue = item._id || item.id || item.value || (typeof item === 'string' ? item : '');
                            const isSelected = itemValue === selectedValue;
                            return (
                                <TouchableOpacity
                                    onPress={() => {
                                        onSelect(item);
                                        onClose();
                                    }}
                                    activeOpacity={0.7}
                                    className={`flex-row items-center px-6 py-4 border-b border-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                                    <View className="flex-1">
                                        <Text className={`text-sm ${isSelected ? 'text-blue-700 font-bold' : 'text-gray-800 font-medium'}`}>
                                            {renderLabel ? renderLabel(item) : (item.name || item.label || item.title || item)}
                                        </Text>
                                    </View>
                                    {isSelected && (
                                        <View className="w-7 h-7 rounded-full bg-blue-100 justify-center items-center">
                                            <Icon name="check" size={16} color="#2563eb" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        }}
                        ListEmptyComponent={
                            <View className="py-8 items-center">
                                <View className="w-16 h-16 rounded-full bg-gray-50 justify-center items-center mb-3">
                                    <Icon name="alert-circle-outline" size={32} color="#d1d5db" />
                                </View>
                                <Text className="text-gray-400 text-sm">No options available</Text>
                            </View>
                        }
                        contentContainerStyle={{ paddingBottom: 40 }}
                    />
                </View>
            </View>
        </Modal>
    );
};

// ─── Dropdown Button Component (matching CreateEditSessionScreen) ───
const DropdownButton = ({ label, value, placeholder, onPress, icon }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
        style={{ elevation: 1 }}>
        <View className="flex-row items-center flex-1">
            {icon && (
                <View className="w-8 h-8 rounded-lg bg-white justify-center items-center mr-2.5" style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                    <Icon name={icon} size={16} color="#6b7280" />
                </View>
            )}
            <Text
                className={`text-sm flex-1 ${value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}
                numberOfLines={1}>
                {value || placeholder}
            </Text>
        </View>
        <Icon name="chevron-down" size={18} color="#9ca3af" />
    </TouchableOpacity>
);

// ─── Tag Input Component (enhanced) ───
const TagInput = ({ tags, onAdd, onRemove, placeholder, color = 'purple', icon = 'tag' }) => {
    const [input, setInput] = useState('');

    const handleAdd = () => {
        const trimmed = input.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onAdd(trimmed);
            setInput('');
        }
    };

    const bgColor = color === 'purple' ? '#f3e8ff' : '#fffbeb';
    const textColor = color === 'purple' ? '#7c3aed' : '#d97706';
    const closeBg = color === 'purple' ? '#ede9fe' : '#fef3c7';

    return (
        <View>
            <View className="flex-row items-center" style={{ gap: 8 }}>
                <View className="flex-1">
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-sm font-medium"
                        placeholder={placeholder}
                        placeholderTextColor="#9ca3af"
                        value={input}
                        onChangeText={setInput}
                        onSubmitEditing={handleAdd}
                        returnKeyType="done"
                        style={{ elevation: 1 }}
                    />
                </View>
                <TouchableOpacity
                    onPress={handleAdd}
                    activeOpacity={0.8}>
                    <LinearGradient
                        colors={['#1e3a8a', '#3b82f6']}
                        style={{ width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}>
                        <Icon name="plus" size={20} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
            {tags.length > 0 && (
                <View className="flex-row flex-wrap mt-2.5" style={{ gap: 6 }}>
                    {tags.map((tag, idx) => (
                        <View
                            key={idx}
                            className="flex-row items-center px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: bgColor }}>
                            <Icon name={icon} size={10} color={textColor} />
                            <Text className="text-xs font-bold ml-1.5" style={{ color: textColor }}>{tag}</Text>
                            <TouchableOpacity onPress={() => onRemove(idx)} className="ml-2">
                                <View
                                    className="w-5 h-5 rounded-full justify-center items-center"
                                    style={{ backgroundColor: closeBg }}>
                                    <Icon name="close" size={10} color={textColor} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

// ─── Date Picker Field (enhanced) ───
const DatePickerField = ({ value, onChange, placeholder }) => {
    const [showPicker, setShowPicker] = useState(false);

    const parseDate = (dateStr) => {
        if (!dateStr) return new Date();
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        }
        return new Date();
    };

    const formatDateStr = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return '';
        const date = parseDate(dateStr);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const handleDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }
        if (event.type === 'dismissed') {
            setShowPicker(false);
            return;
        }
        if (selectedDate) {
            onChange(formatDateStr(selectedDate));
        }
    };

    // ─── iOS Picker Modal ───
    const IOSPickerModal = ({ visible, onClose, title, children }) => (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}>
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl">
                    <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 rounded-lg bg-blue-50 justify-center items-center mr-2.5">
                                <Icon name="calendar-clock" size={16} color="#1e3a8a" />
                            </View>
                            <Text className="text-gray-900 font-bold text-lg">{title}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            activeOpacity={0.8}>
                            <LinearGradient
                                colors={['#1e3a8a', '#3b82f6']}
                                style={{ borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 }}>
                                <Text className="text-white font-bold text-sm">Done</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                    <View className="px-4 py-2 pb-8">
                        {children}
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <View>
            <View className="flex-row items-center">
                <View className="flex-1 mr-2">
                    <TextInput
                        value={value ? formatDisplayDate(value) : ''}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-sm font-medium"
                        placeholder={placeholder || 'Select date'}
                        placeholderTextColor="#9ca3af"
                        editable={false}
                        style={{ elevation: 1 }}
                    />
                </View>
                <TouchableOpacity
                    onPress={() => setShowPicker(true)}
                    activeOpacity={0.7}>
                    <LinearGradient
                        colors={['#3b82f6', '#60a5fa']}
                        style={{ width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}>
                        <Icon name="calendar" size={22} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Android Date Picker */}
            {Platform.OS === 'android' && showPicker && (
                <DateTimePicker
                    value={parseDate(value)}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}

            {/* iOS Date Picker */}
            {Platform.OS === 'ios' && (
                <IOSPickerModal
                    visible={showPicker}
                    onClose={() => setShowPicker(false)}
                    title="Select Date">
                    <DateTimePicker
                        value={parseDate(value)}
                        mode="date"
                        display="spinner"
                        onChange={handleDateChange}
                        style={{ height: 200 }}
                    />
                </IOSPickerModal>
            )}
        </View>
    );
};

// ─── Empty Templates ───
const emptyExercise = { name: '', description: '', sets: '', reps: '', duration: '', restTime: '', notes: '' };
const emptyScheduleDay = { day: '', exercises: [], notes: '' };

// ═══════════════════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════
const CreateEditTrainingPlanScreen = ({ navigation, route }) => {
    const { mode, plan, onSave } = route.params || {};
    const isEdit = mode === 'edit';

    const memberOptions = members.map(m => ({ label: `${m.name} (${m.sport})`, value: m.id, id: m.id }));
    const sportOptions = SPORTS_LIST.map(s => ({ label: `${s.name} (${s.category})`, value: s.name, id: s.name }));
    const difficultyOptions = DIFFICULTY_LEVELS.map(d => (typeof d === 'string' ? { label: d, value: d, id: d } : { label: d.label || d, value: d.value || d, id: d.value || d }));
    const statusOptions = PLAN_STATUSES.map(s => (typeof s === 'string' ? { label: s, value: s, id: s } : { label: s.label || s, value: s.value || s, id: s.value || s }));
    const dayOptions = DAYS_OF_WEEK.map(d => (typeof d === 'string' ? { label: d, value: d, id: d } : { label: d.label || d, value: d.value || d, id: d.value || d }));

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        sport: '',
        difficulty: 'Beginner',
        duration: '',
        startDate: '',
        endDate: '',
        memberId: '',
        memberName: '',
        status: 'draft',
        goals: [],
        exercises: [],
        schedule: [],
        frequency: '',
        dietRecommendation: { calories: '', protein: '', carbs: '', fat: '', notes: '' },
        specialConsiderations: [],
    });

    // Modal visibility states
    const [showMemberPicker, setShowMemberPicker] = useState(false);
    const [showSportPicker, setShowSportPicker] = useState(false);
    const [showDifficultyPicker, setShowDifficultyPicker] = useState(false);
    const [showStatusPicker, setShowStatusPicker] = useState(false);
    const [showDayPicker, setShowDayPicker] = useState({ visible: false, dayIndex: -1 });

    useEffect(() => {
        if (isEdit && plan) {
            setFormData({
                title: plan.title || '',
                description: plan.description || '',
                sport: plan.sport || '',
                difficulty: plan.difficulty || 'Beginner',
                duration: plan.duration ? String(plan.duration) : '',
                startDate: plan.startDate || '',
                endDate: plan.endDate || '',
                memberId: plan.memberId || '',
                memberName: plan.memberName || '',
                status: plan.status || 'draft',
                goals: plan.goals || [],
                exercises: plan.exercises?.length > 0
                    ? plan.exercises.map(e => ({
                        ...e,
                        sets: String(e.sets || ''),
                        reps: String(e.reps || ''),
                        duration: String(e.duration || ''),
                        restTime: String(e.restTime || ''),
                    }))
                    : [],
                schedule: plan.schedule || [],
                frequency: plan.frequency || '',
                dietRecommendation: {
                    calories: plan.dietRecommendation?.calories ? String(plan.dietRecommendation.calories) : '',
                    protein: plan.dietRecommendation?.protein ? String(plan.dietRecommendation.protein) : '',
                    carbs: plan.dietRecommendation?.carbs ? String(plan.dietRecommendation.carbs) : '',
                    fat: plan.dietRecommendation?.fat ? String(plan.dietRecommendation.fat) : '',
                    notes: plan.dietRecommendation?.notes || '',
                },
                specialConsiderations: plan.specialConsiderations || [],
            });
        }
    }, [isEdit, plan]);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMemberSelect = (item) => {
        const member = members.find(m => m.id === item.value);
        setFormData(prev => ({
            ...prev,
            memberId: item.value,
            memberName: member?.name || '',
        }));
    };

    // ─── Exercise Handlers ───
    const addExercise = () => {
        setFormData(prev => ({
            ...prev,
            exercises: [...prev.exercises, { ...emptyExercise }],
        }));
    };

    const updateExercise = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev.exercises];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, exercises: updated };
        });
    };

    const removeExercise = index => {
        Alert.alert('Remove Exercise', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: () => {
                    setFormData(prev => ({
                        ...prev,
                        exercises: prev.exercises.filter((_, i) => i !== index),
                    }));
                },
            },
        ]);
    };

    // ─── Schedule Handlers ───
    const addScheduleDay = () => {
        setFormData(prev => ({
            ...prev,
            schedule: [...prev.schedule, { ...emptyScheduleDay }],
        }));
    };

    const updateScheduleDay = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev.schedule];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, schedule: updated };
        });
    };

    const addExerciseToScheduleDay = dayIndex => {
        setFormData(prev => {
            const updated = [...prev.schedule];
            updated[dayIndex] = {
                ...updated[dayIndex],
                exercises: [...(updated[dayIndex].exercises || []), ''],
            };
            return { ...prev, schedule: updated };
        });
    };

    const updateScheduleExercise = (dayIndex, exIndex, value) => {
        setFormData(prev => {
            const updated = [...prev.schedule];
            const exercises = [...(updated[dayIndex].exercises || [])];
            exercises[exIndex] = value;
            updated[dayIndex] = { ...updated[dayIndex], exercises };
            return { ...prev, schedule: updated };
        });
    };

    const removeScheduleExercise = (dayIndex, exIndex) => {
        setFormData(prev => {
            const updated = [...prev.schedule];
            const exercises = (updated[dayIndex].exercises || []).filter((_, i) => i !== exIndex);
            updated[dayIndex] = { ...updated[dayIndex], exercises };
            return { ...prev, schedule: updated };
        });
    };

    const removeScheduleDay = index => {
        Alert.alert('Remove Day', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: () => {
                    setFormData(prev => ({
                        ...prev,
                        schedule: prev.schedule.filter((_, i) => i !== index),
                    }));
                },
            },
        ]);
    };

    // ─── Save Handler ───
    const handleSave = () => {
        if (!formData.title.trim()) {
            Alert.alert('Validation', 'Please enter a plan title.');
            return;
        }
        if (!formData.memberId) {
            Alert.alert('Validation', 'Please select a member.');
            return;
        }
        if (!formData.sport) {
            Alert.alert('Validation', 'Please select a sport.');
            return;
        }
        if (!formData.duration) {
            Alert.alert('Validation', 'Please enter duration in weeks.');
            return;
        }
        if (!formData.startDate || !formData.endDate) {
            Alert.alert('Validation', 'Please select start and end dates.');
            return;
        }

        const payload = {
            ...formData,
            duration: Number(formData.duration),
            exercises: formData.exercises
                .filter(e => e.name.trim())
                .map(e => ({
                    ...e,
                    sets: Number(e.sets) || 0,
                    reps: Number(e.reps) || 0,
                    duration: Number(e.duration) || 0,
                    restTime: Number(e.restTime) || 0,
                })),
            schedule: formData.schedule
                .filter(s => s.day)
                .map(s => ({
                    day: s.day,
                    exercises: s.exercises,
                    notes: s.notes,
                })),
            dietRecommendation: {
                calories: Number(formData.dietRecommendation?.calories) || undefined,
                protein: Number(formData.dietRecommendation?.protein) || undefined,
                carbs: Number(formData.dietRecommendation?.carbs) || undefined,
                fat: Number(formData.dietRecommendation?.fat) || undefined,
                notes: formData.dietRecommendation?.notes || undefined,
            },
        };

        if (onSave) {
            onSave(payload);
        }

        Alert.alert(
            'Success',
            isEdit
                ? 'Training plan updated successfully!'
                : 'Training plan created successfully!',
            [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
    };

    const sportConfig = getSportConfig(formData.sport);

    return (
        <View className="flex-1 bg-gray-50">
            {/* ═══════════════════════════════════════════════ */}
            {/* ─── HEADER (matching Dashboard pattern) ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <LinearGradient
                colors={['#0f172a', '#1e3a8a', '#3b82f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingTop: 48, paddingBottom: 28, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
                {/* Top Bar */}
                <View className="flex-row justify-between items-center px-5 mb-3">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                        className="w-10 h-10 bg-white/15 rounded-full justify-center items-center">
                        <Icon name="arrow-left" size={22} color="#fff" />
                    </TouchableOpacity>
                    <Text className="text-white font-bold text-lg">
                        {isEdit ? 'Edit Training Plan' : 'Create Training Plan'}
                    </Text>
                    <View className="w-10 h-10" />
                </View>

                <View className="px-5">
                    <Text className="text-white/60 text-sm">
                        {isEdit ? 'Update plan details' : 'Set up a new training plan'}
                    </Text>
                </View>
            </LinearGradient>

            <ScrollView
                className="flex-1 px-4 pt-4"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── BASIC INFO SECTION ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <SectionCard title="Basic Info" icon="information-outline" iconColor="#1e3a8a">
                    {/* Member */}
                    <View className="mb-4">
                        <FieldLabel label="Member" required />
                        <DropdownButton
                            value={formData.memberName ? `${formData.memberName}` : ''}
                            placeholder="Select member"
                            onPress={() => setShowMemberPicker(true)}
                            icon="account-outline"
                        />
                    </View>

                    {/* Title */}
                    <View className="mb-4">
                        <FieldLabel label="Plan Title" required />
                        <TextInput
                            value={formData.title}
                            onChangeText={v => updateField('title', v)}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-sm font-medium"
                            placeholder="e.g., Beginner Strength Training"
                            placeholderTextColor="#9ca3af"
                            style={{ elevation: 1 }}
                        />
                    </View>

                    {/* Description */}
                    <View>
                        <FieldLabel label="Description" />
                        <TextInput
                            value={formData.description}
                            onChangeText={v => updateField('description', v)}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-sm"
                            placeholder="Describe the training plan..."
                            placeholderTextColor="#9ca3af"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            style={{ minHeight: 80, elevation: 1 }}
                        />
                    </View>
                </SectionCard>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── SPORT & DIFFICULTY SECTION ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <SectionCard title="Sport & Level" icon="run-fast" iconColor="#22c55e">
                    {/* Sport Picker */}
                    <View className="mb-4">
                        <FieldLabel label="Sport / Activity" required />
                        <DropdownButton
                            value={formData.sport}
                            placeholder="Select sport"
                            onPress={() => setShowSportPicker(true)}
                            icon="basketball"
                        />
                    </View>

                    {/* Difficulty */}
                    <View className="mb-4">
                        <FieldLabel label="Difficulty Level" />
                        <DropdownButton
                            value={formData.difficulty}
                            placeholder="Select difficulty"
                            onPress={() => setShowDifficultyPicker(true)}
                            icon="speedometer"
                        />
                    </View>

                    {/* Status */}
                    <View>
                        <FieldLabel label="Status" />
                        <DropdownButton
                            value={formData.status}
                            placeholder="Select status"
                            onPress={() => setShowStatusPicker(true)}
                            icon="flag-outline"
                        />
                    </View>
                </SectionCard>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── DURATION & DATES SECTION ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <SectionCard title="Duration & Dates" icon="calendar-clock" iconColor="#3b82f6">
                    {/* Duration */}
                    <View className="mb-4">
                        <FieldLabel label="Duration (weeks)" required />
                        <TextInput
                            value={formData.duration}
                            onChangeText={v => updateField('duration', v)}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-sm font-medium"
                            placeholder="e.g., 8"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            style={{ elevation: 1 }}
                        />
                    </View>

                    {/* Start & End Date Row */}
                    <View className="flex-row mb-4">
                        <View className="flex-1 mr-2">
                            <FieldLabel label="Start Date" required />
                            <DatePickerField
                                value={formData.startDate}
                                onChange={v => updateField('startDate', v)}
                                placeholder="Select start date"
                            />
                        </View>
                        <View className="flex-1 ml-2">
                            <FieldLabel label="End Date" required />
                            <DatePickerField
                                value={formData.endDate}
                                onChange={v => updateField('endDate', v)}
                                placeholder="Select end date"
                            />
                        </View>
                    </View>

                    {/* Frequency */}
                    <View>
                        <FieldLabel label="Frequency" />
                        <TextInput
                            value={formData.frequency}
                            onChangeText={v => updateField('frequency', v)}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-sm font-medium"
                            placeholder="e.g., 3 times per week, Daily"
                            placeholderTextColor="#9ca3af"
                            style={{ elevation: 1 }}
                        />
                    </View>
                </SectionCard>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── GOALS SECTION ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <SectionCard title="Goals" icon="target" iconColor="#8b5cf6">
                    <TagInput
                        tags={formData.goals}
                        onAdd={tag => updateField('goals', [...formData.goals, tag])}
                        onRemove={idx => updateField('goals', formData.goals.filter((_, i) => i !== idx))}
                        placeholder="Add a goal..."
                        color="purple"
                        icon="target"
                    />
                </SectionCard>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── EXERCISES SECTION ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <SectionCard
                    title="Exercises"
                    icon="dumbbell"
                    iconColor="#4f46e5"
                    rightAction={
                        <TouchableOpacity
                            onPress={addExercise}
                            activeOpacity={0.8}>
                            <LinearGradient
                                colors={['#1e3a8a', '#3b82f6']}
                                style={{ borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' }}>
                                <Icon name="plus" size={14} color="#fff" />
                                <Text className="text-white font-bold text-xs ml-1">Add</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    }>
                    {formData.exercises.length > 0 ? (
                        formData.exercises.map((ex, index) => (
                            <View
                                key={index}
                                className="bg-gray-50 rounded-xl p-3.5 mb-3 overflow-hidden"
                                style={{ borderLeftWidth: 3, borderLeftColor: sportConfig.color, elevation: 1 }}>
                                {/* Exercise Header */}
                                <View className="flex-row items-center justify-between mb-2.5">
                                    <View className="flex-row items-center">
                                        <LinearGradient
                                            colors={sportConfig.gradient}
                                            style={{ width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}>
                                            <Text className="text-white text-[10px] font-bold">
                                                {index + 1}
                                            </Text>
                                        </LinearGradient>
                                        <Text className="text-gray-900 font-bold text-xs ml-2">
                                            Exercise {index + 1}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => removeExercise(index)}
                                        className="w-8 h-8 bg-red-50 rounded-lg justify-center items-center"
                                        style={{ borderWidth: 1, borderColor: '#fecaca' }}>
                                        <Icon name="trash-can-outline" size={14} color="#dc2626" />
                                    </TouchableOpacity>
                                </View>

                                {/* Exercise Name */}
                                <TextInput
                                    value={ex.name}
                                    onChangeText={v => updateExercise(index, 'name', v)}
                                    className="bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 text-sm mb-2.5 font-medium"
                                    placeholder="Exercise name (e.g., Squats)"
                                    placeholderTextColor="#9ca3af"
                                />

                                {/* Sets, Reps, Duration Row */}
                                <View className="flex-row mb-2.5" style={{ gap: 6 }}>
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-[10px] mb-1 font-medium uppercase tracking-wider">Sets</Text>
                                        <TextInput
                                            value={ex.sets}
                                            onChangeText={v => updateExercise(index, 'sets', v)}
                                            className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-xs text-center font-medium"
                                            placeholder="3"
                                            placeholderTextColor="#9ca3af"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-[10px] mb-1 font-medium uppercase tracking-wider">Reps</Text>
                                        <TextInput
                                            value={ex.reps}
                                            onChangeText={v => updateExercise(index, 'reps', v)}
                                            className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-xs text-center font-medium"
                                            placeholder="12"
                                            placeholderTextColor="#9ca3af"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-[10px] mb-1 font-medium uppercase tracking-wider">Duration</Text>
                                        <TextInput
                                            value={ex.duration}
                                            onChangeText={v => updateExercise(index, 'duration', v)}
                                            className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-xs text-center font-medium"
                                            placeholder="10m"
                                            placeholderTextColor="#9ca3af"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                {/* Rest & Notes Row */}
                                <View className="flex-row mb-2.5" style={{ gap: 6 }}>
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-[10px] mb-1 font-medium uppercase tracking-wider">Rest (sec)</Text>
                                        <TextInput
                                            value={ex.restTime}
                                            onChangeText={v => updateExercise(index, 'restTime', v)}
                                            className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-xs text-center font-medium"
                                            placeholder="60"
                                            placeholderTextColor="#9ca3af"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-[10px] mb-1 font-medium uppercase tracking-wider">Notes</Text>
                                        <TextInput
                                            value={ex.notes || ''}
                                            onChangeText={v => updateExercise(index, 'notes', v)}
                                            className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-xs"
                                            placeholder="Notes..."
                                            placeholderTextColor="#9ca3af"
                                        />
                                    </View>
                                </View>

                                {/* Description */}
                                <TextInput
                                    value={ex.description || ''}
                                    onChangeText={v => updateExercise(index, 'description', v)}
                                    className="bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-gray-800 text-xs"
                                    placeholder="Exercise description (optional)"
                                    placeholderTextColor="#9ca3af"
                                    multiline
                                    numberOfLines={2}
                                    textAlignVertical="top"
                                    style={{ minHeight: 48 }}
                                />
                            </View>
                        ))
                    ) : (
                        <View className="items-center py-8 bg-gray-50 rounded-xl" style={{ borderWidth: 1, borderColor: '#f3f4f6', borderStyle: 'dashed' }}>
                            <View className="w-16 h-16 rounded-full bg-white justify-center items-center mb-3" style={{ elevation: 2 }}>
                                <Icon name="dumbbell" size={28} color="#d1d5db" />
                            </View>
                            <Text className="text-gray-900 font-bold text-sm">No exercises added</Text>
                            <Text className="text-gray-400 text-xs mt-1 text-center px-4">
                                Tap "Add" to start building the exercise plan
                            </Text>
                        </View>
                    )}
                </SectionCard>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── WEEKLY SCHEDULE SECTION ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <SectionCard
                    title="Weekly Schedule"
                    icon="calendar-week"
                    iconColor="#f59e0b"
                    rightAction={
                        <TouchableOpacity
                            onPress={addScheduleDay}
                            activeOpacity={0.8}>
                            <LinearGradient
                                colors={['#1e3a8a', '#3b82f6']}
                                style={{ borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' }}>
                                <Icon name="plus" size={14} color="#fff" />
                                <Text className="text-white font-bold text-xs ml-1">Add Day</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    }>
                    {formData.schedule.length > 0 ? (
                        formData.schedule.map((scheduleDay, dayIndex) => (
                            <View
                                key={dayIndex}
                                className="bg-gray-50 rounded-xl p-3.5 mb-3 overflow-hidden"
                                style={{ borderLeftWidth: 3, borderLeftColor: '#f59e0b', elevation: 1 }}>
                                {/* Day Header */}
                                <View className="flex-row items-center justify-between mb-2.5">
                                    <View className="flex-row items-center">
                                        <LinearGradient
                                            colors={['#f59e0b', '#d97706']}
                                            style={{ width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}>
                                            <Text className="text-white text-[10px] font-bold">
                                                {dayIndex + 1}
                                            </Text>
                                        </LinearGradient>
                                        <Text className="text-gray-900 font-bold text-xs ml-2">
                                            Day {dayIndex + 1}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => removeScheduleDay(dayIndex)}
                                        className="w-8 h-8 bg-red-50 rounded-lg justify-center items-center"
                                        style={{ borderWidth: 1, borderColor: '#fecaca' }}>
                                        <Icon name="trash-can-outline" size={14} color="#dc2626" />
                                    </TouchableOpacity>
                                </View>

                                {/* Day Selector */}
                                <View className="mb-2.5">
                                    <DropdownButton
                                        value={scheduleDay.day}
                                        placeholder="Select day"
                                        onPress={() => setShowDayPicker({ visible: true, dayIndex })}
                                        icon="calendar-today"
                                    />
                                </View>

                                {/* Day Notes */}
                                <View className="mb-2.5">
                                    <TextInput
                                        value={scheduleDay.notes || ''}
                                        onChangeText={v => updateScheduleDay(dayIndex, 'notes', v)}
                                        className="bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-800 text-xs"
                                        placeholder="Day notes (optional)"
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>

                                {/* Exercises for this day */}
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Exercises</Text>
                                    <TouchableOpacity
                                        onPress={() => addExerciseToScheduleDay(dayIndex)}
                                        activeOpacity={0.7}
                                        className="flex-row items-center bg-blue-50 px-2.5 py-1 rounded-full">
                                        <Icon name="plus" size={12} color="#2563eb" />
                                        <Text className="text-blue-600 text-[10px] font-bold ml-1">Add</Text>
                                    </TouchableOpacity>
                                </View>
                                {(scheduleDay.exercises || []).map((exName, exIndex) => (
                                    <View key={exIndex} className="flex-row items-center mb-2" style={{ gap: 6 }}>
                                        <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
                                        <View className="flex-1">
                                            <TextInput
                                                value={exName}
                                                onChangeText={v => updateScheduleExercise(dayIndex, exIndex, v)}
                                                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-xs font-medium"
                                                placeholder="Exercise name"
                                                placeholderTextColor="#9ca3af"
                                            />
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => removeScheduleExercise(dayIndex, exIndex)}
                                            className="w-7 h-7 bg-gray-100 rounded-lg justify-center items-center">
                                            <Icon name="close" size={12} color="#9ca3af" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {(scheduleDay.exercises || []).length === 0 && (
                                    <Text className="text-gray-300 text-xs text-center py-2 italic">
                                        No exercises for this day
                                    </Text>
                                )}
                            </View>
                        ))
                    ) : (
                        <View className="items-center py-8 bg-gray-50 rounded-xl" style={{ borderWidth: 1, borderColor: '#f3f4f6', borderStyle: 'dashed' }}>
                            <View className="w-16 h-16 rounded-full bg-white justify-center items-center mb-3" style={{ elevation: 2 }}>
                                <Icon name="calendar-blank" size={28} color="#d1d5db" />
                            </View>
                            <Text className="text-gray-900 font-bold text-sm">No schedule added</Text>
                            <Text className="text-gray-400 text-xs mt-1 text-center px-4">
                                Tap "Add Day" to build the weekly schedule
                            </Text>
                        </View>
                    )}
                </SectionCard>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── DIET RECOMMENDATION SECTION ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <SectionCard title="Diet Recommendation" icon="food-apple-outline" iconColor="#22c55e">
                    <View className="flex-row mb-2.5" style={{ gap: 6 }}>
                        <View className="flex-1">
                            <Text className="text-gray-400 text-[10px] mb-1 font-medium uppercase tracking-wider">Calories (kcal)</Text>
                            <TextInput
                                value={formData.dietRecommendation?.calories || ''}
                                onChangeText={v => setFormData(prev => ({
                                    ...prev,
                                    dietRecommendation: { ...prev.dietRecommendation, calories: v },
                                }))}
                                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-xs text-center font-medium"
                                placeholder="2000"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-400 text-[10px] mb-1 font-medium uppercase tracking-wider">Protein (g)</Text>
                            <TextInput
                                value={formData.dietRecommendation?.protein || ''}
                                onChangeText={v => setFormData(prev => ({
                                    ...prev,
                                    dietRecommendation: { ...prev.dietRecommendation, protein: v },
                                }))}
                                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-xs text-center font-medium"
                                placeholder="120"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                    <View className="flex-row mb-2.5" style={{ gap: 6 }}>
                        <View className="flex-1">
                            <Text className="text-gray-400 text-[10px] mb-1 font-medium uppercase tracking-wider">Carbs (g)</Text>
                            <TextInput
                                value={formData.dietRecommendation?.carbs || ''}
                                onChangeText={v => setFormData(prev => ({
                                    ...prev,
                                    dietRecommendation: { ...prev.dietRecommendation, carbs: v },
                                }))}
                                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-xs text-center font-medium"
                                placeholder="250"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-400 text-[10px] mb-1 font-medium uppercase tracking-wider">Fat (g)</Text>
                            <TextInput
                                value={formData.dietRecommendation?.fat || ''}
                                onChangeText={v => setFormData(prev => ({
                                    ...prev,
                                    dietRecommendation: { ...prev.dietRecommendation, fat: v },
                                }))}
                                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-xs text-center font-medium"
                                placeholder="60"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                    <View>
                        <Text className="text-gray-400 text-[10px] mb-1 font-medium uppercase tracking-wider">Diet Notes</Text>
                        <TextInput
                            value={formData.dietRecommendation?.notes || ''}
                            onChangeText={v => setFormData(prev => ({
                                ...prev,
                                dietRecommendation: { ...prev.dietRecommendation, notes: v },
                            }))}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm"
                            placeholder="Additional diet notes..."
                            placeholderTextColor="#9ca3af"
                            multiline
                            numberOfLines={2}
                            textAlignVertical="top"
                            style={{ minHeight: 56, elevation: 1 }}
                        />
                    </View>
                </SectionCard>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── SPECIAL CONSIDERATIONS SECTION ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <SectionCard title="Special Considerations" icon="alert-circle-outline" iconColor="#f59e0b">
                    <TagInput
                        tags={formData.specialConsiderations}
                        onAdd={tag => updateField('specialConsiderations', [...formData.specialConsiderations, tag])}
                        onRemove={idx => updateField('specialConsiderations', formData.specialConsiderations.filter((_, i) => i !== idx))}
                        placeholder="Add a consideration..."
                        color="amber"
                        icon="alert-circle-outline"
                    />
                </SectionCard>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── INFO BOX ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <LinearGradient
                    colors={['#eff6ff', '#dbeafe']}
                    style={{ borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#bfdbfe', marginBottom: 16 }}>
                    <View className="flex-row items-center mb-1.5">
                        <View className="w-6 h-6 rounded-lg bg-blue-100 justify-center items-center mr-2">
                            <Icon name="lightbulb-outline" size={12} color="#1e40af" />
                        </View>
                        <Text className="text-blue-800 font-bold text-xs">
                            Training Plan vs Session
                        </Text>
                    </View>
                    <Text className="text-blue-700 text-[10px] leading-4 ml-8">
                        <Text className="font-bold">Training Plan</Text> = Long-term program (8-12 weeks) — WHAT exercises to do.{'\n'}
                        <Text className="font-bold">Session</Text> = Single scheduled appointment — WHEN to do them.{'\n'}
                        💡 Create a Training Plan first, then create Sessions to schedule when the member will execute parts of the plan.
                    </Text>
                </LinearGradient>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── ACTION BUTTONS ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="flex-row mb-8" style={{ gap: 8 }}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                        className="flex-1"
                        style={{
                            borderRadius: 14,
                            borderWidth: 1.5,
                            borderColor: '#e5e7eb',
                            paddingVertical: 14,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#fff',
                        }}>
                        <Icon name="close" size={18} color="#6b7280" />
                        <Text className="text-gray-600 font-bold text-base ml-2">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSave}
                        activeOpacity={0.8}
                        className="flex-1">
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
                            <Icon
                                name={isEdit ? 'content-save' : 'plus-circle'}
                                size={18}
                                color="#fff"
                            />
                            <Text className="text-white font-bold text-base ml-2">
                                {isEdit ? 'Save' : 'Create'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Bottom Spacing */}
                <View className="h-6" />
            </ScrollView>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── PICKER MODALS ─── */}
            {/* ═══════════════════════════════════════════════ */}

            {/* Member Picker */}
            <PickerModal
                visible={showMemberPicker}
                onClose={() => setShowMemberPicker(false)}
                title="Select Member"
                data={memberOptions}
                selectedValue={formData.memberId}
                onSelect={handleMemberSelect}
                renderLabel={(item) => item.label}
            />

            {/* Sport Picker */}
            <PickerModal
                visible={showSportPicker}
                onClose={() => setShowSportPicker(false)}
                title="Select Sport"
                data={sportOptions}
                selectedValue={formData.sport}
                onSelect={(item) => updateField('sport', item.value)}
                renderLabel={(item) => item.label}
            />

            {/* Difficulty Picker */}
            <PickerModal
                visible={showDifficultyPicker}
                onClose={() => setShowDifficultyPicker(false)}
                title="Select Difficulty"
                data={difficultyOptions}
                selectedValue={formData.difficulty}
                onSelect={(item) => updateField('difficulty', item.value)}
                renderLabel={(item) => item.label}
            />

            {/* Status Picker */}
            <PickerModal
                visible={showStatusPicker}
                onClose={() => setShowStatusPicker(false)}
                title="Select Status"
                data={statusOptions}
                selectedValue={formData.status}
                onSelect={(item) => updateField('status', item.value)}
                renderLabel={(item) => item.label}
            />

            {/* Day Picker */}
            <PickerModal
                visible={showDayPicker.visible}
                onClose={() => setShowDayPicker({ visible: false, dayIndex: -1 })}
                title="Select Day"
                data={dayOptions}
                selectedValue={showDayPicker.dayIndex >= 0 ? formData.schedule[showDayPicker.dayIndex]?.day : ''}
                onSelect={(item) => {
                    if (showDayPicker.dayIndex >= 0) {
                        updateScheduleDay(showDayPicker.dayIndex, 'day', item.value);
                    }
                }}
                renderLabel={(item) => item.label}
            />
        </View>
    );
};

export default CreateEditTrainingPlanScreen;