# Security Specification for NexPsi - Psychologist Portal

This document outlines the security architecture, invariants, and threat vectors ("Dirty Dozen" payloads) we protect against in the firestore database.

## 1. Data Invariants

1. **Psychologist Isolation**: A psychologist (`userId` matching `request.auth.uid`) can only view or edit their own profile, their patients, their scheduled appointments, and their patients' medical records. No cross-tenant reads or writes are allowed.
2. **Medical Record Locking**: Once a digital clinical note (`MedicalRecord`) has been finalized and signed (`isLocked == true`), it is completely **immutable**. No further edits (updates or deletes) are allowed, enforcing ethical and legal paperless records invariants.
3. **No Self-Elevated Claims**: Users cannot register themselves with unvalidated admin status or modify privileged state.
4. **Temporal Integrity**: Key temporal logs (`createdAt`, `updatedAt`, `lockedAt`) must match the actual request server timestamp (`request.time`).
5. **ID Poisoning Guard**: Document IDs must conform to a strict alphanumeric pattern (`isValidId`) and sizes are strictly constrained.

---

## 2. The Dirty Dozen Payloads

These are the 12 malicious or invalid payloads designed to compromise the system, all of which should be rejected by the rules with `PERMISSION_DENIED`:

### P1: Identity Spoofing - Creating Patient for Another Psychologist
An attacker attempts to insert a Patient record but sets `psychologistId` to a victim's UID.
```json
{
  "psychologistId": "victim_psy_123",
  "name": "Jane Watson",
  "status": "active",
  "createdAt": "2026-06-10T22:08:00Z"
}
```

### P2: Rogue Profile Creation - Overwriting Another Psychologist's Profile
An attacker attempts to create a Psychologist profile targeting a document ID that is not their own `uid`.
```json
// Target doc path: /psychologists/victim_psy_123
{
  "userId": "victim_psy_123",
  "name": "Intruder Hacker",
  "email": "hacker@evil.com",
  "crp": "12/34567",
  "createdAt": "2026-06-10T22:08:00Z"
}
```

### P3: Verification bypass - Read All Records Without Being Logged In
An unauthenticated request attempts to list all Patient records.
```
query: SELECT * from /patients
auth: null
```

### P4: Ghost Fields - Injecting Privileged Fields via Shadow Update
An attacker attempts to inject a sneaky boolean field (`isAdmin: true` or `isPremium: true`) into their psychologist document.
```json
// update:
{
  "name": "Jane Taylor",
  "crp": "06/12345",
  "isAdmin": true
}
```

### P5: Terminal Lockout Bypass - Modifying a Locked Medical Record
An attacker attempts to edit the medical commentary on a note that was already locked.
```json
// Existing document state: { "isLocked": true, "sessionSummary": "Sensitive session notes" }
// Incoming update:
{
  "sessionSummary": "Overwritten altered session notes",
  "isLocked": true
}
```

### P6: ID Poisoning - Massive Junk Document ID
An attacker attempts to target a document with an ID containing special escape characters and huge sizing (e.g., 2000 bytes) to trigger indexing bloating and service depletion.
```
docPath: /patients/AAAA...[2000 chars]...%%%%!!!$$$$
```

### P7: Value Poisoning - Injecting Massive String Fields in Sizing Check
An attacker attempts to submit an appointment note containing 5 megabytes of string content.
```json
{
  "patientId": "pt_789",
  "patientName": "Arthur Dent",
  "date": "2026-06-15",
  "time": "14:00",
  "type": "online",
  "status": "scheduled",
  "notes": "[5 Megabytes of garbage text]",
  "createdAt": "2026-06-10T22:08:00Z",
  "updatedAt": "2026-06-10T22:08:00Z"
}
```

### P8: Temporal Spoofing - Setting Custom Past Timestamp
An attacker sets `createdAt` to five years in the past to alter audit trails.
```json
{
  "psychologistId": "attacker_123",
  "name": "Retroactive Record",
  "status": "active",
  "createdAt": "2021-01-01T00:00:00Z"
}
```

### P9: Status Skipping - Setting Illegal Intermediate Statuses
An attacker attempts to set an Appointment status to "non_existent_status_type".
```json
{
  "status": "invalid_status_xyz"
}
```

### P10: Cross-Psychologist Information Extraction (Get Attack)
An authenticated psychologist attempts to look up a highly sensitive `MedicalRecord` document belonging to another psychologist.
```
docPath: /medical_records/victim_record_999
auth.uid: hacker_psy_123
```

### P11: Orphaned Collection Insert - Referencing Non-Existent Patient ID
An attacker attempts to create an Appointment with a randomized, non-existent patient ID to break referential integrity.
```json
{
  "patientId": "non_existent_fake_id_999",
  "patientName": "A Ghost"
}
```

### P12: Self-Modification of Owner ID on Update
An attacker attempts to change the ownership field `psychologistId` of a Patient document in an update so that it belongs to another user.
```json
{
  "psychologistId": "another_hacker_uid",
  "name": "Jane Watson"
}
```

---

## 3. Threat Matrix Verification Checklist

| Pillar / Threat Vector | Protected? | Rule Assertion Method |
| :--- | :--- | :--- |
| **P1: Psychologist Isolation** | Yes | `resource.data.psychologistId == request.auth.uid` + `incoming().psychologistId == request.auth.uid` |
| **P2: Profile Integrity** | Yes | `psychologistId == request.auth.uid` check on psychologist profile reads/writes |
| **P3: Blanket Reads Blocked** | Yes | List queries evaluated directly against `resource.data.psychologistId == request.auth.uid` |
| **P4: Locked Patient Notes** | Yes | `existing().isLocked != true` gate in `allow update, delete` of medical records |
| **P5: Input Size Guarding** | Yes | All string definitions have explicit `.size() <= MAX` boundaries |
| **P6: Server Timestamps** | Yes | Verification against `request.time` for temporal indexes |
| **P7: Shadow field protection** | Yes | `affectedKeys().hasOnly()` applied to all state updates |
