import { View, Text } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import { useMemo } from 'react';

interface StorageInfo {
  totalSpace: string;
  freeSpace: string;
  usedSpace: string;
}

interface StorageChartProps {
  storageInfo: StorageInfo;
}

export default function StorageChart({ storageInfo }: StorageChartProps) {
  const usedPercentage = useMemo(() => {
    const total = parseFloat(storageInfo.totalSpace);
    const used = parseFloat(storageInfo.usedSpace);
    return Math.round((used / total) * 100);
  }, [storageInfo]);

  return (
    <View className="items-center py-4">
      <Text className="text-base font-medium text-gray-500 mb-4">Storage Overview</Text>
      <View className="flex-row items-center gap-8">
        <CircularProgress
          value={usedPercentage}
          radius={60}
          duration={2000}
          progressValueColor={'#1a1a1a'}
          maxValue={100}
          valueSuffix={'%'}
          activeStrokeColor={'#FF6B6B'}
          inActiveStrokeColor={'#51CF66'}
          inActiveStrokeOpacity={0.2}
          inActiveStrokeWidth={6}
          activeStrokeWidth={12}
        />
        <View className="gap-4">
          <View>
            <Text className="text-sm text-gray-500">Total Space</Text>
            <Text className="text-lg font-bold">{storageInfo.totalSpace} GB</Text>
          </View>
          <View>
            <Text className="text-sm text-gray-500">Used Space</Text>
            <Text className="text-lg font-bold text-red-400">{storageInfo.usedSpace} GB</Text>
          </View>
          <View>
            <Text className="text-sm text-gray-500">Free Space</Text>
            <Text className="text-lg font-bold text-green-500">{storageInfo.freeSpace} GB</Text>
          </View>
        </View>
      </View>
    </View>
  );
} 