import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DrawerMenuButton from '../../components/DrawerMenuButton';
import SectionHeader from '../../components/SectionHeader';
import {
    MOCK_PAYMENTS,
    MOCK_PAYMENT_METHODS,
    AVAILABLE_PAYMENT_METHODS,
} from '../../data/payments';

const PaymentsScreen = ({ navigation }) => {
    const [payments, setPayments] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddMethodModal, setShowAddMethodModal] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('card');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));
            setPayments(MOCK_PAYMENTS);
            setPaymentMethods(MOCK_PAYMENT_METHODS);
        } catch (error) {
            Alert.alert('Error', 'Failed to load payment data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    // Calculate totals
    const totalPaid = payments
        .filter(p => p.status === 'paid' || p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalPending = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    const thisMonth = new Date();
    const thisMonthPayments = payments
        .filter(p => {
            const pDate = new Date(p.createdAt || p.date);
            return (
                pDate.getMonth() === thisMonth.getMonth() &&
                pDate.getFullYear() === thisMonth.getFullYear()
            );
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    const handleAddPaymentMethod = () => {
        setSelectedMethod('card');
        setShowAddMethodModal(true);
    };

    const confirmAddPaymentMethod = () => {
        const methodName = AVAILABLE_PAYMENT_METHODS.find(
            m => m.id === selectedMethod,
        )?.name;
        Alert.alert('Success', `${methodName} added successfully!`);
        setShowAddMethodModal(false);
    };

    const handleDownloadInvoice = payment => {
        Alert.alert(
            'Download Invoice',
            `Invoice for "${payment.description}" will be downloaded.`,
        );
    };

    // Get status color config
    const getStatusConfig = status => {
        switch (status) {
            case 'paid':
            case 'completed':
                return {
                    bg: 'bg-emerald-100',
                    text: 'text-emerald-700',
                    iconColor: '#059669',
                    dotColor: '#059669',
                };
            case 'pending':
                return {
                    bg: 'bg-yellow-100',
                    text: 'text-yellow-700',
                    iconColor: '#f59e0b',
                    dotColor: '#f59e0b',
                };
            case 'failed':
                return {
                    bg: 'bg-red-100',
                    text: 'text-red-700',
                    iconColor: '#ef4444',
                    dotColor: '#ef4444',
                };
            default:
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-700',
                    iconColor: '#6b7280',
                    dotColor: '#6b7280',
                };
        }
    };

    // Get payment type icon
    const getPaymentIcon = type => {
        switch (type) {
            case 'membership':
                return 'card-membership';
            case 'session':
                return 'calendar-check';
            case 'rental':
                return 'package-variant';
            case 'facility':
                return 'office-building';
            case 'event':
                return 'trophy-variant';
            default:
                return 'credit-card';
        }
    };

    // ─── Loading State ───
    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#059669" />
                <Text className="text-gray-500 mt-3">Loading payments...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#059669']}
                />
            }>
            {/* ─── Header ─── */}
            <LinearGradient
                colors={['#059669', '#10b981']}
                className="px-6 pt-12 pb-8 rounded-b-[30px]">
                <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-row items-center">
                        <DrawerMenuButton />
                        <View className="ml-3">
                            <Text className="text-white/80 text-sm">Manage your</Text>
                            <Text className="text-white font-bold text-2xl">
                                Payments & Invoices
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Stats Cards Row */}
                <View className="flex-row gap-3">
                    {/* Total Paid */}
                    <View className="flex-1 bg-white/20 rounded-xl p-3">
                        <View className="flex-row items-center mb-1">
                            <Icon name="check-circle" size={16} color="#fbbf24" />
                            <Text className="text-white/70 text-xs ml-1">Total Paid</Text>
                        </View>
                        <Text className="text-white font-bold text-xl">₹{totalPaid}</Text>
                    </View>

                    {/* Pending */}
                    <View className="flex-1 bg-white/20 rounded-xl p-3">
                        <View className="flex-row items-center mb-1">
                            <Icon name="clock-outline" size={16} color="#fbbf24" />
                            <Text className="text-white/70 text-xs ml-1">Pending</Text>
                        </View>
                        <Text className="text-white font-bold text-xl">
                            ₹{totalPending}
                        </Text>
                    </View>

                    {/* This Month */}
                    <View className="flex-1 bg-white/20 rounded-xl p-3">
                        <View className="flex-row items-center mb-1">
                            <Icon name="calendar-month" size={16} color="#fbbf24" />
                            <Text className="text-white/70 text-xs ml-1">This Month</Text>
                        </View>
                        <Text className="text-white font-bold text-xl">
                            ₹{thisMonthPayments}
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            {/* ─── Payment Methods Card ─── */}
            <View className="px-4 -mt-4">
                <View
                    className="bg-white rounded-2xl p-5 border-2 border-emerald-500"
                    style={{ elevation: 6 }}>
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center">
                            <Icon name="credit-card-multiple" size={22} color="#059669" />
                            <Text className="text-gray-900 font-bold text-lg ml-2">
                                Payment Methods
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleAddPaymentMethod}
                            activeOpacity={0.8}>
                            <LinearGradient
                                colors={['#059669', '#10b981']}
                                className="rounded-lg px-3 py-2 flex-row items-center">
                                <Icon name="plus" size={16} color="#fff" />
                                <Text className="text-white font-semibold text-xs ml-1">
                                    Add
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {paymentMethods.length > 0 ? (
                        paymentMethods.map(method => (
                            <View
                                key={method.id}
                                className="flex-row items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                                <View className="flex-row items-center flex-1">
                                    <View className="w-12 h-12 bg-blue-100 rounded-xl justify-center items-center">
                                        <Icon name="credit-card" size={24} color="#3b82f6" />
                                    </View>
                                    <View className="ml-3 flex-1">
                                        <Text className="text-gray-900 font-semibold">
                                            {method.name}
                                        </Text>
                                        <Text className="text-gray-400 text-xs mt-0.5">
                                            Expires {method.expiry}
                                        </Text>
                                    </View>
                                </View>
                                {method.isDefault && (
                                    <View className="bg-emerald-100 px-3 py-1 rounded-full">
                                        <Text className="text-emerald-700 text-xs font-bold">
                                            Default
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))
                    ) : (
                        <View className="items-center py-4">
                            <Icon name="credit-card-off" size={36} color="#d1d5db" />
                            <Text className="text-gray-400 text-sm mt-2">
                                No payment methods added
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* ─── Payment History ─── */}
            <View className="mt-4">
                <SectionHeader
                    title="Payment History"
                    icon="history"
                    showSeeAll={false}
                />
                <View className="px-4">
                    {payments.length > 0 ? (
                        payments.map(payment => {
                            const statusConfig = getStatusConfig(payment.status);
                            const paymentIcon = getPaymentIcon(payment.type);

                            return (
                                <View
                                    key={payment._id}
                                    className="bg-white rounded-2xl p-4 mb-3"
                                    style={{ elevation: 3 }}>
                                    <View className="flex-row items-center">
                                        {/* Icon */}
                                        <View
                                            className={`w-12 h-12 rounded-full justify-center items-center ${statusConfig.bg}`}>
                                            <Icon
                                                name={paymentIcon}
                                                size={22}
                                                color={statusConfig.iconColor}
                                            />
                                        </View>

                                        {/* Details */}
                                        <View className="flex-1 ml-3">
                                            <Text
                                                className="text-gray-900 font-semibold text-sm"
                                                numberOfLines={1}>
                                                {payment.description || payment.type}
                                            </Text>
                                            <View className="flex-row items-center mt-1">
                                                <Icon name="calendar" size={12} color="#9ca3af" />
                                                <Text className="text-gray-400 text-xs ml-1">
                                                    {new Date(
                                                        payment.createdAt || payment.date,
                                                    ).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </Text>
                                                {payment.method && (
                                                    <>
                                                        <Text className="text-gray-300 text-xs mx-1.5">
                                                            •
                                                        </Text>
                                                        <Text className="text-gray-400 text-xs">
                                                            {payment.method}
                                                        </Text>
                                                    </>
                                                )}
                                            </View>
                                        </View>

                                        {/* Amount & Status */}
                                        <View className="items-end ml-2">
                                            <Text className="text-gray-900 font-bold text-base">
                                                ₹{payment.amount}
                                            </Text>
                                            <View
                                                className={`${statusConfig.bg} px-2.5 py-0.5 rounded-full mt-1`}>
                                                <Text
                                                    className={`${statusConfig.text} text-xs font-semibold`}>
                                                    {payment.status.charAt(0).toUpperCase() +
                                                        payment.status.slice(1)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Invoice Download Button */}
                                    {payment.invoiceUrl && (
                                        <TouchableOpacity
                                            onPress={() => handleDownloadInvoice(payment)}
                                            activeOpacity={0.7}
                                            className="flex-row items-center justify-center mt-3 pt-3 border-t border-gray-100">
                                            <Icon name="download" size={16} color="#3b82f6" />
                                            <Text className="text-blue-600 text-sm font-medium ml-1.5">
                                                Download Invoice
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        })
                    ) : (
                        <View
                            className="bg-white rounded-2xl p-8 items-center"
                            style={{ elevation: 2 }}>
                            <Icon name="credit-card-off-outline" size={48} color="#d1d5db" />
                            <Text className="text-gray-400 mt-3 text-base">
                                No payment records found
                            </Text>
                            <Text className="text-gray-300 text-sm mt-1">
                                Your payment history will appear here
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Bottom Spacing */}
            <View className="h-8" />

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── ADD PAYMENT METHOD MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showAddMethodModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAddMethodModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6">
                        {/* Modal Header */}
                        <View className="flex-row justify-between items-center mb-2">
                            <View className="flex-row items-center">
                                <Icon name="credit-card-plus" size={24} color="#059669" />
                                <Text className="text-gray-900 font-bold text-xl ml-2">
                                    Add Payment Method
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowAddMethodModal(false)}>
                                <Icon name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-gray-500 text-sm mb-5">
                            Choose a payment method to add to your account
                        </Text>

                        {/* Payment Method Options */}
                        {AVAILABLE_PAYMENT_METHODS.map(method => {
                            const isSelected = selectedMethod === method.id;
                            return (
                                <TouchableOpacity
                                    key={method.id}
                                    onPress={() => setSelectedMethod(method.id)}
                                    activeOpacity={0.7}
                                    className={`flex-row items-center p-4 rounded-xl mb-3 border-2 ${isSelected
                                            ? 'border-emerald-500 bg-emerald-50'
                                            : 'border-gray-200 bg-white'
                                        }`}>
                                    <Icon
                                        name={
                                            isSelected ? 'radiobox-marked' : 'radiobox-blank'
                                        }
                                        size={22}
                                        color={isSelected ? '#059669' : '#d1d5db'}
                                    />
                                    <View
                                        className={`w-10 h-10 rounded-lg justify-center items-center ml-3 ${isSelected ? 'bg-emerald-100' : 'bg-gray-100'
                                            }`}>
                                        <Icon
                                            name={method.icon}
                                            size={20}
                                            color={isSelected ? '#059669' : '#6b7280'}
                                        />
                                    </View>
                                    <View className="ml-3 flex-1">
                                        <Text
                                            className={`font-semibold ${isSelected ? 'text-emerald-700' : 'text-gray-900'
                                                }`}>
                                            {method.name}
                                        </Text>
                                        <Text className="text-gray-400 text-xs mt-0.5">
                                            {method.description}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}

                        {/* Buttons */}
                        <View className="flex-row gap-3 mt-3">
                            <TouchableOpacity
                                onPress={() => setShowAddMethodModal(false)}
                                className="flex-1 border border-gray-300 rounded-xl py-4 items-center">
                                <Text className="text-gray-700 font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={confirmAddPaymentMethod}
                                activeOpacity={0.8}
                                className="flex-1">
                                <LinearGradient
                                    colors={['#059669', '#10b981']}
                                    className="rounded-xl py-4 items-center flex-row justify-center">
                                    <Icon name="plus-circle" size={20} color="#fff" />
                                    <Text className="text-white font-bold ml-2">
                                        Add Method
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

export default PaymentsScreen;