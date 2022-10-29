import moment from "moment";
import { destroyScope } from "../common/driver";

before(function () {
    console.log('Started executing test:');

    moment.locale('en', { week: { dow: 0 } });
});

after(async function () {
    await destroyScope();
    console.log('Completed executing test');
});