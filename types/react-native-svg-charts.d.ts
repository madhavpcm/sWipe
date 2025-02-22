declare module 'react-native-svg-charts' {
  import { ViewStyle } from 'react-native';

  interface PieChartData {
    value: number;
    key: string;
    svg: {
      fill: string;
    };
  }

  interface PieChartProps {
    style?: ViewStyle;
    data: PieChartData[];
    innerRadius?: string | number;
    padAngle?: number;
  }

  export class PieChart extends React.Component<PieChartProps> {}
} 