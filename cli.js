#!/usr/bin/env node

var SPMServer = require('./');

var s = SPMServer(process.cwd())
  .spm({
    paths: [
      ['/group/project/9.9.9', '']
    ]
  })
  .combo()
  .directory()
  .static()
  .listen(8000)
  .livereload();
