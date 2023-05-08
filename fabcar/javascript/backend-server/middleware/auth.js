const jwt = require('jsonwebtoken')
const JWT_SECRET = 'secret' 


const authenticationMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('No token provided')
  }

  const token = authHeader.split(' ')[1]

  if(!token || token===''){
    return res.status(401).send('Token is missing')
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const {username , role} = decoded
    req.user = {username ,role}  //stores username and role in req.user to pass information
    next()
  } catch (error) {
    return res.status(403).send('Unauthorized request: Wrong or expired token found');
  }
}

module.exports = authenticationMiddleware