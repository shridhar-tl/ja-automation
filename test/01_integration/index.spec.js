import { describe } from 'mocha';
import { getScope } from '../common/driver';
import sessionAuth from './_session';
import basicAuth from './_basic';
import oAuth from './_oAuth';

const { scenario: { authType } } = getScope();

if (authType === 'basic') {
    describe("integration tests with basic authentication", basicAuth);
} else if (authType === 'oauth') {
    describe("integration tests with oauth cloud", oAuth);
} else if (authType === 'session') {
    describe("integration tests with session authentication", sessionAuth);
} else {
    console.error('Unknown authType=', authType);
}