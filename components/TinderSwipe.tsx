import * as React from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TinderCard } from 'rn-tinder-card';
import * as MediaLibrary from 'expo-media-library';
import { ActionButton } from './ActionButton';
import { DeleteMedia, ErrorCodes } from "react-native-delete-media";


const { width, height } = Dimensions.get('window');

type SwipedAction = {
  action: 'delete' | 'keep';
  asset: MediaLibrary.Asset;
};

export const TinderSwipe = ({
  month,
  mediaAssets,
}: {
  month: string;
  mediaAssets: MediaLibrary.Asset[];
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const cardRefs = React.useRef<(TinderCard | null)[]>([]);
  const [pendingDeletions, setPendingDeletions] = React.useState<MediaLibrary.Asset[]>([]);
  const [pendingKeeps, setPendingKeeps] = React.useState<MediaLibrary.Asset[]>([]);
  const [swipedActions, setSwipedActions] = React.useState<SwipedAction[]>([]);

  // When a card is swiped, record the action and update state
  const onSwiped = (direction: string) => {
    const currentAsset = mediaAssets[currentIndex];
    if (direction === 'left') {
      setPendingDeletions((prev) => [...prev, currentAsset]);
      setSwipedActions((prev) => [...prev, { action: 'delete', asset: currentAsset }]);
    } else if (direction === 'right') {
      setPendingKeeps((prev) => [...prev, currentAsset]);
      setSwipedActions((prev) => [...prev, { action: 'keep', asset: currentAsset }]);
    } else if (direction === 'top') {
      Alert.alert('Super Liked!');
      setSwipedActions((prev) => [...prev, { action: 'keep', asset: currentAsset }]);
    }
    Alert.alert(`Swiped ${direction}`);
    setCurrentIndex((prev) => prev + 1);
  };

  // Programmatically swipe the current card
  const handleSwipeLeft = () => {
    if (cardRefs.current[currentIndex]) {
      cardRefs.current[currentIndex]?.swipeLeft();
    }
  };

  const handleSwipeRight = () => {
    if (cardRefs.current[currentIndex]) {
      cardRefs.current[currentIndex]?.swipeRight();
    }
  };

  // Undo the last swipe action and revert state changes
  const handleUndo = () => {
    if (swipedActions.length === 0 || currentIndex === 0) return;
    const lastAction = swipedActions[swipedActions.length - 1];
    setSwipedActions((prev) => prev.slice(0, prev.length - 1));
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
    if (lastAction.action === 'delete') {
      setPendingDeletions((prev) =>
        prev.filter((asset) => asset.id !== lastAction.asset.id)
      );
    } else if (lastAction.action === 'keep') {
      setPendingKeeps((prev) =>
        prev.filter((asset) => asset.id !== lastAction.asset.id)
      );
    }
  };

  // Finalize deletion of all assets marked for deletion
  const handleProceed = async () => {
    if (pendingDeletions.length > 0) {
      try {
        const assetIds = pendingDeletions.map((asset) => asset.id);
        await DeleteMedia.deletePhotos(assetIds);
        Alert.alert('Media deleted successfully!');
        setPendingDeletions([]);
      } catch (error: any) {
        Alert.alert('Error deleting media', error.message);
        console.log(error)
      }
    } else {
      Alert.alert('No media marked for deletion.');
    }
  };

  // When all cards have been swiped, show a final screen
  if (currentIndex >= mediaAssets.length) {
    return (
      <SafeAreaView style={styles.finalScreen} edges={['top', 'bottom', 'left', 'right']}>
        <Text style={styles.finalTitle}>
          Photos to be Deleted ({pendingDeletions.length})
        </Text>
        <ScrollView contentContainerStyle={styles.grid}>
          {pendingDeletions.map((asset) => (
            <Image key={asset.id} source={{ uri: asset.uri }} style={styles.gridImage} />
          ))}
        </ScrollView>
        <View style={styles.finalButtonsContainer}>
          <TouchableOpacity style={styles.finalButton} onPress={handleUndo}>
            <Text style={styles.finalButtonText}>Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.finalButton} onPress={handleProceed}>
            <Text style={styles.finalButtonText}>
              Delete ({pendingDeletions.length})
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {mediaAssets.map((item, index) => (
        <View style={styles.cardContainer} key={index}>
          {index === currentIndex && (
            <TinderCard
              ref={(el) => (cardRefs.current[index] = el)}
              cardWidth={width}
              cardHeight={height}
              cardStyle={styles.card}
              onSwipedRight={() => onSwiped('right')}
              onSwipedTop={() => onSwiped('top')}
              onSwipedLeft={() => onSwiped('left')}
            >
              <Image source={{ uri: item.uri }} style={styles.image} />
            </TinderCard>
          )}
        </View>
      ))}

      {/* Action buttons for swipe gestures */}
      <View style={styles.buttonsContainer}>
        <ActionButton text="Delete" color="red" icon="delete" onPress={handleSwipeLeft} />
        <ActionButton text="Keep" color="green" icon="star" onPress={handleSwipeRight} />
      </View>

      {/* Additional bottom buttons for Undo and Proceed */}
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity style={styles.bottomButton} onPress={handleUndo}>
          <Text style={styles.bottomButtonText}>Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={handleProceed}>
          <Text style={styles.bottomButtonText}>
            Delete ({pendingDeletions.length})
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  cardContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 140,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    zIndex: 10,
  },
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    zIndex: 10,
  },
  bottomButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  finalScreen: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    paddingTop: 20,
  },
  finalTitle: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
  },
  gridImage: {
    width: width / 3 - 12,
    height: width / 3 - 12,
    margin: 4,
    borderRadius: 8,
  },
  finalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginTop: 20,
  },
  finalButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  finalButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
