const {
  withAndroidManifest,
  withMainActivity,
  AndroidConfig,
} = require("expo/config-plugins");

const PERMISSOES_HEALTH_CONNECT = [
  "android.permission.health.READ_STEPS",
  "android.permission.health.READ_DISTANCE",
  "android.permission.health.READ_HEART_RATE",
];

const HEALTH_CONNECT_PACKAGE = "com.google.android.apps.healthdata";

const DELEGATE_IMPORT =
  "import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate";
const DELEGATE_CALL = "HealthConnectPermissionDelegate.setPermissionDelegate(this)";

// Config plugin custom pro Health Connect. Complementa o plugin oficial
// (react-native-health-connect), que só adiciona a action de rationale no manifest.
// Aqui fazemos o que falta:
//   1. Permissões de leitura no AndroidManifest (só leitura, app não grava).
//   2. Visibilidade do pacote do Health Connect (obrigatório no targetSdk >= 30).
//   3. Intent filter VIEW_PERMISSION_USAGE exigido pelo fluxo de permissão do Android 14+.
//   4. Chamada de HealthConnectPermissionDelegate.setPermissionDelegate(this) no
//      onCreate da MainActivity — sem isso o ActivityResultLauncher da lib fica
//      lateinit não inicializado e requestPermission() derruba o app
//      (kotlin.UninitializedPropertyAccessException).
function withManifest(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;

    for (const permissao of PERMISSOES_HEALTH_CONNECT) {
      AndroidConfig.Permissions.addPermission(manifest, permissao);
    }

    manifest.manifest.queries = manifest.manifest.queries ?? [];
    const temPackage = manifest.manifest.queries.some((q) =>
      (q.package ?? []).some((p) => p.$?.["android:name"] === HEALTH_CONNECT_PACKAGE)
    );
    if (!temPackage) {
      manifest.manifest.queries.push({
        package: [{ $: { "android:name": HEALTH_CONNECT_PACKAGE } }],
      });
    }

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

function withPermissionDelegate(config) {
  return withMainActivity(config, (config) => {
    if (config.modResults.language !== "kt") {
      throw new Error(
        "withHealthConnect: esperava MainActivity.kt, encontrei " + config.modResults.language
      );
    }

    let src = config.modResults.contents;

    if (!src.includes(DELEGATE_IMPORT)) {
      src = src.replace(/^(package .+)$/m, `$1\n\n${DELEGATE_IMPORT}`);
    }

    if (!src.includes(DELEGATE_CALL)) {
      const anchor = /(super\.onCreate\([^)]*\)\n)/;
      if (!anchor.test(src)) {
        throw new Error(
          "withHealthConnect: não achei super.onCreate() na MainActivity pra injetar o delegate"
        );
      }
      // registerForActivityResult tem que rodar depois do super.onCreate e antes de STARTED
      src = src.replace(anchor, `$1    ${DELEGATE_CALL}\n`);
    }

    config.modResults.contents = src;
    return config;
  });
}

module.exports = function withHealthConnect(config) {
  config = withManifest(config);
  config = withPermissionDelegate(config);
  return config;
};
