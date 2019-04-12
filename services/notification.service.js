import firebase    from 'react-native-firebase'

import { Platform       } from 'react-native'

const notifications = firebase.notifications
const messaging     = firebase.messaging
const pushTokens    = firebase.firestore().collection( 'PushTokens' )
const auth          = firebase.auth()
const BONG_HIT      = 'bonghit.wav'

let unsubscribeTokenListener = null

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
                    new notifications.Android.Channel( '420', '420', notifications.Android.Importance.Default )
                    .setSound( BONG_HIT )
                )
                its420.android.setChannelId( '420' )
            }

            notifications().onNotification( notification => {
                if ( notification.notificationId === '420' ) notification.setSound( BONG_HIT )
                else notification.setSound( 'default' )
                notifications().displayNotification( notification )
            })

            notifications().onNotificationOpened( context => {
                notifications().removeDeliveredNotification( context.notification.notificationId )
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