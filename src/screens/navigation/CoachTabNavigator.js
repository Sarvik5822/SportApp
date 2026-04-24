import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Coach Screens
import CoachDashboardScreen from '../coach/CoachDashboardScreen';
import SessionsScreen from '../coach/SessionsScreen';
import CreateEditSessionScreen from '../coach/CreateEditSessionScreen';
import AttendanceScreen from '../coach/AttendanceScreen';
import CoachAttendanceScreen from '../coach/CoachAttendanceScreen';
import MembersScreen from '../coach/MembersScreen';
import MemberProfileScreen from '../coach/MemberProfileScreen';
import CoachProfileScreen from '../coach/CoachProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const SessionsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SessionsList" component={SessionsScreen} />
    <Stack.Screen name="CreateEditSession" component={CreateEditSessionScreen} />
    <Stack.Screen name="Attendance" component={AttendanceScreen} />
  </Stack.Navigator>
);

const MembersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MembersList" component={MembersScreen} />
    <Stack.Screen name="MemberProfile" component={MemberProfileScreen} />
  </Stack.Navigator>
);

const CoachTabNavigator = () => {
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
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'view-dashboard';
              break;
            case 'Sessions':
              iconName = 'calendar-clock';
              break;
            case 'AttendanceTab':
              iconName = 'clipboard-check-outline';
              break;
            case 'Members':
              iconName = 'account-multiple';
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
      <Tab.Screen name="Dashboard" component={CoachDashboardScreen} />
      <Tab.Screen name="Sessions" component={SessionsStack} />
      <Tab.Screen
        name="AttendanceTab"
        component={CoachAttendanceScreen}
        options={{ tabBarLabel: 'Attendance' }}
      />
      <Tab.Screen name="Members" component={MembersStack} />
      <Tab.Screen name="Profile" component={CoachProfileScreen} />
    </Tab.Navigator>
  );
};

export default CoachTabNavigator;