import { Link } from "expo-router";

import { Text, View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ToastAndroid
} from "react-native";
import images from "@/constants/images";
import icons from "@/constants/icons";
import FlatBoard from "react-native-flatboard";
import { useFonts } from "expo-font";
import * as MediaLibrary from "expo-media-library";
import { useEffect, useState } from "react";
import * as FileSsystem from 'expo-file-system'
import HomeCarousel from '@/components/home-carousel/index';
import { Ionicons } from '@expo/vector-icons';
import MonthList from "@/components/month-list";
import { format, parseISO } from 'date-fns';

interface StorageInfo {
  totalSpace: string;
  freeSpace: string;
  usedSpace: string;
}

interface MediaGroup {
  title: string;
  data: MediaLibrary.Asset[];
}

export default function Index() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    totalSpace: '0',
    freeSpace: '0',
    usedSpace: '0'
  });
  const [mediaAssets, setMediaAssets] = useState<MediaLibrary.Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaCount, setMediaCount] = useState({ photos: 0, videos: 0 });
  const [groupedMedia, setGroupedMedia] = useState<MediaGroup[]>([]);

  const getStorageInfo = async () => {
    try {
      const totalSpace = await FileSsystem.getTotalDiskCapacityAsync();
      const freeSpace = await FileSsystem.getFreeDiskStorageAsync();
      
      // Convert bytes to GB with better precision
      const totalGB = totalSpace / (1024 * 1024 * 1024);
      const freeGB = freeSpace / (1024 * 1024 * 1024);
      const usedGB = totalGB - freeGB;

      setStorageInfo({
        totalSpace: totalGB.toFixed(2),
        freeSpace: freeGB.toFixed(2),
        usedSpace: usedGB.toFixed(2)
      });

      console.log('Storage Info:', {
        total: totalGB.toFixed(2),
        free: freeGB.toFixed(2),
        used: usedGB.toFixed(2)
      });
    } catch (error) {
      console.error('Error getting storage info:', error);
    }
  }

  const groupMediaByMonth = (assets: MediaLibrary.Asset[]) => {
    // First, ensure all assets have valid dates
    const validAssets = assets.filter(asset => {
      const date = new Date(asset.creationTime);
      return !isNaN(date.getTime());
    });

    const groups = validAssets.reduce((acc: { [key: string]: MediaLibrary.Asset[] }, asset) => {
      const date = new Date(asset.creationTime);
      const monthYear = format(date, 'MMMM yyyy');
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(asset);
      return acc;
    }, {});

    // Sort groups by date (most recent first)
    return Object.entries(groups)
      .map(([title, data]) => ({ 
        title, 
        data: data.sort((a, b) => b.creationTime - a.creationTime) 
      }))
      .sort((a, b) => {
        const dateA = new Date(a.data[0].creationTime);
        const dateB = new Date(b.data[0].creationTime);
        return dateB.getTime() - dateA.getTime();
      });
  };

  const getMediaAssets = async () => {
    try {
      setIsLoading(true);
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: ['photo', 'video'],
        sortBy: ['creationTime'],
        first: 1000  // Increase the limit to get more media items
      });
      
      console.log('Total media items:', media.assets.length);  // Debug log
      setMediaAssets(media.assets);
      const grouped = groupMediaByMonth(media.assets);
      console.log('Grouped months:', grouped.map(g => g.title));  // Debug log
      setGroupedMedia(grouped);
      setMediaCount({
        photos: media.assets.filter(asset => asset.mediaType === 'photo').length,
        videos: media.assets.filter(asset => asset.mediaType === 'video').length
      });
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onboardData= [
    {
      id: 1,
      title: "Welcome to SwipeTrash",
      description:"Have fun organizing your Gallery",
      icon:images.slide_2,
    },
    {
      id:2,
      title: "Just Swipe Left or Right",
      description:"Swipe Left to delete and Right to keep",
      icon:images.slide_1,

    },
    {
      id:3,
      title: "Can't Decide?",
      description: "Put em head to head !",
      icon:images.slide_3,
    }
  ]

  const  [isGtant, setIsGtant] = useState(false)

  useEffect(() => {
    const checkPermissions = async () => {
      const {status} = await MediaLibrary.getPermissionsAsync();
      if(status === "granted") {
        console.log("Permission granted");
        setIsGtant(true);
        getStorageInfo();
        getMediaAssets();
      } else {
        console.log("Permission denied");
      }
    }
    checkPermissions()
  }, [])

  const onComplete = async () => {
    const {status} = await MediaLibrary.requestPermissionsAsync();
    if(status === "granted") {
      console.log("Permission granted");
      setIsGtant(true);
      await getStorageInfo();
      await getMediaAssets();
    } else {
      console.log("Permission denied");
    }
  }

  

  return (
    <View style={{flex: 1}}>
      {/* NavBar */}
      <View className="flex-row justify-between items-center p-4 bg-white">
        <Text className="text-3xl font-bold">SwipeTrash</Text>
        <TouchableOpacity className="p-2">
          <Ionicons name="information-circle-outline"
          
          size={24} color="gray" />
        </TouchableOpacity>
      </View>
      {!isGtant && <FlatBoard
        data={onboardData}
        onFinish={onComplete}
        accentColor="#000"
        backgroundColor="#fff"
        buttonTitle="Get Started"
        variant="modern"
        hideIndicator={false}
        descriptionStyle={styles.descriptionStyles}
        headingStyle={styles.headingStyles}
      />}
      {isGtant && 
        <ScrollView className="flex-1 w-screen bg-white">
          <HomeCarousel 
            storageInfo={storageInfo} 
            mediaCount={mediaCount}
          />
          <MonthList 
            groupedMedia={groupedMedia}
            mediaAssets={mediaAssets}
          />
        </ScrollView>
      }
    </View>
  );
}


const styles = StyleSheet.create({
  headingStyles:{
    fontSize: 30,
    color: '#000',
    textAlign: 'center'
  },
  descriptionStyles:{
    fontSize: 18,
    color: '#444',
    textAlign: 'center',
  
  }
})