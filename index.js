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
import UserService           from './services/user.service'
import NotificationService   from './services/notification.service'

import { Navigation     } from 'react-native-navigation'
import { SCREENS        } from './util/constants'
import { COLORS,
         FONT_SIZES     } from './styles'
import { MAIN_LAYOUT,
         initialLayout } from './layouts'
import { AVATARS        } from './util/avatars'

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

//import firebase from 'react-native-firebase'

Navigation.events().registerAppLaunchedListener(() => {
    NotificationService.onNotificationLaunchedApp()

    UserService.refresh()
    .then( currentUser => {
        if ( !currentUser ) return initialLayout( SCREENS.START_SCREEN )

        NotificationService.cancelNotifications()
        .then(() => {
            NotificationService.configureNotifications()
        })

        // Verify profile and determine redirect screen
        return Promise.all([
            UserService.getUserById(/* currentUser */),
            UserService.getContactMethods(/* currentUser */)
        ])
        .then( results => {
            const profile        = results[0]
            const contactMethods = results[1]

            if ( !(profile.gender && ['male', 'female', 'person'].includes( profile.gender )) ) {
                return initialLayout( SCREENS.GENDER_SCREEN )
            }
            else if ( !(profile.age && profile.age >= 21) ) {
                return initialLayout( SCREENS.AGE_SCREEN )
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
    })
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
