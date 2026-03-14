import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../auth/LoginScreen';
import RoleSelectionScreen from '../auth/RoleSelectionScreen';
import MemberDrawerNavigator from './MemberDrawerNavigator';
import CoachDrawerNavigator from './CoachDrawerNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
            <Stack.Screen name="MemberDrawer" component={MemberDrawerNavigator} />
            <Stack.Screen name="CoachDrawer" component={CoachDrawerNavigator} />
        </Stack.Navigator>
    );
};

export default AppNavigator;