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
import ProgressBar from '../../components/ProgressBar';
import { MOCK_MEMBERSHIP, MOCK_PLANS } from '../../data/membership';

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
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════
const MembershipScreen = ({ navigation }) => {
  const [membership, setMembership] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    plan: null,
    type: '',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setMembership(MOCK_MEMBERSHIP);
      setPlans(MOCK_PLANS);
    } catch (error) {
      Alert.alert('Error', 'Failed to load membership data');
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

  // Calculate days
  const endDate = membership?.endDate ? new Date(membership.endDate) : null;
  const startDate = membership?.startDate
    ? new Date(membership.startDate)
    : null;
  const today = new Date();
  const daysUntilExpiry = endDate
    ? Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))
    : 0;
  const totalDays =
    endDate && startDate
      ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
      : 365;
  const daysUsed = totalDays - daysUntilExpiry;
  const usageProgress =
    totalDays > 0 ? Math.min((daysUsed / totalDays) * 100, 100) : 0;
  const currentPlan = membership?.plan;

  const getPlanType = plan => {
    if (!currentPlan) {
      return 'select';
    }
    if (plan._id === currentPlan._id || plan.name === currentPlan.name) {
      return 'current';
    }
    if (plan.price > (currentPlan.price || 0)) {
      return 'upgrade';
    }
    if (plan.price < (currentPlan.price || 0)) {
      return 'downgrade';
    }
    return 'switch';
  };

  const handlePlanAction = plan => {
    const planType = getPlanType(plan);
    if (planType === 'current') {
      return;
    }
    setConfirmModal({ visible: true, plan, type: planType });
  };

  const confirmPlanChange = async () => {
    const { plan, type } = confirmModal;
    if (!plan) {
      return;
    }
    try {
      setChangingPlan(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const actionText =
        type === 'upgrade'
          ? 'Upgrade'
          : type === 'downgrade'
            ? 'Plan change'
            : 'Plan switch';
      Alert.alert('Success', `${actionText} to ${plan.name} initiated!`, [
        {
          text: 'OK',
          onPress: () => {
            setConfirmModal({ visible: false, plan: null, type: '' });
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to change plan');
    } finally {
      setChangingPlan(false);
    }
  };

  const handleRenew = () => {
    Alert.alert(
      'Renew Membership',
      'Are you sure you want to renew your membership?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Renew',
          onPress: () => {
            Alert.alert('Success', 'Membership renewal initiated!');
          },
        },
      ],
    );
  };

  const getButtonConfig = planType => {
    switch (planType) {
      case 'current':
        return {
          colors: ['#d1d5db', '#d1d5db'],
          textColor: '#6b7280',
          label: 'Current Plan',
          disabled: true,
          iconName: 'check-circle',
        };
      case 'upgrade':
        return {
          colors: ['#059669', '#10b981'],
          textColor: '#ffffff',
          label: 'Upgrade',
          disabled: false,
          iconName: 'arrow-up-circle',
        };
      case 'downgrade':
        return {
          colors: ['#6b7280', '#9ca3af'],
          textColor: '#ffffff',
          label: 'Switch Plan',
          disabled: false,
          iconName: 'arrow-down-circle',
        };
      case 'switch':
        return {
          colors: ['#3b82f6', '#60a5fa'],
          textColor: '#ffffff',
          label: 'Switch Plan',
          disabled: false,
          iconName: 'swap-horizontal-circle',
        };
      default:
        return {
          colors: ['#059669', '#10b981'],
          textColor: '#ffffff',
          label: 'Select Plan',
          disabled: false,
          iconName: 'arrow-right-circle',
        };
    }
  };

  // ─── Loading State ───
  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <View className="w-16 h-16 rounded-2xl bg-emerald-50 justify-center items-center mb-4">
          <ActivityIndicator size="large" color="#059669" />
        </View>
        <Text className="text-gray-900 font-bold text-base">
          Loading Membership
        </Text>
        <Text className="text-gray-400 mt-1 text-sm">
          Fetching your plan details...
        </Text>
      </View>
    );
  }

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
        style={{
          paddingTop: 48,
          paddingBottom: 32,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}>
        {/* Top Bar */}
        <View className="flex-row justify-between items-center px-5 mb-5">
          <DrawerMenuButton />
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={handleRenew}
              className="bg-white/15 rounded-full justify-center items-center mr-2"
              style={{ width: 40, height: 40 }}>
              <Icon name="refresh" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              className="bg-white/15 rounded-full justify-center items-center"
              style={{ width: 40, height: 40 }}>
              <Icon name="cog-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Title Section */}
        <View className="px-5 mb-5">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-white/15 rounded-2xl justify-center items-center mr-3.5">
              <Icon
                name="card-account-details-star"
                size={24}
                color="#fff"
              />
            </View>
            <View>
              <Text className="text-white/60 text-sm font-medium">
                Manage your
              </Text>
              <Text className="text-white font-bold text-2xl">
                Membership
              </Text>
            </View>
          </View>
        </View>

        {/* Current Plan Info Bar */}
        <View
          className="mx-5 bg-white/10 rounded-2xl p-4"
          style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 bg-yellow-400/20 rounded-xl justify-center items-center">
                <Icon name="star" size={24} color="#fbbf24" />
              </View>
              <View className="ml-3">
                <Text className="text-white font-bold text-base">
                  {currentPlan?.name || 'N/A'}
                </Text>
                <Text className="text-white/50 text-xs mt-0.5">
                  ₹{currentPlan?.price || 0}/
                  {currentPlan?.duration === 1
                    ? 'month'
                    : `${currentPlan?.duration || 0} months`}
                </Text>
              </View>
            </View>
            <View className="bg-emerald-400 px-4 py-2 rounded-xl flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-white mr-1.5" />
              <Text className="text-white font-bold text-xs">
                {membership?.status === 'active'
                  ? 'Active'
                  : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* ═══════════════════════════════════════════════ */}
      {/* ─── MEMBERSHIP PERIOD CARD ─── */}
      {/* ═══════════════════════════════════════════════ */}
      <View className="px-4 -mt-5">
        <View
          className="bg-white rounded-2xl p-5 shadow-md"
          style={{ elevation: 5 }}>
          {/* Date Info Row */}
          <View className="flex-row">
            <View className="flex-1">
              <View className="flex-row items-center mb-1.5">
                <View
                  className="w-8 h-8 rounded-lg justify-center items-center mr-2"
                  style={{ backgroundColor: '#05966915' }}>
                  <Icon
                    name="calendar-start"
                    size={16}
                    color="#059669"
                  />
                </View>
                <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">
                  Start Date
                </Text>
              </View>
              <Text className="text-gray-900 font-bold text-sm ml-10">
                {startDate
                  ? startDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                  : 'N/A'}
              </Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center mb-1.5">
                <View
                  className="w-8 h-8 rounded-lg justify-center items-center mr-2"
                  style={{ backgroundColor: '#f9731615' }}>
                  <Icon
                    name="calendar-end"
                    size={16}
                    color="#f97316"
                  />
                </View>
                <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">
                  Expires On
                </Text>
              </View>
              <Text className="text-gray-900 font-bold text-sm ml-10">
                {endDate
                  ? endDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                  : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          {endDate && (
            <View className="mt-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500 text-xs font-medium">
                  Membership Period
                </Text>
                <Text
                  className="text-xs font-bold"
                  style={{
                    color:
                      daysUntilExpiry <= 30
                        ? '#f59e0b'
                        : '#059669',
                  }}>
                  {daysUntilExpiry > 0
                    ? `${daysUntilExpiry} days remaining`
                    : 'Expired'}
                </Text>
              </View>
              <ProgressBar
                progress={usageProgress}
                total={100}
                height={8}
                showPercentage={false}
                color="bg-emerald-500"
              />
            </View>
          )}

          {/* Bottom Info */}
          <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-gray-50">
            {membership?.branch && (
              <View className="flex-row items-center">
                <Icon
                  name="office-building"
                  size={14}
                  color="#6b7280"
                />
                <Text className="text-gray-500 text-xs ml-1">
                  {membership.branch.name}
                </Text>
              </View>
            )}
            {membership?.multiClubAccess && (
              <View className="flex-row items-center bg-emerald-50 px-2.5 py-1 rounded-full">
                <Icon
                  name="check-circle"
                  size={12}
                  color="#059669"
                />
                <Text className="text-emerald-700 text-[10px] font-semibold ml-1">
                  Multi-club access
                </Text>
              </View>
            )}
          </View>

          {/* Expiry Warning */}
          {daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
            <View
              className="mt-4 bg-amber-50 rounded-2xl p-4"
              style={{ borderWidth: 1, borderColor: '#fde68a' }}>
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-amber-100 rounded-xl justify-center items-center mr-3">
                  <Icon
                    name="alert-circle"
                    size={20}
                    color="#f59e0b"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-amber-800 text-sm font-bold">
                    Expiring Soon
                  </Text>
                  <Text className="text-amber-600 text-xs mt-0.5">
                    Renew now to continue enjoying benefits
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleRenew}
                activeOpacity={0.8}
                className="mt-3">
                <LinearGradient
                  colors={['#f59e0b', '#d97706']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 10,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}>
                  <Icon name="refresh" size={14} color="#fff" />
                  <Text className="text-white font-bold text-xs ml-1.5">
                    Renew Membership
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Expired Warning */}
          {daysUntilExpiry <= 0 && endDate && (
            <View
              className="mt-4 bg-red-50 rounded-2xl p-4"
              style={{ borderWidth: 1, borderColor: '#fca5a5' }}>
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-red-100 rounded-xl justify-center items-center mr-3">
                  <Icon
                    name="alert-octagon"
                    size={20}
                    color="#ef4444"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-red-800 text-sm font-bold">
                    Membership Expired
                  </Text>
                  <Text className="text-red-600 text-xs mt-0.5">
                    Please renew to regain access
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleRenew}
                activeOpacity={0.8}
                className="mt-3">
                <LinearGradient
                  colors={['#ef4444', '#dc2626']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 10,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}>
                  <Icon name="refresh" size={14} color="#fff" />
                  <Text className="text-white font-bold text-xs ml-1.5">
                    Renew Now
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* ═══════════════════════════════════════════════ */}
      {/* ─── QUICK STATS ─── */}
      {/* ═══════════════════════════════════════════════ */}
      <View className="px-4 mt-5">
        <View className="flex-row" style={{ marginHorizontal: -4 }}>
          {[
            {
              label: 'Days Left',
              value:
                daysUntilExpiry > 0 ? daysUntilExpiry : 0,
              icon: 'clock-outline',
              color: '#059669',
              gradient: ['#059669', '#34d399'],
            },
            {
              label: 'Days Used',
              value: daysUsed,
              icon: 'check-circle-outline',
              color: '#3b82f6',
              gradient: ['#3b82f6', '#60a5fa'],
            },
            {
              label: 'Usage',
              value: `${Math.round(usageProgress)}%`,
              icon: 'chart-donut',
              color: '#f59e0b',
              gradient: ['#f59e0b', '#fbbf24'],
            },
          ].map(stat => (
            <View
              key={stat.label}
              style={{ flex: 1, padding: 4 }}>
              <View
                className="bg-white rounded-2xl p-4 items-center shadow-sm"
                style={{ elevation: 3 }}>
                <LinearGradient
                  colors={stat.gradient}
                  className="w-11 h-11 rounded-xl justify-center items-center mb-2"
                  style={{ borderRadius: 12 }}>
                  <Icon
                    name={stat.icon}
                    size={20}
                    color="#fff"
                  />
                </LinearGradient>
                <Text className="text-gray-900 font-bold text-2xl">
                  {stat.value}
                </Text>
                <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider mt-0.5">
                  {stat.label}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ═══════════════════════════════════════════════ */}
      {/* ─── PLAN BENEFITS ─── */}
      {/* ═══════════════════════════════════════════════ */}
      {currentPlan && (
        <View className="px-4 mt-6">
          <SectionTitle
            title="Your Plan Benefits"
            icon="shield-check"
            iconColor="#059669"
          />
          <View
            className="bg-white rounded-2xl p-5 shadow-sm"
            style={{ elevation: 3 }}>
            {/* Features */}
            <View className="mb-4">
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Included Features
              </Text>
              {(currentPlan.features || []).map(
                (feature, index) => (
                  <View
                    key={index}
                    className="flex-row items-center py-2.5"
                    style={
                      index <
                        (currentPlan.features || []).length -
                        1
                        ? {
                          borderBottomWidth: 1,
                          borderBottomColor: '#f9fafb',
                        }
                        : {}
                    }>
                    <View className="w-6 h-6 bg-emerald-100 rounded-full justify-center items-center">
                      <Icon
                        name="check"
                        size={14}
                        color="#059669"
                      />
                    </View>
                    <Text className="text-gray-700 text-sm ml-3 flex-1">
                      {feature}
                    </Text>
                  </View>
                ),
              )}
            </View>

            {/* Sports */}
            {currentPlan.sports &&
              currentPlan.sports.length > 0 && (
                <View>
                  <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                    Accessible Sports
                  </Text>
                  <View className="flex-row flex-wrap">
                    {currentPlan.sports.map((sport, idx) => (
                      <View
                        key={idx}
                        className="bg-emerald-50 rounded-full px-3 py-1.5 mr-2 mb-2 flex-row items-center"
                        style={{
                          borderWidth: 1,
                          borderColor: '#d1fae5',
                        }}>
                        <Icon
                          name="check-circle"
                          size={12}
                          color="#059669"
                        />
                        <Text className="text-emerald-700 text-xs font-semibold ml-1">
                          {sport}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
          </View>
        </View>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* ─── AVAILABLE PLANS ─── */}
      {plans.length > 0 && (
        <View className="px-4 mt-6">
          <SectionTitle
            title="Available Plans"
            icon="card-membership"
            iconColor="#8b5cf6"
          />
          <Text className="text-gray-500 text-sm mb-4">
            Upgrade or switch to a different plan as per your needs.
          </Text>

          {plans.map(plan => {
            const planType = getPlanType(plan);
            const isCurrentPlan = planType === 'current';
            const buttonConfig = getButtonConfig(planType);

            const getBorderColor = () => {
              if (isCurrentPlan) return '#059669';
              if (planType === 'upgrade') return '#3b82f6';
              if (plan.popular) return '#8b5cf6';
              return '#f3f4f6';
            };

            const getHeaderGradient = () => {
              if (isCurrentPlan) return ['#059669', '#10b981'];
              if (planType === 'upgrade')
                return ['#2563eb', '#3b82f6'];
              if (plan.popular) return ['#7c3aed', '#8b5cf6'];
              return ['#6b7280', '#9ca3af'];
            };

            return (
              <View
                key={plan._id}
                className="bg-white rounded-2xl mb-4 overflow-hidden"
                style={{
                  elevation: 3,
                  borderWidth: 2,
                  borderColor: getBorderColor(),
                }}>
                {/* Plan Header Gradient Bar */}
                <LinearGradient
                  colors={getHeaderGradient()}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="px-5 py-3.5 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-9 h-9 bg-white/20 rounded-xl justify-center items-center">
                      <Icon
                        name={
                          isCurrentPlan
                            ? 'crown'
                            : planType === 'upgrade'
                              ? 'arrow-up-bold'
                              : 'star-four-points'
                        }
                        size={18}
                        color="#fff"
                      />
                    </View>
                    <Text className="text-white font-bold text-base ml-2.5">
                      {plan.name}
                    </Text>
                  </View>
                  {isCurrentPlan && (
                    <View className="bg-white/20 px-3 py-1 rounded-full flex-row items-center">
                      <View className="w-1.5 h-1.5 rounded-full bg-white mr-1.5" />
                      <Text className="text-white text-[10px] font-bold">
                        CURRENT
                      </Text>
                    </View>
                  )}
                  {!isCurrentPlan && plan.popular && (
                    <View className="bg-white/20 px-3 py-1 rounded-full">
                      <Text className="text-white text-[10px] font-bold">
                        POPULAR
                      </Text>
                    </View>
                  )}
                </LinearGradient>

                <View className="p-5">
                  {/* Price */}
                  <View className="items-center mb-4">
                    <Text className="text-gray-900 font-bold text-4xl">
                      ₹{plan.price}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1">
                      per{' '}
                      {plan.duration === 1
                        ? 'month'
                        : `${plan.duration} months`}
                    </Text>
                    {planType === 'upgrade' &&
                      currentPlan?.price != null && (
                        <View
                          className="bg-blue-50 px-3 py-1 rounded-full mt-2 flex-row items-center"
                          style={{
                            borderWidth: 1,
                            borderColor: '#dbeafe',
                          }}>
                          <Icon
                            name="trending-up"
                            size={12}
                            color="#2563eb"
                          />
                          <Text className="text-blue-600 text-[10px] font-bold ml-1">
                            +₹
                            {plan.price -
                              currentPlan.price}{' '}
                            more
                          </Text>
                        </View>
                      )}
                    {planType === 'downgrade' &&
                      currentPlan?.price != null && (
                        <View
                          className="bg-orange-50 px-3 py-1 rounded-full mt-2 flex-row items-center"
                          style={{
                            borderWidth: 1,
                            borderColor: '#fed7aa',
                          }}>
                          <Icon
                            name="trending-down"
                            size={12}
                            color="#ea580c"
                          />
                          <Text className="text-orange-600 text-[10px] font-bold ml-1">
                            ₹
                            {currentPlan.price -
                              plan.price}{' '}
                            less
                          </Text>
                        </View>
                      )}
                  </View>

                  {/* Features */}
                  <View className="mb-4">
                    {(plan.features || []).map(
                      (feature, index) => (
                        <View
                          key={index}
                          className="flex-row items-center py-1.5"
                          style={
                            index <
                              (plan.features || [])
                                .length -
                              1
                              ? {
                                borderBottomWidth: 1,
                                borderBottomColor:
                                  '#f9fafb',
                              }
                              : {}
                          }>
                          <Icon
                            name="check-circle"
                            size={16}
                            color="#059669"
                            style={{ marginTop: 1 }}
                          />
                          <Text className="text-gray-600 text-sm ml-2 flex-1">
                            {feature}
                          </Text>
                        </View>
                      ),
                    )}
                  </View>

                  {/* Multi-club badge */}
                  {plan.multiClubAccess && (
                    <View className="flex-row items-center mb-4 pt-3 border-t border-gray-100">
                      <View
                        className="w-8 h-8 rounded-lg justify-center items-center mr-2"
                        style={{
                          backgroundColor: '#3b82f615',
                        }}>
                        <Icon
                          name="office-building-marker"
                          size={16}
                          color="#3b82f6"
                        />
                      </View>
                      <Text className="text-blue-600 text-sm font-semibold">
                        Multi-club access included
                      </Text>
                    </View>
                  )}

                  {/* Action Button */}
                  <TouchableOpacity
                    onPress={() => handlePlanAction(plan)}
                    disabled={
                      buttonConfig.disabled ||
                      changingPlan
                    }
                    activeOpacity={0.8}>
                    <LinearGradient
                      colors={buttonConfig.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        borderRadius: 14,
                        paddingVertical: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {changingPlan &&
                        !buttonConfig.disabled ? (
                        <ActivityIndicator
                          size="small"
                          color="#fff"
                        />
                      ) : (
                        <>
                          <Icon
                            name={
                              buttonConfig.iconName
                            }
                            size={18}
                            color={
                              buttonConfig.textColor
                            }
                          />
                          <Text
                            className="font-bold text-sm ml-2"
                            style={{
                              color: buttonConfig.textColor,
                            }}>
                            {buttonConfig.label}
                          </Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Bottom Spacing */}
      <View className="h-8" />

      {/* ═══════════════════════════════════════════════ */}
      {/* ─── CONFIRM PLAN CHANGE MODAL ─── */}
      {/* ═══════════════════════════════════════════════ */}
      <Modal
        visible={confirmModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          !changingPlan &&
          setConfirmModal({ visible: false, plan: null, type: '' })
        }>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center">
                <View
                  className="w-8 h-8 rounded-lg justify-center items-center mr-2.5"
                  style={{
                    backgroundColor:
                      confirmModal.type === 'upgrade'
                        ? '#05966915'
                        : '#3b82f615',
                  }}>
                  <Icon
                    name={
                      confirmModal.type === 'upgrade'
                        ? 'arrow-up-circle'
                        : confirmModal.type ===
                          'downgrade'
                          ? 'arrow-down-circle'
                          : 'swap-horizontal-circle'
                    }
                    size={18}
                    color={
                      confirmModal.type === 'upgrade'
                        ? '#059669'
                        : '#3b82f6'
                    }
                  />
                </View>
                <Text className="text-gray-900 font-bold text-xl">
                  {confirmModal.type === 'upgrade'
                    ? 'Confirm Upgrade'
                    : confirmModal.type === 'downgrade'
                      ? 'Confirm Plan Change'
                      : 'Confirm Plan Switch'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  !changingPlan &&
                  setConfirmModal({
                    visible: false,
                    plan: null,
                    type: '',
                  })
                }>
                <View className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center">
                  <Icon
                    name="close"
                    size={18}
                    color="#6b7280"
                  />
                </View>
              </TouchableOpacity>
            </View>
            <Text className="text-gray-500 text-sm mb-5">
              Review the plan change details below before
              confirming.
            </Text>

            {/* Plan Comparison Card */}
            <View
              className="bg-gray-50 rounded-2xl p-5 mb-4"
              style={{
                borderWidth: 1,
                borderColor: '#f3f4f6',
              }}>
              {/* From Plan */}
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-gray-200 rounded-xl justify-center items-center mr-3">
                  <Icon
                    name="card-account-details"
                    size={20}
                    color="#6b7280"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">
                    From
                  </Text>
                  <Text className="text-gray-900 font-bold text-base">
                    {currentPlan?.name || 'N/A'}
                  </Text>
                </View>
                <Text className="text-gray-700 font-bold text-lg">
                  ₹{currentPlan?.price || 0}
                </Text>
              </View>

              {/* Arrow */}
              <View className="items-center py-1">
                <View
                  className="w-8 h-8 rounded-full justify-center items-center"
                  style={{
                    backgroundColor:
                      confirmModal.type === 'upgrade'
                        ? '#05966915'
                        : '#3b82f615',
                  }}>
                  <Icon
                    name="arrow-down"
                    size={18}
                    color={
                      confirmModal.type === 'upgrade'
                        ? '#059669'
                        : '#3b82f6'
                    }
                  />
                </View>
              </View>

              {/* To Plan */}
              <View className="flex-row items-center mt-3">
                <LinearGradient
                  colors={
                    confirmModal.type === 'upgrade'
                      ? ['#059669', '#10b981']
                      : ['#3b82f6', '#60a5fa']
                  }
                  className="w-10 h-10 rounded-xl justify-center items-center mr-3"
                  style={{ borderRadius: 12 }}>
                  <Icon
                    name="card-account-details-star"
                    size={20}
                    color="#fff"
                  />
                </LinearGradient>
                <View className="flex-1">
                  <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">
                    To
                  </Text>
                  <Text
                    className="font-bold text-base"
                    style={{
                      color:
                        confirmModal.type === 'upgrade'
                          ? '#059669'
                          : '#3b82f6',
                    }}>
                    {confirmModal.plan?.name || 'N/A'}
                  </Text>
                </View>
                <Text
                  className="font-bold text-lg"
                  style={{
                    color:
                      confirmModal.type === 'upgrade'
                        ? '#059669'
                        : '#3b82f6',
                  }}>
                  ₹{confirmModal.plan?.price || 0}
                </Text>
              </View>

              {/* Price Difference */}
              {confirmModal.plan && currentPlan && (
                <View className="mt-4 pt-4 border-t border-gray-200">
                  <View
                    className="flex-row items-center justify-between bg-white rounded-xl p-3"
                    style={{ elevation: 1 }}>
                    <View className="flex-row items-center">
                      <Icon
                        name="cash-multiple"
                        size={18}
                        color="#6b7280"
                      />
                      <Text className="text-gray-500 text-sm ml-2">
                        Price Difference
                      </Text>
                    </View>
                    <Text
                      className={`font-bold text-lg ${confirmModal.type === 'upgrade'
                          ? 'text-blue-600'
                          : 'text-orange-600'
                        }`}>
                      {confirmModal.type === 'upgrade'
                        ? '+'
                        : '-'}
                      ₹
                      {Math.abs(
                        confirmModal.plan.price -
                        (currentPlan.price || 0),
                      )}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Description */}
            <Text className="text-gray-500 text-sm mb-6 leading-5">
              {confirmModal.type === 'upgrade'
                ? 'A payment will be created for the new plan. You will get access to all upgraded features immediately.'
                : confirmModal.type === 'downgrade'
                  ? 'This is a lower-priced plan. The change will take effect after payment processing.'
                  : 'The change will take effect after payment processing.'}
            </Text>

            {/* Buttons */}
            <View className="flex-row" style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={() =>
                  setConfirmModal({
                    visible: false,
                    plan: null,
                    type: '',
                  })
                }
                disabled={changingPlan}
                className="flex-1"
                style={{
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: '#e5e7eb',
                  paddingVertical: 14,
                  alignItems: 'center',
                }}>
                <Text className="text-gray-700 font-bold">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmPlanChange}
                disabled={changingPlan}
                activeOpacity={0.8}
                className="flex-1">
                <LinearGradient
                  colors={
                    confirmModal.type === 'upgrade'
                      ? ['#059669', '#10b981']
                      : ['#3b82f6', '#60a5fa']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 14,
                    paddingVertical: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {changingPlan && (
                    <ActivityIndicator
                      size="small"
                      color="#fff"
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text className="text-white font-bold">
                    {changingPlan
                      ? 'Processing...'
                      : confirmModal.type === 'upgrade'
                        ? 'Confirm Upgrade'
                        : 'Confirm Change'}
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

export default MembershipScreen;