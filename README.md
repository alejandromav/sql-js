# SQLjs
SQL interface for JS language

## Dependencies
`[sudo] npm i -g mocha`

## Usage

```javascript
import query from 'sqljs'

var persons = [
    {name: 'Peter', profession: 'teacher', age: 20, maritalStatus: 'married'},
    {name: 'Michael', profession: 'teacher', age: 50, maritalStatus: 'single'},
    {name: 'Peter', profession: 'teacher', age: 20, maritalStatus: 'married'},
    {name: 'Anna', profession: 'scientific', age: 20, maritalStatus: 'married'},
    {name: 'Rose', profession: 'scientific', age: 50, maritalStatus: 'married'},
    {name: 'Anna', profession: 'scientific', age: 20, maritalStatus: 'single'},
    {name: 'Anna', profession: 'politician', age: 50, maritalStatus: 'married'}
];
const isTeacher = (person) => return person.profession === 'teacher';
const professionGroup = (group) => return group[0];
const name = (person) => return person.name;

let resultSet = query().select().from(persons).groupBy(profession, name).execute();
```
