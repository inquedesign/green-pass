import StartScreen           from './screens/start.screen'
import AccountCreationScreen from './screens/accountCreation.screen'
import LoginScreen           from './screens/login.screen'
import GenderScreen          from './screens/gender.screen'
import AgeScreen             from './screens/age.screen'
import UsernameScreen        from './screens/username.screen'
import AvatarScreen          from './screens/avatar.screen'
import ContactInfoScreen     from './screens/contactInfo.screen'
import TermsOfServiceScreen  from './screens/termsOfService.screen'
import ProfileScreen         from './screens/profile.screen' 
import BudsScreen            from './screens/buds.screen'
import ExploreScreen         from './screens/explore.screen'
import SettingsScreen        from './screens/settings.screen'

import { Platform       } from 'react-native'
import { Navigation     } from 'react-native-navigation'
import { SCREENS        } from './util/constants'
import { COLORS,
         FONT_SIZES     } from './styles'
import { MAIN_LAYOUT,
         INITIAL_LAYOUT } from './layouts'

Navigation.registerComponent( SCREENS.START_SCREEN, () => StartScreen )
Navigation.registerComponent( SCREENS.ACCOUNT_CREATION_SCREEN, () => AccountCreationScreen )
Navigation.registerComponent( SCREENS.LOGIN_SCREEN, () => LoginScreen )
Navigation.registerComponent( SCREENS.GENDER_SCREEN, () => GenderScreen )
Navigation.registerComponent( SCREENS.AGE_SCREEN, () => AgeScreen )
Navigation.registerComponent( SCREENS.USERNAME_SCREEN, () => UsernameScreen )
Navigation.registerComponent( SCREENS.AVATAR_SCREEN, () => AvatarScreen )
Navigation.registerComponent( SCREENS.CONTACT_INFO_SCREEN, () => ContactInfoScreen )
Navigation.registerComponent( SCREENS.TERMS_OF_SERVICE_SCREEN, () => TermsOfServiceScreen )
Navigation.registerComponent( SCREENS.PROFILE_SCREEN, () => ProfileScreen )
Navigation.registerComponent( SCREENS.BUDS_SCREEN, () => BudsScreen )
Navigation.registerComponent( SCREENS.EXPLORE_SCREEN, () => ExploreScreen )
Navigation.registerComponent( SCREENS.SETTINGS_SCREEN, () => SettingsScreen )

import UserService from './services/user.service'
import firebase from 'react-native-firebase'
const notifications = firebase.notifications
const BONG_HIT = 'bonghit.wav'

Navigation.events().registerAppLaunchedListener(() => {
    onNotificationLaunchedApp()

    configureDailyNotification()

    // TODO: remove autologin and UserService
    //if (firebase.auth().currentUser) firebase.auth().signOut()
    //UserService.login( 'bob@bob.com', 'asdfjkl;').then(() => {

    Navigation.setDefaultOptions({
        topBar: {
            visible: true,
            hideOnScroll: false,
            drawBehind: true,
            elevation: 0,
            noBorder: true,
            backButton: {
                color: COLORS.SECONDARY,
                title: 'Back',
                showTitle: true
            },
            background: {
                color: 'transparent'
            }
        },
        bottomTabs: {
            backgroundColor : COLORS.BOTTOMBAR,
            titleDisplayMode: 'alwaysShow',
            drawBehind: false
        },
        bottomTab: {
            iconColor: COLORS.INACTIVE,
            textColor: COLORS.INACTIVE,
            selectedIconColor: COLORS.TERTIARY,
            selectedTextColor: COLORS.TERTIARY,
            fontFamily: 'Open Sans',
            fontSize : FONT_SIZES.SMALL,
            selectedFontSize: FONT_SIZES.SMALL
        },
        blurOnUnmount: true
    })

    Navigation.setRoot({
        root: INITIAL_LAYOUT
    })
        
    //})
})

function onNotificationLaunchedApp() {
    notifications().getInitialNotification()
    .then( context => {
        if ( context ) notifications().removeDeliveredNotification( context.notification.notificationId )
    })
}

function configureDailyNotification() {
    notifications().cancelAllNotifications()

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
            notifications().displayNotification( its420 )
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
    })
    .catch( error => {
        // Don't notify
        console.error( 'Error setting up:\n' + error.message )
    })
}