import React       from 'react'
import splash      from 'react-native-splash-screen'
import UserService from '../services/user.service'

import { Navigation  } from 'react-native-navigation'
import { StyleSheet  } from 'react-native'
import { Text,
         TextInput,
         Button,
         Container   } from '../components'
import { STYLES,
         COLORS,
         COMPONENT_HEIGHT } from '../styles'
import { SCREENS          } from '../util/constants'


export default class AccountCreationScreen extends React.PureComponent {
    constructor( props ) {
        super( props )
        this.state = {
            email   : '',
            password: '',
            pconfirm: '',
            confirmColor: COLORS.PRIMARY,
            emailColor  : COLORS.PRIMARY
        }
    }

    componentDidMount() {
        splash.hide()
    }

    validateEmail() {
        if ( this.emailIsValid() ) {
            this.setState({ emailColor: COLORS.PRIMARY })
        }
        else {
            this.setState({ emailColor: COLORS.ERROR })
        }
    }

    onChangePassword( text ) {
        this.setState({ password: text })
    }

    onChangePasswordConfirmation( text ) {
        this.setState({ pconfirm: text })
    }

    //confirmPassword() {
    //    // TODO: get update to fix color change not rendering or remove feedback
    //    if ( this.passwordIsValid() ) {
    //        this.setState({ confirmColor: COLORS.PRIMARY })
    //    }
    //    else {
    //        this.setState({ confirmColor: COLORS.ERROR })
    //    }
    //}

    emailIsValid() {
        return /^.+@.+(\..+)+$/.test( this.state.email )
    }

    passwordIsValid() {
        return ((this.state.password === this.state.pconfirm) && (this.state.password.length > 5))
    }

    onSubmit() {
        if ( this.emailIsValid() && this.passwordIsValid() ) {
            UserService.createAccount(this.state.email, this.state.password)
            .then( credentials => {
                Navigation.push(this.props.componentId, {
                    component: { name: SCREENS.GENDER_SCREEN }
                })
            })
            .catch( error => {
                alert( "Error: " + error.message )
            })
        }
        else alert( 'Invalid email or password' )
    }

    render() {
        return (
            <Container>
                <Text style={ STYLES.header }>
                    Account Creation
                </Text>
                <TextInput style={[ STYLES.spaceAfter, {color: this.state.emailColor} ]}
                    accessibilityLabel="Enter your email"
                    placeholder='E-mail'
                    autoComplete='email'
                    textContentType='emailAddress'
                    keyboardType='email-address'
                    onChangeText={ (text) => this.setState({ email: text }) }
                    onBlur={ this.validateEmail.bind(this) }
                />
                <TextInput style={ STYLES.spaceAfter }
                    accessibilityLabel="Enter your password"
                    placeholder='Password'
                    autoComplete='password'
                    textContentType='newPassword'
                    secureTextEntry={ true }
                    allCaps={ false }
                    onChangeText={ this.onChangePassword.bind(this) }
                />
                <TextInput style={[ STYLES.spaceAfter, {color: this.state.confirmColor} ]}
                    accessibilityLabel="Enter your password again"
                    placeholder='Confirm Password'
                    autoComplete='password'
                    secureTextEntry={ true }
                    allCaps={ false }
                    onChangeText={ this.onChangePasswordConfirmation.bind(this) }
                />
                <Button
                    label="Submit"
                    accessibilityLabel="Submit e-mail and password"
                    onPress={ this.onSubmit.bind(this) } />
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
})
