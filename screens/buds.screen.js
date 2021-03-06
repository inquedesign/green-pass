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
         VH          } from '../styles'
import { SCREENS     } from '../util/constants'
import { AVATARS     } from '../util/avatars'


export default class BudsScreen extends React.Component {
    constructor( props ) {
        super( props )
        
        this.profileIsLoading = false

        this.state = {
            searchMode   : false,
            searching    : false,
            buds         : [],
            searchResults: []
        }
        
        this.setBudsAndRequests = this.setBudsAndRequests.bind(this)
    }

    componentDidMount() {
        this.setBudsAndRequests()

        this.budsListener = UserService.addBudsListener( this.setBudsAndRequests )
    }

    componenWillUnmount() {
        if ( this.budsListener    ) UserService.unsubscribe( this.budsListener )
    }

    setBudsAndRequests() {
        Promise.all([
            UserService.getBuds(),
            UserService.getBudRequesters()
        ])
        .then( results => {
            const buds       = Array.from( results[0].values() )
            const requests   = Array.from( results[1].values() )
            const categories = []

            if ( requests.length > 0 ) categories.push({ title: 'Bud Requests', data: requests })
            if ( buds.length > 0 ) categories.push({ title: 'Buds', data: buds })
            this.setState({ buds: categories })
        })
        .catch( error => {
            console.error( JSON.stringify( error, null, 4 ) )
        })
    }

    search( searchString ) {
        this.searchString = searchString

        if ( searchString.length > 0 ) {
            this.setState({ searchMode: true, searching: true })

            UserService.getUsersByUsername( searchString )
            .then( results => {
                this.setState({
                    searchResults: results.length > 0 ? [{
                        title: 'Results',
                        data: results
                    }] : [],
                    searching: false
                })
            })
        }
    }

    showProfile( user ) {
        if ( this.profileIsLoading ) return;

        if ( user.id === UserService.currentUser.uid ) {
            Navigation.mergeOptions( SCREENS.MAIN_LAYOUT, {
                bottomTabs: {
                    currentTabIndex: 0
                }
            })
        }
        else {
            this.profileIsLoading = true

            Promise.all([
                UserService.getContactMethods( user.id ),
                UserService.getBudRequest( user.id ),
                UserService.getBuds()
            ])
            .then( results => {
                this.profileIsLoading = false
                Navigation.push( this.props.componentId, {
                    component: {
                        name: SCREENS.PROFILE_SCREEN,
                        passProps: {
                            user          : user,
                            contactMethods: results[0],
                            request       : results[1],
                            buds          : results[2]
                        }
                    }
                })
            })
            .catch( error => {
                if ( this.state.searchMode ) this.search( this.searchString )
                else this.setBudsAndRequests()
            })
        }
    }

    renderItem({ item, index }) {
        const data = item
        const background = (index % 2) === 0 ? COLORS.HIGHLIGHT : COLORS.BACKGROUND
        return (
            <TouchableOpacity
                style={[ LOCAL_STYLES.row, { backgroundColor: background } ]}
                onPress={ () => { this.showProfile( data ) } }>

                <View>
                    <Image style={ LOCAL_STYLES.thumbnail }
                        source={ AVATARS.all[ data.avatar ] }>
                    </Image>
                </View>

                <View style={ LOCAL_STYLES.rowData }>
                    <Text style={ LOCAL_STYLES.rowHeader }>
                        { data.username }
                    </Text>

                    <Text style={ LOCAL_STYLES.dataItem }>
                        { `${data.age} ${data.gender}` }
                    </Text>

                    { data.distance != undefined &&
                    <Text style={ LOCAL_STYLES.dataItem }>
                        { `${data.distance} miles` }
                    </Text>
                    }
                </View>
            </TouchableOpacity>
        )
    }

    renderHeader({ section: {title, data} }) {
        return (
            <Text style={ LOCAL_STYLES.sectionHeader }>
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

                <SectionList style={ LOCAL_STYLES.list }
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
                            <Text style={{ paddingVertical: 11 * VH }}> {
                                this.state.searchMode
                                ? this.state.searching
                                    ? 'Searching...'
                                    : 'There are no results for that username.'
                                : 'You have no buds, yet. Why not find some?'
                            } </Text>
                        )
                    }}
                    sections={
                        this.state.searchMode ? this.state.searchResults : this.state.buds
                    }
                    />

            </Container>
        )
    }
}

const LOCAL_STYLES = StyleSheet.create({
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
    list: {
        width: '100%'
    },
    sectionHeader: {
        paddingHorizontal: 22 * VH,
        paddingVertical: 11 * VH,
        fontFamily: 'HWTArtz',
        fontSize: FONT_SIZES.LARGE,
        color: COLORS.PRIMARY,
        letterSpacing: 1.5,
        textAlign: 'left'
    },
    row: {
        flexDirection  : 'row',
        height         : 50 * VH,
        alignItems     : 'center'
    },
    rowHeader: {
        fontSize: FONT_SIZES.MEDIUM,
        fontFamily: 'HWTArtz',
        textAlign: 'left'
    },
    rowData: {
        flex: 1,
        height: '100%',
        justifyContent: 'center'
    },
    dataItem: {
        fontSize: FONT_SIZES.MEDIUM * .9,
        textAlign: 'left'
    },
    thumbnail: {
        height     : '80%',
        aspectRatio: 1,
        marginLeft : 22 * VH,
        marginRight: 10 * VH,
        borderWidth: 1,
        borderColor: COLORS.SECONDARY
    }
})