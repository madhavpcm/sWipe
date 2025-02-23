import * as React from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { TinderCard } from 'rn-tinder-card';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import { DeleteMedia, ErrorCodes } from "react-native-delete-media";



export const TinderSwipe = ({ month, mediaAssets }: { month: string, mediaAssets: MediaLibrary.Asset[] }) => {
  const router = useRouter();
  
  const deleteAssets = async (assets: MediaLibrary.Asset[]) => {
    // handle null assets
    if (!assets || assets.length === 0){
    Alert.alert('No media', 'No assets available to delete');
    return;
  }

    try {

  //     await Promise.all(assets.map(asset => cleanupImageReferences(asset?.uri)));

  //   // Wait a bit to ensure cleanup is complete
  //     await new Promise(resolve => setTimeout(resolve, 300));

  //   // Clear any cached images from the current view
  //   setCurrentIndex(prevIndex => {
  //     if (prevIndex >= mediaAssets.length - 1) {
  //       return mediaAssets.length - 2;
  //     }
  //     return prevIndex;
  //   });

  //   // Remove from animated view if present
  //   translateX.value = 0;

  //   // Clear from display before deletion
  //   renderMediaItem();

  //   // Force a render cycle
  //   await new Promise(resolve => setTimeout(resolve, 100));

      // const result = await MediaLibrary.deleteAssetsAsync(assets.map(asset => asset.id));
      const util = require('util')
      const nonNullAssetsUri = assets.filter(asset => asset !== null).map(asset => asset.uri).filter(uri => uri !== null);
      // console.log('DeleteMedia:', DeleteMedia);
      console.log(util.inspect(DeleteMedia, false, null, true /* enable colors */))
      const result =  DeleteMedia.deletePhotos(nonNullAssetsUri)
      .then(() => {
        console.log("Image deleted");
      })
      .catch((e) => {
        const message = e.message;
        const code: ErrorCodes = e.code;
  
        switch (code) {
          case "ERROR_USER_REJECTED":
            console.log("Image deletion denied by user");
            break;
          default:
            console.log(message);
            break;
        }
      });
      console.log('Deleted assets:', result);
      Alert.alert('Deleted', 'Selected media files have been deleted');
      router.push({
          pathname: "/",
          params: {
              month: month, // Pass as a string
              mediaCount: 99 //mediaAssets.length - toDeleteAssets.length, // Pass as a number
          }
      });
    } catch (error) {
      console.error('Error deleting assets:', error);
      Alert.alert('Error', 'Failed to delete assets');
    }
  
};

  
  
  
  const OverlayRight = () => (
    <View style={[styles.overlayLabelContainer, { backgroundColor: 'green' }]}>
      <Text style={styles.overlayLabelText}>Like</Text>
    </View>
  );
  
  const OverlayLeft = () => (
    <View style={[styles.overlayLabelContainer, { backgroundColor: 'red' }]}>
      <Text style={styles.overlayLabelText}>Nope</Text>
    </View>
  );

  const OverlayTop = () => (
    <View style={[styles.overlayLabelContainer, { backgroundColor: 'blue' }]}>
      <Text style={styles.overlayLabelText}>Super Like</Text>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <Text style={styles.header}>Media from {month}</Text>
      {mediaAssets.map((item, index) => (
        <View style={styles.cardContainer} pointerEvents="box-none" key={index}>
          <TinderCard
            cardWidth={380}
            cardHeight={730}
            OverlayLabelRight={OverlayRight}
            OverlayLabelLeft={OverlayLeft}
            OverlayLabelTop={OverlayTop}
            cardStyle={styles.card}
            onSwipedRight={async () => {
              await deleteAssets(mediaAssets)
            }}
            onSwipedTop={() => Alert.alert('Swiped Top')}
            onSwipedLeft={() => Alert.alert('Swiped left')}
          >
            <Image source={{ uri: item.uri }} style={styles.image} />
          </TinderCard>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  cardContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 48,
  },
  image: {
    width: '100%',
    height: '100%',
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
