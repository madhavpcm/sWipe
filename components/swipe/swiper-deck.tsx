import { View, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import React from 'react';
import SwipeCard from './swipe-card';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Button from '../common/button';
import { SwipeComponentInputType } from '@/common/types/SwipeMediaTypes';

// Define a style object for the 3D shadow effect
const shadow3d = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
};

const SwiperDeck = ({
    mediaAssets,
    swipeKey,
    screenKeyType,
    reloadAssets,
}: SwipeComponentInputType) => {
    return (
        <View className="flex-1">
            <View className="flex-1 bg-transparent z-10">
                <Swiper
                    containerStyle={{
                        backgroundColor: 'transparent',
                    }}
                    cards={mediaAssets}
                    stackSize={5}
                    cardIndex={0}
                    disableTopSwipe
                    disableBottomSwipe
                    animateCardOpacity={true}
                    renderCard={(item) => <SwipeCard item={item} />}
                />
            </View>
            {/* Uncomment the button below if needed */}
            {/* <View className='w-full z-50'>
        <Button
          size='sm'
          borderRadius={30}
          title='Delete (5)'
          className='mx-auto'
          onPress={() => console.log('pressed')}
        />
      </View> */}
            <View className="h-1/3 flex flex-row items-center justify-around z-50">
                <TouchableOpacity
                    style={shadow3d}
                    className="h-20 w-20 rounded-full bg-gray-50 flex justify-center items-center border border-gray-100"
                >
                    <MaterialCommunityIcons
                        name="delete"
                        color={'red'}
                        size={25}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={shadow3d}
                    className="h-20 w-20 rounded-full bg-gray-50 flex justify-center items-center border border-gray-100"
                >
                    <MaterialCommunityIcons
                        name="undo"
                        color={'blue'}
                        size={25}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={shadow3d}
                    className="h-20 w-20 rounded-full bg-gray-50 flex justify-center items-center border border-gray-100"
                >
                    <MaterialIcons name="done-all" color={'blue'} size={25} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={shadow3d}
                    className="h-20 w-20 rounded-full bg-gray-50 flex justify-center items-center border border-gray-100"
                >
                    <MaterialCommunityIcons
                        name="check"
                        color={'green'}
                        size={25}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default SwiperDeck;
