import {
  FilterByStatusStrategy,
  FilterByDateRangeStrategy,
  FilterByBranchStrategy,
} from './filterStrategies';

const DATA = [
  { status: 'active',   branchId: 'b1', date: '2026-03-10' },
  { status: 'inactive', branchId: 'b2', date: '2026-04-15' },
  { status: 'active',   branchId: 'b1', date: '2026-05-20' },
];

describe('FilterByStatusStrategy', () => {
  it('filtra por status correctamente', () => {
    const result = new FilterByStatusStrategy('active').filter(DATA);
    expect(result).toHaveLength(2);
  });

  it('retorna todos cuando status es null', () => {
    const result = new FilterByStatusStrategy(null).filter(DATA);
    expect(result).toHaveLength(3);
  });
});

describe('FilterByDateRangeStrategy', () => {
  it('filtra por rango de fechas correctamente', () => {
    const result = new FilterByDateRangeStrategy('2026-03-01', '2026-04-30').filter(DATA);
    expect(result).toHaveLength(2);
  });
});

describe('FilterByBranchStrategy', () => {
  it('filtra por sucursal correctamente', () => {
    const result = new FilterByBranchStrategy('b1').filter(DATA);
    expect(result).toHaveLength(2);
  });
});
