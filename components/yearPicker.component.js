import React from 'react';

import { StyleSheet,
         View,
         Modal,
         FlatList,
         TouchableHighlight } from 'react-native';
import { Text       } from './text.component'
import { Button     } from './button.component'
import { COLORS,
         FONT_SIZES } from '../styles'

export class YearPicker extends React.PureComponent {
    constructor( props ) {
        super( props )
        this.currentYear = new Date().getFullYear()
        this.yearRange   = new Array(83)
        this.state       = {
            yearText : 'Select year',
            modal: false,
            textColor: COLORS.DISABLED
        }
    }

    keyExtractor(item, index) {
        return this.getYearFrom( index )
    }

    getYearFrom( index ) {
        return (this.currentYear - 18 - index ).toString()
    }

    selectYear( year ) {
        this.setState({ yearText: year, modal: false, textColor: COLORS.PRIMARY })
        if ( this.props.onValueChange ) this.props.onValueChange( parseInt( year ) )
    }

    renderYear({ index }) {
        return (
            <YearPickerItem
                value={ this.getYearFrom( index ) }
                onPress={ this.selectYear.bind(this) }/>
        )
    }

    render() {
        return (
            <View style={[ defaults.picker, this.props.style ]}>
                <Button
                    accessibilityLabel='Select year of birth'
                    label={ this.state.yearText }
                    color={ this.state.textColor }
                    onPress={() => { this.setState({ modal: true }) }}/>

                <Modal
                    visible={ this.state.modal }
                    supportedOrientations={[ 'portrait' ]}
                    onRequestClose={()=>{}}
                    transparent={ false }
                    animationType='fade'
                    presentationStyle='formSheet'>

                    <FlatList
                        data={ this.yearRange }
                        keyExtractor={ this.keyExtractor.bind(this) }
                        renderItem={ this.renderYear.bind(this) }/>
                </Modal>
            </View>
        )
    }
}

class YearPickerItem extends React.PureComponent {
    constructor( props ) {
        super( props )
        this.state = {
            color: COLORS.PRIMARY
        }
    }

    onPress() {
        if ( this.props.onPress ) this.props.onPress( this.props.value )
    }

    render() {
        return (
            <TouchableHighlight style={ defaults.listItem }
                underlayColor={ COLORS.PRIMARY }
                onPress={ () => this.onPress() }
                onShowUnderlay={() => { this.setState({ color: COLORS.BACKGROUND }) }}
                onHideUnderlay={() => { this.setState({ color: COLORS.PRIMARY }) }}>

                <Text style={{ fontSize: FONT_SIZES.LARGE, color: this.state.color }}>
                    { this.props.value }
                </Text>
            </TouchableHighlight>
        )
    }
}

const defaults = StyleSheet.create({
    picker: {
        width          : '100%',
    },
    listItem: {
        backgroundColor: COLORS.BACKGROUND
    }
})