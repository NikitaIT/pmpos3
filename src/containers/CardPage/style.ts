import withStyles from 'material-ui/styles/withStyles';

export interface Style {
    card: any;
    content: any;
    paper: any;
    modal: any;
    root: any;
    footer: any;
    tagItem: any;
    tagItemContent: any;
    cardLine: any;
    cardLineIcon: any;
    node: any;
    leaf: any;
    indexHeader: any;
}

export default withStyles(({ palette, spacing, breakpoints }): Style => ({
    node: {
        // marginLeft: spacing.unit,
        // paddingBottom: spacing.unit,
        // marginBottom: spacing.unit,
        borderColor: palette.text.divider,
        borderTop: '1px solid',
        backgroundColor: palette.background.contentFrame,
    },
    leaf: {
        backgroundColor: palette.background.paper,
        paddingLeft: spacing.unit,
    },
    tagItem: {
        paddingTop: '4px',
        paddingBottom: '4px',
    },
    tagItemContent: {
        flex: 1
    },
    cardLine: {
        display: 'flex',
        flexWrap: 'wrap',
        borderBottom: '1px solid ' + palette.text.divider,

        // borderLeft: '1px solid ' + palette.text.divider,
        // borderRight: '1px solid ' + palette.text.divider,
    },
    cardLineIcon: {
        marginTop: spacing.unit,
        fontSize: 20
    },
    card: {
        minWidth: 275,
        padding: spacing.unit,
        marginBottom: spacing.unit
    },
    root: {
        display: 'flex',
        flexFlow: 'column',
        flex: '1 1 auto'
    },
    indexHeader: {
        padding: spacing.unit
    },
    content: {
        height: '100%',
        display: 'flex',
        overflowX: 'auto',
        flexFlow: 'column',
        [breakpoints.up('sm')]: {
            maxWidth: '600px',
            width: '100%',
            alignSelf: 'center'
        },
    },
    footer: {
        [breakpoints.up('sm')]: {
            maxWidth: '600px',
            width: '100%',
            alignSelf: 'center',
        },
        flex: 'none'
    },
    modal: {
        position: 'absolute',
        width: '80%',
        maxWidth: spacing.unit * 50,
        top: `50%`,
        left: `50%`,
        transform: `translate(-50%, -50%)`,
        border: '1px solid #e5e5e5',
        backgroundColor: '#fff',
        boxShadow: '0 5px 15px rgba(0, 0, 0, .5)',
        padding: spacing.unit * 3,
    },
    paper: {
        [breakpoints.down('sm')]: {
            marginTop: spacing.unit * 3,
        },
        [breakpoints.up('sm')]: {
            marginLeft: spacing.unit * 3,
        },

        flex: '1 1 auto',
        overflowX: 'auto' as 'auto',
    }
}));