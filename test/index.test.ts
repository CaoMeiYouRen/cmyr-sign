import qs from 'qs'
import md5 from 'md5'
import { sortObjectKeys, getSign, checkSign, VERSION } from '../src'

describe('校验sortObjectKeys', () => {
    test('应当按升序对对象键进行排序', () => {
        const obj = { b: 2, a: 1 }
        const sortedObj = sortObjectKeys(obj)
        expect(Object.keys(sortedObj)).toEqual(['a', 'b'])
    })

    test('应当返回一个新对象', () => {
        const obj = { b: 2, a: 1 }
        const sortedObj = sortObjectKeys(obj)
        expect(sortedObj).not.toBe(obj)
    })

    test('应当不修改原始对象', () => {
        const obj = { b: 2, a: 1 }
        sortObjectKeys(obj)
        expect(obj).toEqual({ b: 2, a: 1 })
    })
})

describe('校验getSign', () => {
    test('返回值类型应当正确', () => {
        const payload = { a: 1, b: 2 }
        const signKey = '123456'
        const signResult = getSign(payload, signKey)
        expect(signResult).toEqual({
            timestamp: expect.any(Number),
            sign: expect.any(String),
            method: 'md5',
            version: VERSION,
        })
    })

    test('应当优先使用传入的时间戳', () => {
        const payload = { a: 1, b: 2 }
        const signKey = '123456'
        const timestamp = Date.now()
        const signResult = getSign(payload, signKey, timestamp)
        expect(signResult.timestamp).toBe(timestamp)
    })

    test('应当正确获得签名', () => {
        const payload = { a: 1, b: 2 }
        const signKey = '123456'
        const timestamp = Date.now()
        const signResult = getSign(payload, signKey, timestamp)
        const payloadStr = qs.stringify(sortObjectKeys(payload))
        const rawSign = `${timestamp}\n${payloadStr}\n${signKey}`
        const expectedSign = md5(rawSign)
        expect(signResult.sign).toBe(expectedSign)
    })

})

describe('校验checkSign', () => {
    const signKey = '123456'
    const timestamp = 1680708858558
    const payload = { a: 1, b: 2 }
    const sign = '960dc290967e63d85baf758dd82f43ba'
    const data = { signKey, timestamp, payload, version: VERSION }
    test('签名正确时应返回true', () => {
        expect(checkSign(sign, data)).toBe(true)
    })
    test('签名不正确时应返回false', () => {
        expect(checkSign('wrong-sign', data)).toBe(false)
    })
    test('使用不受支持的签名验证方法时应引发错误', () => {
        expect(() => checkSign(sign, { ...data, method: 'sha256' })).toThrowError('不支持的签名校验方法！')
    })
    test('使用不受支持的版本号时应引发错误', () => {
        expect(() => checkSign(sign, { ...data, version: '2.0' })).toThrowError('不支持的签名校验方法！')
    })
})
