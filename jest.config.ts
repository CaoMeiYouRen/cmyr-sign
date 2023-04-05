import { Config } from 'jest'

export default {
    preset: 'ts-jest',
    clearMocks: true,
    coverageDirectory: 'coverage',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'json', 'mjs', 'cjs'],
    moduleDirectories: ['node_modules', 'src'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    // rootDir: 'src',
    testRegex: '.test.ts$',
    transform: {
        '^.+\\.(t|j)s$': ['ts-jest', {
            // 指定ts-jest使用的tsconfig配置
            tsconfig: 'tsconfig.json',
        }],
    },
} as Config
