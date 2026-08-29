import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ONBOARDING_KEY = "docunigo_onboarding_completed";

const slides = [
  {
    title: "Scan Anything",
    description: "Scan, save and manage your documents easily.",
    image: require("../assets/images/onboarding/onboarding-scan-doc-person.png"),
  },
  {
    title: "Organize Effortlessly",
    description: "Keep your documents organized and easy to find.",
    image: require("../assets/images/onboarding/onboarding-organize.png"),
  },
  {
    title: "Secure & Private",
    description: "Your documents are safe and always private.",
    image: require("../assets/images/onboarding/onboarding-secure.png"),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);

  const finishOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");

    router.replace("/(auth)/sign-in");
  };

  const handleNext = () => {
    if (currentIndex === slides.length - 1) {
      finishOnboarding();
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const currentSlide = slides[currentIndex];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      {/* Background waves */}
      {/* <WavyBackground /> */}

      {/* Main content */}
      <View className="flex-1 px-5">
        {/* Skip */}
        <View className="items-end pt-0.5">
          <TouchableOpacity
            onPress={finishOnboarding}
            activeOpacity={0.7}
            className="px-2 py-2"
          >
            <Text className="text-[#8D96A6] text-[15px]">Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Illustration */}
        <View className="flex-[5] items-center justify-center">
          <Image
            source={currentSlide.image}
            resizeMode="contain"
            className="w-[94%] h-[92%]"
          />
        </View>

        {/* Text + dots + button */}
        <View className="flex-[4] items-center">
          {/* Title */}
          <Text
            className="
              text-[#0B1736]
              text-[30px]
              font-bold
              text-center
              mt-2
            "
          >
            {currentSlide.title}
          </Text>

          {/* Description */}
          <Text
            className="
              text-[#7D8798]
              text-[17px]
              text-center
              leading-6
              mt-3
              max-w-[330px]
            "
          >
            {currentSlide.description}
          </Text>

          {/* Dots */}
          <View className="flex-row items-center gap-3 mt-8">
            {slides.map((_, index) => (
              <View
                key={index}
                className={`
                  rounded-full
                  ${
                    index === currentIndex
                      ? "w-3 h-3 bg-[#0FB8B5]"
                      : "w-2.5 h-2.5 bg-[#D3D9E0]"
                  }
                `}
              />
            ))}
          </View>

          {/* Button */}
          <View className="w-full mt-auto mb-4">
            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.85}
              className="
                w-full
                h-[64px]
                rounded-[20px]
                bg-[#0FB8B5]
                items-center
                justify-center
              "
            >
              <Text className="text-white text-[20px] font-semibold">
                {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
