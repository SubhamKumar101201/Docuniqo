import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/(root)/(tabs)");
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" />
    </View>
  );
}
