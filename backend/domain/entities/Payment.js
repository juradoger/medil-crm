import { PAYMENT_STATUS } from '../../core/constants.js';

export class Payment {
  constructor(data) { Object.assign(this, data); }

  isApproved() { return this.status === PAYMENT_STATUS.APPROVED; }
}
