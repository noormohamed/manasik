import {Elastic} from "../elastic";
import { v4 as uuidv4 } from 'uuid';

export async function logging(data: any) {
    const id = uuidv4();
    const e = new Elastic();
    return await e.post('logging', id, data);

};