import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Utility helpers for reading external test data (Data-Driven layer).
 * Supports JSON and simple CSV files stored under /test-data.
 */

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "..", "test-data");

/**
 * Read and parse a JSON test-data file.
 * @param {string} fileName e.g. 'loginData.json'
 * @returns {any} parsed JSON object/array
 */
function readJSON(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Test data file not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

/**
 * Read a CSV file and convert it into an array of objects.
 * First row is treated as the header row.
 * @param {string} fileName e.g. 'checkoutData.csv'
 * @returns {Array<Object>} rows as objects keyed by header
 */
function readCSV(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Test data file not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf-8").trim();
  const [headerLine, ...lines] = content.split(/\r?\n/);
  const headers = headerLine.split(",").map((h) => h.trim());

  return lines.map((line) => {
    const values = line.split(",").map((v) => v.trim());
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {});
  });
}

export { readJSON, readCSV };

/*
DATA READER UTILITY – EXPLANATION

What is Data Reader?

Data Reader is a reusable utility that reads external test data files such as:

1. JSON
2. CSV

Instead of hardcoding test data inside the test script, we keep the data separately under the test-data folder.

Example:

test-data/
    loginData.json
    users.json
    checkoutData.csv

Then the test script reads the required data using:

readJSON()
readCSV()


==================================================
1. IMPORT fs
==================================================

Code:

import fs from 'fs';

fs stands for File System.

Node.js provides the fs module to work with files and directories.

We use fs for operations such as:

- Check whether a file exists
- Read a file
- Write a file
- Delete a file

In this utility, we mainly use:

fs.existsSync()
fs.readFileSync()


==================================================
2. IMPORT path
==================================================

Code:

import path from 'path';

The path module is used to create and manage file paths.

Instead of manually writing:

../test-data/loginData.json

we use:

path.join()

This helps create the correct path in a platform-independent way.


==================================================
3. IMPORT fileURLToPath
==================================================

Code:

import { fileURLToPath } from 'url';

In ES Modules, __filename and __dirname are not available by default.

Therefore, we recreate them.

Code:

const __filename = fileURLToPath(import.meta.url);

This converts the current module URL into a normal file-system path.


==================================================
4. RECREATE __dirname
==================================================

Code:

const __dirname = path.dirname(__filename);

__dirname represents the directory of the current JavaScript file.

For example:

Project
    |
    +-- utils
    |     |
    |     +-- dataReader.js
    |
    +-- test-data

If dataReader.js is inside:

utils/

then __dirname points to:

utils/


==================================================
5. DATA_DIR
==================================================

Code:

const DATA_DIR = path.join(__dirname, '..', 'test-data');

This creates the path to the test-data folder.

Project structure:

Project
    |
    +-- utils
    |     |
    |     +-- dataReader.js
    |
    +-- test-data
          |
          +-- loginData.json

The path becomes:

utils
   ↓
..
   ↓
Project
   ↓
test-data


So:

DATA_DIR

points to:

Project/test-data


==================================================
6. readJSON()
==================================================

Function:

readJSON(fileName)

Purpose:

Reads a JSON file from the test-data folder and converts the JSON text into a JavaScript object or array.


Example:

const loginData = readJSON('loginData.json');


==================================================
7. BUILD FILE PATH
==================================================

Code:

const filePath = path.join(DATA_DIR, fileName);

Suppose:

DATA_DIR:

Project/test-data

fileName:

loginData.json

Then:

filePath:

Project/test-data/loginData.json


==================================================
8. CHECK WHETHER FILE EXISTS
==================================================

Code:

if (!fs.existsSync(filePath)) {
    throw new Error(`Test data file not found: ${filePath}`);
}

fs.existsSync()

checks whether the file exists.

If the file exists:

Continue execution.

If the file does not exist:

Throw an error.


Example:

readJSON('loginData.json');

If the file doesn't exist:

Error:

Test data file not found:
Project/test-data/loginData.json


==================================================
9. READ THE FILE
==================================================

Code:

const raw = fs.readFileSync(filePath, 'utf-8');

This reads the file content.

Example loginData.json:

{
    "username": "standard_user",
    "password": "secret_sauce"
}

After readFileSync():

raw contains the JSON as text.

Important:

The result is initially a STRING.


==================================================
10. JSON.parse()
==================================================

Code:

return JSON.parse(raw);

JSON.parse()

converts JSON text into a JavaScript object or array.

Before:

String

After:

JavaScript Object / Array


Example:

JSON file:

{
    "username": "standard_user",
    "password": "secret_sauce"
}


After JSON.parse():

{
    username: "standard_user",
    password: "secret_sauce"
}


Then we can access:

loginData.username

loginData.password


==================================================
11. COMPLETE readJSON FLOW
==================================================

readJSON('loginData.json')
        |
        ↓
Create file path
        |
        ↓
Check file exists
        |
        ↓
Read file
        |
        ↓
Get JSON as string
        |
        ↓
JSON.parse()
        |
        ↓
JavaScript Object / Array
        |
        ↓
Return data to test


==================================================
12. readCSV()
==================================================

Function:

readCSV(fileName)

Purpose:

Reads a CSV file and converts each row into a JavaScript object.

Example CSV:

username,password,role
standard_user,secret_sauce,user
locked_out_user,secret_sauce,locked


After readCSV():

[
    {
        username: "standard_user",
        password: "secret_sauce",
        role: "user"
    },
    {
        username: "locked_out_user",
        password: "secret_sauce",
        role: "locked"
    }
]


==================================================
13. READ CSV FILE
==================================================

Code:

const content = fs.readFileSync(filePath, 'utf-8').trim();

This reads the complete CSV file as text.

Example:

username,password,role
standard_user,secret_sauce,user
locked_out_user,secret_sauce,locked


==================================================
14. SPLIT INTO LINES
==================================================

Code:

const [headerLine, ...lines] = content.split(/\r?\n/);

This separates the CSV into individual lines.

Example:

username,password,role
standard_user,secret_sauce,user
locked_out_user,secret_sauce,locked


Becomes:

headerLine:

username,password,role


lines:

standard_user,secret_sauce,user
locked_out_user,secret_sauce,locked


==================================================
15. EXTRACT HEADERS
==================================================

Code:

const headers = headerLine.split(',').map((h) => h.trim());

Example:

Header:

username,password,role

After split():

[
    "username",
    "password",
    "role"
]


==================================================
16. PROCESS EACH CSV ROW
==================================================

Code:

return lines.map((line) => {

});

map()

processes every row of the CSV.

Example:

Row 1:

standard_user,secret_sauce,user

Row 2:

locked_out_user,secret_sauce,locked


Each row is converted into an object.


==================================================
17. GET VALUES
==================================================

Code:

const values = line.split(',').map((v) => v.trim());

Example:

standard_user,secret_sauce,user

Becomes:

[
    "standard_user",
    "secret_sauce",
    "user"
]


==================================================
18. REDUCE() TO CREATE OBJECT
==================================================

Code:

return headers.reduce((obj, header, index) => {
    obj[header] = values[index];
    return obj;
}, {});


This connects the headers with their corresponding values.

Example:

Headers:

[
    "username",
    "password",
    "role"
]


Values:

[
    "standard_user",
    "secret_sauce",
    "user"
]


Result:

{
    username: "standard_user",
    password: "secret_sauce",
    role: "user"
}


==================================================
19. COMPLETE CSV FLOW
==================================================

CSV File
   |
   ↓
Read file
   |
   ↓
Split rows
   |
   ↓
Get headers
   |
   ↓
Get values
   |
   ↓
Match header + value
   |
   ↓
Create JavaScript objects
   |
   ↓
Return array


==================================================
20. EXPORT FUNCTIONS
==================================================

Code:

export { readJSON, readCSV };


This makes both functions available to other files.

Example:

import { readJSON, readCSV }
from '../../utils/dataReader.js';


==================================================
21. REAL-TIME PLAYWRIGHT EXAMPLE – JSON
==================================================

Suppose we have:

test-data/loginData.json


Example:

{
    "username": "standard_user",
    "password": "secret_sauce"
}


In test:

const loginData = readJSON('loginData.json');


Then:

await page.locator('#username').fill(loginData.username);

await page.locator('#password').fill(loginData.password);


Here:

JSON File
    ↓
readJSON()
    ↓
JavaScript Object
    ↓
Playwright Test
    ↓
Fill username/password


==================================================
22. REAL-TIME PLAYWRIGHT EXAMPLE – CSV
==================================================

checkoutData.csv

firstName,lastName,postalCode
John,Doe,411001
Priya,Sharma,411002
Raj,Patel,411003


Test:

const checkoutData = readCSV('checkoutData.csv');


Then:

for (const data of checkoutData) {

    await page.getByLabel('First Name')
        .fill(data.firstName);

    await page.getByLabel('Last Name')
        .fill(data.lastName);

    await page.getByLabel('Postal Code')
        .fill(data.postalCode);
}


==================================================
23. WHY USE DATA READER?
==================================================

1. Keeps test data separate from test code.

2. Avoids hardcoding data inside test cases.

3. Supports data-driven testing.

4. Makes test data easy to maintain.

5. The same utility can be reused by multiple test cases.

6. New test data can be added without changing the utility.

7. Useful for JSON and CSV-based test data.


==================================================
24. DATA-DRIVEN FRAMEWORK FLOW
==================================================

Test Data
    |
    +-- JSON
    |
    +-- CSV
    |
    ↓
dataReader.js
    |
    +-- readJSON()
    |
    +-- readCSV()
    |
    ↓
Test Case
    |
    ↓
Page Object
    |
    ↓
Playwright
    |
    ↓
Application


==================================================
INTERVIEW ANSWER
==================================================

What is the purpose of dataReader.js?

dataReader.js is a reusable utility responsible for reading external test data files such as JSON and CSV. It separates test data from test logic and supports data-driven testing. The utility uses Node.js fs and path modules to locate and read files, and JSON.parse() to convert JSON data into JavaScript objects.


IMPORTANT POINTS TO REMEMBER

fs
→ Used to work with files.

path
→ Used to create and manage file paths.

fileURLToPath()
→ Converts the ES Module URL into a file-system path.

__filename
→ Current file path.

__dirname
→ Current file directory.

path.join()
→ Creates the required file/folder path.

fs.existsSync()
→ Checks whether a file exists.

fs.readFileSync()
→ Reads file content.

JSON.parse()
→ Converts JSON string into JavaScript object/array.

map()
→ Processes each CSV row.

reduce()
→ Builds an object by combining headers and values.

readJSON()
→ Reads JSON test data.

readCSV()
→ Reads CSV test data.

*/
