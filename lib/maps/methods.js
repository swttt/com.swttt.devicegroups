let methods = {
    none: {
        title: 'Ignore changes',
        description: 'Ignore changes to the to grouped devices',
        value: 'none',
        function: 'none'
    },
    mean: {
        title: 'Mean Average',
        description: 'The average your are used to (sum/count)',
        value: 'median',
        function: 'median'
    },
    median: {
        title: 'Median Average',
        description: 'The value of the device in the middle',
        value: 'median',
        function: 'median'
    },
    mode: {
        title: 'Mode Average',
        description: 'The value which the most devices has',
        value: 'mode',
        function: 'mode'
    },
    min: {
        title: 'Minimum value',
        description: 'The value of the device with the smallest value',
        value: 'min',
        function: 'min'
    },
    max:{
        title: 'Maximum value',
        description: 'The value of the device with the largest value',
        value: 'max',
        function: 'max'
    },
    sum: {
        title: 'Sum',
        description: 'THe sum of all the devices value',
        value: 'sum',
        function: 'sum'
    },
    all: {
        title: 'On for all',
        description: 'On if all devices are on. otherwise off',
        value: 'any',
        function: 'min'
    },
    any: {
        title: 'On for any',
        description: 'On if any devices are on',
        value: 'any',
        function: 'min'
    },
};

module.exports = methods;