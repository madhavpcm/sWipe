import { TrieEntryType } from '@/common/lib/localstorage/types/TrieTypes';
import {
    ActionHistoryType,
    SwipeActionType,
    SwipeScreenKeyType,
} from '@/common/types/SwipeMediaTypes';
import LocalStorageMetadata from './LocalStorageMetadata';
import Trie from './Trie';
import { fromSwipeActionTypeToTreeAction } from '../../../../util/MediaUtil';
import ExternalActionStack from './ExternalActionStack';
import ActionHistoryStack from './ActionHistoryStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    AssetType,
    ExternalActionStackEntry,
} from '@/common/lib/localstorage/types/LocalStorageTypes';
import { Album, getAlbumAsync, getAlbumsAsync } from 'expo-media-library';
import LocalStorageStore from '../LocalStorageStore';
import { getTimeBasedMonthKey } from '@/util/StringUtil';

class LocalStorage {
    metadata: LocalStorageMetadata;
    externalActionStack: ExternalActionStack;
    trie: Trie;
    actionHistory: ActionHistoryStack;

    private constructor(
        name: string,
        type: SwipeScreenKeyType,
        metadata: LocalStorageMetadata | null = null,
        externalActionStack: ExternalActionStack | null = null,
        trie: Trie | null = null,
        actionHistory: ActionHistoryStack | null = null
    ) {
        this.metadata =
            metadata || new LocalStorageMetadata(name + '_metadata', type);
        this.externalActionStack =
            externalActionStack ||
            new ExternalActionStack(name + '_external_action_stack');
        this.trie = trie || new Trie(name + '_trie');
        this.actionHistory =
            actionHistory || new ActionHistoryStack(name + '_action_history');
    }

    updateWithExternalActionStack() {
        // update trie with external action stack
        // for each action in external action stack do the same in trie
        // while queue is not popable
        var action: ExternalActionStackEntry | undefined;
        while ((action = this.externalActionStack.pop()) !== undefined) {
            this.insert(
                action.assetUri,
                fromSwipeActionTypeToTreeAction(action.action)
            );
            // update metadata
            if (action.action === SwipeActionType.DELETE) {
                this.incrementDeletedCount(1);
                this.incrementDeletedMediaSize(action.assetSize);
            }
            if (action.action === SwipeActionType.KEEP) {
                this.incrementKeptCount(1);
            }
        }
    }

    async propogateExternalActions(deletedAssets: AssetType[]) {
        console.debug('Propogating external actions');
        // if this type is month then group by album id where album id exists
        if (this.metadata.getType() === SwipeScreenKeyType.MONTH) {
            console.debug('Deleted assets propogating:', deletedAssets);

            const groupedAssets = deletedAssets
                .filter((asset) => asset.albumId !== undefined)
                .reduce(
                    (acc, asset) => {
                        const albumId = asset.albumId;
                        if (!acc[albumId as string]) {
                            acc[albumId as string] = [];
                        }
                        acc[albumId as string].push(asset);
                        return acc;
                    },
                    {} as Record<string, AssetType[]>
                );

            const albums = await getAlbumsAsync();
            // create a map of album id to album
            const albumMap = new Map<string, Album>();
            for (const album of albums) {
                albumMap.set(album.id, album);
            }
            console.debug('Albums:', albums);

            console.debug('Grouped assets:', groupedAssets);
            // for each album id in groupedAssets, get the external action stack and update it
            for (const albumId in groupedAssets) {
                const assets = groupedAssets[albumId];
                const album = albumMap.get(albumId);
                if (!album) {
                    console.error('Album not found:', albumId);
                    continue;
                }
                console.debug('Album:', album);
                const externalActionStack =
                    await LocalStorageStore.getExternalActionStackOnly(
                        album.title,
                        SwipeScreenKeyType.ALBUM
                    );

                for (const asset of assets) {
                    externalActionStack.push(asset, SwipeActionType.DELETE);
                }
                externalActionStack.save();

                const metadata = await LocalStorageStore.getMetadataOnly(
                    album.title,
                    SwipeScreenKeyType.ALBUM
                );
                // update metadata
                metadata.incrementDeletedCount(assets.length);
                metadata.incrementDeletedMediaSize(
                    assets.reduce((acc, asset) => acc + asset.assetSize, 0)
                );
                metadata.incrementExternalActionStackSize(assets.length);
                metadata.save();
            }

            // log album ids
            console.debug('Album ids:', Object.keys(groupedAssets));
        } else if (this.metadata.getType() === SwipeScreenKeyType.ALBUM) {
            console.debug('Month propogating:', deletedAssets);

            const groupedAssets = deletedAssets.reduce(
                (acc, asset) => {
                    const monthKey = getTimeBasedMonthKey(asset.creationTime);
                    if (!acc[monthKey]) {
                        acc[monthKey] = [];
                    }
                    acc[monthKey].push(asset);
                    return acc;
                },
                {} as Record<string, AssetType[]>
            );

            const monthKeys = Object.keys(groupedAssets);
            for (const monthKey of monthKeys) {
                const assets = groupedAssets[monthKey];
                const externalActionStack =
                    await LocalStorageStore.getExternalActionStackOnly(
                        monthKey,
                        SwipeScreenKeyType.MONTH
                    );
                for (const asset of assets) {
                    externalActionStack.push(asset, SwipeActionType.DELETE);
                }
                externalActionStack.save();

                const metadata = await LocalStorageStore.getMetadataOnly(
                    monthKey,
                    SwipeScreenKeyType.MONTH
                );
                // update metadata
                metadata.incrementDeletedCount(assets.length);
                metadata.incrementDeletedMediaSize(
                    assets.reduce((acc, asset) => acc + asset.assetSize, 0)
                );
                metadata.incrementExternalActionStackSize(assets.length);
                metadata.save();
            }
        }
    }

