import qs from 'qs'
import md5 from 'md5'
import { sortObjectKeys, getSign, checkSign, VERSION, getPrimitiveValues } from '../src'

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

describe('校验getPrimitiveValues', () => {
    it('如果输入对象为空，则应返回一个空对象', () => {
        expect(getPrimitiveValues({})).toEqual({})
    })

    it('应返回仅具有基础类型值的对象', () => {
        const input = {
            name: 'John Doe',
            age: 42,
            isMarried: true,
            address: {
                street: '123 Main St',
                city: 'Anytown',
                state: 'CA',
                zip: 12345,
            },
        }
        const expected = {
            name: 'John Doe',
            age: 42,
            isMarried: true,
        }
        expect(getPrimitiveValues(input)).toEqual(expected)
    })

    it('即使某些值为null或未定义，也应返回仅具有基础类型值的对象', () => {
        const input = {
            name: null,
            age: undefined,
            isMarried: true,
            address: {
                street: '123 Main St',
                city: 'Anytown',
                state: 'CA',
                zip: 12345,
            },
        }
        const expected = {
            isMarried: true,
        }
        expect(getPrimitiveValues(input)).toEqual(expected)
    })
})

describe('校验getSign', () => {
    test('返回值类型应当正确', () => {
        const payload = { a: 1, b: 2 }
        const signKey = '123456'
        const signResult = getSign({ payload, signKey })
        expect(signResult).toEqual({
            timestamp: expect.any(Number),
            sign: expect.any(String),
            method: 'md5',
            version: VERSION,
        })
    })

    it('应仅返回带有基础类型值的签名结果', () => {
        const option = {
            payload: {
                name: 'John Doe',
                age: 42,
                isMarried: true,
                address: {
                    street: '123 Main St',
                    city: 'Anytown',
                    state: 'CA',
                    zip: 12345,
                },
            },
            signKey: 'secret',
            primitiveOnly: true,
        }
        const expected = {
            timestamp: expect.any(Number),
            sign: expect.any(String),
            method: 'md5',
            version: VERSION,
        }
        expect(getSign(option)).toEqual(expected)
    })

    test('应当优先使用传入的时间戳', () => {
        const payload = { a: 1, b: 2 }
        const signKey = '123456'
        const timestamp = Date.now()
        const signResult = getSign({ payload, signKey, timestamp })
        expect(signResult.timestamp).toBe(timestamp)
    })

    test('应当正确获得签名', () => {
        const payload = { a: 1, b: 2 }
        const signKey = '123456'
        const timestamp = Date.now()
        const signResult = getSign({ payload, signKey, timestamp })
        const payloadStr = qs.stringify(sortObjectKeys(payload))
        const rawSign = `${timestamp}\n${payloadStr}\n${signKey}`
        const expectedSign = md5(rawSign)
        expect(signResult.sign).toBe(expectedSign)
    })

    it('应返回带有排序键的签名结果', () => {
        const option = {
            payload: {
                name: 'John Doe',
                age: 42,
                isMarried: true,
                address: {
                    street: '123 Main St',
                    city: 'Anytown',
                    state: 'CA',
                    zip: 12345,
                },
            },
            signKey: 'secret',
        }
        const result = getSign(option)
        const payloadStr = qs.stringify(sortObjectKeys(option.payload))
        const rawSign = `${result.timestamp}\n${payloadStr}\n${option.signKey}`
        const expectedSign = md5(rawSign)
        expect(result.sign).toEqual(expectedSign)
    })

})

describe('校验checkSign', () => {
    const signKey = '123456'
    const timestamp = 1680708858558
    const payload = { a: 1, b: 2 }
    const sign = '960dc290967e63d85baf758dd82f43ba'
    const data = { sign, signKey, timestamp, payload, version: VERSION }
    test('签名正确时应返回true', () => {
        expect(checkSign(data)).toBe(true)
    })
    test('签名不正确时应返回false', () => {
        expect(checkSign({ ...data, sign: 'wrong-sign' })).toBe(false)
    })
    test('使用不受支持的签名验证方法时应引发错误', () => {
        expect(() => checkSign({ ...data, method: 'sha256' })).toThrowError('不支持的签名校验方法！')
    })
    test('使用不受支持的版本号时应引发错误', () => {
        expect(() => checkSign({ ...data, version: '2.0' })).toThrowError('不支持的签名校验版本！')
    })
})

describe('校验checkSign(仅校验基础类型)', () => {
    const signKey = '123456'
    const timestamp = 1680708858558
    const payload = {
        a: 1,
        b: 'Anytown',
        c: true,
        d: {
            name: 'John Doe',
            age: 42,
        },
        e: [{
            name: 'John Doe',
            age: 42,
        }],
    }
    const sign = '23e26f4d9e935569e16ef379952067b9'
    const primitiveOnlySign = '489a09eec46a15e35bf168089c75919f'
    const data = { sign, signKey, timestamp, payload, version: VERSION }
    // console.log('sign1', getSign({ payload, signKey, timestamp, primitiveOnly: false }))
    // console.log('sign2', getSign({ payload, signKey, timestamp, primitiveOnly: true }))
    test('默认处理所有值', () => {
        expect(checkSign(data)).toBe(true)
    })
    test('仅校验基础类型', () => {
        expect(checkSign({ ...data, primitiveOnly: true, sign: primitiveOnlySign })).toBe(true)
    })
})
