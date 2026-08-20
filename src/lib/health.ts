import { Platform } from "react-native";

export interface SyncHealthResult {
  steps: number;
  distanceKm?: number;
  avgHeartRateBpm?: number;
  source: "healthkit" | "health_connect";
}

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

function requestHealthKitPermissions(): Promise<boolean> {
  const AppleHealthKit = require("react-native-health").default;
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
  const AppleHealthKit = require("react-native-health").default;
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

async function requestHealthConnectPermissions(): Promise<boolean> {
  const { initialize, requestPermission } = await import("react-native-health-connect");
  const inicializado = await initialize();
  if (!inicializado) return false;
  const concedidas = await requestPermission([
    { accessType: "read", recordType: "Steps" },
    { accessType: "read", recordType: "Distance" },
    { accessType: "read", recordType: "HeartRate" },
  ]);
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
