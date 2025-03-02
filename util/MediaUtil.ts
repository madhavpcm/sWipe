import * as MediaLibrary from 'expo-media-library';

export async function getMediaByMonth(monthString: string) {
  const [monthName, year] = monthString.split(' ');
  // create object of month index manually
  const monthMap: Record<string, number>  = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3,
    'May': 4, 'June': 5, 'July': 6, 'August': 7,
    'September': 8, 'October': 9, 'November': 10, 'December': 11
  };
  
  const monthIndex = monthMap[monthName] // Get month index (0-based)
  console.log("year: ", Number(year))
  console.log("monthIndex: ", Number(monthIndex))
  const startDate = new Date(Number(year), Number(monthIndex));
  const endDate = new Date(Number(year), Number(monthIndex + 1)); // First day of next month
  console.log("createdBefore : ", startDate.toString(), "createdBefore : ", endDate.toString())

  const media = await MediaLibrary.getAssetsAsync({
    mediaType: ['photo', 'video'],
    sortBy: ['creationTime'],
    createdAfter: startDate,
    createdBefore: endDate,
    first: 1000 // Adjust as needed
  });

  return media;
}