    insert(word: string, type: TrieEntryType): void {
        this.trie.insert(word, type);
    }

    search(word: string): TrieEntryType {
        return this.trie.search(word);
    }

    delete(word: string): void {
        this.trie.delete(word);
    }

    activate(): void {
        this.metadata.setIsActive(true);
    }

    pushActionHistory(actionHistory: ActionHistoryType): void {
        this.actionHistory.push(actionHistory);
    }

    popActionHistory(): ActionHistoryType | undefined {
        return this.actionHistory.pop();
    }

    clearExternalActionStack(): void {
        this.externalActionStack.clear();
        this.metadata.ExternalActionStackSize = 0;
    }

    clearActionHistory(): void {
        this.actionHistory.clear();
    }

    getLastAccessed() {
        return this.metadata.lastAccessed;
    }

    getLastAction(): SwipeActionType | undefined {
        return this.actionHistory.top()?.action;
    }

    getName() {
        return this.metadata.name;
    }

    setLastAccessed(lastAccessed: number) {
        this.metadata.lastAccessed = lastAccessed;
    }

    getCurrentIndex() {
        return this.metadata.currentIndex;
    }

    getActionHistory() {
        return this.actionHistory;
    }

    setCurrentIndex(index: number) {
        this.metadata.currentIndex = index;
    }

    getDeletedCount() {
        return this.metadata.deleteCount;
    }

    getDeletedMediaSize() {
        return this.metadata.deletedMediaSize;
    }

    getTotalCount() {
        return this.metadata.initalCount;
    }

    getProgress() {
        return this.getCurrentIndex() / this.getTotalCount();
    }

    getTrieSize() {
        return this.trie.size();
    }

    getActionHistorySize() {
        return this.actionHistory.size();
    }

    setInitialCount(initialCount: number) {
        this.metadata.initalCount = initialCount;
    }

    incrementDeletedMediaSize(sessionDeletedMediaSize: number) {
        this.metadata.deletedMediaSize += sessionDeletedMediaSize;
    }

    incrementDeletedCount(sessionDeleteCount: number) {
        this.metadata.deleteCount += sessionDeleteCount;
    }

    incrementKeptCount(sessionKeepCount: number = 1) {
        this.metadata.keepCount += sessionKeepCount;
    }

    incrementSkipCount(sessionSkipCount: number = 1) {
        this.metadata.skipCount += sessionSkipCount;
    }

    toSerializedString(): string {
        // store all data of this trie to a single string, root, count, name, currentIndex
        return JSON.stringify(this);
    }

    save() {
        this.metadata.save();
        this.externalActionStack.save();
        this.trie.save();
        this.actionHistory.save();
    }

    isHealthy(): boolean {
        if (
            !this.trie ||
            !this.metadata ||
            !this.externalActionStack ||
            !this.actionHistory
        ) {
            console.error('LocalStorage is not healthy');
            return false;
        }
        return true;
    }

    static async loadOnlyMetadata(name: string) {
        const metadata = await LocalStorageMetadata.load(name);
        return metadata;
    }

    static async loadOnlyExternalActionStack(name: string) {
        const externalActionStack = await ExternalActionStack.load(name);
        return externalActionStack;
    }

    static async load(
        name: string,
        metadata: LocalStorageMetadata | null = null,
        externalActionStack: ExternalActionStack | null = null
    ) {
        try {
            const trie = await Trie.load(name);
            const meta =
                metadata || (await LocalStorage.loadOnlyMetadata(name));
            const extStack =
                externalActionStack || (await ExternalActionStack.load(name));
            const actionHistory = await ActionHistoryStack.load(name);

            if (!trie || !meta || !extStack || !actionHistory) {
                console.debug('Failed to load LocalStorage from storage', name);
                return null;
            }

            return new LocalStorage(
                name,
                meta.getType(),
                meta,
                extStack,
                trie,
                actionHistory
            );
        } catch (error) {
            console.error('Failed to load LocalStorage from storage:', error);
            return null;
        }
    }

    static async loadOrCreate(name: string, type: SwipeScreenKeyType) {
        try {
            const metadata = await LocalStorageMetadata.loadOrCreate(
                name,
                type
            );
            const externalActionStack =
                await ExternalActionStack.loadOrCreate(name);
            const localStorage = await LocalStorage.load(
                name,
                metadata,
                externalActionStack
            );
            if (localStorage) {
                console.debug('LocalStorage loaded from storage', name);
                return localStorage;
            }
            console.debug(
                'LocalStorage not found in storage, creating new',
                name
            );
            return new LocalStorage(name, type);
        } catch (error) {
            console.error('Failed to load LocalStorage from storage:', error);
            return null;
        }
    }

    static fromSerializedString(serializedObjString: string) {
        // load all data from the serialized string
        try {
            const { root, count, name } = JSON.parse(serializedObjString);

            const trie = new Trie(name);
            trie.root = root;
            trie.count = count;
            trie.name = name;
            return trie;
        } catch (error) {
            console.error('Failed to load trie from storage:', error);
            throw error;
        }
    }
    // get all keys in async storage that ends with _trie and return a list without the _trie suffix
    static async getAllKeys(): Promise<string[]> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            return keys
                .filter((key) => key.endsWith('_metadata'))
                .map((key) => key.replace('_metadata', ''))
                .map((key) => key.replace('_', ' '));
        } catch (error) {
            console.error('Failed to get keys:', error);
            return [];
        }
    }
}

export default LocalStorage;
