import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import {
    MOCK_PAYMENTS,
    MOCK_PAYMENT_METHODS,
    AVAILABLE_PAYMENT_METHODS,
} from '../../data/payments';

// ═══════════════════════════════════════════════
// ─── SECTION TITLE COMPONENT ───
// ═══════════════════════════════════════════════
const SectionTitle = ({ title, icon, onViewAll, iconColor = '#059669' }) => (
    <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
            <View
                className="w-8 h-8 rounded-lg justify-center items-center mr-2.5"
                style={{ backgroundColor: `${iconColor}15` }}>
                <Icon name={icon} size={16} color={iconColor} />
            </View>
            <Text className="text-gray-900 font-bold text-lg">{title}</Text>
        </View>
        {onViewAll && (
            <TouchableOpacity
                onPress={onViewAll}
                activeOpacity={0.7}
                className="flex-row items-center bg-emerald-50 px-3 py-1.5 rounded-full">
                <Text className="text-emerald-600 font-semibold text-xs">View All</Text>
                <Icon name="chevron-right" size={14} color="#059669" />
            </TouchableOpacity>
        )}
    </View>
);

// ═══════════════════════════════════════════════
// ─── HELPERS ───
// ═══════════════════════════════════════════════
const getPaymentTypeConfig = (type) => {
    const configs = {
        membership: { icon: 'card-membership', primary: '#8b5cf6', gradient: ['#8b5cf6', '#a78bfa'] },
        session: { icon: 'calendar-check', primary: '#22c55e', gradient: ['#22c55e', '#4ade80'] },
        rental: { icon: 'package-variant', primary: '#f59e0b', gradient: ['#f59e0b', '#fbbf24'] },
        facility: { icon: 'office-building', primary: '#06b6d4', gradient: ['#0891b2', '#06b6d4'] },
        event: { icon: 'trophy-variant', primary: '#ec4899', gradient: ['#db2777', '#ec4899'] },
        default: { icon: 'credit-card', primary: '#3b82f6', gradient: ['#3b82f6', '#60a5fa'] },
    };
    return configs[type] || configs.default;
};

const getStatusConfig = (status) => {
    switch (status) {
        case 'paid':
        case 'completed':
            return { bg: '#dcfce7', textColor: '#166534', dotColor: '#059669' };
        case 'pending':
            return { bg: '#fef3c7', textColor: '#92400e', dotColor: '#f59e0b' };
        case 'failed':
            return { bg: '#fee2e2', textColor: '#991b1b', dotColor: '#ef4444' };
        default:
            return { bg: '#f3f4f6', textColor: '#374151', dotColor: '#6b7280' };
    }
};

