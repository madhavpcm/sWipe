import React from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { Asset } from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';

interface TinderSwiperProps {
  data: Asset[];
}

const { width, height } = Dimensions.get('window');

export const TinderSwiper = ({ data }: TinderSwiperProps) => {
  return (
    <View className="flex-1 bg-white">
      <Swiper
        cards={data}
        renderCard={(card) => {
          if (!card) return null;
          return (
            <View className="bg-white rounded-xl overflow-hidden shadow-lg" style={{ height: height * 0.6 }}>
              <Image
                source={{ uri: card.uri }}
                className="w-full h-full"
                resizeMode="cover"
              />
              {card.mediaType === 'video' && (
                <View className="absolute right-4 top-4 bg-black/50 rounded-full p-2">
                  <Ionicons name="play-circle" size={24} color="white" />
                </View>
              )}
              <View className="absolute bottom-0 w-full bg-black/30 p-4">
                <Text className="text-white text-lg font-medium">
                  {new Date(card.creationTime).toLocaleDateString()}
                </Text>
                <Text className="text-white/80 text-sm">
                  {card.filename}
                </Text>
              </View>
            </View>
          );
        }}
        onSwipedLeft={(cardIndex) => {
          console.log(`Swiped left on card ${cardIndex}`);
          // Handle delete
        }}
        onSwipedRight={(cardIndex) => {
          console.log(`Swiped right on card ${cardIndex}`);
          // Handle keep
        }}
        cardIndex={0}
        backgroundColor="white"
        stackSize={3}
        stackSeparation={15}
        overlayLabels={{
          left: {
            title: 'DELETE',
            style: {
              label: {
                backgroundColor: 'red',
                color: 'white',
                fontSize: 24,
                borderRadius: 4,
                padding: 10,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                marginTop: 30,
                marginLeft: -30,
              },
            },
          },
          right: {
            title: 'KEEP',
            style: {
              label: {
                backgroundColor: 'green',
                color: 'white',
                fontSize: 24,
                borderRadius: 4,
                padding: 10,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                marginTop: 30,
                marginLeft: 30,
              },
            },
          },
        }}
      />
    </View>
  );
};