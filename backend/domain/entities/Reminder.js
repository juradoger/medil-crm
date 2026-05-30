export class Reminder {
  constructor(data) { Object.assign(this, data); }

  isPending() { return this.status === 'pending'; }
}
