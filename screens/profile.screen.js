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
         VH,
         COMPONENT_HEIGHT } from '../styles'
import { SCREENS     } from '../util/constants'
import { AVATARS     } from '../util/avatars'

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
            })
        }
        else { // Get current user's profile
            UserService.getProfile()
            .then( profile => {
                this.setUserData( profile )
            })

            this.profileListener = UserService.addProfileListener( null, profile => {
                this.setUserData( profile )
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
        let budRequestSent
        let budRequestReceived
        if ( !this.isOwnProfile ) {
            budRequestSent     = this.state.currentUser.buds &&
                                 this.state.currentUser.buds.includes( this.state.id )
            budRequestReceived = this.state.buds &&
                                 this.state.buds.includes( this.state.currentUser.id )
        }

        return (
            <Container style={ LOCAL_STYLES.container }>
                <Image style={[ STYLES.avatar, STYLES.spaceAfter ]}
                    source={ AVATARS.all[ this.state.avatar ] }>
                </Image>
                {
                    this.state.id &&
                    <Text style={[ STYLES.header, { marginBottom: 0, color: COLORS.SECONDARY } ]}>
                        { this.state.username }
                    </Text>
                }

                {
                    this.state.id &&
                    <Text style={ STYLES.spaceAfter }>
                        { this.state.age } year old { this.state.gender }
                    </Text>
                }

                {
                    this.state.contactMethods &&
                    <View style={ LOCAL_STYLES.socialContainer }>
                        this.state.contactMethods.map(( method ) => (
                            <Button style={ LOCAL_STYLES.socialButton }
                                label={ method.key[0] }
                                key={ method.key }
                                accessibilityLabel="Social Media Placeholder"
                                onPress={ () => {} } />
                        ))
                    </View>
                }

                {
                    !this.isOwnProfile &&
                    <View style={{ width: '100%' }}>
                    {
                        !budRequestSent &&
                        <Button
                            label={
                                budRequestReceived ? 
                                'Accept Bud Request' : 'Become Buds'
                            }
                            accessibilityLabel='Become buds with this user'
                            onPress={ this.addBud.bind(this) } />
                    }
                    {
                        !budRequestSent && budRequestReceived &&
                        <Button style={{ marginTop: 15 * VH }}
                            label='Decline Bud Request'
                            accessibilityLabel="Don't become buds with this user"
                            onPress={ this.removeBud.bind(this) } />
                    }
                    {
                        budRequestSent &&
                        <Button style={ STYLES.spaceAfter }
                            label={
                                budRequestReceived ?
                                'Stop Being Buds' : 'Cancel Bud Request'
                            }
                            accessibilityLabel="Stop being buds with this user"
                            onPress={ this.removeBud.bind(this) } />
                    }
                    </View>
                }
            </Container>
        )
    }
}

const LOCAL_STYLES = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        marginVertical: 20 * VH
    },
    socialContainer: {
        flex: 0,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    socialButton: {
        width: COMPONENT_HEIGHT
    }
})
