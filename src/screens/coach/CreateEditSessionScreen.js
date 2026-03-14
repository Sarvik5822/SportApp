import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { SESSION_TYPES } from '../../data/sessions';

const CreateEditSessionScreen = ({ navigation, route }) => {
    const mode = route?.params?.mode || 'create';
    const existingSession = route?.params?.session || null;
    const onSave = route?.params?.onSave;

    const [formData, setFormData] = useState({
        title: existingSession?.title || '',
        sport: existingSession?.sport || '',
        sportName: existingSession?.sportName || '',
        type: existingSession?.type || 'group',
        date: existingSession?.date || '',
        startTime: existingSession?.startTime || '',
        endTime: existingSession?.endTime || '',
        location: existingSession?.location || existingSession?.facilityName || '',
        maxParticipants: existingSession?.maxParticipants?.toString() || existingSession?.maxSlots?.toString() || '10',
        price: existingSession?.price?.toString() || '0',
        description: existingSession?.description || '',
        notes: existingSession?.notes || '',
        status: existingSession?.status || 'scheduled',
    });

    const handleSave = () => {
        if (!formData.title.trim()) {
            Alert.alert('Validation', 'Please enter a session title.');
            return;
        }
        if (!formData.date.trim()) {
            Alert.alert('Validation', 'Please enter a date (YYYY-MM-DD).');
            return;
        }

        const sessionData = {
            ...formData,
            maxParticipants: parseInt(formData.maxParticipants, 10) || 10,
            price: parseInt(formData.price, 10) || 0,
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

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <LinearGradient
                colors={['#1e3a8a', '#3b82f6']}
                className="px-6 pt-12 pb-6">
                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="w-10 h-10 bg-white/20 rounded-full justify-center items-center mr-3">
                            <Icon name="arrow-left" size={22} color="#fff" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-white font-bold text-xl">
                                {mode === 'create' ? 'Create Session' : 'Edit Session'}
                            </Text>
                            <Text className="text-white/70 text-sm">
                                {mode === 'create'
                                    ? 'Add a new training session'
                                    : 'Update session details'}
                            </Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1 px-4 pt-4">
                {/* Title */}
                <View className="mb-4">
                    <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
                        Session Title *
                    </Text>
                    <TextInput
                        value={formData.title}
                        onChangeText={text => setFormData({ ...formData, title: text })}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm"
                        placeholder="e.g., Morning Yoga Class"
                        placeholderTextColor="#9ca3af"
                    />
                </View>

                {/* Sport */}
                <View className="mb-4">
                    <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
                        Sport / Activity
                    </Text>
                    <TextInput
                        value={formData.sportName || formData.sport}
                        onChangeText={text =>
                            setFormData({ ...formData, sport: text, sportName: text })
                        }
                        className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm"
                        placeholder="e.g., Yoga, Boxing, Swimming"
                        placeholderTextColor="#9ca3af"
                    />
                </View>

                {/* Type Selection */}
                <View className="mb-4">
                    <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
                        Session Type
                    </Text>
                    <View className="flex-row flex-wrap">
                        {SESSION_TYPES.map(type => (
                            <TouchableOpacity
                                key={type.value}
                                onPress={() => setFormData({ ...formData, type: type.value })}
                                className={`mr-2 mb-2 px-4 py-2 rounded-full border ${formData.type === type.value
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'bg-white border-gray-200'
                                    }`}>
                                <Text
                                    className={`text-sm font-semibold ${formData.type === type.value
                                            ? 'text-white'
                                            : 'text-gray-600'
                                        }`}>
                                    {type.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Date */}
                <View className="mb-4">
                    <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
                        Date * (YYYY-MM-DD)
                    </Text>
                    <TextInput
                        value={formData.date}
                        onChangeText={text => setFormData({ ...formData, date: text })}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm"
                        placeholder="2026-03-15"
                        placeholderTextColor="#9ca3af"
                    />
                </View>

                {/* Time */}
                <View className="flex-row mb-4">
                    <View className="flex-1 mr-2">
                        <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
                            Start Time (HH:MM)
                        </Text>
                        <TextInput
                            value={formData.startTime}
                            onChangeText={text =>
                                setFormData({ ...formData, startTime: text })
                            }
                            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm"
                            placeholder="09:00"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>
                    <View className="flex-1 ml-2">
                        <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
                            End Time (HH:MM)
                        </Text>
                        <TextInput
                            value={formData.endTime}
                            onChangeText={text => setFormData({ ...formData, endTime: text })}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm"
                            placeholder="10:00"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>
                </View>

                {/* Location */}
                <View className="mb-4">
                    <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
                        Location
                    </Text>
                    <TextInput
                        value={formData.location}
                        onChangeText={text => setFormData({ ...formData, location: text })}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm"
                        placeholder="e.g., Main Hall, Court A"
                        placeholderTextColor="#9ca3af"
                    />
                </View>

                {/* Max Participants & Price */}
                <View className="flex-row mb-4">
                    <View className="flex-1 mr-2">
                        <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
                            Max Participants
                        </Text>
                        <TextInput
                            value={formData.maxParticipants}
                            onChangeText={text =>
                                setFormData({ ...formData, maxParticipants: text })
                            }
                            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm"
                            placeholder="10"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                        />
                    </View>
                    <View className="flex-1 ml-2">
                        <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
                            Price (₹)
                        </Text>
                        <TextInput
                            value={formData.price}
                            onChangeText={text => setFormData({ ...formData, price: text })}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm"
                            placeholder="0"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* Description */}
                <View className="mb-4">
                    <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
                        Description
                    </Text>
                    <TextInput
                        value={formData.description}
                        onChangeText={text =>
                            setFormData({ ...formData, description: text })
                        }
                        className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm"
                        placeholder="Describe the session..."
                        placeholderTextColor="#9ca3af"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        style={{ minHeight: 100 }}
                    />
                </View>

                {/* Notes */}
                <View className="mb-6">
                    <Text className="text-gray-500 text-xs mb-1.5 font-semibold">
                        Notes
                    </Text>
                    <TextInput
                        value={formData.notes}
                        onChangeText={text => setFormData({ ...formData, notes: text })}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm"
                        placeholder="Any additional notes..."
                        placeholderTextColor="#9ca3af"
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        style={{ minHeight: 80 }}
                    />
                </View>

                {/* Action Buttons */}
                <View className="flex-row mb-8">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                        className="flex-1 mr-2 border border-gray-300 rounded-xl py-3.5 items-center">
                        <Text className="text-gray-600 font-bold text-base">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSave}
                        activeOpacity={0.7}
                        className="flex-1 ml-2 rounded-xl py-3.5 items-center overflow-hidden">
                        <LinearGradient
                            colors={['#1e3a8a', '#3b82f6']}
                            className="absolute inset-0"
                        />
                        <View className="flex-row items-center">
                            <Icon
                                name={mode === 'create' ? 'plus-circle' : 'content-save'}
                                size={18}
                                color="#fff"
                            />
                            <Text className="text-white font-bold text-base ml-2">
                                {mode === 'create' ? 'Create Session' : 'Save Changes'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Bottom Spacing */}
                <View className="h-6" />
            </ScrollView>
        </View>
    );
};

export default CreateEditSessionScreen;