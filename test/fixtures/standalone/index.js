var type = require('type');
var relative = require('./relative');
console.log('type: %s', type(function(){}) === 'dist');
console.log('relative: %s', relative === 'relative');
