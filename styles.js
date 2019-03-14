import { StyleSheet,
         Dimensions } from 'react-native'

import COLORS from './config/colors'

export const REM = Dimensions.get('window').height/480

export const STYLES = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
    },
    content: {
        height: '100%',
        maxWidth: '100%',
        aspectRatio: 4 / 7,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.BACKGROUND,
    },
});
