import { View, Text } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

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
      color: '#FF6B6B',
      text: 'Used',
      focused: true,
      shiftRadius: 3
    },
    {
      value: parseFloat(storageInfo.freeSpace),
      color: '#51CF66',
      text: 'Free'
    },
  ];

  return (
    <View className="flex-row items-center justify-center gap-4">
      <PieChart
        data={data}
        donut
        showText={false}
        radius={80}
        innerRadius={60}
        focusOnPress
        isAnimated = {true} 
        animationDuration={1000}
        initialAngle={-90}
        centerLabelComponent={() => (
          <View className="items-center">
            <Text className="text-lg font-bold">{storageInfo.totalSpace}</Text>
            <Text className="text-xs">Total GB</Text>
          </View>
        )}
        shadowColor={'#00000020'}
        shadowWidth={2}
        strokeWidth={1}
        strokeColor={'#ffffff'}
      />
      <View className="gap-3">
        {data.map((item, index) => (
          <View key={index} className="flex-row items-center gap-2">
            <View style={{ backgroundColor: item.color }} className="w-3 h-3 rounded-full" />
            <View>
              <Text className="font-medium text-sm">{item.text}</Text>
              <Text className="text-gray-600 text-xs">{item.value.toFixed(2)} GB</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
} 