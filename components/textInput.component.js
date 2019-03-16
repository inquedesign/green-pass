import React from 'react';
import { StyleSheet,
         Dimensions,
         TextInput as ReactInput } from 'react-native';

import { REM,
         COLORS,
         FONT_SIZES,
         COMPONENT_HEIGHT } from '../styles'

export class TextInput extends React.Component {    
    render() {
        return (
            <ReactInput { ...this.props }
                style={[ defaults.input, this.props.style ]}
                placeholderColor={ COLORS.DISABLED }
                underlineColorAndroid='transparent'
            />
        )
    }
}

const defaults = StyleSheet.create({
    input: {
        width          : '100%',
        height         : COMPONENT_HEIGHT,
        color          : COLORS.PRIMARY,
        textAlign      : 'center',
        fontWeight     : '200',
        fontSize       : FONT_SIZES.MEDIUM,
        borderWidth    : 1,
        borderRadius   : .5 * COMPONENT_HEIGHT,
        borderColor    : COLORS.PRIMARY,
        backgroundColor: COLORS.BACKGROUND
    }
})