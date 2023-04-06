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
    // 获取对象的 key 列表并按照升序排序
    const keys = Object.keys(obj).sort()
    // 创建一个新的对象
    const newObj = {}
    // 遍历排序后的 key 列表，将 key 和 value 组成一个新的对象
    for (const key of keys) {
        newObj[key] = obj[key]
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
 * @date 2023-04-06
 * @template T
 * @param obj
 */
export function getPrimitiveValues<T = Record<string, unknown>>(obj: T) {
    const result: any = {}
    for (const key in obj) {
        if (typeof obj[key] === 'string' || typeof obj[key] === 'number' || typeof obj[key] === 'boolean') {
            result[key] = obj[key]
        }
    }
    return result as PrimitiveObject<T>
}

export interface SignOption {
    payload: Record<string, unknown>
    signKey: string
    timestamp?: number
    /**
     * 仅校验基础类型
     */
    primitiveOnly?: boolean
}

export interface SignResult {
    timestamp: number
    sign: string
    method: string
    version: string
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
    const { payload, signKey, timestamp = Date.now(), primitiveOnly = false } = option
    let _payload = payload
    if (primitiveOnly) {
        _payload = getPrimitiveValues(_payload)
    }
    _payload = sortObjectKeys(_payload)
    const payloadStr = qs.stringify(_payload)
    // console.log('payloadStr', payloadStr, '_payload', _payload)
    const rawSign = `${timestamp}\n${payloadStr}\n${signKey}`
    const sign: string = md5(rawSign)
    return {
        timestamp,
        sign,
        method: 'md5',
        version: VERSION,
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
