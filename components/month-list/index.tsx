import { View, Text, FlatList, Image, ImageSourcePropType } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getMonthNameFromOneBasedIndex } from '@/util/DateUtil';
import { getImageCountByMonthYear } from '@/util/SwipeAndroidLibary';
import images from '@/constants/images';
import { MediaData, MediaListDataType } from '@/common/types/SwipeMediaTypes';
import { getAllActionTrieKeys, loadTrieFromAsycStorage } from '@/util/AsyncStorageUtil';

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
    const [monthListData, setMonthListData] = useState<MediaListDataType[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            // from async storage get all keys
            const actionTrieKeys = await getAllActionTrieKeys();
            console.debug("actionTrieKeys:", actionTrieKeys);
            const data: MediaListDataType[] = await Promise.all(actionTrieKeys.map(async (key) => {
                // load action trie for key
                const actionTrie = await loadTrieFromAsycStorage(key);
                console.debug("actionTrie:", actionTrie);
                if (!actionTrie) {
                    console.error("No action trie found for key:", key);
                    throw Error(`No action trie found for key: ${key}`);
                }
                // remove -action-trie from name
                const name = actionTrie.name.replace('-action-trie', '');
                // convert bytes to mb
                const totalSize = actionTrie.getDeletedMediaSize() / (1024 * 1024);
                return {
                    name,
                    type: "Month",
                    progress: actionTrie.getProgress(),
                    dateObj: new Date(actionTrie.getLastAccessed()), // for sorting
                    itemCount: actionTrie.getDeletedCount(), // assuming count exists in MediaData
                    totalSize,
                    thumbnail: images.newYork,
                }
            }));

            setMonthListData(data);
        };

        fetchData();
        console.debug("time line use effect called")
    }, []); // Removed monthListData from dependency array

    const renderItem = ({ item }: { item: MediaListDataType }) => {
        const isInProgress = item.progress <1;
    
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
                        {item.itemCount} items cleaned
                    </Text>
                    <Text className={`text-xs ${isInProgress ? 'text-blue-100' : 'text-blue-600'}`}>
                        {item.totalSize.toFixed(2)} MB freed
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
