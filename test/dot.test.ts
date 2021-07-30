import LocalStorage = require('../src/fs-store');

describe.only('dot test', () => {
  const localStorage = new LocalStorage('./store', 1000000);

  afterAll(() => {
    localStorage.clear();
  });

  test('string', () => {
    localStorage['a'] = 'something';
    expect(localStorage['a']).toEqual('something');
    expect(localStorage.getItem('a')).toEqual('something');
  });

  test('dot', () => {
    localStorage.b = 1;
    expect(localStorage['b']).toEqual(1);
    expect(localStorage.getItem('b')).toEqual(1);
  });
});
