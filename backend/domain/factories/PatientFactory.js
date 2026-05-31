import { PATIENT_STATUS } from '../../core/constants.js';

export const PatientFactory = {
  create(data) {
    return {
      ...data,
      status:    data.status || PATIENT_STATUS.ACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
  update(data) {
    return { ...data, updatedAt: new Date().toISOString() };
  },
};
