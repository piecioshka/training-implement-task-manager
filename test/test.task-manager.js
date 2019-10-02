'use strict';

/**
 * Put some code to 'src/task-manager.js'.
 * Make all unit tests passing.
 *
 * @author Piotr Kowalski <piecioshka@gmail.com> https://piecioshka.pl/
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

function isObject(data) {
    return typeof data === 'object'
        && data != null
        && Array.isArray(data) === false;
}

QUnit.config.reorder = false;

QUnit.module('TaskManager', () => {
    QUnit.module('General', () => {
        QUnit.test('should be defined in global scope', (assert) => {
            assert.notEqual(typeof TaskManager, 'undefined', 'TaskManager in not defined');
        });

        QUnit.test('should be a class', (assert) => {
            assert.strictEqual(typeof TaskManager, 'function', 'TaskManager should be a function (each class is a function)');

            try {
                new TaskManager();
                assert.ok(true, 'TaskManager should be a constructor');
            } catch (e) {
                assert.ok(false, 'TaskManager should be a constructor (maybe is an Arrow Function?)');
            }

            const string = TaskManager.toString();
            const pattern = /^class/;
            assert.ok(pattern.test(string), 'TaskManager should be define with "class" keyword');
        });
    });

    QUnit.module('API', (hooks) => {
        let queue = null;

        hooks.beforeEach(() => {
            queue = new TaskManager();
        });

        QUnit.module('getTaskList', () => {
            QUnit.test('should be a function', (assert) => {
                assert.strictEqual(typeof queue.getTaskList, 'function', 'TaskManager#getTaskList should be a function (method)');
            });

            QUnit.test('should return an array', (assert) => {
                assert.strictEqual(toString(queue.getTaskList()), '[object Array]', 'TaskManager#getTaskList() returns not an array');
            });

            QUnit.test('should return empty array', (assert) => {
                const tasks = queue.getTaskList();
                assert.strictEqual(tasks.length, 0, 'TaskManager#getTaskList() returns not empty array');
            });

            QUnit.test('should always returns the same reference to the array', (assert) => {
                const ins1 = queue.getTaskList();
                const ins2 = queue.getTaskList();
                assert.equal(ins1, ins2, 'TaskManager#getTaskList() should returns the same array (reference should be the same)');
            });
        });

        QUnit.module('addTask', () => {
            QUnit.test('should be a function', (assert) => {
                assert.strictEqual(typeof queue.addTask, 'function', 'TaskManager#addTask should be a function (method)');
            });

            QUnit.test('should expected 3 params: name, callback, context', (assert) => {
                assert.strictEqual(queue.addTask.length, 3, 'Arity (means number of params) of TaskManager#addTask is not equals 3');
            });

            QUnit.test('should add task to list of tasks', (assert) => {
                queue.addTask('foo', () => null, null);
                assert.notEqual(queue.getTaskList().length, 0, 'TaskManager#addTask should add task (an object) to list of tasks (array)');
            });
        });

        QUnit.module('run', () => {
            QUnit.test('should be a function', (assert) => {
                assert.strictEqual(typeof queue.run, 'function', 'TaskManager#run should be a function (method)');
            });
        });

        QUnit.module('clean', () => {
            QUnit.test('should be a function', (assert) => {
                assert.strictEqual(typeof queue.clean, 'function', 'TaskManager#clean should be a function (method)');
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

        QUnit.test('the "clean" method should clean list of tasks', (assert) => {
            queue.addTask('ble');
            queue.clean();
            const list = queue.getTaskList();
            console.log(list.length);
            assert.equal(list.length, 0, 'TaskManager#clean should remove all items from task list');

            const ins1 = queue.getTaskList();
            queue.clean();
            const ins2 = queue.getTaskList();
            assert.strictEqual(ins1, ins2, 'TaskManager#clean cannot create a new array (should be the same reference)');
        });

        QUnit.test('the "addTask" method should append items to the list of tasks (mutable)', (assert) => {
            const tasks = queue.getTaskList();
            const mockName = 'example-name';
            const mockFunction = () => null;
            const mockContext = this;

            queue.clean();

            const size = tasks.length;

            queue.addTask(mockName, mockFunction, mockContext);

            assert.strictEqual(tasks.length, size + 1, 'After adding one task to the empty list, number of items should equal 1');

            const task = tasks[0];

            assert.ok(isObject(task), 'Task should be an object');
            assert.strictEqual(typeof task.name, 'string', 'Task should have a string property called "name"');
            assert.strictEqual(task.name, mockName, 'Task name should equals first parameter of the TaskManager#addTask');

            assert.strictEqual(typeof task.callback, 'function', 'Task should have a function property called "callback"');
            assert.strictEqual(task.callback, mockFunction, 'Task should be property "callback" equals second parameter of the TaskManager#addTask');

            assert.strictEqual(typeof task.context, 'object', 'Task should have a function property called "context"');
            assert.strictEqual(task.context, mockContext, 'Task should be property "context" equals second parameter of the TaskManager#addTask');
        });

        QUnit.test('the callback for the first task should be executed when the "run" function is called', (assert) => {
            queue.addTask('task 1', fake.bar.bind(assert));
            queue.run();

            assert.verifySteps(
                [
                    'the function from the first task have been executed'
                ],
                'TaskManager#run should execute all callback\'s in loop (eg. Array.prototype.forEach).'
            );
        });

        QUnit.test('the list of tasks should not be shared between Task Manager instances', (assert) => {
            queue.clean();
            const queue2 = new TaskManager();
            queue.addTask('test', () => null);
            assert.equal(queue2.getTaskList().length, 0, 'New instance of TaskManager should have new list of tasks (maybe define list of tasks on constructor and share it via this)');
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

        QUnit.test('should run callback with the context', (assert) => {
            queue.addTask('task 5', function () {
                assert.strictEqual(this, fake, 'Callback was executed without changing context (use call / apply magic methods)');
            }, fake);

            queue.run();
        });
    });
});
