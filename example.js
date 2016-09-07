import { query } from 'sqljs';

const persons = [
    { name: 'Han',    profession: 'Smuggler', age: 30 },
    { name: 'Luke',   profession: 'Hero',     age: 32 },
    { name: 'Leia',   profession: 'Princess', age: 32 },
    { name: 'Anakin', profession: 'Jedi',     age: 50 },
    { name: 'Obi',    profession: 'Jedi',     age: 65 },
    { name: 'Chewie', profession: 'Smuggler', age: 30 },
    { name: 'Lando',  profession: 'Smuggler', age: 50 }
];
const isJedi = (person) => person.profession === 'Jedi';
const professionGroup = (group) => group[0];
const name = (person) => person.name;
const profession = (person) => person.profession;

let resultSet = query().select().from(persons).where(isJedi).groupBy(profession, name).execute();
console.log(resultSet);
