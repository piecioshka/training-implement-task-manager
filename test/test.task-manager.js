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
        let queue = null;

        hooks.beforeEach(() => {
            queue = new TaskManager();
        });

        QUnit.module('getTaskList', () => {
            QUnit.test('should be a function', (assert) => {
                assert.strictEqual(
                    typeof queue.getTaskList,
                    'function',
                    'TaskManager.prototype.getTaskList is not a function'
                );
            });

            QUnit.test('should return an array', (assert) => {
                assert.strictEqual(
                    toString(queue.getTaskList()),
                    '[object Array]',
                    'TaskManager.prototype.getTaskList() returns not an array'
                );
            });

            QUnit.test('should return empty array', (assert) => {
                assert.strictEqual(
                    queue.getTaskList().length,
                    0,
                    'TaskManager.prototype.getTaskList() returns not empty array'
                );
            });
        });

        QUnit.module('addTask', () => {
            QUnit.test('should be a function', (assert) => {
                assert.strictEqual(
                    typeof queue.addTask,
                    'function',
                    'TaskManager.prototype.addTask is not a function'
                );
            });

            QUnit.test('should expected 3 params: name, callback, context', (assert) => {
                assert.strictEqual(
                    queue.addTask.length,
                    3,
                    'Arity of TaskManager.prototype.addTask is not equals 3'
                );
            });
        });

        QUnit.module('run', () => {
            QUnit.test('should be a function', (assert) => {
                assert.strictEqual(
                    typeof queue.run,
                    'function',
                    'TaskManager.prototype.run is not a function'
                );
            });
        });

        QUnit.module('clean', () => {
            QUnit.test('should be a function', (assert) => {
                assert.strictEqual(
                    typeof queue.clean,
                    'function',
                    'TaskManager.prototype.clean is not a function'
                );
            });
        });
    });

    QUnit.module('Behaviour', (hooks) => {
        let queue = null;
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

            queue = new TaskManager();
        });

        QUnit.test('the "addTask" method should append items to the list of tasks (mutable)', (assert) => {
            const tasks = queue.getTaskList();
            const mockName = 'example-name';
            const mockFunction = () => {
            };
            const mockContext = this;

            assert.strictEqual(
                tasks.length,
                0,
                'TaskManager.prototype.getTaskList() returns not empty array'
            );

            queue.addTask(mockName, mockFunction, mockContext);

            assert.strictEqual(
                tasks.length,
                1,
                'After adding one task to the empty list, number of items should equal 1'
            );

            const task = tasks[0];

            assert.strictEqual(
                typeof task,
                'object',
                'task shuold be an object'
            );

            assert.strictEqual(
                typeof task.name,
                'string',
                'task has not string property called "name"'
            );
            assert.strictEqual(
                task.name,
                mockName,
                'task has not property "name" equals first parameter of the TaskManager.prototype.addTask'
            );

            assert.strictEqual(
                typeof task.callback,
                'function',
                'task has not function property called "callback"'
            );
            assert.strictEqual(
                task.callback,
                mockFunction,
                'task has not property "callback" equals second parameter of the TaskManager.prototype.addTask'
            );

            assert.strictEqual(
                typeof task.context,
                'object',
                'task has not function property called "context"'
            );
            assert.strictEqual(
                task.context,
                mockContext,
                'task has not property "context" equals second parameter of the TaskManager.prototype.addTask'
            );
        });

        QUnit.test('the "clean" method should clean list of tasks', (assert) => {
            assert.equal(queue.getTaskList().length, 0);
            queue.addTask({});
            assert.equal(queue.getTaskList().length, 1);
            queue.clean();
        });

        QUnit.test('the "clean" method should not create a new array, it should only remove items from tasks', (assert) => {
            const tasks = queue.getTaskList();
            queue.clean();
            assert.equal(tasks, queue.getTaskList());
        });


        QUnit.test('the callback for the first task should be executed when the "run" function is called', (assert) => {
            queue.addTask('task 1', fake.bar.bind(assert));
            queue.run();

            assert.verifySteps(
                [
                    'the function from the first task have been executed'
                ],
                'TaskManager.prototype.run is not execute all callback\'s in loop (eg. Array.prototype.forEach).'
            );
        });

        QUnit.test('the list of tasks should not be shared between Task Manager instances', (assert) => {
            assert.equal(queue.getTaskList().length, 0);
            const queue2 = new TaskManager();
            queue.addTask('test', () => null);
            assert.equal(queue.getTaskList().length, 1);
            assert.equal(queue2.getTaskList().length, 0);
        });

        QUnit.test('each task item should have its callback executed via the "run" function', (assert) => {
            queue.addTask('task 2', fake.bar.bind(assert));
            queue.addTask('task 3', fake.baz.bind(assert));
            queue.addTask('task 4', fake.qux.bind(assert));

            queue.run();

            assert.verifySteps([
                'the function from the first task have been executed',
                'the function from the second task have been executed',
                'the function from the third task have been executed'
            ]);
        });

        QUnit.test('should run with the context that was passed', (assert) => {
            queue.addTask('task 5', function () {
                assert.strictEqual(
                    this,
                    fake,
                    'The context (this) of the executed "callback" should be equal to the object which was passed through the "add" function as third argument'
                );
            }, fake);

            queue.run();
        });
    });
});
