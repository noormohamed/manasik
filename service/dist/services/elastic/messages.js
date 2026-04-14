"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const elastic_1 = require("../elastic");
class Messages extends elastic_1.Elastic {
    constructor() {
        super();
    }
    fetchFirstMessagesByChat(userId_1, clientId_1, index_1) {
        return __awaiter(this, arguments, void 0, function* (userId, clientId, index, size = 100) {
            try {
                let records = yield this.fetch(index, {
                    "userId": userId
                }, 30);
                const filtered = records
                    .filter((v) => v._source.accountId === clientId)
                    .map((v) => v._source);
                const unique = Array.from(new Map(filtered.map((item) => [item.chatId, item])).values());
                return unique;
            }
            catch (e) {
                return false;
            }
        });
    }
}
exports.default = Messages;
