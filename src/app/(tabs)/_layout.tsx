import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const TAB_BAR_BASE_HEIGHT = 56;

const TAB_ITEMS: { name: string; label: string; icon: IoniconName; iconActive: IoniconName }[] = [
  { name: "dashboard",    label: "Home",      icon: "home-outline",       iconActive: "home" },
  { name: "quests",       label: "Missões",   icon: "shield-outline",     iconActive: "shield" },
  { name: "log-activity", label: "Registrar", icon: "add-circle-outline", iconActive: "add-circle" },
  { name: "profile",      label: "Perfil",    icon: "person-outline",     iconActive: "person" },
];

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: TAB_BAR_BASE_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      {TAB_ITEMS.map((item) => (
        <Tabs.Screen
          key={item.name}
          name={item.name}
          options={{
            title: item.label,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? item.iconActive : item.icon}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
