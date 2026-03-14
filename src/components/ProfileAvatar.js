import React from 'react';
import { View, Text, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProfileAvatar = ({
    name,
    image,
    size = 'medium',
    showStatus = false,
    status = 'online',
}) => {
    const sizeClasses = {
        small: { container: 'w-10 h-10', text: 'text-sm', icon: 20 },
        medium: { container: 'w-16 h-16', text: 'text-xl', icon: 32 },
        large: { container: 'w-24 h-24', text: 'text-3xl', icon: 48 },
        xlarge: { container: 'w-32 h-32', text: 'text-4xl', icon: 64 },
    };

    const getInitials = (nameStr) => {
        return nameStr
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const statusColors = {
        online: 'bg-accent',
        offline: 'bg-dark-lighter',
        busy: 'bg-red-500',
    };

    return (
        <View className="relative">
            <View
                className={`${sizeClasses[size].container} rounded-full bg-primary justify-center items-center overflow-hidden`}>
                {image ? (
                    <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                ) : (
                    <Text
                        className={`${sizeClasses[size].text} text-white font-bold`}>
                        {getInitials(name)}
                    </Text>
                )}
            </View>

            {showStatus && (
                <View
                    className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${statusColors[status]}`}
                />
            )}
        </View>
    );
};

export default ProfileAvatar;