import React       from 'react'
import firebase    from 'react-native-firebase'
import UserService from '../services/user.service'
import BGLocation  from '@mauron85/react-native-background-geolocation'

import { Navigation  } from 'react-native-navigation'
import { SCREENS     } from '../util/constants'

import { StyleSheet,
         Alert,
         View,
         ScrollView,
         AppState    } from 'react-native'
import { Text,
         Container,
         Button      } from '../components'
import { STYLES,
         COLORS,
         VH, VW      } from '../styles'
import { AVATARS     } from '../util/avatars'


export default class ExploreScreen extends React.Component {
    constructor( props ) {
        super( props )
        
        this.state = {
            buds  : new Set(),
            users : []
        }

        this.navigationEventListener = Navigation.events().bindComponent(this)
    }

    componentDidMount() {
        Promise.all([
            UserService.getBuds(),
            UserService.getUsersNearby()
        ])
        .then( results => {
            this.setState({ buds: results[0], users: results[1] ? results[1] : [] })
        })

        this.updateListener = UserService.addLocationsListener( nearbyUsers => {
            UserService.getBuds()
            .then( buds => {
                const users = nearbyUsers ? nearbyUsers : []
                this.setState({ buds: buds, users: users })
            })
        })
    }

    componentDidAppear() {
        BGLocation.checkStatus( status => {
            if ( !status.locationServicesEnabled || status.authorization === BGLocation.NOT_AUTHORIZED ) {
                Alert.alert(
                    '',
                    'Location Services must be enabled to use this feature. ' +
                    'Do you wish to go to your app settings?',
                    [{ text: 'Yes', onPress: () => BGLocation.showAppSettings() },
                     { text: 'No', style: 'cancel' }]
                )
            }
        })
    }

    componentWillUnmount() {
        this.navigationEventListener.remove()
        UserService.unsubscribe( this.updateListener )
    }

    goToProfile( user ) {
        UserService.getProfile()
        .then( profile => {
            if ( user.id === profile.id ) {
                Navigation.mergeOptions( SCREENS.MAIN_LAYOUT, {
                    bottomTabs: {
                        currentTabIndex: 0
                    }
                })
            }
            else {
                Promise.all([
                    UserService.getContactMethods( user.id ),
                    UserService.getBudRequest( user.id ),
                    UserService.getBuds()
                ])
                .then( results => {
                    Navigation.push( this.props.componentId, {
                        component: {
                            name: SCREENS.PROFILE_SCREEN,
                            passProps: {
                                user          : user,
                                contactMethods: results[0],
                                request       : results[1],
                                buds          : results[2]
                            }
                        }
                    })
                })
            }
        })
    }

    render() {
        return (
            <Container>
                {
                this.state.users.length > 0 &&
                <ScrollView contentContainerStyle={[
                    LOCAL_STYLES.listContainer,
                    { height: (Math.trunc((this.state.users.length - 1) / 2.5) + 1.275) * 98 * VW
                    }
                ]}>
                    {
                    this.state.users.map(( user, index ) => (
                    <View key={ user.id } style={[
                        LOCAL_STYLES.hexSides1,
                        {
                            top: Math.trunc( index / 2.5 ) * 98 * VW,
                            left: (index / 2.5 - Math.trunc( index / 2.5 )) * 84.8 + '%'
                        },
                    ]}>
                        <View style={ LOCAL_STYLES.hexSides2 }>
                            <View style={ LOCAL_STYLES.hexSides3 }>
                                <View  style={ LOCAL_STYLES.image }>
                                    <Button style={ LOCAL_STYLES.button }
                                        color='transparent'
                                        backgroundImage={ AVATARS.all[ user.avatar ] }
                                        overlayColor={
                                            user.id === UserService.currentUser.uid ? COLORS.SECONDARY :
                                            this.state.buds.has( user.id )          ? COLORS.PRIMARY   :
                                            COLORS.INACTIVE
                                        }
                                        resizeMode='cover'
                                        onPress={ () => this.goToProfile( user ) }>
                                    </Button>
                                </View>
                            </View>
                        </View>
                    </View>
                    ))
                    }
                </ScrollView>
                }
                {
                this.state.users.length === 0 &&
                <Text> 
                    There are no users nearby.
                </Text>
                }
            </Container>
        )
    }
}

const LOCAL_STYLES = StyleSheet.create({
    listContainer: {
        width: 335 * VW
    },
    hexSides1: {
        position: 'absolute',
        width: '32%',
        aspectRatio: 1.73205 / 2, // sqrt( 3 ) units wide, 2 units high
        backgroundColor: 'transparent',
        overflow: 'hidden'
    },
    hexSides2: {
        //position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        transform: [{rotateZ: '60deg'}],
        overflow: 'hidden'
    },
    hexSides3: {
        //position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        transform: [{rotateZ: '60deg'}],
        overflow: 'hidden'
    },
    image: {
        width: '100%',
        height: '100%',
        transform: [{rotateZ: '-120deg'}]
    },
    button: {
        height: '100%'
    }
})
