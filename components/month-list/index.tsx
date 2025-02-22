import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-media-library";
import ListItem from "react-native-flatboard/lib/components/common/ListItem";

interface MediaGroup {
  title: string;
  data: Asset[];
}

interface MonthListProps {
  groupedMedia: MediaGroup[];
  mediaAssets: Asset[];
}

const MonthList = ({ groupedMedia, mediaAssets }: MonthListProps) => {
  return (
    <View className="flex-1 w-screen bg-white">
      <View className="flex-row justify-between items-center p-4">
        <Text className="text-2xl font-bold">Months</Text>
        <TouchableOpacity className="p-2">
          <Ionicons name="filter-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
      <ScrollView>
        {groupedMedia.map((item) => (
          <MonthListItem
            key={item.title}
            title={item.title}
            data={item.data}
            mediaAssets={mediaAssets}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default MonthList;

const MonthListItem = ({ title, data, mediaAssets }: { title: string, data: Asset[], mediaAssets: Asset[] }) => {
  return (
    <View className="px-4 py-2 border-gray-50 border-b-2 hover:bg-gray-50">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-xl font-medium text-muted">{title}</Text>
        <Text className="text-sm text-gray-500">{data.length} items</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {data.slice(0, 4).map((asset, index) => (
            <View 
              key={asset.id} 
              className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100"
            >
              <Image
                source={{ uri: asset.uri }}
                className="w-full h-full"
                resizeMode="cover"
              />
              {asset.mediaType === 'video' && (
                <View className="absolute right-1 top-1">
                  <Ionicons name="play-circle" size={16} color="white" />
                </View>
              )}
            </View>
          ))}
          {data.length > 4 && (
            <TouchableOpacity 
              className="w-20 h-20 rounded-lg bg-gray-100 items-center justify-center"
            >
              <Text className="text-sm font-medium text-gray-600">+{data.length - 4}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};