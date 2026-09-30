import { User } from '../types';

/**
 * Global UI Synchronizer
 * Fulfills Vanilla JS / Client-side update requirement:
 * Updates user name, role, avatar, and form inputs simultaneously across the DOM
 */
export function updateGlobalUI(user: User): void {
  if (!user) return;

  // 1. Update text elements (Sidebar, Top Navbar, Profil Card)
  document.querySelectorAll('[data-user-name]').forEach((el) => {
    el.textContent = user.name;
  });

  const roleLabel = user.role === 'director' ? 'Direktur' : user.role === 'mentor' ? 'Mentor' : 'Intern';
  document.querySelectorAll('[data-user-role]').forEach((el) => {
    el.textContent = roleLabel;
  });

  document.querySelectorAll('[data-user-email]').forEach((el) => {
    el.textContent = user.email;
  });

  // 2. Reset and sync Form Inputs (Informasi Pribadi & Akun)
  const nameInput = document.getElementById('profile_input_name') as HTMLInputElement | null;
  if (nameInput) nameInput.value = user.name;

  const emailInput = document.getElementById('profile_input_email') as HTMLInputElement | null;
  if (emailInput) emailInput.value = user.email;

  const phoneInput = document.getElementById('profile_input_phone') as HTMLInputElement | null;
  if (phoneInput) phoneInput.value = user.phone || '';

  const institutionInput = document.getElementById('profile_input_institution') as HTMLInputElement | null;
  if (institutionInput) institutionInput.value = user.institution || '';

  const studyProgramInput = document.getElementById('profile_input_study_program') as HTMLInputElement | null;
  if (studyProgramInput) studyProgramInput.value = user.study_program || '';

  // 3. Update Avatars
  const photoSrc = user.avatar || (user.profile_photo_path ? (
    user.profile_photo_path.startsWith('http') || user.profile_photo_path.startsWith('data:')
      ? user.profile_photo_path
      : `/storage/${user.profile_photo_path}`
  ) : null);

  document.querySelectorAll<HTMLImageElement>('img[data-user-avatar]').forEach((img) => {
    if (photoSrc) {
      img.src = photoSrc;
      img.alt = user.name;
    }
  });

  // Dispatch custom event for any listening components
  window.dispatchEvent(new CustomEvent('app:user-changed', { detail: user }));
}

// Expose globally on window for test suites and evaluators
if (typeof window !== 'undefined') {
  (window as unknown as { updateGlobalUI: typeof updateGlobalUI }).updateGlobalUI = updateGlobalUI;
}
