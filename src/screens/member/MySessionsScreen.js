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

// ─── Mock Data ───
const MOCK_SESSIONS = [
  {
    _id: 'ms1',
    title: 'Karate - Advanced Sparring',
    description: 'Advanced sparring techniques and competition preparation',
    type: 'group_class',
    sport: 'Karate',
    sportId: { name: 'Karate' },
    date: '2026-03-30',
    startTime: '09:00',
    endTime: '10:00',
    location: 'Main Dojo',
    facilityName: 'Main Dojo',
    coachName: 'Sensei Mike Johnson',
    status: 'scheduled',
    memberResponse: '',
    attendanceStatus: '',
    price: 0,
    trainingPlanId: { title: 'Karate Advanced Sparring' },
    exercisePlan: [
      { exercise: 'Roundhouse Kick Drills', sets: 4, reps: 10, weight: 0, unit: 'kg' },
      { exercise: 'Sparring Combos', sets: 3, reps: 8, weight: 0, unit: 'kg' },
    ],
    coachFeedback: '',
    memberFeedback: '',
  },
  {
    _id: 'ms2',
    title: 'Swimming - Freestyle Technique',
    description: 'Breathing technique and freestyle stroke improvement',
    type: 'personal_training',
    sport: 'Swimming',
    sportId: { name: 'Swimming' },
    date: '2026-04-01',
    startTime: '07:00',
    endTime: '07:45',
    location: 'Pool Lane 2',
    facilityName: 'Pool Lane 2',
    coachName: 'Coach David Chen',
    status: 'scheduled',
    memberResponse: 'accepted',
    attendanceStatus: 'attending',
    price: 0,
    trainingPlanId: null,
    exercisePlan: [
      { exercise: 'Freestyle Laps', sets: 4, reps: 2, weight: 0, unit: 'kg' },
      { exercise: 'Breathing Drills', sets: 3, reps: 4, weight: 0, unit: 'kg' },
    ],
    coachFeedback: '',
    memberFeedback: '',
  },
  {
    _id: 'ms3',
    title: 'Boxing - Intensive Sparring',
    description: 'Full contact sparring session with technique review',
    type: 'personal_training',
    sport: 'Boxing',
    sportId: { name: 'Boxing' },
    date: '2026-03-14',
    startTime: '18:00',
    endTime: '19:00',
    location: 'Ring B',
    facilityName: 'Ring B',
    coachName: 'Coach Alex Rivera',
    status: 'completed',
    memberResponse: 'accepted',
    attendanceStatus: 'attending',
    price: 0,
    trainingPlanId: { title: 'Boxing Competition Prep' },
    exercisePlan: [
      { exercise: 'Jab-Cross Combo', sets: 5, reps: 20, weight: 0, unit: 'kg' },
      { exercise: 'Heavy Bag Rounds', sets: 6, reps: 1, weight: 0, unit: 'kg' },
      { exercise: 'Shadow Boxing', sets: 4, reps: 1, weight: 0, unit: 'kg' },
    ],
    coachFeedback: 'Excellent power and technique from all participants. Keep working on footwork.',
    memberFeedback: 'Great session, loved the intensity!',
  },
  {
    _id: 'ms4',
    title: 'Weightlifting - Strength Foundation',
    description: 'Progressive overload training for intermediate lifters',
    type: 'personal_training',
    sport: 'Weightlifting',
    sportId: { name: 'Weightlifting' },
    date: '2026-04-02',
    startTime: '17:00',
    endTime: '18:15',
    location: 'Weight Room',
    facilityName: 'Weight Room',
    coachName: 'Coach Emma Wilson',
    status: 'scheduled',
    memberResponse: 'declined',
    attendanceStatus: 'not_attending',
    price: 500,
    trainingPlanId: { title: 'Shoulder Rehab & Strength' },
    exercisePlan: [
      { exercise: 'Squats', sets: 4, reps: 8, weight: 80, unit: 'kg' },
      { exercise: 'Bench Press', sets: 4, reps: 8, weight: 60, unit: 'kg' },
      { exercise: 'Deadlift', sets: 3, reps: 6, weight: 100, unit: 'kg' },
      { exercise: 'Barbell Rows', sets: 3, reps: 10, weight: 50, unit: 'kg' },
    ],
    coachFeedback: '',
    memberFeedback: '',
  },
  {
    _id: 'ms5',
    title: 'Karate - Belt Assessment',
    description: 'Green belt to Brown belt assessment',
    type: 'assessment',
    sport: 'Karate',
    sportId: { name: 'Karate' },
    date: '2026-03-10',
    startTime: '10:00',
    endTime: '11:30',
    location: 'Main Dojo',
    facilityName: 'Main Dojo',
    coachName: 'Coach Williams',
    status: 'cancelled',
    memberResponse: '',
    attendanceStatus: '',
    price: 1000,
    trainingPlanId: null,
    exercisePlan: [],
    coachFeedback: '',
    memberFeedback: '',
  },
];

