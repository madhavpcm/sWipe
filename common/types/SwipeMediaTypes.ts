import {Asset} from "expo-media-library";

export interface AlbumMediaData{
    album: string,
    count: number
}
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
    screenKeyType:string
}

export interface MediaListDataType {
    name: string,
    thumbnail:string,
    itemCount:number,
    totalSize:number,
    progress:number,
    type?:string,
    dateObj: Date
}

export enum SwipeScreenKeyType{
    MONTH,
    ALBUM
}