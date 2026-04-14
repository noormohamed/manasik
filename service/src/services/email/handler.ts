import fs from 'fs';
import path from 'path';

export class handler {

    static loadTemplate(templateName: string): string {
        const filePath = path.join(__dirname, '../../emails', templateName);
        return fs.readFileSync(filePath, 'utf8');
    }

    static apply(template: string, data: Record<string, any>): string {
        let output = template;

        for (const [key, value] of Object.entries(data)) {
            const regex = new RegExp(`{${key}}`, 'g');
            output = output.replace(regex, String(value));
        }

        return output;
    }
}