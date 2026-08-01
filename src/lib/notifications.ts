import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Solicita permissão e retorna o Expo push token do device, ou null se negado
// ou rodando em simulador/emulador (push só funciona em device físico).
export async function obterPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: statusAtual } = await Notifications.getPermissionsAsync();
  let status = statusAtual;
  if (status !== "granted") {
    const resultado = await Notifications.requestPermissionsAsync();
    status = resultado.status;
  }
  if (status !== "granted") return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const { data } = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );
  return data;
}
