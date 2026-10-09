import { paginate } from './pagination';

describe('paginate', () => {
  const items = [1, 2, 3, 4, 5, 6, 7];

  it('returns the requested page with totals', () => {
    expect(paginate(items, 2, 5)).toEqual({ items: [6, 7], page: 2, totalPages: 2, total: 7 });
  });

  it('clamps a page that no longer exists after deletes', () => {
    expect(paginate([1, 2, 3, 4, 5], 2, 5)).toEqual({
      items: [1, 2, 3, 4, 5],
      page: 1,
      totalPages: 1,
      total: 5,
    });
  });

  it('clamps pages below 1 and handles an empty list', () => {
    expect(paginate(items, 0, 5).page).toBe(1);
    expect(paginate([], 3, 5)).toEqual({ items: [], page: 1, totalPages: 1, total: 0 });
  });
});
