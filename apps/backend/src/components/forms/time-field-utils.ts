export const TIME_FIELD_DEFAULT_COLON = ':';
export const TIME_FIELD_DEFAULT_VALUE_SHORT = `00${TIME_FIELD_DEFAULT_COLON}00`;
export const TIME_FIELD_DEFAULT_VALUE_FULL = `00${TIME_FIELD_DEFAULT_COLON}00${TIME_FIELD_DEFAULT_COLON}00`;

export function isNumber<T>(value: T): boolean {
  const number = Number(value);
  return !isNaN(number) && String(value) === String(number);
}

export function formatTimeItem(value?: string | number): string {
  return `${value || ''}00`.substr(0, 2);
}

export function validateTimeAndCursor(
  showSeconds = false,
  value = '',
  defaultValue = '',
  colon = TIME_FIELD_DEFAULT_COLON,
  cursorPosition = 0
): [string, number] {
  const [oldH, oldM, oldS] = defaultValue.split(colon);

  let newCursorPosition = Number(cursorPosition);
  let [newH, newM, newS] = String(value).split(colon);

  newH = formatTimeItem(newH);
  if (Number(newH[0]) > 2) {
    newH = oldH;
    newCursorPosition -= 1;
  } else if (Number(newH[0]) === 2) {
    if (Number(oldH[0]) === 2 && Number(newH[1]) > 3) {
      newH = `2${oldH[1]}`;
      newCursorPosition -= 2;
    } else if (Number(newH[1]) > 3) {
      newH = '23';
    }
  }

  newM = formatTimeItem(newM);
  if (Number(newM[0]) > 5) {
    newM = oldM;
    newCursorPosition -= 1;
  }

  if (showSeconds) {
    newS = formatTimeItem(newS);
    if (Number(newS[0]) > 5) {
      newS = oldS;
      newCursorPosition -= 1;
    }
  }

  const validatedValue = showSeconds ? `${newH}${colon}${newM}${colon}${newS}` : `${newH}${colon}${newM}`;

  return [validatedValue, newCursorPosition];
}