import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { format } from 'date-fns';
import { SwipeScreenComponent } from '@/components/screens/SwipeScreenComponent';
import { TinderSwipe } from '@/components/TinderSwipe';
import React from 'react';

async function getMediaByMonth(monthString: string) {
  const [monthName, year] = monthString.split(' ');
  // create object of month index manually
  const monthMap: Record<string, number>  = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3,
    'May': 4, 'June': 5, 'July': 6, 'August': 7,
    'September': 8, 'October': 9, 'November': 10, 'December': 11
  };
  
  const monthIndex = monthMap[monthName] // Get month index (0-based)
  console.log("year: ", Number(year))
  console.log("monthIndex: ", Number(monthIndex))
  const startDate = new Date(Number(year), Number(monthIndex));
  const endDate = new Date(Number(year), Number(monthIndex + 1)); // First day of next month
  console.log("createdBefore : ", startDate.toString(), "createdBefore : ", endDate.toString())

  const media = await MediaLibrary.getAssetsAsync({
    mediaType: ['photo', 'video'],
    sortBy: ['creationTime'],
    createdAfter: startDate,
    createdBefore: endDate,
    // first: 1000 // Adjust as needed
  });

  return media;
}

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
  //   <>
  //   <TinderSwipe month={month} mediaAssets = {mediaAssets } />
  // </>
    <View className="flex-1 bg-white p-4">
      
      <SwipeScreenComponent mediaAssets={mediaAssets} month={month}/>
    </View>
  );
}
