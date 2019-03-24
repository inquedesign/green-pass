import React from 'react'

import { Navigation  } from 'react-native-navigation'
import { View        } from 'react-native'
import { Text,
         Button,
         Container  } from '../components'
import { STYLES      } from '../styles'
import { SCREENS     } from '../util/constants'

import SplashScreen from 'react-native-splash-screen'


export default class TermsOfServiceScreen extends React.PureComponent {

    componentDidMount() {
        SplashScreen.hide()
    }

    goToCreateAccount() {
        Navigation.push(this.props.componentId, {
            component: { name: SCREENS.ACCOUNT_CREATION_SCREEN }
        })
    }

    goToStart() {
        Navigation.pop(this.props.componentId)
    }

    render() {
        return (
            <Container>
                <Text style={ STYLES.header }>
                    Terms of Service
                </Text>
                <Text style={ STYLES.spaceAfter }>
                    Terms of service
                </Text>
                <Button style={ STYLES.spaceAfter }
                    label="Accept"
                    accessibilityLabel="Accept the terms of serice"
                    onPress={ this.goToCreateAccount.bind(this) } />
                <Button
                    label="Decline"
                    accessibilityLabel="Decline the terms of service"
                    onPress={ this.goToStart.bind(this) } />
            </Container>
        )
    }
}
