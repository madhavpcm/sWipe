import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
      <View className="flex-row justify-center w-full gap-8">
        <View className="items-center bg-blue-50 px-8 py-4 rounded-2xl">
          <View className="bg-blue-100 p-3 rounded-full mb-2">
            <Ionicons name="images-outline" size={24} color="#3b82f6" />
          </View>
          <Text className="text-2xl font-bold text-blue-500">
            {mediaCount.photos.toLocaleString()}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">Photos</Text>
        </View>
        <View className="items-center bg-green-50 px-8 py-4 rounded-2xl">
          <View className="bg-green-100 p-3 rounded-full mb-2">
            <Ionicons name="videocam-outline" size={24} color="#22c55e" />
          </View>
          <Text className="text-2xl font-bold text-green-500">
            {mediaCount.videos.toLocaleString()}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">Videos</Text>
        </View>
      </View>
    </View>
  );
}