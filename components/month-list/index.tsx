import { View, Text, FlatList,Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getMonthNameFromOneBasedIndex } from '@/util/DateUtil';
import { getImageCountByMonthYear } from '@/util/SwipeAndroidLibary';
import images from '@/constants/images';
import { MediaData, MediaListDataType } from '@/common/types/SwipeMediaTypes';

const MonthList = () => {
    const [monthListData, setMonthListData] = useState<MediaListDataType[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const dataCountByMonthSorted: MediaData[] = await getImageCountByMonthYear();

            const transformedData: MediaListDataType[] = dataCountByMonthSorted.map((item, index) => ({
                name: `${getMonthNameFromOneBasedIndex(item.month)} ${item.year}`,
                type: "Month",
                inProgress: Math.random() < 0.5, // Random boolean
                dateObj: new Date(), // for sorting
                itemCount: item.count, // assuming count exists in MediaData
                totalSize: item.count, // assuming count represents size
                thumbnail: images.newYork,
            }));

            setMonthListData(transformedData);
        };

        fetchData();
    }, []); // Removed monthListData from dependency array

    const renderItem = ({ item }: { item: MediaListDataType }) => {
        const isInProgress = item.inProgress;
    
        return (
            <View
                className={`p-4 m-2 rounded-2xl shadow-md flex-row items-center ${
                    isInProgress ? 'bg-blue-600' : 'bg-white border border-blue-300'
                }`}
            >
                {/* Thumbnail Image */}
                <Image source={ item.thumbnail } className="w-14 h-14 rounded-lg mr-4" />
    
                {/* Text Info */}
                <View className="flex-1">
                    <Text className={`text-lg font-semibold ${isInProgress ? 'text-white' : 'text-blue-600'}`}>
                        {item.name}
                    </Text>
                    <Text className={`text-sm ${isInProgress ? 'text-blue-200' : 'text-blue-400'}`}>
                        {item.itemCount} items
                    </Text>
                    <Text className={`text-xs ${isInProgress ? 'text-blue-100' : 'text-blue-600'}`}>
                        {item.totalSize} MB
                    </Text>
                </View>
    
                {/* In Progress Badge (Only shows if true) */}
                {isInProgress && (
                    <Text className="px-3 py-1 text-xs font-bold text-blue-600 bg-white rounded-full">
                        In Progress
                    </Text>
                )}
            </View>
        );
    };
    return (
        <View>
            <FlatList
                data={monthListData}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={<Text className="text-center text-gray-400">No data available</Text>}
            />
        </View>
    );
};

export default MonthList;
