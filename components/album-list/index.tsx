import { View, FlatList, Text, TouchableNativeFeedback } from 'react-native';
import { Title } from '../common/title';
import React, { useCallback, useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { getImageCountByAlbumName } from '@/common/lib/swipeandroid/SwipeAndroidLibary';
import { useFocusEffect, useRouter } from 'expo-router';
import {
    AlbumMediaData,
    SwipeScreenKeyType,
} from '@/common/types/SwipeMediaTypes';
import LocalStorageStore from '@/common/lib/localstorage/LocalStorageStore';
import { convertDateToRelativeTimeString } from '@/util/DateUtil';

const getOngoingListData = async (): Promise<Array<OngoingListDataType>> => {
    try {
        console.debug('get ongoing list at album');
        const dataCountByMonthSorted: AlbumMediaData[] =
            await getImageCountByAlbumName();
        console.debug('dataCountByMonthSorted:', dataCountByMonthSorted);
        // in the same sorted order transform this to OngoingListDataType
        const transformedData: OngoingListDataType[] = await Promise.all(
            dataCountByMonthSorted.map(async (item) => {
                const doesMetadataExist =
                    await LocalStorageStore.checkIfMetadataExists(
                        item.album,
                        SwipeScreenKeyType.ALBUM
                    );
                var progress = 0;
                var lastAccessed = 0;
                if (doesMetadataExist) {
                    const metadata = await LocalStorageStore.getMetadataOnly(
                        item.album,
                        SwipeScreenKeyType.ALBUM
                    );
                    progress = metadata.getProgress();
                    lastAccessed = metadata.getLastAccessed();
                }
                return {
                    name: item.album,
                    type: 'Album',
                    progress,
                    dateString: convertDateToRelativeTimeString(
                        lastAccessed ? new Date(lastAccessed) : null
                    ),
                };
            })
        );

        return transformedData;
    } catch (error) {
        console.error('Failed to get ongoing list at album:', error);
        return [];
    }
};

const AlbumList = () => {
    const router = useRouter();

    // use state
    const [data, setData] = useState<Array<OngoingListDataType>>([]);

    // use effect fetch data
    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                const localData = await getOngoingListData();
                setData(localData);
                console.debug('set ongoing list at album:', localData);
            };
            fetchData();
        }, [])
    );

    const CircularProgress = ({
        progress,
        size,
        strokeWidth,
    }: {
        progress: number;
        size: number;
        strokeWidth: number;
    }) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset =
            circumference * (1 - Math.max(0, Math.min(progress, 1))); // Ensuring valid range

        return (
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background Circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#1D4ED84D" // Light gray for background
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress Circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#2563eb" // Dark blue for progress
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset} // Corrected calculation
                    fill="none"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`} // Fixes start position to top
                />
            </Svg>
        );
    };
    // define a type for item
    const renderItem = ({
        item,
        index,
    }: {
        item: OngoingListDataType;
        index: number;
    }) => (
        <TouchableNativeFeedback
            onPress={() => {
                //  router.navigate({ pathname: `/swipe/${item.name}`,params:{ monthYear: item.name } });
                // router.push(`/swipe/${item.name}`);
                // pass two dynamic rountes /swipe/:type/:monthYear
                // router push screen
                console.debug('navigating to swipe screen with params:', item);
                router.push(`/(root)/${SwipeScreenKeyType.ALBUM}/${item.name}`);
            }}
        >
            <View className="flex-row justify-between p-3 border-b border-gray-200">
                <View className="flex flex-row gap-4 items-center">
                    {/* Circular Progress Around Icon */}
                    <View className="relative">
                        <CircularProgress
                            progress={item.progress}
                            size={56}
                            strokeWidth={6}
                        />
                        <View className="absolute inset-0 flex justify-center items-center">
                            {item.type === 'Month' ? (
                                <MaterialIcons
                                    name="calendar-month"
                                    size={24}
                                    color={'#2563eb'}
                                />
                            ) : (
                                <MaterialIcons
                                    name="perm-media"
                                    size={24}
                                    color={'#2563eb'}
                                />
                            )}
                        </View>
                    </View>

                    {/* Text Content */}
                    <View className="flex flex-col">
                        <Text className="font-rubik-medium text-gray-800 text-xl">
                            {item.name}
                        </Text>
                        <Text className="text-base text-gray-400">
                            {item.dateString}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableNativeFeedback>
    );

    return (
        <View className="flex-1 px-5 mt-12">
            <View className="flex flex-row justify-between border-b-2  border-gray-200 border-dashed pb-1">
                <Title
                    text="Ongoing Albums"
                    subtitle="Pickup where you left off"
                />
            </View>
            <View className="mt-3 h-[400px]">
                <FlatList
                    className=" "
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{ paddingBottom: 175 }}
                />
            </View>
        </View>
    );
};

export default AlbumList;
