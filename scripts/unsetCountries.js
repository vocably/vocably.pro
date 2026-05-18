// Google Play

var countries = [
  'Luxembourg',
  'Singapore',
  'Ireland',
  'Qatar',
  'Norway',
  'Switzerland',
  'United States',
  'Denmark',
  'Netherlands',
  'Iceland',
  'Austria',
  'Belgium',
  'Germany',
  'Australia',
  'Saudi Arabia',
  'Sweden',
  'Malta',
  'Bahrain',
  'Finland',
  'Canada',
  'United Kingdom',
  'Italy',
  'South Korea',
  'New Zealand',
];

for (const country of countries) {
  const checkboxContainer = document.querySelector(
    `mat-checkbox[aria-label="${country}"]`
  );
  if (!checkboxContainer) {
    throw new Error(`Checkbox not found for ${country}`);
  }

  const eventOptions = { bubbles: true, cancelable: true, view: window };

  // Play Console component event sequence
  checkboxContainer.dispatchEvent(
    new PointerEvent('pointerdown', eventOptions)
  );
  checkboxContainer.dispatchEvent(new MouseEvent('mousedown', eventOptions));
  checkboxContainer.dispatchEvent(new MouseEvent('mouseup', eventOptions));
  checkboxContainer.dispatchEvent(new PointerEvent('pointerup', eventOptions));
  checkboxContainer.dispatchEvent(new MouseEvent('click', eventOptions));
}

// Paddle

function setReactInputValue(inputElement, newValue) {
  // Get the native setter from the HTMLInputElement prototype
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  ).set;

  // Call the native setter on the target input element
  nativeInputValueSetter.call(inputElement, newValue);

  // Create and dispatch a bubbling 'input' event so React detects the change
  const event = new Event('input', { bubbles: true });
  inputElement.dispatchEvent(event);
  inputElement.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
}

var countries = [
  'Luxembourg',
  'Singapore',
  'Ireland',
  'Qatar',
  'Norway',
  'Switzerland',
  'United States',
  'Denmark',
  'Netherlands',
  'Iceland',
  'Austria',
  'Belgium',
  'Germany',
  'Australia',
  'Saudi Arabia',
  'Sweden',
  'Malta',
  'Bahrain',
  'Finland',
  'Canada',
  'United Kingdom',
  'Italy',
  'Korea',
  'New Zealand',
];

for (const country of countries) {
  const input = document.querySelector(
    `input[aria-label^="${country.toUpperCase()}"`
  );
  if (!input) {
    throw new Error(`Input not found for ${country}`);
  }

  setReactInputValue(input, '4.99');
}

// App Store

var countries = [
  'LUX',
  'SGP',
  'IRL',
  'QAT',
  'NOR',
  'CHE',
  'USA',
  'DNK',
  'NLD',
  'ISL',
  'AUT',
  'BEL',
  'DEU',
  'AUS',
  'SAU',
  'SWE',
  'MLT',
  'BHR',
  'FIN',
  'CAN',
  'GBR',
  'ITA',
  'KOR',
  'NZL',
];

for (const country of countries) {
  const checkbox = document.getElementById(country);
  if (!checkbox) {
    throw new Error(`Checkbox not found for ${country}`);
  }
  checkbox.click();
}
