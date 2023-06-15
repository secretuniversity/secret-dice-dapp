import { MsgExecuteContract, SecretNetworkClient, Wallet } from "secretjs";

const DEFAULT_GAS_LIMIT = 40000;

export class LocalWalletAdapter implements Wallet.IAdapter {
  config: Wallet.Config;
  conn: Wallet.IConnection | null = null;
  address: string | null = null;

  constructor(config: Wallet.Config) {
    this.config = config;
  }

  async connect(
    diceContractAddress: string,
    diceContractCodeHash: string
  ): Promise<void> {
    const wallet = new Wallet(this.config.mnemonic);

    const client = new SecretNetworkClient({
      url: this.config.url,
      chainId: this.config.chainId || "secretdev-1",
      wallet,
      walletAddress: wallet.address,
    });

    this.address = wallet.address;
    this.conn = new Connection(
      client,
      diceContractAddress,
      diceContractCodeHash
    );

    return Promise.resolve();
  }

  disconnect(): Promise<void> {
    this.conn = null;
    this.address = null;

    return Promise.resolve();
  }

  updateConnection(address: string, codeHash: string) {
    if (!this.conn) {
      throw new Error("connection not set");
    }

    this.conn.setContractDetails(address, codeHash);
  }
}

export class Connection implements Wallet.IConnection {
  client: SecretNetworkClient;
  diceContractAddress: string = process.env.DICE_CONTRACT_ADDRESS || "";
  diceContractCodeHash: string = process.env.DICE_CONTRACT_CODE_HASH || "";

  constructor(
    client: SecretNetworkClient,
    address?: string,
    codeHash?: string
  ) {
    this.client = client;

    if (address) {
      this.diceContractAddress = address;
    }

    if (codeHash) {
      this.diceContractCodeHash = codeHash;
    }
  }

  async join(name: string, secret: number): Promise<void> {
    this.#checkIntegrity();

    const joinMsg: Contract.Execute.Join = {
      join: {
        name,
        secret: secret.toString(),
      },
    };

    const executeMsg = new MsgExecuteContract({
      sender: this.client.address,
      contract_address: this.diceContractAddress,
      code_hash: this.diceContractCodeHash,
      msg: joinMsg,
      sent_funds: [
        {
          denom: "uscrt",
          amount: "1000000", //1 SCRT is 1,000,000 uSCRT
        },
      ],
    });

    try {
      const tx = await this.client.tx.broadcast([executeMsg], {
        gasLimit: DEFAULT_GAS_LIMIT,
      });
      console.log("Joined: ", tx);
      return;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async rollDice(): Promise<number> {
    this.#checkIntegrity();

    const rollMsg: Contract.Execute.RollDice = {
      roll_dice: {},
    };

    const executeMsg = new MsgExecuteContract({
      sender: this.client.address,
      contract_address: this.diceContractAddress,
      code_hash: this.diceContractCodeHash,
      msg: rollMsg,
    });

    try {
      const tx = await this.client.tx.broadcast([executeMsg], {
        gasLimit: DEFAULT_GAS_LIMIT,
      });
      console.log("Rolled: ", tx);

      if (!tx.arrayLog) {
        throw new Error("no logs found in tx");
      }

      const result = tx.arrayLog.find((log) => log.key === "result");

      if (!result) {
        throw new Error("no result found in tx");
      }

      return Number(result.value);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async leave(): Promise<void> {
    this.#checkIntegrity();

    const leaveMsg: Contract.Execute.Leave = {
      leave: {},
    };

    const executeMsg = new MsgExecuteContract({
      sender: this.client.address,
      contract_address: this.diceContractAddress,
      code_hash: this.diceContractCodeHash,
      msg: leaveMsg,
    });

    try {
      const tx = await this.client.tx.broadcast([executeMsg], {
        gasLimit: DEFAULT_GAS_LIMIT,
      });
      console.log("Left: ", tx);
      return;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async queryBalance(): Promise<number> {
    try {
      const res = await this.client.query.bank.balance({
        address: this.client.address,
        denom: "uscrt",
      });

      if (!res.balance) {
        throw new Error("no balance found");
      }

      return Number(res.balance.amount) / 1e6;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async queryWhoWon(): Promise<Contract.Query.Response.WhoWon> {
    this.#checkIntegrity();

    const queryMsg: Contract.Query.WhoWon = {
      who_won: {},
    };

    try {
      const res: Contract.Query.Response.WhoWon =
        (await this.client.query.compute.queryContract({
          contract_address: this.diceContractAddress,
          code_hash: this.diceContractCodeHash,
          query: queryMsg,
        })) as Contract.Query.Response.WhoWon;

      return res;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async createContract(): Promise<{ address: string; codeHash: string }> {
    try {
      const tx = await this.client.tx.compute.instantiateContract(
        {
          sender: this.client.address,
          code_id: 1,
          code_hash: this.diceContractCodeHash,
          init_msg: {},
          label: "dice-contract-" + Date.now(),
        },
        {
          gasLimit: 100_000,
        }
      );

      console.log(tx);

      if (!tx.arrayLog) {
        throw new Error("no logs found in tx");
      }

      const l = tx.arrayLog.find(
        (log) => log.key === "contract_address" && log.type === "message"
      );

      this.diceContractAddress = l?.value || "";
      this.diceContractCodeHash = await this.#getContractCodeHash(
        this.diceContractAddress
      );

      return {
        address: this.diceContractAddress,
        codeHash: this.diceContractCodeHash,
      };
    } catch (e) {
      return Promise.reject(e);
    }
  }

  setContractDetails(address: string, codeHash: string): void {
    this.diceContractAddress = address;
    this.diceContractCodeHash = codeHash;
  }

  async #getContractCodeHash(addr: string): Promise<string> {
    try {
      const res = await this.client.query.compute.codeHashByContractAddress({
        contract_address: addr,
      });

      if (!res.code_hash) {
        throw new Error("no code hash found");
      }

      return res.code_hash;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  #checkIntegrity(): void {
    if (!this.diceContractAddress) {
      throw new Error("dice contract address not set");
    }

    if (!this.diceContractCodeHash) {
      throw new Error("dice contract code hash not set");
    }
  }
}
