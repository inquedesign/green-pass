import React from 'react'
import UserService from '../services/user.service'

import { Navigation  } from 'react-native-navigation'
import { StyleSheet,
         View,
         Image       } from 'react-native'
import { Text,
         Button,
         Container   } from '../components'
import { STYLES,
         COLORS,
         FONT_SIZES,
         VH,
         SCREEN_HEIGHT,
         COMPONENT_HEIGHT } from '../styles'
import { SCREENS,
         SOCIAL_ICONS } from '../util/constants'
import { AVATARS      } from '../util/avatars'


import SplashScreen from 'react-native-splash-screen'


export default class ProfileScreen extends React.PureComponent {
    constructor( props ) {
        super( props )

        this.isOwnProfile = true

        this.state = {
            id: null,
            username: null,
            age: null,
            gender: null,
            avatar: null,
            buds: null,
            contactMethods: null,
            currentUser: null
        }
    }

    // TODO: Loading placeholder while data is fetched
    componentDidMount() {
        if ( this.props.userId ) {
            Promise.all([ UserService.getUserById( this.props.userId ), UserService.getProfile() ])
            .then( results => {
                this.isOwnProfile = false
                this.setUserData({ ...results[0], currentUser: results[1] })

                this.profileListener = UserService.addProfileListener( null, profile => {
                    this.setState({ currentUser: profile })
                })
                this.unsubscribe = UserService.addProfileListener( this.props.userId, profile => {
                    this.setUserData( profile )
                })
                
                if (
                    results[1].buds && results[1].buds.includes( results[0].id ) &&
                    results[0].buds && results[0].buds.includes( results[1].id )
                ) {
                    this.contactMethodsWatcher = UserService.getContactMethods( this.props.userId,
                    contactMethods => {
                        this.setState({ contactMethods: contactMethods })
                    })
                }
            })
        }
        else { // Get current user's profile
            UserService.getProfile()
            .then( profile => {
                this.setUserData( profile )

                this.profileListener = UserService.addProfileListener( null, profile => {
                    this.setUserData( profile )
                })
            })

            this.contactMethodsWatcher = UserService.getContactMethods( null, contactMethods => {
                this.setState({ contactMethods: contactMethods })
            })
        }

        SplashScreen.hide()
    }
    
    componentWillUnmount() {
        if ( this.profileListener ) {
            UserService.removeProfileListener( this.profileListener )
        }
        if ( this.unsubscribe ) {
            UserService.removeProfileListener( this.unsubscribe )
        }
        UserService.unsubscribe( this.contactMethodsWatcher )
    }

    setUserData( data ) {
        this.setState({
            id: data.id,
            username: data.username,
            age: data.age,
            gender: data.gender,
            avatar: data.avatar,
            buds: data.buds,
            currentUser: data.currentUser ? data.currentUser : this.state.currentUser
        })
    }

    addBud() {
        if ( !this.isOwnProfile ) UserService.addBud( this.state.id )
    }

    removeBud() {
        if ( !this.isOwnProfile ) UserService.removeBud( this.state.id )
    }

    render() {
        let budRequestSent = false
        let budRequestReceived = false
        if ( !this.isOwnProfile ) {
            budRequestSent     = this.state.currentUser.buds &&
                                 this.state.currentUser.buds.includes( this.state.id )
            budRequestReceived = this.state.buds &&
                                 this.state.buds.includes( this.state.currentUser.id )
        }

        return (
            this.state.id &&
            <Container>
                <Image style={[ STYLES.avatar, STYLES.spaceAfter ]}
                    source={ AVATARS.all[ this.state.avatar ] }>
                </Image>

                <Text style={[ STYLES.header, LOCAL_STYLES.username ]}>
                    { this.state.username }
                </Text>

                <Text style={ STYLES.spaceAfter }>
                    { this.state.age } year old { this.state.gender }
                </Text>

                { ( this.isOwnProfile || (budRequestSent && budRequestReceived) ) ?
                    this.state.contactMethods &&
                    <View style={[ LOCAL_STYLES.socialContainer,
                                 { width: .3 * SCREEN_HEIGHT } ]}>
                        {
                        this.state.contactMethods.map(({ method, info }) => (
                            <Button style={ LOCAL_STYLES.socialButton }
                                key={ method }
                                color={ COLORS.SECONDARY }
                                backgroundImage={ SOCIAL_ICONS[ method ] }
                                resizeMode='cover'
                                accessibilityLabel="Social Media Placeholder"
                                onPress={ () => {} }>
                            </Button>
                        ))
                        }
                    </View> 
                    :
                    <View style={ LOCAL_STYLES.socialContainer}>
                        <Button style={ LOCAL_STYLES.socialButton }
                            disabled={ true }
                            color={ COLORS.SECONDARY }
                            backgroundImage={ SOCIAL_ICONS[ 'facebook' ] }
                            resizeMode='cover'
                            accessibilityLabel="Social Media Placeholder">
                        </Button>

                        <Button style={ LOCAL_STYLES.socialButton }
                            disabled={ true }
                            color={ COLORS.SECONDARY }
                            backgroundImage={ SOCIAL_ICONS[ 'twitter' ] }
                            resizeMode='cover'
                            accessibilityLabel="Social Media Placeholder"
                            onPress={ () => {} }>
                        </Button>

                        <Button style={ LOCAL_STYLES.socialButton }
                            disabled={ true }
                            color={ COLORS.SECONDARY }
                            backgroundImage={ SOCIAL_ICONS[ 'reddit' ] }
                            resizeMode='cover'
                            accessibilityLabel="Social Media Placeholder"
                            onPress={ () => {} }>
                        </Button>

                        <Text style={ LOCAL_STYLES.socialLockedText }>
                            { this.state.username &&
                            `Add ${this.state.username} as a bud to connect with them.`
                            }
                        </Text>
                    </View>
                }

                { !this.isOwnProfile && [
                    !budRequestSent &&
                    <Button style={ STYLES.spaceBefore }
                        key='budbutton1'
                        label={
                            budRequestReceived ? 
                            'Accept Bud Request' : 'Become Buds'
                        }
                        accessibilityLabel='Become buds with this user'
                        onPress={ this.addBud.bind(this) } />,
                    !budRequestSent && budRequestReceived &&
                    <Button style={ STYLES.spaceBefore }
                        key='budbutton2'
                        label='Decline Bud Request'
                        accessibilityLabel="Don't become buds with this user"
                        onPress={ this.removeBud.bind(this) } />,
                    budRequestSent &&
                    <Button style={ STYLES.spaceBefore }
                        key='budbutton3'
                        label={
                            budRequestReceived ?
                            'Stop Being Buds' : 'Cancel Bud Request'
                        }
                        accessibilityLabel="Stop being buds with this user"
                        onPress={ this.removeBud.bind(this) } />
                ]}
            </Container>
        )
    }
}

const LOCAL_STYLES = StyleSheet.create({
    socialContainer: {
        flex: 0,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    socialButton: {
        width: COMPONENT_HEIGHT,
        margin: 6 * VH
    },
    socialLockedText: {
        position: 'absolute',
        width: 150 * VH,
        fontSize: FONT_SIZES.MEDIUM,
        color: COLORS.PRIMARY,
        fontFamily: 'HWTArtz'
    },
    username: {
        marginBottom: 0,
        color: COLORS.SECONDARY
    }
})
