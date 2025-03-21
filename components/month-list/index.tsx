import { View, Text, FlatList, Image, ImageSourcePropType } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getMonthNameFromOneBasedIndex } from '@/util/DateUtil';
import { getImageCountByMonthYear } from '@/util/SwipeAndroidLibary';
import images from '@/constants/images';
import { MediaData } from '@/common/types/SwipeMediaTypes';

type MonthListDataType = {
    name: string;
    type: string;
    inProgress: boolean;
    dateObj: Date;
    itemCount: number;
    totalSize: number;
    thumbnail: ImageSourcePropType;
};

const MonthList = () => {
    const [monthListData, setMonthListData] = useState<MonthListDataType[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const dataCountByMonthSorted: MediaData[] = await getImageCountByMonthYear();

            const transformedData: MonthListDataType[] = dataCountByMonthSorted.map((item, index) => ({
                name: `${getMonthNameFromOneBasedIndex(item.month)} ${item.year}`,
                type: "Month",
                inProgress: Math.random() < 0.5, // Random boolean
                dateObj: new Date(), // for sorting
                itemCount: item.count, // assuming count exists in MediaData
                totalSize: item.count, // assuming count represents size
                thumbnail: images.newYork as ImageSourcePropType,
            }));

            setMonthListData(transformedData);
        };

        fetchData();
    }, []); // Removed monthListData from dependency array

    const renderItem = ({ item }: { item: MonthListDataType }) => {
        const isInProgress = item.inProgress;
    
        return (
            <View
                className={`p-4 m-2 rounded-2xl shadow-md flex-row items-center ${
                    isInProgress ? 'bg-blue-600' : 'bg-white border border-blue-300'
                }`}
            >
                {/* Thumbnail Image */}
                <Image source={item.thumbnail} className="w-14 h-14 rounded-lg mr-4" />
    
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
                ListEmptyComponent={<Text className="text-center text-gray-400 mt-6 ">Nothing here, Click a pic or two!</Text>}
            />
        </View>
        
    );
};

export default MonthList;
