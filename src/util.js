import {
    init,
    datasetModule,
    classModule,
    attributesModule,
    styleModule,
    propsModule, eventListenersModule
} from 'snabbdom';

const patch = init(
    [datasetModule, classModule, attributesModule, styleModule, propsModule, eventListenersModule],
    undefined,
    {experimental: {fragments: true}}
);

export {patch};
