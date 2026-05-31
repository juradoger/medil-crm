// Mensajes centralizados del sistema — textos de UI en español
export const MESSAGES = {
  empty: {
    patients: {
      noData:    'Aún no hay pacientes registrados',
      noResults: 'No encontramos pacientes con ese nombre o CI',
    },
    appointments: {
      noData:    'No hay citas programadas para este día',
      noResults: 'No encontramos citas con ese criterio',
    },
    history: {
      noData: 'Este paciente no tiene consultas registradas',
    },
    reminders: {
      noData:    'No hay recordatorios pendientes',
      noResults: 'No encontramos recordatorios con ese criterio',
    },
    supplies: {
      noData:    'No hay insumos registrados para esta sucursal',
      noResults: 'No encontramos insumos con ese nombre',
    },
    branches: {
      noData: 'No hay sucursales registradas',
    },
    professionals: {
      noData: 'No hay profesionales registrados para esta sucursal',
    },
    agenda: {
      noData: 'No tenés citas programadas para hoy',
    },
    reports: {
      noData: 'No hay información disponible para ese período',
    },
  },
  error: {
    validation: {
      required:        (field) => `${field} es obligatorio`,
      invalidEmail:    'Ingresá un correo electrónico válido',
      duplicateId:     'Ya existe un paciente con ese número de CI',
      futureDate:      'La fecha de la cita debe ser a partir de hoy',
      timeConflict:    'El profesional ya tiene una cita a esa hora',
      inactivePatient: 'Este paciente está inactivo. Activalo antes de agendar una cita',
    },
    connection: {
      server:       'Algo salió mal. Intentá de nuevo en unos segundos',
      notFound:     'No encontramos lo que buscabas',
      noConnection: 'No pudimos conectarnos. Verificá tu conexión',
    },
    auth: {
      invalidCredentials: 'El correo o la contraseña son incorrectos',
      sessionExpired:     'Tu sesión expiró. Volvé a iniciar sesión',
      unauthorized:       'No tenés permisos para acceder a esta sección',
    },
    payment: {
      qrExpired: 'El tiempo para escanear el QR venció. Generá uno nuevo',
      rejected:  'El pago fue rechazado. Verificá tu cuenta',
      timeout:   'No recibimos confirmación del pago. Si ya pagaste, contactá al administrador',
    },
  },
  success: {
    patientCreated:      'Paciente registrado correctamente',
    patientUpdated:      'Datos del paciente actualizados',
    patientDeactivated:  'Paciente desactivado',
    appointmentCreated:  'Cita agendada correctamente',
    appointmentCancelled:'Cita cancelada',
    appointmentAttended: 'Consulta registrada correctamente',
    reminderSent:        'Recordatorio marcado como enviado',
    paymentApproved:     '¡Pago confirmado!',
    stockUpdated:        'Stock actualizado correctamente',
    recordCreated:       'Consulta registrada en el historial',
    branchCreated:       'Sucursal creada correctamente',
    professionalCreated: 'Profesional registrado correctamente',
  },
  confirm: {
    cancelAppointment:  '¿Cancelar esta cita? El recordatorio también se cancelará. Esta acción no se puede deshacer',
    deactivatePatient:  '¿Desactivar este paciente?',
    markReminderSent:   '¿Marcar este recordatorio como enviado?',
    markAttended:       '¿Marcar esta cita como atendida?',
    deactivateBranch:   '¿Desactivar esta sucursal?',
  },
};
