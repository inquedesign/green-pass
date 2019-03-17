import StartScreen from './screens/start.screen'
import AccountCreationScreen from './screens/accountCreation.screen'
import GenderScreen from './screens/gender.screen'

import { Navigation } from "react-native-navigation"

Navigation.registerComponent( `StartScreen`, () => StartScreen )
Navigation.registerComponent( `AccountCreationScreen`, () => AccountCreationScreen )
Navigation.registerComponent( `GenderScreen`, () => GenderScreen )

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
        { component: { name: 'StartScreen' } }
    ]
}