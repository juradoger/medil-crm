export const PatientFactory = {
  create(data) {
    return {
      ...data,
      status:    data.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
  update(data) {
    return { ...data, updatedAt: new Date().toISOString() };
  },
};
