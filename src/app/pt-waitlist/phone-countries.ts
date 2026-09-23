import {
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
} from "libphonenumber-js/min";
import examples from "libphonenumber-js/mobile/examples";

// Build on the server and serialize to the form: browser ICU versions can use different names.
const names = new Intl.DisplayNames(["en"], { type: "region" });

export const phoneCountries = getCountries()
  .map((country) => ({
    country,
    name: names.of(country) ?? country,
    callingCode: getCountryCallingCode(country),
    flag: String.fromCodePoint(
      ...[...country].map((letter) => 127397 + letter.charCodeAt(0)),
    ),
    placeholder:
      getExampleNumber(country, examples)?.formatNational() ?? "Phone number",
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

export type PhoneCountry = (typeof phoneCountries)[number];
