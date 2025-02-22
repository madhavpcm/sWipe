import { 
  View, 
  Text, 
  TouchableNativeFeedback, 
  Image, 
  ScrollView,
  Platform,
  TouchableOpacity,
  FlatList
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-media-library";
import ListItem from "react-native-flatboard/lib/components/common/ListItem";
import { useRouter } from "expo-router";

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
    <View className="flex-1 bg-white">
      <View className="flex-row justify-between items-center px-4 py-2">
        <Text className="text-2xl font-bold">Your Media</Text>
        <TouchableOpacity className="p-2">
          <Ionicons name="filter-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={groupedMedia}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <MonthListItem
            title={item.title}
            data={item.data}
            mediaAssets={mediaAssets}
          />
        )}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
      />
    </View>
  );
};

export default MonthList;

const MonthListItem = ({ title, data, mediaAssets }: { title: string, data: Asset[], mediaAssets: Asset[] }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: "/swipe",
      params: {
        month: title,
        
      }
    });
  };

  return (
    <TouchableNativeFeedback
      background={TouchableNativeFeedback.Ripple('#00000010', false)}
      useForeground
      onPress={handlePress}
    >
      <View className="bg-white rounded-xl mb-4 overflow-hidden">
        <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
          <Text className="text-lg font-medium text-gray-900">{title}</Text>
          <Text className="text-sm text-gray-500">{data.length} items</Text>
        </View>
        <View className="flex-row p-4">
          {data.slice(0, 4).map((asset, index) => (
            <View 
              key={asset.id} 
              className="w-20 h-20 rounded-lg overflow-hidden mr-2"
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
            <View className="w-20 h-20 rounded-lg bg-gray-100 items-center justify-center">
              <Text className="text-sm font-medium text-gray-600">+{data.length - 4}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableNativeFeedback>
  );
};