export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone: string) => {
  return /^\d{10,15}$/.test(phone);
};

export const isValidUserId = (userId: string) => {
  return userId.length >= 3 && userId.length <= 20;
};

export const isAtLeast13 = (birthDate: string) => {
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return false;
  const now = new Date();
  const age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  const isBirthdayPassed = m > 0 || (m === 0 && now.getDate() >= birth.getDate());
  const actualAge = isBirthdayPassed ? age : age - 1;
  return actualAge >= 13;
};
