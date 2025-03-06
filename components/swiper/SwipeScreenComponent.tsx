import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    Alert
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { Video } from 'expo-av';
import {
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CardItem from './CardItem'
import {styles} from './Styles'
import {deleteMedia} from '../util/SwipeAndroidLibary'




export function SwipeScreenComponent({mediaAssets, month}:{mediaAssets: MediaLibrary.Asset[],  month:string}) {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [permission, setPermission] = useState<string | null>('granted');
    const [isPlaying, setIsPlaying] = useState(false);
    const [toDeleteUri, setToDeleteUri] = useState<Array<string>>([]);
    const [toKeepUri, setToKeepUri] = useState<Array<string>>([]);
    const [currentAsset, setCurrentAsset] = useState<{index: number, assetUri: string}>({index: 0, assetUri: ''});
    const [actionHistory, setActionHistory] = useState<Array<{index: number, action: string, assetUri: string}>>([])
    const videoRef = useRef<Video | null>(null);

    const translateX = useSharedValue(0);
    // log mediaassets
    console.log('Media assets:', mediaAssets);
    const router = useRouter();

    useEffect(() => {
        setCurrentAsset({index: currentIndex,assetUri: mediaAssets[currentIndex]?.uri});
    }, [mediaAssets]);



const deleteAssets = async (deleteUris: string[]) => {
    // handle null assets
    if (!deleteUris || deleteUris.length === 0){
    Alert.alert('No media', 'No assets available to delete');
    return;
  }

    try {
        const result: Boolean  = await deleteMedia(deleteUris);
        if(result){
            Alert.alert('Deleted', 'Selected media files have been deleted');
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

        // Record the action in history
        setActionHistory((prev) => [
            ...prev,
            {
                index: currentIndex,
                action,
                assetUri: uri,
            },
        ]);

        // Handle specific actions
        if (action === 'delete') {
            setToDeleteUri((prev) => [...prev, uri]);
        }
        if (action === 'keep') {
            setToKeepUri((prev) => [...prev, uri]);
        }
        // Move to the next asset
        // set next asset as current asset
        if (currentIndex < mediaAssets.length - 1) {
            setCurrentAsset({index: currentIndex + 1,  assetUri: mediaAssets[currentIndex + 1]?.uri});
            setCurrentIndex((prev) => prev + 1);
        }
        

    };

    const undoLastAction = () => {
        if (actionHistory.length > 0) {
            const lastAction = actionHistory[actionHistory.length - 1];

            // Remove the last action from history
            setActionHistory((prev) => prev.slice(0, -1));

            // If it was a delete action, remove from delete list
            if (lastAction.action === 'delete') {
                setToDeleteUri((prev) =>
                    // all except the last one, spread
                    prev.filter((uri) => uri !== lastAction.assetUri)
                );
            }
            // If it was a keep action, remove from keep list
            if(lastAction.action === 'keep') {
                setToKeepUri((prev) =>
                    // all except the last one, spread
                    prev.filter((uri) => uri !== lastAction.assetUri)
                );
            }

            // Go back to the previous index
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
  
//   const OverlayRight = () => (
//     <View style={[styles.overlayLabelContainer, { backgroundColor: 'green' }]}>
//       <Text style={styles.overlayLabelText}>Keep</Text>
//     </View>
//   );
  
//   const OverlayLeft = () => (
//     <View style={[styles.overlayLabelContainer, { backgroundColor: 'red' }]}>
//       <Text style={styles.overlayLabelText}>Delete</Text>
//     </View>
//   );

//   const OverlayTop = () => (
//     <View style={[styles.overlayLabelContainer, { backgroundColor: 'blue' }]}>
//       <Text style={styles.overlayLabelText}>Decide Later</Text>
//     </View>
//   );

        return (
            <View style={styles.mediaContainer}>
                {<View style={styles.cardContainer} pointerEvents="box-none" key={currentIndex}>
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
                </View>
              }
            </View>
          );
       };
    if (!permission) {
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
                    {actionHistory.length > 0 && (
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
                    <TouchableOpacity
                        style={[styles.button, styles.deleteButton]}
                        onPress={() => handleAction('delete', currentAsset.assetUri, currentAsset.index)}
                        disabled={currentIndex === mediaAssets.length - 1}
                    >
                        <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>

                    {/* <TouchableOpacity
                        style={[styles.button, styles.skipButton]}
                        onPress={skipCurrent}
                    >
                        <Text style={styles.buttonText}>Skip</Text>
                    </TouchableOpacity> */}
                    <TouchableOpacity
                        style={[styles.button, styles.skipButton]}
                        onPress={() => handleAction('skip', currentAsset.assetUri, currentAsset.index)}
                        disabled={currentIndex === mediaAssets.length - 1}
                    >
                        <Text style={styles.buttonText}>Share</Text>
                    </TouchableOpacity>



                    <TouchableOpacity
                        style={[styles.button, styles.keepButton]}
                        onPress={() => handleAction('keep', currentAsset.assetUri, currentAsset.index)}
                        disabled={currentIndex === mediaAssets.length - 1}
                    >
                        <Text style={styles.buttonText}>Keep</Text>
                    </TouchableOpacity>
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
