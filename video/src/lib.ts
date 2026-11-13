const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** Western digits to Bangla digits, e.g. 128 -> ১২৮. */
export const toBn = (value: string | number): string =>
  String(value).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
