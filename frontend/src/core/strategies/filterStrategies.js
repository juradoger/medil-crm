// Estrategias de filtrado de datos
export class FilterByStatusStrategy {
  constructor(status) { this.status = status; }

  filter(data) {
    if (!this.status) return data;
    return data.filter(item => item.status === this.status);
  }
}

export class FilterByDateRangeStrategy {
  constructor(from, to) { this.from = from; this.to = to; }

  filter(data) {
    return data.filter(item => {
      const date = new Date(item.date);
      return date >= new Date(this.from) && date <= new Date(this.to);
    });
  }
}

export class FilterByBranchStrategy {
  constructor(branchId) { this.branchId = branchId; }

  filter(data) {
    return data.filter(item => item.branchId === this.branchId);
  }
}
