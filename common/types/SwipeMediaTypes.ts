import { Asset } from 'expo-media-library';
import { AssetType } from '../lib/localstorage/types/LocalStorageTypes';

export interface AlbumMediaData {
    album: string;
    count: number;
}
export interface MediaData {
    month: number;
    year: number;
    count: number;
}

export interface CurrentAssetType {
    index: number;
    assetUri: string;
}

export interface ActionHistoryType extends AssetType {
    action: SwipeActionType;
}

export interface SwipeComponentInputType {
    mediaAssets: AssetType[];
    swipeKey: string;
    screenKeyType: SwipeScreenKeyType;
    reloadAssets: () => Promise<void>;
}

export interface MediaListDataType {
    name: string;
    thumbnail: string;
    itemCount: number;
    totalSize: number;
    progress: number;
    type?: SwipeScreenKeyType;
    dateObj: Date;
}

export enum SwipeScreenKeyType {
    MONTH = 'Month',
    ALBUM = 'Album',
}

export enum SwipeActionType {
    DELETE = 'Delete',
    KEEP = 'Keep',
    SKIP = 'Skip',
}
