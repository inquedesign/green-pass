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

import { Navigation } from "react-native-navigation"

import { COLORS,
         FONT_SIZES } from "./styles"
import { SCREENS        } from "./util/constants"

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

Navigation.events().registerAppLaunchedListener(() => {
    Navigation.setDefaultOptions({
        topBar: {
            visible: false,
            drawBehind: true,
            animate: false
        },
        bottomTabs: {
            backgroundColor : COLORS.HIGHLIGHT,
            titleDisplayMode: 'alwaysShow'
        },
        bottomTab: {
            iconColor: COLORS.PRIMARY,
            textColor: COLORS.PRIMARY,
            selectedIconColor: COLORS.PRIMARY,
            selectedTextColor: COLORS.PRIMARY,
            fontSize : FONT_SIZES.SMALL,
            selectedFontSize: FONT_SIZES.SMALL
        },
        blurOnUnmount: true
    })

    Navigation.setRoot({
        root: INITIAL_LAYOUT
    })
})

const INITIAL_LAYOUT = {
    stack: {
        children: [
            { component: { name: SCREENS.START_SCREEN } }
        ]
    }
}

export const MAIN_LAYOUT = {
    bottomTabs: {
        children: [{
            component: {
                id: SCREENS.PROFILE_SCREEN,
                name: SCREENS.PROFILE_SCREEN,
                options: {
                    bottomTab: {
                        icon: require('./assets/973-user-toolbar.png'),
                        text: 'PROFILE'
                    }
                }
            },
            //stack: {
            //    children: [{
            //        component: {
            //            name: SCREENS.BUDS_SCREEN
            //        }
            //    }],
            //    options: {
            //        bottomTab: {
            //            icon: require('image')
            //        }
            //    }
            //},
            //component: {
            //    name: SCREENS.EXPLORE_SCREEN,
            //    passProps: {
            //        profile: 'user-uid'
            //    },
            //    options: {
            //        bottomTab: {
            //            icon: require('image')
            //        }
            //    }
            //}
        }],
        options: {
            bottomTabs: {
                currentTabId: SCREENS.PROFILE_SCREEN
            }
        }
    }
}
