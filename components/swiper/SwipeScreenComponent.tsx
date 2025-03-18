import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    Alert,
    ActivityIndicator
} from 'react-native';
import {
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import CardItem from './CardItem'
import {styles} from './Styles'
import {deleteMedia} from '@/util/SwipeAndroidLibary'
import Trie from '@/util/Trie';
import { loadTrieFromAsycStorage, saveToAsyncStorage, saveTrieToAsycStorage } from '@/util/AsyncStorageUtil';
import { TrieEntryType } from '@/common/types/TrieTypes';
import { SwipeComponentInputType, CurrentAssetType, ActionHistoryType, SwipeScreenKeyType } from '@/common/types/SwipeMediaTypes';
import { getAssetsSize } from '@/util/ExpoFileUtil';

export function SwipeScreenComponent({mediaAssets, month, screenKeyType}:SwipeComponentInputType) {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [permission, setPermission] = useState<string | null>('granted'); // TODO: remove this if not used
    const [toDeleteUri, setToDeleteUri] = useState<Array<string>>([]);
    const [currentAsset, setCurrentAsset] = useState<CurrentAssetType>({index: 0, assetUri: ''});
    const [actionHistory, setActionHistory] = useState<Array<ActionHistoryType>>([])
    const [actionTrie, setActionTrie] = useState<Trie | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        console.debug("use effect mounting:", month);
        const refreshActionTree = async () => {
            try {
                setIsLoading(true);
                await loadFromLocalStorage(month, screenKeyType);
                setIsLoading(false);
            } catch (e) {
                console.error("error creating action trie", e);
            }
        };
        if (mediaAssets.length > 0 && screenKeyType) {
            refreshActionTree();
        }
    },[month, mediaAssets, screenKeyType]); // Corrected dependency array
    useFocusEffect(useCallback(() => {
        console.debug("use focus effect mounting:" , month)      
  
        return () => {
            console.debug("use focus effect unmounting: ", actionTrie?.name)
            if(actionTrie){
                saveTrieToAsycStorage(actionTrie.name, actionTrie)
            }
        }   
    }, [actionTrie]))


    const loadFromLocalStorage = async (key: string, type: string): Promise<void> => {
        
        const trieName = key+"-action-trie"
        try{
        let loadedActionTrie = await loadTrieFromAsycStorage(trieName)
        if(!loadedActionTrie){
            console.debug("No action trie found in local storage: ", trieName)
            // if type is in enum return true else return false
            const validateType = type === SwipeScreenKeyType.MONTH.toString() || type === SwipeScreenKeyType.ALBUM.toString()
            if(!validateType){
                const errMessage = `No screenKeyType found: ${type},  it should belong to ${SwipeScreenKeyType.MONTH} or ${SwipeScreenKeyType.ALBUM}`
                console.error(errMessage)
                throw new Error(errMessage)
            }
            loadedActionTrie = new Trie(trieName, type)
        }
        const localActionHistory = loadedActionTrie.getActionHistory()
        console.debug("local action history size: ", localActionHistory.length)
        console.debug("entered load from local storage, media assets size: ", mediaAssets.length)
        // make local to keep and to delete uri
        const localToDeleteUri = new Array<string>()
        let localCurrentIndex = loadedActionTrie.getCurrentIndex()
        if(mediaAssets.length != loadedActionTrie.getTotalCount()){
            loadedActionTrie.setTotalCount(mediaAssets.length)
        }
        mediaAssets.forEach((asset, index) => {
            const assetUri = asset.uri;
            const action = loadedActionTrie.search(assetUri);
            if (action === TrieEntryType.TO_DELETE) {
                localToDeleteUri.push(assetUri);
            } else if (action !== TrieEntryType.TO_SKIP && localCurrentIndex<0) {
                localCurrentIndex = index
            }
        })
        const localAssetUri = mediaAssets[localCurrentIndex]?.uri
        if(!localAssetUri){
            console.error("No asset uri found in local storage: ", localAssetUri)
        }
        setCurrentAsset({index: localCurrentIndex ,assetUri: localAssetUri});
        setCurrentIndex(localCurrentIndex)
        setToDeleteUri(localToDeleteUri)
        setActionHistory(localActionHistory)
        console.debug("local current index: ", localCurrentIndex)
        setActionTrie(loadedActionTrie)    
    
        }catch(error){
            console.error("error loading action trie from local storage: ", error)
            throw error
        }
    }

 

    const translateX = useSharedValue(0);
    // log mediaassets
    console.debug('Media assets length:', mediaAssets.length);
    // local assets length
    console.debug('Stored media assets length:', mediaAssets.length);
    const router = useRouter();


