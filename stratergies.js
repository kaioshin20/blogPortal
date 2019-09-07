const passport=require('passport')
const LocalStratergy=require('passport-local')
const FacebookStratergy=require('passport-facebook')
const GoogleStrategy=require('passport-google-oauth20')
const { connectdb }=require('./db')

passport.use(new LocalStratergy({
    usernameField: 'email'
},(username, password, done) => {
    connectdb('blogportal')
        .then(db => db.collection('users').find({ email: username }))
        .then(user => user.toArray())
        .then((user) => {
            if(!user) {
                return done(new Error('username invalid'))
            }
            if(user[0].password != password) {
                return done(null, false)
            }
            done(null, user)
        })
        .catch(done)
}
)
);

passport.use( new FacebookStratergy({
    clientID: 'fbID',
    clientSecret: 'fbSecret',
    callbackURL: 'http://localhost:3000/signin/facebook/callback',
    profileFields: ['emails', 'displayName', 'picture.type(large)']
},
(accessToken, refreshToken, profile, done) => {
    connectdb('blogportal')
        .then(db => db.collection('users').find({ email: profile.emails[0].value }))
        .then(user => user.toArray())
        .then((user) => {
            if(user.length == 0) {
                let fbuser = {
                    dp: profile.photos[0].value,
                    email: profile.emails[0].value,
                    username: profile.displayName,
                    fbAccessToken: accessToken
                }
                connectdb('blogportal')
                    .then(db => db.collection('users').insertOne(fbuser))
                    .then(fbuser => fbuser.toArray())
                    .then(fbuser => {
                        console.log(fbuser)
                        done(null, fbuser)
                    })
                    .catch(done)
            }
            done(null, user)
        })
        .catch(done)
}))

passport.use(new GoogleStrategy({
    clientID: 'googleID',
    clientSecret: 'googleSecret',
    callbackURL: "http://localhost:3000/signin/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    connectdb('blogportal')
        .then(db => db.collection('users').find({ email: profile.emails[0].value }))
        .then(user => user.toArray())
        .then((user) => {
            if(user.length == 0) {
                let guser = {
                    dp: profile.photos[0].value,
                    email: profile.emails[0].value,
                    username: profile.displayName,
                    gAccessToken: accessToken
                }
                connectdb('blogportal')
                    .then(db => db.collection('users').insertOne(guser))
                    .then(guser => guser.toArray())
                    .then(guser => {
                        console.log(guser)
                        return done(null, guser)
                    })
                    .catch(done)
            }
            done(null, user)
        })
        .catch(done)
  }
));

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
  })
  
  module.exports = passport