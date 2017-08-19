'use strict';

/**
 * Put some code to `app/scripts/task-manager.js`.
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
        QUnit.test('should be defined', function (assert) {
            assert.ok(TaskManager);
        });

        QUnit.test('should be function', function (assert) {
            assert.strictEqual(typeof TaskManager, 'function');
        });

        QUnit.test('should be a constructor (not arrow function)', function (assert) {
            try {
                new TaskManager();
                assert.ok(true);
            } catch (e) {
                assert.ok(false);
            }
        });
    });

    QUnit.module('API', function (hooks) {
        hooks.beforeEach(function () {
            this.tasks = new TaskManager();
        });

        QUnit.test('should have function: getList', function (assert) {
            assert.strictEqual(typeof this.tasks.getList, 'function');
        });

        QUnit.test('should return array', function (assert) {
            assert.strictEqual(toString(this.tasks.getList()), '[object Array]');
        });

        QUnit.test('should have function: addTask', function (assert) {
            assert.strictEqual(typeof this.tasks.addTask, 'function');
        });

        QUnit.test('should have function: run', function (assert) {
            assert.strictEqual(typeof this.tasks.run, 'function');
        });
    });

    QUnit.module('Behaviour', function (hooks) {
        hooks.beforeEach(function () {
            this.fake = {
                bar: function () {
                    this.step('Function from first task executed');
                },
                baz: function () {
                    this.step('Function from second task executed');
                },
                qux: function () {
                    this.step('Function from third task executed');
                }
            };

            this.tasks = new TaskManager();
        });

        QUnit.test('empty queue on start', function (assert) {
            assert.strictEqual(this.tasks.getList().length, 0);
        });

        QUnit.test('new instance of TaskManager should have empty queue', function (assert) {
            assert.strictEqual(this.tasks.getList().length, 0);
        });

        QUnit.test('"addTask" method should append list of tasks', function (assert) {
            let queue = this.tasks.getList();
            let mockName = 'example-name';
            let mockFunction = function () {
            };
            let mockContext = this;

            assert.strictEqual(queue.length, 0, 'Initially list of task is empty');

            this.tasks.addTask(mockName, mockFunction, mockContext);

            assert.strictEqual(queue.length, 1, 'After added task to empty list, list should contain one task');

            assert.strictEqual(typeof queue[0].name, 'string', 'First element should have string property "name"');
            assert.strictEqual(queue[0].name, mockName, 'Property "name" should be first parameter of function "addTask"');

            assert.strictEqual(typeof queue[0].callback, 'function', 'First element should have function property "callback"');
            assert.strictEqual(queue[0].callback, mockFunction, 'Property "callback" should be second parameter of function "addTask"');

            assert.strictEqual(typeof queue[0].context, 'object', 'First element should have object property "context"');
            assert.strictEqual(queue[0].context, mockContext, 'Property "context" should be third parameter of function "addTask"');
        });

        QUnit.test('callback should be execute when I call function "run"', function (assert) {
            this.tasks.addTask('task 1', this.fake.bar.bind(assert));
            this.tasks.run();

            assert.verifySteps([
                'Function from first task executed'
            ]);
        });

        QUnit.test('callback from all functions should be executed when I call function "run"', function (assert) {
            this.tasks.addTask('task 2', this.fake.bar.bind(assert));
            this.tasks.addTask('task 3', this.fake.baz.bind(assert));
            this.tasks.addTask('task 4', this.fake.qux.bind(assert));

            this.tasks.run();

            assert.verifySteps([
                'Function from first task executed',
                'Function from second task executed',
                'Function from third task executed'
            ]);
        });

        QUnit.test('should run with passed context', function (assert) {
            let fake = this.fake;
            this.tasks.addTask('task 5', function () {
                assert.strictEqual(this, fake, 'Context of executed callback should be equal object which was passed to "add" function');
            }, fake);

            this.tasks.run();
        });
    });
});
