/*
 * @Author: wufengliang 44823912@qq.com
 * @Date: 2024-04-07 15:41:18
 * @LastEditTime: 2024-04-07 16:42:12
 * @Description: 
 */
import typescript from 'rollup-plugin-typescript2';
import * as path from 'node:path';

const paths = {
    '@': [path.join('./', './src')],
}

console.log(paths);

export default {
    input: './src/index.ts',
    output: {
        file: './dist/auxiliary.iife.js',
        format: 'umd',
        name: 'auxiliary'
    },
    plugins: [
        typescript({
            tsconfig: "tsconfig.json",
            useTsconfigDeclarationDir: true,
            tsconfigOverride: {
                compilerOptions: {
                    declaration: true,
                    removeComments: true,
                    module: 'ES2015',
                    moduleResolution: 'node',
                    paths
                }
            },
            include: ['*.ts+(|x)', '**/*.ts+(|x)', '../**/*.ts+(|x)']
        }),
    ]
}