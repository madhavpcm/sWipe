import { SwipeScreen } from '../../../src/screens/SwipeScreen';
import { useNavigation } from 'expo-router';
import { useEffect } from 'react';

export default function SwipePage() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  return <SwipeScreen />;
}
