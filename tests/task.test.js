const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const { userOneId, userOne, userTwo, setUpDatabase, taskOne, taskThree, taskTwo } = require('./fixtures/db');

beforeEach(setUpDatabase);

test('should create tasks for user', async () => {
	const response = await request(app)
		.post('/tasks')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			description: 'From my test'
		})
		.expect(201);

	const task = await Task.findById(response.body._id);
	expect(task).not.toBeNull();
	expect(task.completed).toEqual(false);
});

test('Should not create task with invalid description/completed', async () => {
	await request(app)
		.post('/tasks')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			description: 'brap',
			completed: 'Kacert'
		})
		.expect(400);
});

test('Should retrieve tasks for specific user', async () => {
	const response = await request(app)
		.get('/tasks')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);

	expect(response.body.length).toBe(2);
});

test('Should not be able to delete first task as the second user', async () => {
	const response = await request(app)
		.delete(`/tasks/${taskOne._id}`)
		.set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
		.send()
		.expect(404);

	const firstTask = await Task.findById(taskOne._id);
	expect(firstTask).not.toBeNull();
});

test('Should not update task with invalid description/completed', async () => {
	await request(app)
		.patch(`/tasks/${taskOne._id}`)
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			completed: 'ne mazej'
		})
		.expect(400);
});

test('Should delete user task', async () => {
	await request(app)
		.delete(`/tasks/${taskThree._id}`)
		.set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
		.send()
		.expect(200);
});

test('Should not delete task if unauthenticated', async () => {
	await request(app).delete(`/tasks/${taskOne._id}`).send().expect(401);
});

test('Should not update other users task', async () => {
	const response = await request(app)
		.patch(`/tasks/${taskOne._id}`)
		.set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
		.send({
			description: 'brap'
		})
		.expect(404);

	const task = await Task.findById(taskOne._id);
	expect(task).not.toBeNull();
});

test('Should fetch user task by id', async () => {
	await request(app)
		.get(`/tasks/${taskOne._id}`)
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);

	const task = await Task.findById(taskOne._id);
	expect(task).not.toBeNull();
});

test('Should not fetch user task by id if unauthenticated', async () => {
	await request(app).get(`/tasks/${taskOne._id}`).send().expect(401);

	const task = await Task.findById(taskOne._id);
	expect(task).not.toBeNull();
});

test('Should not fetch user task by other user', async () => {
	await request(app)
		.get(`/tasks/${taskOne._id}`)
		.set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
		.send()
		.expect(404);

	const task = await Task.findById(taskOne._id);
	expect(task).not.toBeNull();
});

test('should fetch only completed tasks', async () => {
	const response = await request(app)
		.get('/tasks?completed=true')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);

	expect(response.body.length).toEqual(1);
});

test('should fetch only incomplete tasks', async () => {
	const response = await request(app)
		.get('/tasks?completed=false')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);

	expect(response.body.length).toEqual(1);
});

test('Should sort tasks by description/completed/createdAt/updatedAt', async () => {
	const response = await request(app)
		.get('/tasks?sortBy=completed:desc')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);

	expect(response.body[0]).toMatchObject({
		description: 'First task',
		completed: true
	});
});
