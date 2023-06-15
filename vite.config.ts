import { defineConfig } from "vite";
import EnvironmentPlugin from "vite-plugin-environment";

export default defineConfig({
  plugins: [
    EnvironmentPlugin({
      PLAYER_1_WALLET_MNEMONIC: undefined,
      PLAYER_2_WALLET_MNEMONIC: undefined,
      DICE_CONTRACT_ADDRESS: undefined,
      DICE_CONTRACT_CODE_HASH: undefined,
      SECRET_NETWORK_URL: undefined,
    }),
  ],
});
