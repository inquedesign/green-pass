import React       from 'react'
import UserService from '../services/user.service'

import { Navigation       } from 'react-native-navigation'
import { TextInput,
         Button,
         Container        } from '../components'
import { STYLES,          } from '../styles'
import { MAIN_LAYOUT      } from '../layouts'
import { validatePassword } from '../util/validatePassword'

import SplashScreen from 'react-native-splash-screen'


export default class PasswordResetScreen extends React.PureComponent {
    constructor( props ) {
        super( props )
        this.state = {
            password: '',
            pconfirm: ''
        }
    }

    componentDidMount() {
        SplashScreen.hide()
    }

    onResetPassword() {
        validatePassword( this.state.password, this.state.pconfirm )
        .then(() => {
            return UserService.resetPassword( this.props.verificationCode, this.state.password )
        })
        .then(() => {
            return UserService.login( this.props.email, this.state.password )
        })
        .then(() => {
            Navigation.setRoot({
                root: MAIN_LAYOUT
            })
        })
        .catch( error => {
            if ( error.code ) {
                switch ( error.code ) {
                    case 'auth/expired-action-code':
                    case 'auth/invalid-action-code':
                        alert( 'Reset link is no longer valid. Please request a new link.' )
                        break
                    case 'auth/user-disabled':
                        alert( 'User account has been disabled.' )
                        break
                    case 'auth/user-not-found':
                        alert( 'Could not find user associated with this email.' )
                        break
                    case 'auth/weak-password':
                        alert( 'New password not strong enough.')
                        break
                    default:
                        alert( error.message )
                }
            }
            else if ( error.message ) alert( error.message )
            else alert( error )
        })
    }

    render() {
        return (
            <Container>
                <TextInput style={ STYLES.spaceAfter }
                    accessibilityLabel="Enter your new password"
                    placeholder='Password'
                    autoComplete='password'
                    textContentType='password'
                    secureTextEntry={ true }
                    allCaps={ false }
                    onChangeText={ (text) => this.setState({ password: text }) }/>

                <TextInput style={ STYLES.spaceAfter }
                    accessibilityLabel="Confirm your new password"
                    placeholder='Confirm Password'
                    autoComplete='password'
                    textContentType='password'
                    secureTextEntry={ true }
                    allCaps={ false }
                    onChangeText={ (text) => this.setState({ pconfirm: text }) }/>

                <Button style={ STYLES.spaceAfter }
                    label="Go"
                    accessibilityLabel="Submit new password"
                    onPress={ this.onResetPassword.bind(this) } />
            </Container>
        )
    }
}
