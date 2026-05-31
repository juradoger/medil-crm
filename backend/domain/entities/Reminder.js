import { REMINDER_STATUS } from '../../core/constants.js';

export class Reminder {
  constructor(data) { Object.assign(this, data); }

  isPending() { return this.status === REMINDER_STATUS.PENDING; }
}
