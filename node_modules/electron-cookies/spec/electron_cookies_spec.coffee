{expect} = require 'chai'
global.document = {}
global.localStorage = {}
require('../src/index.coffee')

describe 'document.cookies', ->
  it 'should work like a browser', ->
    expect(document.cookie).to.eql('')
    document.cookie = 'blah'
    expect(document.cookie).to.eql('blah')
    document.cookie = 'key=value'
    expect(document.cookie).to.eql('blah; key=value')
    document.cookie = 'key2=value2'
    expect(document.cookie).to.eql('blah; key=value; key2=value2')
describe 'document.clearCookies', ->
  it 'should clear cookies', ->
    expect(document.clearCookies()).to.eql(true)
    document.cookie = 'key2=value2'
    expect(document.clearCookies()).to.eql(true)
