import { View, Text, TouchableOpacity } from 'react-native';
import React, { useCallback, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { Svg, Circle } from 'react-native-svg';
import * as FileSystem from 'expo-file-system';
import { getMediaSizeByCategory } from '@/common/lib/swipeandroid/SwipeAndroidLibary';

const PieChart = ({ percentage }: { percentage: number }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <View className="relative left-2 top-2">
            <Svg height="100" width="100" viewBox="0 0 100 100">
                <Circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#1e3a8a"
                    strokeWidth="10"
                    fill="transparent"
                />
                <Circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="#ffffff"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                />
            </Svg>
            <View className="absolute inset-0 flex justify-center items-center">
                <Text className="text-white font-bold text-lg">
                    {percentage}%
                </Text>
            </View>
        </View>
    );
};

export const Banner = () => {
    const router = useRouter();
    const [percentage, setPercentage] = useState<number>(0);

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                const totalStorageUsedByCategory =
                    await getMediaSizeByCategory();
                const totalStorageUsed =
                    totalStorageUsedByCategory.images +
                    totalStorageUsedByCategory.videos +
                    totalStorageUsedByCategory.audio +
                    totalStorageUsedByCategory.gifs;
                const totalDeviceStorage =
                    await FileSystem.getTotalDiskCapacityAsync();
                setPercentage((totalStorageUsed / totalDeviceStorage) * 100);
            };
            fetchData();
        }, [])
    );

    return (
        <LinearGradient
            colors={['#2563eb', '#1e3a8a']}
            className="h-56 w-[92%] mx-auto rounded-2xl relative overflow-hidden shadow-xl flex justify-center items-center p-6"
        >
            <View className="flex flex-row justify-start items-center w-full h-full gap-x-8 ml-8 ">
                <PieChart percentage={Number(percentage.toFixed(2))} />

                <Text className="text-gray-100 text-lg font-medium  ">
                    Storage Used
                </Text>
            </View>

            <TouchableOpacity
                className="absolute bottom-5 right-5 flex flex-row items-center bg-white/30 px-4 py-2 rounded-full backdrop-blur-lg shadow-md"
                onPress={() => router.push('/(root)/stats')}
            >
                <Text className="text-white text-base font-semibold">
                    View Stats
                </Text>
                <MaterialIcons
                    name="chevron-right"
                    color="white"
                    size={22}
                    className="ml-2"
                />
            </TouchableOpacity>
        </LinearGradient>
    );
};
