export const AppointmentFactory = {
  create(data) {
    return {
      ...data,
      status:    'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
};
