var mocha = require('mocha')
var assert = require('assert')
var presetOpts = require('../index')

it('presetOpts', function (done) {
  var result = presetOpts()
  assert.equal(result.parserOpts.noteKeywords, 'BREAKING CHANGE')
  done()
})
