const jwt = require('jsonwebtoken');
const redis = require('redis');

//setup Redis:
const redisClient = redis.createClient(process.env.REDIS_URI);

//const handleSignin = (db, bcrypt) => (req, res) => {
//Helper function  
const handleSignin = (db, bcrypt, req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    //return res.status(400).json('incorrect form submission');
    return Promise.reject('incorrect form submission');
  }

  //always make sure to RETURN promises
  return db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users')
          .where('email', '=', email)
          .then(user => 
            //{res.json(user[0])}
            user[0])
          .catch(err => 
            //res.status(400).json('unable to get user')
            Promise.reject('unable to get user'))
      } else {
        //res.status(400).json('wrong credentials')
        Promise.reject('wrong credentials')
      }
    })
    .catch(err => 
      //res.status(400).json('wrong credentials')
      Promise.reject('wrong credentials')
      )
}


const getAuthTokenId = (req, res) => {
  const { authorization } = req.headers;
  return redisClient.get(authorization, (err, reply) => {
    if (err || !reply) {
      return res.status(400).json('Unauthorized - signin');
    }
    return res.json({id: reply})
  })
}

const signToken = (email) => {
  //using redis and sessions is easy to revoke tokens when users signout
  const jwtPayload = { email } //maybe use id in dev,these tokens can be decoded

  //node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
  return jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '2 days'});
}

const setToken = (key, value) => { //(token, id)
  return Promise.resolve(redisClient.set(key, value,'EX', 60 * 60 * 24 * 2))
}


const createSessions = (user) => {
  //JWT token, return user data
  const { email, id } = user;
  const token = signToken(email);
  return setToken(token, id)
    .then(() => { 
      return { success: 'true', userId: id, token }
    })
    .catch(console.log)
}

//Main handler - only this should return a response
const signinAuthentication = (db, bcrypt) => (req, res) => {
  const { authorization } = req.headers;
  return authorization ?
    getAuthTokenId(req, res) :
    handleSignin(db, bcrypt, req, res)
      .then(data => {
        //Check that the db returns something useful (the user)
        return data.id && data.email ? createSessions(data) : Promise.reject(data) //should not reject(data) in dev,use strings
      }) 
        .then(session => res.json(session))
        .catch(err => res.status(400).json(err))
}

module.exports = {
  signinAuthentication: signinAuthentication,
  redisClient: redisClient
}