import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	TextField,
	Button,
} from '@mui/material';
import { PostData } from '../../types';

type PostEditorProps = {
	open: boolean;
	onClose: () => void;
	onSubmit: (post: PostData) => void;
	userId: number;
	lastPostId: number;
	post?: PostData | null;
};

const PostEditor: React.FC<PostEditorProps> = ({
	open,
	onClose,
	onSubmit,
	userId,
	lastPostId,
	post,
}) => {
	const [content, setContent] = useState(post?.content || '');
	const [imageUrl, setImageUrl] = useState(post?.imageUrl || '');

	useEffect(() => {
		if (post) {
			setContent(post.content);
			setImageUrl(post.imageUrl || '');
		} else {
			setContent('');
			setImageUrl('');
		}
	}, [post]);

	const handleSubmit = () => {
		const newPost: PostData = {
			id: post ? post.id : lastPostId + 1,
			userId,
			content,
			imageUrl,
			date: new Date().toISOString(),
			likes: post ? post.likes : 0,
			likedBy: post ? post.likedBy : [],
		};
		onSubmit(newPost);
	};

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>{post ? 'Edit Post' : 'New Post'}</DialogTitle>
			<DialogContent>
				<TextField
					label='Content'
					multiline
					rows={4}
					value={content}
					onChange={e => setContent(e.target.value)}
					fullWidth
					margin='normal'
					variant='outlined'
				/>
				<TextField
					label='Image URL'
					value={imageUrl}
					onChange={e => setImageUrl(e.target.value)}
					fullWidth
					margin='normal'
					variant='outlined'
				/>
				<Button onClick={handleSubmit} variant='contained' color='primary'>
					Submit
				</Button>
				<Button onClick={onClose} variant='contained' color='secondary'>
					Cancel
				</Button>
			</DialogContent>
		</Dialog>
	);
};

export default PostEditor;
