/// <reference types="node" />
export declare const env: NodeJS.ProcessEnv;
export declare const culturemap: {
    plugins: any[];
    theme: {};
};
export declare const config: () => Promise<void>;
declare const _default: {
    config: () => Promise<void>;
    culturemap: {
        plugins: any[];
        theme: {};
    };
    env: NodeJS.ProcessEnv;
};
export default _default;
