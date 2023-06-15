## Secret Dice Dapp

![Secret Dice UI](/public/secret-dice.jpeg)

### About

This project is a simple TypeScript webapp that integrates a front end user interface with the Secret Network blockchain. It showcases how two simulated users can connect to a a smart contract and play a simple dice game. Each player wagers 1 SCRT and contributes to private information the seeds the roll of the dice. The winner of the game is determined by the roll. 1-3 results in player 1 winning, 4-6 results in player 2 winning. The winner of the game receives his wager and the losers wager.

This application is to be used as a learning tool for developers who are interested in learning how to build decentralized applications on the Secret Network blockchain. It is also a great tool for learning how to build TypeScript web applications that integrate with the Secret Network blockchain.

For more information on building dapps with Secret Network. Check out our [front-end pathway](https://scrt.university) for a complete guide.

### Requirements

- [Node.js](https://nodejs.org/en/)
- [Docker](https://www.docker.com/)
- [Rust](https://www.rust-lang.org/)
- [localsecret](https://docs.scrt.network/secret-network-documentation/development/tools-and-libraries/local-secret)

### Technologies Used

- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [SecretJS](https://secretjs.scrt.network/)
- [Three.js](https://threejs.org/)

> Note: This project was built to be lightweight, so that it can be used as a learning tool. It does not use any front end frameworks or libraries. It is built with vanilla TypeScript, but the concepts can be applied to any front end framework or library.

### Installation

1. Clone the repo

   ```sh
   git clone
   ```

2. Install NPM packages
   ```sh
   pnpm install #pnpm is recommended, but npm or yarn should work as well
   ```

### Running the app locally

1. If you have not already setup your environment, take a look at this: [Secret Network: Setting Up Your Environment](https://docs.scrt.network/secret-network-documentation/development/getting-started/setting-up-your-environment). You will need to have a local blockchain running in order to run this application locally.

> Make note of the sections that talk about creating a wallet. For this application, two wallets are required. One for each player. **Record the mnemonic phrases for each wallet as they will be given to our application via environment variables**

2. Once you have your local blockchain running, you will need to deploy the dice smart contract to your local blockchain. You will need to clone the following repo [Secret Dice Contract Pathway](https://github.com/secretuniversity/secret-dice-contract-pathway).

3. Follow these instruction to deploy the dice contract to your local blockchain: [Secret Network: Compile and Deploy](https://docs.scrt.network/secret-network-documentation/development/getting-started/compile-and-deploy) or following along with our guided pathway at [Secret Dice Contract Pathway](https://scrt.university)

4. Once you have a local blockchain running, two player wallets created, and the dice contract deployed to your local blockchain, you are nearly ready to run the application locally:

   Because our local web server and local blockchain are running on different ports, you will need to use a proxy server to get around CORS issues. Your local blockchain exposes a proxy at `http://localhost:5173`, however, we recommend using this application prebuilt proxy as you will receive better logging information in case anything goes wrong. To run the proxy server, run the following command:

   ```sh
   pnpm run proxy
   ```

The prebuilt proxy server exposes the blockchain at `http://localhost:5050/rest`

5. Now we can fill in our environment variables. Create a `.env` file based on our .env.template file in the root of the project and fill in the following variables:

   ```sh
   PLAYER_1_WALLET_MNEMONIC="YOUR PLAYER 1 WALLET MNEMONIC HERE"
   PLAYER_2_WALLET_MNEMONIC="YOUR PLAYER 2 WALLET MNEMONIC HERE"
   SECRET_NETWORK_URL="http://localhost:5050/rest"
   ```

6. Now we can run the application locally

   ```sh
   pnpm run dev
   ```

7. Open your browser and navigate to `http://localhost:5173` to view the application

### Afterword

Thanks for checking out this project. If you have any questions, feel free to reach out to us on [Discord](https://chat.scrt.network) or [Telegram](https://t.me/SCRTCommunity).
