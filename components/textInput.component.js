import React from 'react';
import { StyleSheet,
         TextInput as ReactInput } from 'react-native';

import { COLORS,
         FONT_SIZES,
         COMPONENT_HEIGHT } from '../styles'

export class TextInput extends React.Component {    
    render() {
        return (
            <ReactInput { ...this.props }
                style={[ defaults.input, this.props.style ]}
                placeholderColor={ COLORS.DISABLED }
                underlineColorAndroid='transparent'
                autoCapitalize='none'
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
        fontWeight     : '200',
        fontSize       : FONT_SIZES.MEDIUM,
        borderWidth    : 1,
        borderRadius   : .5 * HEIGHT,
        borderColor    : COLORS.PRIMARY,
        backgroundColor: COLORS.BACKGROUND
    }
})