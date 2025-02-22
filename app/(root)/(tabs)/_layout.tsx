// import { Tabs } from "expo-router";
// import { MaterialIcons } from '@expo/vector-icons';

// export default function TabsLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarStyle: {
//           backgroundColor: '#fff',
//           borderTopWidth: 1,
//           borderTopColor: '#eee',
//         },
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Home',
//           headerShown: true,
//           headerTitle: "Sorting Hat",
//           headerTransparent: true,
//           headerStyle: {
//             backgroundColor: 'transparent',
//           },
//           headerTitleStyle: {
//             fontFamily: 'Rubik-Medium',
//             fontSize: 32,
//             color: '#1a1a1a',
//             letterSpacing: -1,
//           },
//           headerTitleAlign: 'left',
//           tabBarIcon: ({ color }) => (
//             <MaterialIcons name="home" size={24} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="swipe"
//         options={{
//           title: 'Sort',
//           tabBarIcon: ({ color }) => (
//             <MaterialIcons name="sort" size={24} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="explore"
//         options={{
//           href: null,
//         }}
//       />
//       <Tabs.Screen
//         name="profile"
//         options={{
//           href: null,
//         }}
//       />
//     </Tabs>
//   );
// }
