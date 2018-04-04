const { expect } = require('chai');
const avatar = require('../../lib/avatar');

describe('Avatar test', () => {
  it('returns the correct gravatar string', (done) => {
    const testCases = [
      {
        email: 'Bailey_Armstrong@gmail.com',
        expected:
          'https://s.gravatar.com/avatar/96ce4cfe1daf205c7c05d214682ed0f8?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2FBa.png'
      },
      {
        email: 'Gisselle.Runte59@hotmail.com',
        expected:
          'https://s.gravatar.com/avatar/7a08a69a05d5887b901d943a99a08f14?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2FGi.png'
      },
      {
        email: 'Caroline22@hotmail.com',
        expected:
          'https://s.gravatar.com/avatar/0e49f0ba9f5a8ae29159cce94f77932a?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2FCa.png'
      },
      {
        email: 'Louie61@yahoo.com',
        expected:
          'https://s.gravatar.com/avatar/acf6f2289443e84d442105c1d16925c8?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2FLo.png'
      },
      {
        email: 'Kellen.Huel19@yahoo.com',
        expected:
          'https://s.gravatar.com/avatar/e5bd5bb7793086663f1c903a3db03263?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2FKe.png'
      }
    ];

    testCases.forEach((user, i) => {
      expect(avatar(user.email)).to.equal(user.expected);

      if (i + 1 === testCases.length) done();
    });
  });
});
