import { Platform } from "react-native";

export interface SyncHealthResult {
  steps: number;
  distanceKm?: number;
  avgHeartRateBpm?: number;
  source: "healthkit" | "health_connect";
}

const PASSADA_MEDIA_M = 0.762; // passada média de caminhada

// Estimativa de distância a partir dos passos — usada quando o Health Connect
// não tem registro real de distância (comum em uso passivo, sem treino rastreado).
export function estimarDistanciaKm(steps: number): number | undefined {
  return steps > 0 ? (steps * PASSADA_MEDIA_M) / 1000 : undefined;
}

// Texto do InfoButton no card de SAÚDE.
export const EXPLICACAO_SAUDE = [
  "Passos e distância vêm do sensor do celular, via Samsung Health / Health Connect.",
  "A distância marcada com ~ é uma estimativa a partir dos passos. Para distância real, faça um treino rastreado (Caminhada/Corrida) no app de saúde.",
  "FC Média só aparece se você usar um relógio ou pulseira que meça frequência cardíaca — o celular sozinho não mede.",
];

export async function requestHealthPermissions(): Promise<boolean> {
  if (Platform.OS === "ios") return requestHealthKitPermissions();
  if (Platform.OS === "android") return requestHealthConnectPermissions();
  return false;
}

export async function syncTodayHealthData(): Promise<SyncHealthResult> {
  if (Platform.OS === "ios") return syncHealthKitToday();
  if (Platform.OS === "android") return syncHealthConnectToday();
  throw new Error("Sincronização de saúde não é suportada nesta plataforma.");
}

function inicioDoDiaISO(): string {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  return inicio.toISOString();
}

// ─── iOS: HealthKit ─────────────────────────────────────────────────────────

function carregarAppleHealthKit() {
  try {
    return require("react-native-health").default;
  } catch {
    throw new Error("Módulo nativo do HealthKit não está disponível neste build.");
  }
}

function requestHealthKitPermissions(): Promise<boolean> {
  const AppleHealthKit = carregarAppleHealthKit();
  const permissions = {
    permissions: {
      read: [
        AppleHealthKit.Constants.Permissions.StepCount,
        AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
        AppleHealthKit.Constants.Permissions.HeartRate,
      ],
      write: [],
    },
  };
  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(permissions, (error: string) => resolve(!error));
  });
}

function syncHealthKitToday(): Promise<SyncHealthResult> {
  const AppleHealthKit = carregarAppleHealthKit();
  const options = { startDate: inicioDoDiaISO(), endDate: new Date().toISOString() };

  const passos = new Promise<number>((resolve, reject) => {
    AppleHealthKit.getStepCount(options, (err: string, results: { value: number }) => {
      if (err) reject(new Error(err));
      else resolve(Math.round(results.value));
    });
  });

  const distancia = new Promise<number | undefined>((resolve) => {
    AppleHealthKit.getDistanceWalkingRunning(options, (err: string, results: { value: number }) => {
      resolve(err ? undefined : results.value / 1000);
    });
  });

  const frequenciaCardiaca = new Promise<number | undefined>((resolve) => {
    AppleHealthKit.getHeartRateSamples(options, (err: string, results: { value: number }[]) => {
      if (err || !results?.length) return resolve(undefined);
      const media = results.reduce((soma, r) => soma + r.value, 0) / results.length;
      resolve(Math.round(media));
    });
  });

  return Promise.all([passos, distancia, frequenciaCardiaca]).then(
    ([steps, distanceKm, avgHeartRateBpm]) => ({ steps, distanceKm, avgHeartRateBpm, source: "healthkit" as const })
  );
}

// ─── Android: Health Connect ────────────────────────────────────────────────

const PERMISSOES_HEALTH_CONNECT = [
  { accessType: "read", recordType: "Steps" },
  { accessType: "read", recordType: "Distance" },
  { accessType: "read", recordType: "HeartRate" },
] as const;

async function requestHealthConnectPermissions(): Promise<boolean> {
  const {
    initialize,
    requestPermission,
    getGrantedPermissions,
    getSdkStatus,
    SdkAvailabilityStatus,
  } = await import("react-native-health-connect");

  // Sem esse guard, chamar requestPermission num aparelho sem o Health Connect
  // (Android <14 sem o app instalado) lança exceção nativa e fecha o app.
  const status = await getSdkStatus();
  if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE) {
    throw new Error(
      "O Health Connect não está disponível neste aparelho. No Android 13 ou anterior, instale o app Health Connect pela Play Store."
    );
  }
  if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
    throw new Error("Atualize o app Health Connect pela Play Store para sincronizar seus dados.");
  }

  const inicializado = await initialize();
  if (!inicializado) return false;

  // Se já temos tudo concedido, não reabre o diálogo (importante pro auto-sync).
  const jaConcedidas = await getGrantedPermissions();
  const temTudo = PERMISSOES_HEALTH_CONNECT.every((p) =>
    jaConcedidas.some(
      (g) => g.accessType === p.accessType && g.recordType === p.recordType
    )
  );
  if (temTudo) return true;

  const concedidas = await requestPermission([...PERMISSOES_HEALTH_CONNECT]);
  return concedidas.length > 0;
}

async function syncHealthConnectToday(): Promise<SyncHealthResult> {
  const { readRecords } = await import("react-native-health-connect");
  const timeRangeFilter = {
    operator: "between" as const,
    startTime: inicioDoDiaISO(),
    endTime: new Date().toISOString(),
  };

  const [passosResult, distanciaResult, frequenciaResult] = await Promise.all([
    readRecords("Steps", { timeRangeFilter }),
    readRecords("Distance", { timeRangeFilter }),
    readRecords("HeartRate", { timeRangeFilter }),
  ]);

  const steps = passosResult.records.reduce((soma, r) => soma + r.count, 0);
  const distanciaTotal = distanciaResult.records.reduce((soma, r) => soma + r.distance.inKilometers, 0);
  const distanceKm = distanciaTotal > 0 ? distanciaTotal : undefined;

  const amostrasFC = frequenciaResult.records.flatMap((r) => r.samples);
  const avgHeartRateBpm = amostrasFC.length
    ? Math.round(amostrasFC.reduce((soma, s) => soma + s.beatsPerMinute, 0) / amostrasFC.length)
    : undefined;

  return { steps, distanceKm, avgHeartRateBpm, source: "health_connect" };
}
