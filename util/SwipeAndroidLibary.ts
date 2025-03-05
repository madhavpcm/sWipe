import { NativeModules } from "react-native";
import { getMonthNameFromOneBasedIndex } from "./DateUtil";
import { sortMediaData } from "./MediaUtil";

const { SwipeCustomMediaModule } = NativeModules;


export async function getImageCountByMonthYear(): Promise<MediaData[]>{
  try {
    // one month ago
    // const countMap1 = await SwipeCustomMediaModule.deletePhotos(["file://test"]);
    const data = await SwipeCustomMediaModule.countImagesByMonthYear();

    // create a list of MediaData
    const mediaData: MediaData[] = Object.entries(data).map(([key, value]) => {
      // convert it into format like "February 2024": 5 from "2024-02"
      const splited = key.split("-");
      const month = Number(splited[1]);
      const year = Number(splited[0]);
      return {
        month,
        year,
        count: Number(value),
      };
    });

    return sortMediaData(mediaData, 'monthyear', 'desc');

  } catch (error) {
    console.error("Failed to get image count", error);
  }
  return []
}

export async function deleteMedia(deleteUris: string[]) {
  const result =  await SwipeCustomMediaModule.deletePhotos(deleteUris)
        .then(() => {
          // resolve true promise
          return Promise.resolve(true)
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
          return Promise.resolve(false)
        });
        return result
}
