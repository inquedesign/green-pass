import React       from 'react'
import splash      from 'react-native-splash-screen'
import UserService from '../services/user.service'

import { Navigation  } from 'react-native-navigation'
import { StyleSheet,
         FlatList,
         Animated,
         View        } from 'react-native'
import { Text,
         TextInput,
         Button,
         Container,
         Modal       } from '../components'
import { STYLES,
         COLORS,
         REM         } from '../styles'
import { SCREENS     } from '../util/constants'
import { MAIN_LAYOUT } from '../index'


export default class ContactInfoScreen extends React.PureComponent {
    constructor( props ) {
        super( props )
        this.state = {
            modal: false,
            contactMethods: {},
        }
    }

    componentDidMount() {
        splash.hide()
    }

    addContactMethod( service, contactInfo ) {
        if ( service === 'text' ) {
            contactInfo = contactInfo.replace( /[^0-9]+/g, '' )
            if ( contactInfo.length !== 10 ) {
                alert( 'Invalid phone number.' )
                return
            }
        }

        this.setState({
            contactMethods: Object.assign(
                {},
                this.state.contactMethods,
                { [service]: contactInfo }
            ),
            modal: false
        })
    }

    onSubmit() {
        UserService.updateContactMethods( this.state.contactMethods )

        Navigation.setRoot({
            root: MAIN_LAYOUT
        })
    }

    renderService({ item }) {
        return (
            <TextInput style={ STYLES.spaceAfter }
                editable={ false }
                defaultValue={ item }/>
        )
    }

    render() {
        return (
            <Container>
                <Text style={ STYLES.header }>
                    Ways to Connect
                </Text>

                <Text style={ STYLES.spaceAfter }>
                    People will request to be your Bud to connect with you.
                </Text>

                <Text style={ STYLES.spaceAfter }>
                    If you accept, GreenPass will show them these methods to get to know you better.
                </Text>

                <FlatList style={{ width: '100%' }}
                    data={ Object.keys( this.state.contactMethods ) }
                    keyExtractor={ (item, index) => item }
                    renderItem={ this.renderService.bind(this) }/>

                <Button
                    style={
                        Object.keys(this.state.contactMethods).length > 0 ?
                        STYLES.spaceAfter : ''
                    }
                    label={
                        Object.keys(this.state.contactMethods).length > 0 ?
                        'Add Another Service' : 'Add a Service'
                    }
                    accessibilityLabel='Add a contact method'
                    onPress={ () => { this.setState({ modal: true }) } }/>

                {
                Object.keys(this.state.contactMethods).length > 0 &&
                <Button
                    label='Submit'
                    accessibilityLabel='Submit your contact methods'
                    onPress={ this.onSubmit.bind(this) }/>
                }

                <ServicesModal
                    visible={ this.state.modal }
                    onSubmit={ this.addContactMethod.bind(this) }/>
            </Container>

        )
    }
}

class ServicesModal extends React.PureComponent {
    constructor( props ) {
        super( props )

        this.state = {
            submodal: false,
            services: [
                'snapchat',
                'facebook',
                'instagram',
                'text'
            ],
            service: '',
            contactInfo: ''
        }

        this.submodalOpacity = new Animated.Value( 0 )
    }

    componentWillReceiveProps( newProps ) {
        if ( newProps.visible === false ) this.setState({ submodal: false })
        this.submodalOpacity = new Animated.Value( 0 )
    }

    updateService( service ) {
        this.setState({ service: service, submodal: true })

        Animated.timing( this.submodalOpacity, {
            toValue: 1,
            duration: 500,
        }).start()
    }

    onSubmit() {
        this.props.onSubmit( this.state.service, this.state.contactInfo )
    }

    render() {
        return (
            <Modal visible={ this.props.visible }>
                { !this.state.submodal &&
                <Animated.View style={{
                    width: '100%',
                    opacity:  this.submodalOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0]
                    })
                }}>

                    <Text style={ STYLES.header }>
                        Select the Service
                    </Text>

                    <FlatList style={{ width: '100%' }}
                        data={ this.state.services }
                        keyExtractor={ (item, index) => item }
                        renderItem={ ({ item }) => (
                            <Button style={ STYLES.spaceAfter }
                                label={ item }
                                accessibilityLabel={ 'Add contact info for ' + item }
                                onPress={() => {
                                    this.updateService( item )
                                }}/>
                        )}/>
                </Animated.View>
                }

                { this.state.submodal &&
                <Animated.View style={{
                    width: '100%',
                    opacity: this.submodalOpacity
                }}>

                    <Text style={ STYLES.header }>
                        Enter Your {'\n' + this.state.service} Info
                    </Text>

                    <TextInput style={ STYLES.spaceAfter }
                        accessibilityLabel={
                            'Enter your ' + this.state.service +
                            this.state.service === 'text' ? 'phone number' : 'username'
                        }
                        placeholder={
                            this.state.service === 'text' ? 'Phone #' : 'Username'
                        }
                        autoComplete={
                            this.state.service === 'text' ? 'tel' : 'username'
                        }
                        textContentType={
                            this.state.service === 'text' ? 'telephoneNumber' : 'username'
                        }
                        onChangeText={ (text) => this.setState({ contactInfo: text }) }/>

                    <Button
                        label="Submit"
                        accessibilityLabel="Submit your contact info"
                        onPress={ this.onSubmit.bind(this) }/>
                </Animated.View>
                }
            </Modal>
        )
    }
}

const LOCAL_STYLES = StyleSheet.create({
    modal: {
        flex: 0,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.BACKGROUND
    },
    content: {
        width: '100%',
        padding: 10 * REM,
        //maxWidth: .45 * SCREEN_HEIGHT,
        backgroundColor: 'transparent',
        alignItems: 'center'
    }
})
