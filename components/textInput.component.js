import React from 'react';
import { StyleSheet,
         Platform,
         View,
         TextInput as ReactInput } from 'react-native';
import { Button } from './button.component'
import { COLORS,
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
                <Button style={ defaults.clearButton }
                    label='X'
                    color='#E0E0E0'
                    fontColor={ COLORS.TERTIARY }
                    fontStyle={ defaults.clearButtonLabel }
                    onPress={() => {
                        this.setState({ text: '' })
                        this.onChangeText( '' )
                    }}>
                </Button>
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
        top: .5 * (HEIGHT - FONT_SIZES.MEDIUM),
        right: .4 * (HEIGHT - FONT_SIZES.MEDIUM),
        width : FONT_SIZES.MEDIUM,
        height: FONT_SIZES.MEDIUM,
        borderRadius: .5 * FONT_SIZES.MEDIUM,
    },
    clearButtonLabel: {
        fontFamily: 'Open Sans',
        fontWeight: 'bold',
        fontSize: FONT_SIZES.SMALL * 1.2,
        letterSpacing: 1,
        paddingLeft: Platform.select({
            ios: .0225 * HEIGHT,
            android: 0
        })
    }
})