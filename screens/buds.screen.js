import React from 'react'
import UserService from '../services/user.service'

import { Navigation  } from 'react-native-navigation'
import { StyleSheet,
         View,
         TouchableOpacity,
         SectionList,
         Image       } from 'react-native'
import { Text,
         TextInput,
         Button,
         Container   } from '../components'
import { STYLES,
         COLORS,
         FONT_SIZES,
         //SCREEN_HEIGHT,
         VH         } from '../styles'
import { SCREENS     } from '../util/constants'


export default class BudsScreen extends React.PureComponent {
    constructor( props ) {
        super( props )
        
        this.state = {
            searchMode   : false,
            buds         : [],
            budRequests  : [],
            searchResults: []
        }
        
        this.navigationEventListener = Navigation.events().bindComponent( this )
    }

    componentDidAppear() {
        // TODO: Move to listening for on change events on both bud list and individual records
        UserService.getBuds()
        .then(( results ) => {
            this.setState({ buds: results })
        })
    }

    search( searchString ) {
        if ( searchString.length > 0 ) {
            this.setState({ searchMode: true })

            UserService.getUserByUsername( searchString )
            .then(( results ) => {
                this.setState({
                    searchMode: true,
                    searchResults: results
                })
            })
        }
    }

    showProfile( userId ) {
        Navigation.push( this.props.componentId, {
            component: { name: SCREENS.PROFILE_SCREEN, passProps: { userId: userId } }
        })
    }

    renderItem({ item, index }) {
        const data = item
        const background = (index % 2) === 0 ? COLORS.HIGHLIGHT : COLORS.BACKGROUND
        return (
            <TouchableOpacity
                style={[ LOCAL_STYLES.row, { backgroundColor: background } ]}
                onPress={ () => { this.showProfile(data.id) } }>

                <Image style={ LOCAL_STYLES.thumbnail }>
                </Image>

                <View>
                    <Text style={{ fontSize: FONT_SIZES.MEDIUM, fontFamily: 'HWTArtz', textAlign: 'left' }}>
                        { data.username }
                    </Text>

                    <Text style={{ fontSize: FONT_SIZES.MEDIUM * .95, textAlign: 'left' }}>
                        { `${data.age} ${data.gender}` }
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }

    renderHeader({ section: {title} }) {
        return (
            <Text style={{
                    paddingHorizontal: '10%',
                    paddingVertical: '5%',
                    fontFamily: 'HWTArtz',
                    fontSize: FONT_SIZES.LARGE,
                    color: COLORS.PRIMARY,
                    textAlign: 'left',
                }}>
                { title }
            </Text>
        )
    }

    // TODO: Loading placeholder while data is fetched
    render() {
        return (
            <Container style={[ LOCAL_STYLES.content, {
                flex: 1,
                padding: 0,
                justifyContent: 'flex-start',
                marginVertical: 20 * VH
            }]}>

                <View style={ LOCAL_STYLES.searchField }>
                    <TextInput
                        accessibilityLabel="Find a bud to add"
                        placeholder='+ Add Bud'
                        autoComplete='username'
                        textContentType='username'
                        onChangeText={ (text) => {
                            if (text.length === 0) this.setState({ searchMode: false })
                        }}
                        onSubmitEditing={ (event) => { this.search( event.nativeEvent.text.toUpperCase() ) }}/>
                </View>

                <SectionList style={{ width: '100%' }}
                    data={ this.state.searchMode ? this.state.searchResults : this.state.buds }
                    keyExtractor={ (item, index) => item.id }
                    renderSectionHeader={ this.renderHeader.bind(this) }
                    renderItem={ this.renderItem.bind(this) }
                    sections={
                        this.state.searchMode ? [
                            { title: 'Results', data: this.state.searchResults }
                        ] : [
                            { title: 'Bud Requests', data: this.state.budRequests },
                            { title: 'Buds', data: this.state.buds }
                        ]
                    }
                    />

            </Container>
        )
    }
}

const LOCAL_STYLES = {
    content: {
        //width       : .5625 * SCREEN_HEIGHT,
        //maxWidth          : '100%',
        //alignItems     : 'center',
        //backgroundColor: 'transparent'
    },
    searchField: {
        width         : '100%',
        padding: 15 * VH
    },
    row: {
        flexDirection  : 'row',
        height         : 42 * VH,
        alignItems     : 'center'
    },
    thumbnail: {
        height          : '80%',
        marginHorizontal: '10%',
        aspectRatio     : 1,
        borderWidth     : 1,
        borderColor     : COLORS.SECONDARY
    }
}