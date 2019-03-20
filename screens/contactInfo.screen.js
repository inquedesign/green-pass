import React       from 'react'
import splash      from 'react-native-splash-screen'
import UserService from '../services/user.service'

import { Navigation } from 'react-native-navigation'
import { StyleSheet,
         FlatList,
         Animated,
         Modal,
         View       } from 'react-native'
import { Text       } from '../components/text.component'
import { TextInput  } from '../components/textInput.component'
import { Button     } from '../components/button.component'
import { STYLES,
         COLORS     } from '../styles'
import { SCREENS    } from '../util/constants'


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
        UserService.update({ contactMethods: this.state.contactMethods })

        //Navigation.push(this.props.componentId, {
        //    component: { name: 'AgeScreen' }
        //})
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
            <View style={ STYLES.container }>
                <View style={ STYLES.content }>
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
                </View>

                <ServicesModal
                    visible={ this.state.modal }
                    onSubmit={ this.addContactMethod.bind(this) }/>
            </View>
        )
    }
}

class ServicesModal extends React.PureComponent {
    constructor( props ) {
        super( props )

        this.state = {
            submodal: false,
            services: [
                'Snapchat',
                'Facebook',
                'Instagram',
                'Text'
            ],
            service: '',
            contactInfo: ''
        }

        this.submodalOpacity = new Animated.Value( 0 )
    }

    componentWillReceiveProps( newProps ) {
        if ( newProps.visible === false ) this.setState({ submodal: false })
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
            <Modal
                visible={ this.props.visible }
                supportedOrientations={[ 'portrait' ]}
                onRequestClose={()=>{}}
                transparent={ false }
                animationType='fade'
                presentationStyle='formSheet'>

                <View style={ LOCAL_STYLES.modal }>
                    <View style={ STYLES.content }>
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
                    </View>
                </View>

                { this.state.submodal &&
                <Animated.View
                    style={[
                        LOCAL_STYLES.modal,
                        { opacity: this.submodalOpacity, position: 'absolute' }
                    ]}>

                    <View style={ STYLES.content }>
                        <Text style={ STYLES.header }>
                            Enter Your {'\n' + this.state.service} Info
                        </Text>

                        <TextInput style={ STYLES.spaceAfter }
                            accessibilityLabel={
                                'Enter your ' + this.state.service +
                                this.state.service === 'Text' ? 'phone number' : 'username'
                            }
                            placeholder={
                                this.state.service === 'Text' ? 'Phone #' : 'Username'
                            }
                            autoComplete={
                                this.state.service === 'Text' ? 'tel' : 'username'
                            }
                            textContentType={
                                this.state.service === 'Text' ? 'telephoneNumber' : 'username'
                            }
                            onChangeText={ (text) => this.setState({ contactInfo: text }) }/>

                        <Button
                            label="Submit"
                            accessibilityLabel="Submit your contact info"
                            onPress={ this.onSubmit.bind(this) }/>
                    </View>
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
    }
})
