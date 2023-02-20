import * as dotenv from 'dotenv'; dotenv.config();
import * as vp from './vegapunk.js';
import * as discord from './discord.js';

let family; // Talking to family members or just me


// Main Function (Execution Starts From Here)
async function main() {

    // Initiate Vegapunk
    vp.init();
    // Initiate Discord bot
    discord.init();
}

main() // Call Main function