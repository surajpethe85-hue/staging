/**
 * dataGenerator - lightweight, dependency-free random test-data generator.
 *
 * Real frameworks generate unique data per run (emails, names, numbers) so
 * tests don't collide. This mimics the essentials of libraries like Faker
 * without adding a dependency.
 */

const FIRST_NAMES = [
  "John",
  "Jane",
  "Alex",
  "Priya",
  "Liam",
  "Sara",
  "Raj",
  "Emma",
  "Noah",
  "Mia",
];
const LAST_NAMES = [
  "Doe",
  "Smith",
  "Sharma",
  "Brown",
  "Khan",
  "Patel",
  "Jones",
  "Lee",
  "Verma",
];
const DOMAINS = ["example.com", "testmail.com", "mailinator.com", "qa-demo.io"];

/** Random integer between min and max (inclusive). */
export function randomInt(min = 0, max = 100) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Pick a random element from an array. */
export function randomFrom(array) {
  return array[randomInt(0, array.length - 1)];
}

/** Random alphanumeric string of a given length. */
export function randomString(length = 8) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[randomInt(0, chars.length - 1)];
  }
  return result;
}

/** Random first name. */
export function firstName() {
  return randomFrom(FIRST_NAMES);
}

/** Random last name. */
export function lastName() {
  return randomFrom(LAST_NAMES);
}

/** Random full name. */
export function fullName() {
  return `${firstName()} ${lastName()}`;
}

/** Unique email address (timestamped to guarantee uniqueness). */
export function email(prefix = "user") {
  return `${prefix}_${Date.now()}_${randomString(4).toLowerCase()}@${randomFrom(DOMAINS)}`;
}

/** Random numeric postal/zip code. */
export function postalCode(length = 5) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += randomInt(0, 9);
  }
  return code;
}

/** Random phone number (10 digits). */
export function phoneNumber() {
  return `9${postalCode(9)}`;
}

/**
 * Generate a complete random customer object (handy for checkout forms).
 * @returns {{firstName: string, lastName: string, email: string, postalCode: string, phone: string}}
 */
export function customer() {
  return {
    firstName: firstName(),
    lastName: lastName(),
    email: email(),
    postalCode: postalCode(),
    phone: phoneNumber(),
  };
}

export default {
  randomInt,
  randomFrom,
  randomString,
  firstName,
  lastName,
  fullName,
  email,
  postalCode,
  phoneNumber,
  customer,
};

