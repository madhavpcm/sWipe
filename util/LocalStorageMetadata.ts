import AsyncStorage from '@react-native-async-storage/async-storage';
import { SwipeScreenKeyType } from '@/common/types/SwipeMediaTypes';

class LocalStorageMetadata {
    name: string;
    type: string;
    isActive: boolean;
    currentIndex: number;
    lastAccessed: number;
    keepCount: number;
    skipCount: number;
    deleteCount: number;
    deletedMediaSize: number;
    initalCount: number;
    ExternalActionStackSize: number;

    constructor(name: string, type: SwipeScreenKeyType) {
        this.name = name;
        this.currentIndex = -1;
        this.isActive = false;
        this.lastAccessed = Date.now();
        this.keepCount = 0;
        this.type = type.toString();
        this.skipCount = 0;
        this.deleteCount = 0;
        this.deletedMediaSize = 0;
        this.initalCount = 0;
        this.ExternalActionStackSize = 0;
    }

    getDeletedMediaSize() {
        return this.deletedMediaSize;
    }

    getProgress() {
        return (
            (this.deleteCount + this.skipCount + this.keepCount) /
            this.initalCount
        );
    }

    getLastAccessed() {
        return this.lastAccessed;
    }

    getDeletedCount() {
        return this.deleteCount;
    }

    getKeepCount() {
        return this.keepCount;
    }

    getSkipCount() {
        return this.skipCount;
    }

    getType(): SwipeScreenKeyType {
        switch (this.type) {
            case SwipeScreenKeyType.MONTH.toString():
                return SwipeScreenKeyType.MONTH;
            case SwipeScreenKeyType.ALBUM.toString():
                return SwipeScreenKeyType.ALBUM;
            default:
                return SwipeScreenKeyType.MONTH;
        }
    }

    getIsActive() {
        return this.isActive;
    }

    setIsActive(isActive: boolean) {
        this.isActive = isActive;
    }

    incrementDeletedCount(sessionDeleteCount: number = 1) {
        this.deleteCount += sessionDeleteCount;
    }

    incrementDeletedMediaSize(sessionDeletedMediaSize: number) {
        this.deletedMediaSize += sessionDeletedMediaSize;
    }

    incrementKeepCount(sessionKeepCount: number = 1) {
        this.keepCount += sessionKeepCount;
    }
    incrementSkipCount(sessionSkipCount: number = 1) {
        this.skipCount += sessionSkipCount;
    }

    incrementExternalActionStackSize(
        sessionExternalActionStackSize: number = 1
    ) {
        this.ExternalActionStackSize += sessionExternalActionStackSize;
    }

    toSerializedString(): string {
        console.debug('Saving metadata to storage:', JSON.stringify(this));
        return JSON.stringify(this);
    }

    async save() {
        try {
            console.log('metadata', this.name);
            await AsyncStorage.setItem(
                this.name.replaceAll(' ', '_'),
                this.toSerializedString(),
                () => {
                    console.debug('successfully saved metadata', this.name);
                }
            );
        } catch (error) {
            console.error('Failed to save metadata:', error);
        }
    }
    static async loadOrCreate(name: string, type: SwipeScreenKeyType) {
        const metadata = await this.load(name);
        if (metadata) {
            return metadata;
        }
        return new LocalStorageMetadata(name + '_metadata', type);
    }

    static async load(name: string) {
        try {
            const nameWithMetadata = name.replaceAll(' ', '_') + '_metadata';
            const storedValue = await AsyncStorage.getItem(nameWithMetadata);
            if (storedValue) {
                return LocalStorageMetadata.fromSerializedString(storedValue);
            }
            console.debug('Metadata: ', nameWithMetadata, ' not found');
            return null;
        } catch (error) {
            console.error('Failed to load metadata from storage:', error);
            return null;
        }
    }

    static fromSerializedString(serializedObjString: string) {
        // load all data from the serialized string
        console.debug(
            'Loading metadata from storage serialized string:',
            serializedObjString
        );
        try {
            const {
                name,
                type,
                isActive,
                currentIndex,
                lastAccessed,
                keepCount,
                skipCount,
                deleteCount,
                deletedMediaSize,
                initalCount,
                ExternalActionStackSize,
            } = JSON.parse(serializedObjString);
            const metadata = new LocalStorageMetadata(name, type);
            metadata.isActive = isActive;
            metadata.currentIndex = currentIndex;
            metadata.lastAccessed = lastAccessed;
            metadata.keepCount = keepCount;
            metadata.skipCount = skipCount;
            metadata.deleteCount = deleteCount;
            metadata.deletedMediaSize = deletedMediaSize;
            metadata.initalCount = initalCount;
            metadata.ExternalActionStackSize = ExternalActionStackSize;
            return metadata;
        } catch (error) {
            console.error('Failed to load metadata from storage:', error);
            throw error;
        }
    }
}

export default LocalStorageMetadata;
