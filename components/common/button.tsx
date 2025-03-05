import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type GradientColors = [string, string, ...string[]];
type SizeType = 'sm' | 'md' | 'xl';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  /**
   * Gradient colors as a tuple with at least two colors.
   * Default: a darker blue gradient.
   */
  gradientColors?: GradientColors;
  /**
   * Additional class names for the container.
   * (Works if you have a Babel/Metro plugin to transform className)
   */
  containerClassName?: string;
  /**
   * Additional class names for the text.
   * (Works if you have a Babel/Metro plugin to transform className)
   */
  textClassName?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  size?: SizeType;
  /**
   * Control the border radius of the gradient container.
   * If provided, it will override the default rounding.
   */
  borderRadius?: number;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  // Darker blue gradient by default.
  gradientColors = ['#3b82f6', '#2563eb'] as GradientColors,
  containerClassName = '',
  textClassName = '',
  icon,
  iconPosition = 'left',
  size = 'md',
  borderRadius,
  ...touchableProps
}) => {
  const sizeMapping = {
    sm: {
      container: 'h-12 w-32',
      text: 'text-base',
    },
    md: {
      container: 'h-16 w-48',
      text: 'text-2xl',
    },
    xl: {
      container: 'h-20 w-56',
      text: 'text-3xl',
    },
  };

  const { container, text } = sizeMapping[size];

  return (
    <TouchableOpacity {...touchableProps}>
      <LinearGradient
        colors={gradientColors}
        start={[0, 0] as [number, number]}
        end={[1, 1] as [number, number]}
        className={`${container} flex justify-center items-center rounded-xl ${containerClassName}`}
        // If borderRadius is provided, add it as an inline style to override the class.
        style={borderRadius != null ? { borderRadius } : undefined}
      >
        <View className="flex-row items-center space-x-2">
          {icon && iconPosition === 'left' && <View>{icon}</View>}
          <Text className={`${text} font-rubik-semibold text-white ${textClassName}`}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && <View>{icon}</View>}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default Button;
