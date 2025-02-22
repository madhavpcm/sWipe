import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Header() {
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={{ paddingTop: insets.top }} 
      className="bg-white border-b border-gray-100"
    >
      <StatusBar barStyle="dark-content" />
      <View className="flex-row justify-between items-center px-4 h-14">
        <View className="flex-row items-center gap-2">
          <Text className="text-2xl font-semibold text-gray-900">
            Swipe
            <Text className="text-blue-500">Trash</Text>
          </Text>
        </View>
        
        <TouchableOpacity 
          className="p-2 rounded-full bg-gray-50"
          activeOpacity={0.7}
        >
          <Ionicons name="information-circle-outline" size={22} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
} 