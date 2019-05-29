import React       from 'react'
import UserService from '../services/user.service'

import { Navigation       } from 'react-native-navigation'
import { StyleSheet       } from 'react-native'
import { Text,
         TextInput,
         Button,
         Container        } from '../components'
import { STYLES,
         COMPONENT_HEIGHT } from '../styles'
import { SOCIAL_ICONS     } from '../util/constants'
import { MAIN_LAYOUT      } from '../layouts'

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
        if ( this.state.email === '' || this.state.password === '' ) {
            alert( "Email and password are required." )
            return
        }

        UserService.login(this.state.email, this.state.password)
        .then( this.goToProfile )
        .catch( error => {
            alert( "Error: " + error.message )
        })
    }
    
    onSendResetEmail() {
        UserService.sendPasswordResetEmail( this.state.email )
        .then(() => {
            alert( 'Reset email was sent. Check you inbox for a password reset link.' )
        })
        .catch( error => {
            switch ( error.code ) {
                case 'auth/invalid-email':
                    alert( 'You need to enter a valid email to reset password' )
                    break
                case 'auth/user-not-found':
                    alert( 'Cannot find user associated with that email' )
                    break
            }
        })
    }
    
    //facebookLogin() {
    //    UserService.facebookLogin()
    //    .then( this.goToProfile )
    //    .catch( error => {
    //        if ( error.name === 'CANCELED' ) return
//
    //        alert( "Error: " + error.message )
    //    })
    //}

    goToProfile() {
        Navigation.setRoot({
            root: MAIN_LAYOUT
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
                    keyboardType='email-address'
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

                <Button style={ STYLES.spaceAfter }
                    label="Reset Password"
                    accessibilityLabel="Reset your password"
                    onPress={ this.onSendResetEmail.bind(this) } />

                { false && // Not currently implemented
                <Text style={ STYLES.header }>
                    Or, use your social
                </Text>
                }

                { false && // Not currently implemented
                <View style={ LOCAL_STYLES.socialContainer }>
                    <Button style={ LOCAL_STYLES.socialButton }
                        accessibilityLabel="Login using your facebook account"
                        backgroundImage={ SOCIAL_ICONS[ 'facebook' ] }
                        resizeMode='cover'
                        onPress={ this.facebookLogin.bind(this) } >
                    </Button>

                    <Button style={ LOCAL_STYLES.socialButton }
                        accessibilityLabel="Social Media Placeholder"
                        onPress={ () => {} } />

                    <Button style={ LOCAL_STYLES.socialButton }
                        accessibilityLabel="Social Media Placeholder"
                        onPress={ () => {} } />
                </View>
                }
            </Container>
        )
    }
}

const LOCAL_STYLES = StyleSheet.create({
    socialContainer: {
        flex: 0,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    socialButton: {
        width: COMPONENT_HEIGHT
    }
});
