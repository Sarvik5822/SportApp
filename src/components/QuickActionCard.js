import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const QuickActionCard = ({ title, icon, onPress, color = '#22c55e' }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            className="bg-white rounded-xl p-4 m-2 shadow-lg flex-1 items-center"
            style={{ elevation: 4, minWidth: '45%' }}>
            <View
                className="w-14 h-14 rounded-full justify-center items-center mb-3"
                style={{ backgroundColor: `${color}20` }}>
                <Icon name={icon} size={28} color={color} />
            </View>
            <Text className="text-dark font-semibold text-sm text-center">{title}</Text>
        </TouchableOpacity>
    );
};

export default QuickActionCard;