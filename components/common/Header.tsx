import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { Ionicons,MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import { router, usePathname } from "expo-router";

export default function Header() {
  const pathname = usePathname()


  const tabRoutes= [
    '/album',
    '/month',
    '/'
  ]
  const insets = useSafeAreaInsets();

  return (
    <View
      className="h-20 bg-white pt-3 flex justify-between px-6 flex-row"
    >
      <TouchableOpacity
      onPress={()=> router.back()}
      
      >
      {!tabRoutes.includes(pathname)&&<MaterialIcons
      name="chevron-left"
      size={25}
      color={'#1e293b'}
      />}
      </TouchableOpacity>
      <Text
        className="text-4xl font-rubik-semibold text-blue-600"
      >
        sWipe
      </Text>
      {<TouchableOpacity
      onPress={()=>router.navigate('/(root)/settings')}
      
      >
      <MaterialIcons
      name="settings"
      size={25}
      color={'#1e293b'}
      />
      </TouchableOpacity>
       }
   

    </View>
  );
} 