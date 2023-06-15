import { Dice } from "./lib/dice";
import { LocalWalletAdapter } from "./lib/wallet";
import "./styles.css";

let player1ConnectBtn: HTMLElement | null = null;
let player2ConnectBtn: HTMLElement | null = null;
let player1DisconnectBtn: HTMLElement | null = null;
let player2DisconnectBtn: HTMLElement | null = null;
let player1JoinBtn: HTMLElement | null = null;
let player2JoinBtn: HTMLElement | null = null;
let player1LeaveBtn: HTMLElement | null = null;
let player2LeaveBtn: HTMLElement | null = null;
let rollBtn: HTMLElement | null = null;
let whoWonButton: HTMLElement | null = null;
let instantiateContractBtn: HTMLElement | null = null;
let actionLog: HTMLElement | null = null;

let dice: Dice;

let diceContractAddress: string = process.env.DICE_CONTRACT_ADDRESS || "";
let diceContractCodeHash: string = process.env.DICE_CONTRACT_CODE_HASH || "";

const playerOneWallet = new LocalWalletAdapter({
  mnemonic: process.env.PLAYER_1_WALLET_MNEMONIC || "",
  url: process.env.SECRET_NETWORK_URL || "",
});

const playerTwoWallet = new LocalWalletAdapter({
  mnemonic: process.env.PLAYER_2_WALLET_MNEMONIC || "",
  url: process.env.SECRET_NETWORK_URL || "",
});

document.addEventListener("DOMContentLoaded", async () => {
  initElements();
  initDice();
  initListeners(playerOneWallet, playerTwoWallet);
});

function initElements() {
  player1ConnectBtn = document.getElementById("player-1-connect-btn");
  player2ConnectBtn = document.getElementById("player-2-connect-btn");
  player1DisconnectBtn = document.getElementById("player-1-disconnect-btn");
  player2DisconnectBtn = document.getElementById("player-2-disconnect-btn");
  player1JoinBtn = document.getElementById("player-1-join-btn");
  player2JoinBtn = document.getElementById("player-2-join-btn");
  player1LeaveBtn = document.getElementById("player-1-leave-btn");
  player2LeaveBtn = document.getElementById("player-2-leave-btn");
  rollBtn = document.getElementById("roll-btn");
  whoWonButton = document.getElementById("who-won-btn");
  instantiateContractBtn = document.getElementById("instantiate-contract-btn");
  actionLog = document.getElementById("action-log-content");
}

function initListeners(p1w: LocalWalletAdapter, p2w: LocalWalletAdapter) {
  if (player1ConnectBtn) {
    player1ConnectBtn.addEventListener("click", async () => {
      try {
        await handleConnect(p1w, 1);
      } catch (e) {
        console.error(e);
      }
    });
  }

  if (player2ConnectBtn) {
    player2ConnectBtn.addEventListener("click", async () => {
      try {
        await handleConnect(p2w, 2);
      } catch (e) {
        console.error(e);
      }
    });
  }

  if (player1DisconnectBtn) {
    player1DisconnectBtn.addEventListener("click", async () => {
      try {
        await handleDisconnect(p1w, 1);
      } catch (e) {
        console.error(e);
      }
    });
  }

  if (player2DisconnectBtn) {
    player2DisconnectBtn.addEventListener("click", async () => {
      try {
        await handleDisconnect(p2w, 2);
      } catch (e) {
        console.error(e);
      }
    });
  }

  if (rollBtn) {
    rollBtn.addEventListener("click", async () => {
      try {
        await handleRoll(p1w);
      } catch (e) {
        console.error(e);
      }
    });
  }

  if (player1JoinBtn) {
    player1JoinBtn.addEventListener("click", async () => {
      try {
        await handleJoin(p1w, 1);
      } catch (e) {
        console.error(e);
      }
    });
  }

  if (player2JoinBtn) {
    player2JoinBtn.addEventListener("click", async () => {
      try {
        await handleJoin(p2w, 2);
      } catch (e) {
        console.error(e);
      }
    });
  }

  if (player1LeaveBtn) {
    player1LeaveBtn.addEventListener("click", async () => {
      try {
        console.log("leaving");
        await handleLeave(p1w, 1);
      } catch (e) {
        console.error(e);
      }
    });
  }

  if (player2LeaveBtn) {
    player2LeaveBtn.addEventListener("click", async () => {
      try {
        await handleLeave(p2w, 2);
      } catch (e) {
        console.error(e);
      }
    });
  }

  if (whoWonButton) {
    whoWonButton.addEventListener("click", async () => {
      try {
        if (!p1w.conn) {
          return;
        }
        const result = await p1w.conn.queryWhoWon();
        console.log(result.dice_roll);

        if (result.dice_roll < 4) {
          logAction(`Player 1 Won and rolled a ${result.dice_roll}`);
        }

        if (result.dice_roll > 3) {
          logAction(`Player 2 Won and rolled a ${result.dice_roll}`);
        }
      } catch (e) {
        console.error(e);
      }
    });
  }

  if (instantiateContractBtn) {
    instantiateContractBtn.addEventListener("click", async () => {
      try {
        if (!p1w.conn) {
          return;
        }

        const info = await p1w.conn.createContract();

        diceContractAddress = info.address;
        diceContractCodeHash = info.codeHash;

        if (p2w.conn) {
          p2w.updateConnection(info.address, info.codeHash);
        }

        logAction("New Contract instantiated.");
        logAction(`Contract address: ${info.address}`);
        logAction(`Contract code hash: ${info.codeHash}`);
      } catch (e) {
        console.error(e);
      }
    });
  }
}

