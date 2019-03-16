import { StyleSheet,
         Dimensions } from 'react-native'

export const SCREEN_HEIGHT = Dimensions.get('window').height

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
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: {
        width: '80%',
        maxWidth: .4 * SCREEN_HEIGHT,
        backgroundColor: COLORS.BACKGROUND,
        alignItems: 'center'
    },
});
