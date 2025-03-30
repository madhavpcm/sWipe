import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import CardItem from './CardItem';
import { styles } from './Styles';
import { deleteMedia } from '@/common/lib/swipeandroid/SwipeAndroidLibary';
import { TrieEntryType } from '@/common/lib/localstorage/types/TrieTypes';
import {
    SwipeComponentInputType,
    SwipeScreenKeyType,
    SwipeActionType,
} from '@/common/types/SwipeMediaTypes';
import { getAssetsSize } from '@/util/ExpoFileUtil';
import LocalStorage from '@/common/lib/localstorage/lib/LocalStorage';
import { capitalizeFirstLetter } from '@/util/StringUtil';
import { AssetType } from '@/common/lib/localstorage/types/LocalStorageTypes';
import LocalStorageStore from '@/common/lib/localstorage/LocalStorageStore';

export function SwipeScreenComponent({
    mediaAssets,
    swipeKey,
    screenKeyType,
    reloadAssets,
}: SwipeComponentInputType) {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [toDeleteAssets, setToDeleteAssets] = useState<Array<AssetType>>([]);
    const [currentAsset, setCurrentAsset] = useState<AssetType>({
        index: 0,
        uri: '',
        albumId: '',
        creationTime: 0,
        assetSize: 0,
    });
    const [localStorage, setLocalStorage] = useState<LocalStorage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [enableUndo, setEnableUndo] = useState(false);

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
            if (mediaAssets.length != storage.getTotalCount()) {
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
                console.error('No asset found in local storage: ', localAsset);
            }

            setCurrentAsset({
                index: localCurrentIndex,
                uri: localAsset?.uri,
                albumId: localAsset?.albumId,
                creationTime: localAsset?.creationTime,
                assetSize: localAsset?.assetSize,
            });
            setCurrentIndex(localCurrentIndex);
            setToDeleteAssets(localToDeleteUri);
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

    const translateX = useSharedValue(0);
    // log mediaassets
    console.debug('Media assets length:', mediaAssets.length);
    // local assets length
    console.debug('Stored media assets length:', mediaAssets.length);

    const deleteAssets = async (deleteAssets: AssetType[]) => {
        // handle null assets
        if (!deleteAssets || deleteAssets.length === 0) {
            Alert.alert('No media', 'No assets available to delete');
            return;
        }

        try {
            const deleteUris = deleteAssets.map((item) => item.uri);
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

                const deletedMediaSize = await getAssetsSize(deleteUris);
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
        setEnableUndo(true);
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
            });
            localStorage.setCurrentIndex(currentIndex + 1);
            setCurrentIndex((prev) => prev + 1);
        }

        console.debug('Trie size after action', localStorage.getTrieSize());
    };

    const undoLastAction = () => {
        if (!localStorage) {
            console.error('No action trie found in local storage');
            return;
        }
        if (localStorage.getActionHistorySize() > 0) {
            const lastAction = localStorage.popActionHistory();
            if (!lastAction) {
                console.error('No action history object found to undo action');
                return;
            }

            // If it was a delete action, remove from delete list
            if (lastAction.action === SwipeActionType.DELETE) {
                setToDeleteAssets((prev) =>
                    // all except the last one, spread
                    prev.filter((item) => item.uri !== lastAction.uri)
                );
            }
            // If it was a keep action, remove from keep list
            if (lastAction.action === SwipeActionType.KEEP) {
                localStorage.incrementKeptCount(-1);
            }
            // remove from trie
            localStorage.delete(lastAction.uri);
            // Go back to the previous index
            localStorage.setCurrentIndex(lastAction.index);
            setCurrentIndex(lastAction.index);
            setCurrentAsset({
                index: lastAction.index,
                uri: lastAction.uri,
                albumId: lastAction.albumId,
                creationTime: lastAction.creationTime,
                assetSize: lastAction.assetSize,
            });
            if (localStorage.getActionHistorySize() === 0) {
                setEnableUndo(false);
            }
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

    const rStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));
    const renderMediaItem = () => {
        const getOverlayLabel = (action: SwipeActionType) => {
            let backgroundColor = '';
            let text = '';
            switch (action) {
                case SwipeActionType.DELETE:
                    backgroundColor = 'red';
                    text = 'Delete';
                    break;
                case SwipeActionType.KEEP:
                    backgroundColor = 'green';
                    text = 'Keep';
                    break;
                case SwipeActionType.SKIP:
                    backgroundColor = 'blue';
                    text = 'Decide Later';
                    break;
                default:
                    break;
            }
            return (
                <View
                    style={[styles.overlayLabelContainer, { backgroundColor }]}
                >
                    <Text style={styles.overlayLabelText}>{text}</Text>
                </View>
            );
        };

        return (
            <View style={styles.mediaContainer}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="blue" />
                ) : (
                    <View
                        style={styles.cardContainer}
                        pointerEvents="box-none"
                        key={currentIndex}
                    >
                        <CardItem
                            cardWidth={380}
                            cardHeight={730}
                            OverlayLabelRight={() =>
                                getOverlayLabel(SwipeActionType.KEEP)
                            }
                            OverlayLabelLeft={() =>
                                getOverlayLabel(SwipeActionType.DELETE)
                            }
                            OverlayLabelTop={() =>
                                getOverlayLabel(SwipeActionType.SKIP)
                            }
                            cardStyle={styles.card}
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
                        >
                            <Image
                                source={{ uri: currentAsset.uri }}
                                onLoad={() => setCurrentAsset(currentAsset)}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        </CardItem>
                    </View>
                )}
            </View>
        );
    };

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
                <Text style={styles.message}>
                    No media found in your gallery.
                </Text>
            </View>
        );
    }

    return (
        // <GestureHandlerRootView style={styles.container}>
        <View style={styles.container}>
            <View style={styles.header}>
                {enableUndo && (
                    <TouchableOpacity
                        style={styles.undoButton}
                        onPress={undoLastAction}
                    >
                        <MaterialIcons name="undo" size={24} color="white" />
                        <Text style={styles.undoButtonText}>
                            Undo{' '}
                            {capitalizeFirstLetter(
                                localStorage?.getLastAction()?.toString()
                            )}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={[styles.imageContainer, rStyle]}>
                {renderMediaItem()}
            </View>

            <View style={styles.buttonContainer}>
                {/* <TouchableOpacity
                        style={[styles.button, styles.deleteButton]}
                        onPress={() => handleAction('delete', currentAsset.assetUri, currentAsset.index)}
                        disabled={currentIndex === mediaAssets.length - 1}
                    >
                        <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity> */}

                {/* <TouchableOpacity
                        style={[styles.button, styles.skipButton]}
                        onPress={skipCurrent}
                    >
                        <Text style={styles.buttonText}>Skip</Text>
                    </TouchableOpacity> */}
                {/* <TouchableOpacity
                        style={[styles.button, styles.skipButton]}
                        onPress={() => handleAction('skip', currentAsset.assetUri, currentAsset.index)}
                        disabled={currentIndex === mediaAssets.length - 1}
                    >
                        <Text style={styles.buttonText}>Share</Text>
                    </TouchableOpacity> */}

                {/* <TouchableOpacity
                        style={[styles.button, styles.keepButton]}
                        onPress={() => handleAction('keep', currentAsset.assetUri, currentAsset.index)}
                        disabled={currentIndex === mediaAssets.length - 1}
                    >
                        <Text style={styles.buttonText}>Keep</Text>
                    </TouchableOpacity> */}
            </View>

            <TouchableOpacity
                style={[
                    styles.proceedButton,
                    { opacity: toDeleteAssets.length > 0 ? 1 : 0.5 },
                ]}
                onPress={proceedToDelete}
                disabled={toDeleteAssets.length === 0}
            >
                <Text style={styles.buttonText}>
                    Proceed to Delete ({toDeleteAssets.length})
                </Text>
            </TouchableOpacity>

            <Text style={styles.counter}>
                {currentIndex + 1} / {mediaAssets.length}
            </Text>
        </View>
    );
}
