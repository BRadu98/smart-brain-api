const redisClient = require('./signin').redisClient;

const handleSignout = (req, res) => {
  const { authorization } = req.headers;

  return redisClient.del(authorization, function(err, response) {
    if (response == 1) {
       return res.status(202).json("Token Deleted Successfully!")
    } else{
     return res.status(204).json("Token was not found, no need to delete it")
    }
 })
  
}

module.exports = {
  handleSignout: handleSignout
}