import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ProfileAvatar from '../../components/ProfileAvatar';
import { currentUser } from '../../data/user';

const ProfileScreen = ({ navigation }) => {
    const InfoRow = ({ icon, label, value }) => (
        <View className="flex-row items-center py-3 border-b border-gray-100">
            <View className="w-10 h-10 rounded-lg bg-primary/10 justify-center items-center">
                <Icon name={icon} size={20} color="#1e3a8a" />
            </View>
            <View className="flex-1 ml-3">
                <Text className="text-dark-lighter text-xs">{label}</Text>
                <Text className="text-dark font-medium">{value}</Text>
            </View>
        </View>
    );

    const Section = ({ title, icon, children, onEdit }) => (
        <View className="bg-white rounded-xl p-4 mb-4 shadow-md" style={{ elevation: 3 }}>
            <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                    <Icon name={icon} size={20} color="#1e3a8a" />
                    <Text className="text-dark font-bold text-lg ml-2">{title}</Text>
                </View>
                {onEdit && (
                    <TouchableOpacity onPress={onEdit}>
                        <Icon name="pencil" size={18} color="#22c55e" />
                    </TouchableOpacity>
                )}
            </View>
            {children}
        </View>
    );

    return (
        <ScrollView className="flex-1 bg-gray-50">
            {/* Header */}
            <LinearGradient
                colors={['#1e3a8a', '#3b82f6']}
                className="px-6 pt-12 pb-12 rounded-b-[30px]">
                <View className="items-center">
                    <ProfileAvatar name={currentUser.name} size="xlarge" />
                    <Text className="text-white font-bold text-2xl mt-4">{currentUser.name}</Text>
                    <Text className="text-white/80">{currentUser.email}</Text>

                    <View className="flex-row mt-4">
                        <View className="bg-white/20 px-4 py-2 rounded-full mr-2">
                            <Text className="text-white font-semibold">{currentUser.membership.type}</Text>
                        </View>
                        <View className="bg-accent px-4 py-2 rounded-full">
                            <Text className="text-white font-semibold">Active</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <View className="px-4 -mt-6">
                {/* Personal Information */}
                <Section title="Personal Information" icon="account" onEdit={() => { }}>
                    <InfoRow icon="account" label="Full Name" value={currentUser.name} />
                    <InfoRow icon="email" label="Email" value={currentUser.email} />
                    <InfoRow icon="phone" label="Phone" value={currentUser.phone} />
                    <InfoRow icon="calendar" label="Age" value={`${currentUser.profile.age} years`} />
                    <InfoRow icon="gender-male-female" label="Gender" value={currentUser.profile.gender} />
                </Section>

                {/* Physical Information */}
                <Section title="Physical Information" icon="ruler" onEdit={() => { }}>
                    <InfoRow icon="human-male-height" label="Height" value={currentUser.profile.height} />
                    <InfoRow icon="weight-kilogram" label="Weight" value={currentUser.profile.weight} />
                    <InfoRow icon="water" label="Blood Type" value={currentUser.profile.bloodType} />
                </Section>

                {/* Health Information */}
                <Section title="Health Information" icon="heart-pulse" onEdit={() => { }}>
                    <InfoRow icon="alert-circle" label="Allergies" value={currentUser.profile.allergies} />
                    <InfoRow icon="medical-bag" label="Medical Conditions" value={currentUser.profile.conditions} />
                </Section>

                {/* Emergency Contact */}
                <Section title="Emergency Contact" icon="contacts" onEdit={() => { }}>
                    <InfoRow icon="account" label="Name" value={currentUser.emergencyContact.name} />
                    <InfoRow icon="account-switch" label="Relation" value={currentUser.emergencyContact.relation} />
                    <InfoRow icon="phone" label="Phone" value={currentUser.emergencyContact.phone} />
                </Section>

                {/* Membership Details */}
                <Section title="Membership Details" icon="card-membership">
                    <InfoRow icon="star" label="Plan Type" value={currentUser.membership.type} />
                    <InfoRow icon="calendar-check" label="Start Date" value={currentUser.membership.startDate} />
                    <InfoRow icon="calendar-remove" label="Expiry Date" value={currentUser.membership.expiryDate} />
                    <InfoRow icon="clock" label="Days Remaining" value={`${currentUser.membership.daysRemaining} days`} />
                </Section>

                {/* Settings Button */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('Settings')}
                    className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-center border border-gray-200 shadow-sm"
                    style={{ elevation: 2 }}>
                    <Icon name="cog" size={20} color="#059669" />
                    <Text className="text-gray-900 font-bold text-lg ml-2">Settings</Text>
                </TouchableOpacity>

                {/* Logout Button */}
                <TouchableOpacity
                    onPress={() => {
                        navigation.getParent()?.getParent()?.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    }}
                    className="bg-red-500 rounded-xl p-4 mb-6 items-center">
                    <Text className="text-white font-bold text-lg">Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default ProfileScreen;