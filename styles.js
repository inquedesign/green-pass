import { StyleSheet,
         Dimensions } from 'react-native'

export const SCREEN_HEIGHT = Dimensions.get('window').height
export const SCREEN_WIDTH  = Dimensions.get('window').width

export const VH = SCREEN_HEIGHT / 500
export const VW = SCREEN_WIDTH  / 500

export const COMPONENT_HEIGHT = 36 * VH
export const BORDER_RADIUS = .25 * COMPONENT_HEIGHT

export const FONT_SIZES = {
    SMALL : Math.min( 8  * VH, 14.2 * VW ),
    MEDIUM: Math.min( 14 * VH, 24.9 * VW ),
    LARGE : Math.min( 20 * VH, 35.6 * VW )
}

export const COLORS = {
    PRIMARY   : '#FF7F50',
    SECONDARY : '#607C53',
    TERTIARY  : '#FFFFFF',
    BOTTOMBAR : '#91AB84',
    HIGHLIGHT : 'rgba( 65, 255, 0, .1 )',
    INACTIVE  : '#CEEAC1',
    ERROR     : '#AA0000',
    BACKGROUND: 'rgba( 255, 255, 255, .6 )'
}

export const STYLES = StyleSheet.create({
    header: {
        fontFamily: 'HWTArtz',
        letterSpacing: 1.5,
        lineHeight: FONT_SIZES.LARGE * .95,
        color: COLORS.PRIMARY,
        fontSize: FONT_SIZES.LARGE,
        marginBottom: 15 * VH
    },
    avatar: {
        width: .225 * SCREEN_HEIGHT,
        maxWidth: .4 * SCREEN_WIDTH,
        height: .225 * SCREEN_HEIGHT,
        maxHeight: .4 * SCREEN_WIDTH,
        borderWidth: 1,
        borderColor: COLORS.SECONDARY
    },
    spaceAfter: {
        marginBottom: 15 * VH
    }
});
