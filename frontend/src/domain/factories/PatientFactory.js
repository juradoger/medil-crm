import { PATIENT_STATUS } from '../../core/constants';

export const PatientFactory = {
  create(data) {
    return {
      name:      data.name,
      ci:        data.ci        ?? null,
      phone:     data.phone     ?? null,
      email:     data.email     ?? null,
      status:    data.status    || PATIENT_STATUS.ACTIVE,
      branchId:  data.branchId  ?? null,
      userId:    data.userId    ?? null,
      createdAt: new Date().toISOString(),
    };
  },
  update(data) {
    return {
      name:     data.name,
      ci:       data.ci,
      phone:    data.phone,
      email:    data.email,
      status:   data.status,
      branchId: data.branchId,
      userId:   data.userId,
    };
  },
};
