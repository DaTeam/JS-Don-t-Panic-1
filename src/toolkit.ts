let undefined: undefined;
const
    fnObjectToString = Object.prototype.toString,
    ArrayProto = Array.prototype;

const
    stringTag = '[object String]',
    numberTag = '[object Number]',
    dateTag = '[object Date]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]';

function isObjectLike(arg: any): boolean {
    return arg != null && typeof arg == 'object';
}

function innerMapToDeepObject(target: any, src: any, options: MapOptions): void {
    if (!ToolKit.isObject(target) || !ToolKit.isObject(src)) { return; }

    const srcKeys = Object.keys(src),
        targetKeys = Object.keys(target);

    targetKeys
        .filter(key => srcKeys.includes(key))
        .reduce((obj, key) => {
            if (options.transformIsoToDate === true && ToolKit.isString(src[key])) {
                let date = ToolKit.parseDate(src[key]);

                obj[key] = ToolKit.isNull(date) ? src[key] : date;

                return obj;
            }

            if (ToolKit.isNativeTypeObject(src[key]) || !isObjectLike(src[key])) {
                obj[key] = src[key];
            }
            else {
                innerMapToDeepObject(obj[key], src[key], options);
            }

            return obj;
        }, target);
}

interface MapOptions { transformIsoToDate?: boolean, strictMapping?: boolean, ignoreStrictMappingWhenNull?: boolean }
interface DiffOptions {
    objectKey?: string,
    predicate?: (item: any, array: any[]) => boolean,
    format?: (item: any) => any,
    alternativeFormat?: (item: any) => any
}

export class ToolKit {

    /**
     * Type checks
     */
    static isDefined(arg: any): boolean {
        return arg !== undefined;
    }

    static isObject(arg: any): arg is Object {
        return fnObjectToString.call(arg) === '[object Object]';
    }

    static isString(arg: any): arg is string {
        return typeof arg === 'string' ||
            (!ToolKit.isArray(arg) && isObjectLike(arg) && fnObjectToString.call(arg) == stringTag);
    }

    static isFunction(arg: any): arg is Function {
        return fnObjectToString.call(arg) === '[object Function]';
    }

    static isArray(arg: any): arg is any[] {
        if (Array.isArray) {
            return Array.isArray(arg);
        }

        return fnObjectToString.call(arg) === arrayTag;
    }

    static isNumber(arg: any): arg is number {
        return typeof arg === 'number' || (isObjectLike(arg) && fnObjectToString.call(arg) === numberTag);
    }

    static isBoolean(arg: any): arg is boolean {
        return arg === true || arg === false || (isObjectLike(arg) && fnObjectToString.call(arg) === boolTag);
    }

    static isNaN(arg: any): boolean {
        return this.isNumber(arg) && arg != +arg;
    }

    static isDate(arg: any): arg is Date {
        return (isObjectLike(arg) && fnObjectToString.call(arg) == dateTag) || false;
    }


    static isValidDate(arg: any): boolean {
        return ToolKit.isDate(arg) && !ToolKit.isNaN(arg.getTime());
    }

    static hasValue(arg: any): boolean {
        return arg !== undefined && arg !== null;
    }

    static isUndefined(arg: any): arg is undefined {
        return arg === undefined;
    }

    static isNull(arg: any): arg is null {
        return arg === null;
    }

    static isUndefinedOrNull(arg: any): arg is undefined | null {
        return arg === undefined || arg === null;
    }

    static isNativeTypeObject(arg: any): boolean {
        //isObjectLike(arg) &&
        return ToolKit.isUndefined(arg) || ToolKit.isNull(arg) || ToolKit.isDate(arg) ||
            ToolKit.isBoolean(arg) || ToolKit.isNumber(arg) || ToolKit.isString(arg) ||
            ToolKit.isArray(arg) || ToolKit.isFunction(arg);
    }

    static noop(): void {

    }

    /**
     * Array
     */

