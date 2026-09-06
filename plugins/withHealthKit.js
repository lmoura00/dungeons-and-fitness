const { withInfoPlist, withEntitlementsPlist } = require("expo/config-plugins");

const DESCRICAO_LEITURA_SAUDE =
  "Usamos seus dados de saúde (passos, distância e frequência cardíaca) para sincronizar seu progresso no app.";

// A Apple exige NSHealthUpdateUsageDescription mesmo sem escrita real: a lib
// react-native-health referencia as APIs de escrita do HealthKit internamente,
// e a validação estática da App Store reclama da string ausente (ITMS-90683).
const DESCRICAO_ESCRITA_SAUDE =
  "O app não grava dados de saúde, apenas lê passos, distância e frequência cardíaca para sincronizar seu progresso.";

// Config plugin custom pro HealthKit: adiciona a usage description no Info.plist
// e a entitlement de HealthKit — sem isso o iOS mata o app ao acessar a API (só leitura, sem escrita).
function withHealthKit(config) {
  config = withInfoPlist(config, (config) => {
    config.modResults.NSHealthShareUsageDescription = DESCRICAO_LEITURA_SAUDE;
    config.modResults.NSHealthUpdateUsageDescription = DESCRICAO_ESCRITA_SAUDE;
    return config;
  });

  config = withEntitlementsPlist(config, (config) => {
    config.modResults["com.apple.developer.healthkit"] = true;
    config.modResults["com.apple.developer.healthkit.access"] = [];
    return config;
  });

  return config;
}

module.exports = withHealthKit;
