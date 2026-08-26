import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Tabs } from "expo-router";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, radii } from "../../constants/Colors";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const TAB_BAR_HEIGHT = 56;
const TAB_BAR_BOTTOM_SPACING = 8;
const REGISTER_ROUTE = "log-activity";

const TAB_ITEMS: { name: string; label: string; icon: IoniconName; iconActive: IoniconName }[] = [
  { name: "dashboard",      label: "Home",      icon: "home-outline",   iconActive: "home" },
  { name: "quests",         label: "Missões",   icon: "shield-outline", iconActive: "shield" },
  { name: REGISTER_ROUTE,   label: "Registrar", icon: "add",            iconActive: "add" },
  { name: "guild",          label: "Guilda",    icon: "people-outline", iconActive: "people" },
  { name: "profile",        label: "Perfil",    icon: "person-outline", iconActive: "person" },
];

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = (insets.bottom > 0 ? insets.bottom : 8) + TAB_BAR_BOTTOM_SPACING;

  // Chat da guilda ocupa o espaço até embaixo — o FAB flutuante do meio
  // atrapalha o input nessa tela, então some com ele só ali.
  const guildRoute = state.routes.find((r) => r.name === "guild");
  const guildFocusedRoute = guildRoute ? getFocusedRouteNameFromRoute(guildRoute) : undefined;
  const esconderRegistrar = state.routes[state.index]?.name === "guild" && guildFocusedRoute === "chat";

  return (
    <View
      style={[
        styles.bar,
        { height: TAB_BAR_HEIGHT + bottomPadding, paddingBottom: bottomPadding },
      ]}
    >
      {state.routes.map((route, index) => {
        const item = TAB_ITEMS.find((t) => t.name === route.name);
        if (!item) return null;

        const isFocused = state.index === index;
        const isRegister = route.name === REGISTER_ROUTE;
        if (isRegister && esconderRegistrar) return null;

        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (isRegister) {
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[styles.registerWrapper, isFocused && styles.registerWrapperActive]}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <View style={isFocused ? undefined : styles.registerGlow}>
                <View style={[styles.registerFab, isFocused && styles.registerFabActive]}>
                  <Ionicons name={item.icon} size={24} color={Colors.textOnPrimary} />
                </View>
              </View>
              <Text style={styles.registerLabel}>{item.label}</Text>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <Ionicons
              name={isFocused ? item.iconActive : item.icon}
              size={22}
              color={isFocused ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.tabLabel, { color: isFocused ? Colors.primary : Colors.textSecondary }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {TAB_ITEMS.map((item) => (
        <Tabs.Screen key={item.name} name={item.name} options={{ title: item.label }} />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  registerWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: -20,
  },
  registerWrapperActive: {
    marginTop: 0,
  },
  registerGlow: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: Colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  registerFab: {
    width: 46,
    height: 46,
    borderRadius: radii.full,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.surface,
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  registerFabActive: {
    width: 40,
    height: 40,
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  registerLabel: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: "700",
    color: Colors.primary,
  },
});