    static addRange(src: any[], newElements: any[]) {
        ArrayProto.push.apply(src, newElements);
    }

    static clearCollection(collection: any[]) {
        if (ToolKit.isArray(collection)) {
            collection.splice(0, collection.length);
        }
    }

    static diffCollection(array: any[], values: any[], options?: DiffOptions): any[] {
        const result: any[] = [];

        if (!ToolKit.isArray(array) || !ToolKit.isArray(values) || !array.length) {
            return result;
        }
        const internalOptions = options || {};
        const objectKey = internalOptions.objectKey,
            predicate = internalOptions.predicate,
            format = internalOptions.format,
            alternativeFormat = internalOptions.alternativeFormat;

        let comparator: (item: any, array: any[]) => boolean;

        if (ToolKit.isFunction(predicate)) {
            comparator = predicate;
        }
        else {
            comparator = (item, array) => (array.includes(item));
        }

        array.forEach((obj) => {
            let transformedValue = obj;
            if (ToolKit.isString(objectKey)) {
                transformedValue = transformedValue[objectKey];
            }

            if (ToolKit.isFunction(format)) {
                transformedValue = format(transformedValue);
            }

            if (comparator(transformedValue, values) === false) {
                if (ToolKit.isFunction(alternativeFormat)) {
                    transformedValue = obj;
                    if (ToolKit.isString(objectKey)) {
                        transformedValue = transformedValue[objectKey];
                    }

                    transformedValue = alternativeFormat(transformedValue);

                    if (comparator(transformedValue, values)) { return; }
                }

                result.push(obj);
            }
        });

        return result;
    }

    static findIndex<T>(array: T[], predicate: (item: T, index: number) => boolean) {
        if (!ToolKit.isArray(array)) {
            return -1;
        }

        for (let i = 0; i < array.length; i++) {
            if (predicate(array[i], i) === true) {
                return i;
            }
        }

        return -1;
    }

    static find<T>(array: T[], predicate: (item: T, index: number) => boolean) {
        if (!ToolKit.isArray(array)) {
            return null;
        }

        for (let i = 0; i < array.length; i++) {
            if (predicate(array[i], i) === true) {
                return array[i];
            }
        }

        return null;
    }

    static orderBy<T>(array: T[], propertyAccessor: string, options?: { nullFirst?: boolean, ascending?: boolean }) {
        if (!ToolKit.isArray(array) || !ToolKit.isString(propertyAccessor)) {
            throw new Error(`${ToolKit.getClassName(ToolKit)} -> ${ToolKit.getClassMethodName(ToolKit, ToolKit.orderBy)}: invalid parameters.`);
        }

        const internalOptions = { nullFirst: false, ascending: true };
        if (ToolKit.hasValue(options) && ToolKit.isObject(options)) {
            if (options.nullFirst === true) { internalOptions.nullFirst = true; }
            if (options.ascending === false) { internalOptions.ascending = false; }
        }

        const nullOrderValue = internalOptions.nullFirst ? -1 : 1,
            ascOrderValue = internalOptions.ascending ? 1 : -1;

        array.sort((a, b) => {
            let aProperty = ToolKit.getPropertySafe(a, propertyAccessor),
                bProperty = ToolKit.getPropertySafe(b, propertyAccessor);

            if (aProperty === null) { return nullOrderValue * 1; }

            if (bProperty === null) { return nullOrderValue * -1; }

            if (aProperty < bProperty) { return ascOrderValue * -1; }

            if (aProperty > bProperty) { return ascOrderValue * 1; }

            return 0;
        });
    }

    static countCollection<T>(array: T[], predicate: (item: T, index: number) => boolean) {
        if (!ToolKit.isArray(array)) {
            return -1;
        }

        if (!ToolKit.isFunction(predicate)) {
            return array.length;
        }

        let count = 0;
        for (let i = 0; i < array.length; i++) {
            if (predicate(array[i], i) === true) {
                ++count;
            }
        }

        return count;
    }


