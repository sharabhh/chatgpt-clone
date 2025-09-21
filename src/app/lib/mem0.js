import {MemoryClient} from "mem0ai";

// Initialize Mem0 client with API key
const mem0 = new MemoryClient({
    apiKey: process.env.MEM0_API_KEY,
});

export default mem0;