function initDice() {
  const diceContainer = document.getElementById("dice");

  if (!diceContainer) {
    throw new Error("Failed to find dice containers.");
  }

  dice = new Dice(diceContainer);
  dice.spin();

  return;
}

async function handleConnect(wallet: LocalWalletAdapter, player: 1 | 2) {
  try {
    await wallet.connect(diceContractAddress, diceContractCodeHash);

    if (player === 1) {
      player1ConnectBtn?.classList.add("hidden");
      player1DisconnectBtn?.classList.remove("hidden");

      player1JoinBtn?.classList.remove("hidden");
      player1LeaveBtn?.classList.remove("hidden");

      logAction("Player 1 connected.");
      logAction(`Player 1 address: ${wallet.address}`);
    }

    if (player === 2) {
      player2ConnectBtn?.classList.add("hidden");
      player2DisconnectBtn?.classList.remove("hidden");

      player2JoinBtn?.classList.remove("hidden");
      player2LeaveBtn?.classList.remove("hidden");

      logAction("Player 2 connected.");
      logAction(`Player 2 address: ${wallet.address}`);
    }
  } catch (e) {
    return e;
  }
}

async function handleDisconnect(wallet: LocalWalletAdapter, player: 1 | 2) {
  try {
    wallet.disconnect();

    if (player === 1) {
      player1ConnectBtn?.classList.remove("hidden");
      player1DisconnectBtn?.classList.add("hidden");

      player1JoinBtn?.classList.add("hidden");
      player1LeaveBtn?.classList.add("hidden");

      logAction("Player 1 disconnected.");
    }

    if (player === 2) {
      player2ConnectBtn?.classList.remove("hidden");
      player2DisconnectBtn?.classList.add("hidden");

      player2JoinBtn?.classList.add("hidden");
      player2LeaveBtn?.classList.add("hidden");

      logAction("Player 2 disconnected.");
    }
  } catch (e) {
    return e;
  }
}

async function handleRoll(wallet: LocalWalletAdapter) {
  try {
    dice.roll();

    if (!wallet.conn) {
      dice.stop();
      dice.spin();
      return;
    }

    const roll = await wallet.conn.rollDice();
    dice.rollTo(roll);
    logAction(
      "Player 1 rolled the dice. To check who won, click the 'Check Winner' button."
    );
  } catch (e) {
    return e;
  }
}

async function handleJoin(wallet: LocalWalletAdapter, player: 1 | 2) {
  try {
    if (!wallet.conn) {
      return;
    }

    console.log("Joining at: ", wallet.conn.diceContractAddress);

    if (player === 1) {
      await wallet.conn.join("Alice", 123);
      logAction("Player 1 joined the game.");
    }

    if (player === 2) {
      await wallet.conn.join("Bob", 456);
      logAction("Player 2 joined the game.");
    }

    const balance = await wallet.conn.queryBalance();
    logAction(`Player ${player} balance: ${balance} SCRT`);
  } catch (e) {
    return e;
  }
}

async function handleLeave(wallet: LocalWalletAdapter, player: 1 | 2) {
  try {
    if (!wallet.conn) {
      return;
    }

    if (player === 1) {
      await wallet.conn.leave();
      logAction("Player 1 left the game.");
    }

    if (player === 2) {
      await wallet.conn.leave();
      logAction("Player 2 left the game.");
    }

    const balance = await wallet.conn.queryBalance();
    logAction(`Player ${player} balance: ${balance} SCRT`);
  } catch (e) {
    return e;
  }
}

function logAction(msg: string) {
  const p = document.createElement("p");

  p.classList.add("text-sm", "font-light", "text-gray-500");

  p.innerText = msg;
  actionLog?.append(p);
}
