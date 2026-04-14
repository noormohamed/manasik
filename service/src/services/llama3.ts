import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = "https://e3zkgtzzbx3stawt2wjcgroj.agents.do-ai.run/api/v1/chat/completions";
const API_KEY = "2XmHLmX0_l6ilQfFJlx9PziHvwssA_jZ";

if (!API_URL || !API_KEY) {
    throw new Error('Missing API_URL or API_KEY in environment variables');
}

export async function getChatResponseFromLlama3(messages: any[], maxTurns: number = 0) {

    try {

        const data = {
            model: "llama3.3-70b-instruct",
            messages: messages
        };

        const response = await axios.post(API_URL, data, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            }
        });

        const reply = response.data?.choices?.[0]?.message?.content || '[No response from AI]';

        return {
            reply: reply.trim(),
            usage:  response.data.usage.total_tokens || 99
        };

    } catch (err: any) {

	console.error(API_URL);
        console.error('123 - DigitalOcean AI Error:', err.message);
        throw new Error('Failed to get response from LLaMA 3.');
    }
}
