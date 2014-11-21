define('normal/0.1.0/index', function(require, exports, module){
var type = require("type/1.0.0/index.js");
var relative = require('./relative');
console.log('type: %s', type(function(){}) === 'dist');
console.log('relative: %s', relative === 'relative');

});
