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
                //<ServicesModal
                //    visible={ this.state.modal }
                //    onSubmit={ this.addContactMethod.bind(this) }/>
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
        }

        this.contactInfo     = ''
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
        if ( this.contactInfo.length === 0 ) return
        if ( this.state.service === 'text' ) {
            this.contactInfo = this.contactInfo.replace( /[^0-9]+/g, '' )
            if ( this.contactInfo.length !== 10 ) {
                alert( 'Invalid phone number.' )
                return
            }
            this.contactInfo = {
                number: `(${this.contactInfo.slice(0, 3)}) ${this.contactInfo.slice(3, 6)}-${this.contactInfo.slice(6)}`
            }
        }
        else {
            this.contactInfo = {
                username: this.contactInfo
            }
        }


        this.props.onSubmit( this.state.service, this.contactInfo )
        Navigation.pop( this.props.componentId )
    }

    render() {
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
                                backgroundImage={ SERVICES[item].source }
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
                        onChangeText={ (text) => this.contactInfo = text }/>

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
