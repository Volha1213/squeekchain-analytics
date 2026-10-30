export type Range = "24h" | "7d" | "30d";
export type Unavailable = { status: "unavailable"; reason: string };
export type Chain = {
  target: string;
  chainId: string;
  safeThroughBlock: string;
  confirmations: string;
};
export type Pipeline = {
  schemaVersion: 1;
  generatedAt: string;
  installationId: string;
  measurement: null | {
    freshness: string;
    observedAt: string;
    receivedAt: string;
    staleAfterSeconds: number;
    provenance: string;
    coreStatus: string;
    rpmMilli: number;
    speedMmPerSecond: number;
    distanceMm: number;
    cumulativeWorkUnits: string;
  };
  builder:
    | Unavailable
    | {
        status: "available";
        projected: {
          blockHeight: string;
          blockProgress: string;
          completedBlockCount: string;
          lifecycle: string;
        };
      };
  oracle: { state: string; reason: string | null };
  settlementQueue: Unavailable | { status: "available"; state: string };
};
export type Core =
  | Unavailable
  | {
      status: "available";
      schemaVersion: 1;
      chain: Chain;
      identities: { core: string };
      configuration: { roundDuration: string; blockUnitsPerBlock: string };
      core: {
        blockHeight: string;
        blockProgress: string;
        cumulativeWork: string;
        workPerThousandBlocks: string;
        settledThroughRound: string;
        paused: boolean;
      };
    };
export type Economy =
  | Unavailable
  | {
      status: "available";
      schemaVersion: 2;
      generatedAt: string;
      chain: Chain & { safeBlockTimestamp: string };
      release: { id: string };
      asset: { address: string; symbol: string; decimals: number };
      identities: { core: string; token: string; mining: { proxy: string } };
      supply: {
        capBaseUnits: string;
        liveSupplyBaseUnits: string;
        miningMintedBaseUnits: string;
        totalBurnedBaseUnits: string;
      };
      lifecycle: { stage: string; paused: boolean; currentRound: string };
      staking: null | {
        totalStakedBaseUnits: string;
        totalNftPower: string;
        totalSqkPower: string;
      };
      nft: { live: string; burned: string; issued: string };
    };
export type Settlement = {
  transactionHash: string;
  firstCompletedBlock: string;
  lastCompletedBlock: string;
  completedBlockCount: string;
  settledThroughRound: string;
  workAdded: string;
  ethereumBlockNumber: string;
  blockTimestamp: string;
  logIndex: string;
  confirmationStatus: string;
  sqkMintedBaseUnits?: string;
};
export type Settlements =
  | Unavailable
  | {
      schemaVersion: 3;
      status: "available";
      generatedAt: string;
      chain: Chain;
      range: Range;
      window: { startAt: string; endAt: string; bucketSeconds: number };
      summary: {
        settlementCount: string;
        completedBlockCount: string;
        workAdded: string;
        activeRoundCount: string;
      };
      recentSettlements: Settlement[];
      buckets: {
        startAt: string;
        endAt: string;
        completedBlockCount: string;
        workAdded: string;
        sqkMintedBaseUnits?: string;
      }[];
      mining:
        | Unavailable
        | {
            status: "available";
            rangeMintedBaseUnits: string;
            economy: { decimals: number };
          };
    };
export type Stats = {
  schemaVersion: 1;
  generatedAt: string;
  range: "7d" | "30d";
  lifetime: {
    acceptedWorkUnits: string;
    observedDistanceMm: string;
    activeDayCount: number;
  };
  activity: {
    coverage: { coverageBps: number; complete: boolean };
    summary: {
      observedWorkUnits: string;
      observedDistanceMm: string;
      activeDayCount: number;
    };
    days: {
      date: string;
      observedWorkUnits: string;
      coverage: { observedRoundCount: number; coverageBps: number };
      buckets: {
        startMinuteUtc: number;
        coverage: string;
        workUnits: string | null;
      }[];
    }[];
  };
  records: {
    peakObservedRpmMilli: null | { value: string };
    longestActiveWindowMinutes: null | { value: string };
  };
  rounds: {
    observedCount: number;
    activeCount: number;
    missingCount: number;
    activeRateBps: number | null;
  };
  blocks: { status: string; reason?: string };
};
export type UpstreamDiagnostics = {
  status: number;
  requestId: string | null;
  edgeRay: string | null;
  contentType: string | null;
  mitigation: string | null;
  errorCode: number | null;
  ownerActionRequired: boolean;
  retryable: boolean | null;
};
export type SourceResult<T> = {
  state: "available" | "unavailable" | "error";
  data: T | null;
  reason: string | null;
  checkedAt: string;
  url: string;
  sourceMode: string | null;
  retryAfter: number | null;
  upstream?: UpstreamDiagnostics;
};
export type Analytics = {
  fetchedAt: string;
  range: Range;
  pipeline: SourceResult<Pipeline>;
  transport?: "server" | "browser-direct";
  core: SourceResult<Core>;
  economy: SourceResult<Economy>;
  settlements: SourceResult<Settlements>;
  stats: SourceResult<Stats>;
  deployment: {
    checkedAt: string;
    source: string;
    documentedCore: string;
    documentedToken: string;
    mismatch: boolean | null;
    apiCore: string | null;
    apiToken: string | null;
    consistent: boolean | null;
  };
};
