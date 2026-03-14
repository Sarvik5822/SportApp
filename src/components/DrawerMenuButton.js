import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const DrawerMenuButton = ({ color = '#fff', size = 26 }) => {
    const navigation = useNavigation();

    const openDrawer = () => {
        // Try to open the parent drawer
        if (navigation.openDrawer) {
            navigation.openDrawer();
        } else if (navigation.getParent()?.openDrawer) {
            navigation.getParent().openDrawer();
        }
    };

    return (
        <TouchableOpacity
            onPress={openDrawer}
            className="w-10 h-10 bg-white/20 rounded-full justify-center items-center"
            activeOpacity={0.7}>
            <Icon name="menu" size={size} color={color} />
        </TouchableOpacity>
    );
};

export default DrawerMenuButton;