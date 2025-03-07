import React from "react";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { BottomNav } from "@/components/common/bottom-nav";

export default function TabLayout() {
    return (
        <View className="flex-1">
            {/* Expo Router's Tab Navigator */}
          
            <Tabs screenOptions={{ headerShown: false,tabBarStyle:{display:"none"} }}>
                <Tabs.Screen name="/" />
                <Tabs.Screen name="album" />
                <Tabs.Screen name="month" />
            </Tabs>

            {/* Custom Bottom Navigation */}
            <BottomNav />
        </View>
    );
}
