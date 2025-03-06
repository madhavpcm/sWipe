import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { format } from 'date-fns';
import React from 'react';
import { getMediaByMonth } from '@/util/MediaUtil';
import { SwipeScreenComponent } from '@/components/swiper/SwipeScreenComponent';


export default function SwipeScreen() {
  const { month } = useLocalSearchParams<{month: string}>();
  const [mediaAssets, setMediaAssets] = useState<MediaLibrary.Asset[]>([]);

  useEffect(() => {
    const loadAssets = async () => {
      if(month == null || month ===""){
        return
      }
      console.log("Month : ", month)
      try {
      
        const media = await getMediaByMonth(month)

        // Filter assets for the selected month
        const monthAssets = media.assets.filter(asset => {
          const assetDate = new Date(asset.creationTime);
          // need only month year like February 2025
          const assetMonth = format(assetDate, 'MMMM yyyy');

          console.log(assetMonth, month);
          
          return assetMonth.trim() === month.trim();
        });

        console.log(`Found ${monthAssets.length} assets for ${month}`);
        setMediaAssets(monthAssets);
      } catch (error) {
        console.error('Error loading assets:', error);
      }
    };

     loadAssets();
  }, [month]);

  return (

    <View className="flex-1 bg-white p-4">
      <SwipeScreenComponent mediaAssets={mediaAssets} month={month}/>
    </View>
  );
}
