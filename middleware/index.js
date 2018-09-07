function loggedOut(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/map');
  }
  return next();
}
function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
      return res.redirect('/home');
  }
}


module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;
