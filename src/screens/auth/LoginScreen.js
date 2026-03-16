import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';

const ROLES = [
    { key: 'member', label: 'Member' },
    { key: 'coach', label: 'Coach' },
];

const DEMO_CREDENTIALS = {
    member: { email: 'member@test.com', password: 'password' },
    coach: { email: 'coach@test.com', password: 'password' },
};

const ROLE_DESTINATIONS = {
    member: 'MemberDrawer',
    coach: 'CoachDrawer',
};

const LoginScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState('member');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }

        setLoading(true);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const destination = ROLE_DESTINATIONS[selectedRole];
            if (destination) {
                Alert.alert('Success', 'Login successful!', [
                    {
                        text: 'OK',
                        onPress: () => navigation.replace(destination),
                    },
                ]);
            } else {
                navigation.replace('RoleSelection');
            }
        } catch (error) {
            Alert.alert(
                'Login Failed',
                'Invalid credentials or role mismatch. Please check your email and role.',
            );
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = role => {
        const creds = DEMO_CREDENTIALS[role];
        setEmail(creds.email);
        setPassword(creds.password);
        setSelectedRole(role);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1">
            <ScrollView
                className="flex-1 bg-gray-50"
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled">
                {/* Header Gradient */}
                <LinearGradient
                    colors={['#059669', '#10b981']}
                    className="px-6 pt-12 pb-16 rounded-b-[40px]">
                    <View className="items-center">
                        <View className="w-24 h-24 bg-white/20 rounded-full justify-center items-center mb-4">
                            <Icon name="dumbbell" size={48} color="#fff" />
                        </View>
                        <Text className="text-white text-3xl font-bold mb-2">
                            Welcome Back
                        </Text>
                        <Text className="text-white/80 text-base">
                            Sign in to your account to continue
                        </Text>
                    </View>
                </LinearGradient>

                {/* Login Card */}
                <View className="px-6 -mt-8">
                    <View
                        className="bg-white rounded-2xl p-6 shadow-xl"
                        style={{ elevation: 8 }}>
                        {/* Role Selection Tabs */}
                        <View className="flex-row bg-gray-100 rounded-xl p-1 mb-6">
                            {ROLES.map(role => (
                                <TouchableOpacity
                                    key={role.key}
                                    onPress={() => setSelectedRole(role.key)}
                                    className={`flex-1 py-2.5 rounded-lg items-center ${selectedRole === role.key ? 'bg-white shadow-sm' : ''
                                        }`}
                                    style={
                                        selectedRole === role.key
                                            ? {
                                                elevation: 2,
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 1 },
                                                shadowOpacity: 0.1,
                                                shadowRadius: 2,
                                            }
                                            : {}
                                    }>
                                    <Text
                                        className={`text-sm font-semibold ${selectedRole === role.key
                                            ? 'text-emerald-600'
                                            : 'text-gray-500'
                                            }`}>
                                        {role.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Email Field */}
                        <View className="mb-4">
                            <Text className="text-gray-700 font-medium text-sm mb-2">
                                Email
                            </Text>
                            <View className="flex-row items-center bg-gray-100 rounded-xl px-4">
                                <Icon name="email-outline" size={20} color="#6b7280" />
                                <TextInput
                                    className="flex-1 py-3 px-3 text-gray-900"
                                    placeholder={`${selectedRole}@test.com`}
                                    placeholderTextColor="#9ca3af"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!loading}
                                />
                            </View>
                        </View>

                        {/* Password Field */}
                        <View className="mb-4">
                            <Text className="text-gray-700 font-medium text-sm mb-2">
                                Password
                            </Text>
                            <View className="flex-row items-center bg-gray-100 rounded-xl px-4">
                                <Icon name="lock-outline" size={20} color="#6b7280" />
                                <TextInput
                                    className="flex-1 py-3 px-3 text-gray-900"
                                    placeholder="Enter your password"
                                    placeholderTextColor="#9ca3af"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}>
                                    <Icon
                                        name={showPassword ? 'eye-off' : 'eye'}
                                        size={20}
                                        color="#6b7280"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Remember Me & Forgot Password */}
                        <View className="flex-row items-center justify-between mb-6">
                            <TouchableOpacity
                                onPress={() => setRememberMe(!rememberMe)}
                                className="flex-row items-center">
                                <Icon
                                    name={
                                        rememberMe
                                            ? 'checkbox-marked'
                                            : 'checkbox-blank-outline'
                                    }
                                    size={20}
                                    color={rememberMe ? '#059669' : '#9ca3af'}
                                />
                                <Text className="text-gray-600 text-sm ml-2">Remember me</Text>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Text className="text-emerald-600 text-sm font-medium">
                                    Forgot password?
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Sign In Button */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.8}>
                            <LinearGradient
                                colors={loading ? ['#6ee7b7', '#6ee7b7'] : ['#059669', '#10b981']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="rounded-xl px-8 py-4">
                                <View className="flex-row items-center justify-center">
                                    {loading && (
                                        <ActivityIndicator
                                            size="small"
                                            color="#fff"
                                            style={{ marginRight: 8 }}
                                        />
                                    )}
                                    <Text className="text-white font-bold text-center text-lg">
                                        {loading ? 'Signing in...' : 'Sign In'}
                                    </Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Quick Login Demo Section */}
                    <View className="mt-6">
                        <View className="flex-row items-center mb-4">
                            <View className="flex-1 h-[1px] bg-gray-300" />
                            <Text className="text-gray-400 text-xs uppercase mx-3 font-medium">
                                Quick Login (Demo)
                            </Text>
                            <View className="flex-1 h-[1px] bg-gray-300" />
                        </View>

                        <View className="flex-row justify-between">
                            {ROLES.map(role => (
                                <TouchableOpacity
                                    key={role.key}
                                    onPress={() => handleQuickLogin(role.key)}
                                    className="w-[48%] border border-gray-200 bg-white rounded-xl py-3 items-center"
                                    style={{ elevation: 1 }}
                                    activeOpacity={0.7}>
                                    <Text className="text-gray-700 font-semibold text-sm">
                                        {role.label} Demo
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Sign Up Link */}
                    <View className="flex-row justify-center mt-6 mb-8">
                        <Text className="text-gray-500">Don't have an account? </Text>
                        <TouchableOpacity>
                            <Text className="text-emerald-600 font-bold">Sign up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;