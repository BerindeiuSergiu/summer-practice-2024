// src/Pages/MainPage/index.js
import React, { useEffect, useState } from 'react';
import { auth, db } from '../../config/firebase-config';
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, setDoc } from 'firebase/firestore';

export const MainPage = () => {
    const [username, setUsername] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [requests, setRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const [friendUsernames, setFriendUsernames] = useState({});
    const [requestUsernames, setRequestUsernames] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [movieTitle, setMovieTitle] = useState('');
    const [movieDescription, setMovieDescription] = useState('');
    const [friendDescription, setFriendDescription] = useState('');
    const [movieRating, setMovieRating] = useState('');
    const [addedMovies, setAddedMovies] = useState([]);

    useEffect(() => {
        const fetchUsername = async () => {
            const user = auth.currentUser;
            if (user) {
                const docRef = doc(db, 'username-to-emailAddress', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUsername(docSnap.data().username);
                }
            }
        };
        fetchUsername();
    }, []);

    useEffect(() => {
        const fetchRequests = async () => {
            const user = auth.currentUser;
            if (user) {
                const q = query(
                    collection(db, 'friend-requests'),
                    where('toUser', '==', user.uid),
                    where('status', '==', 'pending') // Only fetch pending requests
                );
                const querySnapshot = await getDocs(q);
                const results = [];
                querySnapshot.forEach(doc => results.push({ id: doc.id, ...doc.data() }));
                setRequests(results);
                fetchRequestUsernames(results);
            }
        };

        const fetchRequestUsernames = async (requestsList) => {
            const usernames = {};
            for (const request of requestsList) {
                const docRef = doc(db, 'username-to-emailAddress', request.fromUser);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    usernames[request.fromUser] = docSnap.data().username;
                }
            }
            setRequestUsernames(usernames);
        };

        fetchRequests();
    }, []);

    useEffect(() => {
        const fetchFriends = async () => {
            const user = auth.currentUser;
            if (user) {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const friendsList = docSnap.data().friends || [];
                    setFriends(friendsList);
                    fetchFriendUsernames(friendsList);
                } else {
                    await setDoc(docRef, { friends: [] });
                    setFriends([]);
                }
            }
        };

        const fetchFriendUsernames = async (friendsList) => {
            const friendNames = {};
            for (const friendId of friendsList) {
                const docRef = doc(db, 'username-to-emailAddress', friendId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    friendNames[friendId] = docSnap.data().username;
                }
            }
            setFriendUsernames(friendNames);
        };

        fetchFriends();
    }, []);

    useEffect(() => {
        const fetchAddedMovies = async () => {
            const user = auth.currentUser;
            if (user && friends.length > 0) { // Ensure friends array is not empty
                const q = query(collection(db, 'movies'), where('addedBy', 'in', friends));
                const querySnapshot = await getDocs(q);
                const movies = [];
                querySnapshot.forEach(doc => movies.push({ id: doc.id, ...doc.data() }));
                setAddedMovies(movies);
            }
        };

        fetchAddedMovies();
    }, [friends]);

    const handleSearch = async () => {
        const q = query(collection(db, 'username-to-emailAddress'), where('username', '==', searchTerm));
        const querySnapshot = await getDocs(q);
        const results = [];
        querySnapshot.forEach(doc => results.push({ id: doc.id, ...doc.data() }));
        setSearchResults(results);
    };

    const handleSendRequest = async (toUserId) => {
        const user = auth.currentUser;
        if (user) {
            await addDoc(collection(db, 'friend-requests'), {
                fromUser: user.uid,
                toUser: toUserId,
                status: 'pending'
            });
            setSuccessMessage('Friend request sent successfully!');
            setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
        }
    };

    const handleResponse = async (requestId, status) => {
        const requestRef = doc(db, 'friend-requests', requestId);
        await updateDoc(requestRef, { status });

        if (status === 'accepted') {
            const user = auth.currentUser;
            const request = requests.find(r => r.id === requestId);

            const fromUserRef = doc(db, 'users', request.fromUser);
            const toUserRef = doc(db, 'users', user.uid);

            const fromUserDoc = await getDoc(fromUserRef);
            const toUserDoc = await getDoc(toUserRef);

            const fromUserFriends = fromUserDoc.exists() ? fromUserDoc.data().friends || [] : [];
            const toUserFriends = toUserDoc.exists() ? toUserDoc.data().friends || [] : [];

            if (!fromUserDoc.exists()) {
                await setDoc(fromUserRef, { friends: [] });
            }
            if (!toUserDoc.exists()) {
                await setDoc(toUserRef, { friends: [] });
            }

            await updateDoc(fromUserRef, {
                friends: [...fromUserFriends, user.uid]
            });

            await updateDoc(toUserRef, {
                friends: [...toUserFriends, request.fromUser]
            });

            setFriends([...friends, request.fromUser]);
            setFriendUsernames({
                ...friendUsernames,
                [request.fromUser]: requestUsernames[request.fromUser]
            });
        }

        // Remove the request from the state after handling the response
        setRequests(requests.filter(request => request.id !== requestId));
    };

    const handleAddMovie = async () => {
        const user = auth.currentUser;
        if (user) {
            await addDoc(collection(db, 'movies'), {
                title: movieTitle,
                description: movieDescription,
                friendDescription: friendDescription,
                rating: movieRating,
                addedBy: user.uid
            });
            setSuccessMessage('Movie added successfully!');
            setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
        }
    };

    return (
        <div>
            <h1>Welcome, @{username}</h1>

            <div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by username"
                />
                <button onClick={handleSearch}>Search</button>
                <ul>
                    {searchResults.map(user => (
                        <li key={user.id}>
                            {user.username} <button onClick={() => handleSendRequest(user.id)}>Add Friend</button>
                        </li>
                    ))}
                </ul>
                {successMessage && <p>{successMessage}</p>}
            </div>

            <div>
                <h2>Friend Requests</h2>
                <ul>
                    {requests.map(request => (
                        <li key={request.id}>
                            {requestUsernames[request.fromUser] || request.fromUser} wants to be your friend.
                            <button onClick={() => handleResponse(request.id, 'accepted')}>Accept</button>
                            <button onClick={() => handleResponse(request.id, 'declined')}>Decline</button>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h2>Friends List</h2>
                <ul>
                    {friends.map(friend => (
                        <li key={friend}>{friendUsernames[friend] || friend}</li>
                    ))}
                </ul>
            </div>

            <div>
                <h2>Add Movie</h2>
                <label>Title: </label>
                <input type="text" value={movieTitle} onChange={(e) => setMovieTitle(e.target.value)} />
                <br />
                <label>Description: </label>
                <input type="text" value={movieDescription} onChange={(e) => setMovieDescription(e.target.value)} />
                <br />
                <label>Friend's Description: </label>
                <input type="text" value={friendDescription} onChange={(e) => setFriendDescription(e.target.value)} />
                <br />
                <label>Rating (out of 10): </label>
                <input type="number" value={movieRating} onChange={(e) => setMovieRating(e.target.value)} />
                <br />
                <button onClick={handleAddMovie}>Add Movie</button>
            </div>

            <div>
                <h2>Added Movies</h2>
                <ul>
                    {addedMovies.map(movie => (
                        <li key={movie.id}>
                            <strong>Title: </strong> {movie.title}<br />
                            <strong>Description: </strong> {movie.description}<br />
                            <strong>Friend's Description: </strong> {movie.friendDescription}<br />
                            <strong>Rating: </strong> {movie.rating}/10
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
