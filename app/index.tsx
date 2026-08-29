import { WavyBackground } from "@/components/WavyBackground";
import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, Text, View } from "react-native";

const ONBOARDING_KEY = "docunigo_onboarding_completed";

export default function Index() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    const checkAppState = async () => {
      // Small opening/splash delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Already logged in → Home
      if (isSignedIn) {
        router.replace("/(root)" as any);
        return;
      }

      // Check whether onboarding was already completed/skipped
      // const onboardingCompleted = await AsyncStorage.getItem(ONBOARDING_KEY);
      const onboardingCompleted = false; // DEV ONLY — restore AsyncStorage check before production uncomment the previous line and remove this line

      if (onboardingCompleted) {
        // Returning user but not logged in → Sign In
        router.replace("/(auth)/sign-in");
      } else {
        // First-time user → Introduction
        router.replace("/onboarding");
      }
    };

    checkAppState();
  }, [isLoaded, isSignedIn]);

  return (
    <View className="flex-1 bg-brand-body items-center justify-center">
      <WavyBackground />
      <Image
        source={require("../assets/images/logo.png")}
        className="w-32 h-32"
        resizeMode="contain"
      />

      <Text className="mt-3 text-[28px] leading-[35px] font-bold text-[#0B1736] text-center">
        Docunigo
      </Text>

      <Text className="mt-[5px] text-[15px] leading-[25px] font-bold text-[#16AFA9] text-center">
        Smart Documents. Simplified.
      </Text>
    </View>
  );
}
