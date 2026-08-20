const { withAndroidManifest, AndroidConfig } = require("expo/config-plugins");

const PERMISSOES_HEALTH_CONNECT = [
  "android.permission.health.READ_STEPS",
  "android.permission.health.READ_DISTANCE",
  "android.permission.health.READ_HEART_RATE",
];

// Config plugin custom pro Health Connect: adiciona as permissões de leitura
// no AndroidManifest.xml (só leitura, sem escrita — app não grava no Health Connect).
function withHealthConnect(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    for (const permissao of PERMISSOES_HEALTH_CONNECT) {
      AndroidConfig.Permissions.addPermission(manifest, permissao);
    }
    return config;
  });
}

module.exports = withHealthConnect;
