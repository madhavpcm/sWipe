import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import React from 'react';
import { getMediaByAlbum, getMediaByMonth } from '@/util/MediaUtil';
import { SwipeScreenKeyType } from '@/common/types/SwipeMediaTypes';
import SwiperDeck from '@/components/swipe/swiper-deck';
import { AssetType } from '@/common/lib/localstorage/types/LocalStorageTypes';
import { getAssetSize } from '@/util/ExpoFileUtil';
import { SwipeScreenComponent } from '@/components/swiper/SwipeScreenComponent';

export default function SwipeScreen() {
    const { screenKey, screenKeyType } = useLocalSearchParams<{
        screenKey: string;
        screenKeyType: string;
    }>();
    const [mediaAssets, setMediaAssets] = useState<AssetType[]>([]);

    const loadAssets = async (): Promise<void> => {
        console.debug('Screen Key: ', screenKey);

        if (screenKey == null || screenKey === '') {
            console.error('Invalid screen key');
            return;
        }
        try {
            const expoMedia =
                screenKeyType === SwipeScreenKeyType.MONTH.toString()
                    ? await getMediaByMonth(screenKey)
                    : screenKeyType === SwipeScreenKeyType.ALBUM.toString()
                      ? await getMediaByAlbum(screenKey)
                      : null;

            if (!expoMedia) {
                console.error('Error loading assets: ', expoMedia);
                return;
            }

            const media: AssetType[] = await Promise.all(
                expoMedia.assets.map(async (asset, index) => ({
                    index: index,
                    uri: asset.uri,
                    albumId: asset.albumId,
                    creationTime: asset.creationTime,
                    assetSize: (await getAssetSize(asset.uri)) || 0,
                }))
            );

            console.debug(`Found ${media.length} assets for ${screenKey}`);
            setMediaAssets(media);
        } catch (error) {
            console.error('Error loading assets:', error);
        }
    };

    useEffect(() => {
        loadAssets();
    }, [screenKey]);

    return (
        <View className="flex-1 bg-white p-4">
            <SwipeScreenComponent
                mediaAssets={mediaAssets}
                swipeKey={screenKey}
                screenKeyType={
                    screenKeyType == 'month'
                        ? SwipeScreenKeyType.MONTH
                        : SwipeScreenKeyType.ALBUM
                }
                reloadAssets={loadAssets}
            />
        </View>
    );
}
