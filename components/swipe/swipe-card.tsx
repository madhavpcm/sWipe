import { View, Text, Image, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';
import { ResizeMode, Video } from 'expo-av';
import { AssetType } from '@/common/lib/localstorage/types/LocalStorageTypes';

const SwipeCard = ({
    item,
    index,
    totalCount,
}: {
    item: AssetType;
    index: number;
    totalCount: number;
}) => {
    const fadeAnim = useSharedValue(0);
    const [showMetadata, setShowMetadata] = useState(false);

    const toggleMetadata = () => {
        setShowMetadata(!showMetadata);
        fadeAnim.value = withTiming(showMetadata ? 0 : 1, { duration: 300 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: fadeAnim.value,
    }));

    // Get file format from filename or URI
    const getFileFormat = (filename?: string) => {
        if (!filename) return 'Unknown';
        const parts = filename.split('.');
        return parts.length > 1 ? parts.pop()?.toUpperCase() : 'Unknown';
    };

    const fileFormat = getFileFormat(item?.filename || item?.uri);
    const resolutionText = 'Unknown';
    item?.width && item?.height ? `${item.width} x ${item.height}` : 'Unknown';

    return (
        <View className="flex-1 flex flex-col p-2">
            <View className="h-2/3 rounded-2xl overflow-hidden relative">
                {item?.mediaType === 'photo' ? (
                    <Image
                        source={{ uri: item?.uri }}
                        className="h-full w-full"
                        resizeMode="cover"
                    />
                ) : (
                    <Video
                        source={{ uri: item?.uri }}
                        style={{ width: '100%', height: '100%' }}
                        shouldPlay
                        resizeMode={ResizeMode.COVER}
                        isMuted
                        isLooping
                    />
                )}

                {/* More Metadata Button */}
                <TouchableOpacity
                    onPress={toggleMetadata}
                    className="absolute top-4 right-4 bg-black/50 p-2 rounded-full"
                >
                    <MaterialIcons name="info" size={24} color="white" />
                </TouchableOpacity>

                {/* Full Screen View Button */}
                <TouchableOpacity
                    onPress={() => console.log('View Full Screen')}
                    className="absolute top-4 left-4 bg-black/50 p-2 rounded-full"
                >
                    <MaterialIcons name="fullscreen" size={24} color="white" />
                </TouchableOpacity>

                {/* Fading Metadata */}
                <Animated.View
                    style={[
                        animatedStyle,
                        {
                            position: 'absolute',
                            top: 52,
                            right: 30,
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            padding: 10,
                            borderRadius: 10,
                        },
                    ]}
                >
                    <Text className="text-white text-sm">
                        Resolution: {resolutionText}
                    </Text>
                    <Text className="text-white text-sm">
                        Date:{' '}
                        {item?.creationTime
                            ? new Date(item.creationTime * 1000).toDateString()
                            : 'Unknown'}
                    </Text>
                    <Text className="text-white text-sm">
                        Location: {item?.location?.latitude || 'Unknown'}
                    </Text>
                    <Text className="text-white text-sm">
                        Format: {fileFormat}
                    </Text>
                </Animated.View>

                {/* Gradient Overlay */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '40%',
                    }}
                />

                {/* Text Details */}
                <View className="absolute bottom-4 left-4 right-4 flex flex-row items-center justify-around">
                    <View className="flex flex-row items-center">
                        <MaterialIcons
                            name="photo-size-select-large"
                            size={20}
                            color="white"
                        />
                        <Text className="text-white text-base font-rubik-bold ml-1">
                            {resolutionText}
                        </Text>
                    </View>
                    <View className="flex flex-row items-center">
                        <MaterialCommunityIcons
                            name="progress-alert"
                            size={20}
                            color="white"
                        />
                        <Text className="text-md font-rubik-bold text-white ml-1">
                            {index + 1}/{totalCount}
                        </Text>
                    </View>
                    <View className="flex flex-row items-center">
                        <MaterialIcons name="image" size={20} color="white" />
                        <Text className="text-white text-md font-rubik-bold ml-1">
                            {fileFormat}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default SwipeCard;
