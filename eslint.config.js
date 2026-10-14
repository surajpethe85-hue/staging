export default [
  {
    files: ["**/*.js"], //All these .js files can be checked.
    //This tells ESLint which files to check.
    //** means any directory or nested directory.
    //*.js means JavaScript files.
    ignores: [
      "node_modules/**",
      "reports/**",
      "test-results/**",
      "playwright-report/**",
      "allure-report/**",
      "allure-results/**",
      "html-report/**",
      "json-report/**",
      "junit-report/**",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        //This tells ESLint that these names already exist in the runtime environment.
        console: "readonly",
        process: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        exports: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        global: "readonly",
        window: "readonly",
        document: "readonly",
      },
    },
    rules: {
      //Warns when variables are declared but never used.
      "no-unused-vars": "warn",
      "no-undef": "error", //Reports variables that are not declared or recognized as globals.
      "no-console": "off", //Allows console.log(), console.error(), and other console methods without ESLint warnings.
    },
  },
];
/*
ESLint is a static code analysis tool used to identify potential errors, undefined variables,
 unused variables, and coding-standard issues in JavaScript. In a Playwright automation framework,
  I use ESLint to maintain code quality across test scripts, page objects, fixtures, and utility files.
   It checks code without executing the tests. I configure rules such as no-unused-vars, no-undef, 
   and no-console, and execute ESLint using npm scripts locally or in the CI/CD pipeline.
   */

/*
ESLint (ECMAScript Lint) is a static code analysis tool used to identify potential errors, 
unused variables, undefined variables, and coding-standard issues in JavaScript code.

In your Playwright automation framework, ESLint helps maintain clean, readable, and consistent code.

*/
