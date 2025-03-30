import {
    AssetType,
    ExternalActionStackEntry,
} from '@/common/lib/localstorage/types/LocalStorageTypes';
import { SwipeActionType } from '@/common/types/SwipeMediaTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ExternalActionStack {
    name: string;
    queue: ExternalActionStackEntry[];

    constructor(name: string) {
        this.name = name;
        this.queue = [];
    }

    push(asset: AssetType, action: SwipeActionType): void {
        this.queue.push({
            assetUri: asset.uri,
            assetSize: asset.assetSize,
            action,
            albumId: asset.albumId,
            creationTime: asset.creationTime,
        });
    }

    pop(): ExternalActionStackEntry | undefined {
        return this.queue.pop();
    }

    async save() {
        try {
            await AsyncStorage.setItem(
                this.name.replaceAll(' ', '_'),
                this.toSerializedString(),
                () => {
                    console.debug(
                        'successfully saved external action stack',
                        this.name
                    );
                }
            );
        } catch (error) {
            console.error('Failed to save external action stack:', error);
        }
    }

    clear(): void {
        this.queue = [];
    }

    toSerializedString(): string {
        return JSON.stringify(this);
    }

    static async loadOrCreate(name: string) {
        const externalActionStack = await this.load(name);
        if (externalActionStack) {
            return externalActionStack;
        }
        return new ExternalActionStack(name + '_external_action_stack');
    }

    static async load(name: string) {
        try {
            const nameWithExternalActionStack =
                name.replaceAll(' ', '_') + '_external_action_stack';
            const storedValue = await AsyncStorage.getItem(
                nameWithExternalActionStack
            );
            if (storedValue) {
                return this.fromSerializedString(storedValue);
            }
            console.debug(
                'External action stack: ',
                nameWithExternalActionStack,
                ' not found'
            );
            return null;
        } catch (error) {
            console.error(
                'Failed to load external action stack from storage:',
                error
            );
            return null;
        }
    }

    static fromSerializedString(serializedObjString: string) {
        // load all data from the serialized string
        try {
            const { name, queue } = JSON.parse(serializedObjString);
            const externalActionStack = new ExternalActionStack(name);
            externalActionStack.queue = queue;
            return externalActionStack;
        } catch (error) {
            console.error(
                'Failed to load external action stack from storage:',
                error
            );
            throw error;
        }
    }
}

export default ExternalActionStack;
