import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SportCard = ({ sport, categoryColor, onPress }) => {
    const getIconName = () => {
        const iconMap = {
            swim: 'swim',
            karate: 'karate',
            kick: 'kickboxing',
            judo: 'karate',
            punch: 'arm-flex',
            grappling: 'account-group',
            aikido: 'karate',
            boxing: 'boxing-glove',
            wrestling: 'weight-lifter',
            badminton: 'badminton',
            pingpong: 'table-tennis',
            squash: 'tennis-ball',
            racquet: 'tennis',
            fencing: 'sword',
            weight: 'dumbbell',
            power: 'weight-kilogram',
            muscle: 'arm-flex',
            gymnastics: 'human-handsup',
            climbing: 'wall',
            billiard: 'billiards',
            bowling: 'bowling',
            darts: 'bullseye',
            archery: 'bow-arrow',
            shooting: 'pistol',
            chess: 'chess-pawn',
        };
        return iconMap[sport.icon] || 'run';
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            className="bg-white rounded-xl p-4 m-2 shadow-lg flex-1 min-w-[45%] max-w-[48%]"
            style={{ elevation: 4 }}>
            <View
                className="w-12 h-12 rounded-full justify-center items-center mb-3"
                style={{ backgroundColor: `${categoryColor}20` }}>
                <Icon name={getIconName()} size={24} color={categoryColor} />
            </View>
            <Text className="text-dark font-bold text-base mb-1">{sport.name}</Text>
            <Text className="text-dark-lighter text-xs">{sport.difficulty}</Text>
        </TouchableOpacity>
    );
};

export default SportCard;