// ─── Helper Functions ───
const formatDate = dateStr => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
};

const isPending = session => {
  const r = session.memberResponse || session.attendanceStatus;
  return !r || r === 'pending' || r === '' || r === undefined;
};

const isUpcoming = session => {
  if (!session.date) return false;
  return new Date(session.date) >= new Date(new Date().toDateString());
};

const getSessionTypeLabel = type => {
  switch (type) {
    case 'personal_training': return 'Personal Training';
    case 'group_class': return 'Group Class';
    case 'workshop': return 'Workshop';
    case 'assessment': return 'Assessment';
    case 'consultation': return 'Consultation';
    default: return type || '';
  }
};

// ─── Design Tokens ───
const getTypeConfig = type => {
  const c = {
    personal_training: { primary: '#7c3aed', gradient: ['#6d28d9', '#8b5cf6'], icon: 'account-supervisor', bg: '#f5f3ff', border: '#ddd6fe' },
    group_class: { primary: '#059669', gradient: ['#047857', '#10b981'], icon: 'account-group', bg: '#ecfdf5', border: '#a7f3d0' },
    assessment: { primary: '#d97706', gradient: ['#b45309', '#f59e0b'], icon: 'clipboard-check-outline', bg: '#fffbeb', border: '#fde68a' },
    workshop: { primary: '#2563eb', gradient: ['#1d4ed8', '#3b82f6'], icon: 'presentation', bg: '#eff6ff', border: '#bfdbfe' },
    consultation: { primary: '#ec4899', gradient: ['#db2777', '#f472b6'], icon: 'chat-processing-outline', bg: '#fdf2f8', border: '#fbcfe8' },
    default: { primary: '#6b7280', gradient: ['#4b5563', '#9ca3af'], icon: 'calendar-clock', bg: '#f9fafb', border: '#e5e7eb' },
  };
  return c[type] || c.default;
};

