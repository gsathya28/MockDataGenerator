const fs = require('fs');
const path = require('path');
const prompt = require('prompt-sync')();
const { v4: uuidv4 } = require('uuid');

var templates = {};
var uniqueWordsFromList = true; // Not needed right now
const templatePath = '/templates';
const wordlistPath = '/wordlists';
const outputPath = '/output';


function setup(){
    // Find Templates
    console.log('Parsing Templates...');
    findTemplates();

    // Parse Templates
    console.log('Noting Wordlists');

    // See for which fields wordlists are available
    

}

function findTemplates(){
    // Our starting point
    try {
        // Get full path of the template folder
        const dirpath = path.join(__dirname, templatePath);
        
        // Get the files as an array
        const files = fs.readdirSync(dirpath);

        // Loop through them
        for (const file of files) {    
            // Get the full path
            const filepath = path.join(dirpath, file);

            // Stat the file to see if we have a file or dir
            const stat = fs.statSync(filepath);
            const extension = file.slice((file.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
            const filename = file.replace(/\.[^/.]+$/, "");

            if (stat.isFile() && extension === 'json'){
                console.log("\tFound '%s' - Template Name: %s", file, filename);
                const fileContents = fs.readFileSync(filepath, 'utf8');
                const data = JSON.parse(fileContents);
                templates[filename] = data; 
            }
        }
    }
    catch (e) {
        // Catch anything bad that happens
        console.error( "Error in generating: ", e );
    }
    
}

console.log("Setting up data generator");
setup();

// CLI
while(true){
    
    const commandstring = prompt('> ').toLowerCase();
    const commandargs = commandstring.split(" ");
    const command = commandargs[0];
    const args = commandargs.splice(1, commandargs.length);

    switch (command) {
        case "generate":
            console.log("Generating " + args[1] + " " + args[0] + "s" + " in /outputs/" + args[0] + "s.json");
            var returnvalue = generate(args);
            if (returnvalue.success)
                console.log("Generation Successful!");
            else
                console.log("Generation Unsuccessful: " + returnvalue.message);
            break;
        
        case "exit":
            return (0);

        default:
            console.log("Invalid command!")
            printUsage();
            break;
    }
}

function generate(args) {
    
    // First argument is the template to generate data on
    // Second argument is the number of objects to generate

    // Template is not in the templates we searched
    if (!(args[0] in templates))
        return {success: false, message: "Invalid template name: " + args[0]}

    var dataType = templates[args[0]];
    var generated = [];

    for (var i = 0; i < parseInt(args[1]); i++){
        var object = {};
        for (var key in dataType){
            if (dataType.hasOwnProperty(key)){
                var generateType = dataType[key];
                var value = getValue(key, generateType, i);
                object[key] = value;
            }
        }
        generated.push(object);
    }

    var output = JSON.stringify(generated, null, 4);
    const fileOut = args[0] + 's.json';
    const fileOutPath = path.join(__dirname, outputPath, fileOut);
    fs.writeFileSync(fileOutPath, output);
    return {success: true, message: ""};
}

function printUsage(){

    console.log("Usage: ");
    console.log("\tgenerate <templateName> <number> - Will generate an array of size <number> with JSON objects specified by <templateName>");
    console.log("\t\tExample: generate part 5");
}

function getValue(key, generateType, objNum){

    // Get a value from a wordlist:
    if (generateType.substring(generateType.length-3, generateType.length) === 'txt'){
        const filepath = path.join(__dirname, wordlistPath, generateType);
        var values = fs.readFileSync(filepath, 'utf8');
        values = values.trim();
        values = values.split("\r\n");
        
        var start = 0;
        var end = values.length;
        return values[Math.floor(Math.random() * (end - start) + start)];
    }

    // Get a value from a predefined range of types
    else {
        var type = generateType.substring(0, 3);
        var range = generateType.substring(4, generateType.length - 1);
        if (range.length != 0)
            var rangeArray = range.split(",");
        
        switch (type) {
            case "INT":
                if (range.length == 0)
                    return Math.floor(Math.random() * (11 - 0) + 0)
                
                var start = parseInt(rangeArray[0]);
                var end = parseInt(rangeArray[1]);
                return Math.floor(Math.random() * (end - start) + start);
                break;
            
            case "FLT":
                if (rangeArray.length == 0)
                    return Math.random();
                
                var start = parseInt(rangeArray[0]);
                var end = parseInt(rangeArray[1]);
                return Math.random() * (end - start) + start

            case "STR":
                if (rangeArray.length == 0)    
                    return "No Strings Specified";
                var start = 0;
                var end = rangeArray.length;
                return rangeArray[Math.floor(Math.random() * (end - start) + start)];

            case "BLN":
                return Math.random > .5;
        
            case "UID":         // Universally Unique ID
                return uuidv4();

            default:
                break;
        }
    }
}
