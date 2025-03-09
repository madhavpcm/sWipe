import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { format } from 'date-fns';
import React from 'react';
import { getMediaByMonth } from '@/util/MediaUtil';
import { SwipeScreenComponent } from '@/components/swiper/SwipeScreenComponent';

export default function SwipeScreen() {
  const { monthYear } = useLocalSearchParams<{monthYear: string}>();
  const [mediaAssets, setMediaAssets] = useState<MediaLibrary.Asset[]>([]);


  useEffect(() => {
    const loadAssets = async () => {
      console.debug("Month Year: ", monthYear)

      if(monthYear == null || monthYear ===""){
        return
      }
      try {

        const media = await getMediaByMonth(monthYear)

        // Filter assets for the selected month
        const monthAssets = media.assets.filter(asset => {
          const assetDate = new Date(asset.creationTime);
          // need only month year like February 2025
          const assetMonth = format(assetDate, 'MMMM yyyy');
          return assetMonth.trim() === monthYear.trim();
        });

        console.debug(`Found ${monthAssets.length} assets for ${monthYear}`);
        setMediaAssets(monthAssets);
      } catch (error) {
        console.error('Error loading assets:', error);
      }
    };

     loadAssets();
  }, [monthYear]);

  return (

    <View className="flex-1 bg-white p-4">
      <SwipeScreenComponent mediaAssets={mediaAssets} month={monthYear}/>
    </View>
  );
}
