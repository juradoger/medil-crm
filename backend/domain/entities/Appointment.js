import { APPOINTMENT_STATUS } from '../../core/constants.js';

export class Appointment {
  constructor(data) { Object.assign(this, data); }

  isScheduled()    { return this.status === APPOINTMENT_STATUS.SCHEDULED; }
  canBeAttended()  { return this.status === APPOINTMENT_STATUS.SCHEDULED; }
  canBeCancelled() { return this.status === APPOINTMENT_STATUS.SCHEDULED; }
}
