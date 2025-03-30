import {
    ActionHistoryType,
    SwipeActionType,
} from '@/common/types/SwipeMediaTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ActionHistoryStack {
    name: string;
    queue: ActionHistoryType[];

    constructor(name: string) {
        this.name = name;
        this.queue = [];
    }
    size(): number {
        return this.queue.length;
    }

    push(actionHistory: ActionHistoryType): void {
        this.queue.push(actionHistory);
    }

    pop(): ActionHistoryType | undefined {
        return this.queue.pop();
    }

    top(): ActionHistoryType | undefined {
        return this.queue[this.queue.length - 1];
    }

    clear(): void {
        this.queue = [];
    }

    async save() {
        try {
            await AsyncStorage.setItem(
                this.name.replaceAll(' ', '_'),
                this.toSerializedString(),
                () => {
                    console.debug(
                        'successfully saved action history stack',
                        this.name
                    );
                }
            );
        } catch (error) {
            console.error('Failed to save action history stack:', error);
        }
    }

    static async load(name: string) {
        try {
            const nameWithActionHistory =
                name.replaceAll(' ', '_') + '_action_history';
            const storedValue = await AsyncStorage.getItem(
                nameWithActionHistory
            );
            if (storedValue) {
                return ActionHistoryStack.fromSerializedString(storedValue);
            }
            console.debug(
                'Action history stack: ',
                nameWithActionHistory,
                ' not found'
            );
            return null;
        } catch (error) {
            console.error(
                'Failed to load action history stack from storage:',
                error
            );
            return null;
        }
    }

    toSerializedString(): string {
        return JSON.stringify(this);
    }

    static fromSerializedString(serializedObjString: string) {
        // load all data from the serialized string
        try {
            const { name, queue } = JSON.parse(serializedObjString);
            const actionHistoryStack = new ActionHistoryStack(name);
            actionHistoryStack.queue = queue;
            return actionHistoryStack;
        } catch (error) {
            console.error(
                'Failed to load action history stack from storage:',
                error
            );
            throw error;
        }
    }
}

export default ActionHistoryStack;
