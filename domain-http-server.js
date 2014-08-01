var domain = require('domain');
module.exports = dhs;

function dhs (req, res, opt, next) {
  if (typeof opt === 'function')
    next = opt, opt = {};

  if (!opt)
    opt = {};

  var d = domain.create();
  d.add(req);
  d.add(res);

  d.on('error', function (e) {
    if (opt.exit !== false)
      d.exit();

    if (opt.close)
      res.socket.server.close();

    if (typeof res.error === 'function')
      res.error(e);

    if (opt.callback)
      opt.callback(e, req, res);

    if (!res.error && !opt.callback)
      throw e;
  });

  if (opt.enter !== false) {
    d.enter();
    // have to exit on nextTick if no error, or it'll stack up forver.
    process.nextTick(function() {
      d.exit();
    });
  }

  if (next)
    next();

  return d;
}

dhs.defaults = function (opt) {
  return function (req, res, next) {
    return dhs(req, res, opt, next)
  };
};
