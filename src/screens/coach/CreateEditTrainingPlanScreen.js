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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { members } from '../../data/members';
import { SPORTS_LIST } from '../../data/sessions';
import { DAYS_OF_WEEK, DIFFICULTY_LEVELS, PLAN_STATUSES } from '../../data/trainingPlans';

// ─── Reusable Components ───
const SectionTitle = ({ icon, title, actionLabel, onAction }) => (
    <View className="flex-row items-center justify-between mb-3 mt-5">
        <View className="flex-row items-center">
            <Icon name={icon} size={18} color="#1e3a8a" />
            <Text className="text-gray-900 font-bold text-base ml-2">{title}</Text>
        </View>
        {actionLabel && (
            <TouchableOpacity
                onPress={onAction}
                className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-full">
                <Icon name="plus" size={14} color="#2563eb" />
                <Text className="text-blue-600 text-xs font-semibold ml-1">{actionLabel}</Text>
            </TouchableOpacity>
        )}
    </View>
);

const FormLabel = ({ label, required }) => (
    <Text className="text-gray-700 font-semibold text-sm mb-1.5">
        {label}
        {required && <Text className="text-red-500"> *</Text>}
    </Text>
);

const FormInput = ({ placeholder, value, onChangeText, multiline, numberOfLines, keyboardType, ...props }) => (
    <TextInput
        className={`bg-white border border-gray-200 rounded-xl px-4 ${multiline ? 'py-3' : 'py-3'} text-gray-900 text-sm`}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType || 'default'}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={multiline ? { minHeight: numberOfLines ? numberOfLines * 24 : 72 } : {}}
        {...props}
    />
);

