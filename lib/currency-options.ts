import "server-only";

export type CurrencyOption = { value: string; label: string };

export function getCurrencyOptions(savedCurrency?: string): CurrencyOption[] {
  const currencies = Intl.supportedValuesOf("currency");
  if (savedCurrency && !currencies.includes(savedCurrency)) currencies.push(savedCurrency);
  const currencyNames = new Intl.DisplayNames(["en"], { type: "currency" });

  return currencies.map((currency) => ({
    value: currency,
    label: `${currency} - ${currencyNames.of(currency) ?? currency}`,
  }));
}