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

  test('empty string', () => {
    localStorage[''] = 'empty string';
    expect(localStorage['']).toEqual('empty string');
    expect(localStorage.getItem('')).toEqual('empty string');
  });

  test('dot', () => {
    localStorage.b = 1;
    expect(localStorage['b']).toEqual(1);
    expect(localStorage.getItem('b')).toEqual(1);
  });
});
