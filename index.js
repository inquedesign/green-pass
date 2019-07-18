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
import DisclaimerScreen      from './screens/disclaimer.screen'
import PasswordResetScreen   from './screens/passwordReset.screen'
import UserService           from './services/user.service'
import NotificationService   from './services/notification.service'

import { AsyncStorage  } from 'react-native'
import { Navigation    } from 'react-native-navigation'
import { SCREENS,
         SKIP_DISCLAIMER } from './util/constants'
import { COLORS,
         FONT_SIZES    } from './styles'
import { MAIN_LAYOUT,
         initialLayout } from './layouts'
import { AVATARS       } from './util/avatars'

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
Navigation.registerComponent( SCREENS.DISCLAIMER_SCREEN, () => DisclaimerScreen )
Navigation.registerComponent( SCREENS.PASSWORD_RESET_SCREEN, () => PasswordResetScreen )

import firebase            from 'react-native-firebase'

Navigation.events().registerAppLaunchedListener(() => {
    UserService.handleDeepLinking()

    NotificationService.onNotificationLaunchedApp()

    //UserService.refreshUser()
    //firebase.auth().signInWithEmailAndPassword(
    //            'mongotest@email.com',
    //            'aoeuaoeu'
    //)
    let startup
    if ( !UserService.currentUser ) {
        startup = AsyncStorage.getItem( SKIP_DISCLAIMER )
        .then( skipDisclaimer => {
            if ( skipDisclaimer ) return initialLayout( SCREENS.START_SCREEN )
            else return initialLayout( SCREENS.DISCLAIMER_SCREEN )
        })
    }
    else {
        NotificationService.cancelNotifications()
        .then(() => {
            NotificationService.configureNotifications()
        })

        // Verify profile and determine redirect screen
        startup = Promise.all([
            UserService.getProfile(/* currentUser */),
            UserService.getContactMethods(/* currentUser */)
        ])
        .then( results => {
            const profile        = results[0]
            const contactMethods = results[1]

            if ( !(profile.gender && ['male', 'female', 'person'].includes( profile.gender )) ) {
                return initialLayout( SCREENS.GENDER_SCREEN )
            }
            else if ( !profile.username ) {
                return initialLayout( SCREENS.USERNAME_SCREEN )
            }
            else if ( !(profile.avatar && Object.keys( AVATARS.all ).includes( profile.avatar )) ) {
                return initialLayout( SCREENS.AVATAR_SCREEN )
            }
            else if ( !(contactMethods && Object.keys( contactMethods ).length > 0) ) {
                return initialLayout( SCREENS.CONTACT_INFO_SCREEN )
            }
            else return MAIN_LAYOUT
        })
    }
    Promise.resolve( startup )
    .then( startingLayout => {
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
            root: startingLayout
        })
    })
        
})
