import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DrawerMenuButton from '../../components/DrawerMenuButton';
import { sessions as initialSessions, SESSION_TYPES, generateSessionId } from '../../data/sessions';

const STATUS_FILTERS = ['all', 'scheduled', 'completed', 'cancelled'];

const getStatusStyle = status => {
  switch (status) {
    case 'scheduled':
      return { bg: '#dbeafe', text: '#1e40af', label: 'Scheduled' };
    case 'completed':
      return { bg: '#dcfce7', text: '#166534', label: 'Completed' };
    case 'cancelled':
      return { bg: '#fee2e2', text: '#991b1b', label: 'Cancelled' };
    case 'in_progress':
      return { bg: '#fef3c7', text: '#92400e', label: 'In Progress' };
    default:
      return { bg: '#f3f4f6', text: '#374151', label: status || 'Unknown' };
  }
};

const getTypeLabel = type => {
  const found = SESSION_TYPES.find(t => t.value === type);
  return found ? found.label : type || 'Session';
};

const formatDate = dateStr => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime12 = time24 => {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
};

const SessionsScreen = ({ navigation, route }) => {
  const [sessionsData, setSessionsData] = useState(initialSessions);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const markAttendanceMode = route?.params?.markAttendance;

  const filteredSessions = sessionsData.filter(session => {
    if (filter === 'all') return true;
    return session.status === filter;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  const handleDeleteSession = session => {
    Alert.alert(
      'Delete Session',
      `Are you sure you want to delete "${session.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSessionsData(prev => prev.filter(s => s.id !== session.id));
          },
        },
      ],
    );
  };

  const handleCreateSession = newSession => {
    const sessionWithId = {
      ...newSession,
      id: generateSessionId(),
      coachId: 'c1',
      coachName: 'Coach Williams',
      bookedSlots: 0,
      maxSlots: newSession.maxParticipants || 1,
      enrolled: 0,
      performanceRating: null,
      coachFeedback: '',
      memberFeedback: '',
      caloriesBurned: 0,
    };
    setSessionsData(prev => [sessionWithId, ...prev]);
  };

  const handleUpdateSession = (sessionId, updatedData) => {
    setSessionsData(prev =>
      prev.map(s =>
        s.id === sessionId
          ? {
            ...s,
            ...updatedData,
            maxSlots: updatedData.maxParticipants || s.maxSlots,
          }
          : s,
      ),
    );
  };

  const navigateToCreate = () => {
    navigation.navigate('CreateEditSession', {
      mode: 'create',
      onSave: handleCreateSession,
    });
  };

  const navigateToEdit = session => {
    navigation.navigate('CreateEditSession', {
      mode: 'edit',
      session,
      onSave: data => handleUpdateSession(session.id, data),
    });
  };

  const renderSessionCard = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    const dateObj = item.date ? new Date(item.date) : null;

    return (
      <View
        className="bg-white rounded-2xl mx-4 mb-4 shadow-md"
        style={{ elevation: 3 }}>
        {/* Card Header */}
        <View className="p-4 pb-3">
          <View className="flex-row items-start">
            {/* Date Badge */}
            <View className="w-14 h-14 rounded-xl bg-blue-50 justify-center items-center mr-3">
              <Text className="text-blue-700 font-bold text-base">
                {dateObj ? dateObj.getDate() : '--'}
              </Text>
              <Text className="text-blue-500 text-[10px]">
                {dateObj
                  ? dateObj.toLocaleDateString('en-IN', { month: 'short' })
                  : ''}
              </Text>
            </View>

            {/* Title & Info */}
            <View className="flex-1">
              <Text
                className="text-gray-900 font-bold text-base"
                numberOfLines={1}>
                {item.title || item.sport || 'Untitled Session'}
              </Text>
              <View className="flex-row flex-wrap items-center mt-1 gap-1">
                {/* Type Badge */}
                <View className="bg-gray-100 px-2 py-0.5 rounded-full">
                  <Text className="text-gray-600 text-[10px] font-semibold">
                    {getTypeLabel(item.type)}
                  </Text>
                </View>
                {/* Sport Badge */}
                {item.sport ? (
                  <View className="bg-blue-100 px-2 py-0.5 rounded-full">
                    <Text className="text-blue-700 text-[10px] font-semibold">
                      {item.sport}
                    </Text>
                  </View>
                ) : null}
                {/* Status Badge */}
                <View
                  className="px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: statusStyle.bg }}>
                  <Text
                    className="text-[10px] font-semibold capitalize"
                    style={{ color: statusStyle.text }}>
                    {statusStyle.label}
                  </Text>
                </View>
                {/* Training Plan Badge */}
                {item.trainingPlanId ? (
                  <View className="bg-purple-100 px-2 py-0.5 rounded-full flex-row items-center">
                    <Icon name="file-document-outline" size={10} color="#7c3aed" />
                    <Text className="text-purple-700 text-[10px] font-semibold ml-0.5">
                      Plan Linked
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* Description */}
          {item.description ? (
            <Text
              className="text-gray-400 text-xs mt-2"
              numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </View>

        {/* Session Details */}
        <View className="px-4 pb-3">
          <View className="flex-row flex-wrap">
            {/* Time */}
            <View className="flex-row items-center mr-4 mb-2">
              <Icon name="clock-outline" size={14} color="#6b7280" />
              <Text className="text-gray-500 text-xs ml-1">
                {formatTime12(item.startTime)} - {formatTime12(item.endTime)}
              </Text>
            </View>
            {/* Location */}
            <View className="flex-row items-center mr-4 mb-2">
              <Icon name="map-marker-outline" size={14} color="#6b7280" />
              <Text className="text-gray-500 text-xs ml-1">
                {item.facilityName || item.location || 'Not specified'}
              </Text>
            </View>
            {/* Participants */}
            <View className="flex-row items-center mr-4 mb-2">
              <Icon name="account-group-outline" size={14} color="#6b7280" />
              <Text className="text-gray-500 text-xs ml-1">
                {item.enrolled ?? item.bookedSlots ?? 0}/
                {item.maxParticipants ?? item.maxSlots}
              </Text>
            </View>
            {/* Rating */}
            {item.performanceRating ? (
              <View className="flex-row items-center mr-4 mb-2">
                <Icon name="star" size={14} color="#f59e0b" />
                <Text className="text-gray-500 text-xs ml-1">
                  {item.performanceRating}/10
                </Text>
              </View>
            ) : null}
            {/* Price */}
            {item.price > 0 ? (
              <View className="flex-row items-center mr-4 mb-2">
                <Icon name="currency-inr" size={14} color="#22c55e" />
                <Text className="text-green-600 text-xs font-semibold ml-0.5">
                  ₹{item.price}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Member Info */}
          {item.memberName ? (
            <View className="flex-row items-center mt-1 mb-1">
              <Icon name="account-outline" size={14} color="#6b7280" />
              <Text className="text-gray-500 text-xs ml-1">
                Member:{' '}
                <Text className="text-gray-700 font-semibold">
                  {item.memberName}
                </Text>
              </Text>
            </View>
          ) : null}
        </View>

        {/* Exercise Plan Preview */}
        {item.exercisePlan && item.exercisePlan.length > 0 ? (
          <View className="mx-4 mb-3 p-3 bg-gray-50 rounded-xl">
            <View className="flex-row items-center mb-1.5">
              <Icon name="dumbbell" size={14} color="#374151" />
              <Text className="text-gray-700 text-xs font-semibold ml-1">
                Exercise Plan ({item.exercisePlan.length} exercises)
              </Text>
            </View>
            {item.exercisePlan.slice(0, 3).map((ex, idx) => (
              <Text key={idx} className="text-gray-400 text-[11px] ml-5">
                • {ex.exercise} — {ex.sets}×{ex.reps}
                {ex.weight ? ` @ ${ex.weight}${ex.unit || 'kg'}` : ''}
              </Text>
            ))}
            {item.exercisePlan.length > 3 ? (
              <Text className="text-gray-400 text-[11px] ml-5">
                +{item.exercisePlan.length - 3} more...
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Feedback */}
        {item.coachFeedback || item.memberFeedback ? (
          <View className="mx-4 mb-3">
            {item.coachFeedback ? (
              <Text className="text-gray-500 text-xs" numberOfLines={1}>
                <Text className="font-semibold">Coach: </Text>
                {item.coachFeedback}
              </Text>
            ) : null}
            {item.memberFeedback ? (
              <Text className="text-gray-500 text-xs mt-0.5" numberOfLines={1}>
                <Text className="font-semibold">Member: </Text>
                {item.memberFeedback}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Calories */}
        {item.caloriesBurned > 0 ? (
          <View className="mx-4 mb-3 flex-row items-center">
            <Text className="text-orange-500 text-xs">
              🔥 {item.caloriesBurned} calories burned
            </Text>
          </View>
        ) : null}

        {/* Notes */}
        {item.notes ? (
          <View className="mx-4 mb-3">
            <Text className="text-gray-400 text-[11px] italic" numberOfLines={2}>
              📝 {item.notes}
            </Text>
          </View>
        ) : null}

        {/* Action Buttons */}
        <View className="flex-row border-t border-gray-100 px-4 py-3">
          {markAttendanceMode && item.status === 'scheduled' ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('Attendance', { session: item })}
              className="flex-1 bg-green-500 rounded-xl py-2.5 flex-row items-center justify-center">
              <Icon name="check-circle-outline" size={16} color="#fff" />
              <Text className="text-white font-semibold text-sm ml-1.5">
                Mark Attendance
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => navigateToEdit(item)}
                className="flex-1 flex-row items-center justify-center py-2.5 mr-2 border border-blue-200 rounded-xl bg-blue-50">
                <Icon name="pencil-outline" size={16} color="#2563eb" />
                <Text className="text-blue-600 font-semibold text-sm ml-1">
                  Edit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteSession(item)}
                className="flex-1 flex-row items-center justify-center py-2.5 border border-red-200 rounded-xl bg-red-50">
                <Icon name="trash-can-outline" size={16} color="#dc2626" />
                <Text className="text-red-600 font-semibold text-sm ml-1">
                  Delete
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6']}
        className="px-6 pt-12 pb-6">
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            <DrawerMenuButton />
            <View className="ml-2">
              <Text className="text-white font-bold text-2xl">Sessions</Text>
              <Text className="text-white/70 text-sm">
                Manage your training sessions
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={navigateToCreate}
            className="w-11 h-11 bg-white/20 rounded-full justify-center items-center">
            <Icon name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats Bar */}
        <View className="flex-row mt-3 bg-white/15 rounded-xl p-3">
          <View className="flex-1 items-center">
            <Text className="text-white font-bold text-lg">
              {sessionsData.length}
            </Text>
            <Text className="text-white/70 text-[10px]">Total</Text>
          </View>
          <View className="w-px bg-white/30" />
          <View className="flex-1 items-center">
            <Text className="text-white font-bold text-lg">
              {sessionsData.filter(s => s.status === 'scheduled').length}
            </Text>
            <Text className="text-white/70 text-[10px]">Scheduled</Text>
          </View>
          <View className="w-px bg-white/30" />
          <View className="flex-1 items-center">
            <Text className="text-white font-bold text-lg">
              {sessionsData.filter(s => s.status === 'completed').length}
            </Text>
            <Text className="text-white/70 text-[10px]">Completed</Text>
          </View>
          <View className="w-px bg-white/30" />
          <View className="flex-1 items-center">
            <Text className="text-white font-bold text-lg">
              {sessionsData.filter(s => s.status === 'cancelled').length}
            </Text>
            <Text className="text-white/70 text-[10px]">Cancelled</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View className="flex-row px-4 py-3 bg-white shadow-sm" style={{ elevation: 2 }}>
        {STATUS_FILTERS.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setFilter(tab)}
            className={`px-4 py-2 rounded-full mr-2 ${filter === tab ? 'bg-blue-600' : 'bg-gray-100'
              }`}>
            <Text
              className={`font-semibold capitalize text-sm ${filter === tab ? 'text-white' : 'text-gray-500'
                }`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sessions List */}
      <FlatList
        data={filteredSessions}
        renderItem={renderSessionCard}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1e3a8a']}
          />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20">
            <Icon name="calendar-blank-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-400 text-lg mt-4 font-semibold">
              No sessions found
            </Text>
            <Text className="text-gray-300 text-sm mt-1">
              Tap + to create your first session
            </Text>
          </View>
        }
      />

      {/* Floating Create Button */}
      <TouchableOpacity
        onPress={navigateToCreate}
        activeOpacity={0.8}
        className="absolute bottom-6 right-6"
        style={{ elevation: 6 }}>
        <LinearGradient
          colors={['#1e3a8a', '#3b82f6']}
          className="w-14 h-14 rounded-full justify-center items-center shadow-lg">
          <Icon name="plus" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default SessionsScreen;