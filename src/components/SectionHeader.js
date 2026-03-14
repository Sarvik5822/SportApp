import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SectionHeader = ({ title, onSeeAll, showSeeAll = true, icon }) => {
    return (
        <View className="flex-row justify-between items-center px-4 py-3">
            <View className="flex-row items-center">
                {icon && (
                    <View className="w-8 h-8 rounded-lg bg-primary/10 justify-center items-center mr-2">
                        <Icon name={icon} size={18} color="#1e3a8a" />
                    </View>
                )}
                <Text className="text-dark font-bold text-lg">{title}</Text>
            </View>
            {showSeeAll && onSeeAll && (
                <TouchableOpacity onPress={onSeeAll} className="flex-row items-center">
                    <Text className="text-accent font-semibold text-sm mr-1">See All</Text>
                    <Icon name="chevron-right" size={16} color="#22c55e" />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default SectionHeader;