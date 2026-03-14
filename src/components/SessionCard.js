import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from './CustomButton';

const SessionCard = ({ session, onBook, onCancel, showCancel = false }) => {
    const isFull = session.bookedSlots >= session.maxSlots;
    const availableSlots = session.maxSlots - session.bookedSlots;

    return (
        <View className="bg-white rounded-xl p-4 m-3 shadow-lg" style={{ elevation: 4 }}>
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                    <Text className="text-dark font-bold text-lg">{session.sportName}</Text>
                    <Text className="text-dark-lighter text-sm">{session.coachName}</Text>
                </View>
                <View
                    className={`px-3 py-1 rounded-full ${session.status === 'upcoming' ? 'bg-accent/20' : 'bg-gray-200'
                        }`}>
                    <Text
                        className={`text-xs font-semibold ${session.status === 'upcoming' ? 'text-accent-dark' : 'text-dark-lighter'
                            }`}>
                        {session.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center mb-2">
                <Icon name="calendar" size={16} color="#6b7280" />
                <Text className="text-dark-light ml-2 text-sm">{session.date}</Text>
            </View>

            <View className="flex-row items-center mb-2">
                <Icon name="clock-outline" size={16} color="#6b7280" />
                <Text className="text-dark-light ml-2 text-sm">
                    {session.time} ({session.duration})
                </Text>
            </View>

            <View className="flex-row items-center mb-3">
                <Icon name="map-marker" size={16} color="#6b7280" />
                <Text className="text-dark-light ml-2 text-sm">{session.location}</Text>
            </View>

            <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                <View>
                    <Text className="text-dark-lighter text-xs">Available Slots</Text>
                    <Text
                        className={`font-bold ${isFull ? 'text-red-500' : 'text-accent-dark'}`}>
                        {availableSlots} / {session.maxSlots}
                    </Text>
                </View>

                {showCancel ? (
                    <CustomButton
                        title="Cancel"
                        onPress={onCancel}
                        variant="danger"
                        size="small"
                    />
                ) : (
                    <CustomButton
                        title={isFull ? 'Full' : 'Book Now'}
                        onPress={onBook}
                        variant={isFull ? 'secondary' : 'primary'}
                        size="small"
                        disabled={isFull}
                    />
                )}
            </View>
        </View>
    );
};

export default SessionCard;