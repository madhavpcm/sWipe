import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
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
import { NativeModules } from 'react-native';

const { DeleteMedia } = NativeModules;
console.log("NativeModules:", NativeModules); // Check if DeleteMedia appears here
console.log("DeleteMedia:", NativeModules.DeleteMedia); // Check if DeleteMedia appears here


type MediaStats = {
    month: string;
    mediaCount: number;
  };
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;


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

        const result =  DeleteMedia.deletePhotos(deleteUris)
        .then(() => {
          console.log("Image deleted");
        })
        .catch((e: { message: any; code: any; }) => {
          const message = e.message;
          const code = e.code;
    
          switch (code) {
            case "ERROR_USER_REJECTED":
              console.log("Image deletion denied by user");
              break;
            default:
              console.log("Error Deleting Media:", message);
              break;
          }
        });
        console.log('Deleted assets:', result);
        Alert.alert('Deleted', 'Selected media files have been deleted');
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

    const skipCurrent = () => {
        handleAction('skip', currentAsset.assetUri, currentAsset.index);
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

    const togglePlayPause = async () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            await videoRef.current.pauseAsync();
        } else {
            await videoRef.current.playAsync();
        }
        setIsPlaying(!isPlaying);
    };

    const rStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));
    const renderMediaItem = () => {

  
  
  const OverlayRight = () => (
    <View style={[styles.overlayLabelContainer, { backgroundColor: 'green' }]}>
      <Text style={styles.overlayLabelText}>Keep</Text>
    </View>
  );
  
  const OverlayLeft = () => (
    <View style={[styles.overlayLabelContainer, { backgroundColor: 'red' }]}>
      <Text style={styles.overlayLabelText}>Delete</Text>
    </View>
  );

  const OverlayTop = () => (
    <View style={[styles.overlayLabelContainer, { backgroundColor: 'blue' }]}>
      <Text style={styles.overlayLabelText}>Decide Later</Text>
    </View>
  );

        return (
            <View style={styles.mediaContainer}>
                {<View style={styles.cardContainer} pointerEvents="box-none" key={currentIndex}>
                  <CardItem
                    cardWidth={380}
                    cardHeight={730}
                    OverlayLabelRight={OverlayRight}
                    OverlayLabelLeft={OverlayLeft}
                    OverlayLabelTop={OverlayTop}
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

                {/* <PanGestureHandler onGestureEvent={gestureHandler}> */}
                    <View style={[styles.imageContainer, rStyle]}>
                        {renderMediaItem()}
                    </View>
                {/* </PanGestureHandler> */}

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
                        onPress={skipCurrent}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f8f8',
    },
    header: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        zIndex: 2,
    },
    undoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    undoButtonText: {
        color: 'white',
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '500',
    },
    imageContainer: {
        flex: 1,
        width: SCREEN_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mediaContainer: {
        flex: 1,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
      },
    video: {
        width: '100%',
        height: '100%',
    },
    playButton: {
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 30,
        padding: 10,
        zIndex: 2,
    },
    previousImage: {
        position: 'absolute',
        left: -SCREEN_WIDTH, // Position off-screen to the left
    },
    nextImage: {
        position: 'absolute',
        right: -SCREEN_WIDTH, // Position off-screen to the right
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 40,
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 20,
        zIndex: 2,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        minWidth: 100,
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(10px)',
    },
    deleteButton: {
        backgroundColor: 'rgba(255, 69, 58, 0.6)',
    },
    skipButton: {
        backgroundColor: 'rgba(255, 184, 0, 0.6)',
    },
    keepButton: {
        backgroundColor: 'rgba(48, 209, 88, 0.6)',
    },
    proceedButton: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 122, 255, 0.6)',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        minWidth: 200,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        zIndex: 2,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    counter: {
        position: 'absolute',
        bottom: 150,
        alignSelf: 'center',
        fontSize: 16,
        color: 'white',
        fontWeight: '500',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
        zIndex: 2,
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        padding: 20,
    },
    wrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
      },
      cardContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
      },
      card: {
        borderRadius: 48,
      },
      overlayLabelContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
      },
      overlayLabelText: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
      },
});
