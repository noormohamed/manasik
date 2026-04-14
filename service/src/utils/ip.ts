import {Elastic} from "../services/elastic";
import {hashSHA256} from "../services/encrypt";
import axios from "axios";

export const requestGeoIP = async (ip: any): Promise<any> => {
    const e = new Elastic();
    try {
        console.log('public lookup:', ip);
        let res = await axios.get('http://ip-api.com/json/' + ip);
        e.post('localip', hashSHA256(ip), res.data);
        return res.data;
    } catch (e) {
        console.log(e);
    }
}

export const checkLocalGeoIP = async (ip: any): Promise<any> => {
    const e = new Elastic();
    try {
        console.log('local lookup:', ip);
        let res = await e.get('localip', hashSHA256(ip));
        return res.body._source;
    } catch (e) {
        console.log(e);
        return await requestGeoIP(ip);
    }
}