import { destroyScope } from "../common/driver";

before(function () {
    console.log('Started executing test:');
});

after(async function () {
    await destroyScope();
    console.log('Completed executing test');
});