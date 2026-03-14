import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ProfileAvatar from './ProfileAvatar';

const CustomDrawerContent = ({
    state,
    navigation,
    descriptors,
    drawerItems,
    userProfile,
    accentColors = ['#059669', '#10b981'],
    loginRoute = 'Login',
}) => {
    const activeRouteName = state.routes[state.index]?.name;

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: () => {
                    navigation.getParent()?.reset({
                        index: 0,
                        routes: [{ name: loginRoute }],
                    });
                },
            },
        ]);
    };

    return (
        <View className="flex-1 bg-white">
            {/* Drawer Header */}
            <LinearGradient
                colors={accentColors}
                className="px-5 pt-14 pb-6">
                <View className="flex-row items-center">
                    <ProfileAvatar name={userProfile.name} size="medium" />
                    <View className="ml-3 flex-1">
                        <Text className="text-white font-bold text-lg" numberOfLines={1}>
                            {userProfile.name}
                        </Text>
                        {userProfile.subtitle && (
                            <Text className="text-white/80 text-sm" numberOfLines={1}>
                                {userProfile.subtitle}
                            </Text>
                        )}
                        {userProfile.badge && (
                            <View className="bg-white/20 self-start px-3 py-1 rounded-full mt-2">
                                <Text className="text-white text-xs font-semibold">
                                    {userProfile.badge}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </LinearGradient>

            {/* Drawer Items */}
            <ScrollView className="flex-1 pt-2">
                {drawerItems.map((item) => {
                    const isActive = activeRouteName === item.routeName;

                    return (
                        <TouchableOpacity
                            key={item.routeName}
                            onPress={() => navigation.navigate(item.routeName)}
                            activeOpacity={0.7}
                            className={`flex-row items-center mx-3 my-1 px-4 py-3.5 rounded-xl ${
                                isActive
                                    ? 'bg-emerald-50'
                                    : ''
                            }`}>
                            <View
                                className={`w-10 h-10 rounded-lg justify-center items-center ${
                                    isActive
                                        ? 'bg-emerald-500'
                                        : 'bg-gray-100'
                                }`}>
                                <Icon
                                    name={item.icon}
                                    size={22}
                                    color={isActive ? '#fff' : '#6b7280'}
                                />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text
                                    className={`font-semibold text-base ${
                                        isActive
                                            ? 'text-emerald-700'
                                            : 'text-gray-700'
                                    }`}>
                                    {item.label}
                                </Text>
                                {item.description && (
                                    <Text
                                        className={`text-xs mt-0.5 ${
                                            isActive
                                                ? 'text-emerald-500'
                                                : 'text-gray-400'
                                        }`}>
                                        {item.description}
                                    </Text>
                                )}
                            </View>
                            {isActive && (
                                <View className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                            )}
                        </TouchableOpacity>
                    );
                })}

                {/* Divider */}
                <View className="mx-6 my-3 h-[1px] bg-gray-200" />

                {/* Logout Button */}
                <TouchableOpacity
                    onPress={handleLogout}
                    activeOpacity={0.7}
                    className="flex-row items-center mx-3 px-4 py-3.5 rounded-xl">
                    <View className="w-10 h-10 rounded-lg justify-center items-center bg-red-50">
                        <Icon name="logout" size={22} color="#ef4444" />
                    </View>
                    <Text className="ml-3 font-semibold text-base text-red-500">
                        Logout
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Footer */}
            <View className="px-5 py-4 border-t border-gray-100">
                <Text className="text-gray-400 text-xs text-center">
                    MultiSports Hub v1.0
                </Text>
            </View>
        </View>
    );
};

export default CustomDrawerContent;