    /**
     * String
     */

    static fixedLenInteger(value: number, length: number): string {
        return (Array(length).join('0') + value).slice(-length);
    }

    /**
     * Number
     */

    static randomNumber(minValue: number, maxValue: number): number {
        return Math.floor((Math.random() * maxValue) + minValue);
    }

    /**
    * Date
    */

    static formatDate(date: Date): string {
        return `${ToolKit.fixedLenInteger(date.getDate(), 2)}/${ToolKit.fixedLenInteger(date.getMonth() + 1, 2)}/${ToolKit.fixedLenInteger(date.getFullYear(), 4)}`;
    }

    static formatHour(value: Date | number, withSeconds: boolean = false): string {
        if (ToolKit.isUndefinedOrNull(value)) {
            return '';
        }
        if (ToolKit.isDate(value)) {
            let hour = `${ToolKit.fixedLenInteger(value.getHours(), 2)}:${ToolKit.fixedLenInteger(value.getMinutes(), 2)}`;
            if (withSeconds) {
                hour = `${hour}:${ToolKit.fixedLenInteger(value.getSeconds(), 2)}`;
            }
            return hour;
        }
        if (ToolKit.isNumber(value)) {
            var hours = Math.floor(value / 3600);
            var minutes = Math.floor((value - (hours * 3600)) / 60);
            var seconds = value - (hours * 3600) - (minutes * 60);

            var result = `${ToolKit.fixedLenInteger(hours, 2)}:${ToolKit.fixedLenInteger(minutes, 2)}`;
            if (withSeconds) {
                result = `${result}:${ToolKit.fixedLenInteger(seconds, 2)}`;
            }
            return result;
        }
        throw 'type not supported';
    }

