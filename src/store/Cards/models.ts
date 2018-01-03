import { List, Record } from 'immutable';
import { ActionRecord } from '../../models/Action';
import { CardRecord } from '../../models/Card';

export interface Commit {
    id: string;
    cardId: string;
    time: number;
    state: CardRecord;
    terminalId: string;
    user: string;
    actions: List<ActionRecord>;
}

export class CommitRecord extends Record<Commit>({
    id: '',
    cardId: '',
    time: new Date().getTime(),
    state: new CardRecord(),
    terminalId: '',
    user: '',
    actions: List<ActionRecord>()
}) { }

export interface CardData {
    card: CardRecord;
    commits: List<CommitRecord>;
}

export class CardDataRecord extends Record<CardData>({
    card: new CardRecord(),
    commits: List<CommitRecord>()
}) { }

export interface State {
    cards: List<CardRecord>;
    currentCard: CardRecord;
    currentCommits: List<CommitRecord> | undefined;
    pendingActions: List<ActionRecord>;
    isLoaded: boolean;
    protocol: any;
}

export class StateRecord extends Record<State>({
    currentCard: new CardRecord(),
    pendingActions: List<ActionRecord>(),
    currentCommits: List<CommitRecord>(),
    cards: List<CardRecord>(),
    isLoaded: false,
    protocol: undefined
}) { }