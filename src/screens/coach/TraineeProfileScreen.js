import React from 'react';
import {View, Text, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ProfileAvatar from '../../components/ProfileAvatar';
import ProgressBar from '../../components/ProgressBar';

const TraineeProfileScreen = ({route}) => {
  const {trainee} = route.params || {};

  if (!trainee) return null;

  const InfoRow = ({icon, label, value}) => (
    <View className="flex-row items-center py-3 border-b border-gray-100">
      <View className="w-10 h-10 rounded-lg bg-primary/10 justify-center items-center">
        <Icon name={icon} size={20} color="#1e3a8a" />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-dark-lighter text-xs">{label}</Text>
        <Text className="text-dark font-medium">{value}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6']}
        className="px-6 pt-12 pb-12 rounded-b-[30px]">
        <View className="items-center">
          <ProfileAvatar name={trainee.name} size="xlarge" />
          <Text className="text-white font-bold text-2xl mt-4">{trainee.name}</Text>
          <Text className="text-white/80">{trainee.sport}</Text>
          
          <View className="flex-row mt-4">
            <View className="bg-white/20 px-4 py-2 rounded-full mr-2">
              <Text className="text-white font-semibold">Level: {trainee.performance.level}</Text>
            </View>
            <View className="bg-accent px-4 py-2 rounded-full">
              <Text className="text-white font-semibold">{trainee.attendance}% Attendance</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View className="px-4 -mt-6">
        {/* Personal Information */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-md" style={{elevation: 3}}>
          <View className="flex-row items-center mb-4">
            <Icon name="account" size={20} color="#1e3a8a" />
            <Text className="text-dark font-bold text-lg ml-2">Personal Information</Text>
          </View>
          <InfoRow icon="calendar" label="Age" value={`${trainee.age} years`} />
          <InfoRow icon="email" label="Email" value={trainee.email} />
          <InfoRow icon="phone" label="Phone" value={trainee.phone} />
          <InfoRow icon="calendar-arrow-right" label="Join Date" value={trainee.joinDate} />
        </View>

        {/* Health Information */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-md" style={{elevation: 3}}>
          <View className="flex-row items-center mb-4">
            <Icon name="heart-pulse" size={20} color="#1e3a8a" />
            <Text className="text-dark font-bold text-lg ml-2">Health Information</Text>
          </View>
          <InfoRow icon="water" label="Blood Type" value={trainee.healthInfo.bloodType} />
          <InfoRow icon="alert-circle" label="Allergies" value={trainee.healthInfo.allergies} />
          <InfoRow icon="medical-bag" label="Conditions" value={trainee.healthInfo.conditions} />
        </View>

        {/* Emergency Contact */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-md" style={{elevation: 3}}>
          <View className="flex-row items-center mb-4">
            <Icon name="contacts" size={20} color="#1e3a8a" />
            <Text className="text-dark font-bold text-lg ml-2">Emergency Contact</Text>
          </View>
          <InfoRow icon="account" label="Name" value={trainee.emergencyContact.name} />
          <InfoRow icon="account-switch" label="Relation" value={trainee.emergencyContact.relation} />
          <InfoRow icon="phone" label="Phone" value={trainee.emergencyContact.phone} />
        </View>

        {/* Performance */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-md" style={{elevation: 3}}>
          <View className="flex-row items-center mb-4">
            <Icon name="chart-line" size={20} color="#1e3a8a" />
            <Text className="text-dark font-bold text-lg ml-2">Performance</Text>
          </View>
          
          <View className="mb-4">
            <Text className="text-dark-lighter text-sm mb-2">Attendance Rate</Text>
            <ProgressBar progress={trainee.attendance} total={100} showPercentage={true} />
          </View>

          <View className="bg-gray-50 rounded-lg p-4">
            <Text className="text-dark-lighter text-xs mb-1">Coach Notes</Text>
            <Text className="text-dark">{trainee.performance.notes}</Text>
          </View>

          {trainee.performance.belt && (
            <InfoRow icon="belt" label="Belt Rank" value={trainee.performance.belt} />
          )}
          {trainee.performance.ranking && (
            <InfoRow icon="trophy" label="Ranking" value={trainee.performance.ranking} />
          )}
          {trainee.performance.maxSquat && (
            <InfoRow icon="weight-kilogram" label="Max Squat" value={trainee.performance.maxSquat} />
          )}
          {trainee.performance.maxBench && (
            <InfoRow icon="weight-kilogram" label="Max Bench" value={trainee.performance.maxBench} />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default TraineeProfileScreen;