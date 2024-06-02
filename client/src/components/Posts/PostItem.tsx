import React, { useState } from 'react';
import {
	Card,
	CardHeader,
	CardMedia,
	CardContent,
	CardActions,
	IconButton,
	Typography,
	Avatar,
	Badge,
	Dialog,
	Button,
	DialogContent,
	DialogTitle,
	TextField,
} from '@mui/material';
import {
	EditOutlined,
	DeleteOutlined,
	ThumbUpAltOutlined,
} from '@mui/icons-material';
import { PostData, UserData } from '../../types';

type PostItemProps = {
	post: PostData;
	user: UserData | null;
	users: UserData[];
	onEdit: (post: PostData) => void;
	onDelete: (postId: number) => void;
};

export const PostItem: React.FC<PostItemProps> = ({
	post,
	user,
	users,
	onEdit,
	onDelete,
}) => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editContent, setEditContent] = useState(post.content);
	const [editImageUrl, setEditImageUrl] = useState(post.imageUrl || '');
	const [likedBy, setLikedBy] = useState<number[]>(post.likedBy || []);
	const [likesCount, setLikesCount] = useState<number>(post.likes || 0);
	const { content, date, imageUrl, userId } = post;

	const handleOpenEditDialog = () => {
		setIsEditDialogOpen(true);
	};

	const handleOpenDeleteDialog = () => {
		setIsDeleteDialogOpen(true);
	};

	const handleEditSubmit = () => {
		onEdit({ ...post, content: editContent, imageUrl: editImageUrl });
		setIsEditDialogOpen(false);
	};

	const handleDeleteConfirm = () => {
		onDelete(post.id);
		setIsDeleteDialogOpen(false);
	};

	const handleLike = () => {
		if (!user || likedBy.includes(user.id)) {
			const updatedLikedBy = likedBy.filter(id => id !== user?.id);
			setLikedBy(updatedLikedBy);
			setLikesCount(prevCount => prevCount - 1);
		} else {
			const updatedLikedBy = [...likedBy, user.id];
			setLikedBy(updatedLikedBy);
			setLikesCount(prevCount => prevCount + 1);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const formattedDate = date
			.toLocaleDateString(undefined, {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
			})
			.replace(/\./g, '/');
		const formattedTime = date.toLocaleTimeString(undefined, {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: true,
		});
		return `${formattedDate}, ${formattedTime}`;
	};

	const author = users.find(user => user.id === userId);

	return (
		<Card sx={{ maxWidth: 600, margin: '16px auto' }}>
			<CardHeader
				avatar={
					<Avatar aria-label='user-avatar'>
						{author?.avatar ? (
							<img
								src={author.avatar}
								alt={author.name}
								style={{ width: '100%', height: '100%', objectFit: 'cover' }}
							/>
						) : (
							author?.name.charAt(0)
						)}
					</Avatar>
				}
				title={author?.name}
				subheader={formatDate(date)}
			/>
			{imageUrl && (
				<CardMedia
					component='img'
					height='194'
					image={imageUrl}
					alt={content}
					style={{ objectFit: 'cover' }}
				/>
			)}
			<CardContent>
				<Typography variant='body2' color='textSecondary'>
					{content}
				</Typography>
			</CardContent>
			<CardActions disableSpacing>
				{user && user.id === userId && (
					<>
						<IconButton aria-label='edit' onClick={handleOpenEditDialog}>
							<EditOutlined />
						</IconButton>
						<IconButton aria-label='delete' onClick={handleOpenDeleteDialog}>
							<DeleteOutlined />
						</IconButton>
					</>
				)}
				<Badge
					badgeContent={likesCount}
					color='primary'
					sx={{ marginLeft: 'auto', transform: 'translate(-50%, -50%)' }}
					title={likedBy
						.map(id => users.find(user => user.id === id)?.name)
						.join(', ')}
				>
					<IconButton
						aria-label='like'
						onClick={handleLike}
						color={user && likedBy.includes(user.id) ? 'primary' : 'default'}
					>
						<ThumbUpAltOutlined />
					</IconButton>
				</Badge>
			</CardActions>
			<Dialog
				open={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
			>
				<DialogTitle>Delete Post</DialogTitle>
				<DialogContent>
					<Typography>Are you sure you want to delete this post?</Typography>
					<Button onClick={handleDeleteConfirm} color='primary'>
						Yes
					</Button>
					<Button
						onClick={() => setIsDeleteDialogOpen(false)}
						color='secondary'
					>
						No
					</Button>
				</DialogContent>
			</Dialog>

			<Dialog
				open={isEditDialogOpen}
				onClose={() => setIsEditDialogOpen(false)}
			>
				<DialogTitle>Edit Post</DialogTitle>
				<DialogContent>
					<TextField
						label='Content'
						multiline
						rows={4}
						value={editContent}
						onChange={e => setEditContent(e.target.value)}
						fullWidth
						margin='normal'
						variant='outlined'
					/>
					<TextField
						label='Image URL'
						value={editImageUrl}
						onChange={e => setEditImageUrl(e.target.value)}
						fullWidth
						margin='normal'
						variant='outlined'
					/>
					<Button
						onClick={handleEditSubmit}
						variant='contained'
						color='primary'
					>
						Submit
					</Button>
					<Button
						onClick={() => setIsEditDialogOpen(false)}
						variant='contained'
						color='secondary'
					>
						Cancel
					</Button>
				</DialogContent>
			</Dialog>
		</Card>
	);
};
