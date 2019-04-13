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

    componentDidMount() {
        if ( this.props.userId && ( this.props.userId !== UserService.currentUser.uid ) ) {
            Promise.all([
                UserService.getUserById( this.props.userId ),
                UserService.profile || UserService.getUserById(/* currentUser */)
            ])
            .then( results => {
                this.isOwnProfile = false
                this.setUserData({ ...results[0], currentUser: results[1] })

                this.profileWatcher = UserService.addProfileListener( null, profile => {
//                    if ( profile && this.state.currentUser ) {
//                        newBudListContainsUser = profile.buds && profile.buds.includes( this.state.id )
//                        oldBudListContainsUser = this.state.currentUser.buds && this.state.currentUser.buds.includes( this.state.id )
//                        if (( newBudListContainsUser && !oldBudListContainsUser ) || ( !newBudListContainsUser && oldBudListContainsUser )) {
//                            this.setState({ disableButtons: false })
//                        }
//                    }
                    this.setState({ currentUser: profile, disableButtons: false })
                })

                this.userWatcher = UserService.addProfileListener( this.props.userId, profile => {
                    if ( profile ) this.setUserData( profile )
                    else Navigation.pop( this.props.componentId )
                })
                
                if (
                    results[1].buds && results[1].buds.includes( results[0].id ) &&
                    results[0].buds && results[0].buds.includes( results[1].id )
                ) {
                    this.contactMethodsWatcher = UserService.getContactMethods(
                        this.props.userId,
                        contactMethods => {
                            this.setState({ contactMethods: contactMethods })
                        }
                    )
                }
            })
        }
        else { // Get current user's profile
            if ( UserService.profile ) {
                this.setUserData( UserService.profile )
            }
            else {
                UserService.getUserById(/* current user */)
                .then( profile => {
                    this.setUserData( profile )
                })
            }

            this.profileWatcher = UserService.addProfileListener( null, profile => {
                this.setUserData( profile )
            })

            this.contactMethodsWatcher = UserService.getContactMethods( null, contactMethods => {
                this.setState({ contactMethods: contactMethods })
            })

            Navigation.mergeOptions( this.props.componentId, {
                topBar: {
                    rightButtons: [{
                        id: 'SettingsButton',
                        icon: require('../assets/icons/Settings.png'),
                        color: COLORS.SECONDARY
                    }]
                }
            })

            Navigation.events().bindComponent( this )
        }

        SplashScreen.hide()
    }
    
    componentWillUnmount() {
        if ( this.profileWatcher        ) UserService.unsubscribe( this.profileWatcher )
        if ( this.userWatcher           ) UserService.unsubscribe( this.userWatcher )
        if ( this.contactMethodsWatcher ) UserService.unsubscribe( this.contactMethodsWatcher )
    }

    navigationButtonPressed({ buttonId }) {
        if ( buttonId === 'SettingsButton' )
            Navigation.push( this.props.componentId, {
                component: { name: SCREENS.SETTINGS_SCREEN }
            })
    }

    setUserData( data ) {
        this.setState({
            id: data.id,
            username: data.username,
            age: data.age,
            gender: data.gender,
            avatar: data.avatar,
            buds: data.buds,
            currentUser: data.currentUser ? data.currentUser : this.state.currentUser,
            disableButtons: false
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
        UserService.updateUser({ avatar: avatar })
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

                <Text style={ STYLES.spaceAfter }>
                    { this.state.age } year old { this.state.gender }
                </Text>

                { ( this.isOwnProfile || (budRequestSent && budRequestReceived) ) ?
                    this.state.contactMethods &&
                    <View style={ LOCAL_STYLES.socialContainer }>
                        {
                        Object.keys( this.state.contactMethods ).map( method => (
                            <Button style={ LOCAL_STYLES.socialButton }
                                key={ method }
                                color={ COLORS.SECONDARY }
                                backgroundImage={ SOCIAL_ICONS[ method ] }
                                resizeMode='cover'
                                accessibilityLabel="Contact this user"
                                onPress={() => { this.activateLink( method ) }}>
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
                    !budRequestSent &&
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
                    !budRequestSent && budRequestReceived &&
                    <Button style={ STYLES.spaceBefore }
                        key='budbutton2'
                        label='Decline Bud Request'
                        disabled={ this.state.disableButtons }
                        accessibilityLabel="Don't become buds with this user"
                        onPress={ this.removeBud.bind(this) } />,
                    budRequestSent &&
                    <Button style={ STYLES.spaceBefore }
                        key='budbutton3'
                        label={
                            budRequestReceived ?
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
