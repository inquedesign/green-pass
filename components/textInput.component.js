import React from 'react';
import { StyleSheet,
         Platform,
         View,
         Text,
         TouchableOpacity,
         TextInput as ReactInput } from 'react-native';
import Button from './button.component'
import { COLORS,
         VH,
         FONT_SIZES,
         BORDER_RADIUS,
         COMPONENT_HEIGHT } from '../styles'

export default class TextInput extends React.Component {
    constructor( props ) {
        super( props )
        
        this.caps = props.allCaps === false ? false : true
        this.state = {
            editing: false,
            text: ''
        }
    }
    
    componentwillReceiveProps( props ) {
        this.caps = props.allCaps === false ? false : true
    }

    onChangeText( text ) {
        this.setState({ text: text })

        if ( this.props.onChangeText ) {
            if ( this.caps ) this.props.onChangeText( text.toUpperCase() )
            else this.props.onChangeText( text )
        }
    }

    render() {
        return (
            <View style={[ defaults.container, this.props.style ]}>
                <ReactInput 
                    { ...this.props }
                    value={ this.props.value || this.state.text }
                    placeholder={ this.state.editing ? '' : this.props.placeholder }
                    placeholderTextColor={ COLORS.PRIMARY }
                    underlineColorAndroid='transparent'
                    autoCapitalize='none'
                    autoCorrect={ false }
                    onFocus={() => { this.setState({ editing: true }) }}
                    onBlur={() => { this.setState({ editing: false }) }}
                    onChangeText={ this.onChangeText.bind(this) }
                    style={ defaults.input }
                />
                
                { this.state.text.length > 0 &&
                <TouchableOpacity style={ defaults.clearButton }
                    onPress={() => {
                        this.setState({ text: '' })
                        this.onChangeText( '' )
                    }}>

                    <Text style={ defaults.clearButtonLabel }>
                        X
                    </Text>
                </TouchableOpacity>
                }
            </View>
        )
    }
}

const HEIGHT = COMPONENT_HEIGHT

const defaults = StyleSheet.create({
    container: {
        flexDirection  : 'row',
        borderWidth    : 1,
        borderRadius   : BORDER_RADIUS,
        borderColor    : COLORS.PRIMARY,
        backgroundColor: COLORS.TERTIARY,
    },
    input: {
        width          : '100%',
        height         : HEIGHT,
        color          : COLORS.PRIMARY,
        textAlign      : 'center',
        fontFamily     : 'HWTArtz',
        fontSize       : FONT_SIZES.MEDIUM,
        fontWeight     : 'normal',
        letterSpacing  : 1.5,
        textDecorationLine: 'none'
    },
    clearButton: {
        position: 'absolute',
        right   : 0,
        flex    : 0,
        justifyContent: 'center',
        alignItems: 'center',
        width   : COMPONENT_HEIGHT,
        height  : COMPONENT_HEIGHT
    },
    clearButtonLabel: {
        width            : 16 * VH,
        height           : 16 * VH,
        lineHeight       : 16 * VH,
        textAlign        : 'center',
        textAlignVertical: 'center',
        borderRadius     : 8 * VH,
        backgroundColor  : '#D0D0D0',
        color            : COLORS.TERTIARY ,
        fontFamily       : 'Open Sans',
        fontWeight       : 'bold',
        fontSize         : 10 * VH,
        overflow         : 'hidden'
    }
})