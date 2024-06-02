import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';

const app: Express = express();
app.use(cors());
app.use(express.json());
const port = 3000;

const postsFilePath = path.join(__dirname, '..', 'db', 'posts.json');
const usersFilePath = path.join(__dirname, '..', 'db', 'users.json');

app.get('/users', (req: Request, res: Response) => {
	const data = JSON.parse(fs.readFileSync(usersFilePath, { encoding: 'utf8' }));
	res.send(data);
});

app.get('/posts', (req: Request, res: Response) => {
	const posts = JSON.parse(
		fs.readFileSync(postsFilePath, { encoding: 'utf8' })
	);
	posts.sort((a: any, b: any) => Date.parse(b.date) - Date.parse(a.date));
	res.send(posts);
});

app.post('/posts', (req, res) => {
	const newPost = req.body;

	fs.readFile(postsFilePath, 'utf8', (err, data) => {
		if (err) {
			res.status(500).send('Error reading posts data');
			return;
		}

		const posts = JSON.parse(data);
		const newId = posts.length > 0 ? posts[posts.length - 1].id + 1 : 1;
		const postWithId = {
			...newPost,
			id: newId,
			date: new Date().toISOString(),
		};

		posts.push(postWithId);

		fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), err => {
			if (err) {
				res.status(500).send('Error writing new post data');
				return;
			}

			res.status(201).send(postWithId);
		});
	});
});

app.put('/posts/:id', (req: Request, res: Response) => {
	const postId = parseInt(req.params.id, 10);
	console.log(postId);

	const updatedPost = req.body;
	console.log(updatedPost);

	fs.readFile(postsFilePath, 'utf8', (err, data) => {
		if (err) {
			res.status(500).send('Error reading posts data');
			return;
		}

		const posts = JSON.parse(data);
		const postIndex = posts.findIndex(
			(post: { id: number }) => post.id === postId
		);
		if (postIndex === -1) {
			res.status(404).send('Post not found');
			return;
		}

		posts[postIndex] = {
			...posts[postIndex],
			...updatedPost,
			date: new Date().toISOString(),
		};

		fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), err => {
			if (err) {
				res.status(500).send('Error writing post data');
				return;
			}

			res.status(200).send(posts[postIndex]);
		});
	});
});

app.delete('/posts/:id', (req: Request, res: Response) => {
	const postId = parseInt(req.params.id, 10);

	fs.readFile(postsFilePath, 'utf8', (err, data) => {
		if (err) {
			res.status(500).send('Error reading posts data');
			return;
		}

		const posts = JSON.parse(data);
		const updatedPosts = posts.filter(
			(post: { id: number }) => post.id !== postId
		);

		fs.writeFile(postsFilePath, JSON.stringify(updatedPosts, null, 2), err => {
			if (err) {
				res.status(500).send('Error writing post data');
				return;
			}

			res.status(200).send({ message: 'Post deleted successfully' });
		});
	});
});

app.listen(port, () => {
	console.log(`🔋 Server is running at http://localhost:${port}`);
});
