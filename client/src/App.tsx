import { useEffect, useState } from 'react';
import { Header } from './components';
import { PostData, UserData } from './types';
import { PostItem } from './components/Posts/PostItem';
import PostEditor from './components/PostEditor/PostEditor';

function App() {
	const [users, setUsers] = useState<UserData[]>([]);
	const [posts, setPosts] = useState<PostData[]>([]);
	const [isPostEditorOpen, setIsPostEditorOpen] = useState(false);
	const [usedUserIds, setUsedUserIds] = useState<number[]>([]);
	const [user, setUser] = useState<UserData | null>(null);
	const [editingPost, setEditingPost] = useState<PostData | null>(null);

	useEffect(() => {
		fetchUsers();
		fetchPosts();
	}, []);

	useEffect(() => {
		if (users.length > 0 && !user) {
			selectRandomUser();
		}
	}, [users]);

	const fetchUsers = async () => {
		try {
			const response = await fetch('http://localhost:3000/users');
			const data = await response.json();
			setUsers(data);
		} catch (error) {
			console.log(error);
		}
	};

	const fetchPosts = async () => {
		try {
			const response = await fetch('http://localhost:3000/posts');
			const data = await response.json();
			setPosts(data);
		} catch (error) {
			console.log(error);
		}
	};

	const selectRandomUser = () => {
		let availableUsers = users.filter(user => !usedUserIds.includes(user.id));
		if (availableUsers.length === 0) {
			setUsedUserIds([]);
			availableUsers = users;
		}
		const randomIndex = Math.floor(Math.random() * availableUsers.length);
		const selectedUser = availableUsers[randomIndex];
		setUser(selectedUser);
		setUsedUserIds([...usedUserIds, selectedUser.id]);
	};

	const handleSubmitNewPost = async (newPost: PostData) => {
		if (!user) return;
		try {
			const response = await fetch('http://localhost:3000/posts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ ...newPost, userId: user.id }),
			});
			if (response.ok) {
				const createdPost = await response.json();
				setPosts([createdPost, ...posts]);
				setIsPostEditorOpen(false);
			} else {
				console.error('Failed to create post');
			}
		} catch (error) {
			console.error('Error creating post:', error);
		}
	};

	const handleEditPost = async (updatedPost: PostData) => {
		if (!editingPost) return;

		try {
			const postToEdit = {
				...editingPost,
				...updatedPost,
				date: new Date().toISOString(),
			};
			const response = await fetch(
				`http://localhost:3000/posts/${editingPost.id}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(postToEdit),
				}
			);
			if (response.ok) {
				const editedPost = await response.json();
				setPosts(
					posts.map(post => (post.id === editedPost.id ? editedPost : post))
				);
				setEditingPost(null);
				setIsPostEditorOpen(false);
			} else {
				console.error('Failed to edit post');
			}
		} catch (error) {
			console.error('Error editing post:', error);
		} finally {
			setEditingPost(null);
			setIsPostEditorOpen(false);
		}
	};

	const handleDeletePost = async (postId: number) => {
		try {
			await fetch(`http://localhost:3000/posts/${postId}`, {
				method: 'DELETE',
			});
			setPosts(posts.filter(post => post.id !== postId));
		} catch (error) {
			console.log(error);
		}
	};

	const togglePostEditor = () => {
		setIsPostEditorOpen(!isPostEditorOpen);
	};

	const handleOpenEditorForNewPost = () => {
		setEditingPost(null);
		setIsPostEditorOpen(true);
	};

	const handleOpenEditorForEditPost = (post: PostData) => {
		setEditingPost(post);
		setIsPostEditorOpen(true);
	};

	return (
		<>
			{user && (
				<Header
					openPostEditor={handleOpenEditorForNewPost}
					user={user}
					selectRandomUser={selectRandomUser}
				/>
			)}
			{user && (
				<PostEditor
					open={isPostEditorOpen}
					onClose={togglePostEditor}
					onSubmit={editingPost ? handleEditPost : handleSubmitNewPost}
					userId={user.id}
					lastPostId={posts[posts.length - 1]?.id || 0}
					post={editingPost}
				/>
			)}

			<div className='posts-wrapper'>
				{posts.map(post => (
					<PostItem
						key={post.id}
						post={post}
						user={user}
						users={users}
						onEdit={handleOpenEditorForEditPost}
						onDelete={handleDeletePost}
					/>
				))}
			</div>
		</>
	);
}

export default App;
