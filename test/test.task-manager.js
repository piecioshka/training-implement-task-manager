'use strict';

/**
 * Put some code to 'app/scripts/task-manager.js'.
 * Make all unit tests passing.
 *
 * @author Piotr Kowalski <piecioshka@gmail.com> https://piecioshka.pl
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

QUnit.module('TaskManager', () => {
    QUnit.module('General', () => {
        QUnit.test('should be defined in global scope', (assert) => {
            assert.ok(
                typeof TaskManager !== 'undefined',
                'window.TaskManager in not defined'
            );
        });

        QUnit.test('should be a function', (assert) => {
            assert.strictEqual(
                typeof TaskManager,
                'function',
                'window.TaskManager is not a function'
            );
        });

        QUnit.test('should be a constructor (not an arrow function)', (assert) => {
            try {
                new TaskManager();
                assert.ok(true);
            } catch (e) {
                assert.ok(false, 'window.TaskManager is not a constructor');
            }
        });
    });

    QUnit.module('API', (hooks) => {
        let tasks = null;

        hooks.beforeEach(() => {
            tasks = new TaskManager();
        });

        QUnit.module('getList', () => {
            QUnit.test('should be a function', (assert) => {
                assert.strictEqual(
                    typeof tasks.getList,
                    'function',
                    'TaskManager.prototype.getList is not a function'
                );
            });

            QUnit.test('should return an array', (assert) => {
                assert.strictEqual(
                    toString(tasks.getList()),
                    '[object Array]',
                    'TaskManager.prototype.getList() returns not an array'
                );
            });

            QUnit.test('should return empty array', (assert) => {
                assert.strictEqual(
                    tasks.getList().length,
                    0,
                    'TaskManager.prototype.getList() returns not empty array'
                );
            });
        });

        QUnit.module('addTask', () => {
            QUnit.test('should be a function', (assert) => {
                assert.strictEqual(
                    typeof tasks.addTask,
                    'function',
                    'TaskManager.prototype.addTask is not a function'
                );
            });

            QUnit.test('should expected 3 arguments: name, callback, context', (assert) => {
                assert.strictEqual(
                    tasks.addTask.length,
                    3,
                    'Arity of TaskManager.prototype.addTask is not equals 3'
                );
            });
        });

        QUnit.module('run', () => {
            QUnit.test('should be a function', (assert) => {
                assert.strictEqual(
                    typeof tasks.run,
                    'function',
                    'TaskManager.prototype.run is not a function'
                );
            });
        });
    });

    QUnit.module('Behaviour', (hooks) => {
        let tasks = null;
        let fake = null;

        hooks.beforeEach(() => {
            fake = {
                bar: function () {
                    this.step('the function from the first task have been executed');
                },
                baz: function () {
                    this.step('the function from the second task have been executed');
                },
                qux: function () {
                    this.step('the function from the third task have been executed');
                }
            };

            tasks = new TaskManager();
        });

        QUnit.test('the "addTask" method should append items to the list of tasks', (assert) => {
            const queue = tasks.getList();
            const mockName = 'example-name';
            const mockFunction = () => {
            };
            const mockContext = this;

            assert.strictEqual(
                queue.length,
                0,
                'TaskManager.prototype.getList() returns not empty array'
            );

            tasks.addTask(mockName, mockFunction, mockContext);

            assert.strictEqual(
                queue.length,
                1,
                'After adding one task to the empty list, number of items should equal 1'
            );

            assert.strictEqual(
                typeof queue[0].name,
                'string',
                'task has not string property called "name"'
            );
            assert.strictEqual(
                queue[0].name,
                mockName,
                'task has not property "name" equals first parameter of the TaskManager.prototype.addTask'
            );

            assert.strictEqual(
                typeof queue[0].callback,
                'function',
                'task has not function property called "callback"'
            );
            assert.strictEqual(
                queue[0].callback,
                mockFunction,
                'task has not property "callback" equals second parameter of the TaskManager.prototype.addTask'
            );

            assert.strictEqual(
                typeof queue[0].context,
                'object',
                'task has not function property called "context"'
            );
            assert.strictEqual(
                queue[0].context,
                mockContext,
                'task has not property "context" equals second parameter of the TaskManager.prototype.addTask'
            );
        });

        QUnit.test('the callback for the first task should be executed when the "run" function is called', (assert) => {
            tasks.addTask('task 1', fake.bar.bind(assert));
            tasks.run();

            assert.verifySteps(
                [
                    'the function from the first task have been executed'
                ],
                'TaskManager.prototype.run is not execute all callback\'s in loop (eg. Array.prototype.forEach).'
            );
        });

        QUnit.test('each task item should have its callback executed via the "run" function', (assert) => {
            tasks.addTask('task 2', fake.bar.bind(assert));
            tasks.addTask('task 3', fake.baz.bind(assert));
            tasks.addTask('task 4', fake.qux.bind(assert));

            tasks.run();

            assert.verifySteps([
                'the function from the first task have been executed',
                'the function from the second task have been executed',
                'the function from the third task have been executed'
            ]);
        });

        QUnit.test('should run with the context that was passed', (assert) => {
            tasks.addTask('task 5', function () {
                assert.strictEqual(
                    this,
                    fake,
                    'The context (this) of the executed "callback" should be equal to the object which was passed through the "add" function as third argument'
                );
            }, fake);

            tasks.run();
        });
    });
});
