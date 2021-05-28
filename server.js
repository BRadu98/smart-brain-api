const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const morgan = require('morgan');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');
const auth = require('./controllers/authorization');
const signout = require('./controllers/signout');

//console.log(process.env.POSTGRES_USER)
const db = knex({
  client: 'pg',
  connection: process.env.POSTGRES_URI
});

const app = express();
console.log('checking')
app.use(morgan('combined'))
app.use(cors())
// app.use(bodyParser.json()); //depreciated
app.use(express.json());
app.use(express.urlencoded({extended: true})); 

//Makes more sense if each route handles only 1 thing
app.get('/', (req, res)=> { res.send(db.users) })
//dependency injection 
app.post('/signin', signin.signinAuthentication(db, bcrypt))
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })
app.get('/profile/:id', auth.requireAuth, (req, res) => { profile.handleProfileGet(req, res, db)})
app.post('/profile/:id&:pet&:age', auth.requireAuth, (req, res) => {profile.handleProfileUpdate(req, res, db)})
app.put('/image', auth.requireAuth, (req, res) => { image.handleImage(req, res, db)})
app.post('/imageurl', auth.requireAuth, (req, res) => { image.handleApiCall(req, res)})
app.delete('/signout', auth.requireAuth, (req, res) => { signout.handleSignout(req, res)})

app.listen(3000, ()=> {
  console.log('app is running on port 3000');
})
