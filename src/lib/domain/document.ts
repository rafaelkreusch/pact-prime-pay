const NON_DIGIT_REGEX = /\D/g;

export function normalizeDocument(value: string) {
  return value.replace(NON_DIGIT_REGEX, "");
}

export function maskDocument(value: string) {
  const digits = normalizeDocument(value).slice(0, 14);

  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function hasRepeatedDigits(value: string) {
  return /^(\d)\1+$/.test(value);
}

function isValidCpf(value: string) {
  const digits = normalizeDocument(value);
  if (digits.length !== 11 || hasRepeatedDigits(digits)) return false;

  let sum = 0;
  for (let index = 0; index < 9; index += 1) {
    sum += Number(digits[index]) * (10 - index);
  }

  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== Number(digits[9])) return false;

  sum = 0;
  for (let index = 0; index < 10; index += 1) {
    sum += Number(digits[index]) * (11 - index);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === Number(digits[10]);
}

function isValidCnpj(value: string) {
  const digits = normalizeDocument(value);
  if (digits.length !== 14 || hasRepeatedDigits(digits)) return false;

  const weightsFirst = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weightsSecond = [6, ...weightsFirst];

  const calcDigit = (base: string, weights: number[]) => {
    const sum = base.split("").reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calcDigit(digits.slice(0, 12), weightsFirst);
  const secondDigit = calcDigit(digits.slice(0, 12) + String(firstDigit), weightsSecond);

  return digits.endsWith(`${firstDigit}${secondDigit}`);
}

export function getDocumentType(value: string) {
  const digits = normalizeDocument(value);
  if (digits.length === 11) return "CPF";
  if (digits.length === 14) return "CNPJ";
  return "DOCUMENT";
}

export function isValidDocument(value: string) {
  const digits = normalizeDocument(value);

  if (digits.length === 11) return isValidCpf(digits);
  if (digits.length === 14) return isValidCnpj(digits);
  return false;
}
