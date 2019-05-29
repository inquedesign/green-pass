import firebase from 'react-native-firebase'

import { Platform   } from 'react-native'
import { Navigation } from 'react-native-navigation'
import { SCREENS    } from '../util/constants'

const notifications = firebase.notifications
const messaging     = firebase.messaging
const pushTokens    = firebase.firestore().collection( 'PushTokens' )
const auth          = firebase.auth()
const BONG_HIT      = 'bonghit.wav'

let unsubscribeTokenListener = null

const BUD  = 'budRequest'
const ICON = 'launcher_icon'

function setToken( token ) {
    if ( !auth.currentUser.uid ) return
    pushTokens.doc( auth.currentUser.uid ).set({
        token: token
    }, {
        merge: true
    })
}

function getToken() {
    messaging().getToken()
    .then( token => {
        if ( token ) {
            setToken( token )
        }
    })
    
    unsubscribeTokenListener = messaging().onTokenRefresh( token => {
        setToken( token )
    })
}

export default class NotificationService {

    static unsubscribePushNotifications() {
        if ( unsubscribeTokenListener ) unsubscribeTokenListener()
        
        if ( auth.currentUser.uid ) pushTokens.doc( auth.currentUser.uid ).delete()
    }

    static cancelNotifications() {
        return notifications().cancelAllNotifications()
    }

    static onNotificationLaunchedApp() {
        notifications().getInitialNotification()
        .then( context => {
            if ( context ) notifications().removeDeliveredNotification( context.notification.notificationId )
        })
    }

    static configureNotifications() {
        firebase.messaging().hasPermission()
        .then( enabled => {
            if ( enabled ) return
            else return firebase.messaging().requestPermission()
        })
        .then(() => {
            const its420 = new notifications.Notification()
            .setNotificationId( '420' )
            .setTitle( '4:20' )
            .setBody( "It's 4:20! Make a wish." )
            .setSound( BONG_HIT )
            if ( Platform.OS === 'android' ) {
                notifications().android.createChannel( 
                    new notifications.Android.Channel( BUD, BUD, notifications.Android.Importance.Default )
                    .setSound( 'default' )
                )
                notifications().android.createChannel( 
                    new notifications.Android.Channel( '420', '420', notifications.Android.Importance.Default )
                    .setSound( BONG_HIT )
                )
                its420.android.setChannelId( '420' )
                its420.android.setSmallIcon( ICON )
            }

            notifications().onNotification( notification => {
                if ( notification.notificationId === '420' ) notification.setSound( BONG_HIT )
                else {
                    if ( Platform.OS === 'android' ) {
                        notification.android.setChannelId( BUD )
                        notification.android.setSmallIcon( ICON )
                    }
                    notification.setSound( 'default' )
                }
                notifications().displayNotification( notification )
            })

            notifications().onNotificationOpened( context => {
                notifications().removeDeliveredNotification( context.notification.notificationId )
                .then(() => {
                    if ( context.notification.notificationId === '420' ) return
                    Navigation.push( SCREENS.BUDS_SCREEN, {
                        component: {
                            name: SCREENS.PROFILE_SCREEN,
                            passProps: { userId: context.notification.data.userid },
                        }
                    })
                    .then(() => {
                        Navigation.mergeOptions( SCREENS.ROOT_SCREEN, {
                            bottomTabs: {
                                currentTabIndex: 1
                            }
                        })
                    })
                })
            })

            const notificationDate = new Date()
            notificationDate.setHours( 16 )
            notificationDate.setMinutes( 20 )
            notificationDate.setSeconds( 0 )

            notifications().scheduleNotification( its420, {
                fireDate: notificationDate.getTime(),
                repeatInterval: 'day',
                exact: true
            })
            
            getToken()
        })
        .catch( error => {
            // Don't notify
            console.error( 'Error setting up:\n' + error.message )
        })
    }
}