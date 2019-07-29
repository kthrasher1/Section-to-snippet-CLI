const path = require('path')

const fuzzypath = require('inquirer-fuzzy-path')

const inquirer = require('inquirer')

const fs = require('fs')

inquirer.registerPrompt('fuzzypath', fuzzypath)

 

inquirer

    .prompt([

        {

            type: 'fuzzypath',

            name: 'srcDirectory',

            message: 'Where are the section files saved?',

            default: 'src/sections',

            excludePath: path => path.startsWith('node_modules'),

            suggestOnly: false,

            itemType: 'directory'

        },

        {

            type: 'list',

            name: 'srcFile',

            message: 'Which file you want to convert into snippet?',

            choices(answers) {

                return fs.readdirSync(answers.srcDirectory)

            }

        },

        {

            type: 'fuzzypath',

            name: 'outputDirectory',

            message: 'Where do you want to output your snippet?',

            default: 'src/snippets',

            excludePath(path) {

                return path.startsWith('node_modules')

            },

            suggestOnly: false,

            itemType: 'directory'

        },

        {

            type: 'input',

            name: 'outputFile',

            message: 'What should the snippet be called?',

            default: 'new-snippet'

        },

    ])

 

    .then(answers => {

        let data = fs.readFileSync(path.resolve(answers.srcDirectory, answers.srcFile), {

            encoding: 'utf8'

        })

        let result = data.replace(/section\./gi, 'block.');

 

        return {

            result,

            data,

            answers

        }

    })

 

    .then(({ answers, result }) => {

        fs.writeFileSync(path.resolve(answers.outputDirectory, `${answers.outputFile}.liquid`), result, (err) => {

            console.log('error', err);

        });

    

        return answers

       

    })

 

    .then(answers => {

        let data = fs.readFileSync(path.resolve(answers.outputDirectory, `${answers.outputFile}.liquid`), {

            encoding: 'utf8'

        })


  
        var matchJson = data.match(/{% schema %}([^]*){% endschema %}/);

        if(matchJson != null){
            matchJson.forEach(match => {
            
                data = data.replace(match, "");
                fs.writeFileSync(path.resolve(answers.outputDirectory, `${answers.outputFile}.json`), match);
            })

            console.log("JSON detected and outputted to: %s ", `${answers.outputFile}.json`)
        }
   

      

 

        fs.writeFileSync(

            path.resolve(answers.outputDirectory, `${answers.outputFile}.liquid`),

            data

        )
        console.log("Convertion Complete - file outputted to: %s from %s", answers.outputDirectory, answers.srcDirectory)

    })