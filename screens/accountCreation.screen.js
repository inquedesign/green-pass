import React from 'react'

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

import SplashScreen from 'react-native-splash-screen'

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
        SplashScreen.hide()
    }

    validateEmail() {
        if ( /^.+@.+(\..+)+$/.test( this.state.email ) ) {
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
        if ( this.state.password === this.state.pconfirm ) {
            this.setState({ confirmColor: COLORS.PRIMARY })
        }
        else {
            this.setState({ confirmColor: COLORS.ERROR })
        }
    }

    createAccount() {}

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
                        value={ this.state.email }
                        autoComplete='email'
                        onChangeText={ (text) => this.setState({ email: text }) }
                        onBlur={ this.validateEmail.bind(this) }
                    />
                    <TextInput style={ LOCAL_STYLES.input }
                        accessibilityLabel="Enter your password"
                        placeholder='Password'
                        value={ '*'.repeat( this.state.password.length ) }
                        autoComplete='password'
                        onChangeText={ this.onChangePassword.bind(this) }
                    />
                    <TextInput style={[ LOCAL_STYLES.input, {color: this.state.confirmColor} ]}
                        accessibilityLabel="Enter your password again"
                        placeholder='Confirm Password'
                        value={ '*'.repeat( this.state.pconfirm.length ) }
                        autoComplete='password'
                        onChangeText={ this.onChangePasswordConfirmation.bind(this) }
                    />
                    <Button style={ LOCAL_STYLES.submit }
                        label="Submit"
                        accessibilityLabel="Submit e-mail and password"
                        onPress={ this.createAccount } />
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
        justifyContent: 'space-evenly'
    },
    socialButton: {
        width: COMPONENT_HEIGHT
    }
});
