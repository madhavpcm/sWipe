import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";

export default function Header() {


  const routestoShow = [
    ''
  ]
  const insets = useSafeAreaInsets();

  return (
    <View
      className="h-24 bg-white flex justify-between px-6 flex-row"
    >
      <Text
        className="text-4xl font-rubik-semibold text-blue-600"
      >
        sWipe
      </Text>
      <TouchableOpacity
      
      >
      <Ionicons
      name="settings-sharp"
      size={25}
      color={'#1e293b'}
      />
      </TouchableOpacity>
   

    </View>
  );
} 