import { TouchableNativeFeedback, View } from "react-native"
import React from "react"
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
export const BottomNav =() => {
    return (
        <View
  className="bg-white border-2 border-gray-100 shadow-md mx-6 w-[90%]  h-20 rounded-full absolute items-center justify-around  bottom-6 z-50 flex  flex-row py-2"
>
    <TouchableNativeFeedback>
        <View
        className="rounded-full bg-blue-500 p-3.5"
        >
        <MaterialIcons name="home" size={28}  color="white" />
        </View>
        
    </TouchableNativeFeedback>
    <TouchableNativeFeedback>
        <View>
        <MaterialIcons name="perm-media" size={28} color="black" />
        </View>
        
    </TouchableNativeFeedback>
    <TouchableNativeFeedback>
        <View>
        <MaterialIcons name="calendar-month" size={28} color="black" />
        </View>
        
    </TouchableNativeFeedback>
</View>

    )
}