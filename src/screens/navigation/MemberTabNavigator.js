import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Member Screens
import MemberDashboardScreen from '../screens/member/MemberDashboardScreen';
import SportsScreen from '../screens/member/SportsScreen';
import BookSessionScreen from '../screens/member/BookSessionScreen';
import MySessionsScreen from '../screens/member/MySessionsScreen';
import AttendanceScreen from '../screens/member/AttendanceScreen';
import ProfileScreen from '../screens/member/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const SportsStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SportsList" component={SportsScreen} />
        <Stack.Screen name="BookSession" component={BookSessionScreen} />
    </Stack.Navigator>
);

const MemberTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#22c55e',
                tabBarInactiveTintColor: '#6b7280',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 0,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    switch (route.name) {
                        case 'Home':
                            iconName = 'home';
                            break;
                        case 'Sports':
                            iconName = 'basketball';
                            break;
                        case 'MySessions':
                            iconName = 'calendar-clock';
                            break;
                        case 'Attendance':
                            iconName = 'fingerprint';
                            break;
                        case 'Profile':
                            iconName = 'account';
                            break;
                        default:
                            iconName = 'circle';
                    }

                    return <Icon name={iconName} size={size} color={color} />;
                },
            })}>
            <Tab.Screen name="Home" component={MemberDashboardScreen} />
            <Tab.Screen name="Sports" component={SportsStack} />
            <Tab.Screen name="MySessions" component={MySessionsScreen} />
            <Tab.Screen name="Attendance" component={AttendanceScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default MemberTabNavigator;