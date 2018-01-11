import * as React from 'react';
import { List as IList, Map as IMap } from 'immutable';
import { Paper } from 'material-ui';
import decorate, { Style } from './style';
import { WithStyles } from 'material-ui/styles/withStyles';
import CardTagData from '../../models/CardTagData';
import THead from './THead';

interface PageProps {
    tags: IList<CardTagData>;
}

type Props = PageProps & WithStyles<keyof Style>;

const BalanceTable = (props: Props) => {
    let firstTag = props.tags.first();
    if (!firstTag) {
        return null;
    }
    let balances = props.tags.reduce(
        (r, d) => {
            return r.update(d.key, o => {
                return (o || IMap<string, number>())
                    .update('debit', v => (v || 0) + d.getDebitFor(d.key))
                    .update('credit', v => (v || 0) + d.getCreditFor(d.key));
            });
        },
        IMap<string, IMap<string, number>>()
    );
    return (
        <Paper className={props.classes.card}>
            <table className={props.classes.table}>
                <THead keys={['Name', 'Debit', 'Credit', 'Balance']} />
                <tbody>{balances.map((v, k) => {
                    return (
                        <tr key={k} className={props.classes.tableRow}>
                            <td className={props.classes.tableCell}>
                                <div>{k}</div>
                            </td>
                            <td className={props.classes.tableCellNumber}>
                                {v.get('debit')}
                            </td>
                            <td className={props.classes.tableCellNumber}>
                                {v.get('credit')}
                            </td>
                            <td className={props.classes.tableCellNumber}>
                                {(v.get('debit') || 0) - (v.get('credit') || 0)}
                            </td>
                        </tr>
                    );
                }).valueSeq()}</tbody>
            </table>
        </Paper>
    );
};

export default decorate(BalanceTable);