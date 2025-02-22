import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

interface MediaCountProps {
  mediaCount: {
    photos: number;
    videos: number;
  };
}

export default function MediaCount({ mediaCount }: MediaCountProps) {
  return (
    <View className="items-center py-4 w-full">
      <Text className="text-base font-medium text-gray-500 mb-6">Media Library</Text>
      <View className="flex-row justify-center w-full gap-6 rounded-md">
        <LinearGradient
          colors={['#60A5FA20', '#60A5FA10']}
          className="items-center px-8 py-4 rounded-2xl"
        >
          <View className="bg-blue-500/10 p-3 rounded-full mb-2">
            <Ionicons name="images" size={24} color="#3B82F6"  />
          </View>
          <Text className="text-2xl font-bold text-blue-500 rounded-md">
            {mediaCount.photos.toLocaleString()}
          </Text>
          <Text className="text-sm text-gray-500 mt-1 font-medium">Photos</Text>
        </LinearGradient>

        <LinearGradient
          colors={['#34D39920', '#34D39910']}
          className="items-center px-8 py-4 rounded-2xl"
        >
          <View className="bg-green-500/10 p-3 rounded-full mb-2">
            <Ionicons name="videocam" size={24} color="#22C55E" />
          </View>
          <Text className="text-2xl font-bold text-green-500">
            {mediaCount.videos.toLocaleString()}
          </Text>
          <Text className="text-sm text-gray-500 mt-1 font-medium">Videos</Text>
        </LinearGradient>
      </View>
    </View>
  );
}