const getResponseConfig = response => {
  if (response === 'accepted' || response === 'attending') return { bg: '#dcfce7', text: '#166534', dot: '#22c55e', label: 'Attending' };
  if (response === 'declined' || response === 'not_attending') return { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444', label: 'Declined' };
  return { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b', label: 'Pending' };
};

const getStatusConfig = status => {
  switch (status) {
    case 'scheduled': return { bg: '#ecfdf5', text: '#166534', dot: '#22c55e', label: 'Scheduled' };
    case 'completed': return { bg: '#eff6ff', text: '#1e40af', dot: '#3b82f6', label: 'Completed' };
    case 'cancelled': return { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444', label: 'Cancelled' };
    default: return { bg: '#f3f4f6', text: '#374151', dot: '#9ca3af', label: status || 'Unknown' };
  }
};

const FILTER_OPTIONS = [
  { label: 'All Sessions', value: 'all', icon: 'calendar' },
  { label: 'Upcoming', value: 'upcoming', icon: 'clock-outline' },
  { label: 'Completed', value: 'completed', icon: 'check-circle-outline' },
  { label: 'Declined', value: 'declined', icon: 'close-circle-outline' },
];

// ═══════════════════════════════════════════════
// ─── SECTION TITLE ───
// ═══════════════════════════════════════════════
const SectionTitle = ({ title, icon, iconColor = '#059669' }) => (
  <View className="flex-row items-center mb-4">
    <View className="w-8 h-8 rounded-lg justify-center items-center mr-2.5" style={{ backgroundColor: `${iconColor}15` }}>
      <Icon name={icon} size={16} color={iconColor} />
    </View>
    <Text className="text-gray-900 font-bold text-lg">{title}</Text>
  </View>
);

// ═══════════════════════════════════════════════
// ─── RESPONSE BADGE ───
// ═══════════════════════════════════════════════
const ResponseBadge = ({ session }) => {
  let cfg;
  if (session.status === 'cancelled') cfg = getStatusConfig('cancelled');
  else if (session.status === 'completed') cfg = getStatusConfig('completed');
  else if (!session.memberResponse || session.memberResponse === '' || session.memberResponse === 'pending') cfg = getResponseConfig('pending');
  else cfg = getResponseConfig(session.memberResponse);

  return (
    <View className="px-3 py-1.5 rounded-lg flex-row items-center" style={{ backgroundColor: cfg.bg }}>
      <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: cfg.dot }} />
      <Text className="text-[10px] font-bold" style={{ color: cfg.text }}>{cfg.label}</Text>
    </View>
  );
};

// ═══════════════════════════════════════════════
// ─── SESSION CARD ───
// ═══════════════════════════════════════════════
const SessionCard = ({ session, respondingId, onRespond, onViewDetails }) => {
  const pending = isPending(session);
  const upcoming = isUpcoming(session);
  const showActions = pending && upcoming && session.status !== 'cancelled';
  const typeCfg = getTypeConfig(session.type);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onViewDetails(session)}
      disabled={showActions}
      className="bg-white rounded-2xl mb-4 overflow-hidden shadow-md"
      style={{ elevation: 3, borderWidth: showActions ? 2 : 0, borderColor: showActions ? '#059669' : 'transparent' }}>

      <LinearGradient colors={typeCfg.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="h-1.5" />

      <View className="p-4">
        <View className="flex-row items-start">
          <View className="mr-3">
            <LinearGradient colors={typeCfg.gradient} className="w-14 h-14 rounded-xl justify-center items-center" style={{ borderRadius: 12 }}>
              <Text className="text-white font-bold text-lg">{session.date ? new Date(session.date).getDate() : '--'}</Text>
              <Text className="text-white/80 text-[10px] font-semibold -mt-0.5">
                {session.date ? new Date(session.date).toLocaleDateString('en-IN', { month: 'short' }).toUpperCase() : ''}
              </Text>
            </LinearGradient>
          </View>

          <View className="flex-1">
            <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>{session.title}</Text>
            <View className="flex-row flex-wrap items-center mt-1.5" style={{ gap: 6 }}>
              <View className="px-2.5 py-1 rounded-lg flex-row items-center" style={{ backgroundColor: typeCfg.bg, borderWidth: 1, borderColor: typeCfg.border }}>
                <Icon name={typeCfg.icon} size={10} color={typeCfg.primary} />
                <Text className="text-[10px] font-semibold ml-1" style={{ color: typeCfg.primary }}>{getSessionTypeLabel(session.type)}</Text>
              </View>
              {session.sport && (
                <View className="bg-emerald-50 px-2.5 py-1 rounded-lg" style={{ borderWidth: 1, borderColor: '#a7f3d0' }}>
                  <Text className="text-emerald-700 text-[10px] font-semibold">{session.sport}</Text>
                </View>
              )}
              <ResponseBadge session={session} />
            </View>
          </View>
        </View>

        {session.description ? (
          <Text className="text-gray-500 text-xs mt-3 leading-4" numberOfLines={2}>{session.description}</Text>
        ) : null}

        <View className="mt-3 pt-3 border-t border-gray-100">
          <View className="flex-row items-center mb-2">
            <View className="w-6 h-6 rounded-md bg-gray-50 justify-center items-center mr-2"><Icon name="calendar" size={12} color="#9ca3af" /></View>
            <Text className="text-gray-500 text-xs">{formatDate(session.date)}</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <View className="w-6 h-6 rounded-md bg-gray-50 justify-center items-center mr-2"><Icon name="clock-outline" size={12} color="#9ca3af" /></View>
            <Text className="text-gray-500 text-xs">{session.startTime || '--'} - {session.endTime || '--'}</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <View className="w-6 h-6 rounded-md bg-gray-50 justify-center items-center mr-2"><Icon name="map-marker-outline" size={12} color="#9ca3af" /></View>
            <Text className="text-gray-500 text-xs flex-1" numberOfLines={1}>{session.facilityName || session.location || 'Not specified'}</Text>
          </View>
          {session.coachName ? (
            <View className="flex-row items-center">
              <View className="w-6 h-6 rounded-md bg-gray-50 justify-center items-center mr-2"><Icon name="account-outline" size={12} color="#9ca3af" /></View>
              <Text className="text-gray-500 text-xs">{session.coachName}</Text>
            </View>
          ) : null}
        </View>

        {session.trainingPlanId ? (
          <View className="flex-row items-center mt-2.5">
            <View className="w-6 h-6 rounded-md bg-blue-50 justify-center items-center mr-2"><Icon name="file-document-outline" size={12} color="#2563eb" /></View>
            <Text className="text-blue-600 text-xs font-semibold">Plan: {typeof session.trainingPlanId === 'object' ? session.trainingPlanId.title : 'Linked'}</Text>
          </View>
        ) : null}

        {session.exercisePlan?.length > 0 && (
          <View className="mt-3 p-3 rounded-xl" style={{ backgroundColor: typeCfg.bg, borderWidth: 1, borderColor: typeCfg.border }}>
            <View className="flex-row items-center mb-2">
              <Icon name="dumbbell" size={13} color={typeCfg.primary} />
              <Text className="text-xs font-bold ml-1.5" style={{ color: typeCfg.primary }}>Exercise Plan ({session.exercisePlan.length})</Text>
            </View>
            {session.exercisePlan.slice(0, 3).map((ex, idx) => (
              <View key={idx} className="flex-row items-center mb-0.5">
                <View className="w-1 h-1 rounded-full mr-2" style={{ backgroundColor: typeCfg.primary }} />
                <Text className="text-gray-600 text-[11px] flex-1">{ex.exercise}</Text>
                <Text className="text-gray-400 text-[10px] font-semibold">{ex.sets}×{ex.reps} {ex.weight ? `@ ${ex.weight}${ex.unit || 'kg'}` : ''}</Text>
              </View>
            ))}
            {session.exercisePlan.length > 3 && (
              <Text className="text-[10px] font-semibold mt-1" style={{ color: typeCfg.primary }}>+{session.exercisePlan.length - 3} more exercises</Text>
            )}
          </View>
        )}

        {session.price > 0 && (
          <View className="flex-row items-center mt-2.5 p-2.5 rounded-xl bg-orange-50" style={{ borderWidth: 1, borderColor: '#fed7aa' }}>
            <View className="w-6 h-6 bg-orange-100 rounded-md justify-center items-center mr-2"><Icon name="currency-usd" size={13} color="#d97706" /></View>
            <Text className="text-orange-700 text-xs font-bold">Additional Charge: </Text>
            <Text className="text-orange-900 text-xs font-bold">{session.price}</Text>
          </View>
        )}

        {(session.coachFeedback || session.memberFeedback) && (
          <View className="mt-3 pt-3 border-t border-gray-100">
            {session.coachFeedback ? (
              <View className="flex-row items-start mb-2">
                <View className="w-6 h-6 bg-emerald-50 rounded-md justify-center items-center mr-2 mt-0.5"><Icon name="comment-text-outline" size={12} color="#059669" /></View>
                <View className="flex-1">
                  <Text className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-0.5">Coach Feedback</Text>
                  <Text className="text-gray-600 text-xs leading-4" numberOfLines={2}>{session.coachFeedback}</Text>
                </View>
              </View>
            ) : null}
            {session.memberFeedback ? (
              <View className="flex-row items-start">
                <View className="w-6 h-6 bg-blue-50 rounded-md justify-center items-center mr-2 mt-0.5"><Icon name="comment-account-outline" size={12} color="#2563eb" /></View>
                <View className="flex-1">
                  <Text className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-0.5">Your Feedback</Text>
                  <Text className="text-gray-600 text-xs leading-4" numberOfLines={2}>{session.memberFeedback}</Text>
                </View>
              </View>
            ) : null}
          </View>
        )}

        {showActions && (
          <View className="flex-row mt-4" style={{ gap: 10 }}>
            <TouchableOpacity onPress={() => onRespond(session._id, 'accepted')} disabled={respondingId === session._id} activeOpacity={0.8} className="flex-1">
              <LinearGradient
                colors={respondingId === session._id ? ['#d1d5db', '#d1d5db'] : ['#059669', '#10b981']}
                style={{ borderRadius: 14, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                {respondingId === session._id ? <ActivityIndicator size="small" color="#fff" /> : (
                  <><Icon name="check-circle" size={18} color="#fff" /><Text className="text-white font-bold text-xs ml-1.5">Attend</Text></>
                )}
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onRespond(session._id, 'declined')} disabled={respondingId === session._id} activeOpacity={0.8} className="flex-1"
              style={{ borderRadius: 14, borderWidth: 1.5, borderColor: respondingId === session._id ? '#e5e7eb' : '#fca5a5', paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              {respondingId === session._id ? <ActivityIndicator size="small" color="#ef4444" /> : (
                <><Icon name="close-circle" size={18} color="#ef4444" /><Text className="text-red-500 font-bold text-xs ml-1.5">Can't Attend</Text></>
              )}
            </TouchableOpacity>
          </View>
        )}

        {!pending && !showActions && session.status === 'scheduled' && (
          <View className="mt-3 p-3 rounded-xl flex-row items-center"
            style={{ backgroundColor: (session.memberResponse === 'accepted' || session.attendanceStatus === 'attending') ? '#ecfdf5' : '#fee2e2', borderWidth: 1, borderColor: (session.memberResponse === 'accepted' || session.attendanceStatus === 'attending') ? '#a7f3d0' : '#fecaca' }}>
            <Icon name={(session.memberResponse === 'accepted' || session.attendanceStatus === 'attending') ? 'check-circle' : 'close-circle'} size={18} color={(session.memberResponse === 'accepted' || session.attendanceStatus === 'attending') ? '#059669' : '#ef4444'} />
            <Text className={`text-xs font-bold ml-2 flex-1 ${(session.memberResponse === 'accepted' || session.attendanceStatus === 'attending') ? 'text-emerald-700' : 'text-red-600'}`}>
              {(session.memberResponse === 'accepted' || session.attendanceStatus === 'attending') ? 'Confirmed — You\'re attending this session' : 'Declined — You won\'t be attending'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════
// ─── DETAIL MODAL CONTENT ───
// ═══════════════════════════════════════════════
const SessionDetailContent = ({ session, onClose }) => {
  if (!session) return null;
  const typeCfg = getTypeConfig(session.type);
  const statusCfg = getStatusConfig(session.status);
  const responseCfg = getResponseConfig(session.memberResponse || session.attendanceStatus);

  return (
    <>
      <LinearGradient colors={typeCfg.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="h-40 justify-center items-center rounded-t-3xl relative">
        <View className="w-16 h-16 bg-white/20 rounded-2xl justify-center items-center">
          <Icon name={typeCfg.icon} size={32} color="#fff" />
        </View>
        <TouchableOpacity onPress={onClose} className="absolute top-4 right-4 w-9 h-9 bg-black/30 rounded-full justify-center items-center">
          <Icon name="close" size={18} color="#fff" />
        </TouchableOpacity>
        <View className="absolute top-4 left-4">
          <View className="px-3 py-1.5 rounded-lg flex-row items-center" style={{ backgroundColor: `${statusCfg.dot}30` }}>
            <View className="w-2 h-2 rounded-full bg-white mr-1.5" />
            <Text className="text-white text-xs font-bold">{statusCfg.label}</Text>
          </View>
        </View>
        <View className="absolute bottom-4 left-4 right-4">
          <View className="bg-black/20 rounded-xl px-4 py-2.5 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Icon name="calendar" size={14} color="rgba(255,255,255,0.8)" />
              <Text className="text-white text-xs font-semibold ml-1.5">{formatDate(session.date)}</Text>
            </View>
            <View className="flex-row items-center">
              <Icon name="clock-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text className="text-white text-xs font-semibold ml-1.5">{session.startTime} - {session.endTime}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View className="p-5">
        <Text className="text-gray-900 font-bold text-xl">{session.title}</Text>
        <Text className="text-gray-500 text-sm mt-1">{session.description}</Text>

        <View className="flex-row flex-wrap mt-4" style={{ gap: 8 }}>
          <View className="px-3 py-1.5 rounded-lg flex-row items-center" style={{ backgroundColor: typeCfg.bg, borderWidth: 1, borderColor: typeCfg.border }}>
            <Icon name={typeCfg.icon} size={12} color={typeCfg.primary} />
            <Text className="text-xs font-bold ml-1" style={{ color: typeCfg.primary }}>{getSessionTypeLabel(session.type)}</Text>
          </View>
          {session.sport && (
            <View className="bg-emerald-50 px-3 py-1.5 rounded-lg" style={{ borderWidth: 1, borderColor: '#a7f3d0' }}>
              <Text className="text-emerald-700 text-xs font-bold">{session.sport}</Text>
            </View>
          )}
          <View className="px-3 py-1.5 rounded-lg flex-row items-center" style={{ backgroundColor: responseCfg.bg }}>
            <View className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: responseCfg.dot }} />
            <Text className="text-xs font-bold" style={{ color: responseCfg.text }}>{responseCfg.label}</Text>
          </View>
        </View>

        <View className="flex-row flex-wrap mt-5">
          {[
            { label: 'Location', value: session.facilityName || session.location, icon: 'map-marker-outline' },
            { label: 'Coach', value: session.coachName || session.coachId?.name, icon: 'account-outline' },
            { label: 'Duration', value: session.startTime && session.endTime ? `${session.startTime} - ${session.endTime}` : null, icon: 'clock-outline' },
            { label: 'Training Plan', value: typeof session.trainingPlanId === 'object' ? session.trainingPlanId?.title : null, icon: 'file-document-outline' },
          ].filter(item => item.value).map((item, index) => (
            <View key={index} className="w-1/2 mb-4 pr-2">
              <View className="flex-row items-center mb-1">
                <Icon name={item.icon} size={12} color="#9ca3af" />
                <Text className="text-gray-400 text-[11px] font-bold uppercase tracking-wider ml-1">{item.label}</Text>
              </View>
              <Text className="text-gray-900 font-semibold text-sm">{item.value}</Text>
            </View>
          ))}
        </View>

        {session.price > 0 && (
          <View className="p-4 rounded-2xl bg-orange-50 mb-5" style={{ borderWidth: 1.5, borderColor: '#fed7aa' }}>
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-orange-100 rounded-xl justify-center items-center mr-3">
                <Icon name="currency-usd" size={20} color="#d97706" />
              </View>
              <View className="flex-1">
                <Text className="text-orange-900 font-bold text-sm">Additional Charge</Text>
                <Text className="text-orange-600 text-xs mt-0.5">This session has an extra fee</Text>
              </View>
              <Text className="text-orange-900 font-bold text-xl">{session.price}</Text>
            </View>
          </View>
        )}

        {session.exercisePlan?.length > 0 && (
          <View className="mb-5">
            <View className="flex-row items-center mb-3">
              <View className="w-6 h-6 rounded-md justify-center items-center mr-2" style={{ backgroundColor: `${typeCfg.primary}15` }}>
                <Icon name="dumbbell" size={14} color={typeCfg.primary} />
              </View>
              <Text className="text-gray-900 font-bold">Exercise Plan ({session.exercisePlan.length})</Text>
            </View>
            <View className="rounded-2xl overflow-hidden" style={{ borderWidth: 1.5, borderColor: typeCfg.border }}>
              <View className="flex-row px-4 py-2.5" style={{ backgroundColor: typeCfg.bg }}>
                <Text className="text-[10px] font-bold uppercase tracking-wider flex-1" style={{ color: typeCfg.primary }}>Exercise</Text>
                <Text className="text-[10px] font-bold uppercase tracking-wider w-12 text-center" style={{ color: typeCfg.primary }}>Sets</Text>
                <Text className="text-[10px] font-bold uppercase tracking-wider w-12 text-center" style={{ color: typeCfg.primary }}>Reps</Text>
                <Text className="text-[10px] font-bold uppercase tracking-wider w-16 text-right" style={{ color: typeCfg.primary }}>Weight</Text>
              </View>
              {session.exercisePlan.map((ex, idx) => (
                <View key={idx} className={`flex-row px-4 py-3 items-center ${idx < session.exercisePlan.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <View className="flex-1 flex-row items-center">
                    <View className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: typeCfg.primary }} />
                    <Text className="text-gray-900 text-sm font-medium">{ex.exercise}</Text>
                  </View>
                  <Text className="text-gray-500 text-sm font-semibold w-12 text-center">{ex.sets}</Text>
                  <Text className="text-gray-500 text-sm font-semibold w-12 text-center">{ex.reps}</Text>
                  <Text className="text-gray-500 text-sm font-semibold w-16 text-right">{ex.weight ? `${ex.weight}${ex.unit || 'kg'}` : '—'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {(session.coachFeedback || session.memberFeedback) && (
          <View className="mb-5">
            <View className="flex-row items-center mb-3">
              <View className="w-6 h-6 rounded-md bg-emerald-50 justify-center items-center mr-2"><Icon name="comment-text-outline" size={14} color="#059669" /></View>
              <Text className="text-gray-900 font-bold">Feedback</Text>
            </View>
            {session.coachFeedback ? (
              <View className="p-4 rounded-2xl bg-emerald-50 mb-3" style={{ borderWidth: 1.5, borderColor: '#a7f3d0' }}>
                <View className="flex-row items-center mb-2">
                  <View className="w-6 h-6 bg-emerald-100 rounded-lg justify-center items-center mr-2"><Icon name="account" size={14} color="#059669" /></View>
                  <Text className="text-emerald-800 text-xs font-bold">Coach Feedback</Text>
                </View>
                <Text className="text-gray-700 text-sm leading-5 ml-8">{session.coachFeedback}</Text>
              </View>
            ) : null}
            {session.memberFeedback ? (
              <View className="p-4 rounded-2xl bg-blue-50" style={{ borderWidth: 1.5, borderColor: '#bfdbfe' }}>
                <View className="flex-row items-center mb-2">
                  <View className="w-6 h-6 bg-blue-100 rounded-lg justify-center items-center mr-2"><Icon name="account-outline" size={14} color="#2563eb" /></View>
                  <Text className="text-blue-800 text-xs font-bold">Your Feedback</Text>
                </View>
                <Text className="text-gray-700 text-sm leading-5 ml-8">{session.memberFeedback}</Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </>
  );
};

// ═══════════════════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════
const MySessionsScreen = ({ navigation }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [respondingId, setRespondingId] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      let filtered = [...MOCK_SESSIONS];
      if (filter === 'upcoming') filtered = filtered.filter(s => s.status === 'scheduled');
      if (filter === 'completed') filtered = filtered.filter(s => s.status === 'completed');
      if (filter === 'declined') filtered = filtered.filter(s => s.memberResponse === 'declined' || s.attendanceStatus === 'not_attending');
      setSessions(filtered);
    } catch (error) {
      Alert.alert('Error', 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSessions();
    setRefreshing(false);
  };

  const handleRespond = async (sessionId, response) => {
    try {
      setRespondingId(sessionId);
      await new Promise(resolve => setTimeout(resolve, 800));
      setSessions(prev =>
        prev.map(s =>
          s._id === sessionId
            ? { ...s, memberResponse: response, attendanceStatus: response === 'accepted' ? 'attending' : 'not_attending' }
            : s,
        ),
      );
      Alert.alert(
        response === 'accepted' ? 'Confirmed!' : 'Declined',
        response === 'accepted' ? 'You\'re confirmed for this session.' : 'Session declined successfully.',
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save response');
    } finally {
      setRespondingId(null);
    }
  };

  const handleViewDetails = session => {
    if (isPending(session) && isUpcoming(session) && session.status !== 'cancelled') return;
    setSelectedSession(session);
    setShowDetailModal(true);
  };

  const handleCloseModal = useCallback(() => {
    setShowDetailModal(false);
    setTimeout(() => setSelectedSession(null), 300);
  }, []);

  const stats = useMemo(() => {
    const all = MOCK_SESSIONS;
    return {
      total: all.length,
      upcoming: all.filter(s => s.status === 'scheduled').length,
      completed: all.filter(s => s.status === 'completed').length,
      pending: all.filter(s => isPending(s) && s.status === 'scheduled').length,
    };
  }, []);

  const statsConfig = [
    { label: 'Total', value: stats.total.toString(), icon: 'calendar', gradient: ['#059669', '#34d399'] },
    { label: 'Upcoming', value: stats.upcoming.toString(), icon: 'clock-outline', gradient: ['#2563eb', '#60a5fa'] },
    { label: 'Completed', value: stats.completed.toString(), icon: 'check-decagram', gradient: ['#7c3aed', '#a78bfa'] },
    { label: 'Pending', value: stats.pending.toString(), icon: 'alert-circle-outline', gradient: ['#d97706', '#fbbf24'] },
  ];

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <View className="w-16 h-16 rounded-2xl bg-emerald-50 justify-center items-center mb-4">
          <ActivityIndicator size="large" color="#059669" />
        </View>
        <Text className="text-gray-900 font-bold text-base">Loading Sessions</Text>
        <Text className="text-gray-400 mt-1 text-sm">Fetching your scheduled sessions...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} tintColor="#059669" />}>

        {/* ─── HEADER ─── */}
        <LinearGradient
          colors={['#064e3b', '#059669', '#10b981']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingTop: 48, paddingBottom: 36, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
          <View className="flex-row justify-between items-center px-5 mb-5">
            <DrawerMenuButton />
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => navigation.navigate('Announcements')} className="w-10 h-10 bg-white/15 rounded-full justify-center items-center mr-2">
                <Icon name="bell-outline" size={22} color="#fff" />
                <View className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full justify-center items-center">
                  <Text className="text-white text-[8px] font-bold">3</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Settings')} className="w-10 h-10 bg-white/15 rounded-full justify-center items-center">
                <Icon name="cog-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          <View className="px-5">
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 bg-white/15 rounded-xl justify-center items-center mr-3">
                <Icon name="calendar-clock" size={22} color="#fff" />
              </View>
              <View>
                <Text className="text-white font-bold text-2xl">My Sessions</Text>
                <Text className="text-white/60 text-sm">Coach-assigned sessions — respond to attend or decline</Text>
              </View>
            </View>
          </View>
          <View className="mx-5 mt-5 bg-white/10 rounded-2xl p-4" style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-yellow-400/20 rounded-xl justify-center items-center">
                  <Icon name="information-outline" size={20} color="#fbbf24" />
                </View>
                <View className="ml-3">
                  <Text className="text-white font-bold text-sm">Session Responses</Text>
                  <Text className="text-white/50 text-xs mt-0.5">
                    {stats.pending > 0 ? `You have ${stats.pending} pending response${stats.pending > 1 ? 's' : ''}` : 'All caught up!'}
                  </Text>
                </View>
              </View>
              {stats.pending > 0 && (
                <View className="bg-yellow-400 px-4 py-2 rounded-xl flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-white mr-1.5" />
                  <Text className="text-white font-bold text-xs">{stats.pending} Pending</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* ─── STATS GRID ─── */}
        <View className="px-4 -mt-5">
          <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
            {statsConfig.map(stat => (
              <View key={stat.label} style={{ width: '50%', padding: 4 }}>
                <TouchableOpacity activeOpacity={0.8} className="bg-white rounded-2xl p-4 shadow-md" style={{ elevation: 4 }}>
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider">{stat.label}</Text>
                      <Text className="text-gray-900 font-bold text-3xl mt-1">{stat.value}</Text>
                    </View>
                    <LinearGradient colors={stat.gradient} className="w-11 h-11 rounded-xl justify-center items-center" style={{ borderRadius: 12 }}>
                      <Icon name={stat.icon} size={20} color="#fff" />
                    </LinearGradient>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* ─── FILTER TABS ─── */}
        <View className="px-4 mt-6">
          <View className="flex-row bg-white rounded-2xl p-1.5 shadow-sm" style={{ elevation: 2 }}>
            {FILTER_OPTIONS.map(option => {
              const isActive = filter === option.value;
              return (
                <TouchableOpacity key={option.value} onPress={() => setFilter(option.value)} activeOpacity={0.7}
                  className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${isActive ? 'bg-emerald-500' : ''}`}>
                  <Icon name={option.icon} size={15} color={isActive ? '#fff' : '#6b7280'} />
                  <Text className={`text-xs font-bold ml-1.5 ${isActive ? 'text-white' : 'text-gray-500'}`}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ─── SESSIONS LIST ─── */}
        <View className="px-4 mt-5">
          <View className="flex-row items-center mb-4">
            <View className="w-6 h-6 rounded-md bg-gray-100 justify-center items-center mr-2">
              <Icon name="format-list-bulleted" size={14} color="#6b7280" />
            </View>
            <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">
              {sessions.length} Session{sessions.length !== 1 ? 's' : ''} Found
            </Text>
          </View>

          {sessions.length > 0 ? (
            sessions.map(session => (
              <SessionCard key={session._id} session={session} respondingId={respondingId} onRespond={handleRespond} onViewDetails={handleViewDetails} />
            ))
          ) : (
            <View className="bg-white rounded-2xl p-8 items-center shadow-md" style={{ elevation: 3 }}>
              <View className="w-20 h-20 bg-gray-100 rounded-full justify-center items-center mb-4">
                <Icon name="calendar-clock" size={40} color="#d1d5db" />
              </View>
              <Text className="text-gray-900 font-bold text-lg">No Sessions Found</Text>
              <Text className="text-gray-400 text-sm text-center mt-2 px-4">
                {filter === 'all' ? 'Your coach hasn\'t created any sessions for you yet.' : `No ${filter} sessions to show right now.`}
              </Text>
              <TouchableOpacity activeOpacity={0.8} className="mt-5" onPress={onRefresh}>
                <LinearGradient colors={['#059669', '#10b981']} className="px-6 py-3.5 rounded-xl flex-row items-center shadow-md" style={{ elevation: 3 }}>
                  <Icon name="refresh" size={16} color="#fff" />
                  <Text className="text-white font-bold text-sm ml-2">Refresh</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="h-8" />
      </ScrollView>

      {/* ─── DETAIL MODAL ─── */}
      <Modal visible={showDetailModal} transparent animationType="slide" onRequestClose={handleCloseModal}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: '90%' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <SessionDetailContent session={selectedSession} onClose={handleCloseModal} />
            </ScrollView>
            <View className="px-5 pb-6 pt-3 border-t border-gray-100 bg-white">
              <TouchableOpacity onPress={handleCloseModal} className="w-full"
                style={{ borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', paddingVertical: 15, alignItems: 'center' }}>
                <Text className="text-gray-700 font-bold">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MySessionsScreen;