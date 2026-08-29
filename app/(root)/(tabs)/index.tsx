import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const recentScans = [
  {
    id: "1",
    name: "Invoice_2024-05-20",
    date: "20 May 2024",
    time: "2:30 PM",
    type: "PDF",
    icon: "document-text-outline",
  },
  {
    id: "2",
    name: "Receipt_2024-05-20",
    date: "20 May 2024",
    time: "1:15 PM",
    type: "PDF",
    icon: "receipt-outline",
  },
  {
    id: "3",
    name: "ID Card_2024-05-19",
    date: "19 May 2024",
    time: "4:45 PM",
    type: "PDF",
    icon: "card-outline",
  },
  {
    id: "4",
    name: "Contract_2024-05-18",
    date: "18 May 2024",
    time: "11:20 AM",
    type: "PDF",
    icon: "document-outline",
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <View className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-28"
        >
          {/* ================= HEADER ================= */}
          <View className="px-5 pt-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-[18px] font-bold text-[#0B1736]">Home</Text>

              <Pressable
                className="h-9 w-9 items-center justify-center rounded-full"
                activeOpacity={0.7}
              >
                <Ionicons
                  name="notifications-outline"
                  size={21}
                  color="#0B1736"
                />
              </Pressable>
            </View>
          </View>

          {/* ================= WELCOME CARD ================= */}
          <View className="mx-5 mt-5 overflow-hidden rounded-2xl bg-[#F0F8FF] px-4 py-4">
            <View className="flex-row items-center">
              {/* Text */}
              <View className="flex-1 pr-2">
                <Text className="text-[13px] font-bold text-[#0B1736]">
                  Welcome back! 👋
                </Text>

                <Text className="mt-1 text-[10px] leading-[15px] text-[#71809A]">
                  Scan, save and manage
                </Text>

                <Text className="text-[10px] leading-[15px] text-[#71809A]">
                  your documents easily.
                </Text>
              </View>

              {/* Document illustration */}
              <View className="h-[70px] w-[82px] items-center justify-end">
                {/* Back document */}
                <View className="absolute right-4 top-1 h-[43px] w-[34px] rounded-md bg-white shadow-sm">
                  <View className="ml-2 mt-2 h-1.5 w-5 rounded-full bg-[#D8EAF7]" />
                  <View className="ml-2 mt-1.5 h-1.5 w-4 rounded-full bg-[#D8EAF7]" />
                  <View className="ml-2 mt-1.5 h-1.5 w-5 rounded-full bg-[#D8EAF7]" />
                </View>

                {/* Folder */}
                <View className="h-[34px] w-[58px] rounded-b-lg rounded-tr-lg bg-[#168FEA]">
                  <View className="absolute -top-2 left-0 h-3 w-7 rounded-t-md bg-[#168FEA]" />

                  <View className="absolute left-2 top-1 h-[25px] w-[40px] rounded-md bg-[#42A8F2]" />
                </View>
              </View>
            </View>
          </View>

          {/* ================= RECENT SCANS ================= */}
          <View className="mt-6 px-5">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[13px] font-bold text-[#0B1736]">
                Recent Scans
              </Text>

              <Pressable activeOpacity={0.7}>
                <Text className="text-[10px] font-bold text-[#16AFA9]">
                  See All
                </Text>
              </Pressable>
            </View>

            {/* Scan list */}
            <View className="gap-2">
              {recentScans.map((scan) => (
                <Pressable
                  key={scan.id}
                  activeOpacity={0.7}
                  className="flex-row items-center rounded-xl bg-white py-2"
                >
                  {/* Document preview */}
                  <View className="h-[48px] w-[42px] items-center justify-center overflow-hidden rounded-lg border border-[#EEF1F4] bg-[#F7F9FB]">
                    <Ionicons
                      name={scan.icon as any}
                      size={22}
                      color="#AAB5C3"
                    />

                    <View className="mt-1 h-[2px] w-5 rounded-full bg-[#DCE3EA]" />
                    <View className="mt-1 h-[2px] w-4 rounded-full bg-[#DCE3EA]" />
                  </View>

                  {/* Details */}
                  <View className="ml-3 flex-1">
                    <Text
                      numberOfLines={1}
                      className="text-[10px] font-semibold text-[#0B1736]"
                    >
                      {scan.name}
                    </Text>

                    <Text className="mt-1 text-[9px] text-[#8A94A3]">
                      {scan.date} • {scan.time}
                    </Text>

                    <Text className="mt-0.5 text-[8px] text-[#8A94A3]">
                      {scan.type}
                    </Text>
                  </View>

                  {/* More */}
                  <Pressable
                    hitSlop={10}
                    className="h-9 w-8 items-center justify-center"
                  >
                    <Ionicons
                      name="ellipsis-vertical"
                      size={17}
                      color="#607087"
                    />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* ================= BOTTOM NAV ================= */}
      </View>
    </SafeAreaView>
  );
}
