import { Link, router, useLocalSearchParams } from "expo-router";

import { Text, View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ToastAndroid,
  Linking,
  NativeModules
} from "react-native";
import images from "@/constants/images";
import icons from "@/constants/icons";
import FlatBoard from "react-native-flatboard";
import { useFonts } from "expo-font";
import * as MediaLibrary from "expo-media-library";
import { useEffect, useState } from "react";
import * as FileSsystem from 'expo-file-system'
import { format } from 'date-fns';
import Header from "@/components/common/Header";
import Button from "@/components/common/button";
import  {PermissionsAndroid, Platform}  from 'react-native';
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Banner } from "@/components/home/banner";
import { OngoingList } from "@/components/ongoing-list";
import { BottomNav } from "@/components/common/bottom-nav";
  


  const requestWriteStoragePermission1 = async () => {
    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ];
      const platformVersion = Number(Platform.Version);
      if (platformVersion < 29) {
        // WRITE_EXTERNAL_STORAGE is only needed for Android 9 (API 28) and below
        permissions.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      } else if (platformVersion >= 30) {
        // MANAGE_EXTERNAL_STORAGE is only required for Android 11+
        permissions.push(PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE);
      }
      console.log("requesting perms for native")
    //   const granted = await PermissionsAndroid.requestMultiple
    //   ([PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, 
    //     PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    //     PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE,
    //     PermissionsAndroid.PERMISSIONS.MANAGE_MEDIA
    //   ]
    // );
    const granted = await PermissionsAndroid.requestMultiple(permissions);
    console.log("Perms granted hereee", granted)

      // const rgranted = await PermissionsAndroid.request(
      //   PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      //   {
      //     title: 'Storage Permission',
      //     message: 'This app needs access to your storage to save files.',
      //     buttonNegative: 'Cancel',
      //     buttonPositive: 'OK',
      //   }
      // );
      // const wgranted = await PermissionsAndroid.request(
      //   PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      //   {
      //     title: 'Storage Permission',
      //     message: 'This app needs access to your storage to save files.',
      //     buttonNegative: 'Cancel',
      //     buttonPositive: 'OK',
      //   }
      // );
      // const mgranted = await PermissionsAndroid.request(
      //   PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE,
      //   {
      //     title: 'Storage Permission',
      //     message: 'This app needs access to your storage to delete files.',
      //     buttonNegative: 'Cancel',
      //     buttonPositive: 'OK',
      //   }
      // );
      // const megranted = await PermissionsAndroid.request(
      //   PermissionsAndroid.PERMISSIONS.MANAGE_MEDIA,
      //   {
      //     title: 'Storage Permission',
      //     message: 'This app needs access to your storage to delete files.',
      //     buttonNegative: 'Cancel',
      //     buttonPositive: 'OK',
      //   }
      // );
  //     const showRationale = shouldShowRequestPermissionRationale(megranted);
  // console.log('Should show rationale:', showRationale);
  
      // if (rgranted === PermissionsAndroid.RESULTS.GRANTED && 
      //   wgranted === PermissionsAndroid.RESULTS.GRANTED &&
      //    mgranted === PermissionsAndroid.RESULTS.GRANTED
      //    && megranted === PermissionsAndroid.RESULTS.GRANTED) {
      if(granted["android.permission.READ_EXTERNAL_STORAGE"] === "granted" &&
      granted["android.permission.WRITE_EXTERNAL_STORAGE"] === "granted") {
      
        console.log('R/Write External Storage Permission Granted');
        return true;
      } else {
        // console.log('R/Write External Storage Permission Denied', rgranted, wgranted);
        return false;
      }
    } catch (err) {
      console.warn(err , "Error in perms testtingg");
      return false;
    }
  };
  const requestStoragePermission = async () => {
    let permissions = [PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO, 
      // PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
    ];

    const platformVersion = Number(Platform.Version);

    if (Platform.OS === 'android') {
      try {
        if (platformVersion < 33) {
          // Android 12 and below
          permissions = permissions.concat([
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          ]);
        } 
        const granted = await PermissionsAndroid.requestMultiple(permissions);
        // if (manageStorage !== PermissionsAndroid.RESULTS.GRANTED) {
          // console.log("MANAGE_EXTERNAL_STORAGE permission denied");
          // Linking.openSettings(); // Open settings manually
        // }
        console.log("Permissions result:", granted);
      } catch (err) {
        console.warn(err);
      }
    }
  };
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

  const  [isGranted, setisGranted] = useState(false)

  useEffect(() => {
  

    const checkPermissions = async () => {
      await requestStoragePermission()
      const {status} = await MediaLibrary.getPermissionsAsync();
      if(status === "granted") {
        console.log("Permission granted for expo");
        setisGranted(true);
         
        
      } else {
        console.log("Permission denied");
      }
    }
    checkPermissions()
  }, [])

 
  const onComplete = async () => {
    console.log("Requesting permissions for media library");
    const {status, accessPrivileges} = await MediaLibrary.requestPermissionsAsync();

    console.log("Permission granted:", accessPrivileges, "status:", status);
    if(status === "granted") {
      setisGranted(true);
    } else {
      console.log("Permission denied");
    }
  }

  return (
    <View style={{flex: 1}
    
    }
    className=""
    >
        <View className="flex-1 bg-white font-rubik">
          <Banner />
          <OngoingList />
        </View>
    </View>
  );
}


function shouldShowRequestPermissionRationale(permission: any) {
  throw new Error("Function not implemented.");
}
