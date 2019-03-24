import React from 'react'
import UserService from '../services/user.service'

import { Navigation  } from 'react-native-navigation'
import { StyleSheet,
         View,
         TouchableOpacity,
         FlatList,
         Image       } from 'react-native'
import { Text        } from '../components/text.component'
import { TextInput   } from '../components/textInput.component'
import { Button      } from '../components/button.component'
import { Container   } from '../components/container.component'
import { STYLES,
         COLORS,
         FONT_SIZES,
         SCREEN_HEIGHT,
         REM         } from '../styles'
import { SCREENS     } from '../util/constants'


export default class BudsScreen extends React.PureComponent {
    constructor( props ) {
        super( props )
        
        this.state = {
            searchMode: false,
            buds: [],
            searchResults: []
        }
        
        this.navigationEventListener = Navigation.events().bindComponent( this )
    }

    componentDidAppear() {
        // TODO: Move to listening for on change events on both bud list and individual records
        UserService.getBuds()
        .then(( results ) => {
            buds = results.map( (docref) => docref.data() )
            this.setState({ buds: buds })
        })
    }

    search( searchString ) {
        if ( searchString.length > 0 ) {
            this.setState({ searchMode: true })

            UserService.getByUsername( searchString )
            .then(( results ) => {
                this.setState({
                    searchMode: true,
                    searchResults: results
                })
            })
        }
    }

    showProfile( profile ) {
        Navigation.push( this.props.componentId, {
            component: { name: SCREENS.PROFILE_SCREEN, passProps: { profile: profile } }
        })
    }

    renderListItem({ item, index }) {
        const background = (index % 2) === 1 ? COLORS.DISABLED : COLORS.BACKGROUND
        return (
            <TouchableOpacity
                style={[ LOCAL_STYLES.row, { backgroundColor: background } ]}
                onPress={ () => { this.showProfile(item) } }>

                <Image style={ LOCAL_STYLES.thumbnail }>
                </Image>

                <View>
                    <Text style={{ fontSize: FONT_SIZES.MEDIUM, textAlign: 'left' }}>
                        { item.username }
                    </Text>

                    <Text style={{ fontSize: FONT_SIZES.SMALL, textAlign: 'left' }}>
                        { `${item.age} ${item.gender} from Palmer, AK` }
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }

    // TODO: Loading placeholder while data is fetched
    render() {
        return (
            <Container style={[ LOCAL_STYLES.content, {
                flex: 1,
                padding: 0,
                justifyContent: 'flex-start',
                marginVertical: 20 * REM,
                backgroundColor: this.state.searchMode ? COLORS.DISABLED : COLORS.BACKGROUND
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
                        onSubmitEditing={ (event) => { this.search( event.nativeEvent.text ) } }/>
                </View>

                <FlatList style={{ width: '100%' }}
                    data={ this.state.searchMode ? this.state.searchResults : this.state.buds }
                    keyExtractor={ (item, index) => item.id }
                    renderItem={ this.renderListItem.bind(this) }/>

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
        padding: 20 * REM
    },
    row: {
        flexDirection  : 'row',
        height         : 42 * REM,
        alignItems     : 'center'
    },
    thumbnail: {
        height          : '80%',
        marginHorizontal: '8%',
        aspectRatio     : 1,
        borderWidth     : 1,
        borderColor     : COLORS.PRIMARY
    }
}