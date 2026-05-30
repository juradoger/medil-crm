import { SortByDateStrategy, SortByNameStrategy } from './sortStrategies';

const DATA = [
  { date: '2026-03-15', fullName: 'Carlos Méndez' },
  { date: '2026-01-10', fullName: 'Ana García' },
  { date: '2026-06-20', fullName: 'Beatriz López' },
];

describe('SortByDateStrategy', () => {
  it('ordena ascendente correctamente', () => {
    const sorted = new SortByDateStrategy('asc').sort(DATA);
    expect(sorted[0].date).toBe('2026-01-10');
    expect(sorted[2].date).toBe('2026-06-20');
  });

  it('ordena descendente correctamente', () => {
    const sorted = new SortByDateStrategy('desc').sort(DATA);
    expect(sorted[0].date).toBe('2026-06-20');
    expect(sorted[2].date).toBe('2026-01-10');
  });
});

describe('SortByNameStrategy', () => {
  it('ordena alfabéticamente ascendente', () => {
    const sorted = new SortByNameStrategy('asc').sort(DATA);
    expect(sorted[0].fullName).toBe('Ana García');
    expect(sorted[2].fullName).toBe('Carlos Méndez');
  });
});
