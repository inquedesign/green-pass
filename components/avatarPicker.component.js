import React from 'react';

import { StyleSheet,
         View,
         Modal,
         FlatList,
         TouchableOpacity,
         Image            } from 'react-native';

import { COLORS,
         STYLES,
         SCREEN_HEIGHT,
         SCREEN_WIDTH     } from '../styles'

import { AVATARS } from '../util/avatars'

export default class AvatarPicker extends React.PureComponent {
    constructor( props ) {
        super( props )

        this.getAvatarList( props.gender )
        const avatars = Object.keys( this.avatars )
        const defaultProvided = this.props.default && avatars.includes( this.props.default )

        this.state = {
            modal: false,
            selection: defaultProvided
                ? this.props.default
                : avatars[0]
        }

        //if ( props.onChangeAvatar ) props.onChangeAvatar( this.state.selection )
    }

    componentWillReceiveProps( newProps ) {
        if ( newProps.gender != this.props.gender ) this.getAvatarList( newProps.gender )
        if ( newProps.default && newProps.default != this.state.selection ) {
            this.setState({ selection: newProps.default })
        }
    }

    getAvatarList( gender ) {
        if ( gender == 'male' ) this.avatars = AVATARS.male
        else if ( gender == 'female' ) this.avatars = AVATARS.female
        else this.avatars = AVATARS.all
    }

    selectAvatar( avatar ) {
        this.setState({ selection: avatar, modal: false })
        if( this.props.onChangeAvatar ) this.props.onChangeAvatar( avatar )
    }

    render() {
        return (
            <View style={ this.props.style }>
                <TouchableOpacity
                    onPress={() => this.setState({ modal: true }) }>
                    <Image style={[ STYLES.avatar ]}
                        source={ this.avatars[ this.state.selection ] }>
                    </Image>
                </TouchableOpacity>
                
                <Modal
                    visible={ this.state.modal }
                    transparent={ true }
                    animationType={ 'slide' }
                    onRequestClose={() => {}}>

                    <View style={ defaults.modalWrapper }>
                        <FlatList style={ defaults.modalContent }
                            numColumns={ 3 }
                            initialNumToRender={ 21 }
                            showsVerticalScrollIndicator={ false }
                            showsHorizontalScrollIndicator={ false }
                            data={ Object.keys( this.avatars ) }
                            keyExtractor={(key, index) => key}
                            renderItem={({item}) =>
                                <TouchableOpacity onPress={ () => this.selectAvatar( item ) }>
                                    <View style={ defaults.imageMax }>
                                        <Image style={[ defaults.imageSize, defaults.imageMax ]}
                                            source={ this.avatars[ item ] }>
                                        </Image>
                                    </View>
                                </TouchableOpacity>
                            }>
                        </FlatList>
                    </View>
                </Modal>
            </View>
        )
    }
}

const defaults = StyleSheet.create({
    imageSize: {
        width : SCREEN_WIDTH / 3,
        height: SCREEN_WIDTH / 3,
    },
    imageMax: {
        maxWidth : .5625 * SCREEN_HEIGHT / 3,
        maxHeight: .5625 * SCREEN_HEIGHT / 3,
    },
    modalWrapper: {
        flex          : 0,
        width         : SCREEN_WIDTH,
        justifyContent: 'center',
        alignItems    : 'center'
    },
    modalContent: {
        width          : SCREEN_WIDTH,
        maxWidth       : .5625 * SCREEN_HEIGHT,
        backgroundColor: COLORS.TERTIARY
    }
})