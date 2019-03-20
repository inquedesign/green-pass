import StartScreen from './screens/start.screen'
import AccountCreationScreen from './screens/accountCreation.screen'
import GenderScreen from './screens/gender.screen'
import AgeScreen from './screens/age.screen'
import UsernameScreen from './screens/username.screen'
import AvatarScreen from './screens/avatar.screen'
import ContactInfoScreen from './screens/contactInfo.screen'
import TermsOfServiceScreen from './screens/termsOfService.screen'

import { Navigation } from "react-native-navigation"

import { SCREENS } from "./util/constants"

Navigation.registerComponent( SCREENS.START_SCREEN, () => StartScreen )
Navigation.registerComponent( SCREENS.ACCOUNT_CREATION_SCREEN, () => AccountCreationScreen )
Navigation.registerComponent( SCREENS.GENDER_SCREEN, () => GenderScreen )
Navigation.registerComponent( SCREENS.AGE_SCREEN, () => AgeScreen )
Navigation.registerComponent( SCREENS.USERNAME_SCREEN, () => UsernameScreen )
Navigation.registerComponent( SCREENS.AVATAR_SCREEN, () => AvatarScreen )
Navigation.registerComponent( SCREENS.CONTACT_INFO_SCREEN, () => ContactInfoScreen )
Navigation.registerComponent( SCREENS.TERMS_OF_SERVICE_SCREEN, () => TermsOfServiceScreen )

Navigation.events().registerAppLaunchedListener(() => {
    Navigation.setDefaultOptions({
        topBar: {
            visible: false,
            drawBehind: true,
            animate: false
        }
    })

    Navigation.setRoot({
        root: {
            stack: initialStack
        }
    })
})

const initialStack = {
    children: [
        { component: { name: SCREENS.START_SCREEN } }
    ]
}