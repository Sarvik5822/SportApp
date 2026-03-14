import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, TextInput} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ProfileAvatar from '../../components/ProfileAvatar';
import {trainees} from '../../data/trainees';
import {coachProfile} from '../../data/user';

const TraineesScreen = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const myTrainees = trainees.filter(t => t.coachId === coachProfile.id);
  
  const filteredTrainees = myTrainees.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6']}
        className="px-6 pt-12 pb-6">
        <Text className="text-white font-bold text-2xl">My Trainees</Text>
        <Text className="text-white/80">{myTrainees.length} active trainees</Text>
      </LinearGradient>

      {/* Search */}
      <View className="px-6 py-4 bg-white shadow-sm">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4">
          <Icon name="magnify" size={20} color="#6b7280" />
          <TextInput
            className="flex-1 py-3 px-3 text-dark"
            placeholder="Search trainees..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Trainees List */}
      <ScrollView className="flex-1 pt-4">
        {filteredTrainees.length > 0 ? (
          filteredTrainees.map(trainee => (
            <TouchableOpacity
              key={trainee.id}
              onPress={() => navigation.navigate('TraineeProfile', {trainee})}
              className="bg-white rounded-xl p-4 m-3 shadow-md flex-row items-center"
              style={{elevation: 3}}>
              <ProfileAvatar name={trainee.name} size="medium" />
              
              <View className="flex-1 ml-3">
                <Text className="text-dark font-bold text-base">{trainee.name}</Text>
                <Text className="text-dark-lighter text-sm">{trainee.sport}</Text>
                <View className="flex-row items-center mt-1">
                  <Icon name="calendar-check" size={14} color="#22c55e" />
                  <Text className="text-accent text-xs ml-1">{trainee.attendance}% attendance</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate('TraineeProfile', {trainee})}
                className="w-10 h-10 bg-primary/10 rounded-full justify-center items-center">
                <Icon name="chevron-right" size={20} color="#1e3a8a" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : (
          <View className="items-center mt-20">
            <Icon name="account-search" size={64} color="#d1d5db" />
            <Text className="text-dark-lighter text-lg mt-4">No trainees found</Text>
          </View>
        )}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
};

export default TraineesScreen;