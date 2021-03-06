import { getWrongAnswers } from '../js/questions';

it('should work', () => {
  expect(1).toBe(1);
});

describe('getWrongAnswers', () => {
  it('should get correct number of answers', () => {
    expect(getWrongAnswers({ table: 2, by: 2 }).length).toBe(3);
  });

  it('should not get negative values', () => {
    const wrongAnswers = getWrongAnswers({ table: 2, by: 2 });
    wrongAnswers.forEach((a) => {
      expect(+a.value).toBeGreaterThan(0);
    });
  });

  it('should get unique values', () => {
    const wrongAnswers = getWrongAnswers({ table: 7, by: 4 });

    wrongAnswers.forEach((answer) => {
      const duplicatedAnswer = wrongAnswers.find(
        (a) => a.value === answer.value
      );
      expect(duplicatedAnswer).toBeUndefined;
    });
  });
});
