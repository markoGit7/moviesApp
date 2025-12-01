//import insert - update DB
import {Content_Migration, updateDB} from './components/db.js'

//import prompt
import readline from "readline";

let my_choice = null;

const m = async() => {
    //call movies fetch from api
    await Content_Migration('movie');

    //call shows fetch from api
    await Content_Migration('tv');
}

const u = () => {

    updateDB();

}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Enter \n1) Migrate Records From API to DB. \n2) Update all DB records: ", (answer) => {
    my_choice = answer;

    if(Number(my_choice) === 1) {
        m();
    } else if(Number(my_choice) === 2) {
        u();
    } else {
        console.log(`You chose not valid option, chose 1 or 2`);
    }

    rl.close();
});
