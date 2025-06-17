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
    const [hasHistory, setHasHistory] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    
    const handleReviewAgain = useCallback(() => {
        setShowConfirmation(false);
        // Ensure we're showing the last image
        const lastIndex = Math.max(0, mediaAssets.length - 1);
        setCurrentIndex(lastIndex);
        swiperRef.current?.jumpToCardIndex(lastIndex);
    }, [mediaAssets.length]);

    // Effect to update enableUndo when localStorage or mediaAssets change
    useEffect(() => {
        if (localStorage) {
            const hasHistory = localStorage.getActionHistorySize() > 0;
            console.log('Action history changed. Has history:', hasHistory);
            setEnableUndo(hasHistory);
            setHasHistory(hasHistory);
        }
    }, [mediaAssets, localStorage]);
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
            console.log(mediaAssets)
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
        mediaAsset: AssetType | null,
        index: number
    ) => {
        if (index === mediaAssets.length - 1) {
            setShowConfirmation(true);
            return;
        }
        
        if (!mediaAsset) {
            console.log('No media asset to process');
            return;
        }
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

    const undoLastAction = async () => {
        console.log('=== UNDO BUTTON PRESSED ===');
        console.log('Swiper ref exists:', !!swiperRef.current);
        console.log('Local storage exists:', !!localStorage);
        
        if (!swiperRef.current || !localStorage) {
            console.error('Swiper ref or local storage not available');
            return;
        }

        const historySize = localStorage.getActionHistorySize();
        console.log('Action history size:', historySize);
        
        if (historySize === 0) {
            console.log('No actions to undo');
            return;
        }

        try {
            // Disable undo button during operation
            setEnableUndo(false);
            
            // Get the last action from history
            console.log('Getting last action from history...');
            const lastAction = localStorage.popActionHistory();
            console.log('Last action:', lastAction);
            
            if (!lastAction) {
                console.error('Failed to get last action from history');
                return;
            }

            // Ensure the index is within bounds
            const safeIndex = Math.min(lastAction.index, mediaAssets.length - 1);
            console.debug('Undoing action:', lastAction.action, 'at safe index:', safeIndex);

            // Update the current index and asset
            console.log('Updating current index to:', safeIndex);
            const assetToRestore = mediaAssets[safeIndex] || lastAction;
            console.log('Updating current asset to:', assetToRestore);
            
            setCurrentIndex(safeIndex);
            setCurrentAsset(assetToRestore);
            localStorage.setCurrentIndex(safeIndex);

            // Remove from the appropriate trie
            if (lastAction.action === SwipeActionType.DELETE) {
                setToDeleteAssets(prev => prev.filter(a => a.uri !== lastAction.uri));
                localStorage.delete(lastAction.uri);
            } else if (lastAction.action === SwipeActionType.KEEP) {
                localStorage.incrementKeptCount(-1);
                localStorage.delete(lastAction.uri);
            } else if (lastAction.action === SwipeActionType.SKIP) {
                localStorage.incrementSkipCount(-1);
                localStorage.delete(lastAction.uri);
            }

            // Update the UI to show the card again
            console.log('Jumping to card index:', safeIndex);
            try {
                await swiperRef.current.jumpToCardIndex(safeIndex);
                console.log('Successfully jumped to card');
            } catch (error) {
                console.error('Error jumping to card:', error);
            }
            
            // Check if there are more actions to undo
            const remainingActions = localStorage.getActionHistorySize();
            console.log('Remaining actions after undo:', remainingActions);
            
            // Enable undo button if there are more actions to undo
            const shouldEnableUndo = remainingActions > 0;
            console.log('Should enable undo:', shouldEnableUndo);
            
            setEnableUndo(shouldEnableUndo);
            if (!shouldEnableUndo) {
                console.log('No more actions to undo');
            }
        } catch (error) {
            console.error('Error undoing last action:', error);
            // Make sure to re-enable the button on error
            setEnableUndo(localStorage.getActionHistorySize() > 0);
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
            // Check if this is the dummy 'No more media' card
            if (item.uri === 'DUMMY_NO_MORE_MEDIA') {
                return (
                    <View className="flex-1 bg-gray-100 rounded-3xl justify-center items-center p-6">
                        <Text className="text-xl font-bold text-gray-700 mb-2">No More Media</Text>
                        <Text className="text-gray-500 text-center">You've gone through all your media</Text>
                    </View>
                );
            }
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

    // Add a dummy card at the end of the media assets array
    const cardsWithDummy = useMemo(() => {
        const dummyCard: AssetType = {
            index: mediaAssets.length,
            uri: 'DUMMY_NO_MORE_MEDIA',
            albumId: '',
            creationTime: Date.now(),
            assetSize: 0,
            width: 0,
            height: 0,
            filename: 'no-more-media',
            mediaType: 'text/plain',
            location: undefined,
        };
        return [...mediaAssets, dummyCard];
    }, [mediaAssets]);

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

    // Confirmation screen component
    const renderConfirmation = () => (
        <View className="absolute inset-0 bg-black/70 z-50 justify-center items-center p-6">
            <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
                <Text className="text-xl font-bold text-center mb-4">All Done!</Text>
                <Text className="text-gray-700 text-center mb-6">
                    You've reviewed all your media. Would you like to proceed with the selected actions?
                </Text>
                <View className="flex-row justify-between space-x-4">
                    <TouchableOpacity 
                        className="flex-1 bg-gray-200 py-3 rounded-lg items-center"
                        onPress={handleReviewAgain}
                    >
                        <Text className="text-gray-800 font-medium">Review Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        className="flex-1 bg-blue-500 py-3 rounded-lg items-center"
                        onPress={proceedToDelete}
                    >
                        <Text className="text-white font-medium">Proceed</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1">
            {showConfirmation && renderConfirmation()}
            <View className="flex-1 bg-transparent z-10">
                <Swiper
                    ref={swiperRef}
                    containerStyle={{
                        backgroundColor: 'transparent',
                    }}
                    cards={cardsWithDummy}
                    stackSize={Math.min(2, mediaAssets.length)}
                    cardIndex={currentIndex}
                    onSwipedAll={() => {
                        // Handle when all cards are swiped
                        console.log('All cards have been swiped');
                    }}
                    disableTopSwipe
                    disableBottomSwipe
                    onSwipedLeft={() => {
                        const safeIndex = Math.min(currentIndex, mediaAssets.length - 1);
                        const asset = mediaAssets[safeIndex];
                        if (!asset) return;
                        handleAction(
                            SwipeActionType.DELETE,
                            asset,
                            safeIndex
                        );
                    }}
                    onSwipedRight={() => {
                        const safeIndex = Math.min(currentIndex, mediaAssets.length - 1);
                        const asset = mediaAssets[safeIndex];
                        if (!asset) return;
                        handleAction(
                            SwipeActionType.KEEP,
                            asset,
                            safeIndex
                        );
                    }}
                    keyExtractor={(item: AssetType) => {
                        // Use a combination of uri and a random number to ensure uniqueness
                        if (!item) return `item_${Math.random().toString(36).substr(2, 9)}`;
                        return item.uri || `item_${Math.random().toString(36).substr(2, 9)}`;
                    }}
                    swipeBackCard={true}
                    animateCardOpacity={true}
                    swipeAnimationDuration={100}
                    animateOverlayLabelsOpacity={true}
                    overlayLabels={overlayLabel}
                    overlayLabelWrapperStyle={styles.overlayLabelContainer}
                    renderCard={(item: AssetType, index: number) => {
                        if (!item) return null; // Don't render empty cards
                        return renderCard(item, index);
                    }}
                    stackAnimationFriction={15}
                    stackAnimationTension={80}
                />
            </View>
            <View className="h-1/3 flex flex-row items-center justify-around z-50">
                <TouchableOpacity
                    style={[shadow3d, currentIndex >= mediaAssets.length && { opacity: 0.5 }]}
                    className={`h-20 w-20 rounded-full bg-gray-50 flex justify-center items-center border border-gray-100 ${currentIndex >= mediaAssets.length ? 'opacity-50' : ''}`}
                    onPress={() => {
                        if (currentIndex < mediaAssets.length) {
                            swiperRef.current?.swipeLeft();
                        }
                    }}
                    disabled={currentIndex >= mediaAssets.length || showConfirmation}
                >
                    <MaterialCommunityIcons
                        name="delete"
                        color={currentIndex >= mediaAssets.length || showConfirmation ? '#9ca3af' : 'red'}
                        size={25}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[shadow3d, { borderColor: enableUndo ? '#3b82f6' : '#9ca3af' }]}
                    className={`h-20 w-20 rounded-full bg-gray-50 flex justify-center items-center border ${!enableUndo ? 'opacity-50' : ''}`}
                    onPress={() => {
                        if (enableUndo) {
                            console.log('Undo button pressed');
                            console.log('enableUndo:', enableUndo);
                            console.log('hasHistory:', hasHistory);
                            console.log('actionHistorySize:', localStorage?.getActionHistorySize());
                            undoLastAction();
                        }
                    }}
                    disabled={!enableUndo}
                >
                    <MaterialCommunityIcons
                        name="undo"
                        color={enableUndo ? '#3b82f6' : '#9ca3af'}
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
                    style={[shadow3d, currentIndex >= mediaAssets.length && { opacity: 0.5 }]}
                    className={`h-20 w-20 rounded-full bg-gray-50 flex justify-center items-center border border-gray-100 ${currentIndex >= mediaAssets.length ? 'opacity-50' : ''}`}
                    onPress={() => {
                        if (currentIndex < mediaAssets.length) {
                            swiperRef.current?.swipeRight();
                        }
                    }}
                    disabled={currentIndex >= mediaAssets.length || showConfirmation}
                >
                    <MaterialCommunityIcons
                        name="check"
                        color={currentIndex >= mediaAssets.length || showConfirmation ? '#9ca3af' : 'green'}
                        size={25}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default SwiperDeck;
