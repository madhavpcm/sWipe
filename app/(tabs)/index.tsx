import { Link, router, useLocalSearchParams } from 'expo-router';

import {
    Text,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    SafeAreaView,
    StyleSheet,
    ToastAndroid,
    Linking,
    NativeModules,
} from 'react-native';
import images from '@/constants/images';
import icons from '@/constants/icons';
import FlatBoard from 'react-native-flatboard';
import { useFonts } from 'expo-font';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import * as FileSsystem from 'expo-file-system';
import { format } from 'date-fns';
import Header from '@/components/common/Header';
import Button from '@/components/common/button';
import { PermissionsAndroid, Platform } from 'react-native';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Banner } from '@/components/home/banner';
import { OngoingList } from '@/components/ongoing-list';

const requestStoragePermission = async () => {
    let permissions = [
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        // PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
    ];

    const platformVersion = Number(Platform.Version);

    if (Platform.OS === 'android') {
        try {
            if (platformVersion < 33) {
                // Android 12 and below
                permissions = permissions.concat([
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                ]);
            }
            const granted =
                await PermissionsAndroid.requestMultiple(permissions);

            console.log('Permissions result:', granted);
        } catch (err) {
            console.warn(err);
        }
    }
};
interface StorageInfo {
    totalSpace: string;
    freeSpace: string;
    usedSpace: string;
}

interface MediaGroup {
    title: string;
    data: MediaLibrary.Asset[];
}

export default function Index() {
    const onboardData = [
        {
            id: 1,
            title: 'Welcome to SwipeTrash',
            description: 'Have fun organizing your Gallery',
            icon: images.slide_2,
        },
        {
            id: 2,
            title: 'Just Swipe Left or Right',
            description: 'Swipe Left to delete and Right to keep',
            icon: images.slide_1,
        },
        {
            id: 3,
            title: "Can't Decide?",
            description: 'Put em head to head !',
            icon: images.slide_3,
        },
    ];

    const [isGranted, setisGranted] = useState(false);

    useEffect(() => {
        const checkPermissions = async () => {
            await requestStoragePermission();
            const { status } = await MediaLibrary.getPermissionsAsync();
            if (status === 'granted') {
                console.log('Permission granted for expo');
                setisGranted(true);
            } else {
                setisGranted(false);
                console.log('Permission denied');
            }
        };
        checkPermissions();
    }, []);

    if (!isGranted) {
        return (
            <View style={{ flex: 1 }} className="">
                <Text className="text-center text-gray-400 mt-6 ">
                    Please grant permissions to use this app
                </Text>
            </View>
        );
    }
    return (
        <View style={{ flex: 1 }} className="">
            <View className="flex-1 bg-white font-rubik">
                <Banner />
                <OngoingList />
            </View>
        </View>
    );
}
