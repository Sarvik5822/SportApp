import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomDrawerContent from '../../components/CustomDrawerContent';

// Member Screens
import MemberDashboardScreen from '../member/MemberDashboardScreen';
import SportsScreen from '../member/SportsScreen';
import BookSessionScreen from '../member/BookSessionScreen';
import MySessionsScreen from '../member/MySessionsScreen';
import AttendanceScreen from '../member/AttendanceScreen';
import ProgressScreen from '../member/ProgressScreen';
import ProfileScreen from '../member/ProfileScreen';
import MembershipScreen from '../member/MembershipScreen';
import PaymentsScreen from '../member/PaymentsScreen';
import AnnouncementsScreen from '../member/AnnouncementsScreen';
import FeedbackScreen from '../member/FeedbackScreen';
import HealthSafetyScreen from '../member/HealthSafetyScreen';
import SettingsScreen from '../member/SettingsScreen';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// Stack navigator for Sports (Sports → BookSession)
const SportsStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SportsList" component={SportsScreen} />
        <Stack.Screen name="BookSession" component={BookSessionScreen} />
    </Stack.Navigator>
);

// Drawer items configuration
const MEMBER_DRAWER_ITEMS = [
    {
        routeName: 'Home',
        label: 'Dashboard',
        icon: 'home',
        description: 'Overview & quick actions',
    },
    {
        routeName: 'Announcements',
        label: 'Announcements',
        icon: 'bullhorn',
        description: 'News, updates & notices',
    },
    {
        routeName: 'Membership',
        label: 'Membership',
        icon: 'card-membership',
        description: 'Plans, benefits & renewal',
    },
    {
        routeName: 'Payments',
        label: 'Payments',
        icon: 'credit-card-outline',
        description: 'Invoices & payment methods',
    },
    {
        routeName: 'Sports',
        label: 'Sports & Facilities',
        icon: 'basketball',
        description: 'Browse & book sports',
    },
    {
        routeName: 'MySessions',
        label: 'My Sessions',
        icon: 'calendar-clock',
        description: 'Upcoming & past sessions',
    },
    {
        routeName: 'Attendance',
        label: 'Attendance',
        icon: 'fingerprint',
        description: 'Punch in/out & history',
    },
    {
        routeName: 'Progress',
        label: 'My Progress',
        icon: 'chart-line',
        description: 'Track your fitness journey',
    },
    {
        routeName: 'HealthSafety',
        label: 'Health & Safety',
        icon: 'shield-plus',
        description: 'Medical docs & safety info',
    },
    {
        routeName: 'Feedback',
        label: 'Feedback & Ratings',
        icon: 'message-star',
        description: 'Share your experience',
    },
    {
        routeName: 'Profile',
        label: 'Profile',
        icon: 'account',
        description: 'Personal info & membership',
    },
    {
        routeName: 'Settings',
        label: 'Settings',
        icon: 'cog',
        description: 'Account & app preferences',
    },
];

const MEMBER_PROFILE = {
    name: 'John Doe',
    subtitle: 'member@test.com',
    badge: 'Premium Member',
};

const MemberCustomDrawer = (props) => (
    <CustomDrawerContent
        {...props}
        drawerItems={MEMBER_DRAWER_ITEMS}
        userProfile={MEMBER_PROFILE}
        accentColors={['#059669', '#10b981']}
        loginRoute="Login"
    />
);

const MemberDrawerNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <MemberCustomDrawer {...props} />}
            screenOptions={{
                headerShown: false,
                drawerType: 'front',
                drawerStyle: {
                    width: 300,
                },
                swipeEnabled: true,
                swipeEdgeWidth: 50,
            }}>
            <Drawer.Screen name="Home" component={MemberDashboardScreen} />
            <Drawer.Screen name="Announcements" component={AnnouncementsScreen} />
            <Drawer.Screen name="Membership" component={MembershipScreen} />
            <Drawer.Screen name="Payments" component={PaymentsScreen} />
            <Drawer.Screen name="Sports" component={SportsStack} />
            <Drawer.Screen name="MySessions" component={MySessionsScreen} />
            <Drawer.Screen name="Attendance" component={AttendanceScreen} />
            <Drawer.Screen name="Progress" component={ProgressScreen} />
            <Drawer.Screen name="HealthSafety" component={HealthSafetyScreen} />
            <Drawer.Screen name="Feedback" component={FeedbackScreen} />
            <Drawer.Screen name="Profile" component={ProfileScreen} />
            <Drawer.Screen name="Settings" component={SettingsScreen} />
        </Drawer.Navigator>
    );
};

export default MemberDrawerNavigator;