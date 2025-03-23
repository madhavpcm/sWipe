import { TrieEntryType } from "@/common/types/TrieTypes";
import { saveTrieToAsycStorage } from "./AsyncStorageUtil";
import { ActionHistoryType } from "@/common/types/SwipeMediaTypes";

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
    type: string;
    totalCount: number; // Total count of items in bucket (kept, skipped and not seen yet)
    deletedCount: number;
    keptCount: number;
    deletedMediaSize: number;
    name: string;
    currentIndex: number;
    actionHistory: ActionHistoryType[];
    lastAccessed: number;

    constructor(name: string, type: string) {
      this.root = new TrieNode();
      this.count = 0;
      this.type = type;
      this.totalCount = 0;
      this.deletedCount = 0;
      this.keptCount = 0;
      this.deletedMediaSize = 0;
      this.name = name;
      this.currentIndex = -1;
      this.actionHistory = [];
      this.lastAccessed = Date.now();
      console.debug("Created trie:", name);
    }

    destroy(){
      // save trie to storage
      console.debug("Destroying trie from destructor", this.name);
      saveTrieToAsycStorage(this.name, this);
    }

    insert(word: string, type: TrieEntryType): void {
      console.debug("Inserting word into trie:", word);
      let node = this.root;
      for (const char of word) {
        if (!node.children[char]) {
          node.children[char] = new TrieNode();
        }
        node = node.children[char];
      }
      if(!node.isEndOfWord){
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
        if(node.isEndOfWord){
          this.count--;
        }
        node.isEndOfWord = false;
        node.type = TrieEntryType.NONE;
      }
    size(){
      return this.count;
    }

    setActionHistory(history: ActionHistoryType[]){
      this.actionHistory = history;
    }

    getLastAccessed(){
      return this.lastAccessed;
    }

    setLastAccessed(lastAccessed: number){
      this.lastAccessed = lastAccessed;
    }

    getCurrentIndex(){
      return this.currentIndex;
    }

    getActionHistory(){
      return this.actionHistory;
    }

    setCurrentIndex(index: number){
      this.currentIndex = index;
    }

    getDeletedCount(){
      return this.deletedCount;
    }

    getDeletedMediaSize(){
      return this.deletedMediaSize;
    }

    getTotalCount(){
      return this.totalCount;
    }

    getProgress(){
      return this.getCurrentIndex() / this.getTotalCount()
    }

    setTotalCount(totalCount: number){
      this.totalCount = totalCount;
    }

    incrementDeletedMediaSize(sessionDeletedMediaSize: number){
      this.deletedMediaSize += sessionDeletedMediaSize;
    }

    incrementDeletedCount(sessionDeleteCount: number){
      this.deletedCount += sessionDeleteCount;
    }

    incrementKeptCount(sessionKeptCount: number = 1){
      this.keptCount += sessionKeptCount;
    }
  
    toSerializedString(): string {
      // store all data of this trie to a single string, root, count, name, currentIndex
     console.debug("Saving trie to storage:", JSON.stringify(this));

      return JSON.stringify(this);
    
    }
  
  
    static fromSerializedString(serializedObjString: string) {
      // load all data from the serialized string
      try{
        const {root, count, type, totalCount, deletedCount, keptCount, deletedMediaSize,
          lastAccessed, name, currentIndex, actionHistory
          } = JSON.parse(serializedObjString);
        // console debug every step
        console.debug("Loaded trie from storage:", JSON.parse(serializedObjString));
        const trie = new Trie(name, type);
        trie.root = root;
        trie.count = count;
        trie.totalCount = totalCount;
        trie.deletedCount = deletedCount;
        trie.keptCount = keptCount;
        trie.deletedMediaSize = deletedMediaSize;
        trie.lastAccessed = lastAccessed;
        trie.name = name;
        trie.currentIndex = currentIndex;
        trie.actionHistory = actionHistory;
        return trie;
      } catch (error) {
        console.error("Failed to load trie from storage:", error);
        throw error;
      }
    }
  }
  
  export default Trie;
  