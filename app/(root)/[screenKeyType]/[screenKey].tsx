import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { format } from 'date-fns';
import React from 'react';
import { getMediaByAlbum, getMediaByMonth } from '@/util/MediaUtil';
import { SwipeScreenComponent } from '@/components/swiper/SwipeScreenComponent';
import { SwipeScreenKeyType } from '@/common/types/SwipeMediaTypes';
import SwiperDeck from '@/components/swipe/swiper-deck';

export default function SwipeScreen() {
  const { screenKey, screenKeyType } = useLocalSearchParams<{ screenKey: string, screenKeyType: string }>();
  const [mediaAssets, setMediaAssets] = useState<MediaLibrary.Asset[]>([]);


  useEffect(() => {
    const loadAssets = async () => {
      console.debug("Screen Key: ", screenKey)

      if(screenKey == null || screenKey ===""){
        return
      }
      try {

        const media = (screenKeyType === SwipeScreenKeyType.MONTH.toString())? await getMediaByMonth(screenKey): (screenKeyType === SwipeScreenKeyType.ALBUM.toString())? await getMediaByAlbum(screenKey): null

        if(!media){
          console.error('Error loading assets: ', media)
          return
        }


        console.debug(`Found ${media.assets.length} assets for ${screenKey}`);
        setMediaAssets(media.assets);
      } catch (error) {
        console.error('Error loading assets:', error);
      }
    };

     loadAssets();
  }, [screenKey]);

  return (

    <View className="flex-1 bg-white">
      {/* <SwipeScreenComponent mediaAssets={mediaAssets} month={screenKey} screenKeyType={screenKeyType}/> */}
      <SwiperDeck
      items={mediaAssets}
      />
      
    </View>
  );
}
