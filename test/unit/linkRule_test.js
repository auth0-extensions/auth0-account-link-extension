/* global describe, beforeEach, it */
const {expect} = require('chai');
const generateTemplate = require('../../rules/link');

describe('Generating Link Rule', function() {
  const args = {
    username: 'foobarbaz'
  };

  let template;

  beforeEach(function() {
    template = generateTemplate(args);
  });

  it('generates a string representation of a function', function() {
    expect(template).to.match(/^function \(user, context, callback\)/);
    expect(template).to.not.match(/\@\@/);
  });

  it('contains replaced variables', function() {
    expect(template).to.match(/foobarbaz/);
  });
});
