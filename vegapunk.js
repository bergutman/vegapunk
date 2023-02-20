import * as dotenv from 'dotenv'; dotenv.config();
import * as fs from 'fs';
import { ChatGPTAPI } from 'chatgpt';

// Defines ===================================================================
let family; // Talking to family members or just me
let conversations_file = fs.readFileSync('conversations.json');
let conversations = JSON.parse(conversations_file);
let memories_file = fs.readFileSync('memories.json');
let memories = JSON.parse(memories_file);
let last_conversation = conversations['family'][conversations['family'].length - 1];

// Connect to OpenAI
const api = new ChatGPTAPI({ apiKey: process.env.OPENAI_API_KEY })

// Initialize new ChatGPT thread
async function init() {
    console.log('Bootstrapping Vegapunk...');
    console.log('Fetching memories...');
    let prompt = "You are an Ai named Vegapunk.";
    Object.entries(memories['family']).forEach((memory) => {
        const [key, value] = memory;
        prompt = prompt.concat(" ", value)
    });
    console.log('Prompt:')
    console.log(prompt)

    await api.sendMessage(prompt, {
        conversationId: last_conversation.conversationId,
        parentMessageId: last_conversation.parentMessageId
    }).then((response) => {
        // Log conversation ids
        console.log(response)
        conversations['family'].push(response);
        fs.writeFileSync('conversations.json', JSON.stringify(conversations));
        last_conversation = conversations['family'][conversations['family'].length - 1];
    }).catch((err) => {
        console.error("ChatQuestion Error:" + err)
    })
}

function message(query, cb) {

    let tmr = setTimeout((e) => {
        cb("Oppss, something went wrong! (Timeout)")
        console.error(e)
    }, 100000);

    api.sendMessage(query, {
        conversationId: last_conversation.conversationId,
        parentMessageId: last_conversation.parentMessageId
    }).then((response) => {
        clearTimeout(tmr);
        // Log conversation ids
        conversations['family'].push(response);
        fs.writeFileSync('conversations.json', JSON.stringify(conversations));
        last_conversation = conversations['family'][conversations['family'].length - 1];
        cb(response);
    }).catch((err) => {
        cb("Oppss, something went wrong! (Error)")
        console.error("ChatQuestion Error:" + err)
    })
}

function store(storeval, cb) {

    let tmr = setTimeout((e) => {
        cb("Oppss, something went wrong! (Timeout)")
        console.error(e)
    }, 100000);

    api.sendMessage(storeval, {
        conversationId: last_conversation.conversationId,
        parentMessageId: last_conversation.parentMessageId
    }).then((response) => {
        clearTimeout(tmr);
        // Store value to memories
        memories['family'].push(storeval)
        console.log(storeval)
        fs.writeFileSync('memories.json', JSON.stringify(memories));
        // Log conversation ids
        conversations['family'].push(response);
        fs.writeFileSync('conversations.json', JSON.stringify(conversations));
        last_conversation = conversations['family'][conversations['family'].length - 1];
        cb(response);
    }).catch((err) => {
        cb("Oppss, something went wrong! (Error)")
        console.error("ChatQuestion Error:" + err)
    })
}

// initVegaPunk(api);
export { api, init, message, store };