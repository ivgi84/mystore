module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if(!authHeader){
    const error = new Error('not authanticated');
    error.statusCode = 401
    throw error;
  }

  try{
    const token = authHeader.split(' ')[1];
  }
  catch(err){
    throw err;
  }
}