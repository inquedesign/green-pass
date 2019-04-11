import React from 'react'
import UserService from '../services/user.service'

import { Navigation     } from 'react-native-navigation'
import { Alert          } from 'react-native'
import { Text,
         Button,
         Container      } from '../components'
import { STYLES         } from '../styles'
import { SCREENS        } from '../util/constants'

import SplashScreen from 'react-native-splash-screen'


export default class SettingsScreen extends React.PureComponent {
    componentDidMount() {
        SplashScreen.hide()
    }

    goToContactInfoScreen() {
        Navigation.push(this.props.componentId, {
            component: {
                name: SCREENS.CONTACT_INFO_SCREEN,
                passProps: { return: true }
            }
        })
    }

    logout() {
        UserService.logout()
    }

    deleteAccount() {
        Alert.alert(
            'Delete Account',
            'This action cannot be undone. Are you sure you want to delete this account?',
            [
                { text: 'No', style: 'cancel' },
                { text: 'Yes', style: 'destructive', onPress: () => {
                    UserService.deleteAccount()
                    .catch( error => {
                        alert( error.message )
                    })
                }}
            ]
        )
    }

    render() {
        return (
            <Container>
                <Text style={ STYLES.header }>
                    Settings
                </Text>

                <Button style={ STYLES.spaceAfter }
                    label="Connect Methods"
                    accessibilityLabel="Change your contact methods"
                    onPress={ this.goToContactInfoScreen.bind(this) } />

                <Button style={ STYLES.spaceAfter }
                    label="Logout"
                    accessibilityLabel="Log out of your account"
                    onPress={ this.logout.bind(this) } />

                <Button
                    label="Delete My Account"
                    accessibilityLabel="Delete your account"
                    onPress={ this.deleteAccount.bind(this) } />
            </Container>
        )
    }
}
