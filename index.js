import StartScreen from './screens/start.screen'
import AccountCreationScreen from './screens/accountCreation.screen'

import { Navigation } from "react-native-navigation"

Navigation.registerComponent( `StartScreen`, () => StartScreen )
Navigation.registerComponent( `AccountCreationScreen`, () => AccountCreationScreen )

Navigation.events().registerAppLaunchedListener(() => {
    Navigation.setDefaultOptions({
        topBar: {
            visible: false,
            drawBehind: true,
            animate: false
        },
        //popGesture: true
    })

    Navigation.setRoot({
        root: {
            stack: initialStack
        }
    })
})

const initialStack = {
    children: [
        { component: { name: 'AccountCreationScreen' } }
    ]
}