import { StyleSheet,
         Dimensions } from 'react-native'

export const SCREEN_HEIGHT = Dimensions.get('window').height
export const SCREEN_WIDTH  = Dimensions.get('window').width

export const REM = SCREEN_HEIGHT / 480

export const COMPONENT_HEIGHT = 32 * REM

export const FONT_SIZES = {
    SMALL : 6  * REM,
    MEDIUM: 12 * REM,
    LARGE : 18 * REM
}

export const COLORS = {
    PRIMARY   : "#669900",
    DISABLED  : "#AAAAAA",
    ERROR     : "#AA0000",
    BACKGROUND: "#FFFFFF"
}

export const STYLES = StyleSheet.create({
    container: {
        flex: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.BACKGROUND
    },
    content: {
        width: '80%',
        maxWidth: .4 * SCREEN_HEIGHT,
        backgroundColor: COLORS.BACKGROUND,
        alignItems: 'center'
    },
    header: {
        fontSize: FONT_SIZES.LARGE,
        marginBottom: 18 * REM
    },
    spaceAfter: {
        marginBottom: 12 * REM
    }
});
