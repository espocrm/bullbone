import dts from 'rollup-plugin-dts';

export default {
    input: 'dist/types/entry.d.ts',
    output: {
        file: 'dist/bullbone.d.ts',
        format: 'es'
    },
    plugins: [dts()]
};
