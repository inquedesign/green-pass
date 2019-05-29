export function validatePassword( pass1, pass2 ) {
    return new Promise(( resolve, reject ) => {
        if ( pass1 !== pass2 ) reject( 'Passwords do not match' )
        if ( pass1.length < 6 ) reject( 'Password must be longer than 5 characters' )
        resolve()
    })
}