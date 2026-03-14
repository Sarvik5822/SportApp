import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import SessionCard from '../../components/SessionCard';
import {mySessions} from '../../data/sessions';

const MySessionsScreen = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  const filteredSessions = mySessions.filter(
    session => session.status === activeTab
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6']}
        className="px-6 pt-12 pb-6">
        <Text className="text-white font-bold text-2xl">My Sessions</Text>
        <Text className="text-white/80">Manage your training schedule</Text>
      </LinearGradient>

      {/* Tabs */}
      <View className="flex-row px-6 py-4 bg-white shadow-sm">
        <TouchableOpacity
          onPress={() => setActiveTab('upcoming')}
          className={`flex-1 py-3 rounded-xl mr-2 ${
            activeTab === 'upcoming' ? 'bg-accent' : 'bg-gray-100'
          }`}>
          <Text
            className={`text-center font-semibold ${
              activeTab === 'upcoming' ? 'text-white' : 'text-dark-lighter'
            }`}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('completed')}
          className={`flex-1 py-3 rounded-xl ml-2 ${
            activeTab === 'completed' ? 'bg-primary' : 'bg-gray-100'
          }`}>
          <Text
            className={`text-center font-semibold ${
              activeTab === 'completed' ? 'text-white' : 'text-dark-lighter'
            }`}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sessions List */}
      <ScrollView className="flex-1 pt-4">
        {filteredSessions.length > 0 ? (
          filteredSessions.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              showCancel={activeTab === 'upcoming'}
              onCancel={() => alert('Session cancelled')}
            />
          ))
        ) : (
          <View className="flex-1 justify-center items-center mt-20">
            <Icon
              name={activeTab === 'upcoming' ? 'calendar-clock' : 'check-circle'}
              size={64}
              color="#d1d5db"
            />
            <Text className="text-dark-lighter text-lg mt-4">
              No {activeTab} sessions
            </Text>
          </View>
        )}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
};

export default MySessionsScreen;