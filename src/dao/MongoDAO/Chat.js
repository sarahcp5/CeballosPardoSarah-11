import mongoose from "mongoose"; 
import MongoDBContainer from "./MongoDBContainer.js";
import faker from 'faker';
import  { normalize, schema, denormalize } from 'normalizr';

faker.locale = 'es';
const {name, internet} = faker;
const collection = 'messages';

const messagesSchema = mongoose.Schema({
    author: { 
        type: Object, 
        required: true 
    },
    text: { 
        type: String, 
        required: true 
    },
    date: { 
        type: String, 
        required: true 
    }
});

const messages = {
    id:"messages",

    messages: [
        {
            id:"1a",

            author:{
                id:"1",
                email:'mail usuario',
                nombre:'nombre usuario',
                apellido:'apellido del usuario',
                edad:'edad del usuario',
                alias:'alias del usuario',
                avatar:'url'
            },
            text:'mensaje del usuario'
        },
        {
            id:"1b",
    
            author:{
                id:"2",
                email:'mail usuario2',
                nombre:'nombre usuario2',
                apellido:'apellido del usuario2',
                edad:'edad del usuario2',
                alias:'alias del usuario2',
                avatar:'url2'
            },
            text:'mensaje del usuario2'
        }

    ]
    
}

const author = new schema.Entity('authors',{},{idAttribute: 'email'});
const message = new schema.Entity('messages',{
    author:author
});
const chat = new schema.Entity('posts',{
    messages:[message]
});
// let normalizedData = normalize(messages, chat);console.log(JSON.stringify(normalizedData,null,'\t'));
// let denormalizedData    =  denormalize(normalizedData.result, chat, normalizedData.entities);console.log(JSON.stringify(denormalizedData,null,'\t'));
export default class Messages extends MongoDBContainer {
    constructor() {
        super(collection, messagesSchema);
    }

    calculateCompr = async() => {
        let data = await this.getAll();
        let messages = {
            id: "messages",
            messages: data
        }
        console.log(messages)
        let normalizedData = normalize(messages, chat);
        console.log("Normalizado: \n", JSON.stringify(normalizedData,null,'\t'));

        let denormalizedData = denormalize(normalizedData.result, chat, normalizedData.entities);console.log(JSON.stringify(denormalizedData,null,'\t'));
        console.log("Denormalizado: \n", JSON.stringify(denormalizedData,null,'\t'));
        
        return JSON.stringify(normalizedData).length * 100 / JSON.stringify(denormalizedData).length;
    }

    populate = async(quantity) => {
        await this.deleteAll();
        for (let i = 0; i < quantity; i++) {
            await this.save({
                nombre: name.firstName(),
                apellido: name.lastName(),
                avatar: internet.avatar()        
            });
        }
        let data = await this.getAll();
        return data;
    }
}