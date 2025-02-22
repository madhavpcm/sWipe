import { Stack } from "expo-router";
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Layout() {
  const router = useRouter();
  return (
    <Stack 
      screenOptions={{
        headerTransparent: true,
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerTitleStyle: {
          fontFamily: 'Rubik-Medium',
          fontSize: 32,
          color: '#1a1a1a',
          letterSpacing: -1,
        },
        headerTitleAlign: 'left',
        headerLeftContainerStyle: {
          paddingLeft: 20,
        },
        headerRightContainerStyle: {
          paddingRight: 20,
        },
        headerRight: () => (
          <TouchableOpacity
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => {
              const selectedImages: string[] = [];
              router.push('/swipe');
            }}
          >
            <Ionicons name="sync-outline" size={22} color="#1a1a1a" />
          </TouchableOpacity>
        ),
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="(tabs)"
        options={{
          headerTitle: "Sorting Hat",
          headerTitleStyle: {
            fontFamily: 'Rubik-Medium',
            fontSize: 32,
            color: '#1a1a1a',
            letterSpacing: -1,
          },
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="swipe"
        options={{
          headerTitle: '',
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
