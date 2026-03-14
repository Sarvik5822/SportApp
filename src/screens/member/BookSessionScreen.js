import React from 'react';
import {View, Text, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import SessionCard from '../../components/SessionCard';
import {sessions} from '../../data/sessions';

const BookSessionScreen = ({route, navigation}) => {
  const {sport} = route.params || {};
  
  const availableSessions = sport
    ? sessions.filter(s => s.sportName === sport.name && s.status === 'upcoming')
    : sessions.filter(s => s.status === 'upcoming');

  const handleBook = (session) => {
    // In a real app, this would book the session
    alert(`Booked ${session.sportName} session with ${session.coachName}`);
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6']}
        className="px-6 pt-12 pb-6">
        <View className="flex-row items-center">
          <Icon
            name="arrow-left"
            size={24}
            color="#fff"
            onPress={() => navigation.goBack()}
          />
          <Text className="text-white font-bold text-xl ml-4">Book Session</Text>
        </View>
        {sport && (
          <Text className="text-white/80 mt-2 ml-10">{sport.name}</Text>
        )}
      </LinearGradient>

      <ScrollView className="flex-1 pt-4">
        <Text className="text-dark font-bold text-lg px-6 mb-2">
          Available Sessions
        </Text>
        
        {availableSessions.length > 0 ? (
          availableSessions.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              onBook={() => handleBook(session)}
            />
          ))
        ) : (
          <View className="mx-6 mt-8 items-center">
            <Icon name="calendar-remove" size={64} color="#d1d5db" />
            <Text className="text-dark-lighter text-lg mt-4 text-center">
              No available sessions for this sport
            </Text>
            <Text className="text-dark-lighter text-sm mt-2 text-center">
              Check back later or try another sport
            </Text>
          </View>
        )}
        
        <View className="h-6" />
      </ScrollView>
    </View>
  );
};

export default BookSessionScreen;