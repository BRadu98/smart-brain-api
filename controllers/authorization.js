const redisClient = require('./signin').redisClient; //dont run() this here

//A middleware lets things pass through and might modify something, 
const requireAuth = (req, res, next) => { //return next to continue
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json('Unauthorized');
  }
  return redisClient.get(authorization, (err, reply) => {
    if (err || !reply) {
      return res.status(401).json('Unauthorized');
    }
    console.log('you shall pass')
    return next() //continue exec only if all is good
  })
}

module.exports = {
  requireAuth: requireAuth
}