// ═══════════════════════════════════════════════
// ─── PAYMENT ITEM COMPONENT ───
// ═══════════════════════════════════════════════
const PaymentItem = ({ payment, onDownload }) => {
    const paymentConfig = getPaymentTypeConfig(payment.type);
    const statusConfig = getStatusConfig(payment.status);

    return (
        <View
            className="bg-white rounded-2xl p-4 mb-3 overflow-hidden"
            style={{
                elevation: 3,
                borderLeftWidth: 4,
                borderLeftColor: paymentConfig.primary,
            }}>
            <View className="flex-row items-center">
                <LinearGradient
                    colors={paymentConfig.gradient}
                    className="w-11 h-11 rounded-xl justify-center items-center"
                    style={{ borderRadius: 12 }}>
                    <Icon name={paymentConfig.icon} size={20} color="#fff" />
                </LinearGradient>

                <View className="flex-1 ml-3">
                    <Text className="text-gray-900 font-bold text-sm" numberOfLines={1}>
                        {payment.description || payment.type}
                    </Text>
                    <View className="flex-row items-center mt-1.5 flex-wrap">
                        <View className="flex-row items-center mr-3">
                            <Icon name="clock-outline" size={11} color="#9ca3af" />
                            <Text className="text-gray-400 text-xs ml-1">
                                {new Date(payment.createdAt || payment.date).toLocaleDateString('en-IN', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </Text>
                        </View>
                        {payment.method && (
                            <View className="flex-row items-center">
                                <Icon name="credit-card-outline" size={11} color="#9ca3af" />
                                <Text className="text-gray-400 text-xs ml-1">
                                    {payment.method}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View className="items-end ml-2">
                    <Text className="text-gray-900 font-bold text-base">₹{payment.amount}</Text>
                    <View
                        className="px-2.5 py-1 rounded-full mt-1.5 flex-row items-center"
                        style={{ backgroundColor: statusConfig.bg }}>
                        <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: statusConfig.dotColor }} />
                        <Text className="text-[10px] font-bold capitalize" style={{ color: statusConfig.textColor }}>
                            {payment.status}
                        </Text>
                    </View>
                </View>
            </View>

            {payment.invoiceUrl && (
                <TouchableOpacity
                    onPress={() => onDownload(payment)}
                    activeOpacity={0.7}
                    className="flex-row items-center justify-center mt-3 pt-3 border-t border-gray-50">
                    <View className="w-6 h-6 bg-blue-50 rounded-md justify-center items-center mr-1.5">
                        <Icon name="download" size={12} color="#3b82f6" />
                    </View>
                    <Text className="text-blue-600 text-xs font-semibold">Download Invoice</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

// ═══════════════════════════════════════════════
// ─── PAYMENT METHOD CARD ───
// ═══════════════════════════════════════════════
const PaymentMethodCard = ({ method }) => (
    <View
        className="flex-row items-center justify-between p-4 bg-white rounded-2xl border border-gray-100"
        style={{ elevation: 2 }}>
        <View className="flex-row items-center flex-1">
            <LinearGradient
                colors={['#2563eb', '#3b82f6']}
                className="w-11 h-11 rounded-xl justify-center items-center"
                style={{ borderRadius: 12 }}>
                <Icon name="credit-card" size={20} color="#fff" />
            </LinearGradient>
            <View className="ml-3 flex-1">
                <Text className="text-gray-900 font-bold text-sm">{method.name}</Text>
                <Text className="text-gray-400 text-xs mt-0.5">Expires {method.expiry}</Text>
            </View>
        </View>
        {method.isDefault && (
            <View className="bg-emerald-50 px-3 py-1.5 rounded-full flex-row items-center border border-emerald-200">
                <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                <Text className="text-emerald-700 text-[10px] font-bold">Default</Text>
            </View>
        )}
    </View>
);

// ═══════════════════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════
const PaymentsScreen = ({ navigation }) => {
    // ─── 1. ALL STATE HOOKS ───
    const [payments, setPayments] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddMethodModal, setShowAddMethodModal] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('card');

    // ─── 2. ALL CALLBACK HOOKS ───
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 800));
            setPayments(MOCK_PAYMENTS);
            setPaymentMethods(MOCK_PAYMENT_METHODS);
        } catch (error) {
            Alert.alert('Error', 'Failed to load payment data');
        } finally {
            setLoading(false);
        }
    }, []);

    // ─── 3. ALL EFFECT HOOKS ───
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ─── 4. ALL MEMO HOOKS ───
    const statsData = useMemo(() => {
        const totalPaid = payments
            .filter(p => p.status === 'paid' || p.status === 'completed')
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        const totalPending = payments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        const totalFailed = payments
            .filter(p => p.status === 'failed')
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        const thisMonth = new Date();
        const thisMonthTotal = payments
            .filter(p => {
                const pDate = new Date(p.createdAt || p.date);
                return (
                    pDate.getMonth() === thisMonth.getMonth() &&
                    pDate.getFullYear() === thisMonth.getFullYear()
                );
            })
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        return { totalPaid, totalPending, totalFailed, thisMonthTotal };
    }, [payments]);

    // ─── 5. NORMAL VARIABLES & FUNCTIONS ───
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const statsConfig = [
        {
            label: 'Total Paid',
            value: `₹${statsData.totalPaid}`,
            icon: 'check-decagram',
            color: '#059669',
            gradient: ['#059669', '#34d399'],
        },
        {
            label: 'Pending',
            value: `₹${statsData.totalPending}`,
            icon: 'clock-alert-outline',
            color: '#f59e0b',
            gradient: ['#f59e0b', '#fbbf24'],
        },
        {
            label: 'This Month',
            value: `₹${statsData.thisMonthTotal}`,
            icon: 'calendar-month',
            color: '#3b82f6',
            gradient: ['#3b82f6', '#60a5fa'],
        },
        {
            label: 'Failed',
            value: `₹${statsData.totalFailed}`,
            icon: 'alert-octagon-outline',
            color: '#ef4444',
            gradient: ['#ef4444', '#f87171'],
        },
    ];

    const handleAddPaymentMethod = () => {
        setSelectedMethod('card');
        setShowAddMethodModal(true);
    };

    const confirmAddPaymentMethod = () => {
        const methodName = AVAILABLE_PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name;
        Alert.alert('Success', `${methodName} added successfully!`);
        setShowAddMethodModal(false);
    };

    const handleDownloadInvoice = payment => {
        Alert.alert('Download Invoice', `Invoice for "${payment.description}" will be downloaded.`);
    };

    // ─── 6. CONDITIONAL RETURNS (AFTER ALL HOOKS) ───
    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <View className="w-16 h-16 rounded-2xl bg-emerald-50 justify-center items-center mb-4">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
                <Text className="text-gray-900 font-bold text-base">Loading Payments</Text>
                <Text className="text-gray-400 mt-1 text-sm">Fetching your transactions...</Text>
            </View>
        );
    }

    // ─── 7. MAIN RENDER ───
    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#059669']}
                    tintColor="#059669"
                />
            }>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── HEADER ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <LinearGradient
                colors={['#064e3b', '#059669', '#10b981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingTop: 48, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>

                <View className="flex-row justify-between items-center px-5 mb-5">
                    <DrawerMenuButton />
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={handleAddPaymentMethod}
                            className="w-10 h-10 bg-white/15 rounded-full justify-center items-center mr-2">
                            <Icon name="plus" size={22} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Settings')}
                            className="w-10 h-10 bg-white/15 rounded-full justify-center items-center">
                            <Icon name="cog-outline" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="px-5 mb-5">
                    <View className="flex-row items-center">
                        <View className="w-12 h-12 bg-white/15 rounded-2xl justify-center items-center mr-3.5">
                            <Icon name="wallet" size={24} color="#fff" />
                        </View>
                        <View>
                            <Text className="text-white/60 text-sm font-medium">Manage your</Text>
                            <Text className="text-white font-bold text-2xl">Payments</Text>
                        </View>
                    </View>
                </View>

                <View className="mx-5 bg-white/10 rounded-2xl p-4" style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                            <View className="w-10 h-10 bg-yellow-400/20 rounded-xl justify-center items-center">
                                <Icon name="cash-multiple" size={20} color="#fbbf24" />
                            </View>
                            <View className="ml-3">
                                <Text className="text-white/50 text-[10px] font-medium uppercase tracking-wider">
                                    Total Paid
                                </Text>
                                <Text className="text-white font-bold text-lg">
                                    ₹{statsData.totalPaid}
                                </Text>
                            </View>
                        </View>

                        <View className="w-px h-10 bg-white/20 mx-3" />

                        <View className="flex-row items-center flex-1">
                            <View className="w-10 h-10 bg-orange-400/20 rounded-xl justify-center items-center">
                                <Icon name="clock-outline" size={20} color="#fb923c" />
                            </View>
                            <View className="ml-3">
                                <Text className="text-white/50 text-[10px] font-medium uppercase tracking-wider">
                                    Pending
                                </Text>
                                <Text className="text-white font-bold text-lg">
                                    ₹{statsData.totalPending}
                                </Text>
                            </View>
                        </View>

                        <View className="w-px h-10 bg-white/20 mx-3" />

                        <View className="items-center">
                            <View className="bg-emerald-400 px-3 py-2 rounded-xl flex-row items-center">
                                <View className="w-2 h-2 rounded-full bg-white mr-1.5" />
                                <Text className="text-white font-bold text-[10px]">
                                    {payments.length} Txns
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── STATS GRID ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 -mt-5">
                <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
                    {statsConfig.map(stat => (
                        <View key={stat.label} style={{ width: '50%', padding: 4 }}>
                            <View className="bg-white rounded-2xl p-4 shadow-md" style={{ elevation: 4 }}>
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                                            {stat.label}
                                        </Text>
                                        <Text className="text-gray-900 font-bold text-2xl mt-1">
                                            {stat.value}
                                        </Text>
                                    </View>
                                    <LinearGradient
                                        colors={stat.gradient}
                                        className="w-11 h-11 rounded-xl justify-center items-center"
                                        style={{ borderRadius: 12 }}>
                                        <Icon name={stat.icon} size={20} color="#fff" />
                                    </LinearGradient>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── PAYMENT METHODS ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-6">
                <SectionTitle
                    title="Payment Methods"
                    icon="credit-card-multiple"
                    iconColor="#3b82f6"
                    onViewAll={handleAddPaymentMethod}
                />

                {paymentMethods.length > 0 ? (
                    <View style={{ gap: 10 }}>
                        {paymentMethods.map(method => (
                            <PaymentMethodCard key={method.id} method={method} />
                        ))}
                    </View>
                ) : (
                    <View className="bg-white rounded-2xl p-8 items-center" style={{ elevation: 3 }}>
                        <View className="w-16 h-16 rounded-full bg-gray-50 justify-center items-center mb-3">
                            <Icon name="credit-card-off-outline" size={32} color="#d1d5db" />
                        </View>
                        <Text className="text-gray-400 font-medium text-sm">No payment methods added</Text>
                    </View>
                )}

                <TouchableOpacity
                    onPress={handleAddPaymentMethod}
                    activeOpacity={0.85}
                    className="mt-3">
                    <LinearGradient
                        colors={['#1e3a8a', '#3b82f6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ borderRadius: 20, padding: 16 }}>
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <View className="w-10 h-10 bg-white/15 rounded-xl justify-center items-center">
                                    <Icon name="credit-card-plus-outline" size={22} color="#fff" />
                                </View>
                                <View className="ml-3">
                                    <Text className="text-white font-bold text-sm">Add New Method</Text>
                                    <Text className="text-white/60 text-xs mt-0.5">UPI, Cards & more</Text>
                                </View>
                            </View>
                            <LinearGradient
                                colors={['#60a5fa', '#93c5fd']}
                                style={{
                                    borderRadius: 12,
                                    paddingHorizontal: 14,
                                    paddingVertical: 8,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                <Icon name="plus" size={14} color="#fff" />
                                <Text className="text-white font-bold text-xs ml-1">Add</Text>
                            </LinearGradient>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── PAYMENT HISTORY ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-6">
                <SectionTitle
                    title={`${payments.length} Transactions`}
                    icon="history"
                    iconColor="#8b5cf6"
                />

                {payments.length > 0 ? (
                    payments.map(payment => (
                        <PaymentItem
                            key={payment._id}
                            payment={payment}
                            onDownload={handleDownloadInvoice}
                        />
                    ))
                ) : (
                    <View className="bg-white rounded-2xl p-10 items-center" style={{ elevation: 3 }}>
                        <View className="w-20 h-20 rounded-full bg-gray-50 justify-center items-center mb-4">
                            <Icon name="receipt-text-outline" size={40} color="#d1d5db" />
                        </View>
                        <Text className="text-gray-900 font-bold text-base">No Transactions</Text>
                        <Text className="text-gray-400 text-sm text-center mt-1 max-w-[240]">
                            Your payment history will appear here
                        </Text>
                    </View>
                )}
            </View>

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
                    <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
                        <View className="flex-row justify-between items-center mb-2">
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-lg bg-blue-50 justify-center items-center mr-2.5">
                                    <Icon name="credit-card-plus" size={18} color="#2563eb" />
                                </View>
                                <Text className="text-gray-900 font-bold text-xl">
                                    Add Payment Method
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowAddMethodModal(false)}>
                                <View className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center">
                                    <Icon name="close" size={18} color="#6b7280" />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <Text className="text-gray-500 text-sm mb-5">
                            Choose a payment method to add to your account
                        </Text>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {AVAILABLE_PAYMENT_METHODS.map(method => {
                                const isSelected = selectedMethod === method.id;
                                return (
                                    <TouchableOpacity
                                        key={method.id}
                                        onPress={() => setSelectedMethod(method.id)}
                                        activeOpacity={0.7}
                                        className={`flex-row items-center p-4 rounded-2xl mb-3 border-2 ${isSelected
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-100 bg-white'
                                            }`}
                                        style={!isSelected ? { elevation: 1 } : {}}>
                                        <View
                                            className="w-10 h-10 rounded-xl justify-center items-center mr-3"
                                            style={{
                                                backgroundColor: isSelected ? '#2563eb15' : '#f3f4f6',
                                            }}>
                                            <Icon
                                                name={method.icon}
                                                size={20}
                                                color={isSelected ? '#2563eb' : '#6b7280'}
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text
                                                className={`font-bold text-sm ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                                                {method.name}
                                            </Text>
                                            <Text className="text-gray-400 text-xs mt-0.5">
                                                {method.description}
                                            </Text>
                                        </View>
                                        <Icon
                                            name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                                            size={22}
                                            color={isSelected ? '#2563eb' : '#d1d5db'}
                                        />
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        <View className="flex-row mt-4" style={{ gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => setShowAddMethodModal(false)}
                                className="flex-1"
                                style={{
                                    borderRadius: 14,
                                    borderWidth: 1.5,
                                    borderColor: '#e5e7eb',
                                    paddingVertical: 14,
                                    alignItems: 'center',
                                }}>
                                <Text className="text-gray-700 font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={confirmAddPaymentMethod}
                                activeOpacity={0.8}
                                className="flex-1">
                                <LinearGradient
                                    colors={['#1e3a8a', '#3b82f6']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{
                                        borderRadius: 14,
                                        paddingVertical: 14,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                    <Icon name="plus-circle" size={18} color="#fff" />
                                    <Text className="text-white font-bold ml-2">Add Method</Text>
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