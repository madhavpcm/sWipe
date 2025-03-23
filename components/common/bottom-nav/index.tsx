import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter, usePathname } from "expo-router";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const PRIMARY_COLOR = "#2563eb";
const SECONDARY_COLOR = "#fff";

export const BottomNav = () => {
  const navigation = useRouter();
  const pathname = usePathname();

  const tabs: { name: string; route: "/" | "/album" | "/month"; icon: "home" | "perm-media" | "calendar-month" }[] = [
    { name: "Home", route: "/", icon: "home" },
    { name: "Albums", route: "/album", icon: "perm-media" },
    { name: "Timeline", route: "/month", icon: "calendar-month" },
  ];

  return (
    <LinearGradient 
      colors={["#2563eb", "#1e3a8a"]} 
      style={styles.container}
    >
      {tabs.map((tab) => {
        const isFocused = pathname === tab.route;

        const onPress = () => {
          if (!isFocused) {
            navigation.navigate(tab.route);
          }
        };

        return (
          <AnimatedTouchableOpacity
            key={tab.route}
            onPress={onPress}
            layout={LinearTransition.springify().mass(0.5)}
            style={[styles.tabItem, { backgroundColor: isFocused ? SECONDARY_COLOR : "transparent" }]}
          >
            <MaterialIcons name={tab.icon} size={28} color={isFocused ? PRIMARY_COLOR : SECONDARY_COLOR} />
            {isFocused && (
              <Animated.Text entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.text}>
                {tab.name}
              </Animated.Text>
            )}
          </AnimatedTouchableOpacity>
        );
      })}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
    alignSelf: "center",
    bottom: 40,
    borderRadius: 40,
    paddingHorizontal: 12,
    paddingVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  tabItem: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 36,
    paddingHorizontal: 13,
    borderRadius: 30,
  },
  text: {
    color: PRIMARY_COLOR,
    marginLeft: 8,
    fontWeight: "500",
  },
});
