import {Elastic} from "../elastic";

export default class Messages extends Elastic {

    constructor() {
        super();
    }

    async fetchFirstMessagesByChat(userId: string, clientId: string, index: string, size: number = 100): Promise<any> {

        try {

            let records = await this.fetch(index, {
                "userId": userId
            }, 30);

            const filtered = records
                .filter((v) => v._source.accountId === clientId)
                .map((v) => v._source);

            const unique = Array.from(new Map(filtered.map((item) => [item.chatId, item])).values());

            return unique;

        } catch (e) {
            return false;
        }
    }
}