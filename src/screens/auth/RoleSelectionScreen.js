import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from '../../components/CustomButton';

const RoleSelectionScreen = ({ navigation }) => {
    const selectMember = () => {
        navigation.replace('MemberDrawer');
    };

    const selectCoach = () => {
        navigation.replace('CoachDrawer');
    };

    return (
        <ScrollView className="flex-1 bg-gray-50">
            {/* Header */}
            <LinearGradient
                colors={['#059669', '#10b981']}
                className="px-6 pt-12 pb-20 rounded-b-[40px]">
                <View className="items-center">
                    <View className="w-20 h-20 bg-white/20 rounded-full justify-center items-center mb-4">
                        <Icon name="account-group" size={40} color="#fff" />
                    </View>
                    <Text className="text-white text-2xl font-bold mb-2">
                        Choose Your Role
                    </Text>
                    <Text className="text-white/80 text-center px-8">
                        Select how you want to use SportClub
                    </Text>
                </View>
            </LinearGradient>

            {/* Role Cards */}
            <View className="px-6 -mt-12">
                {/* Member Card */}
                <View
                    className="bg-white rounded-2xl p-6 mb-4 shadow-lg"
                    style={{ elevation: 6 }}>
                    <View className="flex-row items-center mb-4">
                        <View className="w-16 h-16 bg-emerald-100 rounded-full justify-center items-center mr-4">
                            <Icon name="account" size={32} color="#22c55e" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-900 font-bold text-xl mb-1">
                                Member
                            </Text>
                            <Text className="text-gray-500 text-sm">
                                Book sessions, track progress, manage your membership
                            </Text>
                        </View>
                    </View>

                    <View className="mb-4">
                        {[
                            'Book training sessions',
                            'View sports & facilities',
                            'Track your progress',
                            'Manage profile & membership',
                        ].map((feature, index) => (
                            <View key={index} className="flex-row items-center mb-2">
                                <Icon name="check-circle" size={18} color="#22c55e" />
                                <Text className="text-gray-600 ml-2 text-sm">{feature}</Text>
                            </View>
                        ))}
                    </View>

                    <CustomButton
                        title="Continue as Member"
                        onPress={selectMember}
                        variant="primary"
                        size="large"
                    />
                </View>

                {/* Coach Card */}
                <View
                    className="bg-white rounded-2xl p-6 mb-4 shadow-lg"
                    style={{ elevation: 6 }}>
                    <View className="flex-row items-center mb-4">
                        <View className="w-16 h-16 bg-blue-100 rounded-full justify-center items-center mr-4">
                            <Icon name="whistle" size={32} color="#1e3a8a" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-900 font-bold text-xl mb-1">
                                Coach
                            </Text>
                            <Text className="text-gray-500 text-sm">
                                Manage sessions, track attendance, view trainees
                            </Text>
                        </View>
                    </View>

                    <View className="mb-4">
                        {[
                            'Manage training sessions',
                            'Mark attendance',
                            'View trainee profiles',
                            'Track performance',
                        ].map((feature, index) => (
                            <View key={index} className="flex-row items-center mb-2">
                                <Icon name="check-circle" size={18} color="#1e3a8a" />
                                <Text className="text-gray-600 ml-2 text-sm">{feature}</Text>
                            </View>
                        ))}
                    </View>

                    <CustomButton
                        title="Continue as Coach"
                        onPress={selectCoach}
                        variant="secondary"
                        size="large"
                    />
                </View>

                {/* Back to Login */}
                <TouchableOpacity
                    onPress={() => navigation.replace('Login')}
                    className="items-center mb-8 mt-2">
                    <Text className="text-emerald-600 font-semibold text-base">
                        ← Back to Login
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default RoleSelectionScreen;