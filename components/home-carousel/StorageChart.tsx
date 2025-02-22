import { View, Text } from 'react-native';
import { PieChart } from 'react-native-svg-charts';

interface StorageInfo {
  totalSpace: string;
  freeSpace: string;
  usedSpace: string;
}

interface StorageChartProps {
  storageInfo: StorageInfo;
}

export default function StorageChart({ storageInfo }: StorageChartProps) {
  const data = [
    {
      value: parseFloat(storageInfo.usedSpace),
      key: 'Used',
      svg: { fill: '#FF6B6B' },
    },
    {
      value: parseFloat(storageInfo.freeSpace),
      key: 'Free',
      svg: { fill: '#51CF66' },
    },
  ];

  return (
    <View className="flex-row items-center justify-center gap-4">
      <View className="w-40 h-40 relative">
        <PieChart
          style={{ height: 160 }}
          data={data}
          innerRadius="70%"
          padAngle={0}
        />
        <View className="absolute inset-0 items-center justify-center">
          <Text className="text-lg font-bold">{storageInfo.totalSpace}</Text>
          <Text className="text-xs">Total GB</Text>
        </View>
      </View>
      <View className="gap-3">
        {data.map((item) => (
          <View key={item.key} className="flex-row items-center gap-2">
            <View style={{ backgroundColor: item.svg.fill }} className="w-3 h-3 rounded-full" />
            <View>
              <Text className="font-medium text-sm">{item.key}</Text>
              <Text className="text-gray-600 text-xs">{item.value.toFixed(2)} GB</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
} 