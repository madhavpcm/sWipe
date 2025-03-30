import * as MediaLibrary from 'expo-media-library';
import { getZeroIndexOfMonth } from './DateUtil';
import { MediaData, SwipeActionType } from '@/common/types/SwipeMediaTypes';
import { TrieEntryType } from '@/common/lib/localstorage/types/TrieTypes';
import { LocationType } from '@/common/lib/localstorage/types/LocalStorageTypes';

export async function getMediaByAlbum(
    albumName: string
): Promise<MediaLibrary.PagedInfo<MediaLibrary.Asset>> {
    const album = await MediaLibrary.getAlbumAsync(albumName);
    console.debug('album returned :', album);

    const media = await MediaLibrary.getAssetsAsync({
        mediaType: ['photo', 'video'],
        sortBy: ['creationTime'],
        album: album,
        first: 10000, // Adjust as needed
    });

    console.debug('album media returned :', media);
    return media;
}

export async function getMediaByMonth(
    monthString: string
): Promise<MediaLibrary.PagedInfo<MediaLibrary.Asset>> {
    const [monthName, year] = monthString.split(' ');
    // create object of month index manually
    const monthIndex = getZeroIndexOfMonth(monthName); // Get month index (0-based)
    const startDate = new Date(Number(year), Number(monthIndex));
    const endDate = new Date(Number(year), Number(monthIndex + 1)); // First day of next month

    const media = await MediaLibrary.getAssetsAsync({
        mediaType: ['photo', 'video'],
        sortBy: ['creationTime'],
        createdAfter: startDate,
        createdBefore: endDate,
        first: 10000, // Adjust as needed
    });

    return media;
}

// sort list of media data

export const sortMediaData = (
    data: MediaData[],
    byParam: 'monthyear' | 'month' | 'year' | 'count',
    order: 'asc' | 'desc'
) => {
    return data.sort((a, b) => {
        if (byParam === 'monthyear') {
            if (order === 'asc') {
                return a.year - b.year || a.month - b.month;
            } else {
                return b.year - a.year || b.month - a.month;
            }
        }
        if (order === 'asc') {
            return a[byParam] - b[byParam];
        } else {
            return b[byParam] - a[byParam];
        }
    });
};

export const fromSwipeActionTypeToTreeAction = (
    action: SwipeActionType
): TrieEntryType => {
    switch (action) {
        case SwipeActionType.DELETE:
            return TrieEntryType.TO_DELETE;
        case SwipeActionType.KEEP:
            return TrieEntryType.TO_KEEP;
        case SwipeActionType.SKIP:
            return TrieEntryType.TO_SKIP;
        default:
            return TrieEntryType.NONE;
    }
};

export const getLocationFromAsset = async (
    asset: MediaLibrary.Asset
): Promise<LocationType | undefined> => {
    const assetInfo = (await MediaLibrary.getAssetInfoAsync(asset)).location;
    if (!assetInfo) {
        return undefined;
    }
    return { longitude: assetInfo.longitude, latitude: assetInfo.latitude };
};
