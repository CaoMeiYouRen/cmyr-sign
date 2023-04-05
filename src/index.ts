import md5 from 'md5'
import qs from 'qs'

export const VERSION = '1.0'
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
export function getSign(payload: Record<string, unknown>, signKey: string, timestamp = Date.now()): SignResult {
    const payloadStr = qs.stringify(sortObjectKeys(payload))
    const rawSign = `${timestamp}\n${payloadStr}\n${signKey}`
    const sign: string = md5(rawSign)
    return {
        timestamp,
        sign,
        method: 'md5',
        version: VERSION,
    }
}

export interface SignConfig {
    timestamp: number
    payload: Record<string, unknown>
    signKey: string
    method?: string
    version: string
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
export function checkSign(sign: string, data: SignConfig): boolean {
    const { timestamp, payload, signKey, method = 'md5', version = VERSION } = data
    if (method !== 'md5') {
        throw new Error('不支持的签名校验方法！')
    }
    if (version !== '1.0') {
        throw new Error('不支持的签名校验方法！')
    }
    const newSign = getSign(payload, signKey, timestamp)
    return newSign.sign === sign
}
