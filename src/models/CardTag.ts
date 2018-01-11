import { Record } from 'immutable';

export interface CardTag {
    id: string;
    name: string;
    value: string;
    quantity: number;
    unit: string;
    debit: number;
    credit: number;
    source: string;
    target: string;
}

export class CardTagRecord extends Record<CardTag>({
    id: '',
    name: '',
    value: '',
    quantity: 0,
    unit: '',
    debit: 0,
    credit: 0,
    source: '',
    target: ''
}) {
    get balance(): number { return (this.totalDebit - this.totalCredit); }
    get display(): string {
        // let b = this.balance !== 0 ? this.balance : '';
        let u = this.unit ? this.unit : '';
        let q = this.quantity > 0 ? this.quantity + u + ' ' : '';
        let vl = this.value ? q + this.value : '';
        let key = !this.name || this.name[0] === '_' ? '' : this.name + ': ';
        // let st = this.source || this.target ? `${this.source} > ${this.target}` : '';
        return `${key}${vl}`;
    }
    get totalDebit(): number { return Math.max(this.quantity, 1) * this.debit; }
    get totalCredit(): number { return Math.max(this.quantity, 1) * this.credit; }

    getInQuantityFor(location?: string): number {
        location = location && location.toLowerCase();
        if (location && this.value.toLowerCase().includes(location)) {
            return this.target ? this.quantity : 0;
        }
        return this.target && (!location || this.target.toLowerCase().includes(location)) ? this.quantity : 0;
    }

    getOutQuantityFor(location?: string): number {
        location = location && location.toLowerCase();
        if (location && this.value.toLowerCase().includes(location)) {
            return this.target ? 0 : this.quantity;
        }
        return this.source && (!location || this.source.toLowerCase().includes(location)) ? this.quantity : 0;
    }

    getTotalQuantityFor(location: string): number {
        return this.getInQuantityFor(location) - this.getOutQuantityFor(location);
    }

    get locationDisplay(): string {
        return this.source || this.target ? `${this.source} > ${this.target}` : '';
    }

    get balanceDisplay(): string {
        return this.balance !== 0 ? this.balance.toFixed(2) : '';
    }
}
