'use strict';

/**
 * Put some code to 'app/scripts/task-manager.js'.
 * Make all unit tests passing.
 *
 * @author Piotr Kowalski <piecioshka@gmail.com> https://piecioshka.pl
 * @version 1.0.0
 * @license MIT
 * @see https://github.com/piecioshka/training-implement-task-manager
 */

// -----------------------------------------------------------------------------
//
// DO NOT MODIFY THIS FILE.
//
// -----------------------------------------------------------------------------

function toString(data) {
    return Object.prototype.toString.call(data);
}

QUnit.config.reorder = false;

QUnit.module('TaskManager', function () {
    QUnit.module('General', function () {
        QUnit.test('should be defined in global scope', function (assert) {
            assert.ok(
                typeof TaskManager !== 'undefined',
                'Define TaskManager in Window, global object.'
            );
        });

        QUnit.test('should be a function', function (assert) {
            assert.strictEqual(
                typeof TaskManager,
                'function',
                'Change "window.TaskManager" to function.'
            );
        });

        QUnit.test('should be a constructor (not an arrow function)', function (assert) {
            try {
                new TaskManager();
                assert.ok(true);
            } catch (e) {
                assert.ok(false, 'Change window.TaskManager to function.');
            }
        });
    });

    QUnit.module('API', function (hooks) {
        hooks.beforeEach(function () {
            this.tasks = new TaskManager();
        });

        QUnit.module('getList', function () {
            QUnit.test('should be a function', function (assert) {
                assert.strictEqual(
                    typeof this.tasks.getList,
                    'function',
                    'We create object using your TaskManager constructor. Now that object should have "getList" function. Maybe you can add thad function to "prototype"?'
                );
            });

            QUnit.test('should return an array', function (assert) {
                assert.strictEqual(
                    toString(this.tasks.getList()),
                    '[object Array]',
                    'Function must returns an array. For now, this array could be empty.'
                );
            });

            QUnit.test('the new instance of TaskManager should have an empty queue', function (assert) {
                assert.strictEqual(
                    this.tasks.getList().length,
                    0,
                    'Initially array should be empty'
                );
            });
        });

        QUnit.module('addTask', function () {
            QUnit.test('should be a function', function (assert) {
                assert.strictEqual(
                    typeof this.tasks.addTask,
                    'function',
                    'TaskManager instance should have "addTask" function (the same situation as "getList")'
                );
            });

            QUnit.test('expected 3 arguments: name, callback, context', function (assert) {
                assert.strictEqual(
                    this.tasks.addTask.length,
                    3,
                    'You should define 3 arguments in definition of "addTask" function: name (string), callback (Function), context (object)'
                );
            });
        });

        QUnit.module('run', function () {
            QUnit.test('should be a function', function (assert) {
                assert.strictEqual(
                    typeof this.tasks.run,
                    'function',
                    'TaskManager instance should have "run" function (the same situation as "addTask")'
                );
            });
        });
    });

    QUnit.module('Behaviour', function (hooks) {
        hooks.beforeEach(function () {
            this.fake = {
                bar: function () {
                    this.step('the function from the first task has executed');
                },
                baz: function () {
                    this.step('the function from the second task has executed');
                },
                qux: function () {
                    this.step('the function from the third task has executed');
                }
            };

            this.tasks = new TaskManager();
        });

        QUnit.test('the "addTask" method should append items to the list of tasks', function (assert) {
            let queue = this.tasks.getList();
            let mockName = 'example-name';
            let mockFunction = function () {
            };
            let mockContext = this;

            assert.strictEqual(
                queue.length,
                0,
                'The initial list of task is empty.'
            );

            this.tasks.addTask(mockName, mockFunction, mockContext);

            assert.strictEqual(
                queue.length,
                1,
                'After adding one task to the empty list, the list should contain one task (object).'
            );

            assert.strictEqual(
                typeof queue[0].name,
                'string',
                'First element should have a string property called "name".'
            );
            assert.strictEqual(
                queue[0].name,
                mockName,
                'Property "name" should be the first parameter of the "addTask" function.'
            );

            assert.strictEqual(
                typeof queue[0].callback,
                'function',
                'The first element should have a function property named "callback".'
            );
            assert.strictEqual(
                queue[0].callback,
                mockFunction,
                'The property "callback" should be the second parameter of the "addTask" function.'
            );

            assert.strictEqual(
                typeof queue[0].context,
                'object',
                'First element should have an object property named "context".'
            );
            assert.strictEqual(
                queue[0].context,
                mockContext,
                'The property "context" should be the third parameter of the "addTask" function.'
            );
        });

        QUnit.test('the callback for the first task should be executed when the "run" function is called', function (assert) {
            this.tasks.addTask('task 1', this.fake.bar.bind(assert));
            this.tasks.run();

            assert.verifySteps(
                [
                    'the function from the first task has executed'
                ],
                'Method "run" should execute all callback\'s in loop (ex. forEach).'
            );
        });

        QUnit.test('each task item should have its callback executed via the "run" function', function (assert) {
            this.tasks.addTask('task 2', this.fake.bar.bind(assert));
            this.tasks.addTask('task 3', this.fake.baz.bind(assert));
            this.tasks.addTask('task 4', this.fake.qux.bind(assert));

            this.tasks.run();

            assert.verifySteps([
                'the function from the first task has executed',
                'the function from the second task has executed',
                'the function from the third task has executed'
            ]);
        });

        QUnit.test('should run with the context that was passed', function (assert) {
            let fake = this.fake;
            this.tasks.addTask('task 5', function () {
                assert.strictEqual(
                    this,
                    fake,
                    'The context (this) of the executed "callback" should be equal to the object which was passed through the "add" function as third argument'
                );
            }, fake);

            this.tasks.run();
        });
    });
});
