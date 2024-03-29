import md5 from 'md5'
import qs from 'qs'

export const VERSION = '1.1'
/**
 *  JavaScript 对象按照 key 的升序排列
 *
 * @author CaoMeiYouRen
 * @date 2023-03-24
 * @template T
 * @param obj
 */
export function sortObjectKeys<T = Record<string, unknown>>(obj: T): T {
    if (typeof obj !== 'object' || obj === null || obj instanceof Date) { // 排除非 object 对象、null、Date
        return obj
    }
    if (Array.isArray(obj)) {
        obj.sort()
        const newObj = obj.map((e) => sortObjectKeys(e))
        return newObj as T
    }
    // 获取对象的 key 列表并按照升序排序
    const keys = Object.keys(obj).sort()
    // 创建一个新的对象
    const newObj = {}
    // 遍历排序后的 key 列表，将 key 和 value 组成一个新的对象
    for (const key of keys) {
        newObj[key] = sortObjectKeys(obj[key]) // 递归排序
    }
    // 返回新的对象
    return newObj as T
}

export type PrimitiveValues = string | number | boolean

export type PrimitiveObject<T> = {
    [K in keyof T as T[K] extends PrimitiveValues ? K : never]: T[K];
}

/**
 * 返回一个新对象，该对象中只包含原始对象中的基础类型值（字符串、数字、布尔值）
 *
 * @author CaoMeiYouRen
 * @date 2023-11-18
 * @export
 * @template T
 * @param obj
 * @param [excludeDate=false] 是否排除 Date 类型，默认将 Date 也返回
 */
export function getPrimitiveValues<T = Record<string, unknown>>(obj: T, excludeDate: boolean = false) {
    const result: any = {}
    for (const key in obj) {
        if (typeof obj[key] === 'string' || typeof obj[key] === 'number' || typeof obj[key] === 'boolean' || !excludeDate && obj[key] instanceof Date) {
            result[key] = obj[key]
        }
    }
    return result as PrimitiveObject<T>
}

/**
 * 转换对象到查询字符串
 *
 * @author CaoMeiYouRen
 * @date 2023-11-18
 * @export
 * @template T
 * @param obj
 */
export function queryStringStringify<T = Record<string, unknown>>(obj: T) {
    return qs.stringify(obj)
}

export interface SignOption {
    payload: Record<string, unknown>
    signKey: string
    timestamp?: number
    /**
     * 仅校验基础类型
     */
    primitiveOnly?: boolean
    /**
     * 是否排除 Date 类型
     */
    excludeDate?: boolean
}

export interface SignResult {
    timestamp: number
    sign: string
    method: string
    version: string
    /**
     * 字符串化后的 payload
     */
    payloadStr: string
    /**
     * md5 前的数据
     */
    rawSign: string
}

/**
 * 获取签名
 *
 * @author CaoMeiYouRen
 * @date 2023-03-25
 * @export
 * @param payload
 * @param signKey
 * @param [timestamp=Date.now()]
 */
export function getSign(option: SignOption): SignResult {
    const { payload, signKey, timestamp = Date.now(), primitiveOnly = false, excludeDate = false } = option
    let _payload = payload
    if (primitiveOnly) {
        _payload = getPrimitiveValues(_payload, excludeDate)
    }
    _payload = sortObjectKeys(_payload)
    const payloadStr = queryStringStringify(_payload)
    // console.log('payloadStr', payloadStr, '_payload', _payload)
    const rawSign = `${timestamp}\n${payloadStr}\n${signKey}`
    const sign: string = md5(rawSign)
    return {
        timestamp,
        sign,
        method: 'md5',
        version: VERSION,
        payloadStr,
        rawSign,
    }
}

export interface CheckSignOption {
    sign: string
    timestamp: number
    payload: Record<string, unknown>
    signKey: string
    method?: string
    version?: string
    /**
     * 仅校验基础类型
     */
    primitiveOnly?: boolean
}

/**
 *
 * 校验签名是否通过，通过为 true
 * @author CaoMeiYouRen
 * @date 2023-03-25
 * @export
 * @param sign
 * @param data
 */
export function checkSign(data: CheckSignOption): boolean {
    const { sign, timestamp, payload, signKey, method = 'md5', version = VERSION, primitiveOnly = false } = data
    if (method !== 'md5') {
        throw new Error('不支持的签名校验方法！')
    }
    if (version !== VERSION) {
        throw new Error('不支持的签名校验版本！')
    }
    const newSign = getSign({ payload, signKey, timestamp, primitiveOnly })
    return newSign.sign === sign
}
