export class Patient {
  constructor({ id, fullName, documentId, phone, email,
                birthDate, status, branchId, userId, createdAt }) {
    this.id         = id;
    this.fullName   = fullName;
    this.documentId = documentId;
    this.phone      = phone;
    this.email      = email;
    this.birthDate  = birthDate;
    this.status     = status;
    this.branchId   = branchId;
    this.userId     = userId || null;
    this.createdAt  = createdAt;
  }

  isActive() { return this.status === 'active'; }
}
