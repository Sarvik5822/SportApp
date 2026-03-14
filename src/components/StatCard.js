import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const StatCard = ({ title, value, subtitle, icon, color = '#22c55e' }) => {
    return (
        <View
            className="bg-white rounded-xl p-4 m-2 shadow-lg flex-1"
            style={{ elevation: 4 }}>
            <View className="flex-row justify-between items-start mb-2">
                <View
                    className="w-10 h-10 rounded-lg justify-center items-center"
                    style={{ backgroundColor: `${color}20` }}>
                    <Icon name={icon} size={20} color={color} />
                </View>
            </View>
            <Text className="text-dark font-bold text-2xl mb-1">{value}</Text>
            <Text className="text-dark font-medium text-sm mb-1">{title}</Text>
            {subtitle && <Text className="text-dark-lighter text-xs">{subtitle}</Text>}
        </View>
    );
};

export default StatCard;