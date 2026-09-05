const { withAndroidManifest, AndroidConfig } = require("expo/config-plugins");

const PERMISSOES_HEALTH_CONNECT = [
  "android.permission.health.READ_STEPS",
  "android.permission.health.READ_DISTANCE",
  "android.permission.health.READ_HEART_RATE",
];

const HEALTH_CONNECT_PACKAGE = "com.google.android.apps.healthdata";

// Config plugin custom pro Health Connect. Complementa o plugin oficial
// (react-native-health-connect), que só adiciona a action de rationale.
// Aqui garantimos:
//   1. As permissões de leitura no AndroidManifest (só leitura, app não grava).
//   2. Visibilidade do pacote do Health Connect — obrigatório no targetSdk >= 30,
//      senão o sistema não resolve o provider e requestPermission() crasha.
//   3. Intent filter VIEW_PERMISSION_USAGE exigido pelo fluxo de permissão do Android 14+.
function withHealthConnect(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;

    // 1. Permissões de leitura
    for (const permissao of PERMISSOES_HEALTH_CONNECT) {
      AndroidConfig.Permissions.addPermission(manifest, permissao);
    }

    // 2. <queries><package android:name="com.google.android.apps.healthdata" /></queries>
    manifest.manifest.queries = manifest.manifest.queries ?? [];
    const temPackage = manifest.manifest.queries.some((q) =>
      (q.package ?? []).some((p) => p.$?.["android:name"] === HEALTH_CONNECT_PACKAGE)
    );
    if (!temPackage) {
      manifest.manifest.queries.push({
        package: [{ $: { "android:name": HEALTH_CONNECT_PACKAGE } }],
      });
    }

    // 3. Intent filter de uso de permissão na MainActivity (Android 14+)
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(manifest);
    mainActivity["intent-filter"] = mainActivity["intent-filter"] ?? [];
    const temUsage = mainActivity["intent-filter"].some((f) =>
      (f.action ?? []).some(
        (a) => a.$?.["android:name"] === "android.intent.action.VIEW_PERMISSION_USAGE"
      )
    );
    if (!temUsage) {
      mainActivity["intent-filter"].push({
        action: [{ $: { "android:name": "android.intent.action.VIEW_PERMISSION_USAGE" } }],
        category: [{ $: { "android:name": "android.intent.category.HEALTH_PERMISSIONS" } }],
      });
    }

    return config;
  });
}

module.exports = withHealthConnect;