const PickerButton = ({ label, value, options, onSelect }) => {
    const [showOptions, setShowOptions] = useState(false);

    return (
        <View>
            <TouchableOpacity
                onPress={() => setShowOptions(!showOptions)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between">
                <Text className={value ? 'text-gray-900 text-sm' : 'text-gray-400 text-sm'}>
                    {value || label}
                </Text>
                <Icon name={showOptions ? 'chevron-up' : 'chevron-down'} size={18} color="#6b7280" />
            </TouchableOpacity>
            {showOptions && (
                <View className="bg-white border border-gray-200 rounded-xl mt-1 overflow-hidden" style={{ elevation: 4 }}>
                    <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                        {options.map((option, idx) => (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => {
                                    onSelect(typeof option === 'string' ? option : option.value);
                                    setShowOptions(false);
                                }}
                                className={`px-4 py-3 border-b border-gray-50 ${(typeof option === 'string' ? option : option.value) === value ? 'bg-blue-50' : ''}`}>
                                <Text className={`text-sm ${(typeof option === 'string' ? option : option.value) === value ? 'text-blue-700 font-semibold' : 'text-gray-700'}`}>
                                    {typeof option === 'string' ? option : option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const TagInput = ({ tags, onAdd, onRemove, placeholder, color = 'purple' }) => {
    const [input, setInput] = useState('');

    const handleAdd = () => {
        const trimmed = input.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onAdd(trimmed);
            setInput('');
        }
    };

    const bgColor = color === 'purple' ? 'bg-purple-50' : 'bg-amber-50';
    const textColor = color === 'purple' ? 'text-purple-700' : 'text-amber-700';

    return (
        <View>
            <View className="flex-row items-center gap-2">
                <View className="flex-1">
                    <FormInput
                        placeholder={placeholder}
                        value={input}
                        onChangeText={setInput}
                        onSubmitEditing={handleAdd}
                        returnKeyType="done"
                    />
                </View>
                <TouchableOpacity
                    onPress={handleAdd}
                    className="w-11 h-11 bg-blue-50 rounded-xl justify-center items-center">
                    <Icon name="plus" size={20} color="#2563eb" />
                </TouchableOpacity>
            </View>
            {tags.length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-2">
                    {tags.map((tag, idx) => (
                        <View key={idx} className={`${bgColor} flex-row items-center px-3 py-1.5 rounded-full`}>
                            <Text className={`${textColor} text-xs font-medium`}>{tag}</Text>
                            <TouchableOpacity onPress={() => onRemove(idx)} className="ml-1.5">
                                <Icon name="close-circle" size={14} color={color === 'purple' ? '#7c3aed' : '#d97706'} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
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

    const memberOptions = members.map(m => ({ label: `${m.name} (${m.sport})`, value: m.id }));
    const sportOptions = SPORTS_LIST.map(s => ({ label: `${s.name} (${s.category})`, value: s.name }));

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

    const handleMemberSelect = memberId => {
        const member = members.find(m => m.id === memberId);
        setFormData(prev => ({
            ...prev,
            memberId,
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
        setFormData(prev => ({
            ...prev,
            exercises: prev.exercises.filter((_, i) => i !== index),
        }));
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
        setFormData(prev => ({
            ...prev,
            schedule: prev.schedule.filter((_, i) => i !== index),
        }));
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
            Alert.alert('Validation', 'Please enter start and end dates.');
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
        navigation.goBack();
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-gray-50"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            {/* Header */}
            <LinearGradient
                colors={['#1e3a8a', '#3b82f6']}
                className="px-6 pt-12 pb-6">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 bg-white/20 rounded-full justify-center items-center mr-3">
                        <Icon name="arrow-left" size={22} color="#fff" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-white font-bold text-xl">
                            {isEdit ? 'Edit Training Plan' : 'Create Training Plan'}
                        </Text>
                        <Text className="text-white/70 text-sm">
                            {isEdit ? 'Update plan details' : 'Set up a new training plan'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleSave}
                        className="bg-white/20 px-4 py-2 rounded-full">
                        <Text className="text-white font-semibold text-sm">
                            {isEdit ? 'Save' : 'Create'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}>

                {/* ─── Basic Info ─── */}
                <SectionTitle icon="information-outline" title="Basic Information" />

                <View className="mb-3">
                    <FormLabel label="Member" required />
                    <PickerButton
                        label="Select member"
                        value={formData.memberId ? memberOptions.find(m => m.value === formData.memberId)?.label : ''}
                        options={memberOptions}
                        onSelect={handleMemberSelect}
                    />
                </View>

                <View className="mb-3">
                    <FormLabel label="Plan Title" required />
                    <FormInput
                        placeholder="e.g., Beginner Strength Training"
                        value={formData.title}
                        onChangeText={v => updateField('title', v)}
                    />
                </View>

                <View className="mb-3">
                    <FormLabel label="Description" />
                    <FormInput
                        placeholder="Describe the training plan..."
                        value={formData.description}
                        onChangeText={v => updateField('description', v)}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Sport & Difficulty */}
                <View className="flex-row gap-3 mb-3">
                    <View className="flex-1">
                        <FormLabel label="Sport" required />
                        <PickerButton
                            label="Select sport"
                            value={formData.sport}
                            options={sportOptions}
                            onSelect={v => updateField('sport', v)}
                        />
                    </View>
                    <View className="flex-1">
                        <FormLabel label="Difficulty" />
                        <PickerButton
                            label="Select"
                            value={formData.difficulty}
                            options={DIFFICULTY_LEVELS}
                            onSelect={v => updateField('difficulty', v)}
                        />
                    </View>
                </View>

                {/* Duration & Dates */}
                <View className="mb-3">
                    <FormLabel label="Duration (weeks)" required />
                    <FormInput
                        placeholder="e.g., 8"
                        value={formData.duration}
                        onChangeText={v => updateField('duration', v)}
                        keyboardType="numeric"
                    />
                </View>

                <View className="flex-row gap-3 mb-3">
                    <View className="flex-1">
                        <FormLabel label="Start Date" required />
                        <FormInput
                            placeholder="YYYY-MM-DD"
                            value={formData.startDate}
                            onChangeText={v => updateField('startDate', v)}
                        />
                    </View>
                    <View className="flex-1">
                        <FormLabel label="End Date" required />
                        <FormInput
                            placeholder="YYYY-MM-DD"
                            value={formData.endDate}
                            onChangeText={v => updateField('endDate', v)}
                        />
                    </View>
                </View>

                {/* Status */}
                <View className="mb-3">
                    <FormLabel label="Status" />
                    <PickerButton
                        label="Select status"
                        value={formData.status}
                        options={PLAN_STATUSES}
                        onSelect={v => updateField('status', v)}
                    />
                </View>

                {/* Frequency */}
                <View className="mb-3">
                    <FormLabel label="Frequency" />
                    <FormInput
                        placeholder="e.g., 3 times per week, Daily"
                        value={formData.frequency}
                        onChangeText={v => updateField('frequency', v)}
                    />
                </View>

                {/* ─── Goals ─── */}
                <SectionTitle icon="target" title="Goals" />
                <TagInput
                    tags={formData.goals}
                    onAdd={tag => updateField('goals', [...formData.goals, tag])}
                    onRemove={idx => updateField('goals', formData.goals.filter((_, i) => i !== idx))}
                    placeholder="Add a goal..."
                    color="purple"
                />

                {/* ─── Exercises ─── */}
                <SectionTitle
                    icon="dumbbell"
                    title="Exercises"
                    actionLabel="Add Exercise"
                    onAction={addExercise}
                />
                {formData.exercises.map((ex, index) => (
                    <View key={index} className="bg-white rounded-xl p-4 mb-3 border border-gray-100" style={{ elevation: 1 }}>
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-gray-700 font-semibold text-sm">
                                Exercise {index + 1}
                            </Text>
                            <TouchableOpacity onPress={() => removeExercise(index)}>
                                <Icon name="trash-can-outline" size={18} color="#dc2626" />
                            </TouchableOpacity>
                        </View>

                        <View className="mb-2">
                            <FormInput
                                placeholder="Exercise name (e.g., Squats)"
                                value={ex.name}
                                onChangeText={v => updateExercise(index, 'name', v)}
                            />
                        </View>

                        <View className="flex-row gap-2 mb-2">
                            <View className="flex-1">
                                <Text className="text-gray-500 text-xs mb-1">Sets</Text>
                                <FormInput
                                    placeholder="3"
                                    value={ex.sets}
                                    onChangeText={v => updateExercise(index, 'sets', v)}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-500 text-xs mb-1">Reps</Text>
                                <FormInput
                                    placeholder="12"
                                    value={ex.reps}
                                    onChangeText={v => updateExercise(index, 'reps', v)}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-500 text-xs mb-1">Duration (min)</Text>
                                <FormInput
                                    placeholder="10"
                                    value={ex.duration}
                                    onChangeText={v => updateExercise(index, 'duration', v)}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View className="flex-row gap-2 mb-2">
                            <View className="flex-1">
                                <Text className="text-gray-500 text-xs mb-1">Rest (sec)</Text>
                                <FormInput
                                    placeholder="60"
                                    value={ex.restTime}
                                    onChangeText={v => updateExercise(index, 'restTime', v)}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-500 text-xs mb-1">Notes</Text>
                                <FormInput
                                    placeholder="Any notes..."
                                    value={ex.notes}
                                    onChangeText={v => updateExercise(index, 'notes', v)}
                                />
                            </View>
                        </View>

                        <View>
                            <Text className="text-gray-500 text-xs mb-1">Description</Text>
                            <FormInput
                                placeholder="Exercise description..."
                                value={ex.description}
                                onChangeText={v => updateExercise(index, 'description', v)}
                                multiline
                                numberOfLines={2}
                            />
                        </View>
                    </View>
                ))}
                {formData.exercises.length === 0 && (
                    <View className="bg-white rounded-xl p-6 items-center border border-gray-100">
                        <Icon name="dumbbell" size={32} color="#d1d5db" />
                        <Text className="text-gray-400 text-sm mt-2">
                            No exercises added yet
                        </Text>
                    </View>
                )}

                {/* ─── Schedule ─── */}
                <SectionTitle
                    icon="calendar-week"
                    title="Weekly Schedule"
                    actionLabel="Add Day"
                    onAction={addScheduleDay}
                />
                {formData.schedule.map((scheduleDay, dayIndex) => (
                    <View key={dayIndex} className="bg-white rounded-xl p-4 mb-3 border border-gray-100" style={{ elevation: 1 }}>
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-gray-700 font-semibold text-sm">
                                Day {dayIndex + 1}
                            </Text>
                            <TouchableOpacity onPress={() => removeScheduleDay(dayIndex)}>
                                <Icon name="trash-can-outline" size={18} color="#dc2626" />
                            </TouchableOpacity>
                        </View>

                        <View className="mb-2">
                            <PickerButton
                                label="Select day"
                                value={scheduleDay.day}
                                options={DAYS_OF_WEEK}
                                onSelect={v => updateScheduleDay(dayIndex, 'day', v)}
                            />
                        </View>

                        <View className="mb-2">
                            <FormInput
                                placeholder="Day notes..."
                                value={scheduleDay.notes || ''}
                                onChangeText={v => updateScheduleDay(dayIndex, 'notes', v)}
                            />
                        </View>

                        {/* Exercises for this day */}
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-gray-500 text-xs font-semibold">Exercises</Text>
                            <TouchableOpacity
                                onPress={() => addExerciseToScheduleDay(dayIndex)}
                                className="flex-row items-center">
                                <Icon name="plus" size={14} color="#2563eb" />
                                <Text className="text-blue-600 text-xs ml-0.5">Add</Text>
                            </TouchableOpacity>
                        </View>
                        {(scheduleDay.exercises || []).map((exName, exIndex) => (
                            <View key={exIndex} className="flex-row items-center gap-2 mb-2">
                                <View className="flex-1">
                                    <FormInput
                                        placeholder="Exercise name"
                                        value={exName}
                                        onChangeText={v => updateScheduleExercise(dayIndex, exIndex, v)}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={() => removeScheduleExercise(dayIndex, exIndex)}
                                    className="w-9 h-9 justify-center items-center">
                                    <Icon name="close-circle-outline" size={18} color="#9ca3af" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {(scheduleDay.exercises || []).length === 0 && (
                            <Text className="text-gray-300 text-xs text-center py-2">
                                No exercises for this day
                            </Text>
                        )}
                    </View>
                ))}
                {formData.schedule.length === 0 && (
                    <View className="bg-white rounded-xl p-6 items-center border border-gray-100">
                        <Icon name="calendar-blank" size={32} color="#d1d5db" />
                        <Text className="text-gray-400 text-sm mt-2">
                            No schedule added yet
                        </Text>
                    </View>
                )}

                {/* ─── Diet Recommendation ─── */}
                <SectionTitle icon="food-apple-outline" title="Diet Recommendation" />
                <View className="bg-white rounded-xl p-4 border border-gray-100" style={{ elevation: 1 }}>
                    <View className="flex-row gap-2 mb-2">
                        <View className="flex-1">
                            <Text className="text-gray-500 text-xs mb-1">Calories (kcal)</Text>
                            <FormInput
                                placeholder="2000"
                                value={formData.dietRecommendation?.calories || ''}
                                onChangeText={v => setFormData(prev => ({
                                    ...prev,
                                    dietRecommendation: { ...prev.dietRecommendation, calories: v },
                                }))}
                                keyboardType="numeric"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-500 text-xs mb-1">Protein (g)</Text>
                            <FormInput
                                placeholder="120"
                                value={formData.dietRecommendation?.protein || ''}
                                onChangeText={v => setFormData(prev => ({
                                    ...prev,
                                    dietRecommendation: { ...prev.dietRecommendation, protein: v },
                                }))}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                    <View className="flex-row gap-2 mb-2">
                        <View className="flex-1">
                            <Text className="text-gray-500 text-xs mb-1">Carbs (g)</Text>
                            <FormInput
                                placeholder="250"
                                value={formData.dietRecommendation?.carbs || ''}
                                onChangeText={v => setFormData(prev => ({
                                    ...prev,
                                    dietRecommendation: { ...prev.dietRecommendation, carbs: v },
                                }))}
                                keyboardType="numeric"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-500 text-xs mb-1">Fat (g)</Text>
                            <FormInput
                                placeholder="60"
                                value={formData.dietRecommendation?.fat || ''}
                                onChangeText={v => setFormData(prev => ({
                                    ...prev,
                                    dietRecommendation: { ...prev.dietRecommendation, fat: v },
                                }))}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                    <View>
                        <Text className="text-gray-500 text-xs mb-1">Diet Notes</Text>
                        <FormInput
                            placeholder="Additional diet notes..."
                            value={formData.dietRecommendation?.notes || ''}
                            onChangeText={v => setFormData(prev => ({
                                ...prev,
                                dietRecommendation: { ...prev.dietRecommendation, notes: v },
                            }))}
                            multiline
                            numberOfLines={2}
                        />
                    </View>
                </View>

                {/* ─── Special Considerations ─── */}
                <SectionTitle icon="alert-circle-outline" title="Special Considerations" />
                <TagInput
                    tags={formData.specialConsiderations}
                    onAdd={tag => updateField('specialConsiderations', [...formData.specialConsiderations, tag])}
                    onRemove={idx => updateField('specialConsiderations', formData.specialConsiderations.filter((_, i) => i !== idx))}
                    placeholder="Add a consideration..."
                    color="amber"
                />

                {/* ─── Info Box ─── */}
                <View className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <View className="flex-row items-center mb-2">
                        <Icon name="lightbulb-outline" size={18} color="#1e40af" />
                        <Text className="text-blue-800 font-semibold text-sm ml-2">
                            Training Plan vs Session
                        </Text>
                    </View>
                    <Text className="text-blue-700 text-xs leading-5">
                        <Text className="font-bold">Training Plan</Text> = Long-term program/blueprint (8-12 weeks) — WHAT exercises to do over time. Like a doctor's prescription.{'\n'}
                        <Text className="font-bold">Session</Text> = Single scheduled appointment — WHEN to actually do them (date, time, facility). Like a doctor's appointment.{'\n\n'}
                        Create a Training Plan first, then create Sessions to schedule when the member will execute parts of the plan.
                    </Text>
                </View>

                {/* ─── Save Button ─── */}
                <TouchableOpacity
                    onPress={handleSave}
                    activeOpacity={0.8}
                    className="mt-6 mb-4">
                    <LinearGradient
                        colors={['#1e3a8a', '#3b82f6']}
                        className="rounded-xl py-4 flex-row items-center justify-center">
                        <Icon name={isEdit ? 'content-save-outline' : 'plus-circle-outline'} size={20} color="#fff" />
                        <Text className="text-white font-bold text-base ml-2">
                            {isEdit ? 'Save Changes' : 'Create Training Plan'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default CreateEditTrainingPlanScreen;