import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ProfileAvatar from './ProfileAvatar';

const AttendanceItem = ({trainee, onToggle}) => {
  const [present, setPresent] = useState(trainee.present);
  const [absent, setAbsent] = useState(trainee.absent);

  const handlePresent = () => {
    setPresent(true);
    setAbsent(false);
    onToggle?.(trainee.id, 'present');
  };

  const handleAbsent = () => {
    setPresent(false);
    setAbsent(true);
    onToggle?.(trainee.id, 'absent');
  };

  return (
    <View className="bg-white rounded-xl p-4 m-2 flex-row items-center shadow-sm" style={{elevation: 2}}>
      <ProfileAvatar name={trainee.name} size="small" />
      
      <View className="flex-1 ml-3">
        <Text className="text-dark font-semibold text-base">{trainee.name}</Text>
        <Text className="text-dark-lighter text-xs">ID: {trainee.id}</Text>
      </View>

      <View className="flex-row">
        <TouchableOpacity
          onPress={handlePresent}
          className={`px-4 py-2 rounded-l-lg flex-row items-center ${
            present ? 'bg-accent' : 'bg-gray-200'
          }`}>
          <Icon
            name="check"
            size={16}
            color={present ? '#fff' : '#6b7280'}
          />
          <Text
            className={`ml-1 font-semibold text-sm ${
              present ? 'text-white' : 'text-dark-lighter'
            }`}>
            Present
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleAbsent}
          className={`px-4 py-2 rounded-r-lg flex-row items-center ${
            absent ? 'bg-red-500' : 'bg-gray-200'
          }`}>
          <Icon
            name="close"
            size={16}
            color={absent ? '#fff' : '#6b7280'}
          />
          <Text
            className={`ml-1 font-semibold text-sm ${
              absent ? 'text-white' : 'text-dark-lighter'
            }`}>
            Absent
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AttendanceItem;