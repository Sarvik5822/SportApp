import React from 'react';
import {View, Text} from 'react-native';

const ProgressBar = ({
  progress,
  total = 100,
  height = 8,
  showPercentage = true,
  label,
  color = 'bg-accent',
  backgroundColor = 'bg-gray-200',
}) => {
  const percentage = Math.min(100, Math.max(0, (progress / total) * 100));

  return (
    <View className="w-full mb-4">
      {label && (
        <View className="flex-row justify-between mb-2">
          <Text className="text-dark font-medium text-sm">{label}</Text>
          {showPercentage && (
            <Text className="text-accent font-bold text-sm">{Math.round(percentage)}%</Text>
          )}
        </View>
      )}
      <View className={`w-full rounded-full ${backgroundColor}`} style={{height}}>
        <View
          className={`h-full rounded-full ${color}`}
          style={{width: `${percentage}%`}}
        />
      </View>
    </View>
  );
};

export default ProgressBar;