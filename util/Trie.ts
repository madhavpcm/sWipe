import { TrieEntryType } from "@/common/types/TrieTypes";
import { saveToAsyncStorage, saveTrieToAsycStorage } from "./AsyncStorageUtil";
import { ActionHistoryType, SwipeSerializable } from "@/common/types/SwipeMediaTypes";

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
    currentIndex: number;
    actionHistory: ActionHistoryType[];

    constructor(name: string) {
      this.root = new TrieNode();
      this.count = 0;
      this.name = name;
      this.currentIndex = -1;
      this.actionHistory = [];
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

    getCurrentIndex(){
      return this.currentIndex;
    }

    getActionHistory(){
      return this.actionHistory;
    }

    setCurrentIndex(index: number){
      this.currentIndex = index;
    }
  
    toSerializedString(): string {
      // store all data of this trie to a single string, root, count, name, currentIndex
     console.debug("Saving trie to storage:", JSON.stringify(this));

      return JSON.stringify(this);
    
    }
  
  
    static fromSerializedString(serializedObjString: string) {
      // load all data from the serialized string
      try{
      const {root, count, name, currentIndex, actionHistory} = JSON.parse(serializedObjString);
        const test = JSON.parse(serializedObjString);
      // console debug every step
      console.debug("Loaded trie from storage:", test);
      const trie = new Trie(name);
      trie.root = root;
      trie.count = count;
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
  