var net = require('net');

exports.isPortInUse = function(port, error, success) {
  var conn = net.createServer();
  conn.unref();
  conn.on('error', error.bind(null, port));
  conn.listen(port, function() {
    conn.close(success.bind(null, null, conn.address().port));
  });
};
