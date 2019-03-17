import React    from 'react'
import firebase from 'react-native-firebase'
import splash   from 'react-native-splash-screen'

import { Navigation  } from 'react-native-navigation'
import { StyleSheet,
         ScrollView,
         View        } from 'react-native'
import { Text        } from '../components/text.component'
import { TextInput   } from '../components/textInput.component'
import { Button      } from '../components/button.component'
import { STYLES,
         COLORS,
         FONT_SIZES,
         REM,
         COMPONENT_HEIGHT } from '../styles'


export default class AccountCreationScreen extends React.Component {
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
        this.setState({ password: text }, this.confirmPassword.bind(this))
    }

    onChangePasswordConfirmation( text ) {
        this.setState({ pconfirm: text }, this.confirmPassword.bind(this))
    }

    confirmPassword() {
        if ( this.passwordIsValid() ) {
            this.setState({ confirmColor: COLORS.PRIMARY })
        }
        else {
            this.setState({ confirmColor: COLORS.ERROR })
        }
    }

    emailIsValid() {
        return /^.+@.+(\..+)+$/.test( this.state.email )
    }

    passwordIsValid() {
        return ((this.state.password === this.state.pconfirm) && (this.state.password.length > 5))
    }

    onSubmit() {
        if ( this.emailIsValid() && this.passwordIsValid() ) {
            firebase.auth()
            .createUserWithEmailAndPassword(this.state.email, this.state.password)
            .then( credentials => {
                // Navigate to next screen
                // credentials.additionalUserInfo.profile? .username?
                // credentials.user.displayName? .email? .metadata? .photoURL?
            })
            .catch( error => {
                alert( "Error: " + error.message )
            })
        }
    }

    render() {
        return (
            <View style={ STYLES.container }>
                <View style={ STYLES.content }>
                    <Text style={ LOCAL_STYLES.header }>
                        Account Creation
                    </Text>
                    <TextInput style={[ LOCAL_STYLES.input, {color: this.state.emailColor} ]}
                        accessibilityLabel="Enter your email"
                        placeholder='E-mail'
                        autoComplete='email'
                        value={ this.state.email }
                        onChangeText={ (text) => this.setState({ email: text }) }
                        onBlur={ this.validateEmail.bind(this) }
                    />
                    <TextInput style={ LOCAL_STYLES.input }
                        accessibilityLabel="Enter your password"
                        placeholder='Password'
                        autoComplete='password'
                        secureTextEntry={ true }
                        value={ this.state.password }
                        onChangeText={ this.onChangePassword.bind(this) }
                    />
                    <TextInput style={[ LOCAL_STYLES.input, {color: this.state.confirmColor} ]}
                        accessibilityLabel="Enter your password again"
                        placeholder='Confirm Password'
                        autoComplete='password'
                        secureTextEntry={ true }
                        value={ this.state.pconfirm }
                        onChangeText={ this.onChangePasswordConfirmation.bind(this) }
                    />
                    <Button style={ LOCAL_STYLES.submit }
                        label="Submit"
                        accessibilityLabel="Submit e-mail and password"
                        onPress={ this.onSubmit.bind(this) } />
                    <Text style={ LOCAL_STYLES.header }>
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
                </View>
            </View>
        )
    }
}

const LOCAL_STYLES = StyleSheet.create({
    header: {
        fontSize: FONT_SIZES.LARGE,
        marginBottom: 18 * REM
    },
    submit: {
        marginBottom: 36 * REM
    },
    input: {
        marginBottom: 12 * REM
    },
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
