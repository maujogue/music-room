import { sum, sub, multiplication } from '../basic';

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

test('sub 3 - 2 to equal 1', () => {
  expect(sub(3, 2)).toBe(1);
});

test('multiply 3 * 3 to equal 9', () => {
  expect(multiplication(3, 3)).toBe(9);
});
