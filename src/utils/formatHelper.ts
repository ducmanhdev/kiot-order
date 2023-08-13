import dayjs from "dayjs";
import objectSupport from 'dayjs/plugin/objectSupport';
dayjs.extend(objectSupport);
import {DATE_FORMAT} from "@/constant";

export default class FormatHelper {
    static formatShownPrice(value: number = 0) {
        // return value ? (value).toLocaleString("en-US", {style: "currency", currency: "USD"}) : "$0.00";
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
    }

    static getResponse(response: any) {
        if (response != null && response.data && response.data.status == 'OK') {
            return response.data.result;
        } else {
            return null;
        }
    }

    static isJsonString(str: any) {
        if (typeof str != "string") return false;
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    static tryParseJson(data: any) {
        try {
            return JSON.parse(data);
        } catch (e) {
            return data;
        }
    };

    static reverseObject(obj: { [key: string]: any }) {
        return Object.fromEntries(Object.entries(obj).map(([key, value]) => [value, key]));
    };

    static timestampToDate (timestamp: string, _DATE_FORMAT = DATE_FORMAT) {
        if (!timestamp) return '';
        const year = timestamp.substring(0, 4);
        const month = (timestamp.substring(4, 6) as unknown as number) - 1;
        const day = timestamp.substring(6, 8);
        const hour = timestamp.substring(8, 10);
        const minute = timestamp.substring(10, 12);
        const second = timestamp.substring(12, 14);
        return dayjs({year, month, day, hour, minute, second}).format(_DATE_FORMAT);
    };
}
