import React, { useEffect, useState } from "react";
import { View, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";

const { width } = Dimensions.get("window");

const ImageCarousel = () => {
  const [images, setImages] = useState<string[]>([]);

  const fetchGalleryImages = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") return;

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const media = await MediaLibrary.getAssetsAsync({
      mediaType: "photo",
      createdAfter: lastMonth.getTime(),
      first: 50, // Limit results
    });

    setImages(media.assets.map((asset) => asset.uri));
  };

  useEffect(() => { fetchGalleryImages(); }, []);

  return images.length ? (
    <Carousel
      loop width={width} height={300} data={images} scrollAnimationDuration={600}
      renderItem={({ item }) => (
        <Image source={item} style={{ width: "100%", height: "100%", borderRadius: 10 }} contentFit="cover" />
      )}
    />
  ) : null;
};

export default ImageCarousel;
