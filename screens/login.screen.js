import React       from 'react'
import UserService from '../services/user.service'

import { Navigation       } from 'react-native-navigation'
import { StyleSheet,
         View             } from 'react-native'
import { Text,
         TextInput,
         Button,
         Container        } from '../components'
import { STYLES,
         VH,
         COMPONENT_HEIGHT } from '../styles'
import { MAIN_LAYOUT      } from '../index'

import SplashScreen from 'react-native-splash-screen'


export default class LoginScreen extends React.PureComponent {
    constructor( props ) {
        super( props )
        this.state = {
            email: '',
            password: ''
        }
    }
    componentDidMount() {
        SplashScreen.hide()
    }

    onSubmit() {
        UserService.login(this.state.email, this.state.password)
        .then( credentials => {
            Navigation.setRoot({
                root: MAIN_LAYOUT
            })
        })
        .catch( error => {
            alert( "Error: " + error.message )
        })
    }

    render() {
        return (
            <Container>
                <Text style={ STYLES.header }>
                    Login
                </Text>

                <TextInput style={ STYLES.spaceAfter }
                    accessibilityLabel="Enter your email"
                    placeholder='E-mail'
                    autoComplete='email'
                    textContentType='emailAddress'
                    onChangeText={ (text) => this.setState({ email: text }) }/>

                <TextInput style={ STYLES.spaceAfter }
                    accessibilityLabel="Enter your password"
                    placeholder='Password'
                    autoComplete='password'
                    textContentType='password'
                    secureTextEntry={ true }
                    allCaps={ false }
                    onChangeText={ (text) => this.setState({ password: text }) }/>

                <Button style={ STYLES.spaceAfter }
                    label="Go"
                    accessibilityLabel="Submit e-mail and password"
                    onPress={ this.onSubmit.bind(this) } />

                <Text style={ STYLES.header }>
                    Or, use your social
                </Text>

                <View style={ LOCAL_STYLES.socialContainer }>
                    <Button style={ LOCAL_STYLES.socialButton }
                        label=""
                        accessibilityLabel="Social Media Placeholder"
                        onPress={ () => {} } />

                    <Button style={ LOCAL_STYLES.socialButton }
                        label=""
                        accessibilityLabel="Social Media Placeholder"
                        onPress={ () => {} } />

                    <Button style={ LOCAL_STYLES.socialButton }
                        label=""
                        accessibilityLabel="Social Media Placeholder"
                        onPress={ () => {} } />
                </View>
            </Container>
        )
    }
}

const LOCAL_STYLES = StyleSheet.create({
    socialContainer: {
        flex: 0,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    socialButton: {
        width: COMPONENT_HEIGHT
    }
});
