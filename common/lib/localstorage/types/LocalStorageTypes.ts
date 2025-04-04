import {
    ActionHistoryType,
    SwipeActionType,
} from '../../../types/SwipeMediaTypes';

export interface LocalStorageMediaDataType {
    name: string;
    currentIndex: number;
    lastAccessed: number;
    keepCount: number;
    skipCount: number;
    deleteCount: number;
    deletedMediaSize: number;
    initalCount: number;
    ExternalActionStackSize: number;
}

export interface ActionHistory {
    name: string;
    actionHistory: ActionHistoryType[];
}

export interface LocationType {
    longitude: number;
    latitude: number;
}

export interface AssetType {
    location: LocationType | undefined;
    mediaType: string;
    width: any;
    height: any;
    filename: string;
    index: number;
    uri: string;
    albumId: string | undefined;
    creationTime: number;
    assetSize: number;
}

export interface ExternalActionStackEntry {
    assetUri: string;
    assetSize: number;
    action: SwipeActionType;
    albumId: string | undefined;
    creationTime: number;
}

export interface ExternalActionStackType {
    name: string;
    queue: ExternalActionStackEntry[];
}
