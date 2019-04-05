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
Navigation.registerComponent( SCREENS.BUDS_SCREEN, () => BudsScreen )
Navigation.registerComponent( SCREENS.EXPLORE_SCREEN, () => ExploreScreen )

import UserService from './services/user.service'
import firebase from 'react-native-firebase'

Navigation.events().registerAppLaunchedListener(() => {
    // TODO: remove autologin and UserService
    //if (firebase.auth().currentUser) firebase.auth().signOut()
    UserService.login( 'bob@bob.com', 'asdfjkl;').then(() => {

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
            titleDisplayMode: 'alwaysShow'
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
        children: [
            {
                component: {
                    id: SCREENS.PROFILE_SCREEN,
                    name: SCREENS.PROFILE_SCREEN,
                    options: {
                        bottomTab: {
                            icon: require('./assets/icons/Profile.png'),
                            text: 'PROFILE'
                        }
                    }
                }
            },
            {
                stack: {
                    children: [{
                        component: {
                            name: SCREENS.BUDS_SCREEN
                        }
                    }],
                    options: {
                        bottomTab: {
                            icon: require('./assets/icons/Buds.png'),
                            text: 'BUDS'
                        }
                    }
                }
            },
            {
                component: {
                    name: SCREENS.EXPLORE_SCREEN,
                    options: {
                        bottomTab: {
                            icon: require('./assets/icons/Explore.png'),
                            text: 'EXPLORE'
                        }
                    }
                }
            }
        ],
        options: {
            bottomTabs: {
                currentTabId: SCREENS.PROFILE_SCREEN
            }
        }
    }
}
