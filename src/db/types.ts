import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const UserRole = {
    ADMIN: "ADMIN",
    USER: "USER"
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export const ContestStatus = {
    UPCOMING: "UPCOMING",
    LIVE: "LIVE",
    LOCKED: "LOCKED",
    COMPLETED: "COMPLETED"
} as const;
export type ContestStatus = (typeof ContestStatus)[keyof typeof ContestStatus];
export const MatchResult = {
    TEAM_A_WIN: "TEAM_A_WIN",
    TEAM_B_WIN: "TEAM_B_WIN",
    TIE: "TIE",
    NO_RESULT: "NO_RESULT"
} as const;
export type MatchResult = (typeof MatchResult)[keyof typeof MatchResult];
export const TransactionType = {
    CREDIT: "CREDIT",
    DEBIT: "DEBIT"
} as const;
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];
export const TransactionReason = {
    CONTEST_ENTRY: "CONTEST_ENTRY",
    PRIZE_WIN: "PRIZE_WIN",
    NEW_USER_BONUS: "NEW_USER_BONUS"
} as const;
export type TransactionReason = (typeof TransactionReason)[keyof typeof TransactionReason];
export type Contest = {
    id: string;
    tournamentId: string;
    startTime: Timestamp;
    endTime: Timestamp;
    status: Generated<ContestStatus>;
    prizePool: Generated<number>;
    createdAt: Generated<Timestamp>;
};
export type LeaderboardEntry = {
    id: string;
    contestId: string;
    userId: string;
    score: number;
    rank: number;
    prize: Generated<number>;
    createdAt: Generated<Timestamp>;
};
export type Match = {
    id: string;
    contestId: string;
    teamAId: string;
    teamBId: string;
    startTime: Timestamp;
    endTime: Timestamp | null;
    result: MatchResult | null;
};
export type Prediction = {
    id: string;
    userId: string;
    matchId: string;
    contestId: string;
    predictedResult: MatchResult;
    points: Generated<number>;
    createdAt: Generated<Timestamp>;
};
export type Sport = {
    id: string;
    name: string;
};
export type Team = {
    id: string;
    name: string;
    sportId: string;
};
export type Tournament = {
    id: string;
    name: string;
    sportId: string;
    entryFee: number;
    createdAt: Generated<Timestamp>;
};
export type User = {
    id: string;
    email: string;
    role: Generated<UserRole>;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type Wallet = {
    id: string;
    userId: string;
    balance: Generated<number>;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type WalletTransaction = {
    id: string;
    userId: string;
    walletId: string;
    amount: number;
    type: TransactionType;
    reason: TransactionReason;
    referenceId: string | null;
    createdAt: Generated<Timestamp>;
};
export type DB = {
    Contest: Contest;
    LeaderboardEntry: LeaderboardEntry;
    Match: Match;
    Prediction: Prediction;
    Sport: Sport;
    Team: Team;
    Tournament: Tournament;
    User: User;
    Wallet: Wallet;
    WalletTransaction: WalletTransaction;
};
