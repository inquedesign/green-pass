import React       from 'react'
import splash      from 'react-native-splash-screen'
import UserService from '../services/user.service'

import { Navigation       } from 'react-native-navigation'
import { ImageBackground,
         FlatList,
         Animated         } from 'react-native'
import { Text,
         TextInput,
         Button,
         Container,
         Modal            } from '../components'
import { STYLES,
         COLORS,
         FONT_SIZES,
         COMPONENT_HEIGHT,
         BORDER_RADIUS    } from '../styles'
import { MAIN_LAYOUT      } from '../index'

const SERVICES = {
    'facebook': { source: require( '../assets/bg/Fbook.png' ) },
    'twitter': { source: require( '../assets/bg/Twitter.png' ) },
    'whatsapp': { source: require( '../assets/bg/Whatsapp.png' ) },
    'snapchat': { source: require( '../assets/bg/Snapchat.png' ) },
    'reddit': { source: require( '../assets/bg/Reddit.png' ) },
    'instagram': { source: require( '../assets/bg/Insta.png' ) },
    'text': { source: require( '../assets/bg/Text.png' ) }
}

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
            contactInfo = `(${contactInfo.slice(0, 3)}) ${contactInfo.slice(3, 6)}-${contactInfo.slice(6)}`
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
            <ImageBackground style={[ STYLES.spaceAfter, {
                    width: '100%',
                    height: COMPONENT_HEIGHT,
                    flex: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: BORDER_RADIUS,
                    overflow: 'hidden'
                } ]}
                resizeMode='repeat'
                source={ SERVICES[item].source }>

                <Text style={{
                    textAlign: 'center',
                    color: COLORS.TERTIARY,
                    backgroundColor: 'transparent',
                    fontFamily: 'HWTArtz',
                    fontSize: FONT_SIZES.MEDIUM}}>

                    { this.state.contactMethods[item] }
                </Text>
            </ImageBackground>
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
                    label='Continue'
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
        if ( this.state.contactInfo.length == 0 ) return

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
                        data={ Object.keys( SERVICES ) }
                        keyExtractor={ (key, index) => key }
                        renderItem={ ({ item }) => (
                            <Button style={ STYLES.spaceAfter }
                                label={ item == 'text' ? 'text message' : item }
                                accessibilityLabel={ 'Add contact info for ' + item }
                                backgroundImage={ SERVICES[item].source }
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
