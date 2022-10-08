import { describe } from 'mocha';
import { getScope } from '../common/driver';
import basicAuth from './_basic';

const { scenario: { authType } } = getScope();

if (authType === 'basic') {
    describe("integration tests with basic authentication", basicAuth);
} else {
    console.error('Unknown authType=', authType);
}