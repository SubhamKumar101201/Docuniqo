import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";

// ==================================================
// Full-bleed gradient background (replaces the wave
// illustration). Sits behind the SafeAreaView so there
// is no gap at the very top/bottom edges of the screen.
// ==================================================

export function GradientBackground() {
  return (
    <LinearGradient
      colors={["#FAFCFD", "#EAFBFA", "#CFF3F1"]}
      locations={[0, 0.55, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={StyleSheet.absoluteFillObject}
    />
  );
}
