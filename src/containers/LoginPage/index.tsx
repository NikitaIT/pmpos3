import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../../store';
import * as ClientStore from '../../store/Client';
import { WithStyles } from 'material-ui';
import { RouteComponentProps } from 'react-router';
import decorate, { Style } from './style';
import TopBar from '../TopBar';
import Typography from 'material-ui/Typography/Typography';
import LoginControl from './LoginControl';

export type PageProps =
    ClientStore.ClientState
    & WithStyles<keyof Style>
    & typeof ClientStore.actionCreators
    & RouteComponentProps<{}>;

class LoginPage extends React.Component<PageProps, {}> {
    public render() {
        return (
            <div className={this.props.classes.root}>
                <TopBar title={'Login' + (this.props.loggedInUser && ` (${this.props.loggedInUser})`)} />
                <div className={this.props.classes.content}>
                    <Typography type="headline">Welcome to PM-POS</Typography>
                    <LoginControl
                        onPinEntered={pin => {
                            this.props.SetLoggedInUser(pin);
                            if (pin && pin !== '' && this.props.location.pathname === '/login') {
                                this.props.history.push('/');
                            }
                        }}
                    />
                </div>
            </div>
        );
    }
}

export default decorate(connect(
    (state: ApplicationState) => state.client,
    ClientStore.actionCreators
)(LoginPage));