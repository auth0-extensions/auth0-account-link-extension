const _ = require('lodash');
const { expect } = require('chai');
const humanizeArray = require('../../lib/humanize');

describe('Humanizer Tests', () => {
    it('represents an array of string as a readable sentence using defaults', () => {
        const testArray = ['a', 'b', 'c'];
        const result = humanizeArray(testArray)

        expect(result).to.equal('a, b and c');
    });

    it('represents an array of two elements as a readable sentence using defaults', () => {
        const testArray = ['a', 'b'];
        const result = humanizeArray(testArray);

        expect(result).to.equal('a and b');
    });

    it('represents an array of two elements as a readable sentence using a given beforeLast', () => {
        const testArray = ['a', 'b'];
        const result = humanizeArray(testArray, 'or');

        expect(result).to.equal('a or b');
    });

    it('represents an array of two elements as a readable sentence using a given beforeLast and oxfordComma', () => {
        const testArray = ['a', 'b'];
        const result = humanizeArray(testArray, 'or', ',');

        expect(result).to.equal('a or b');
    });

    it('represents an array of string as a readable sentence using a given beforeLast', () => {
        const testArray = ['a', 'b', 'c'];
        const result = humanizeArray(testArray, 'or')

        expect(result).to.equal('a, b or c');
    });

    it('represents an array of string as a readable sentence using given beforeLast and oxfordComma', () => {
        const testArray = ['a', 'b', 'c'];
        const result = humanizeArray(testArray, 'or', ',')

        expect(result).to.equal('a, b, or c');
    });

    it('returns an empty string if the array is empty', () => {
        expect(humanizeArray([])).to.equal('');
    })

    it('returns the first item of the array if it has one item', () => {
        const result = humanizeArray(['foo']);
        expect(result).to.equal('foo');
    })
});
