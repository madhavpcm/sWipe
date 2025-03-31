import { TrieEntryType } from '@/common/lib/localstorage/types/TrieTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';

class TrieNode {
    children: Record<string, TrieNode>;
    isEndOfWord: boolean;
    type: TrieEntryType;

    constructor() {
        this.children = {};
        this.isEndOfWord = false;
        this.type = TrieEntryType.NONE;
    }
}

class Trie {
    root: TrieNode;
    count: number;
    name: string;

    constructor(name: string) {
        this.root = new TrieNode();
        this.count = 0;
        this.name = name;
        console.debug('Created trie:', name);
    }

    insert(word: string, type: TrieEntryType): void {
        console.debug('Inserting word into trie:', word);
        let node = this.root;
        for (const char of word) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        if (!node.isEndOfWord) {
            this.count++;
        }
        node.isEndOfWord = true;
        node.type = type;
    }

    search(word: string): TrieEntryType {
        let node = this.root;
        for (const char of word) {
            if (!node.children[char]) {
                return TrieEntryType.NONE;
            }
            node = node.children[char];
        }
        return node.type;
    }

    delete(word: string): void {
        let node = this.root;
        for (const char of word) {
            if (!node.children[char]) {
                return;
            }
            node = node.children[char];
        }
        if (node.isEndOfWord) {
            this.count--;
        }
        node.isEndOfWord = false;
        node.type = TrieEntryType.NONE;
    }
    size() {
        return this.count;
    }

    async save() {
        try {
            await AsyncStorage.setItem(
                this.name.replaceAll(' ', '_'),
                this.toSerializedString(),
                () => {
                    console.debug('successfully saved trie', this.name);
                }
            );
        } catch (error) {
            console.error('Failed to save trie:', error);
        }
    }

    toSerializedString(): string {
        return JSON.stringify(this);
    }

    static async load(name: string) {
        try {
            const nameWithTrie = name.replaceAll(' ', '_') + '_trie';
            const storedValue = await AsyncStorage.getItem(nameWithTrie);
            if (storedValue) {
                return Trie.fromSerializedString(storedValue);
            }
            console.debug('Trie: ', nameWithTrie, ' not found');
            return null;
        } catch (error) {
            console.error('Failed to load trie from storage:', error);
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
}

export default Trie;
