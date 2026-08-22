import { Pressable, ScrollView, StatusBar, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10"
      >
        {/* Header */}
        <View className="px-6 pb-6 pt-16">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-medium text-blue-400">
                GOOD MORNING 👋
              </Text>

              <Text className="mt-1 text-2xl font-bold text-white">
                Welcome back
              </Text>
            </View>

            {/* Profile */}
            <Pressable className="h-12 w-12 items-center justify-center rounded-full bg-blue-600">
              <Text className="text-lg font-bold text-white">S</Text>
            </Pressable>
          </View>
        </View>

        {/* Hero */}
        <View className="mx-6 overflow-hidden rounded-3xl bg-blue-600 p-6">
          <Text className="text-sm font-semibold text-blue-100">
            YOUR JOURNEY
          </Text>

          <Text className="mt-3 text-3xl font-bold leading-9 text-white">
            Build. Learn.{"\n"}Grow.
          </Text>

          <Text className="mt-4 text-base leading-6 text-blue-100">
            Keep moving forward and turn your ideas into something meaningful.
          </Text>

          <Pressable className="mt-6 self-start rounded-2xl bg-white px-6 py-3 active:opacity-80">
            <Text className="font-bold text-blue-600">Get Started →</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View className="mx-6 mt-6 flex-row gap-4">
          <View className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <Text className="text-3xl font-bold text-white">12</Text>

            <Text className="mt-1 text-sm text-slate-400">Projects</Text>
          </View>

          <View className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <Text className="text-3xl font-bold text-white">86%</Text>

            <Text className="mt-1 text-sm text-slate-400">Completed</Text>
          </View>
        </View>

        {/* Section heading */}
        <View className="mx-6 mt-8 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-white">Quick actions</Text>

          <Text className="text-sm font-medium text-blue-400">See all</Text>
        </View>

        {/* Action cards */}
        <View className="mx-6 mt-4 gap-4">
          <Pressable className="flex-row items-center rounded-2xl border border-slate-800 bg-slate-900 p-4 active:opacity-70">
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <Text className="text-xl">🚀</Text>
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-base font-bold text-white">
                Start a project
              </Text>

              <Text className="mt-1 text-sm text-slate-400">
                Turn your next idea into reality.
              </Text>
            </View>

            <Text className="text-xl text-slate-500">›</Text>
          </Pressable>

          <Pressable className="flex-row items-center rounded-2xl border border-slate-800 bg-slate-900 p-4 active:opacity-70">
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-purple-600">
              <Text className="text-xl">📚</Text>
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-base font-bold text-white">
                Continue learning
              </Text>

              <Text className="mt-1 text-sm text-slate-400">
                Pick up where you left off.
              </Text>
            </View>

            <Text className="text-xl text-slate-500">›</Text>
          </Pressable>

          <Pressable className="flex-row items-center rounded-2xl border border-slate-800 bg-slate-900 p-4 active:opacity-70">
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-emerald-600">
              <Text className="text-xl">📈</Text>
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-base font-bold text-white">
                View progress
              </Text>

              <Text className="mt-1 text-sm text-slate-400">
                Check how far you've come.
              </Text>
            </View>

            <Text className="text-xl text-slate-500">›</Text>
          </Pressable>
        </View>

        {/* Bottom card */}
        <View className="mx-6 mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <Text className="text-sm font-medium text-slate-400">
            TODAY'S TIP
          </Text>

          <Text className="mt-2 text-lg font-bold leading-7 text-white">
            Small progress every day creates big results.
          </Text>

          <Text className="mt-2 text-sm leading-5 text-slate-400">
            Stay consistent, keep learning, and don't be afraid to experiment.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
