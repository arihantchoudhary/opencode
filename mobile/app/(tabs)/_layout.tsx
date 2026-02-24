import { Tabs } from "expo-router";
import { Text } from "react-native";

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: "◉",
    Mentions: "@",
    Profile: "●",
  };
  return (
    <Text style={{ fontSize: 20, color: focused ? "#fff" : "#555" }}>
      {icons[name] || "○"}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#000",
          borderTopColor: "#1a1a1a",
          borderTopWidth: 1,
          paddingBottom: 28,
          paddingTop: 8,
          height: 80,
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#555",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused }) => <TabIcon name="Dashboard" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="mentions"
        options={{
          title: "Mentions",
          tabBarIcon: ({ focused }) => <TabIcon name="Mentions" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
