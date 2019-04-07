import React       from 'react'
import splash      from 'react-native-splash-screen'
import UserService from '../services/user.service'

import { parsePhoneNumberFromString,
         AsYouType        } from 'libphonenumber-js/mobile'
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
    'facebook': {
        text: "What is your Facebook username?",
        subtext:"This is not the same as your login name. Go to General Account Settings on Facebook if you can't remember.",
        bgsource: require( '../assets/bg/Fbook.png' )
    },
    'twitter': {
        text: 'What is your Twitter username?',
        bgsource: require( '../assets/bg/Twitter.png' )
    },
    'whatsapp': {
        text: 'WhatsApp uses your phone number, what is it?',
        subtext: 'This needs to be your full international number.',
        bgsource: require( '../assets/bg/Whatsapp.png' )
    },
    'snapchat': {
        text: 'What is your Snapchat username?',
        bgsource: require( '../assets/bg/Snapchat.png' )
    },
    'reddit': {
        text: 'What is your Reddit username?',
        bgsource: require( '../assets/bg/Reddit.png' )
    },
    'instagram': {
        text: 'What is your Instagram username?',
        bgsource: require( '../assets/bg/Insta.png' )
    },
    'text': {
        text: 'What is your number for texting?',
        subtext: 'This needs to be your full international number.',
        bgsource: require( '../assets/bg/Text.png' )
    }
}

Navigation.registerComponent( 'ServicesModal', () => ServicesModal )

export default class ContactInfoScreen extends React.PureComponent {
    constructor( props ) {
        super( props )

        this.state = {
            contactMethods: {},
        }
    }

    componentDidMount() {
        splash.hide()
    }

    showModal() {
        Navigation.push(this.props.componentId, {
            component: {
                name: 'ServicesModal',
                passProps: {
                    onSubmit: this.addContactMethod.bind(this)
                }
            }
        })
    }

    addContactMethod( service, contactInfo ) {
        this.setState({
            contactMethods: Object.assign(
                {},
                this.state.contactMethods,
                { [service]: contactInfo }
            )
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
                source={ SERVICES[item].bgsource }>

                <Text style={{
                    textAlign: 'center',
                    color: COLORS.TERTIARY,
                    backgroundColor: 'transparent',
                    fontFamily: 'HWTArtz',
                    fontSize: FONT_SIZES.MEDIUM}}>

                    { ( this.state.contactMethods[item].number &&
                      parsePhoneNumberFromString( '+' + this.state.contactMethods[item].number ).formatInternational() ) ||
                      this.state.contactMethods[item].username
                    }
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
                    scrollEnabled={ false }
                    alwaysBounceVertical={ false }
                    showsHorizontalScrollIndicator={ false }
                    showsVerticalScrollIndicator={ false }
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
                    onPress={ () => { this.showModal() } }/>

                {
                Object.keys(this.state.contactMethods).length > 0 &&
                <Button
                    label='Continue'
                    accessibilityLabel='Submit your contact methods'
                    onPress={ this.onSubmit.bind(this) }/>
                }

            </Container>

        )
    }
}

export class ServicesModal extends React.PureComponent {
    constructor( props ) {
        super( props )

        this.state = {
            submodal: false,
            service: '',
            contactInfo: ''
        }

        this.numberFormatter = new AsYouType()
        this.numberFormatter.input('+')
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
        if ( this.state.contactInfo.length === 0 ) return

        if ( this.state.service === 'text' || this.state.service === 'whatsapp' ) {
            // Returns a number in E.164 format (+1234...) if it can.
            let number = parsePhoneNumberFromString( '+' + this.state.contactInfo )

            if ( number && number.isValid() ) {
                number = number.number.slice(1) // Remove leading +
            }
            else {
                alert( 'Invalid phone number.' )
                return
            }

            contactInfo = {
                number: number
            }
        }
        else {
            contactInfo = {
                username: this.state.contactInfo
            }
        }


        this.props.onSubmit( this.state.service, contactInfo )
        Navigation.pop( this.props.componentId )
    }

    render() {
        const serviceNeedsNumber = this.state.service === 'text' || this.state.service === 'whatsapp'
        return (
            <Container>
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
                        scrollEnabled={ false }
                        alwaysBounceVertical={ false }
                        showsHorizontalScrollIndicator={ false }
                        showsVerticalScrollIndicator={ false }
                        data={ Object.keys( SERVICES ) }
                        keyExtractor={ (key, index) => key }
                        renderItem={ ({ item }) => (
                            <Button style={ STYLES.spaceAfter }
                                label={ item == 'text' ? 'text message' : item }
                                accessibilityLabel={ 'Add contact info for ' + item }
                                backgroundImage={ SERVICES[item].bgsource }
                                color='transparent'
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
                        { SERVICES[this.state.service].text }
                    </Text>

                    { SERVICES[this.state.service].subtext &&
                    <Text style={ STYLES.spaceAfter }>
                        { SERVICES[this.state.service].subtext }
                    </Text>
                    }

                    <TextInput style={ STYLES.spaceAfter }
                        value={ this.state.contactInfo }
                        accessibilityLabel={
                            'Enter your ' + this.state.service +
                            serviceNeedsNumber ? 'phone number' : 'username'
                        }
                        placeholder={
                            serviceNeedsNumber ? 'Phone #' : 'Username'
                        }
                        autoComplete={
                            serviceNeedsNumber ? 'tel' : 'username'
                        }
                        textContentType={
                            serviceNeedsNumber ? 'telephoneNumber' : 'username'
                        }
                        keyboardType={
                            serviceNeedsNumber ? 'phone-pad' : 'default'
                        }
                        onChangeText={ serviceNeedsNumber
                            ? ( text ) => {
                                text = text.replace(/[^0-9]+/g, '')
                                text = text.replace(/^0+/, '')
                                let number = this.numberFormatter.input( '+' + text )
                                this.setState({
                                    contactInfo: number.slice(1)
                                })
                                this.numberFormatter.reset()
                            }
                            : ( text ) => { this.setState({ contactInfo: text }) } }/>

                    <Button
                        label="Submit"
                        accessibilityLabel="Submit your contact info"
                        onPress={ this.onSubmit.bind(this) }/>
                </Animated.View>
                }
            </Container>
        )
    }
}
