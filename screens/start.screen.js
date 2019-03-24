import React from 'react'

import { Navigation  } from 'react-native-navigation'
import { StyleSheet,
         View        } from 'react-native'
import { Text        } from '../components/text.component'
import { Button      } from '../components/button.component'
import { Container   } from '../components/container.component'
import { STYLES,
         REM         } from '../styles'
import { SCREENS     } from '../util/constants'

import SplashScreen from 'react-native-splash-screen'


export default class StartScreen extends React.PureComponent {
    constructor() {
        super()
        this.state = {}
    }

    componentDidMount() {
        SplashScreen.hide()
    }

    goToTermsOfService() {
        Navigation.push(this.props.componentId, {
            component: { name: SCREENS.TERMS_OF_SERVICE_SCREEN }
        })
    }

    goToLogin() {
        Navigation.push(this.props.componentId, {
            component: { name: SCREENS.LOGIN_SCREEN }
        })
    }

    render() {
        return (
            <Container>
                <Text style={ STYLES.header }>
                    GreenPass connects {'\n'} Cannabis enthusiasts
                </Text>
                <Text style={ LOCAL_STYLES.body }>
                    To get started, we need to {'\n'} make your profile
                </Text>
                <Button style={ STYLES.spaceAfter }
                    label="Create an Account"
                    accessibilityLabel="Create an account"
                    onPress={ this.goToTermsOfService.bind(this) } />
                <Button
                    label="Login"
                    accessibilityLabel="Login"
                    onPress={ this.goToLogin.bind(this) } />
            </Container>
        )
    }
}

const LOCAL_STYLES = StyleSheet.create({
    body: {
        marginBottom: 42 * REM
    }
});