    static parseDate(input: string): Date | null {
        const iso = /(\d{2})[-\/]{1}(\d{2})[-\/]{1}(\d{4})( (\d{2}):(\d{2})[:]?(\d{2})?)?/
        const parts = input.match(iso);

        if (ToolKit.isArray(parts)) {
            for (let i = parts.length - 1; i >= 0; i--) {
                if (!ToolKit.isString(parts[i])) { parts.pop(); }
                else { break; }
            }

            if (parts.length === 8) {
                return new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), parseInt(parts[5]), parseInt(parts[6]), parseInt(parts[7]));
            } else if (parts.length === 7) {
                return new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), parseInt(parts[5]), parseInt(parts[6]), 0);
            } else if (parts.length === 4) {
                return new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
            }
        }

        return null;
    }

    static parseHour(input: string): Date | null {
        if (ToolKit.isUndefinedOrNull(input)) {
            return null;
        }
        const iso = /(\d{2}):(\d{2})[:]?(\d{2})?/;
        const parts = input.match(iso);

        if (ToolKit.isArray(parts)) {
            for (let i = parts.length - 1; i >= 0; i--) {
                if (!ToolKit.isString(parts[i])) { parts.pop(); }
                else { break; }
            }

            if (parts.length > 2) {
                let date = new Date();
                date.setHours(parseInt(parts[1]));
                date.setMinutes(parseInt(parts[2]));
                if (parts.length > 3) {
                    date.setSeconds(parseInt(parts[3]));
                } else {
                    date.setSeconds(0);
                }

                return date;
            }
        }

        return null;
    }

    /**
    * Classes
    */

    static getClassName(instance: any): string | null {
        if (ToolKit.isObject(instance) && ToolKit.isFunction(instance.constructor)) { return instance.constructor.name; }
        if (ToolKit.isFunction(instance)) { return instance.name; }

        return null;
    }

    static getClassMethodName(instance: any, method: Function): string | null {
        if (ToolKit.isUndefinedOrNull(instance) ||
            !(ToolKit.isObject(instance) || ToolKit.isFunction(instance))
            || !ToolKit.isFunction(method)) {
            return null;
        }

        let result = null;
        [
            ...Object.getOwnPropertyNames(Object.getPrototypeOf(instance)),
            ...Object.keys(instance)
        ]
            .filter((key, index, context) => context.indexOf(key) === index && !['caller', 'callee', 'arguments'].includes(key))
            .some(key => {
                if (instance[key] === method) {
                    result = key;
                    return true;
                }

                return false;
            });

        return result;
    }

    /**
     * Utilities
     */

    static getObjectKeysDeep(object: any, prefix: string = ''): string[] {
        if (ToolKit.isNativeTypeObject(object) || !isObjectLike(object)) {
            return [];
        }

        const keys: string[] = [];
        if (prefix.length > 0) {
            prefix += '.';
        }

        for (let prop in object) {
            const propName = prefix + prop;
            keys.push(propName);
            if (!ToolKit.isNativeTypeObject(object[prop]) && isObjectLike(object)) {
                keys.push(...ToolKit.getObjectKeysDeep(object[prop], propName));
            }
        }

        return keys;
    }

    static mapToShallowObject(target: any, src: any, filterPredicate?: (key: string, value: any) => boolean): void {
        if (!ToolKit.isObject(target) || !ToolKit.isObject(src)) { return; }

        let predicate = (key: string, value: any): boolean => true;
        if (ToolKit.isFunction(filterPredicate)) {
            predicate = filterPredicate as (key: string, value: any) => boolean;
        }

        Object.keys(src)
            .filter(key => Object.keys(target).includes(key))
            .reduce((obj, key) => {
                if (predicate(key, obj)) {
                    obj[key] = src[key];
                }

                return obj;
            }, target);
    }

    static mapToDeepObject(target: any, src: any, options: MapOptions = { transformIsoToDate: false, strictMapping: false, ignoreStrictMappingWhenNull: true }): void {
        if (!ToolKit.isObject(target) || !ToolKit.isObject(src)) { return; }
        const defaultOptions = { transformIsoToDate: false, strictMapping: false, ignoreStrictMappingWhenNull: true };
        const internalOptions = options || defaultOptions;

        if (ToolKit.isUndefinedOrNull(options.transformIsoToDate)) { options.transformIsoToDate = defaultOptions.transformIsoToDate; }
        if (ToolKit.isUndefinedOrNull(options.strictMapping)) { options.strictMapping = defaultOptions.strictMapping; }
        if (ToolKit.isUndefinedOrNull(options.ignoreStrictMappingWhenNull)) { options.ignoreStrictMappingWhenNull = defaultOptions.ignoreStrictMappingWhenNull; }

        if (internalOptions.strictMapping === true) {
            const missingProperties = ToolKit.diffCollection(
                ToolKit.getObjectKeysDeep(target),
                ToolKit.getObjectKeysDeep(src),
                internalOptions.ignoreStrictMappingWhenNull === true ?
                    {
                        alternativeFormat: (item) => {
                            if (ToolKit.isString(item)) { return item.split('.')[0]; }
                            return item;
                        }
                    }
                    : undefined
            );
            if (missingProperties.length > 0) {
                throw new Error(`${ToolKit.getClassName(ToolKit)} -> ${ToolKit.getClassMethodName(ToolKit, ToolKit.mapToDeepObject)}: source object's properties doen't match the target object: ${missingProperties.join(', ')}.`);
            }
        }

        innerMapToDeepObject(target, src, internalOptions);
    }

    static getPropertySafe(obj: any, propertyAccessor: string): any | undefined {
        if (!ToolKit.isString(propertyAccessor)) {
            return null;
        }
        let retValue = propertyAccessor.split('.').reduce((acc, part) => acc && acc[part], obj)

        return retValue || null;
    }

    static cast<T>(arg: any): T {
        return arg as T;
    }


    static quickClone<T>(arg: T): T | null {
        try {
            return JSON.parse(JSON.stringify(arg));
        }
        catch (error) {
            return null;
        }
    }
}