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
         Container   } from '../components'
import { STYLES,
         COLORS,
         FONT_SIZES,
         STANDARD_SPACE,
         //SCREEN_HEIGHT,
         VH          } from '../styles'
import { SCREENS     } from '../util/constants'
import { AVATARS     } from '../util/avatars'


export default class BudsScreen extends React.Component {
    constructor( props ) {
        super( props )
        
        this.state = {
            searchMode   : false,
            buds         : [],
            budRequests  : [],
            searchResults: []
        }
    }

    componentDidMount() {
        UserService.getBuds()
        .then( results => {
            this.sortBudsAndRequests( results )
        })
        this.budsListener = UserService.addBudsListener( results => {
            this.sortBudsAndRequests( results )
        })
        this.profileListener = UserService.addProfileListener( null, profile => {
            this.sortBudsAndRequests( this.state.buds.concat( this.state.budRequests ) )
        })
    }

    componenWillUnmount() {
        if ( this.budsListener    ) UserService.removeBudsListener( this.budsListener )
        if ( this.profileListener ) UserService.removeProfileListener( this.profileListener )
    }

    sortBudsAndRequests( results ) {
        const budList     = UserService.profile.buds
        const budRequests = results.filter( bud => !(budList && budList.includes( bud.id )) )
        const buds        = results.filter( bud => budList && budList.includes( bud.id ) )
        this.setState({ buds: buds, budRequests: budRequests })
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

                <View>
                    <Image style={ LOCAL_STYLES.thumbnail }
                        source={ AVATARS.all[ data.avatar ] }>
                    </Image>
                </View>

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

    renderHeader({ section: {title, data} }) {
        return (
            data.length > 0 &&
            <Text style={{
                    paddingHorizontal: 22 * VH,
                    paddingVertical: 11 * VH,
                    fontFamily: 'HWTArtz',
                    fontSize: FONT_SIZES.LARGE,
                    color: COLORS.PRIMARY,
                    textAlign: 'left',
                }}>
                { title }
            </Text>
        )
    }

    render() {
        return (
            <Container
                containerStyle={ LOCAL_STYLES.container }
                contentStyle={ LOCAL_STYLES.content }>

                <View style={ LOCAL_STYLES.searchField }>
                    <TextInput
                        accessibilityLabel="Find a bud to add"
                        placeholder='+ Add Bud'
                        autoComplete='username'
                        textContentType='username'
                        onChangeText={ (text) => {
                            if (text.length === 0) {
                                this.setState({ searchMode: false })
                            }
                        }}
                        onSubmitEditing={ (event) => { this.search( event.nativeEvent.text.toUpperCase() ) }}/>
                </View>

                <SectionList style={{ width: '100%' }}
                    stickySectionHeadersEnabled={ false }
                    scrollEnabled={ false }
                    alwaysBounceVertical={ false }
                    showsHorizontalScrollIndicator={ false }
                    showsVerticalScrollIndicator={ false }
                    keyExtractor={ (item, index) => item.id }
                    renderSectionHeader={ this.renderHeader.bind(this) }
                    renderItem={ this.renderItem.bind(this) }
                    ListEmptyComponent={ () => {
                        return (
                            <View style={{ width: 100, height: 100, backgroundColor: 'blue' }}></View>
                        )
                    }}
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
    container: {
        justifyContent: 'flex-start'
    },
    content: {
        padding: 0,
    },
    searchField: {
        width     : '100%',
        padding   : STANDARD_SPACE
    },
    row: {
        flexDirection  : 'row',
        height         : 45 * VH,
        alignItems     : 'center'
    },
    thumbnail: {
        height     : 36 * VH,
        width      : 36 * VH,
        marginLeft : 22 * VH,
        marginRight: 10 * VH,
        borderWidth: 1,
        borderColor: COLORS.SECONDARY
    }
}