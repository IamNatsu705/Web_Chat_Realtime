import type { NetworkUser, FriendRequest, Friendship, NetworkResponse } from '../types';
import type { User } from '../../auth/types';
import { RELATIONSHIP_STATUS, FRIEND_REQUEST_ACTION } from '../constants';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock logged-in user
const currentUserId = 1;

// Base dummy users
let users: User[] = [
    { id: 2, name: 'Nguyễn Văn A', email: 'a@gmail.com', avatar: 'https://i.pravatar.cc/150?u=2', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, name: 'Trần Thị B', email: 'b@gmail.com', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 4, name: 'Lê Hoàng C', email: 'c@gmail.com', avatar: 'https://i.pravatar.cc/150?u=4', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 5, name: 'Phạm Minh D', email: 'd@gmail.com', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 6, name: 'Đặng Mèo', email: 'meo@gmail.com', avatar: 'https://i.pravatar.cc/150?u=6', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 7, name: 'Vũ Chó', email: 'cho@gmail.com', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 8, name: 'Hoàng Thị E', email: 'e@gmail.com', avatar: 'https://i.pravatar.cc/150?u=8', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 9, name: 'Đỗ Văn F', email: 'f@gmail.com', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

let friendRequests: FriendRequest[] = [
    { id: 101, sender_id: 2, receiver_id: currentUserId, status: RELATIONSHIP_STATUS.PENDING, created_at: new Date().toISOString(), sender: users.find(u => u.id === 2) },
    { id: 102, sender_id: 3, receiver_id: currentUserId, status: RELATIONSHIP_STATUS.PENDING, created_at: new Date().toISOString(), sender: users.find(u => u.id === 3) },
];

let friendships: Friendship[] = [
    { id: 201, user_id: currentUserId, friend_id: 4, created_at: new Date().toISOString(), friend: users.find(u => u.id === 4) },
    { id: 202, user_id: currentUserId, friend_id: 5, created_at: new Date().toISOString(), friend: users.find(u => u.id === 5) },
];

let nextRequestId = 300;
let nextFriendshipId = 400;

export const mockNetworkApi = {
    // Search users by name or email
    searchUsers: async (query: string): Promise<NetworkResponse<NetworkUser[]>> => {
        await delay(500);

        const q = query.toLowerCase();
        const matchedUsers = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));

        const networkUsers: NetworkUser[] = matchedUsers.map(u => {
            // Check friendship
            const isFriend = friendships.some(f => (f.user_id === currentUserId && f.friend_id === u.id) || (f.user_id === u.id && f.friend_id === currentUserId));
            if (isFriend) {
                return { ...u, relationship_status: RELATIONSHIP_STATUS.ACCEPTED, is_sender: false };
            }

            // Check active friend requests we sent
            const reqFromMe = friendRequests.find(r => r.sender_id === currentUserId && r.receiver_id === u.id);
            if (reqFromMe) {
                return { ...u, relationship_status: RELATIONSHIP_STATUS.PENDING, friend_request_id: reqFromMe.id, is_sender: true };
            }

            // Check active friend requests sent to us
            const reqToMe = friendRequests.find(r => r.sender_id === u.id && r.receiver_id === currentUserId);
            if (reqToMe) {
                return { ...u, relationship_status: RELATIONSHIP_STATUS.PENDING, friend_request_id: reqToMe.id, is_sender: false };
            }

            // No relationship
            return { ...u, relationship_status: 'none' as const };
        });

        return {
            status: "success",
            message: "Success",
            data: networkUsers
        };
    },

    // Get list of pending friend requests (usually incoming)
    getFriendRequests: async (): Promise<NetworkResponse<FriendRequest[]>> => {
        await delay(500);
        // Only return requests where we are the receiver and they are pending
        const myRequests = friendRequests.filter(r => r.receiver_id === currentUserId && r.status === RELATIONSHIP_STATUS.PENDING);
        return {
            status: "success",
            message: "Success",
            data: myRequests
        };
    },

    // Get current friends list
    getFriends: async (): Promise<NetworkResponse<Friendship[]>> => {
        await delay(500);
        // Return friendships where the current user is recorded
        const myFriends = friendships.filter(f => f.user_id === currentUserId);
        return {
            status: "success",
            message: "Success",
            data: myFriends
        };
    },

    // Send a friend request
    sendFriendRequest: async (userId: number): Promise<NetworkResponse<FriendRequest>> => {
        await delay(500);

        const receiver = users.find(u => u.id === userId);
        const newReq: FriendRequest = {
            id: nextRequestId++,
            sender_id: currentUserId,
            receiver_id: userId,
            status: RELATIONSHIP_STATUS.PENDING,
            created_at: new Date().toISOString(),
            receiver: receiver
        };
        friendRequests.push(newReq);

        return {
            status: "success",
            message: "Gửi lời mời kết bạn thành công",
            data: newReq
        };
    },

    // Cancel a friend request we sent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cancelFriendRequest: async (userId: number): Promise<NetworkResponse<any>> => {
        await delay(500);

        friendRequests = friendRequests.filter(r => !(r.sender_id === currentUserId && r.receiver_id === userId));

        return {
            status: "success",
            message: "Đã hủy lời mời kết bạn",
            data: {}
        };
    },

    // Respond to a friend request (accept/reject)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    respondToRequest: async (requestId: number, action: typeof FRIEND_REQUEST_ACTION[keyof typeof FRIEND_REQUEST_ACTION]): Promise<NetworkResponse<any>> => {
        await delay(500);

        const reqIndex = friendRequests.findIndex(r => r.id === requestId);
        if (reqIndex !== -1) {
            const req = friendRequests[reqIndex];
            if (action === FRIEND_REQUEST_ACTION.ACCEPT) {
                req.status = RELATIONSHIP_STATUS.ACCEPTED;

                // Add friendship bidirectional representation or just from my side (simplification)
                const sender = users.find(u => u.id === req.sender_id);
                if (sender) {
                   friendships.push({
                       id: nextFriendshipId++,
                       user_id: currentUserId,
                       friend_id: sender.id,
                       created_at: new Date().toISOString(),
                       friend: sender
                   });
                }
            } else {
                req.status = RELATIONSHIP_STATUS.REJECTED;
            }

            // Remove from pending list to mimic DB update where we might not fetch it
            friendRequests.splice(reqIndex, 1);
        }

        return {
            status: "success",
            message: action === FRIEND_REQUEST_ACTION.ACCEPT ? 'Chấp nhận lời mời kết bạn' : 'Từ chối lời mời',
            data: {}
        };
    },

    // Unfriend
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    unfriend: async (userId: number): Promise<NetworkResponse<any>> => {
        await delay(500);

        // Remove friendship from local array
        friendships = friendships.filter(f => !(f.user_id === currentUserId && f.friend_id === userId));

        return {
            status: "success",
            message: "Hủy kết bạn thành công",
            data: {}
        };
    }
};
