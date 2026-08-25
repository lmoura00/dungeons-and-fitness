import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";
import { useSession } from "../hooks/useSession";
import { obterBoasVindasVista } from "../lib/auth";
import { Colors } from "../constants/Colors";

export default function Index() {
  const { isAuthenticated, isLoadingSession } = useSession();
  const [boasVindasVista, setBoasVindasVista] = useState<boolean | null>(null);

  useEffect(() => {
    obterBoasVindasVista().then(setBoasVindasVista);
  }, []);

  if (isLoadingSession || boasVindasVista === null) {
    return <View style={{ flex: 1, backgroundColor: Colors.background }} />;
  }

  if (isAuthenticated) return <Redirect href="/(tabs)/dashboard" />;
  if (boasVindasVista) return <Redirect href="/(auth)" />;
  return <Redirect href="/(auth)/welcome" />;
}
