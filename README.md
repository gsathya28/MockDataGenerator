# MockDataGenerator
Mock JSON Data Generator using wordlists
Note that this is a VERY crude program as of now. Will fix as necessary.
Priorities:
    Test edge cases
    Add template flexibility
    Add nested object functionality for templates
    Add a lot of error handling

## Installation

Use the package manager [npm](https://www.npmjs.com/get-npm) to install dependencies for the generator.

```bash
npm install
```

## Setup
The data generator requires templates and wordlists in order to generate mock data to use.
The templates are all of JSON format and are in the /templates directory
Configuring the templates so the objects will generate the right type of data is key. Examples are given, and a guide to do so is in /templates/templates.txt
The wordlists are all text files, with each item in a list separated by a new line, in the /wordlists directory

## Usage

```bash
node app
generate <template name> <number> 
```

This will generate a JSON array of size number in /outputs/template-name.json

