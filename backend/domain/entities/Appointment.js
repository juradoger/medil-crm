export class Appointment {
  constructor(data) { Object.assign(this, data); }

  isScheduled()    { return this.status === 'scheduled'; }
  canBeAttended()  { return this.status === 'scheduled'; }
  canBeCancelled() { return this.status === 'scheduled'; }
}
