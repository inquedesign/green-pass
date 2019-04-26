import React from 'react'

import { AsyncStorage    } from 'react-native'
import { Navigation      } from 'react-native-navigation'
import { Text,
         Button,
         Container       } from '../components'
import { STYLES          } from '../styles'
import { SCREENS,
         SKIP_DISCLAIMER } from '../util/constants'

import SplashScreen from 'react-native-splash-screen'


export default class DisclaimerScreen extends React.PureComponent {
    componentDidMount() {
        SplashScreen.hide()
    }

    goToStart() {
        AsyncStorage.setItem( SKIP_DISCLAIMER, 'true' )
        .then(() => {
            Navigation.push(this.props.componentId, {
                component: { name: SCREENS.START_SCREEN }
            })
        })
        .catch( error => {
            Navigation.push(this.props.componentId, {
                component: { name: SCREENS.START_SCREEN }
            })
        })
    }

    render() {
        return (
            <Container>
                <Text style={ STYLES.header }>
                    Think First
                </Text>
                <Text style={ STYLES.spaceAfter }>
                    Abusing any substance is a bad idea. GreenPass encourages our users to be responsible, and thoughtful, about their consumption. We do not promote the use of any substance.
                </Text>
                <Button
                    label="I Understand"
                    accessibilityLabel="I understand"
                    onPress={ this.goToStart.bind(this) } />
            </Container>
        )
    }
}
