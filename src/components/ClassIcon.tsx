import React from "react";
import { View, Image, ImageSourcePropType, StyleProp, ViewStyle } from "react-native";
import { Colors } from "../constants/Colors";

interface ClassIconProps {
  source: ImageSourcePropType;
  size: number;
  style?: StyleProp<ViewStyle>;
}

export function ClassIcon({ source, size, style }: ClassIconProps) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          backgroundColor: Colors.surfaceDark,
        },
        style,
      ]}
    >
      <Image
        source={source}
        resizeMode="contain"
        style={{ width: "100%", height: "100%" }}
      />
    </View>
  );
}
