import { View, Text } from "react-native";

interface MediaCountProps {
  mediaCount: {
    photos: number;
    videos: number;
  };
}

export default function MediaCount({ mediaCount }: MediaCountProps) {
  return (
    <View className="items-center justify-center">
      <Text className="text-xl font-bold mb-2">Media Library</Text>
      <View className="flex-row gap-8">
        <View className="items-center">
          <Text className="text-2xl font-bold text-blue-500">{mediaCount.photos}</Text>
          <Text className="text-sm text-gray-600">Photos</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-green-500">{mediaCount.videos}</Text>
          <Text className="text-sm text-gray-600">Videos</Text>
        </View>
      </View>
    </View>
  );
}