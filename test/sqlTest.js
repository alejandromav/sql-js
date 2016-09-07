// https://www.codewars.com/kata/functional-sql/
var Test = require('./../lib/Test').Test;
var query = require('./../index').query;

//  TESTS
Test.describe("SQL tests", function() {
    Test.it("Basic SELECT tests", function() {
      var numbers = [1, 2, 3];
      Test.assertSimilar(query().select().from(numbers).execute(), numbers);
      Test.assertSimilar(query().select().execute(), [], 'No FROM clause produces empty array');
      Test.assertSimilar(query().from(numbers).execute(), numbers, 'SELECT can be omited');
      Test.assertSimilar(query().execute(), []);
      Test.assertSimilar(query().from(numbers).select().execute(), numbers, 'The order does not matter');
    });
    Test.it("Basic SELECT and WHERE over objects", function() {
      var persons = [
        {name: 'Peter', profession: 'teacher', age: 20, maritalStatus: 'married'},
        {name: 'Michael', profession: 'teacher', age: 50, maritalStatus: 'single'},
        {name: 'Peter', profession: 'teacher', age: 20, maritalStatus: 'married'},
        {name: 'Anna', profession: 'scientific', age: 20, maritalStatus: 'married'},
        {name: 'Rose', profession: 'scientific', age: 50, maritalStatus: 'married'},
        {name: 'Anna', profession: 'scientific', age: 20, maritalStatus: 'single'},
        {name: 'Anna', profession: 'politician', age: 50, maritalStatus: 'married'}
      ];

      Test.assertSimilar(query().select().from(persons).execute(), persons);

      function profession(person) {
        return person.profession;
      }

      //SELECT profession FROM persons
      Test.assertSimilar(query().select(profession).from(persons).execute(),  ["teacher","teacher","teacher","scientific","scientific","scientific","politician"]);
      Test.assertSimilar(query().select(profession).execute(), [], 'No FROM clause produces empty array');


      function isTeacher(person) {
        return person.profession === 'teacher';
      }

      //SELECT profession FROM persons WHERE profession="teacher"
      Test.assertSimilar(query().select(profession).from(persons).where(isTeacher).execute(), ["teacher", "teacher", "teacher"]);


      //SELECT * FROM persons WHERE profession="teacher"
      Test.assertSimilar(query().from(persons).where(isTeacher).execute(), persons.slice(0, 3));

      function name(person) {
        return person.name;
      }

      //SELECT name FROM persons WHERE profession="teacher"
      Test.assertSimilar(query().select(name).from(persons).where(isTeacher).execute(), ["Peter", "Michael", "Peter"]);
      Test.assertSimilar(query().where(isTeacher).from(persons).select(name).execute(), ["Peter", "Michael", "Peter"]);

    });

    Test.it('GROUP BY tests', function() {

      var persons = [
        {name: 'Peter', profession: 'teacher', age: 20, maritalStatus: 'married'},
        {name: 'Michael', profession: 'teacher', age: 50, maritalStatus: 'single'},
        {name: 'Peter', profession: 'teacher', age: 20, maritalStatus: 'married'},
        {name: 'Anna', profession: 'scientific', age: 20, maritalStatus: 'married'},
        {name: 'Rose', profession: 'scientific', age: 50, maritalStatus: 'married'},
        {name: 'Anna', profession: 'scientific', age: 20, maritalStatus: 'single'},
        {name: 'Anna', profession: 'politician', age: 50, maritalStatus: 'married'}
      ];

      function profession(person) {
        return person.profession;
      }

      //SELECT * FROM persons GROUPBY profession <- Bad in SQL but possible in JavaScript
      Test.assertSimilar(query().select().from(persons).groupBy(profession).execute(), [["teacher",[{"name":"Peter","profession":"teacher","age":20,"maritalStatus":"married"},{"name":"Michael","profession":"teacher","age":50,"maritalStatus":"single"},{"name":"Peter","profession":"teacher","age":20,"maritalStatus":"married"}]],["scientific",[{"name":"Anna","profession":"scientific","age":20,"maritalStatus":"married"},{"name":"Rose","profession":"scientific","age":50,"maritalStatus":"married"},{"name":"Anna","profession":"scientific","age":20,"maritalStatus":"single"}]],["politician",[{"name":"Anna","profession":"politician","age":50,"maritalStatus":"married"}]]]);

      function isTeacher(person) {
        return person.profession === 'teacher';
      }

      //SELECT * FROM persons WHERE profession='teacher' GROUPBY profession
      Test.assertSimilar(query().select().from(persons).where(isTeacher).groupBy(profession).execute(),  [["teacher",[{"name":"Peter","profession":"teacher","age":20,"maritalStatus":"married"},{"name":"Michael","profession":"teacher","age":50,"maritalStatus":"single"},{"name":"Peter","profession":"teacher","age":20,"maritalStatus":"married"}]]]);

      function professionGroup(group) {
        return group[0];
      }

      //SELECT profession FROM persons GROUPBY profession
      Test.assertSimilar(query().select(professionGroup).from(persons).groupBy(profession).execute(), ["teacher","scientific","politician"]);

      function name(person) {
        return person.name;
      }

      //SELECT * FROM persons WHERE profession='teacher' GROUPBY profession, name
      Test.assertSimilar(query().select().from(persons).groupBy(profession, name).execute(),  [["teacher",[["Peter",[{"name":"Peter","profession":"teacher","age":20,"maritalStatus":"married"},{"name":"Peter","profession":"teacher","age":20,"maritalStatus":"married"}]],["Michael",[{"name":"Michael","profession":"teacher","age":50,"maritalStatus":"single"}]]]],["scientific",[["Anna",[{"name":"Anna","profession":"scientific","age":20,"maritalStatus":"married"},{"name":"Anna","profession":"scientific","age":20,"maritalStatus":"single"}]],["Rose",[{"name":"Rose","profession":"scientific","age":50,"maritalStatus":"married"}]]]],["politician",[["Anna",[{"name":"Anna","profession":"politician","age":50,"maritalStatus":"married"}]]]]]);

      function age(person) {
        return person.age;
      }

      function maritalStatus(person) {
        return person.maritalStatus;
      }

      //SELECT * FROM persons WHERE profession='teacher' GROUPBY profession, name, age
      Test.assertSimilar(query().select().from(persons).groupBy(profession, name, age, maritalStatus).execute(), [["teacher",[["Peter",[[20,[["married",[{"name":"Peter","profession":"teacher","age":20,"maritalStatus":"married"},{"name":"Peter","profession":"teacher","age":20,"maritalStatus":"married"}]]]]]],["Michael",[[50,[["single",[{"name":"Michael","profession":"teacher","age":50,"maritalStatus":"single"}]]]]]]]],["scientific",[["Anna",[[20,[["married",[{"name":"Anna","profession":"scientific","age":20,"maritalStatus":"married"}]],["single",[{"name":"Anna","profession":"scientific","age":20,"maritalStatus":"single"}]]]]]],["Rose",[[50,[["married",[{"name":"Rose","profession":"scientific","age":50,"maritalStatus":"married"}]]]]]]]],["politician",[["Anna",[[50,[["married",[{"name":"Anna","profession":"politician","age":50,"maritalStatus":"married"}]]]]]]]]]);

      function professionCount(group) {
        return [group[0], group[1].length];
      }

      //SELECT profession, count(profession) FROM persons GROUPBY profession
      Test.assertSimilar(query().select(professionCount).from(persons).groupBy(profession).execute(),  [["teacher",3],["scientific",3],["politician",1]]);

      function naturalCompare(value1, value2) {
        if (value1 < value2) {
          return -1;
        } else if (value1 > value2) {
          return 1;
        } else {
          return 0;
        }
      }

      //SELECT profession, count(profession) FROM persons GROUPBY profession ORDER BY profession
      Test.assertSimilar(query().select(professionCount).from(persons).groupBy(profession).orderBy(naturalCompare).execute(), [["politician",1],["scientific",3],["teacher",3]]);
    });
});
