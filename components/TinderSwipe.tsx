import * as React from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { TinderCard } from 'rn-tinder-card';
import * as MediaLibrary from 'expo-media-library';

export const TinderSwipe = ({ month, mediaAssets }: { month: string, mediaAssets: MediaLibrary.Asset[] }) => {
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
            onSwipedRight={() => Alert.alert('Swiped right')}
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
