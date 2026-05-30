export class Payment {
  constructor(data) { Object.assign(this, data); }

  isApproved() { return this.status === 'approved'; }
}
