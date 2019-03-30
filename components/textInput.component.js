import React from 'react';
import { StyleSheet,
         TextInput as ReactInput } from 'react-native';

import { COLORS,
         FONT_SIZES,
         BORDER_RADIUS,
         COMPONENT_HEIGHT } from '../styles'

export default class TextInput extends React.Component {
    constructor( props ) {
        super( props )
        
        this.caps = this.props.allCaps === false ? false : true
        this.state = {
            editing: false
        }
    }
    
    componentwillReceiveProps( props ) {
        this.caps = this.props.allCaps === false ? false : true
    }

    onChangeText( text ) {
        if ( this.props.onChangeText ) {
            if ( this.caps ) this.props.onChangeText( text.toUpperCase() )
            else this.prop.onChangeText( text )
        }
    }

    render() {
        return (
            <ReactInput 
                { ...this.props }
                placeholder={ this.state.editing ? '' : this.props.placeholder }
                placeholderTextColor={ COLORS.PRIMARY }
                clearButtonMode='while-editing'
                underlineColorAndroid='transparent'
                autoCapitalize='none'
                autoCorrect={ false }
                onFocus={() => { this.setState({ editing: true }) }}
                onBlur={() => { this.setState({ editing: false }) }}
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