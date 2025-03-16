import Trie from "./Trie"; // Adjust path as needed
import AsyncStorage from "@react-native-async-storage/async-storage";

// export const saveTrie = async (key: string, trie: Trie) => {
//   try {
//     await AsyncStorage.setItem(key, trie.toString());
//     console.debug("Saved trie to storage:", trie.name);
//   } catch (error) {
//     console.error("Failed to save trie:", error);
//   }
// };

// export const loadTrie = async (key: string): Promise<Trie | null> => {
//   try {
//     const storedTrie = await AsyncStorage.getItem(key);
//     if (storedTrie) {
//       const trie = new Trie(key);
//       trie.fromString(storedTrie);
//       console.debug("Loaded trie from storage:", trie.name);
//       return trie;
//     }
//     console.debug("Trie not found");
//     return null;
//   } catch (error) {
//     console.error("Failed to load trie:", error);
//     return null;
//   }
// };

// // load array
// export const loadArray = async (key: string): Promise<string[] | null> => {
//   try {
//     const storedArray = await AsyncStorage.getItem(key);
//     if (storedArray) {
//       return JSON.parse(storedArray);
//     }
//     console.debug("Array not found");
//     return null;
//   } catch (error) {
//     console.error("Failed to load array:", error);
//     return null;
//   }
// };

// // save array
// export const saveArray = async (key: string, array: string[]) => {
//   try {
//     await AsyncStorage.setItem(key, JSON.stringify(array));
//     console.debug("Saved array to storage:", key);
//   } catch (error) {
//     console.error("Failed to save array:", error);
//   }
// };

// // save list 
// export const saveList = async (key: string, list: string[]) => {
//   try {
//     await AsyncStorage.setItem(key, JSON.stringify(list));
//   } catch (error) {
//     console.error("Failed to save list:", error);
//   }
// };

// // load list
// export const loadList = async (key: string): Promise<string[] | null> => {
//   try {
//     const storedList = await AsyncStorage.getItem(key);
//     if (storedList) {
//       return JSON.parse(storedList);
//     }
//     console.debug("List not found");
//     return null;
//   } catch (error) {
//     console.error("Failed to load list:", error);
//     return null;
//   }
// };

// // save set
// export const saveSet = async (key: string, set: Set<string>) => {
//   try {
//     await AsyncStorage.setItem(key, JSON.stringify(Array.from(set)));
//   } catch (error) {
//     console.error("Failed to save set:", error);
//   }
// };

// // load set
// export const loadSet = async (key: string): Promise<Set<string> | null> => {
//     try {
//         const storedSet = await AsyncStorage.getItem(key);
//         if (storedSet) {
//             return new Set(JSON.parse(storedSet));
//         }
//         console.debug("Set not found");
//         return null;
//     } catch (error) {
//         console.error("Failed to load set:", error);
//         return null;
//     }
// };
// load from async storage with type  Trie
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
