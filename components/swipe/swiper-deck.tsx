import {
    View,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Text,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import SwipeCard from './swipe-card';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import {
    SwipeActionType,
    SwipeComponentInputType,
    SwipeScreenKeyType,
} from '@/common/types/SwipeMediaTypes';
import { AssetType } from '@/common/lib/localstorage/types/LocalStorageTypes';
import LocalStorage from '@/common/lib/localstorage/lib/LocalStorage';
import { useFocusEffect } from 'expo-router';
import { TrieEntryType } from '@/common/lib/localstorage/types/TrieTypes';
import { getAssetsSize } from '@/util/ExpoFileUtil';
import { deleteMedia } from '@/common/lib/swipeandroid/SwipeAndroidLibary';
import LocalStorageStore from '@/common/lib/localstorage/LocalStorageStore';
import { styles } from '../swiper/Styles';

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
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [toDeleteAssets, setToDeleteAssets] = useState<Array<AssetType>>([]);
    const [currentAsset, setCurrentAsset] = useState<AssetType>({
        index: 0,
        uri: '',
        albumId: '',
        creationTime: 0,
        assetSize: 0,
        width: 0,
        height: 0,
        filename: '',
        mediaType: '',
        location: undefined,
    });
    const [localStorage, setLocalStorage] = useState<LocalStorage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [enableUndo, setEnableUndo] = useState(false);
    const swiperRef = useRef<Swiper<AssetType>>(null);

    useEffect(() => {
        console.debug('use effect mounting:', swipeKey);
        const reloadFromLocalStorageOrCache = async () => {
            try {
                await loadFromLocalStorage(swipeKey, screenKeyType);
            } catch (e) {
                console.error('error creating action trie', e);
            }
        };
        if (mediaAssets.length > 0 && screenKeyType) {
            reloadFromLocalStorageOrCache();
        }
    }, [swipeKey, mediaAssets, screenKeyType]);

    useFocusEffect(
        useCallback(() => {
            console.debug('use focus effect mounting:', swipeKey);

            return () => {
                console.debug(
                    'use focus effect unmounting: ',
                    localStorage?.getName()
                );
                if (localStorage) {
                    localStorage.save();
                }
            };
        }, [localStorage])
    );

    const loadFromLocalStorage = async (
        key: string,
        type: SwipeScreenKeyType
    ): Promise<void> => {
        setIsLoading(true);
        try {
            const doesLocalStorageExist = localStorage ? true : false;
            const storage = doesLocalStorageExist
                ? localStorage
                : await LocalStorageStore.getInstance(key, type);
            if (!doesLocalStorageExist) {
                setLocalStorage(storage);
            }

            // if null return
            if (!storage) {
                console.error('Failed to load LocalStorage from storage', key);
                return;
            }

            storage.updateWithExternalActionStack();
            storage.activate();

            // make local to keep and to delete uri
            const localToDeleteUri = new Array<AssetType>();
            let localCurrentIndex = storage.getCurrentIndex();
            if (storage.getTotalCount() === 0) {
                storage.setInitialCount(mediaAssets.length);
            }
            mediaAssets.forEach((asset, index) => {
                const assetUri = asset.uri;
                const action = storage.search(assetUri);
                if (action === TrieEntryType.TO_DELETE) {
                    localToDeleteUri.push({
                        index: index,
                        uri: assetUri,
                        albumId: asset.albumId,
                        creationTime: asset.creationTime,
                        assetSize: asset.assetSize,
                        width: asset.width,
                        height: asset.height,
                        filename: asset.filename,
                        mediaType: asset.mediaType,
                        location: asset.location,
                    });
                } else if (
                    action !== TrieEntryType.TO_SKIP &&
                    localCurrentIndex < 0
                ) {
                    localCurrentIndex = index;
                }
            });

            const localAsset = mediaAssets[localCurrentIndex];
            if (!localAsset) {
                console.error(
                    'No asset found in local storage: ',
                    localAsset,
                    'at index: ',
                    localCurrentIndex,
                    'total count: ',
                    mediaAssets.length
                );
            }

            setCurrentAsset({
                index: localCurrentIndex,
                uri: localAsset?.uri,
                albumId: localAsset?.albumId,
                creationTime: localAsset?.creationTime,
                assetSize: localAsset?.assetSize,
                width: localAsset?.width,
                height: localAsset?.height,
                filename: localAsset?.filename,
                mediaType: localAsset?.mediaType,
                location: localAsset?.location,
            });
            setCurrentIndex(localCurrentIndex);
            swiperRef.current?.jumpToCardIndex(localCurrentIndex);
            setToDeleteAssets(localToDeleteUri);
            if (storage.getActionHistorySize() > 0) {
                setEnableUndo(true);
            }
            console.debug('local current index: ', localCurrentIndex);
            setIsLoading(false);
        } catch (error) {
            console.error(
                'error loading action trie from local storage: ',
                error
            );
            throw error;
        }
    };

    const deleteAssets = async (deleteAssets: AssetType[]) => {
        // handle null assets
        if (!deleteAssets || deleteAssets.length === 0) {
            Alert.alert('No media', 'No assets available to delete');
            return;
        }

        try {
            const deleteUris = deleteAssets.map((item) => item.uri);
            const deletedMediaSize = await getAssetsSize(deleteUris);
            const result: Boolean = await deleteMedia(deleteUris);
            if (!localStorage) {
                console.error('No action trie found in local storage');
                return;
            }
            if (result) {
                Alert.alert(
                    'Deleted',
                    'Selected media files have been deleted'
                );

                localStorage.incrementDeletedMediaSize(deletedMediaSize);
                localStorage.incrementDeletedCount(deleteUris.length);
                localStorage.setCurrentIndex(-1);
                localStorage.clearActionHistory();
                localStorage.save();
                localStorage.propogateExternalActions(deleteAssets);
                setEnableUndo(false);
                await reloadAssets();
            }
        } catch (error) {
            console.error('Error deleting assets:', error);
            Alert.alert('Error', 'Failed to delete assets');
        }
    };

    const handleAction = (
        action: SwipeActionType,
        mediaAsset: AssetType,
        index: number
    ) => {
        if (!localStorage) {
            console.error('No action trie found in local storage');
            return;
        }
        const actionHistory = localStorage.getActionHistory();
        if (!actionHistory) {
            console.error('No action history object found to execute action');
            return;
        }

        console.debug('Trie size before action', localStorage.getTrieSize());
        const uri = mediaAsset.uri;

        // Record the action in history
        localStorage.pushActionHistory({
            index: currentIndex,
            action,
            uri,
            albumId: mediaAsset.albumId,
            creationTime: mediaAsset.creationTime,
            assetSize: mediaAsset.assetSize,
            width: mediaAsset.width,
            height: mediaAsset.height,
            filename: mediaAsset.filename,
            mediaType: mediaAsset.mediaType,
            location: mediaAsset.location,
        });

        // Handle specific actions
        if (action === SwipeActionType.DELETE) {
            setToDeleteAssets((prev) => [...prev, mediaAsset]);
            localStorage.insert(uri, TrieEntryType.TO_DELETE);
        }
        if (action === SwipeActionType.KEEP) {
            // add to keep trie
            localStorage.insert(uri, TrieEntryType.TO_KEEP);
            localStorage.incrementKeptCount(1);
        }

        if (action === SwipeActionType.SKIP) {
            localStorage.insert(uri, TrieEntryType.TO_SKIP);
            localStorage.incrementSkipCount(1);
        }
        // Move to the next asset
        // set next asset as current asset
        if (currentIndex < mediaAssets.length - 1) {
            const nextAsset = mediaAssets[currentIndex + 1];
            setCurrentAsset({
                index: currentIndex + 1,
                uri: nextAsset.uri,
                albumId: nextAsset.albumId,
                creationTime: nextAsset.creationTime,
                assetSize: nextAsset.assetSize,
                width: nextAsset.width,
                height: nextAsset.height,
                filename: nextAsset.filename,
                mediaType: nextAsset.mediaType,
                location: nextAsset.location,
            });
            localStorage.setCurrentIndex(currentIndex + 1);
            setCurrentIndex((prev) => prev + 1);
        }

        console.debug('Trie size after action', localStorage.getTrieSize());
    };

    const undoLastAction = () => {
        // swiperRef.current?.jumpToCardIndex(currentIndex - 1);
        // swiperRef.current?.swipeBack(
        //     (previousCardIndex: number, previousCard: AssetType) => {
        if (!localStorage) {
            console.error('No action trie found in local storage');
            return;
        }

        if (localStorage.getActionHistorySize() > 0) {
            setIsLoading(true);
            setEnableUndo(false);
            const lastAction = localStorage.popActionHistory();
            if (!lastAction) {
                console.error('No action history object found to undo action');
                return;
            }
            console.debug('Swiping back to previous card', lastAction.index);
            // swiperRef.current?.jumpToCardIndex(lastAction.index);
            // swiperRef.current?.swipeBack();

            // If it was a delete action, remove from delete list
            if (lastAction.action === SwipeActionType.DELETE) {
                setToDeleteAssets((prev) => prev.slice(0, -1));
            }
            // If it was a keep action, remove from keep list
            if (lastAction.action === SwipeActionType.KEEP) {
                localStorage.incrementKeptCount(-1);
            }
            swiperRef.current?.jumpToCardIndex(lastAction.index);
            setCurrentIndex(lastAction.index);
            setCurrentAsset(lastAction);
            // remove from trie
            localStorage.delete(lastAction.uri);
            // Go back to the previous index
            localStorage.setCurrentIndex(lastAction.index);
            if (localStorage.getActionHistorySize() > 0) {
                setEnableUndo(true);
            }
            setIsLoading(false);
        }
    };

    const proceedToDelete = async () => {
        setIsLoading(true);
        try {
            console.log('Assets marked for deletion:', toDeleteAssets.length);

            await deleteAssets(toDeleteAssets);
            toDeleteAssets.forEach((item) => {
                console.log('Will delete:', item);
            });
        } catch (error) {
            console.error('Error deleting assets:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const overlayLabel = useMemo(() => {
        const overlayStyle = {
            width: '100%',
            height: '100%',
            borderRadius: 48,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'green',
            color: 'white',
            fontSize: 24,
        };

        return {
            left: {
                title: 'Delete',
                style: {
                    ...overlayStyle,
                    label: {
                        color: 'red',
                    },
                },
            },
            right: {
                // center it with background green
                title: 'Keep',
                style: {
                    ...overlayStyle,
                    label: {
                        color: 'green',
                    },
                },
            },
        };

        // return (
        //     <View style={[styles.overlayLabelContainer, { backgroundColor }]}>
        //         <Text style={styles.overlayLabelText}>{text}</Text>
        //     </View>
        // );
    }, []);

    const renderCard = useCallback(
        (item: AssetType, index: number) => {
            return (
                <SwipeCard
                    item={item}
                    index={index}
                    totalCount={mediaAssets.length}
                />
            );
        },
        [mediaAssets.length]
    );

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="blue" />
            </View>
        );
    }

    if (mediaAssets.length === 0) {
        return (
            <View style={styles.container}>
                <Text>No media found in your gallery.</Text>
            </View>
        );
    }

    return (
        <View className="flex-1">
            <View className="flex-1 bg-transparent z-10">
                <Swiper
                    ref={swiperRef}
                    containerStyle={{
                        backgroundColor: 'transparent',
                    }}
                    cards={mediaAssets}
                    stackSize={2}
                    cardIndex={currentIndex}
                    disableTopSwipe
                    disableBottomSwipe
                    onSwipedLeft={() =>
                        handleAction(
                            SwipeActionType.DELETE,
                            currentAsset,
                            currentIndex
                        )
                    }
                    onSwipedRight={() =>
                        handleAction(
                            SwipeActionType.KEEP,
                            currentAsset,
                            currentIndex
                        )
                    }
                    keyExtractor={(item: AssetType) => item.index.toString()}
                    swipeBackCard={true}
                    animateCardOpacity={true}
                    swipeAnimationDuration={100}
                    animateOverlayLabelsOpacity={true}
                    overlayLabels={overlayLabel}
                    overlayLabelWrapperStyle={styles.overlayLabelContainer}
                    renderCard={renderCard}
                    stackAnimationFriction={15}
                    stackAnimationTension={80}
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
                    onPress={() => swiperRef.current?.swipeLeft()}
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
                    // disabled={!enableUndo}
                    onPress={undoLastAction}
                >
                    <MaterialCommunityIcons
                        name="undo"
                        color={'blue'}
                        size={25}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={shadow3d}
                    onPress={proceedToDelete}
                    className="h-20 w-20 rounded-full bg-gray-50 flex justify-center items-center border border-gray-100"
                >
                    <MaterialIcons name="done-all" color={'blue'} size={25} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={shadow3d}
                    onPress={() => swiperRef.current?.swipeRight()}
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
