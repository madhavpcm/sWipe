import { View, Text, TouchableOpacity, Image, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-media-library";
import { useState } from "react";
import ListItem from "react-native-flatboard/lib/components/common/ListItem";

interface MediaGroup {
  title: string;
  data: Asset[];
}

interface MonthListProps {
  groupedMedia: MediaGroup[];
  mediaAssets: Asset[];
}

interface FilterOptions {
  photos: boolean;
  videos: boolean;
}

const MonthList = ({ groupedMedia, mediaAssets }: MonthListProps) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    photos: true,
    videos: true
  });

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const filteredAndSortedMedia = groupedMedia
    .map(group => ({
      ...group,
      data: group.data.filter(asset => 
        (filterOptions.photos && asset.mediaType === 'photo') ||
        (filterOptions.videos && asset.mediaType === 'video')
      )
    }))
    .filter(group => group.data.length > 0)
    .sort((a, b) => {
      const dateA = new Date(a.data[0].creationTime);
      const dateB = new Date(b.data[0].creationTime);
      return sortOrder === 'asc' 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });

  return (
    <View className="flex-1 w-screen bg-white">
      <View className="flex-row justify-between items-center p-4">
        <Text className="text-2xl font-bold">Months</Text>
        <View className="flex-row gap-4">
          <TouchableOpacity className="p-2" onPress={() => setShowFilterModal(true)}>
            <Ionicons name="filter-outline" size={22} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2" onPress={toggleSort}>
            <Ionicons 
              name={sortOrder === 'asc' ? "arrow-up" : "arrow-down"} 
              size={22} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView>
        {filteredAndSortedMedia.map((item) => (
          <MonthListItem
            key={item.title}
            title={item.title}
            data={item.data}
            mediaAssets={mediaAssets}
          />
        ))}
      </ScrollView>

      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold">Filter Media</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              className="flex-row items-center py-3"
              onPress={() => setFilterOptions(prev => ({ ...prev, photos: !prev.photos }))}
            >
              <Ionicons 
                name={filterOptions.photos ? "checkbox" : "square-outline"} 
                size={24} 
                color="#666" 
              />
              <Text className="ml-3 text-lg">Photos</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-row items-center py-3"
              onPress={() => setFilterOptions(prev => ({ ...prev, videos: !prev.videos }))}
            >
              <Ionicons 
                name={filterOptions.videos ? "checkbox" : "square-outline"} 
                size={24} 
                color="#666" 
              />
              <Text className="ml-3 text-lg">Videos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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