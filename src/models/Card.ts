import { Record, Map as IMap, List } from 'immutable';
import { CardTagRecord, CardTag } from './CardTag';

export interface Card {
    id: string;
    time: number;
    typeId: string;
    type: string;
    isClosed: boolean;
    index: number;
    tags: IMap<string, CardTagRecord>;
    cards: IMap<string, CardRecord>;
}

export class CardRecord extends Record<Card>({
    id: '',
    time: 0,
    typeId: '',
    type: '',
    index: 0,
    isClosed: false,
    tags: IMap<string, CardTagRecord>(),
    cards: IMap<string, CardRecord>()
}) {
    getTagTotal(tag: CardTagRecord): number {
        let debit = 0;
        let credit = 0;
        for (const key of this.tags.keySeq().toArray()) {
            const t = this.tags.get(key) as CardTagRecord;
            let d = t.getDebit(this.subCardDebit + debit, this.subCardCredit + credit);
            let c = t.getCredit(this.subCardDebit + debit, this.subCardCredit + credit);
            if (t.id === tag.id) {
                return d - c;
            }
            debit = debit + d;
            credit = credit + c;
        }
        return debit - credit;
    }

    getTagDebit(tag: CardTagRecord): number {
        let debit = 0;
        let credit = 0;
        for (const key of this.tags.keySeq().toArray()) {
            const t = this.tags.get(key) as CardTagRecord;
            let d = t.getDebit(this.subCardDebit + debit, this.subCardCredit + credit);
            let c = t.getCredit(this.subCardDebit + debit, this.subCardCredit + credit);
            if (t.id === tag.id) {
                return d;
            }
            debit = debit + d;
            credit = credit + c;
        }
        return debit;
    }

    getTagCredit(tag: CardTagRecord): number {
        let debit = 0;
        let credit = 0;
        for (const key of this.tags.keySeq().toArray()) {
            const t = this.tags.get(key) as CardTagRecord;
            let d = t.getDebit(this.subCardDebit + debit, this.subCardCredit + credit);
            let c = t.getCredit(this.subCardDebit + debit, this.subCardCredit + credit);
            if (t.id === tag.id) {
                return c;
            }
            debit = debit + d;
            credit = credit + c;
        }
        return credit;
    }

    get debit(): number {
        let preDebit = 0;
        let preCredit = 0;
        let tagDebit = this.tags.reduce(
            (r, t) => {
                let result = r + t.getDebit(this.subCardDebit + preDebit, this.subCardCredit + preCredit);
                preDebit = preDebit + t.getDebit(this.subCardDebit + preDebit, this.subCardCredit + preCredit);
                preCredit = preCredit + t.getCredit(this.subCardDebit + preDebit, this.subCardCredit + preCredit);
                return result;
            },
            0);
        return tagDebit + this.subCardDebit;
    }

    get credit(): number {
        let preDebit = 0;
        let preCredit = 0;
        let tagCredit = this.tags.reduce(
            (r, t) => {
                let result = r + t.getCredit(this.subCardDebit + preDebit, this.subCardCredit + preCredit);
                preDebit = preDebit + t.getDebit(this.subCardDebit + preDebit, this.subCardCredit + preCredit);
                preCredit = preCredit + t.getCredit(this.subCardDebit + preDebit, this.subCardCredit + preCredit);
                return result;
            },
            0);
        return tagCredit + this.subCardCredit;
    }

    get balance(): number {
        return Math.round((this.debit - this.credit) * 100) / 100;
    }

    get debitDisplay(): string {
        let debit = this.debit;
        if (debit !== 0) { return debit.toFixed(2); }
        return '';
    }

    get creditDisplay(): string {
        let credit = this.credit;
        if (credit !== 0) { return credit.toFixed(2); }
        return '';
    }

    get balanceDisplay(): string {
        let balance = this.balance;
        if (balance !== 0) { return balance.toFixed(2); }
        return '';
    }

    get subCardDebit(): number {
        return this.cards.reduce((x, y) => x + y.debit, 0);
    }

    get subCardCredit(): number {
        return this.cards.reduce((x, y) => x + y.credit, 0);
    }

    get subCardBalance(): number {
        return this.subCardDebit - this.subCardCredit;
    }

    get display(): string {
        return this.name || this.id;
    }

    get name(): string {
        return this.tags.getIn(['Name', 'value']) || '';
    }

    get category(): string {
        return this.tags.getIn(['Category', 'value']) || '';
    }

    get allTags(): CardTagRecord[] {
        return this.tags.valueSeq().toArray();
    }

    get allCards(): CardRecord[] {
        return this.cards.valueSeq().toArray();
    }

    getSubCard(id: string): CardRecord | undefined {
        return this.cards.find(x => x.getCard(id) !== undefined);
    }

    getCard(id: string): CardRecord | undefined {
        if (!id) { return undefined; }
        if (this.id === id) { return this; }
        return this.getSubCard(id);
    }

    getTags(filters: string[]): { filter: string, result: List<CardTagRecord> } {
        let tags = this.tags.valueSeq();
        for (const filter of filters) {
            let filteredTags = tags.filter(t => t.acceptsFilter(filter));
            if (filteredTags.count() > 0) {
                return { filter, result: List<CardTagRecord>(filteredTags) };
            }
        }
        return { filter: '', result: List<CardTagRecord>() };
    }

    hasTag(name: string, value: string): boolean {
        return this.tags.find(v => v.name === name && v.value === value) !== undefined;
    }

    getTag(name: string, defaultValue: any): {} {
        let tag = this.tags.find(v => v.name === name);
        return tag ? tag.value : defaultValue;
    }

    sub(id: string, f?: (c: CardRecord) => CardRecord): CardRecord {
        let card = new CardRecord({ id });
        if (f) {
            card = f(card);
        }
        return this.setIn(['cards', id], card);
    }

    tag(tag: string | Partial<CardTag>, value?: string): CardRecord {
        if (typeof tag === 'string') {
            return this.setIn(['tags', tag], new CardTagRecord({ name: tag, value }));
        }
        return this.setIn(['tags', tag.name], new CardTagRecord(tag));
    }
}