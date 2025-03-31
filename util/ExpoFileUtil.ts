import * as FileSystem from 'expo-file-system';

export async function getAssetSize(assetUri: string) {
    try {
        const fileInfo = await FileSystem.getInfoAsync(assetUri);
        if (fileInfo.exists) {
            console.debug(`File size: ${fileInfo.size} bytes`);
            return fileInfo.size;
        } else {
            console.debug('File does not exist.');
            return null;
        }
    } catch (error) {
        console.error('Error retrieving file info:', error);
        return null;
    }
}

export async function getAssetsSize(assetUris: string[]) {
    let totalSize = 0;
    for (const assetUri of assetUris) {
        const size = await getAssetSize(assetUri);
        if (size !== null) {
            totalSize += size;
        }
    }
    return totalSize;
}
