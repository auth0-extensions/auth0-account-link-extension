/* global describe, beforeEach, it */
import {expect} from 'chai';
import generateRule from '../../generateRule';

describe('Generating Rules', function() {
  const args = {
    username: 'foobarbaz',
    extensionURL: 'http://someurl.com'
  };

  let fnTpl;

  beforeEach(function() {
    fnTpl = generateRule(args);

    return fnTpl;
  });

  it('generates a string representation of a function', function() {
    return fnTpl.then((template) => {
      expect(template).to.match(/^function \(user, context, callback\)/);
      expect(template).to.not.match(/\@\@/);
    });
  });

  it('contains replaced variables', function() {
    return fnTpl.then((template) => {
      expect(template).to.match(/foobarbaz/);
      expect(template).to.match(/someurl\.com/);
    });
  });
});
