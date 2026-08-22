import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  // iOS → Native Tabs
  if (Platform.OS === "ios") {
    return (
      <NativeTabs>
        {/* HOME */}
        <NativeTabs.Trigger name="index">
          <Icon
            sf={{
              default: "house",
              selected: "house.fill",
            }}
          />
          <Label>Home</Label>
        </NativeTabs.Trigger>

        {/* ACCOUNT */}
        <NativeTabs.Trigger name="profile">
          <Icon
            sf={{
              default: "person",
              selected: "person.fill",
            }}
          />
          <Label>Account</Label>
        </NativeTabs.Trigger>

        {/* SETTINGS */}
        {/* <NativeTabs.Trigger name="settings">
          <Icon
            sf={{
              default: "gearshape",
              selected: "gearshape.fill",
            }}
          />
          <Label>Settings</Label>
        </NativeTabs.Trigger> */}
      </NativeTabs>
    );
  }

  // Android → Regular Expo Router Tabs
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#8B9099",

        tabBarStyle: {
          height: 70 + insets.bottom,
          paddingTop: 8,
          borderTopWidth: 1,
          backgroundColor: "#17191D",
          borderTopColor: "#2A2D33",
          paddingBottom: insets.bottom + 8,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",

          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* ACCOUNT */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Account",

          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name={focused ? "account" : "account-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* SETTINGS */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",

          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name={focused ? "cog" : "cog-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
