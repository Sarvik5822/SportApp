import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const CustomButton = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    className = '',
}) => {
    const sizeClasses = {
        small: 'px-4 py-2',
        medium: 'px-6 py-3',
        large: 'px-8 py-4',
    };

    const textSizes = {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-lg',
    };

    if (variant === 'gradient') {
        return (
            <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8}>
                <LinearGradient
                    colors={['#22c55e', '#16a34a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className={`rounded-xl ${sizeClasses[size]} ${className}`}>
                    <Text
                        className={`text-white font-bold text-center ${textSizes[size]}`}>
                        {title}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    const variantClasses = {
        primary: 'bg-accent',
        secondary: 'bg-primary',
        outline: 'bg-transparent border-2 border-accent',
        danger: 'bg-red-500',
    };

    const textColors = {
        primary: 'text-white',
        secondary: 'text-white',
        outline: 'text-accent',
        danger: 'text-white',
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}
            className={`rounded-xl ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? 'opacity-50' : ''
                }`}>
            <Text
                className={`font-bold text-center ${textSizes[size]} ${textColors[variant]}`}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

export default CustomButton;