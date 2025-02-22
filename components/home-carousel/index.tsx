import * as React from "react";
import { Dimensions, Text, View, TouchableOpacity } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import MediaCount from "./MediaCount";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { Feather } from '@expo/vector-icons';
import StorageChart from "./StorageChart";

interface StorageInfo {
  totalSpace: string;
  freeSpace: string;
  usedSpace: string;
}

interface HomeCarouselProps {
  storageInfo: StorageInfo;
  mediaCount: {
    photos: number;
    videos: number;
  };
}

const width = Dimensions.get("window").width;

export default function HomeCarousel({ storageInfo, mediaCount }: HomeCarouselProps) {
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  
  React.useEffect(() => {
    const autoPlay = setInterval(() => {
      ref.current?.next();
    }, 5000);

    return () => clearInterval(autoPlay);
  }, []);
  
  const slides = [
    {
      type: 'storage',
      component: <StorageChart storageInfo={storageInfo} />
    },
    {
      type: 'media',
      component: <MediaCount mediaCount={mediaCount} />
    }
  ];

  return (
    <View className="h-56 relative">
      <Carousel
        ref={ref}
        width={width}
        height={200}
        data={slides}
        onProgressChange={progress}
        autoPlay={true}
        autoPlayInterval={5000}
        renderItem={({ item }) => (
          <View className="flex-1 justify-center items-center px-4">
            {item.component}
          </View>
        )}
      />
      <View className="absolute flex-row justify-between w-full px-2 top-24">
        <TouchableOpacity 
          onPress={() => ref.current?.prev()}
          className="p-4"
        >
          <Feather name="chevron-left" size={20} color="#99999980" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => ref.current?.next()}
          className="p-4"
        >
          <Feather name="chevron-right" size={20} color="#99999980" />
        </TouchableOpacity>
      </View>
    </View>
  );
}