type Client = import("secretjs").SecretNetworkClient;
type Scene = import("three").Scene;
type PerspectiveCamera = import("three").PerspectiveCamera;
type Euler = import("three").Euler;
type Group = import("three").Group;
type WebGLRenderer = import("three").WebGLRenderer;

declare namespace App {
  interface IDice {
    dice: Group | null;
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    faces: Euler[];
    animationId: number | null;

    roll(): void;
    rollTo(roll: number): void;
    spin(): void;
    stop(): void;
    initScene(): void;
    initRenderer(el: HTMLElement): void;
    loadDice(): void;
    dispose(): void;
  }
}

declare namespace Wallet {
  interface Config {
    mnemonic: string;
    url: string;
    chainId?: string;
  }

  interface Utils {}

  interface IAdapter {
    config: Config;
    conn: IConnection | null;
    address: string | null;

    connect: (
      diceContractAddress: string,
      diceContractCodeHash: string
    ) => Promise<void>;
    disconnect: () => Promise<void>;
    updateConnection: (address: string, codeHash: string) => void;
  }

  interface IConnection {
    client: Client;
    diceContractAddress: string;
    diceContractCodeHash: string;

    createContract(): Promise<{ address: string; codeHash: string }>;
    join: (name: string, secret: number) => Promise<void>;
    rollDice: () => Promise<number>;
    leave: () => Promise<void>;
    queryBalance: () => Promise<number>;
    queryWhoWon: () => Promise<Contract.Query.Response.WhoWon>;
    setContractDetails: (address: string, codeHash: string) => void;
  }
}

declare namespace Contract {
  namespace Execute {
    interface Join {
      join: {
        name: string;
        secret: string;
      };
    }

    interface RollDice {
      roll_dice: {};
    }
    interface Leave {
      leave: {};
    }
  }

  namespace Query {
    interface WhoWon {
      who_won: {};
    }

    namespace Response {
      interface WhoWon {
        name: string;
        addr: string;
        dice_roll: number;
      }
    }
  }
}
