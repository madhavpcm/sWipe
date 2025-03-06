import React from "react";
import { TouchableNativeFeedback, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter, usePathname } from "expo-router";

export const BottomNav = () => {
    const navigation = useRouter();
    const pathname = usePathname();

    return (
        <View className="bg-white border-2 border-gray-100 shadow-md mx-6 w-[87%] h-20 rounded-full absolute items-center justify-around bottom-6 z-50 flex flex-row py-2">
            {/* Home Button */}
            <TouchableNativeFeedback onPress={() => navigation.navigate("/")}> 
                <View className={`rounded-full p-3.5 ${pathname === "/" ? "bg-blue-600" : "bg-transparent"}`}>
                    <MaterialIcons name="home" size={28} color={pathname === "/" ? "white" : "black"} />
                </View>
            </TouchableNativeFeedback>

            {/* Media Button */}
            <TouchableNativeFeedback onPress={() => navigation.navigate("/album")}> 
                <View className={`rounded-full p-3.5 ${pathname === "/album" ? "bg-blue-600" : "bg-transparent"}`}>
                    <MaterialIcons name="perm-media" size={28} color={pathname === "/album" ? "white" : "black"} />
                </View>
            </TouchableNativeFeedback>

            {/* Calendar Button */}
            <TouchableNativeFeedback onPress={() => navigation.navigate("/month")}> 
                <View className={`rounded-full p-3.5 ${pathname === "/month" ? "bg-blue-600" : "bg-transparent"}`}>
                    <MaterialIcons name="calendar-month" size={28} color={pathname === "/month" ? "white" : "black"} />
                </View>
            </TouchableNativeFeedback>
        </View>
    );
};
