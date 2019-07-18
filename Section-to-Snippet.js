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

            default: 'sections',

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

            default: 'snippets',

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

        let locales = fs.readFileSync(path.resolve(answers.srcDirectory, answers.srcFile), {

            encoding: 'utf8'

        })

        let result = locales.replace(/section\./gi, 'block.');

 

        return {

            result,

            locales,

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

        let locales = fs.readFileSync(path.resolve(answers.outputDirectory, `${answers.outputFile}.liquid`), {

            encoding: 'utf8'

        })

        var matchJson = locales.match(/{% schema %}([^<]*){% endschema %}/);

   

        matchJson.forEach(match => {
            
            locales = locales.replace(match, "");
            fs.writeFileSync(path.resolve(answers.outputDirectory, `${answers.outputFile}.json`), match)
        })

        fs.writeFileSync(

            path.resolve(answers.outputDirectory, `${answers.outputFile}.liquid`),

            locales

        )

    })