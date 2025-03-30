import { SwipeScreenKeyType } from '@/common/types/SwipeMediaTypes';
import LocalStorage from './LocalStorage';
import LocalStorageMetadata from './LocalStorageMetadata';
import ExternalActionStack from './ExternalActionStack';

class LocalStorageStore {
    static localStorageMap: Map<string, LocalStorage> = new Map();
    static maxLocalStorageCount = 15;
    static refreshState = 0;
    private constructor() {}

    static async getInstance(
        name: string,
        type: SwipeScreenKeyType
    ): Promise<LocalStorage> {
        const key = name + type;
        if (!this.localStorageMap.has(key)) {
            const localStorage = await LocalStorage.loadOrCreate(name, type);

            if (!localStorage) {
                throw new Error('Failed to load LocalStorage from storage');
            }
            this.localStorageMap.set(key, localStorage);
            this.garbageCollect();
        }
        return this.localStorageMap.get(key) as LocalStorage;
    }

    static async getMetadataOnly(
        name: string,
        type: SwipeScreenKeyType
    ): Promise<LocalStorageMetadata> {
        const key = name + type;
        if (!this.localStorageMap.has(key)) {
            const metadata = await LocalStorage.loadOnlyMetadata(name);
            if (!metadata) {
                throw new Error('Failed to load metadata from storage');
            }
            return metadata;
        }
        return this.localStorageMap.get(key)!.metadata as LocalStorageMetadata;
    }

    static async getExternalActionStackOnly(
        name: string,
        type: SwipeScreenKeyType
    ): Promise<ExternalActionStack> {
        const key = name + type;
        if (!this.localStorageMap.has(key)) {
            const externalActionStack =
                await LocalStorage.loadOnlyExternalActionStack(name);
            if (!externalActionStack) {
                throw new Error(
                    'Failed to load external action stack from storage'
                );
            }
            return externalActionStack;
        }
        return this.localStorageMap.get(key)!
            .externalActionStack as ExternalActionStack;
    }

    static async garbageCollect() {
        if (this.localStorageMap.size > this.maxLocalStorageCount) {
            const keys = Array.from(this.localStorageMap.keys());
            const sortedKeys = keys.sort((a, b) => {
                return (
                    this.localStorageMap.get(a)!.metadata.lastAccessed -
                    this.localStorageMap.get(b)!.metadata.lastAccessed
                );
            });
            for (
                let i = 0;
                i < sortedKeys.length - this.maxLocalStorageCount;
                i++
            ) {
                const key = sortedKeys[i];
                this.localStorageMap.get(key)!.save();
                this.localStorageMap.delete(key);
            }
        }
    }

    static triggerRefresh() {
        // state reaches max integer count reset
        if (this.refreshState > Number.MAX_SAFE_INTEGER) {
            this.refreshState = 0;
        } else {
            this.refreshState++;
        }
    }

    static getRefreshState() {
        return this.refreshState;
    }
}

export default LocalStorageStore;
