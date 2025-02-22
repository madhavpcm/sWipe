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
      if(status === "granted"){
        console.log("Permission granted")
        setIsGtant(true)
        getStorageInfo()
      }
      else{
        console.log("Permission denied")
      }
    }

    const getStorageInfo = async ()=>{
      let totalSpace = await FileSsystem.getTotalDiskCapacityAsync();
      let freeSpace = await FileSsystem.getFreeDiskStorageAsync();
      totalSpace = totalSpace/1024/1024/1024
      freeSpace = freeSpace/1024/1024/1024
      setStorageInfo({
        totalSpace: totalSpace.toFixed(2),
        freeSpace: freeSpace.toFixed(2),
        usedSpace: (totalSpace - freeSpace).toFixed(2)
      })
    }
    checkPermissions()
  }
  ,[])

  const onComplete = async () => {
    const {status} = await MediaLibrary.requestPermissionsAsync();
    if(status === "granted"){
      console.log("Permission granted")
      setIsGtant(true)
      getStorageInfo()
    }
    else{
      console.log("Permission denied")
    }
  }

  return (
    // <View
    //   style={{
    //     flex: 1,
    //     justifyContent: "center",
    //     alignItems: "center",
    //   }}
    // >
    //   <Text
    //   className="text-2xl text-primary-300 font-rubik-bold"
    //   >Welcome to Restate</Text>
    //  <Link href={'/onboard'}>sign-in</Link>
    //   <Link href={'/properties/1'}>properties</Link>
    //   <Link href={'/profile'}>profile</Link>
      

    // </View>
      // <SafeAreaView className="bg-white h-full">
      //     <ScrollView contentContainerClassName="h-full">
      //       <Image
      //         source={images.onboarding}
      //         className="w-full h-4/6"
      //         resizeMode="contain"
      //       />
      //       <View className="px-10">
      //         <Text className="text-base text-center uppercase font-rubik text-black-100">
      //           Welcome to ReState
      //         </Text>
      //         <Text className="text-3xl text-black-300 font-rubik-bold text-center mt-2">
      //           Let's Get You Closer to {"\n"}
      //           <Text className=" text-primary-300 font-rubik-bold text-center">
      //             Your Dream Home
      //           </Text>
      //         </Text>
      //         <Text className="text-lg text-black-200 text-center mt-12 font-rubik">
      //           Sign in to your account with Google
      //         </Text>
    
      //         <TouchableOpacity className="bg-white shadow-md shadow-zinc-300 rounded-fukk w-full py-4 mt-5 ">
      //           <View className="flex flex-row items-center justify-center">
      //             <Image
      //               source={icons.google}
      //               className="w-5 h-5"
      //               resizeMode="contain"
      //             />
      //             <Text className="text-lg  text-black-300 font-rubik-medium ml-2">
      //               Continue with Google
      //             </Text>
      //           </View>
      //         </TouchableOpacity>
      //       </View>
      //     </ScrollView>
      //   </SafeAreaView>
      
        <View style={{flex: 1}}>
      {!isGtant&&<FlatBoard
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
      {
        isGtant&& <View
        className="flex-1 justify-center items-center w-screen"
        >
          <Text>Total Space: {storageInfo.totalSpace} GB</Text>
          <Text>Free Space: {storageInfo.freeSpace} GB</Text>
          <Text>Used Space: {storageInfo.usedSpace} GB</Text>
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