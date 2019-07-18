import React from 'react'
import UserService from '../services/user.service'

import { Navigation  } from 'react-native-navigation'
import { StyleSheet,
         Linking,
         View,
         Image       } from 'react-native'
import { Text,
         Button,
         AvatarPicker,
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


export default class ProfileScreen extends React.Component {
    static options( props ) {
        if ( props.user && ( props.user.id !== UserService.currentUser.uid ) ) return {}

        return {
            topBar: {
                rightButtons: [{
                    id: 'SettingsButton',
                    icon: require('../assets/icons/Settings.png'),
                    color: COLORS.SECONDARY
                }]
            }
        }
    }

    constructor( props ) {
        super( props )

        this.state = {
            id            : null,
            username      : null,
            age           : null,
            gender        : null,
            avatar        : null,
            location      : null,
            distance      : null,
            contactMethods: null,
            buds          : null,
            budRequest    : null,
            disableButtons: false
        }
        
        this.isOwnProfile = true
        this.onUpdate     = this.onUpdate.bind( this )

        Navigation.events().bindComponent( this )
    }

    componentDidMount() {
        if ( this.props.user && ( this.props.user.id !== UserService.currentUser.uid ) ) {
            this.isOwnProfile = false
            this.setUserData( this.props.user )
            this.setState({
                contactMethods: this.props.contactMethods,
                budRequest    : this.props.request,
                buds          : this.props.buds
            })

            this.profileWatcher = UserService.addProfileListener( this.props.user.id, this.onUpdate )
        }
        else { // Get current user's profile
            this.isOwnProfile = true

            UserService.getProfile()
            .then( profile => {
                this.setUserData( profile )
            })
            .catch( error => {
                console.error( JSON.stringify( error, null, 4 ) )
            })

            UserService.getContactMethods(/* Current User */)
            .then( contactMethods => {
                this.setState({ contactMethods: contactMethods })
            })
            .catch( error => {
                console.error( JSON.stringify( error, null, 4 ) )
            })

            this.profileWatcher = UserService.addProfileListener( null, this.onUpdate )
        }

        SplashScreen.hide()
    }
    
    componentWillUnmount() {
        if ( this.profileWatcher ) UserService.unsubscribe( this.profileWatcher )
    }

    onUpdate( profile, contactMethods, buds, request, location, deleted ) {
        if ( profile ) this.setUserData( profile )
        if ( contactMethods ) this.setState({
            contactMethods: Object.assign( {}, this.state.contactMethods, contactMethods )
        })
        if ( buds ) {
            this.setState({
                budRequest: null,
                buds: buds,
                disableButtons: false
            })
        }
        if ( request ) {
            this.setState({
                budRequest: request,
                disableButtons: false
            })
        }
        if ( location && this.state.location ) {
            this.setState({ distance: UserService.getDistance( this.state.location ) })
        }
        if ( deleted ) {
            Navigation.pop( this.props.componentId )
        }
    }

    navigationButtonPressed({ buttonId }) {
        if ( buttonId === 'SettingsButton' )
            Navigation.push( this.props.componentId, {
                component: { name: SCREENS.SETTINGS_SCREEN }
            })
    }

    setUserData( data ) {
        this.setState({
            id      : data.id       || this.state.id,
            username: data.username || this.state.username,
            age     : data.age      || this.state.age,
            gender  : data.gender   || this.state.gender,
            avatar  : data.avatar   || this.state.avatar,
            distance: data.distance !== undefined ? data.distance : this.state.distance
        })
    }

    addBud() {
        if ( !this.isOwnProfile ) {
            this.setState({ disableButtons: true })
            UserService.addBud( this.state.id )
        }
    }

    removeBud() {
        if ( !this.isOwnProfile ) {
            this.setState({ disableButtons: true })
            UserService.removeBud( this.state.id )
        }
    }

    activateLink( service ) {
        let url
        switch( service ) {
            case 'facebook':
                url = `https://www.facebook.com/${this.state.contactMethods[ service ].username}`
                break
            case 'twitter':
                url = `https://www.twitter.com/${this.state.contactMethods[ service ].username}`
                break
            case 'whatsapp':
                url = `https://wa.me/${this.state.contactMethods[ service ].number}`
                break
            case 'snapchat':
                url = `https://www.snapchat.com/add/${this.state.contactMethods[ service ].username}`
                break
            case 'reddit':
                url = `https://www.reddit.com/user/${this.state.contactMethods[ service ].username}`
                break
            case 'instagram':
                url = `https://www.instagram.com/${this.state.contactMethods[ service ].username}`
                break
            case 'text':
                url = `sms:+${this.state.contactMethods[ service ].number}`
                break
        }
        Linking.openURL( url )
        .catch( error => {
            alert( 'Profile Screen: ' + error.message )
        })
    }

    onChangeAvatar( avatar ) {
        if ( this.state.avatar === avatar ) return
        UserService.updateUser({ avatar: avatar })
    }

    render() {
        let budRequestSent     = false
        let budRequestReceived = false
        let buds = false
        if ( !this.isOwnProfile ) {
            buds = !!( this.state.buds && this.state.buds.has( this.state.id ) )
            budRequestSent     = !!( this.state.budRequest && this.state.budRequest.requester !== this.state.id )
            budRequestReceived = !!( this.state.budRequest && this.state.budRequest.requester === this.state.id )
        }

        return (
            this.state.id &&
            <Container>
                { this.isOwnProfile &&
                <AvatarPicker style={ STYLES.spaceAfter }
                    default={ this.state.avatar }
                    gender={ this.state.gender }
                    onChangeAvatar={ this.onChangeAvatar.bind(this) }/>
                }

                { !this.isOwnProfile &&
                <Image style={[ STYLES.avatar, STYLES.spaceAfter ]}
                    source={ AVATARS.all[ this.state.avatar ] }>
                </Image>
                }

                <Text style={[ STYLES.header, LOCAL_STYLES.username ]}>
                    { this.state.username }
                </Text>

                <Text>
                    { this.state.age } year old { this.state.gender }
                </Text>

                { this.state.distance != null &&
                <Text>
                    { this.state.distance } miles
                </Text>
                }
                
                <View style={ STYLES.spaceAfter }></View>

                { ( this.isOwnProfile || buds ) ?
                    this.state.contactMethods &&
                    <View style={ LOCAL_STYLES.socialContainer }>
                        {
                        Object.keys( this.state.contactMethods ).map( method => (
                            this.state.contactMethods[method] ?
                            <Button style={ LOCAL_STYLES.socialButton }
                                key={ method }
                                color={ COLORS.SECONDARY }
                                backgroundImage={ SOCIAL_ICONS[ method ] }
                                resizeMode='cover'
                                accessibilityLabel="Contact this user"
                                onPress={() => { this.activateLink( method ) }}>
                            </Button>
                            : null
                        ))
                        }
                    </View> 
                    :
                    <View style={ LOCAL_STYLES.socialContainer}>
                        <Button style={ LOCAL_STYLES.socialButton }
                            disabled={ true }
                            color={ COLORS.SECONDARY }
                            backgroundImage={ SOCIAL_ICONS[ 'facebook' ] }
                            resizeMode='cover'>
                        </Button>

                        <Button style={ LOCAL_STYLES.socialButton }
                            disabled={ true }
                            color={ COLORS.SECONDARY }
                            backgroundImage={ SOCIAL_ICONS[ 'twitter' ] }
                            resizeMode='cover'>
                        </Button>

                        <Button style={ LOCAL_STYLES.socialButton }
                            disabled={ true }
                            color={ COLORS.SECONDARY }
                            backgroundImage={ SOCIAL_ICONS[ 'reddit' ] }
                            resizeMode='cover'>
                        </Button>

                        <Text style={ LOCAL_STYLES.socialLockedText }>
                            { this.state.username &&
                            `Add ${this.state.username} as a bud to connect with them.`
                            }
                        </Text>
                    </View>
                }

                { !this.isOwnProfile && [
                    (!buds && !budRequestSent) &&
                    <Button style={ STYLES.spaceBefore }
                        key='budbutton1'
                        label={
                            budRequestReceived ? 
                            'Accept Bud Request' : 'Become Buds'
                        }
                        disabled={ this.state.disableButtons }
                        accessibilityLabel='Become buds with this user'
                        onPress={ () => {
                            this.addBud()
                        }} />,
                    budRequestReceived &&
                    <Button style={ STYLES.spaceBefore }
                        key='budbutton2'
                        label='Decline Bud Request'
                        disabled={ this.state.disableButtons }
                        accessibilityLabel="Don't become buds with this user"
                        onPress={ this.removeBud.bind(this) } />,
                    (buds || budRequestSent) &&
                    <Button style={ STYLES.spaceBefore }
                        key='budbutton3'
                        label={
                            buds ?
                            'Stop Being Buds' : 'Cancel Bud Request'
                        }
                        disabled={ this.state.disableButtons }
                        accessibilityLabel="Stop being buds with this user"
                        onPress={ () => {
                            this.removeBud()
                        }} />
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
        width: .3 * SCREEN_HEIGHT
    },
    socialButton: {
        width: COMPONENT_HEIGHT,
        margin: 6 * VH
    },
    socialLockedText: {
        position: 'absolute',
        width: .3 * SCREEN_HEIGHT,
        fontSize: FONT_SIZES.MEDIUM,
        color: COLORS.PRIMARY,
        fontFamily: 'HWTArtz'
    },
    username: {
        marginBottom: 0,
        color: COLORS.SECONDARY
    }
})
