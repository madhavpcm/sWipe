import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Svg, Circle } from 'react-native-svg';

const PieChart = ({ percentage }:{percentage:number}) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View className="relative left-2 top-2">
      <Svg height="100" width="100" viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="40" stroke="#1e3a8a" strokeWidth="10" fill="transparent" />
        <Circle 
          cx="50" 
          cy="50" 
          r={radius} 
          stroke="#ffffff" 
          strokeWidth="10" 
          fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round"
        />
      </Svg>
      <View className="absolute inset-0 flex justify-center items-center">
        <Text className="text-white font-bold text-lg">{percentage}%</Text>
      </View>
    </View>
  );
};

export const Banner = () => {
  const router = useRouter();
  const percentage = 75;

  return (
    <LinearGradient 
      colors={["#2563eb", "#1e3a8a"]} 
      className="h-56 w-[92%] mx-auto rounded-2xl relative overflow-hidden shadow-xl flex justify-center items-center p-6"
    >
      <View className="absolute top-7 left-7">
        <PieChart percentage={percentage} />
      </View>
      
      <View className="flex flex-col justify-center items-center w-full absolute top-20">
        <Text className="text-gray-100 text-lg font-medium text-center">
          Storage Used
        </Text>
      </View>
      
      <TouchableOpacity 
        className="absolute bottom-5 right-5 flex flex-row items-center bg-white/30 px-6 py-3 rounded-full backdrop-blur-lg shadow-md"
        onPress={() => router.push('/(root)/stats')}
      >
        <Text className="text-white text-lg font-semibold">View Stats</Text>
        <MaterialIcons name="chevron-right" color="white" size={22} className="ml-2" />
      </TouchableOpacity>
    </LinearGradient>
  );
};
