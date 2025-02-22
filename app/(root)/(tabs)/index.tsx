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
import StorageChart from '@/components/StorageChart';

interface StorageInfo {
  totalSpace: string;
  freeSpace: string;
  usedSpace: string;
}

export default function Index() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    totalSpace: '0',
    freeSpace: '0',
    usedSpace: '0'
  });

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
        console.log("Permission granted")
        setIsGtant(true)
        getStorageInfo()
      } else {
        console.log("Permission denied")
      }
    }
    checkPermissions()
  }, [])

  const onComplete = async () => {
    const {status} = await MediaLibrary.requestPermissionsAsync();
    if(status === "granted") {
      console.log("Permission granted")
      setIsGtant(true)
      await getStorageInfo()
    } else {
      console.log("Permission denied")
    }
  }

  return (
    <View style={{flex: 1}}>
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
        <View className="flex-1  w-screen">
        <View className=" items-center justify-center flex-col gap-4 bg-white p-6 mx-3 my-3 rounded-md shadow-xl">
          <Text className="text-2xl font-bold">Disk Usage</Text>
        
          <StorageChart storageInfo={storageInfo} />
          </View>
        </View>
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