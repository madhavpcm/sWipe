import Trie from "./Trie"; // Adjust path as needed
import AsyncStorage from "@react-native-async-storage/async-storage";


export const loadTrieFromAsycStorage = async (key: string): Promise<Trie | null> => {
    try {
        const storedValue = await AsyncStorage.getItem(key.replaceAll(" ", "-"), ()=>{console.debug("successfully loaded trie", key)});
        if (storedValue) {
            return Trie.fromSerializedString(storedValue);
        }
        console.debug("Value not found");
        return null;
    } catch (error) {
        console.error("Failed to load value:", error);
        return null;
    }
};

// save to async storage with type  Trie
export const saveTrieToAsycStorage = async (key: string, trie: Trie) => {
    try {
        console.log("saving trie", trie.name)
        trie.setLastAccessed(Date.now());
        await AsyncStorage.setItem(key.replaceAll(" ", "-"), trie.toSerializedString(), ()=>{console.debug("successfully saved trie", trie.name)});
    } catch (error) {
        console.error("Failed to save trie:", error);
    }
};


// generic load funciton with type T
export const loadFromAsycStorage = async <T>(key: string): Promise<T | null> => {
    try {
        const storedValue = await AsyncStorage.getItem(key.replaceAll(" ", "-"));
        if (storedValue) {
            return JSON.parse(storedValue) as T;
        }
        console.debug("Value not found");
        return null;
    } catch (error) {
        console.error("Failed to load value:", error);
        return null;
    }
};

// generic save function with type T
export const saveToAsyncStorage = async <T>(key: string, value: T): Promise<boolean> => {
    try {
        await AsyncStorage.setItem(key.replaceAll(" ", "-"), JSON.stringify(value));
        return true;
    } catch (error) {
        console.error("Failed to save value:", error);
    }
    return false;
};


// get all keys in async storage that ends with action-trie
export const getAllActionTrieKeys = async (): Promise<string[]> => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        return keys.filter(key => key.endsWith("-action-trie"));
    } catch (error) {
        console.error("Failed to get keys:", error);
        return [];
    }
};
