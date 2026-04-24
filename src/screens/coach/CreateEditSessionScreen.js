import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    FlatList,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SESSION_TYPES, FACILITIES, SPORTS_LIST, TRAINING_PLANS } from '../../data/sessions';
import { members } from '../../data/members';
import { trainingPlans as allTrainingPlans } from '../../data/trainingPlans';

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

// ─── Reusable Section Card (matching MemberProfileScreen pattern) ───
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

// ─── Picker Modal Component ───
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
                            const isSelected = (item._id || item.id || item.value) === selectedValue;
                            return (
                                <TouchableOpacity
                                    onPress={() => {
                                        onSelect(item);
                                        onClose();
                                    }}
                                    activeOpacity={0.7}
                                    className={`flex-row items-center px-6 py-4 border-b border-gray-50 ${isSelected ? 'bg-blue-50' : ''
                                        }`}>
                                    <View className="flex-1">
                                        <Text className={`text-sm ${isSelected ? 'text-blue-700 font-bold' : 'text-gray-800 font-medium'}`}>
                                            {renderLabel ? renderLabel(item) : item.name || item.label || item.title}
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

// ─── Dropdown Button Component ───
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

// ─── Form Field Label ───
const FieldLabel = ({ label, required }) => (
    <Text className="text-gray-500 text-xs mb-2 font-semibold uppercase tracking-wider">
        {label} {required && <Text className="text-red-500">*</Text>}
    </Text>
);

// ─── Helper: Format Date to YYYY-MM-DD ───
const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// ─── Helper: Format Time to HH:MM ───
const formatTime = (date) => {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
};

// ─── Helper: Parse YYYY-MM-DD string to Date ───
const parseDateString = (str) => {
    if (!str) return new Date();
    const parts = str.split('-');
    if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        if (!isNaN(d.getTime())) return d;
    }
    return new Date();
};

// ─── Helper: Parse HH:MM string to Date ───
const parseTimeString = (str) => {
    if (!str) return new Date();
    const parts = str.split(':');
    if (parts.length >= 2) {
        const d = new Date();
        d.setHours(parseInt(parts[0], 10) || 0, parseInt(parts[1], 10) || 0, 0, 0);
        if (!isNaN(d.getTime())) return d;
    }
    return new Date();
};

