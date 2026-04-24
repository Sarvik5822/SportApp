import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomDrawerContent from '../../components/CustomDrawerContent';

// Coach Screens
import CoachDashboardScreen from '../coach/CoachDashboardScreen';
import CoachScheduleScreen from '../coach/CoachScheduleScreen';
import SessionsScreen from '../coach/SessionsScreen';
import CreateEditSessionScreen from '../coach/CreateEditSessionScreen';
import AttendanceScreen from '../coach/AttendanceScreen';
import CoachAttendanceScreen from '../coach/CoachAttendanceScreen';
import MembersScreen from '../coach/MembersScreen';
import MemberProfileScreen from '../coach/MemberProfileScreen';
import CoachProfileScreen from '../coach/CoachProfileScreen';
import TrainingPlansScreen from '../coach/TrainingPlansScreen';
import CreateEditTrainingPlanScreen from '../coach/CreateEditTrainingPlanScreen';
import CoachAnnouncementsScreen from '../coach/CoachAnnouncementsScreen';
import CoachReportsScreen from '../coach/CoachReportsScreen';
import IncidentReportsScreen from '../coach/IncidentReportsScreen';
import CoachSettingsScreen from '../coach/CoachSettingsScreen';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// Stack navigator for Sessions (Sessions → CreateEdit → Mark Attendance)
const SessionsStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SessionsList" component={SessionsScreen} />
        <Stack.Screen name="CreateEditSession" component={CreateEditSessionScreen} />
        <Stack.Screen name="AttendanceDetail" component={AttendanceScreen} />
    </Stack.Navigator>
);

// Stack navigator for Training Plans (TrainingPlans → CreateEdit)
const TrainingPlansStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="TrainingPlansList" component={TrainingPlansScreen} />
        <Stack.Screen name="CreateEditTrainingPlan" component={CreateEditTrainingPlanScreen} />
    </Stack.Navigator>
);

// Stack navigator for Members (Members → MemberProfile)
const MembersStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MembersList" component={MembersScreen} />
        <Stack.Screen name="MemberProfile" component={MemberProfileScreen} />
    </Stack.Navigator>
);

// Drawer items configuration
const COACH_DRAWER_ITEMS = [
    {
        routeName: 'Dashboard',
        label: 'Dashboard',
        icon: 'view-dashboard',
        description: 'Overview & quick stats',
    },
    {
        routeName: 'Schedule',
        label: 'Schedule',
        icon: 'calendar-week',
        description: 'Weekly schedule overview',
    },
    {
        routeName: 'Sessions',
        label: 'Sessions',
        icon: 'calendar-clock',
        description: 'Manage training sessions',
    },
    {
        routeName: 'TrainingPlans',
        label: 'Training Plans',
        icon: 'clipboard-text-outline',
        description: 'Create & manage training plans',
    },
    {
        routeName: 'Attendance',
        label: 'Attendance',
        icon: 'clipboard-check-outline',
        description: 'My & member attendance',
    },
    {
        routeName: 'Announcements',
        label: 'Announcements',
        icon: 'bullhorn',
        description: 'News & updates',
    },
    {
        routeName: 'Reports',
        label: 'Reports',
        icon: 'file-chart-outline',
        description: 'Generate & view reports',
    },
    {
        routeName: 'IncidentReports',
        label: 'Incident Reports',
        icon: 'alert-octagon',
        description: 'Report & track incidents',
    },
    {
        routeName: 'Members',
        label: 'Members',
        icon: 'account-multiple',
        description: 'View & manage members',
    },
    {
        routeName: 'Profile',
        label: 'Profile',
        icon: 'account',
        description: 'Your coach profile',
    },
    {
        routeName: 'Settings',
        label: 'Settings',
        icon: 'cog-outline',
        description: 'Account preferences',
    },
];

const COACH_PROFILE = {
    name: 'Coach Smith',
    subtitle: 'coach@test.com',
    badge: 'Senior Coach',
};

const CoachCustomDrawer = props => (
    <CustomDrawerContent
        {...props}
        drawerItems={COACH_DRAWER_ITEMS}
        userProfile={COACH_PROFILE}
        accentColors={['#1e3a8a', '#3b82f6']}
        loginRoute="Login"
    />
);

const CoachDrawerNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={props => <CoachCustomDrawer {...props} />}
            screenOptions={{
                headerShown: false,
                drawerType: 'front',
                drawerStyle: {
                    width: 300,
                },
                swipeEnabled: true,
                swipeEdgeWidth: 50,
            }}>
            <Drawer.Screen name="Dashboard" component={CoachDashboardScreen} />
            <Drawer.Screen name="Schedule" component={CoachScheduleScreen} />
            <Drawer.Screen name="Sessions" component={SessionsStack} />
            <Drawer.Screen name="TrainingPlans" component={TrainingPlansStack} />
            <Drawer.Screen name="Attendance" component={CoachAttendanceScreen} />
            <Drawer.Screen name="Announcements" component={CoachAnnouncementsScreen} />
            <Drawer.Screen name="Reports" component={CoachReportsScreen} />
            <Drawer.Screen name="IncidentReports" component={IncidentReportsScreen} />
            <Drawer.Screen name="Members" component={MembersStack} />
            <Drawer.Screen name="Profile" component={CoachProfileScreen} />
            <Drawer.Screen name="Settings" component={CoachSettingsScreen} />
        </Drawer.Navigator>
    );
};

export default CoachDrawerNavigator;