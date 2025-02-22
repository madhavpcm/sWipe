import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, StyleSheet } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

// Define types
interface MediaAsset {
  id: string;
  filename: string;
  creationTime: number;
  mediaType: 'photo' | 'video';
  uri: string;
}

interface MonthMedia {
  month: string;
  media: MediaAsset[];
}

// Custom hook for paginated media fetching
const usePaginatedMedia = () => {
  const [mediaByMonth, setMediaByMonth] = useState<MonthMedia[]>([]);
  const [monthsFetched, setMonthsFetched] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const monthsToLoad = 5; // Load 5 months at a time

  useEffect(() => {
    fetchNextMonths(); // Load initial data
  }, []);

  // Fetch first 5 images for a given year and month
  const fetchMediaForMonth = async (year: number, month: number): Promise<MediaAsset[]> => {
    const result = await MediaLibrary.getAssetsAsync({
      mediaType: ['photo', 'video'],
      sortBy: [['creationTime', false]], // Newest first
      first: 100, // Fetch more to filter later
    });

    return result.assets
      .filter((asset) => {
        const assetDate = new Date(asset.creationTime);
        return assetDate.getFullYear() === year && assetDate.getMonth() + 1 === month;
      })
      .slice(0, 5) // Only 5 per month
      .map((asset) => ({
        id: asset.id,
        filename: asset.filename,
        creationTime: asset.creationTime,
        mediaType: asset.mediaType as 'photo' | 'video',
        uri: asset.uri,
      }));
  };

  // Fetch the next 5 months of media
  const fetchNextMonths = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission denied');
      setLoading(false);
      return;
    }

    let currentDate = new Date();
    let newMonths: MonthMedia[] = [];

    if (monthsFetched.length > 0) {
      const lastMonth = monthsFetched[monthsFetched.length - 1].split('-');
      currentDate = new Date(parseInt(lastMonth[0]), parseInt(lastMonth[1]) - 1, 1);
    }

    for (let i = 0; i < monthsToLoad; i++) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

      if (monthsFetched.includes(monthKey)) {
        currentDate.setMonth(currentDate.getMonth() - 1);
        continue;
      }

      const media = await fetchMediaForMonth(year, month);
      if (media.length > 0) {
        newMonths.push({ month: monthKey, media });
      }

      setMonthsFetched((prev) => [...prev, monthKey]);
      currentDate.setMonth(currentDate.getMonth() - 1);
    }

    setMediaByMonth((prev) => [...prev, ...newMonths]);
    if (newMonths.length < monthsToLoad) setHasMore(false);
    setLoading(false);
  };

  return { mediaByMonth, fetchNextMonths, loading, hasMore };
};

// **FlatList Component**
const MediaGallery: React.FC = () => {
  const { mediaByMonth, fetchNextMonths, loading, hasMore } = usePaginatedMedia();

  return (
    <FlatList
      data={mediaByMonth}
      keyExtractor={(item) => item.month}
      renderItem={({ item }) => (
        <View style={styles.monthContainer}>
          <Text style={styles.monthText}>📅 {item.month}</Text>
          <FlatList
            data={item.media}
            keyExtractor={(media) => media.id}
            horizontal
            renderItem={({ item: media }) => (
              <Image source={{ uri: media.uri }} style={styles.image} />
            )}
          />
        </View>
      )}
      onEndReached={hasMore ? fetchNextMonths : null}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loading ? <ActivityIndicator size="large" color="blue" /> : null}
    />
  );
};

export default MediaGallery;

// **Styles**
const styles = StyleSheet.create({
  monthContainer: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  image: {
    width: 80,
    height: 80,
    margin: 5,
    borderRadius: 8,
  },
});
