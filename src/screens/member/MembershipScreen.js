import React, {useState, useEffect, useCallback} from 'react';
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
import SectionHeader from '../../components/SectionHeader';
import {MOCK_MEMBERSHIP, MOCK_PLANS} from '../../data/membership';

const MembershipScreen = ({navigation}) => {
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
      // Simulate API delay
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

  // Calculate days until expiry
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

  // Determine plan relationship to current plan
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
    setConfirmModal({visible: true, plan, type: planType});
  };

  const confirmPlanChange = async () => {
    const {plan, type} = confirmModal;
    if (!plan) {
      return;
    }

    try {
      setChangingPlan(true);
      // Simulate API call
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
            setConfirmModal({visible: false, plan: null, type: ''});
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
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Renew',
          onPress: () => {
            Alert.alert('Success', 'Membership renewal initiated!');
          },
        },
      ],
    );
  };

  // Get button styling based on plan type
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

  // Get badge config for plan cards
  const getBadgeConfig = planType => {
    switch (planType) {
      case 'current':
        return {bg: 'bg-emerald-500', text: 'Current Plan', show: true};
      case 'upgrade':
        return {bg: 'bg-blue-500', text: 'Upgrade', show: true};
      case 'downgrade':
        return {bg: 'bg-gray-400', text: 'Switch Available', show: true};
      default:
        return {bg: '', text: '', show: false};
    }
  };

  // ─── Loading State ───
  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="text-gray-500 mt-3">Loading membership...</Text>
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
              <Text className="text-white font-bold text-2xl">Membership</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleRenew}
            className="bg-white/20 rounded-xl px-4 py-2 flex-row items-center">
            <Icon name="refresh" size={18} color="#fff" />
            <Text className="text-white font-semibold text-sm ml-1">
              Renew
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Plan Badge */}
        <View className="bg-white/20 rounded-xl p-4 flex-row items-center">
          <View className="w-14 h-14 bg-yellow-400/30 rounded-full justify-center items-center">
            <Icon name="star" size={28} color="#fbbf24" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-white/70 text-xs">Current Plan</Text>
            <Text className="text-white font-bold text-xl">
              {currentPlan?.name || 'N/A'}
            </Text>
            <Text className="text-white/70 text-sm">
              ₹{currentPlan?.price || 0}/
              {currentPlan?.duration === 1
                ? 'month'
                : `${currentPlan?.duration || 0} months`}
            </Text>
          </View>
          <View className="bg-emerald-400 px-3 py-1.5 rounded-full">
            <Text className="text-white font-bold text-xs">
              {membership?.status === 'active' ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* ─── Membership Period Card ─── */}
      <View className="px-4 -mt-4">
        <View
          className="bg-white rounded-2xl p-5 border-2 border-emerald-500"
          style={{elevation: 6}}>
          {/* Date Info */}
          <View className="flex-row justify-between mb-4">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-emerald-100 rounded-full justify-center items-center">
                <Icon name="calendar-start" size={20} color="#059669" />
              </View>
              <View className="ml-2">
                <Text className="text-gray-400 text-xs">Start Date</Text>
                <Text className="text-gray-900 font-semibold text-sm">
                  {startDate
                    ? startDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-orange-100 rounded-full justify-center items-center">
                <Icon name="calendar-end" size={20} color="#f97316" />
              </View>
              <View className="ml-2">
                <Text className="text-gray-400 text-xs">Expires On</Text>
                <Text className="text-gray-900 font-semibold text-sm">
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
          </View>

          {/* Progress Bar */}
          {endDate && (
            <View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-500 text-xs font-medium">
                  Membership Period
                </Text>
                <Text className="text-gray-500 text-xs">
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

          {/* Branch & Multi-club */}
          <View className="flex-row items-center justify-between mt-2">
            {membership?.branch && (
              <View className="flex-row items-center">
                <Icon name="office-building" size={16} color="#6b7280" />
                <Text className="text-gray-500 text-xs ml-1">
                  {membership.branch.name}
                </Text>
              </View>
            )}
            {membership?.multiClubAccess && (
              <View className="flex-row items-center">
                <Icon name="check-circle" size={16} color="#059669" />
                <Text className="text-emerald-600 text-xs ml-1 font-medium">
                  Multi-club access
                </Text>
              </View>
            )}
          </View>

          {/* Expiry Warning */}
          {daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
            <View className="mt-4 bg-amber-50 rounded-xl p-3 border border-amber-200">
              <View className="flex-row items-center">
                <Icon name="alert-circle" size={20} color="#f59e0b" />
                <Text className="text-amber-800 text-sm font-medium ml-2 flex-1">
                  Your membership expires soon! Renew now to continue.
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleRenew}
                activeOpacity={0.8}
                className="mt-2">
                <LinearGradient
                  colors={['#f59e0b', '#d97706']}
                  className="rounded-xl py-2.5 items-center">
                  <Text className="text-white font-bold text-sm">
                    Renew Membership
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Expired Warning */}
          {daysUntilExpiry <= 0 && endDate && (
            <View className="mt-4 bg-red-50 rounded-xl p-3 border border-red-200">
              <View className="flex-row items-center">
                <Icon name="alert-octagon" size={20} color="#ef4444" />
                <Text className="text-red-800 text-sm font-medium ml-2 flex-1">
                  Your membership has expired. Please renew to regain access.
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleRenew}
                activeOpacity={0.8}
                className="mt-2">
                <LinearGradient
                  colors={['#ef4444', '#dc2626']}
                  className="rounded-xl py-2.5 items-center">
                  <Text className="text-white font-bold text-sm">
                    Renew Now
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* ─── Plan Benefits ─── */}
      {currentPlan && (
        <View className="mt-4">
          <SectionHeader
            title="Your Plan Benefits"
            icon="shield-check"
            showSeeAll={false}
          />
          <View className="px-4">
            <View
              className="bg-white rounded-2xl p-4"
              style={{elevation: 3}}>
              {/* Features */}
              <View className="mb-4">
                <Text className="text-gray-900 font-bold text-base mb-3">
                  Included Features
                </Text>
                {(currentPlan.features || []).map((feature, index) => (
                  <View
                    key={index}
                    className="flex-row items-start mb-2.5">
                    <View className="w-6 h-6 bg-emerald-100 rounded-full justify-center items-center mt-0.5">
                      <Icon name="check" size={14} color="#059669" />
                    </View>
                    <Text className="text-gray-700 text-sm ml-3 flex-1">
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Sports */}
              {currentPlan.sports && currentPlan.sports.length > 0 && (
                <View>
                  <Text className="text-gray-900 font-bold text-base mb-3">
                    Accessible Sports
                  </Text>
                  <View className="flex-row flex-wrap">
                    {currentPlan.sports.map((sport, idx) => (
                      <View
                        key={idx}
                        className="bg-emerald-100 px-3 py-1.5 rounded-full mr-2 mb-2">
                        <Text className="text-emerald-700 text-xs font-semibold">
                          {sport}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* ─── Available Plans ─── */}
      {plans.length > 0 && (
        <View className="mt-4">
          <SectionHeader
            title="Available Plans"
            icon="card-membership"
            showSeeAll={false}
          />
          <View className="px-4">
            <Text className="text-gray-500 text-sm mb-4">
              Upgrade or switch to a different plan as per your needs.
            </Text>

            {plans.map(plan => {
              const planType = getPlanType(plan);
              const isCurrentPlan = planType === 'current';
              const buttonConfig = getButtonConfig(planType);
              const badgeConfig = getBadgeConfig(planType);

              return (
                <View
                  key={plan._id}
                  className={`bg-white rounded-2xl mb-4 overflow-hidden ${
                    isCurrentPlan
                      ? 'border-2 border-emerald-500'
                      : planType === 'upgrade'
                        ? 'border-2 border-blue-500'
                        : plan.popular && !isCurrentPlan
                          ? 'border-2 border-blue-500'
                          : 'border border-gray-200'
                  }`}
                  style={{elevation: 3}}>
                  {/* Badge */}
                  {badgeConfig.show && (
                    <View className={`${badgeConfig.bg} py-1.5 items-center`}>
                      <Text className="text-white text-xs font-bold">
                        {badgeConfig.text}
                      </Text>
                    </View>
                  )}
                  {plan.popular &&
                    !isCurrentPlan &&
                    planType !== 'upgrade' &&
                    planType !== 'downgrade' && (
                      <View className="bg-blue-500 py-1.5 items-center">
                        <Text className="text-white text-xs font-bold">
                          Most Popular
                        </Text>
                      </View>
                    )}

                  <View className="p-5">
                    {/* Plan Name & Price */}
                    <View className="items-center mb-4">
                      <View className="bg-emerald-500 px-5 py-2 rounded-full mb-3">
                        <Text className="text-white font-bold text-base">
                          {plan.name}
                        </Text>
                      </View>
                      <Text className="text-gray-900 font-bold text-4xl">
                        ₹{plan.price}
                      </Text>
                      <Text className="text-gray-500 text-sm mt-1">
                        per{' '}
                        {plan.duration === 1
                          ? 'month'
                          : `${plan.duration} months`}
                      </Text>
                      {planType === 'upgrade' && currentPlan?.price != null && (
                        <Text className="text-blue-600 text-xs mt-1">
                          +₹{plan.price - currentPlan.price} more than current
                        </Text>
                      )}
                      {planType === 'downgrade' &&
                        currentPlan?.price != null && (
                          <Text className="text-orange-600 text-xs mt-1">
                            ₹{currentPlan.price - plan.price} less than current
                          </Text>
                        )}
                    </View>

                    {/* Features */}
                    <View className="mb-4">
                      {(plan.features || []).map((feature, index) => (
                        <View
                          key={index}
                          className="flex-row items-start mb-2">
                          <Icon
                            name="check-circle"
                            size={18}
                            color="#059669"
                            style={{marginTop: 1}}
                          />
                          <Text className="text-gray-700 text-sm ml-2 flex-1">
                            {feature}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Multi-club badge */}
                    {plan.multiClubAccess && (
                      <View className="flex-row items-center mb-4 pt-3 border-t border-gray-100">
                        <Icon
                          name="office-building-marker"
                          size={18}
                          color="#3b82f6"
                        />
                        <Text className="text-blue-600 text-sm font-medium ml-2">
                          Multi-club access included
                        </Text>
                      </View>
                    )}

                    {/* Action Button */}
                    <TouchableOpacity
                      onPress={() => handlePlanAction(plan)}
                      disabled={buttonConfig.disabled || changingPlan}
                      activeOpacity={0.8}>
                      <LinearGradient
                        colors={buttonConfig.colors}
                        className="rounded-xl py-3.5 flex-row items-center justify-center">
                        {changingPlan && !buttonConfig.disabled ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Icon
                              name={buttonConfig.iconName}
                              size={20}
                              color={buttonConfig.textColor}
                            />
                            <Text
                              className="font-bold text-base ml-2"
                              style={{color: buttonConfig.textColor}}>
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
          setConfirmModal({visible: false, plan: null, type: ''})
        }>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center">
                <Icon
                  name={
                    confirmModal.type === 'upgrade'
                      ? 'arrow-up-circle'
                      : confirmModal.type === 'downgrade'
                        ? 'arrow-down-circle'
                        : 'swap-horizontal-circle'
                  }
                  size={24}
                  color={
                    confirmModal.type === 'upgrade' ? '#059669' : '#3b82f6'
                  }
                />
                <Text className="text-gray-900 font-bold text-xl ml-2">
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
                  setConfirmModal({visible: false, plan: null, type: ''})
                }>
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Plan Comparison */}
            <View className="bg-gray-50 rounded-xl p-4 my-4">
              {/* From Plan */}
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <Text className="text-gray-400 text-xs">From</Text>
                  <Text className="text-gray-900 font-bold text-lg">
                    {currentPlan?.name || 'N/A'}
                  </Text>
                </View>
                <Text className="text-gray-700 font-bold text-lg">
                  ₹{currentPlan?.price || 0}
                </Text>
              </View>

              {/* Arrow */}
              <View className="items-center my-1">
                <Icon
                  name="arrow-down"
                  size={24}
                  color={
                    confirmModal.type === 'upgrade' ? '#059669' : '#6b7280'
                  }
                />
              </View>

              {/* To Plan */}
              <View className="flex-row items-center justify-between mt-3">
                <View>
                  <Text className="text-gray-400 text-xs">To</Text>
                  <Text className="text-emerald-700 font-bold text-lg">
                    {confirmModal.plan?.name || 'N/A'}
                  </Text>
                </View>
                <Text className="text-emerald-700 font-bold text-lg">
                  ₹{confirmModal.plan?.price || 0}
                </Text>
              </View>

              {/* Price Difference */}
              {confirmModal.plan && currentPlan && (
                <View className="mt-3 pt-3 border-t border-gray-200">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-500 text-sm">Difference</Text>
                    <Text
                      className={`font-bold text-base ${
                        confirmModal.type === 'upgrade'
                          ? 'text-blue-600'
                          : 'text-orange-600'
                      }`}>
                      {confirmModal.type === 'upgrade' ? '+' : '-'}₹
                      {Math.abs(
                        confirmModal.plan.price - (currentPlan.price || 0),
                      )}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Description */}
            <Text className="text-gray-500 text-sm mb-6">
              {confirmModal.type === 'upgrade'
                ? 'A payment will be created for the new plan. You will get access to all upgraded features immediately.'
                : confirmModal.type === 'downgrade'
                  ? 'This is a lower-priced plan. The change will take effect after payment processing.'
                  : 'The change will take effect after payment processing.'}
            </Text>

            {/* Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() =>
                  setConfirmModal({visible: false, plan: null, type: ''})
                }
                disabled={changingPlan}
                className="flex-1 border border-gray-300 rounded-xl py-4 items-center">
                <Text className="text-gray-700 font-semibold">Cancel</Text>
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
                  className="rounded-xl py-4 items-center flex-row justify-center">
                  {changingPlan && (
                    <ActivityIndicator
                      size="small"
                      color="#fff"
                      style={{marginRight: 8}}
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