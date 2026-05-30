import { APPOINTMENT_STATUS } from '../../core/constants';

export const AppointmentFactory = {
  create(data) {
    return {
      ...data,
      status: APPOINTMENT_STATUS.SCHEDULED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
};