/*
DATA GENERATOR – EXPLANATION

What is Data Generator?

Data Generator is a reusable utility that generates random test data during test execution.

It is useful in automation frameworks because we don't always want to use the same hardcoded data.

Examples:
- Random name
- Random email
- Random phone number
- Random postal code
- Random string
- Random number

The main advantage is that every test execution can use different test data.


1. randomInt()

Syntax:
randomInt(min, max)

Example:

console.log(randomInt(1, 10));

Possible Output:
7

Another execution:
3

Another execution:
9

Purpose:
Generates a random integer between minimum and maximum values.

Example:

randomInt(100, 999)

Possible outputs:
125
456
789
912


2. randomFrom()

Syntax:
randomFrom(array)

Example:

console.log(randomFrom(['Chrome', 'Firefox', 'Edge']));

Possible Output:
Firefox

Another execution:
Chrome

Another execution:
Edge

Purpose:
Randomly selects one value from an array.


3. randomString()

Syntax:
randomString(length)

Example:

console.log(randomString(8));

Possible Output:
aK92LmX7

Another execution:
Pq82Ab91

Another execution:
xY72Kp91

Purpose:
Generates a random alphanumeric string.

It can contain:
- Lowercase letters
- Uppercase letters
- Numbers

Example:

randomString(5)

Possible Output:
A7xP2


4. firstName()

Syntax:

firstName()

Example:

console.log(firstName());

Possible Output:
Priya

Another execution:
John

Another execution:
Alex

Purpose:
Randomly selects a first name from the predefined FIRST_NAMES array.


5. lastName()

Syntax:

lastName()

Example:

console.log(lastName());

Possible Output:
Sharma

Another execution:
Patel

Another execution:
Smith

Purpose:
Randomly selects a last name from the predefined LAST_NAMES array.


6. fullName()

Syntax:

fullName()

Example:

console.log(fullName());

Possible Output:

Priya Sharma

Another execution:

John Patel

How does it work?

fullName()
   |
   +-- firstName()
   |
   +-- lastName()
   |
   +-- Combines both values

Example:

firstName() → Priya
lastName()  → Sharma

Result:

Priya Sharma


7. email()

Syntax:

email()

Example:

console.log(email());

Possible Output:

user_1769812345678_x7ka@example.com

Another execution:

user_1769812349876_ab12@qa-demo.io

Email contains:

prefix
+
timestamp
+
random string
+
domain

Example:

user_1769812345678_x7ka@example.com

user
↓
Prefix

1769812345678
↓
Timestamp

x7ka
↓
Random string

example.com
↓
Random domain

Purpose:
Generates a unique email address.

We can also pass our own prefix.

Example:

console.log(email('customer'));

Possible Output:

customer_1769812345678_ab12@testmail.com


8. postalCode()

Syntax:

postalCode()

Example:

console.log(postalCode());

Possible Output:

58241

Another execution:

74125

We can also specify the length.

Example:

console.log(postalCode(6));

Possible Output:

582416

Purpose:
Generates a random numeric postal/ZIP code.


9. phoneNumber()

Syntax:

phoneNumber()

Example:

console.log(phoneNumber());

Possible Output:

9876543210

Another execution:

9123456780

Purpose:
Generates a 10-digit phone number.

The first digit is fixed as 9.

Internally:

phoneNumber()
   |
   +-- 9
   |
   +-- postalCode(9)

Example:

9 + 876543210

Result:

9876543210


10. customer()

This is the most useful function in this utility.

Syntax:

customer()

Example:

const customerData = customer();

console.log(customerData);

Possible Output:

{
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'user_1769812345678_x7ka@example.com',
    postalCode: '58241',
    phone: '9876543210'
}

Instead of generating every value separately:

const firstNameValue = firstName();
const lastNameValue = lastName();
const emailValue = email();
const postalCodeValue = postalCode();
const phoneValue = phoneNumber();

We can simply write:

const customerData = customer();


REAL-TIME PLAYWRIGHT EXAMPLE

Suppose we have a customer registration form.

We can generate the customer data:

const customerData = customer();

Then use it in Playwright:

await page.getByLabel('First Name').fill(customerData.firstName);

await page.getByLabel('Last Name').fill(customerData.lastName);

await page.getByLabel('Email').fill(customerData.email);

await page.getByLabel('Postal Code').fill(customerData.postalCode);

await page.getByLabel('Phone').fill(customerData.phone);


Example Test Data:

Execution 1:

First Name  : Priya
Last Name   : Sharma
Email       : user_123456_ab12@example.com
Postal Code : 58241
Phone       : 9876543210


Execution 2:

First Name  : John
Last Name   : Patel
Email       : user_123789_xy91@qa-demo.io
Postal Code : 74125
Phone       : 9123456780


IMPORTING DATA GENERATOR

If the file is:

utils/dataGenerator.js

We can import the function:

import { customer } from '../../utils/dataGenerator.js';

Then:

const customerData = customer();

console.log(customerData);


We can also import individual functions:

import {
    firstName,
    lastName,
    email,
    phoneNumber
} from '../../utils/dataGenerator.js';


FRAMEWORK FLOW

Test Case
    ↓
dataGenerator.js
    ↓
Generate Random Test Data
    ↓
Customer Object
    ↓
Page Object
    ↓
Fill UI
    ↓
Submit Form
    ↓
Validate Result


WHY DO WE USE DATA GENERATOR?

1. Avoid hardcoded test data.
2. Generate unique data.
3. Reduce data duplication.
4. Useful for registration and checkout testing.
5. Useful for data-driven automation.
6. Helps avoid test-data collision.
7. Makes tests reusable.
8. Useful in CI/CD where tests execute repeatedly.


INTERVIEW ANSWER

What is a Data Generator in an automation framework?

A Data Generator is a reusable utility that generates dynamic test data such as names, email addresses, phone numbers, postal codes, and random strings. It helps avoid hardcoded data and allows automation tests to use unique data during every execution.

IMPORTANT NOTE

Random data should be used when uniqueness is required.

For example:

Registration → Random email is useful.

But for a login test where we need a specific user:

Username: standard_user
Password: secret_sauce

We should use controlled test data instead of random data.
*/
