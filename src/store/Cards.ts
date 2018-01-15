import { Reducer } from 'redux';
import { AppThunkAction } from './appThunkAction';
import * as shortid from 'shortid';
import { CardRecord } from '../models/Card';
import { ActionRecord } from '../models/Action';
import { Commit, CommitRecord } from '../models/Commit';
import CardList from '../modules/CardList';
import { List, Record } from 'immutable';
import { CardTypeRecord } from '../models/CardType';
import { ApplicationState } from './index';
import { ActionsObservable } from 'redux-observable';
import { Observable } from 'rxjs/Observable';
import { Action } from 'redux';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/ignoreElements';

export interface State {
    cards: List<CardRecord>;
    currentCard: CardRecord;
    currentCardType: CardTypeRecord;
    currentCommits: List<CommitRecord> | undefined;
    pendingActions: List<ActionRecord>;
    isLoaded: boolean;
    protocol: any;
}

export class StateRecord extends Record<State>({
    currentCard: new CardRecord(),
    currentCardType: new CardTypeRecord(),
    pendingActions: List<ActionRecord>(),
    currentCommits: List<CommitRecord>(),
    cards: List<CardRecord>(),
    isLoaded: false,
    protocol: undefined
}) { }

type SetCommitProtocolAction = {
    type: 'SET_COMMIT_PROTOCOL'
    protocol: any
};

type CommitReceivedAction = {
    type: 'COMMIT_RECEIVED'
    values: Commit[]
};

type AddCardAction = {
    type: 'ADD_CARD',
    action: ActionRecord
};

type CommitCardAction = {
    type: 'COMMIT_CARD'
};

type AddPendingActionAction = {
    type: 'ADD_PENDING_ACTION'
    action: ActionRecord
};

type LoadCardAction = {
    type: 'LOAD_CARD'
    cardId: String
    payload: Promise<CardRecord>
};

type LoadCardRequestAction = {
    type: 'LOAD_CARD_REQUEST'
};

type LoadCardSuccessAction = {
    type: 'LOAD_CARD_SUCCESS'
    payload: CardRecord
};

type LoadCardFailAction = {
    type: 'LOAD_CARD_FAIL'
};

type SetCurrentCardTypeAction = {
    type: 'SET_CURRENT_CARD_TYPE'
    cardType: CardTypeRecord
};

type KnownActions = AddCardAction | AddPendingActionAction | CommitCardAction | CommitReceivedAction
    | LoadCardAction | LoadCardRequestAction | LoadCardSuccessAction | LoadCardFailAction
    | SetCommitProtocolAction | SetCurrentCardTypeAction;

export const epic = (action$: ActionsObservable<Action>): Observable<Action> =>
    action$.ofType('ADD_PENDING_ACTION')
        .do(action => console.log(action))
        .ignoreElements();

export const reducer: Reducer<StateRecord> = (
    state: StateRecord = new StateRecord(),
    action: KnownActions
) => {
    switch (action.type) {
        case 'ADD_PENDING_ACTION': {
            return state
                .update('currentCard', current => {
                    return CardList.applyAction(current, action.action);
                })
                .update('pendingActions', list => list.push(action.action));
        }
        case 'ADD_CARD': {
            return state
                .set('isLoaded', true)
                .set('currentCommits', undefined)
                .set('pendingActions', state.pendingActions.clear().push(action.action))
                .set('currentCard', CardList.applyAction(undefined, action.action));
        }
        case 'SET_COMMIT_PROTOCOL': {
            return state.set('protocol', action.protocol);
        }
        case 'COMMIT_RECEIVED': {
            CardList.addCommits(action.values);
            return state.set('cards', CardList.getCardsByType(state.currentCardType.id));
        }
        case 'COMMIT_CARD': {
            return resetCurrentCard(state);
        }
        case 'LOAD_CARD_REQUEST': {
            return resetCurrentCard(state);
        }
        case 'LOAD_CARD_SUCCESS': {
            let result = state
                .set('currentCard', action.payload)
                .set('currentCommits', CardList.getCommits(action.payload.id))
                .set('isLoaded', true);
            return result;
        }
        case 'LOAD_CARD_FAIL': {
            return state
                .set('isLoaded', false);
        }
        case 'SET_CURRENT_CARD_TYPE': {
            return state
                .set('cards', CardList.getCardsByType(action.cardType.id))
                .set('currentCardType', action.cardType);
        }
        default:
            return state;
    }
};

function resetCurrentCard(state: StateRecord) {
    return state
        .set('currentCard', new CardRecord())
        .set('pendingActions', state.pendingActions.clear())
        .set('currentCommits', undefined)
        .set('isLoaded', false);
}

function internalAddPendingAction(
    card: CardRecord, actionType: string, data: any,
    getState: () => ApplicationState,
    dispatch: (action: KnownActions) => void) {
    let c = card;
    let actionData = new ActionRecord({
        id: shortid.generate(),
        cardId: c.id,
        actionType,
        data,
        concurrencyData: CardList.readConcurrencyData(actionType, c, data)
    });
    if (CardList.canApplyAction(c, actionData)) {
        dispatch({
            type: 'ADD_PENDING_ACTION', action: actionData
        });
    }
}

function internalAddCard(
    cardType: CardTypeRecord,
    getState: () => ApplicationState,
    dispatch: (action: KnownActions) => void) {
    let cardCreateAction = new ActionRecord({
        actionType: 'CREATE_CARD',
        id: shortid.generate(),
        data: {
            id: shortid.generate(),
            typeId: cardType.id,
            time: new Date().getTime()
        }
    });
    dispatch({
        type: 'ADD_CARD',
        action: cardCreateAction
    });
}

export const actionCreators = {
    addCard: (cardType: CardTypeRecord): AppThunkAction<KnownActions> => (dispatch, getState) => {
        internalAddCard(cardType, getState, dispatch);
    },
    commitCard: (): AppThunkAction<KnownActions> => (dispatch, getState) => {
        const state = getState().cards;

        if (state.pendingActions.count() > 0) {
            let commit = {
                id: shortid.generate(),
                time: new Date().getTime(),
                terminalId: getState().client.terminalId,
                user: getState().client.loggedInUser,
                cardId: state.currentCard.id,
                state: state.currentCard.toJS(),
                actions: state.pendingActions.toJS()
            };
            state.protocol.push([commit]);
        }

        dispatch({
            type: 'COMMIT_CARD'
        });
    },
    addPendingAction: (card: CardRecord | undefined, actionType: string, data: any):
        AppThunkAction<KnownActions> => (dispatch, getState) => {
            internalAddPendingAction(card || getState().cards.currentCard, actionType, data, getState, dispatch);
        },
    loadCard: (id: string): AppThunkAction<KnownActions> => (dispatch, getState) => {
        dispatch({
            type: 'LOAD_CARD',
            cardId: id,
            payload: new Promise<CardRecord>((resolve, reject) => {
                let card = CardList.getCard(id);
                if (!card) {
                    reject(`${id} not found`);
                } else {
                    resolve(card);
                }
            })
        });
    },
    setCurrentCardType: (cardType: CardTypeRecord | undefined):
        AppThunkAction<KnownActions> => (dispatch, getState) => {
            if (cardType) {
                dispatch({
                    type: 'SET_CURRENT_CARD_TYPE',
                    cardType
                });
            }
        }
};