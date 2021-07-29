import LocalStorage = require('../src/fs-store');

describe('base test', () => {
  const localStorage = new LocalStorage('./scratch', 1000000);

  test('location', () => {
    expect(localStorage.location).toEqual('./scratch');
  });

  test('string type', () => {
    localStorage.setItem('1', 'something');
    expect(localStorage.getItem('1')).toBe('something');
  });

  test('object type', () => {
    const o = { a: 1, b: 'some string', c: { x: 1, y: 2 } };
    localStorage.setItem('2', o);
    expect(localStorage.getItem('2')).toEqual(o);
  });

  test('array type', () => {
    const a = [1, 'some string', { a: 1, b: 'some string', c: { x: 1, y: 2 } }];
    localStorage.setItem('3', a);
    expect(localStorage.getItem('3')).toEqual(a);
  });

  test('key and length', () => {
    expect(localStorage.keys).toEqual(['1', '2', '3']);
    expect(localStorage.length).toBe(3);
  });

  test('removeItem', () => {
    localStorage.removeItem('2');
    expect(localStorage.getItem('2')).toBe(null);
    expect(localStorage.length).toBe(2);
    expect(localStorage.keys).toEqual(['1', '3']);
  });

  test('clear', () => {
    localStorage.clear();
    expect(localStorage.length).toBe(0);
  });
});
