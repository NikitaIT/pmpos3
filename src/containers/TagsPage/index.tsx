import * as React from 'react';
import * as moment from 'moment';
import { RouteComponentProps } from 'react-router';
import { WithStyles, ListItem, Paper, List, Typography } from 'material-ui';
import decorate, { Style } from './style';
import { List as IList } from 'immutable';
import TopBar from '../TopBar';
import Divider from 'material-ui/Divider/Divider';
import CardList from '../../modules/CardList';
import ListItemText from 'material-ui/List/ListItemText';
import TextField from 'material-ui/TextField/TextField';
import CardTagData from '../../models/CardTagData';
import { CardTagRecord } from '../../models/CardTag';

type PageProps =
    WithStyles<keyof Style>
    & RouteComponentProps<{}>;

class TagsPage extends React.Component<PageProps, {
    searchValue: string,
    tags: IList<CardTagData>
}> {

    constructor(props: PageProps) {
        super(props);
        this.state = {
            searchValue: '',
            tags: IList<CardTagData>()
        };
    }

    getSecondaryCommands() {
        let result = [
            {
                icon: 'add', onClick: () => {
                    this.props.history.push('/cardType');
                }
            }
        ];
        return result;
    }

    renderTags(tags: IList<CardTagData>) {
        let balance = 0;
        return tags.sort((a, b) => a.time - b.time).map(tagData => {
            balance += tagData.getBalanceFor(this.state.searchValue);
            return tagData && (
                <div key={tagData.id}>
                    <Divider />
                    <ListItem>
                        <ListItemText
                            primary={tagData.display}
                            secondary={tagData.name + ' ' + moment(tagData.time).format('LLL')}
                        />
                        <div className={this.props.classes.amount}>
                            {tagData.getDebitDisplayFor(this.state.searchValue)}
                        </div>
                        <div className={this.props.classes.amount}>
                            {tagData.getCreditDisplayFor(this.state.searchValue)}
                        </div>
                        <div className={this.props.classes.amount}>
                            {balance.toFixed(2)}
                        </div>
                    </ListItem>
                </div>
            );
        });
    }

    loadCards(): IList<CardTagData> {
        return CardList.getTags((tag: CardTagRecord) => {
            let sv = this.state.searchValue.toLowerCase();
            return tag.value.toLowerCase().includes(sv)
                || tag.source.toLowerCase().includes(sv)
                || tag.target.toLowerCase().includes(sv);
        });
    }

    public render() {
        return (
            <div className={this.props.classes.root}>
                <TopBar
                    title="Tags"
                    secondaryCommands={this.getSecondaryCommands()}
                />
                <div className={this.props.classes.footer}>
                    <TextField
                        label="Search"
                        value={this.state.searchValue}
                        onChange={e => this.setState({ searchValue: e.target.value })}
                        onKeyDown={
                            e => e.key === 'Enter'
                                && this.setState(
                                    {
                                        tags: this.loadCards()
                                    }
                                )
                        }
                    />
                </div>
                <div className={this.props.classes.content}>
                    <Paper >
                        <List disablePadding>
                            {this.renderTags(this.state.tags)}
                        </List>
                    </Paper>
                </div>

                <div className={this.props.classes.footer}>
                    <ListItem>
                        <Typography style={{ flex: 1 }} type="title">Balance</Typography>
                        <Typography type="title">
                            {this.state.tags.reduce(
                                (r, t) => r + t.getBalanceFor(this.state.searchValue),
                                0).toFixed(2)}
                        </Typography>
                    </ListItem>

                </div>
            </div>
        );
    }
}

export default decorate(TagsPage);