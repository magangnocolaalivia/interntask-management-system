import { User, UserRole } from '../../types';

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  institution?: string;
  study_program?: string;
  division?: string;
  internship_start?: string;
  internship_end?: string;
  mentor_id?: number | null;
}

export interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  institution?: string;
  study_program?: string;
  mentor_id?: string;
  internship_dates?: string;
  general?: string;
}

/**
 * Controller Namespace: App\Http\Controllers\Director\UserController
 * Handles CRUD and validation logic for User Management module
 */
export class UserController {
  /**
   * Validate user input according to Laravel FormRequest validation rules
   */
  public static validate(
    data: UserFormData,
    existingUsers: User[],
    currentUserId?: number
  ): { isValid: boolean; errors: ValidationErrors } {
    const errors: ValidationErrors = {};

    // 1. Name validation
    if (!data.name || data.name.trim().length === 0) {
      errors.name = 'Nama lengkap wajib diisi.';
    } else if (data.name.trim().length < 3) {
      errors.name = 'Nama lengkap minimal 3 karakter.';
    }

    // 2. Email validation (RFC standard & unique constraint)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || data.email.trim().length === 0) {
      errors.email = 'Alamat email wajib diisi.';
    } else if (!emailRegex.test(data.email.trim())) {
      errors.email = 'Format alamat email tidak valid (contoh: user@example.com).';
    } else {
      const isDuplicate = existingUsers.some(
        u => u.email.toLowerCase() === data.email.trim().toLowerCase() && u.id !== currentUserId
      );
      if (isDuplicate) {
        errors.email = 'Alamat email sudah terdaftar dalam sistem (unique constraint failed).';
      }
    }

    // 3. Password validation
    // For new user: password is required, min 8 chars
    // For existing user: optional, but if filled, min 8 chars
    if (!currentUserId) {
      if (!data.password || data.password.length < 8) {
        errors.password = 'Kata sandi wajib diisi minimal 8 karakter.';
      }
    } else if (data.password && data.password.length > 0 && data.password.length < 8) {
      errors.password = 'Kata sandi baru minimal 8 karakter.';
    }

    // 4. Role validation
    if (!data.role || !['intern', 'mentor', 'director'].includes(data.role)) {
      errors.role = 'Role pengguna wajib dipilih (Intern atau Mentor).';
    }

    // 5. Dynamic validation for Intern role
    if (data.role === 'intern') {
      if (!data.institution || data.institution.trim().length === 0) {
        errors.institution = 'Nama institusi/universitas/sekolah wajib diisi untuk peserta magang.';
      }
      if (!data.study_program || data.study_program.trim().length === 0) {
        errors.study_program = 'Program studi/jurusan wajib diisi untuk peserta magang.';
      }
      if (!data.mentor_id) {
        errors.mentor_id = 'Pembimbing (Mentor) wajib dipilih untuk mendampingi peserta magang.';
      } else {
        const mentorExists = existingUsers.some(u => u.id === Number(data.mentor_id) && u.role === 'mentor');
        if (!mentorExists) {
          errors.mentor_id = 'Mentor yang dipilih tidak valid atau tidak aktif.';
        }
      }

      if (data.internship_start && data.internship_end) {
        if (new Date(data.internship_start) > new Date(data.internship_end)) {
          errors.internship_dates = 'Tanggal selesai magang harus setelah tanggal mulai magang.';
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Helper to generate secure random password
   */
  public static generateSecurePassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