const deleteAssets = async (deleteUris: string[]) => {
    // handle null assets
    if (!deleteUris || deleteUris.length === 0){
    Alert.alert('No media', 'No assets available to delete');
    return;
  }

    try {
        const result: Boolean  = await deleteMedia(deleteUris);
        if(!actionTrie){
            console.error('No action trie found in local storage');
            return
        }
        if(result){
            Alert.alert('Deleted', 'Selected media files have been deleted');
            // clear to delete from trie
            // toDeleteUri.forEach((uri) => {
            //     actionTrie.delete(uri);
            // }) TODO: remove this
            const deletedMediaSize = await getAssetsSize(toDeleteUri)
            actionTrie.incrementDeletedMediaSize(deletedMediaSize);
            actionTrie.incrementDeletedCount(toDeleteUri.length);
            // save trie
            await saveToAsyncStorage<Trie>(month+"-action-trie", actionTrie)
            setToDeleteUri([])           

        }
        router.push({
            pathname: "/",
            params: {
                month: month, // Pass as a string
                mediaCount: mediaAssets.length - toDeleteUri.length, // Pass as a number
            }
        });
      } catch (error) {
        console.error('Error deleting assets:', error);
        Alert.alert('Error', 'Failed to delete assets');
      }
    
  };

    const handleAction = (action: string, uri:string, index: number) => {
        if(!actionTrie){
            console.error('No action trie found in local storage');
            return
        }
        if(!actionHistory){
            console.error('No action history object found to execute action');
            return
        }

        console.debug("Trie size before action", actionTrie.size())
        // Record the action in history
        setActionHistory((prev) => {
            const nextVal = [
            ...prev,
            {
                index: currentIndex,
                action,
                assetUri: uri,
            },
        ]
        actionTrie.setActionHistory(nextVal)
        return nextVal
    });

        // Handle specific actions
        if (action === 'delete') {
            setToDeleteUri((prev) => [...prev, uri]);
            // add to delete trie
            actionTrie.insert(uri, TrieEntryType.TO_DELETE);
        }
        if (action === 'keep') {
            // add to keep trie
            actionTrie.insert(uri, TrieEntryType.TO_KEEP);
            actionTrie.incrementKeptCount(1);
        }

        if (action === 'skip') {
            actionTrie.insert(uri, TrieEntryType.TO_SKIP);
        }
        // Move to the next asset
        // set next asset as current asset
        if (currentIndex < mediaAssets.length - 1) {
            setCurrentAsset({index: currentIndex + 1,  assetUri: mediaAssets[currentIndex + 1].uri});
            actionTrie.setCurrentIndex(currentIndex + 1);
            setCurrentIndex((prev) => prev + 1);
        }
        
        console.debug("Trie size after action", actionTrie.size())

    };

    const undoLastAction = () => {
        if(!actionTrie){
            console.error('No action trie found in local storage');
            return
        }
        if (actionHistory.length > 0) {
            const lastAction = actionHistory[actionHistory.length - 1];

            // Remove the last action from history
            setActionHistory((prev) => {
                const nextVal = prev.slice(0, -1)
                actionTrie.setActionHistory(nextVal)
                return nextVal
            });
            

            // If it was a delete action, remove from delete list
            if (lastAction.action === 'delete') {
                setToDeleteUri((prev) =>
                    // all except the last one, spread
                    prev.filter((uri) => uri !== lastAction.assetUri)
                );
            }
            // If it was a keep action, remove from keep list
            if(lastAction.action === 'keep') {
                actionTrie.incrementKeptCount(-1);
            }
            // remove from trie
            actionTrie.delete(lastAction.assetUri);
            // Go back to the previous index
            actionTrie.setCurrentIndex(lastAction.index);
            setCurrentIndex(lastAction.index);
            setCurrentAsset({index: lastAction.index, assetUri: lastAction.assetUri});

        }
    };

    const proceedToDelete = async () => {
        console.log('Assets marked for deletion:', toDeleteUri.length);
        
        await deleteAssets(toDeleteUri);
        toDeleteUri.forEach((uri) => {
            console.log('Will delete:', uri);
        });
    };

    const rStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));
    const renderMediaItem = () => {

  
        const getOverlayLabel = (action: string) => {
            let backgroundColor = '';
            let text = '';
            switch (action) {
            case 'delete':
                backgroundColor = 'red';
                text = 'Delete';
                break;
            case 'keep':
                backgroundColor = 'green';
                text = 'Keep';
                break;
            case 'skip':
                backgroundColor = 'blue';
                text = 'Decide Later';
                break;
            default:
                break;
            }
            return (
            <View style={[styles.overlayLabelContainer, { backgroundColor }]}>
                <Text style={styles.overlayLabelText}>{text}</Text>
            </View>
            );
        };
        

        return (
            <View style={styles.mediaContainer}>
                {isLoading? (<ActivityIndicator size="large" color="blue" />) :( <View style={styles.cardContainer} pointerEvents="box-none" key={currentIndex}>
                  <CardItem
                    cardWidth={380}
                    cardHeight={730}
                    OverlayLabelRight={() => getOverlayLabel('keep')}
                    OverlayLabelLeft={() => getOverlayLabel('delete')}
                    OverlayLabelTop={() => getOverlayLabel('skip')}
                    cardStyle={styles.card}
                    onSwipedLeft={() => handleAction('delete', currentAsset.assetUri, currentIndex)}
                    onSwipedRight={() => handleAction('keep', currentAsset.assetUri, currentIndex)}
                  >
                    <Image source={{ uri: currentAsset.assetUri }} onLoad={()=>setCurrentAsset({index:currentIndex, assetUri: currentAsset.assetUri})} style={styles.image}   resizeMode="cover"/>
                  </CardItem>
                </View>)
              }
            </View>
          );
    
    };

    if(isLoading){
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="blue" />
            </View>
        )
    }


    if (!permission) { // TODO: remove this if block if not used
        return (
            <View style={styles.container}>
                <Text style={styles.message}>
                    Please grant media library permissions to use this feature.
                </Text>
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
                    {actionHistory?.length > 0 && (
                        <TouchableOpacity
                            style={styles.undoButton}
                            onPress={undoLastAction}
                        >
                            <MaterialIcons
                                name="undo"
                                size={24}
                                color="white"
                            />
                            <Text style={styles.undoButtonText}>
                                Undo{' '}
                                {
                                    actionHistory[actionHistory.length - 1]
                                        ?.action
                                }
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
                        { opacity: toDeleteUri.length > 0 ? 1 : 0.5 },
                    ]}
                    onPress={proceedToDelete}
                    disabled={toDeleteUri.length === 0}
                >
                    <Text style={styles.buttonText}>
                        Proceed to Delete ({toDeleteUri.length})
                    </Text>
                </TouchableOpacity>

                <Text style={styles.counter}>
                    {currentIndex + 1} / {mediaAssets.length}
                </Text>
            </View>
    );
}
