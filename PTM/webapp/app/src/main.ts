import { sayHello } from './hello'

function showHello(name: string) {
    console.log(sayHello(name));
}

showHello("TypeScript");
