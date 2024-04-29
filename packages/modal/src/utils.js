export const emptyFn = () => {
};

export const deferred = () => {
    let resolve;
    let reject;
    const promise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });

    return { promise, reject, resolve };
};

export const data_get = (obj, key) => {
    if (obj.hasOwnProperty(key)) {
        return obj[key];
    }

    const segments = key.split('.');

    let tmp = obj;
    while (segments.length > 0) {
        const segment = segments.shift();
        if (!tmp[segment]) {
            return key;
        }

        tmp = tmp[segment];
    }

    return tmp;
};

export function deepMerge(...objects) {
    const isObject = (obj) => obj && typeof obj === 'object';

    function deepMergeInner(target, source) {
        Object.keys(source).forEach((key) => {
            const targetValue = target[key];
            const sourceValue = source[key];

            if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
                target[key] = targetValue.concat(sourceValue);
            } else if (isObject(targetValue) && isObject(sourceValue)) {
                target[key] = deepMergeInner(Object.assign({}, targetValue), sourceValue);
            } else {
                target[key] = sourceValue;
            }
        });

        return target;
    }

    if (objects.length < 2) {
        throw new Error('deepMerge: this function expects at least 2 objects to be provided');
    }

    if (objects.some(object => !isObject(object))) {
        throw new Error('deepMerge: all values should be of type "object"');
    }

    const target = objects.shift();
    let source;

    while (source = objects.shift()) {
        deepMergeInner(target, source);
    }

    return target;
}
