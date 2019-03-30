import React from 'react';
import { StyleSheet,
         TextInput as ReactInput } from 'react-native';

import { COLORS,
         FONT_SIZES,
         BORDER_RADIUS,
         COMPONENT_HEIGHT } from '../styles'

export default class TextInput extends React.Component {
    onChangeText( text ) {
        if ( this.props.onChangeText ) this.props.onChangeText( text.toUpperCase() )
    }

    render() {
        return (
            <ReactInput 
                { ...this.props }
                allCaps={ this.props.allCaps == false ? false : true }
                placeholderTextColor={ COLORS.PRIMARY }
                clearButtonMode='while-editing'
                underlineColorAndroid='transparent'
                autoCapitalize='none'
                autoCorrect={ false }
                onChangeText={ this.onChangeText.bind(this) }
                style={[ defaults.input, this.props.style ]}
            />
        )
    }
}

const HEIGHT = COMPONENT_HEIGHT

const defaults = StyleSheet.create({
    input: {
        width          : '100%',
        height         : HEIGHT,
        color          : COLORS.PRIMARY,
        textAlign      : 'center',
        fontFamily     : 'HWTArtz',
        fontSize       : FONT_SIZES.MEDIUM,
        letterSpacing  : 1.5,
        borderWidth    : 1,
        borderRadius   : BORDER_RADIUS,
        borderColor    : COLORS.PRIMARY,
        backgroundColor: COLORS.BACKGROUND,
        textDecorationLine: 'none'
    }
})