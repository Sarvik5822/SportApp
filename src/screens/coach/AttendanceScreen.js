import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import AttendanceItem from '../../components/AttendanceItem';
import CustomButton from '../../components/CustomButton';
import {attendanceRecords} from '../../data/attendance';

const AttendanceScreen = ({route, navigation}) => {
  const {session} = route.params || {};
  const [attendance, setAttendance] = useState(() => {
    const record = attendanceRecords.find(r => r.sessionId === session?.id);
    return record?.trainees || [];
  });

  const handleToggle = (traineeId, status) => {
    setAttendance(prev =>
      prev.map(t =>
        t.id === traineeId ? {...t, present: status === 'present', absent: status === 'absent'} : t
      )
    );
  };

  const handleSave = () => {
    const present = attendance.filter(t => t.present).length;
    const absent = attendance.filter(t => t.absent).length;
    alert(`Attendance saved!\nPresent: ${present}\nAbsent: ${absent}`);
    navigation.goBack();
  };

  const presentCount = attendance.filter(t => t.present).length;
  const absentCount = attendance.filter(t => t.absent).length;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6']}
        className="px-6 pt-12 pb-6">
        <View className="flex-row items-center mb-4">
          <Icon
            name="arrow-left"
            size={24}
            color="#fff"
            onPress={() => navigation.goBack()}
          />
          <Text className="text-white font-bold text-xl ml-4">Mark Attendance</Text>
        </View>
        
        {session && (
          <View className="mt-2">
            <Text className="text-white font-semibold text-lg">{session.sportName}</Text>
            <Text className="text-white/80">
              {session.date} • {session.time} • {session.location}
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Summary */}
      <View className="flex-row px-6 py-4 bg-white shadow-sm">
        <View className="flex-1 items-center border-r border-gray-200">
          <Text className="text-accent font-bold text-2xl">{presentCount}</Text>
          <Text className="text-dark-lighter text-sm">Present</Text>
        </View>
        <View className="flex-1 items-center border-r border-gray-200">
          <Text className="text-red-500 font-bold text-2xl">{absentCount}</Text>
          <Text className="text-dark-lighter text-sm">Absent</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-primary font-bold text-2xl">{attendance.length}</Text>
          <Text className="text-dark-lighter text-sm">Total</Text>
        </View>
      </View>

      {/* Attendance List */}
      <ScrollView className="flex-1 pt-4">
        <Text className="text-dark font-bold text-lg px-6 mb-2">Trainees</Text>
        {attendance.length > 0 ? (
          attendance.map(trainee => (
            <AttendanceItem
              key={trainee.traineeId}
              trainee={trainee}
              onToggle={handleToggle}
            />
          ))
        ) : (
          <View className="items-center mt-10">
            <Icon name="account-group" size={64} color="#d1d5db" />
            <Text className="text-dark-lighter text-lg mt-4">No trainees found</Text>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>

      {/* Save Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
        <CustomButton title="Save Attendance" onPress={handleSave} variant="gradient" size="large" />
      </View>
    </View>
  );
};

export default AttendanceScreen;