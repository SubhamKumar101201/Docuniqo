import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

export const WavyBackground = () => {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 800"
        preserveAspectRatio="none"
      >
        {/* Lightest mint */}
        <Path
          d="M0,800 L0,790 C130,740 200,500 450,600 L400,800 Z"
          fill="#E0F4F1"
          opacity={0.65}
        />

        {/* Soft seafoam */}
        <Path
          d="M0,800 L0,790 C140,720 230,580 400,630 L400,800 Z"
          fill="#BEE7E2"
          opacity={0.58}
        />

        {/* Vibrant teal */}
        <Path
          d="M0,800 L0,790 C140,750 250,620 400,675 L400,800 Z"
          fill="#29BCAE"
          opacity={0.45}
        />

        {/* Deep teal */}
        <Path
          d="M0,800 L0,790 C175,800 280,650 450,730 L400,800 Z"
          fill="#009B8F"
          //   opacity={0.45}
        />
      </Svg>
    </View>
  );
};
