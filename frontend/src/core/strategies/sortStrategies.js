// Estrategias de ordenamiento de datos
export class SortByDateStrategy {
  constructor(order = 'asc') { this.order = order; }

  sort(data) {
    return [...data].sort((a, b) => {
      const diff = new Date(a.date) - new Date(b.date);
      return this.order === 'asc' ? diff : -diff;
    });
  }
}

export class SortByNameStrategy {
  constructor(order = 'asc') { this.order = order; }

  sort(data) {
    return [...data].sort((a, b) => {
      const diff = (a.fullName ?? '').localeCompare(b.fullName ?? '');
      return this.order === 'asc' ? diff : -diff;
    });
  }
}
