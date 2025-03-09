import {Asset} from "expo-media-library";

export interface MediaData {
    month: number;
    year: number;
    count: number;
}

export interface CurrentAssetType {
    index: number;
    assetUri: string
}

export interface ActionHistoryType{
    index: number;
    action: string;
    assetUri: string
}

export interface SwipeComponentInputType{
    mediaAssets: Asset[];
    month:string
}

export interface SwipeSerializable {
    fromSerializedString(serializedObjString: string): void
    toSerializedString(): string
}