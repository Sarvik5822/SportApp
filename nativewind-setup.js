// nativewind-setup.js
// Fix NativeWind v4 CSS interop conflict with React Navigation.
// The issue: NativeWind wraps TouchableOpacity with CssInterop which
// tries to JSON.stringify the navigation context, causing the error.
// Solution: Remove the default interop on TouchableOpacity and re-register
// it without the problematic serialization.

import { remapProps } from 'nativewind';
import { TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// Remove NativeWind's default CssInterop on TouchableOpacity
// and use remapProps instead, which doesn't serialize context
remapProps(TouchableOpacity, {
    className: 'style',
});

// Also remap LinearGradient to support className
remapProps(LinearGradient, {
    className: 'style',
});