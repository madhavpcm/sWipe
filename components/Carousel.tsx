import React, { useState } from "react";
import { View, Button, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import FastImage from "react-native-fast-image";
import { launchImageLibrary } from "react-native-image-picker";

const { width } = Dimensions.get("window");

const ImageCarousel = () => {
  const [images, setImages] = useState<string[]>([]);

  // Open gallery and select multiple images
  const pickImages = () => {
    launchImageLibrary({ mediaType: "photo", selectionLimit: 10 }, (response) => {
      if (response.assets) {
        const newImages = response.assets.map((asset) => asset.uri as string);
        setImages(newImages);
      }
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <Button title="Pick Images from Gallery" onPress={pickImages} />
      
      {images.length > 0 && (
        <Carousel
          loop
          width={width}
          height={300}
          data={images}
          scrollAnimationDuration={600}
          renderItem={({ item }) => (
            <FastImage
              source={{ uri: item }}
              style={{ width: "100%", height: "100%", borderRadius: 10 }}
              resizeMode="cover"
            />
          )}
        />
      )}
    </View>
  );
};

export default ImageCarousel;