const CreateEditSessionScreen = ({ navigation, route }) => {
    const mode = route?.params?.mode || 'create';
    const existingSession = route?.params?.session || null;
    const onSave = route?.params?.onSave;

    const [formData, setFormData] = useState({
        title: existingSession?.title || '',
        description: existingSession?.description || '',
        type: existingSession?.type || 'personal_training',
        sportId: existingSession?.sportId || '',
        sport: existingSession?.sport || '',
        date: existingSession?.date || '',
        startTime: existingSession?.startTime || '',
        endTime: existingSession?.endTime || '',
        location: existingSession?.location || existingSession?.facilityName || '',
        facilityId: existingSession?.facilityId || '',
        facilityName: existingSession?.facilityName || '',
        maxParticipants: existingSession?.maxParticipants?.toString() || existingSession?.maxSlots?.toString() || '1',
        price: existingSession?.price?.toString() || '0',
        notes: existingSession?.notes || '',
        status: existingSession?.status || 'scheduled',
        memberId: existingSession?.memberId || '',
        memberName: existingSession?.memberName || '',
        trainingPlanId: existingSession?.trainingPlanId || '',
        trainingPlanTitle: '',
        exercisePlan: existingSession?.exercisePlan?.length > 0
            ? existingSession.exercisePlan
            : [],
    });

    // Modal visibility states
    const [showSportPicker, setShowSportPicker] = useState(false);
    const [showFacilityPicker, setShowFacilityPicker] = useState(false);
    const [showMemberPicker, setShowMemberPicker] = useState(false);
    const [showTrainingPlanPicker, setShowTrainingPlanPicker] = useState(false);

    // Date & Time Picker states
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    // ─── Date Picker Handler ───
    const onDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (event.type === 'dismissed') {
            setShowDatePicker(false);
            return;
        }
        if (selectedDate) {
            setFormData(prev => ({ ...prev, date: formatDate(selectedDate) }));
        }
    };

    // ─── Start Time Picker Handler ───
    const onStartTimeChange = (event, selectedTime) => {
        if (Platform.OS === 'android') {
            setShowStartTimePicker(false);
        }
        if (event.type === 'dismissed') {
            setShowStartTimePicker(false);
            return;
        }
        if (selectedTime) {
            setFormData(prev => ({ ...prev, startTime: formatTime(selectedTime) }));
        }
    };

    // ─── End Time Picker Handler ───
    const onEndTimeChange = (event, selectedTime) => {
        if (Platform.OS === 'android') {
            setShowEndTimePicker(false);
        }
        if (event.type === 'dismissed') {
            setShowEndTimePicker(false);
            return;
        }
        if (selectedTime) {
            setFormData(prev => ({ ...prev, endTime: formatTime(selectedTime) }));
        }
    };

    // ─── Filtered training plans based on selected member ───
    const getFilteredTrainingPlans = () => {
        if (!formData.memberId) return allTrainingPlans;
        return allTrainingPlans.filter(
            plan => plan.memberId === formData.memberId,
        );
    };

    // ─── Exercise Plan Handlers ───
    const addExercise = () => {
        setFormData(prev => ({
            ...prev,
            exercisePlan: [
                ...prev.exercisePlan,
                { exercise: '', sets: '', reps: '', weight: '', unit: 'kg', notes: '' },
            ],
        }));
    };

    const updateExercise = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev.exercisePlan];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, exercisePlan: updated };
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
                        exercisePlan: prev.exercisePlan.filter((_, i) => i !== index),
                    }));
                },
            },
        ]);
    };

    // ─── Calculate Duration ───
    const calculateDuration = (start, end) => {
        if (!start || !end) return 0;
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        return (eh * 60 + em) - (sh * 60 + sm);
    };

    // ─── Save Handler ───
    const handleSave = () => {
        if (!formData.title.trim()) {
            Alert.alert('Validation', 'Please enter a session title.');
            return;
        }
        if (!formData.date.trim()) {
            Alert.alert('Validation', 'Please enter a date (YYYY-MM-DD).');
            return;
        }
        if (!formData.startTime.trim()) {
            Alert.alert('Validation', 'Please enter a start time.');
            return;
        }
        if (!formData.endTime.trim()) {
            Alert.alert('Validation', 'Please enter an end time.');
            return;
        }

        const duration = calculateDuration(formData.startTime, formData.endTime);

        const sessionData = {
            title: formData.title,
            description: formData.description,
            type: formData.type,
            sportId: formData.sportId,
            sport: formData.sport,
            date: formData.date,
            startTime: formData.startTime,
            endTime: formData.endTime,
            time: formData.startTime,
            duration,
            location: formData.facilityName || formData.location,
            facilityId: formData.facilityId,
            facilityName: formData.facilityName || formData.location,
            maxParticipants: parseInt(formData.maxParticipants, 10) || 1,
            price: parseInt(formData.price, 10) || 0,
            notes: formData.notes,
            status: formData.status,
            memberId: formData.memberId,
            memberName: formData.memberName,
            trainingPlanId: formData.trainingPlanId,
            exercisePlan: formData.exercisePlan
                .filter(e => e.exercise.trim())
                .map(e => ({
                    ...e,
                    sets: Number(e.sets) || 0,
                    reps: Number(e.reps) || 0,
                    weight: Number(e.weight) || 0,
                })),
        };

        if (onSave) {
            onSave(sessionData);
        }

        Alert.alert(
            'Success',
            mode === 'create'
                ? 'Session created successfully!'
                : 'Session updated successfully!',
            [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
    };

    // ─── Get selected display names ───
    const getSelectedSportName = () => {
        if (formData.sport) return formData.sport;
        const found = SPORTS_LIST.find(s => s._id === formData.sportId);
        return found ? found.name : '';
    };

    const getSelectedFacilityName = () => {
        if (formData.facilityName) return formData.facilityName;
        const found = FACILITIES.find(f => f._id === formData.facilityId);
        return found ? found.name : '';
    };

    const getSelectedMemberName = () => {
        if (formData.memberName) return formData.memberName;
        const found = members.find(m => m.id === formData.memberId);
        return found ? found.name : '';
    };

    const getSelectedPlanTitle = () => {
        if (formData.trainingPlanTitle) return formData.trainingPlanTitle;
        const found = allTrainingPlans.find(p => p._id === formData.trainingPlanId);
        return found ? found.title : '';
    };

    const sportConfig = getSportConfig(formData.sport);

    // ─── iOS Picker Modal Component ───
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
                        {mode === 'create' ? 'Create Session' : 'Edit Session'}
                    </Text>
                    <View className="w-10 h-10" />
                </View>

                <View className="px-5">
                    <Text className="text-white/60 text-sm">
                        {mode === 'create'
                            ? 'Add a new training session'
                            : 'Update session details'}
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
                    {/* Title */}
                    <View className="mb-4">
                        <FieldLabel label="Session Title" required />
                        <TextInput
                            value={formData.title}
                            onChangeText={text => setFormData({ ...formData, title: text })}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-sm font-medium"
                            placeholder="e.g., Chest & Triceps - Rahul"
                            placeholderTextColor="#9ca3af"
                            style={{ elevation: 1 }}
                        />
                    </View>

                    {/* Type Selection */}
                    <View className="mb-4">
                        <FieldLabel label="Session Type" />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View className="flex-row">
                                {SESSION_TYPES.map(type => {
                                    const isActive = formData.type === type.value;
                                    return (
                                        <TouchableOpacity
                                            key={type.value}
                                            onPress={() => setFormData({ ...formData, type: type.value })}
                                            activeOpacity={0.7}
                                            style={{
                                                marginRight: 8,
                                                borderRadius: 20,
                                                overflow: 'hidden',
                                            }}>
                                            {isActive ? (
                                                <LinearGradient
                                                    colors={['#1e3a8a', '#3b82f6']}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 0 }}
                                                    style={{
                                                        paddingHorizontal: 16,
                                                        paddingVertical: 10,
                                                        borderRadius: 20,
                                                    }}>
                                                    <Text className="text-white text-xs font-bold">
                                                        {type.label}
                                                    </Text>
                                                </LinearGradient>
                                            ) : (
                                                <View
                                                    style={{
                                                        paddingHorizontal: 16,
                                                        paddingVertical: 10,
                                                        borderRadius: 20,
                                                        backgroundColor: '#fff',
                                                        borderWidth: 1,
                                                        borderColor: '#e5e7eb',
                                                    }}>
                                                    <Text className="text-gray-600 text-xs font-semibold">
                                                        {type.label}
                                                    </Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Description */}
                    <View>
                        <FieldLabel label="Description" />
                        <TextInput
                            value={formData.description}
                            onChangeText={text => setFormData({ ...formData, description: text })}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-sm"
                            placeholder="Describe the session..."
                            placeholderTextColor="#9ca3af"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            style={{ minHeight: 80, elevation: 1 }}
                        />
                    </View>
                </SectionCard>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── SPORT & FACILITY SECTION ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <SectionCard title="Sport & Location" icon="run-fast" iconColor="#22c55e">
                    {/* Sport Picker */}
                    <View className="mb-4">
                        <FieldLabel label="Sport / Activity" />
                        <DropdownButton
                            value={getSelectedSportName()}
                            placeholder="Select sport"
                            onPress={() => setShowSportPicker(true)}
                            icon="basketball"
                        />
                        <Text className="text-gray-400 text-[10px] mt-1.5 ml-1">
                            Only sports matching your specializations & club are shown
                        </Text>
                    </View>

                    {/* Facility Picker */}
                    <View>
                        <FieldLabel label="Facility / Location" />
                        <DropdownButton
                            value={getSelectedFacilityName()}
                            placeholder="Select facility"
                            onPress={() => setShowFacilityPicker(true)}
                            icon="map-marker-outline"
                        />
                        <Text className="text-gray-400 text-[10px] mt-1.5 ml-1">
                            Both Facility ID & Name will be stored automatically
                        </Text>
                    </View>
                </SectionCard>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── MEMBER & TRAINING PLAN SECTION ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <SectionCard title="Member & Plan" icon="account-group" iconColor="#8b5cf6">
                    {/* Member Picker */}
                    <View className="mb-4">
                        <FieldLabel label="Member" />
                        <DropdownButton
                            value={getSelectedMemberName()}
                            placeholder="Select member"
                            onPress={() => setShowMemberPicker(true)}
                            icon="account-outline"
                        />
                    </View>

                    {/* Training Plan Picker */}
                    <View className="mb-4">
                        <FieldLabel label="Training Plan (Optional)" />
                        {getFilteredTrainingPlans().length > 0 ? (
                            <DropdownButton
                                value={getSelectedPlanTitle()}
                                placeholder="Link to training plan"
                                onPress={() => setShowTrainingPlanPicker(true)}
                                icon="file-document-outline"
                            />
                        ) : (
                            <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5">
                                <Text className="text-gray-400 text-sm">
                                    {formData.memberId
                                        ? 'No training plans found for this member'
                                        : 'Select a member first to see their training plans'}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Info Box */}
                    <LinearGradient
                        colors={['#eff6ff', '#dbeafe']}
                        style={{ borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#bfdbfe' }}>
                        <View className="flex-row items-center mb-1.5">
                            <View className="w-6 h-6 rounded-lg bg-blue-100 justify-center items-center mr-2">
                                <Icon name="lightbulb-outline" size={12} color="#1e40af" />
                            </View>
                            <Text className="text-blue-800 font-bold text-xs">
                                Session vs Training Plan
                            </Text>
                        </View>
                        <Text className="text-blue-700 text-[10px] leading-4 ml-8">
                            <Text className="font-bold">Training Plan</Text> = Long-term program (8-12 weeks) — WHAT exercises to do.{'\n'}
                            <Text className="font-bold">Session</Text> = Single scheduled appointment — WHEN to do them.{'\n'}
                            💡 Training Plan select karne par exercises automatically Exercise Plan mein aa jayenge.
                        </Text>
                    </LinearGradient>
                </SectionCard>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── DATE & TIME SECTION ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <SectionCard title="Date & Time" icon="calendar-clock" iconColor="#3b82f6">
                    {/* ─── Date Field with Picker ─── */}
                    <View className="mb-4">
                        <FieldLabel label="Date" required />
                        <View className="flex-row items-center">
                            <View className="flex-1 mr-2">
                                <TextInput
                                    value={formData.date}
                                    onChangeText={text => setFormData({ ...formData, date: text })}
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-sm font-medium"
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="default"
                                    style={{ elevation: 1 }}
                                />
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                activeOpacity={0.7}>
                                <LinearGradient
                                    colors={['#3b82f6', '#60a5fa']}
                                    style={{ width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}>
                                    <Icon name="calendar" size={22} color="#fff" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* ─── Start Time & End Time Row ─── */}
                    <View className="flex-row mb-4">
                        {/* Start Time */}
                        <View className="flex-1 mr-2">
                            <FieldLabel label="Start Time" required />
                            <View className="flex-row items-center">
                                <View className="flex-1 mr-2">
                                    <TextInput
                                        value={formData.startTime}
                                        onChangeText={text => setFormData({ ...formData, startTime: text })}
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-sm font-medium"
                                        placeholder="HH:MM"
                                        placeholderTextColor="#9ca3af"
                                        keyboardType="default"
                                        style={{ elevation: 1 }}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={() => setShowStartTimePicker(true)}
                                    activeOpacity={0.7}>
                                    <LinearGradient
                                        colors={['#22c55e', '#16a34a']}
                                        style={{ width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                                        <Icon name="clock-outline" size={20} color="#fff" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* End Time */}
                        <View className="flex-1 ml-2">
                            <FieldLabel label="End Time" required />
                            <View className="flex-row items-center">
                                <View className="flex-1 mr-2">
                                    <TextInput
                                        value={formData.endTime}
                                        onChangeText={text => setFormData({ ...formData, endTime: text })}
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-sm font-medium"
                                        placeholder="HH:MM"
                                        placeholderTextColor="#9ca3af"
                                        keyboardType="default"
                                        style={{ elevation: 1 }}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={() => setShowEndTimePicker(true)}
                                    activeOpacity={0.7}>
                                    <LinearGradient
                                        colors={['#f59e0b', '#d97706']}
                                        style={{ width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                                        <Icon name="clock-check-outline" size={20} color="#fff" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Duration Display */}
                    {formData.startTime && formData.endTime ? (
                        <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3" style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                            <View className="w-8 h-8 rounded-lg bg-blue-50 justify-center items-center mr-2.5">
                                <Icon name="timer-outline" size={16} color="#3b82f6" />
                            </View>
                            <View>
                                <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">Duration</Text>
                                <Text className="text-gray-900 font-bold text-sm">
                                    {calculateDuration(formData.startTime, formData.endTime)} minutes
                                </Text>
                            </View>
                        </View>
                    ) : null}
                </SectionCard>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── CAPACITY & PRICING SECTION ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <SectionCard title="Capacity & Pricing" icon="account-multiple-check" iconColor="#f59e0b">
                    <View className="flex-row mb-4">
                        <View className="flex-1 mr-2">
                            <FieldLabel label="Max Participants" />
                            <TextInput
                                value={formData.maxParticipants}
                                onChangeText={text => setFormData({ ...formData, maxParticipants: text })}
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-sm font-medium text-center"
                                placeholder="1"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                                style={{ elevation: 1 }}
                            />
                        </View>
                        <View className="flex-1 ml-2">
                            <FieldLabel label="Additional Charges (₹)" />
                            <TextInput
                                value={formData.price}
                                onChangeText={text => setFormData({ ...formData, price: text })}
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-sm font-medium text-center"
                                placeholder="0"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                                style={{ elevation: 1 }}
                            />
                        </View>
                    </View>

                    {/* Pricing Note */}
                    <LinearGradient
                        colors={['#fffbeb', '#fef3c7']}
                        style={{ borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#fde68a' }}>
                        <View className="flex-row items-center mb-1.5">
                            <View className="w-6 h-6 rounded-lg bg-amber-100 justify-center items-center mr-2">
                                <Text className="text-xs">💰</Text>
                            </View>
                            <Text className="text-amber-800 font-bold text-xs">
                                Session Pricing Note
                            </Text>
                        </View>
                        <Text className="text-amber-700 text-[10px] leading-4 ml-8">
                            Regular sessions are <Text className="font-bold">included in member's membership plan</Text> — no extra charge (₹0).{'\n'}
                            Only add charges for <Text className="font-bold">premium/special sessions</Text> (e.g., guest workshops, certifications).
                        </Text>
                    </LinearGradient>
                </SectionCard>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── EXERCISE PLAN SECTION ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <SectionCard
                    title="Exercise Plan"
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
                    {formData.exercisePlan.length > 0 ? (
                        formData.exercisePlan.map((ex, index) => (
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
                                    value={ex.exercise}
                                    onChangeText={text => updateExercise(index, 'exercise', text)}
                                    className="bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 text-sm mb-2.5 font-medium"
                                    placeholder="Exercise name (e.g., Squats)"
                                    placeholderTextColor="#9ca3af"
                                />

                                {/* Sets, Reps, Weight Row */}
                                <View className="flex-row mb-2.5" style={{ gap: 6 }}>
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-[10px] mb-1 font-medium uppercase tracking-wider">Sets</Text>
                                        <TextInput
                                            value={String(ex.sets || '')}
                                            onChangeText={text => updateExercise(index, 'sets', text)}
                                            className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-xs text-center font-medium"
                                            placeholder="3"
                                            placeholderTextColor="#9ca3af"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-[10px] mb-1 font-medium uppercase tracking-wider">Reps</Text>
                                        <TextInput
                                            value={String(ex.reps || '')}
                                            onChangeText={text => updateExercise(index, 'reps', text)}
                                            className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-xs text-center font-medium"
                                            placeholder="12"
                                            placeholderTextColor="#9ca3af"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-[10px] mb-1 font-medium uppercase tracking-wider">
                                            Weight ({ex.unit || 'kg'})
                                        </Text>
                                        <TextInput
                                            value={String(ex.weight || '')}
                                            onChangeText={text => updateExercise(index, 'weight', text)}
                                            className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-xs text-center font-medium"
                                            placeholder="20"
                                            placeholderTextColor="#9ca3af"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                {/* Exercise Notes */}
                                <TextInput
                                    value={ex.notes || ''}
                                    onChangeText={text => updateExercise(index, 'notes', text)}
                                    className="bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-gray-800 text-xs"
                                    placeholder="Notes (optional)"
                                    placeholderTextColor="#9ca3af"
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
                                Tap "Add" or link a Training Plan to auto-populate
                            </Text>
                        </View>
                    )}
                </SectionCard>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── NOTES SECTION ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <SectionCard title="Notes" icon="note-text-outline" iconColor="#6b7280">
                    <TextInput
                        value={formData.notes}
                        onChangeText={text => setFormData({ ...formData, notes: text })}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-sm"
                        placeholder="Any additional notes..."
                        placeholderTextColor="#9ca3af"
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        style={{ minHeight: 80, elevation: 1 }}
                    />
                </SectionCard>

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
                                name={mode === 'create' ? 'plus-circle' : 'content-save'}
                                size={18}
                                color="#fff"
                            />
                            <Text className="text-white font-bold text-base ml-2">
                                {mode === 'create' ? 'Create' : 'Save'}
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

            {/* Sport Picker */}
            <PickerModal
                visible={showSportPicker}
                onClose={() => setShowSportPicker(false)}
                title="Select Sport"
                data={SPORTS_LIST}
                selectedValue={formData.sportId}
                onSelect={(item) => {
                    setFormData(prev => ({
                        ...prev,
                        sportId: item._id,
                        sport: item.name,
                    }));
                }}
                renderLabel={(item) => `${item.name} (${item.category})`}
            />

            {/* Facility Picker */}
            <PickerModal
                visible={showFacilityPicker}
                onClose={() => setShowFacilityPicker(false)}
                title="Select Facility"
                data={FACILITIES}
                selectedValue={formData.facilityId}
                onSelect={(item) => {
                    setFormData(prev => ({
                        ...prev,
                        facilityId: item._id,
                        facilityName: item.name,
                        location: item.name,
                    }));
                }}
                renderLabel={(item) => `${item.name} (${item.type}) - ${item.location}`}
            />

            {/* Member Picker */}
            <PickerModal
                visible={showMemberPicker}
                onClose={() => setShowMemberPicker(false)}
                title="Select Member"
                data={members}
                selectedValue={formData.memberId}
                onSelect={(item) => {
                    setFormData(prev => ({
                        ...prev,
                        memberId: item.id,
                        memberName: item.name,
                        trainingPlanId: '',
                        trainingPlanTitle: '',
                    }));
                }}
                renderLabel={(item) => `${item.name} (${item.email})`}
            />

            {/* Training Plan Picker */}
            <PickerModal
                visible={showTrainingPlanPicker}
                onClose={() => setShowTrainingPlanPicker(false)}
                title="Select Training Plan"
                data={[
                    { _id: '__none__', title: 'No training plan', status: '' },
                    ...getFilteredTrainingPlans(),
                ]}
                selectedValue={formData.trainingPlanId || '__none__'}
                onSelect={(item) => {
                    if (item._id === '__none__') {
                        setFormData(prev => ({
                            ...prev,
                            trainingPlanId: '',
                            trainingPlanTitle: '',
                        }));
                        return;
                    }

                    let autoExercises = [];
                    if (item.exercises && item.exercises.length > 0) {
                        autoExercises = item.exercises.map(ex => ({
                            exercise: ex.name || '',
                            sets: ex.sets ? String(ex.sets) : '',
                            reps: ex.reps ? String(ex.reps) : '',
                            weight: '',
                            unit: 'kg',
                            notes: ex.notes || '',
                        }));
                    }

                    setFormData(prev => ({
                        ...prev,
                        trainingPlanId: item._id,
                        trainingPlanTitle: item.title,
                        exercisePlan: autoExercises.length > 0 ? autoExercises : prev.exercisePlan,
                    }));

                    if (autoExercises.length > 0) {
                        Alert.alert(
                            'Exercises Auto-Populated',
                            `${autoExercises.length} exercises from "${item.title}" have been added to the Exercise Plan.`,
                        );
                    }
                }}
                renderLabel={(item) =>
                    item._id === '__none__'
                        ? 'No training plan'
                        : `${item.title} (${item.status})`
                }
            />

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── DATE & TIME PICKER MODALS ─── */}
            {/* ═══════════════════════════════════════════════ */}

            {/* Date Picker - Android */}
            {Platform.OS === 'android' && showDatePicker && (
                <DateTimePicker
                    value={parseDateString(formData.date)}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}

            {/* Date Picker - iOS */}
            {Platform.OS === 'ios' && (
                <IOSPickerModal
                    visible={showDatePicker}
                    onClose={() => setShowDatePicker(false)}
                    title="Select Date">
                    <DateTimePicker
                        value={parseDateString(formData.date)}
                        mode="date"
                        display="spinner"
                        onChange={onDateChange}
                        style={{ height: 200 }}
                    />
                </IOSPickerModal>
            )}

            {/* Start Time Picker - Android */}
            {Platform.OS === 'android' && showStartTimePicker && (
                <DateTimePicker
                    value={parseTimeString(formData.startTime)}
                    mode="time"
                    display="default"
                    is24Hour={true}
                    onChange={onStartTimeChange}
                />
            )}

            {/* Start Time Picker - iOS */}
            {Platform.OS === 'ios' && (
                <IOSPickerModal
                    visible={showStartTimePicker}
                    onClose={() => setShowStartTimePicker(false)}
                    title="Select Start Time">
                    <DateTimePicker
                        value={parseTimeString(formData.startTime)}
                        mode="time"
                        display="spinner"
                        is24Hour={true}
                        onChange={onStartTimeChange}
                        style={{ height: 200 }}
                    />
                </IOSPickerModal>
            )}

            {/* End Time Picker - Android */}
            {Platform.OS === 'android' && showEndTimePicker && (
                <DateTimePicker
                    value={parseTimeString(formData.endTime)}
                    mode="time"
                    display="default"
                    is24Hour={true}
                    onChange={onEndTimeChange}
                />
            )}

            {/* End Time Picker - iOS */}
            {Platform.OS === 'ios' && (
                <IOSPickerModal
                    visible={showEndTimePicker}
                    onClose={() => setShowEndTimePicker(false)}
                    title="Select End Time">
                    <DateTimePicker
                        value={parseTimeString(formData.endTime)}
                        mode="time"
                        display="spinner"
                        is24Hour={true}
                        onChange={onEndTimeChange}
                        style={{ height: 200 }}
                    />
                </IOSPickerModal>
            )}
        </View>
    );
};

export default CreateEditSessionScreen;