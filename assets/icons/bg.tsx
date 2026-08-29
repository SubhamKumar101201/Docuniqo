import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");

export const WavyBackground = () => {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Svg height={height} width={width} viewBox={`0 0 ${width} ${height}`}>
        {/* Layer 1: Topmost Lightest Mint Wave */}
        <Path
          d={`M0,${height * 0.96} 
              C${width * 0.25},${height * 0.88} ${width * 0.55},${height * 0.7} ${width},${height * 0.15} 
              L${width},${height} L0,${height} Z`}
          fill="#E6F7F5"
        />

        {/* Layer 2: Soft Seafoam Wave */}
        <Path
          d={`M0,${height * 0.97} 
              C${width * 0.3},${height * 0.92} ${width * 0.6},${height * 0.7} ${width},${height * 0.3} 
              L${width},${height} L0,${height} Z`}
          fill="#C1EBE5"
        />

        {/* Layer 3: Vibrant Teal Wave */}
        <Path
          d={`M0,${height * 0.985} 
              C${width * 0.35},${height * 0.95} ${width * 0.6},${height * 0.78} ${width},${height * 0.44} 
              L${width},${height} L0,${height} Z`}
          fill="#2BBDAE"
        />

        {/* Layer 4: Dark Deep Teal Wave (Front) */}
        <Path
          d={`M0,${height} 
              C${width * 0.4},${height * 0.97} ${width * 0.65},${height * 0.87} ${width},${height * 0.58} 
              L${width},${height} L0,${height} Z`}
          fill="#009B8E"
        />
      </Svg>
    </View>
  );
};
